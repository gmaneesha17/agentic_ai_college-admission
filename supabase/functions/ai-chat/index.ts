import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { conversationId, message } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let activeConversationId = conversationId;

    if (!activeConversationId) {
      const { data: newConversation, error: convError } = await supabase
        .from('chat_conversations')
        .insert({ user_id: user.id, title: message.substring(0, 50) })
        .select()
        .single();

      if (convError) throw convError;
      activeConversationId = newConversation.id;
    }

    await supabase.from('chat_messages').insert({
      conversation_id: activeConversationId,
      role: 'user',
      content: message,
    });

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const { data: colleges } = await supabase
      .from('colleges')
      .select('*')
      .order('ranking', { ascending: true })
      .limit(20);

    const { data: recommendations } = await supabase
      .from('recommendations')
      .select(`
        *,
        colleges (*)
      `)
      .eq('user_id', user.id)
      .order('match_score', { ascending: false })
      .limit(10);

    const { data: chatHistory } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('conversation_id', activeConversationId)
      .order('created_at', { ascending: true })
      .limit(10);

    const systemPrompt = `You are an expert college admission counselor AI assistant. You help students find the best colleges based on their academic profile, interests, and career goals.

Student Profile:
- Name: ${profile?.full_name || 'Not provided'}
- GPA: ${profile?.gpa || 'Not provided'}
- SAT: ${profile?.sat_score || 'Not provided'}
- ACT: ${profile?.act_score || 'Not provided'}
- Preferred Majors: ${profile?.preferred_majors?.join(', ') || 'Not specified'}
- Career Goals: ${profile?.career_goals || 'Not specified'}
- Budget: ${profile?.budget_max ? `Up to $${profile.budget_max}` : 'Not specified'}
- Preferred Locations: ${profile?.preferred_locations?.join(', ') || 'Any'}
- Interests: ${profile?.interests?.join(', ') || 'Not specified'}

Top Recommended Colleges:
${recommendations?.map((r: any) => `- ${r.colleges.name} (${r.fit_category}, Match: ${r.match_score}%): ${r.reasoning}`).join('\n') || 'No recommendations yet'}

Available Colleges Database (sample):
${colleges?.slice(0, 10).map((c: any) => `- ${c.name}: ${c.description}`).join('\n')}

Provide helpful, personalized advice about college selection, admissions strategies, application requirements, and answer questions about specific colleges. Be encouraging and supportive. Use the student's profile and recommendations to give tailored guidance.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(chatHistory || []).slice(-8).map((m: any) => ({ role: m.role, content: m.content })),
    ];

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const aiResponse = await openaiResponse.json();
    const assistantMessage = aiResponse.choices[0].message.content;

    await supabase.from('chat_messages').insert({
      conversation_id: activeConversationId,
      role: 'assistant',
      content: assistantMessage,
    });

    await supabase
      .from('chat_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', activeConversationId);

    return new Response(
      JSON.stringify({
        conversationId: activeConversationId,
        message: assistantMessage,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});