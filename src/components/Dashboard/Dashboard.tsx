import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Recommendation, College } from '../../types';
import RecommendationList from './RecommendationList';
import ChatInterface from './ChatInterface';
import ProfileSummary from './ProfileSummary';
import { Sparkles, MessageSquare, User, LogOut, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { signOut, profile } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'recommendations' | 'chat' | 'profile'>('recommendations');

  useEffect(() => {
    if (profile) {
      fetchRecommendations();
    }
  }, [profile]);

  const fetchRecommendations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('recommendations')
      .select(`
        *,
        colleges (*)
      `)
      .order('match_score', { ascending: false });

    if (!error && data) {
      setRecommendations(data as any);
    }
    setLoading(false);
  };

  const generateRecommendations = async () => {
    setGenerating(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-recommendations`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate recommendations');
      }

      await fetchRecommendations();
    } catch (error) {
      console.error('Error generating recommendations:', error);
    }
    setGenerating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CollegeAI</h1>
                <p className="text-xs text-gray-500">AI-Powered Recommendations</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{profile?.full_name}</div>
                <div className="text-xs text-gray-500">{profile?.email}</div>
              </div>
              <button
                onClick={signOut}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`px-6 py-3 font-medium transition border-b-2 ${
                activeTab === 'recommendations'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Recommendations
              </span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-6 py-3 font-medium transition border-b-2 ${
                activeTab === 'chat'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                AI Chat
              </span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 font-medium transition border-b-2 ${
                activeTab === 'profile'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile
              </span>
            </button>
          </div>
        </div>

        {activeTab === 'recommendations' && (
          <div>
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Your College Recommendations</h2>
                  <p className="text-gray-600 mt-1">
                    AI-powered matches based on your academic profile and preferences
                  </p>
                </div>
                <button
                  onClick={generateRecommendations}
                  disabled={generating}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Recommendations
                    </>
                  )}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : recommendations.length > 0 ? (
              <RecommendationList recommendations={recommendations} onRefresh={fetchRecommendations} />
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No recommendations yet</h3>
                <p className="text-gray-600 mb-6">
                  Click "Generate Recommendations" to get AI-powered college matches based on your profile
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'chat' && <ChatInterface />}

        {activeTab === 'profile' && <ProfileSummary />}
      </div>
    </div>
  );
}
