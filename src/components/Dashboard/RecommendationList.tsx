import { useState } from 'react';
import { Recommendation } from '../../types';
import { MapPin, DollarSign, TrendingUp, Award, ExternalLink, BookmarkPlus, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  recommendations: Recommendation[];
  onRefresh: () => void;
}

export default function RecommendationList({ recommendations, onRefresh }: Props) {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Safety' | 'Target' | 'Reach'>('All');
  const [savedColleges, setSavedColleges] = useState<Set<string>>(new Set());

  const filteredRecommendations =
    selectedCategory === 'All'
      ? recommendations
      : recommendations.filter((r) => r.fit_category === selectedCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Safety':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Target':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Reach':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const saveCollege = async (collegeId: string) => {
    try {
      await supabase.from('saved_colleges').insert({
        user_id: user?.id,
        college_id: collegeId,
        application_status: 'Not Started',
      });

      setSavedColleges(new Set([...savedColleges, collegeId]));
    } catch (error) {
      console.error('Error saving college:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {['All', 'Safety', 'Target', 'Reach'].map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category as any)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredRecommendations.map((rec) => (
          <div key={rec.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-gray-900">{rec.colleges?.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(rec.fit_category)}`}>
                      {rec.fit_category}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {rec.colleges?.city}, {rec.colleges?.state}
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      Ranking: #{rec.colleges?.ranking}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {rec.colleges?.acceptance_rate?.toFixed(1)}% Acceptance
                    </span>
                  </div>

                  <p className="text-gray-700 mb-4">{rec.colleges?.description}</p>
                </div>

                <div className="ml-6 text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center mb-2">
                    <span className="text-3xl font-bold text-white">{rec.match_score}</span>
                  </div>
                  <div className="text-xs text-gray-600 font-medium">Match Score</div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-900 mb-2">AI Recommendation Insight</h4>
                <p className="text-blue-800 text-sm">{rec.reasoning}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    Strengths
                  </h4>
                  <ul className="space-y-1">
                    {rec.strengths.map((strength, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-green-600 mt-1">•</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {rec.concerns.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Considerations</h4>
                    <ul className="space-y-1">
                      {rec.concerns.map((concern, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-orange-600 mt-1">•</span>
                          <span>{concern}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pt-4 border-t border-gray-200">
                <div>
                  <div className="text-xs text-gray-600 mb-1">Avg GPA</div>
                  <div className="font-semibold text-gray-900">{rec.colleges?.avg_gpa?.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">SAT Range</div>
                  <div className="font-semibold text-gray-900">
                    {rec.colleges?.sat_range_min}-{rec.colleges?.sat_range_max}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Tuition</div>
                  <div className="font-semibold text-gray-900 flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {rec.colleges?.tuition_out_state?.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Acceptance Probability</div>
                  <div className="font-semibold text-gray-900">{rec.ai_insights.acceptance_probability}</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => saveCollege(rec.college_id)}
                  disabled={savedColleges.has(rec.college_id)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {savedColleges.has(rec.college_id) ? (
                    <>
                      <Check className="w-5 h-5" />
                      Saved
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-5 h-5" />
                      Save College
                    </>
                  )}
                </button>
                {rec.colleges?.website && (
                  <a
                    href={rec.colleges.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition flex items-center gap-2"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Visit Website
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
