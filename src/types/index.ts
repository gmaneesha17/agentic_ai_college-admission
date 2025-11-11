export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  country?: string;
  state?: string;
  city?: string;
  gpa?: number;
  sat_score?: number;
  act_score?: number;
  test_scores?: Record<string, any>;
  extracurriculars?: Array<{
    name: string;
    role?: string;
    duration?: string;
    description?: string;
  }>;
  interests?: string[];
  preferred_majors?: string[];
  career_goals?: string;
  budget_min?: number;
  budget_max?: number;
  preferred_locations?: string[];
  preferences?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface College {
  id: string;
  name: string;
  country: string;
  state?: string;
  city: string;
  college_type?: string;
  acceptance_rate?: number;
  avg_gpa?: number;
  sat_range_min?: number;
  sat_range_max?: number;
  act_range_min?: number;
  act_range_max?: number;
  tuition_in_state?: number;
  tuition_out_state?: number;
  majors_offered?: string[];
  specializations?: string[];
  application_deadline?: string;
  early_decision_deadline?: string;
  requirements?: Record<string, any>;
  scholarships?: Array<{
    name: string;
    amount: number;
    criteria: string;
  }>;
  website?: string;
  ranking?: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Recommendation {
  id: string;
  user_id: string;
  college_id: string;
  match_score: number;
  reasoning: string;
  fit_category: 'Safety' | 'Target' | 'Reach';
  strengths: string[];
  concerns: string[];
  ai_insights: {
    acceptance_probability: string;
    ranking: number;
    specializations: string[];
  };
  created_at: string;
  colleges?: College;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ChatConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface SavedCollege {
  id: string;
  user_id: string;
  college_id: string;
  notes?: string;
  application_status: 'Not Started' | 'In Progress' | 'Submitted' | 'Accepted' | 'Rejected';
  created_at: string;
  colleges?: College;
}
