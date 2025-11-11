/*
  # College Admission Recommendation System Schema

  ## Overview
  This migration creates the complete database schema for an AI-powered college admission recommendation system.

  ## New Tables

  ### 1. `user_profiles`
  Stores detailed student academic and personal information
  - `id` (uuid, primary key) - Links to auth.users
  - `full_name` (text) - Student's full name
  - `email` (text) - Student's email
  - `phone` (text) - Contact number
  - `date_of_birth` (date) - Student's DOB
  - `country` (text) - Student's country
  - `state` (text) - Student's state/region
  - `city` (text) - Student's city
  - `gpa` (numeric) - Grade Point Average (0-4 scale)
  - `sat_score` (integer) - SAT score (400-1600)
  - `act_score` (integer) - ACT score (1-36)
  - `test_scores` (jsonb) - Additional test scores (TOEFL, IELTS, etc.)
  - `extracurriculars` (jsonb) - Array of extracurricular activities
  - `interests` (text[]) - Areas of interest
  - `preferred_majors` (text[]) - Preferred fields of study
  - `career_goals` (text) - Career aspirations
  - `budget_min` (numeric) - Minimum budget
  - `budget_max` (numeric) - Maximum budget
  - `preferred_locations` (text[]) - Preferred college locations
  - `preferences` (jsonb) - Additional preferences
  - `created_at` (timestamptz) - Profile creation time
  - `updated_at` (timestamptz) - Last update time

  ### 2. `colleges`
  Stores comprehensive college information
  - `id` (uuid, primary key) - Unique college identifier
  - `name` (text) - College name
  - `country` (text) - Country location
  - `state` (text) - State/region
  - `city` (text) - City location
  - `college_type` (text) - Public/Private/Community
  - `acceptance_rate` (numeric) - Admission acceptance rate (0-100)
  - `avg_gpa` (numeric) - Average GPA of admitted students
  - `sat_range_min` (integer) - Minimum SAT score
  - `sat_range_max` (integer) - Maximum SAT score
  - `act_range_min` (integer) - Minimum ACT score
  - `act_range_max` (integer) - Maximum ACT score
  - `tuition_in_state` (numeric) - In-state tuition cost
  - `tuition_out_state` (numeric) - Out-of-state tuition cost
  - `majors_offered` (text[]) - Available majors
  - `specializations` (text[]) - Special programs
  - `application_deadline` (date) - Application deadline
  - `early_decision_deadline` (date) - Early decision deadline
  - `requirements` (jsonb) - Admission requirements
  - `scholarships` (jsonb) - Available scholarships
  - `website` (text) - College website
  - `ranking` (integer) - College ranking
  - `description` (text) - College description
  - `created_at` (timestamptz) - Record creation time
  - `updated_at` (timestamptz) - Last update time

  ### 3. `recommendations`
  Stores AI-generated college recommendations
  - `id` (uuid, primary key) - Unique recommendation ID
  - `user_id` (uuid, foreign key) - References user_profiles
  - `college_id` (uuid, foreign key) - References colleges
  - `match_score` (numeric) - AI match score (0-100)
  - `reasoning` (text) - AI explanation for recommendation
  - `fit_category` (text) - Safety/Target/Reach
  - `strengths` (text[]) - Matching strengths
  - `concerns` (text[]) - Potential concerns
  - `ai_insights` (jsonb) - Additional AI insights
  - `created_at` (timestamptz) - Recommendation time

  ### 4. `chat_conversations`
  Stores conversational AI chat history
  - `id` (uuid, primary key) - Unique conversation ID
  - `user_id` (uuid, foreign key) - References user_profiles
  - `title` (text) - Conversation title
  - `created_at` (timestamptz) - Conversation start time
  - `updated_at` (timestamptz) - Last message time

  ### 5. `chat_messages`
  Stores individual chat messages
  - `id` (uuid, primary key) - Unique message ID
  - `conversation_id` (uuid, foreign key) - References chat_conversations
  - `role` (text) - user/assistant/system
  - `content` (text) - Message content
  - `metadata` (jsonb) - Additional message data
  - `created_at` (timestamptz) - Message timestamp

  ### 6. `saved_colleges`
  Tracks colleges saved by users
  - `id` (uuid, primary key) - Unique save ID
  - `user_id` (uuid, foreign key) - References user_profiles
  - `college_id` (uuid, foreign key) - References colleges
  - `notes` (text) - User notes
  - `application_status` (text) - Not started/In progress/Submitted/Accepted/Rejected
  - `created_at` (timestamptz) - Save timestamp

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - Colleges table is publicly readable
  - Authenticated users can create profiles and recommendations
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  date_of_birth date,
  country text,
  state text,
  city text,
  gpa numeric CHECK (gpa >= 0 AND gpa <= 4),
  sat_score integer CHECK (sat_score >= 400 AND sat_score <= 1600),
  act_score integer CHECK (act_score >= 1 AND act_score <= 36),
  test_scores jsonb DEFAULT '{}'::jsonb,
  extracurriculars jsonb DEFAULT '[]'::jsonb,
  interests text[] DEFAULT ARRAY[]::text[],
  preferred_majors text[] DEFAULT ARRAY[]::text[],
  career_goals text,
  budget_min numeric DEFAULT 0,
  budget_max numeric,
  preferred_locations text[] DEFAULT ARRAY[]::text[],
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create colleges table
CREATE TABLE IF NOT EXISTS colleges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text NOT NULL,
  state text,
  city text NOT NULL,
  college_type text,
  acceptance_rate numeric CHECK (acceptance_rate >= 0 AND acceptance_rate <= 100),
  avg_gpa numeric CHECK (avg_gpa >= 0 AND avg_gpa <= 4),
  sat_range_min integer CHECK (sat_range_min >= 400 AND sat_range_min <= 1600),
  sat_range_max integer CHECK (sat_range_max >= 400 AND sat_range_max <= 1600),
  act_range_min integer CHECK (act_range_min >= 1 AND act_range_min <= 36),
  act_range_max integer CHECK (act_range_max >= 1 AND act_range_max <= 36),
  tuition_in_state numeric DEFAULT 0,
  tuition_out_state numeric DEFAULT 0,
  majors_offered text[] DEFAULT ARRAY[]::text[],
  specializations text[] DEFAULT ARRAY[]::text[],
  application_deadline date,
  early_decision_deadline date,
  requirements jsonb DEFAULT '{}'::jsonb,
  scholarships jsonb DEFAULT '[]'::jsonb,
  website text,
  ranking integer,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  college_id uuid NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  match_score numeric CHECK (match_score >= 0 AND match_score <= 100),
  reasoning text,
  fit_category text CHECK (fit_category IN ('Safety', 'Target', 'Reach')),
  strengths text[] DEFAULT ARRAY[]::text[],
  concerns text[] DEFAULT ARRAY[]::text[],
  ai_insights jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, college_id)
);

-- Create chat_conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title text DEFAULT 'New Conversation',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create saved_colleges table
CREATE TABLE IF NOT EXISTS saved_colleges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  college_id uuid NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  notes text,
  application_status text DEFAULT 'Not Started' CHECK (application_status IN ('Not Started', 'In Progress', 'Submitted', 'Accepted', 'Rejected')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, college_id)
);

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_colleges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can create own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for colleges (publicly readable)
CREATE POLICY "Anyone can view colleges"
  ON colleges FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for recommendations
CREATE POLICY "Users can view own recommendations"
  ON recommendations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own recommendations"
  ON recommendations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own recommendations"
  ON recommendations FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for chat_conversations
CREATE POLICY "Users can view own conversations"
  ON chat_conversations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own conversations"
  ON chat_conversations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own conversations"
  ON chat_conversations FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages in own conversations"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE chat_conversations.id = chat_messages.conversation_id
      AND chat_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own conversations"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE chat_conversations.id = chat_messages.conversation_id
      AND chat_conversations.user_id = auth.uid()
    )
  );

-- RLS Policies for saved_colleges
CREATE POLICY "Users can view own saved colleges"
  ON saved_colleges FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can save colleges"
  ON saved_colleges FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own saved colleges"
  ON saved_colleges FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own saved colleges"
  ON saved_colleges FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_college_id ON recommendations(college_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_saved_colleges_user_id ON saved_colleges(user_id);
CREATE INDEX IF NOT EXISTS idx_colleges_majors ON colleges USING GIN(majors_offered);

-- Insert sample colleges data
INSERT INTO colleges (name, country, state, city, college_type, acceptance_rate, avg_gpa, sat_range_min, sat_range_max, act_range_min, act_range_max, tuition_in_state, tuition_out_state, majors_offered, specializations, application_deadline, requirements, scholarships, website, ranking, description) VALUES
('Massachusetts Institute of Technology', 'USA', 'Massachusetts', 'Cambridge', 'Private', 3.9, 3.96, 1520, 1580, 35, 36, 55510, 55510, ARRAY['Computer Science', 'Engineering', 'Physics', 'Mathematics', 'Economics'], ARRAY['AI & Machine Learning', 'Robotics', 'Quantum Computing'], '2025-01-01', '{"essays": ["Personal statement", "Supplemental essays"], "recommendations": 2, "interview": "Optional"}'::jsonb, '[{"name": "Merit Scholarship", "amount": 30000, "criteria": "Outstanding academic achievement"}]'::jsonb, 'https://www.mit.edu', 1, 'Premier research university known for engineering and technology'),
('Stanford University', 'USA', 'California', 'Stanford', 'Private', 3.7, 3.95, 1470, 1570, 33, 35, 57693, 57693, ARRAY['Computer Science', 'Engineering', 'Business', 'Medicine', 'Law'], ARRAY['Entrepreneurship', 'Biotechnology', 'Sustainability'], '2025-01-05', '{"essays": ["Personal statement", "Supplemental essays"], "recommendations": 3, "interview": "Optional"}'::jsonb, '[{"name": "Knight-Hennessy Scholars", "amount": 50000, "criteria": "Leadership and service"}]'::jsonb, 'https://www.stanford.edu', 2, 'Leading university in innovation and entrepreneurship'),
('Harvard University', 'USA', 'Massachusetts', 'Cambridge', 'Private', 3.4, 3.97, 1480, 1580, 34, 36, 54002, 54002, ARRAY['Liberal Arts', 'Sciences', 'Law', 'Medicine', 'Business'], ARRAY['Global Health', 'Social Policy', 'Environmental Science'], '2025-01-01', '{"essays": ["Personal statement", "Supplemental essays"], "recommendations": 2, "interview": "Optional"}'::jsonb, '[{"name": "Harvard Financial Aid", "amount": 40000, "criteria": "Need-based"}]'::jsonb, 'https://www.harvard.edu', 3, 'Oldest institution of higher learning in the United States'),
('University of California, Berkeley', 'USA', 'California', 'Berkeley', 'Public', 14.5, 3.89, 1330, 1530, 31, 35, 14226, 43980, ARRAY['Computer Science', 'Engineering', 'Business', 'Environmental Science', 'Political Science'], ARRAY['Data Science', 'Renewable Energy'], '2024-11-30', '{"essays": ["Personal insight questions"], "recommendations": 0, "interview": "Not required"}'::jsonb, '[{"name": "Regents Scholarship", "amount": 25000, "criteria": "Academic excellence"}]'::jsonb, 'https://www.berkeley.edu', 4, 'Top public university with strong research programs'),
('Carnegie Mellon University', 'USA', 'Pennsylvania', 'Pittsburgh', 'Private', 11.3, 3.91, 1480, 1560, 34, 35, 59864, 59864, ARRAY['Computer Science', 'Engineering', 'Drama', 'Business', 'Design'], ARRAY['Robotics', 'Human-Computer Interaction', 'Artificial Intelligence'], '2025-01-03', '{"essays": ["Personal statement", "Supplemental essays"], "recommendations": 2, "interview": "Optional"}'::jsonb, '[{"name": "Presidential Scholarship", "amount": 35000, "criteria": "Academic merit"}]'::jsonb, 'https://www.cmu.edu', 5, 'Leading institution in computer science and engineering'),
('University of Michigan', 'USA', 'Michigan', 'Ann Arbor', 'Public', 17.7, 3.88, 1340, 1530, 31, 34, 15948, 52266, ARRAY['Engineering', 'Business', 'Medicine', 'Law', 'Arts'], ARRAY['Automotive Engineering', 'Public Policy'], '2025-02-01', '{"essays": ["Personal statement", "Supplemental essays"], "recommendations": 1, "interview": "Not required"}'::jsonb, '[{"name": "Michigan Scholarship", "amount": 20000, "criteria": "Academic achievement"}]'::jsonb, 'https://www.umich.edu', 6, 'Comprehensive public research university'),
('Georgia Institute of Technology', 'USA', 'Georgia', 'Atlanta', 'Public', 16.4, 3.87, 1370, 1530, 31, 35, 12424, 33020, ARRAY['Engineering', 'Computer Science', 'Business', 'Sciences'], ARRAY['Aerospace Engineering', 'Cybersecurity'], '2025-01-10', '{"essays": ["Personal statement"], "recommendations": 1, "interview": "Not required"}'::jsonb, '[{"name": "HOPE Scholarship", "amount": 15000, "criteria": "Georgia residents"}]'::jsonb, 'https://www.gatech.edu', 7, 'Top engineering and technology focused public university'),
('University of Texas at Austin', 'USA', 'Texas', 'Austin', 'Public', 29.0, 3.83, 1230, 1480, 27, 33, 11448, 40032, ARRAY['Computer Science', 'Business', 'Engineering', 'Communications', 'Natural Sciences'], ARRAY['Entrepreneurship', 'Energy Engineering'], '2024-12-01', '{"essays": ["Personal statement", "Supplemental essays"], "recommendations": 0, "interview": "Not required"}'::jsonb, '[{"name": "Texas Scholarship", "amount": 18000, "criteria": "Texas residents"}]'::jsonb, 'https://www.utexas.edu', 8, 'Major public research university with diverse programs'),
('University of Washington', 'USA', 'Washington', 'Seattle', 'Public', 47.6, 3.76, 1220, 1470, 27, 33, 11465, 39461, ARRAY['Computer Science', 'Engineering', 'Medicine', 'Business', 'Environmental Science'], ARRAY['Global Health', 'Clean Energy'], '2024-11-15', '{"essays": ["Personal statement"], "recommendations": 0, "interview": "Not required"}'::jsonb, '[{"name": "Husky Promise", "amount": 12000, "criteria": "Need-based"}]'::jsonb, 'https://www.washington.edu', 9, 'Leading research university in the Pacific Northwest'),
('Purdue University', 'USA', 'Indiana', 'West Lafayette', 'Public', 52.7, 3.69, 1190, 1430, 26, 33, 9992, 28794, ARRAY['Engineering', 'Computer Science', 'Agriculture', 'Business', 'Sciences'], ARRAY['Aeronautics', 'Pharmaceuticals'], '2025-02-01', '{"essays": ["Personal statement"], "recommendations": 1, "interview": "Not required"}'::jsonb, '[{"name": "Presidential Scholarship", "amount": 16000, "criteria": "Academic merit"}]'::jsonb, 'https://www.purdue.edu', 10, 'Strong engineering and technology programs')
ON CONFLICT DO NOTHING;