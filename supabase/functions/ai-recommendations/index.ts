import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface UserProfile {
  id: string;
  gpa: number;
  sat_score?: number;
  act_score?: number;
  preferred_majors: string[];
  interests: string[];
  career_goals?: string;
  budget_max?: number;
  preferred_locations: string[];
  extracurriculars: any[];
}

interface College {
  id: string;
  name: string;
  state: string;
  city: string;
  acceptance_rate: number;
  avg_gpa: number;
  sat_range_min: number;
  sat_range_max: number;
  act_range_min: number;
  act_range_max: number;
  tuition_out_state: number;
  majors_offered: string[];
  specializations: string[];
  ranking: number;
  description: string;
}

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

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: colleges, error: collegesError } = await supabase
      .from('colleges')
      .select('*')
      .order('ranking', { ascending: true });

    if (collegesError) {
      throw collegesError;
    }

    const recommendations = await generateRecommendations(profile as UserProfile, colleges as College[]);

    for (const rec of recommendations) {
      await supabase
        .from('recommendations')
        .upsert({
          user_id: user.id,
          college_id: rec.college_id,
          match_score: rec.match_score,
          reasoning: rec.reasoning,
          fit_category: rec.fit_category,
          strengths: rec.strengths,
          concerns: rec.concerns,
          ai_insights: rec.ai_insights,
        }, { onConflict: 'user_id,college_id' });
    }

    return new Response(JSON.stringify({ recommendations }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateRecommendations(profile: UserProfile, colleges: College[]) {
  const recommendations = [];

  for (const college of colleges) {
    let matchScore = 0;
    const strengths: string[] = [];
    const concerns: string[] = [];
    let fitCategory = 'Target';

    // GPA matching (30 points)
    if (profile.gpa >= college.avg_gpa) {
      matchScore += 30;
      strengths.push('Your GPA meets or exceeds the average');
    } else if (profile.gpa >= college.avg_gpa - 0.3) {
      matchScore += 20;
      strengths.push('Your GPA is competitive');
    } else {
      matchScore += 10;
      concerns.push('GPA is below average for admitted students');
    }

    // SAT/ACT matching (25 points)
    if (profile.sat_score) {
      if (profile.sat_score >= college.sat_range_max) {
        matchScore += 25;
        strengths.push('SAT score is in the top range');
      } else if (profile.sat_score >= (college.sat_range_min + college.sat_range_max) / 2) {
        matchScore += 18;
        strengths.push('SAT score is competitive');
      } else if (profile.sat_score >= college.sat_range_min) {
        matchScore += 12;
      } else {
        matchScore += 5;
        concerns.push('SAT score is below the typical range');
      }
    } else if (profile.act_score) {
      if (profile.act_score >= college.act_range_max) {
        matchScore += 25;
        strengths.push('ACT score is in the top range');
      } else if (profile.act_score >= (college.act_range_min + college.act_range_max) / 2) {
        matchScore += 18;
        strengths.push('ACT score is competitive');
      } else if (profile.act_score >= college.act_range_min) {
        matchScore += 12;
      } else {
        matchScore += 5;
        concerns.push('ACT score is below the typical range');
      }
    }

    // Major matching (20 points)
    const majorMatch = profile.preferred_majors.some(major =>
      college.majors_offered.some(offered => offered.toLowerCase().includes(major.toLowerCase()))
    );
    if (majorMatch) {
      matchScore += 20;
      strengths.push('Offers your preferred major(s)');
    } else {
      concerns.push('May not offer your exact preferred majors');
    }

    // Location preference (10 points)
    if (profile.preferred_locations.length > 0) {
      const locationMatch = profile.preferred_locations.some(loc =>
        college.state?.toLowerCase().includes(loc.toLowerCase()) ||
        college.city?.toLowerCase().includes(loc.toLowerCase())
      );
      if (locationMatch) {
        matchScore += 10;
        strengths.push('Located in your preferred area');
      }
    } else {
      matchScore += 5;
    }

    // Budget consideration (10 points)
    if (profile.budget_max && college.tuition_out_state <= profile.budget_max) {
      matchScore += 10;
      strengths.push('Tuition fits within your budget');
    } else if (profile.budget_max && college.tuition_out_state > profile.budget_max) {
      matchScore += 3;
      concerns.push('Tuition may exceed your budget (scholarships available)');
    } else {
      matchScore += 5;
    }

    // Extracurricular activities (5 points)
    if (profile.extracurriculars && profile.extracurriculars.length > 3) {
      matchScore += 5;
      strengths.push('Strong extracurricular profile');
    }

    // Determine fit category
    if (matchScore >= 85) {
      fitCategory = 'Safety';
    } else if (matchScore >= 65) {
      fitCategory = 'Target';
    } else {
      fitCategory = 'Reach';
    }

    // Generate reasoning
    const reasoning = `Based on your academic profile (GPA: ${profile.gpa}, ${profile.sat_score ? `SAT: ${profile.sat_score}` : profile.act_score ? `ACT: ${profile.act_score}` : 'No test scores'}), ${college.name} is a ${fitCategory.toLowerCase()} school for you. ${strengths.slice(0, 2).join('. ')}. ${college.description}`;

    recommendations.push({
      college_id: college.id,
      match_score: Math.min(matchScore, 100),
      reasoning,
      fit_category: fitCategory,
      strengths,
      concerns,
      ai_insights: {
        acceptance_probability: calculateAcceptanceProbability(matchScore, college.acceptance_rate),
        ranking: college.ranking,
        specializations: college.specializations,
      },
    });
  }

  return recommendations.sort((a, b) => b.match_score - a.match_score).slice(0, 15);
}

function calculateAcceptanceProbability(matchScore: number, acceptanceRate: number): string {
  const baseProbability = acceptanceRate;
  const adjustedProbability = Math.min(baseProbability * (matchScore / 70), 95);

  if (adjustedProbability >= 70) return 'High';
  if (adjustedProbability >= 40) return 'Moderate';
  if (adjustedProbability >= 15) return 'Low';
  return 'Very Low';
}