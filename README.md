# CollegeAI - AI-Powered College Admission Recommendation System

An intelligent college admission recommendation system powered by AI that helps prospective students find suitable colleges based on their academic performance, interests, and career goals.

## Features

### 🎯 Personalized Recommendations
- AI-powered college matching based on GPA, SAT/ACT scores, and preferences
- Smart categorization into Safety, Target, and Reach schools
- Match scores with detailed reasoning for each recommendation
- Acceptance probability estimates

### 💬 AI Chat Counselor
- Conversational interface powered by OpenAI GPT-3.5
- Get personalized advice about college selection and admissions
- Ask questions about specific colleges, scholarships, and application strategies
- Context-aware responses based on your profile

### 📊 Comprehensive Profile System
- Detailed academic information (GPA, SAT, ACT scores)
- Interest and major preferences
- Budget constraints and location preferences
- Extracurricular activities tracking
- Complete input validation

### 🎓 College Database
- Pre-populated with top 10 colleges
- Detailed information including:
  - Acceptance rates and rankings
  - Tuition costs
  - Required test score ranges
  - Available majors and specializations
  - Application deadlines
  - Scholarship opportunities

### 🔐 Secure Authentication
- Email/password authentication via Supabase
- Row Level Security (RLS) policies protecting user data
- Secure session management

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Backend**: Supabase Edge Functions (Deno)
- **AI Integration**: OpenAI GPT-3.5 API
- **Icons**: Lucide React

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- A Supabase account
- (Optional) OpenAI API key for chat feature

### 1. Clone and Install

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from your Supabase project settings at: https://app.supabase.com

### 3. Database Setup

The database schema has already been applied via migration. It includes:

- `user_profiles` - Student academic and personal information
- `colleges` - College information database
- `recommendations` - AI-generated recommendations
- `chat_conversations` - Chat conversation history
- `chat_messages` - Individual chat messages
- `saved_colleges` - User's saved colleges with application tracking

### 4. Configure OpenAI (Optional)

To enable the AI chat feature, add your OpenAI API key to your Supabase project:

1. Go to your Supabase project dashboard
2. Navigate to Project Settings > Edge Functions
3. Add a new secret: `OPENAI_API_KEY` with your API key value

**Note**: The app works without this - only the chat feature requires it.

### 5. Run the Application

```bash
npm run dev
```

Visit http://localhost:5173 to see the application.

## Project Structure

```
src/
├── components/
│   ├── Auth/
│   │   ├── AuthPage.tsx          # Main auth page
│   │   ├── LoginForm.tsx         # Login form component
│   │   └── SignUpForm.tsx        # Sign up form component
│   ├── Dashboard/
│   │   ├── Dashboard.tsx         # Main dashboard
│   │   ├── ChatInterface.tsx     # AI chat interface
│   │   ├── ProfileSummary.tsx    # Profile display
│   │   └── RecommendationList.tsx # College recommendations
│   └── Profile/
│       └── ProfileForm.tsx       # Profile editing form
├── contexts/
│   └── AuthContext.tsx           # Authentication context
├── lib/
│   └── supabase.ts              # Supabase client
├── types/
│   └── index.ts                 # TypeScript types
├── App.tsx                      # Main app component
└── main.tsx                     # App entry point

supabase/
└── functions/
    ├── ai-recommendations/      # AI recommendation engine
    │   └── index.ts
    └── ai-chat/                # AI chat endpoint
        └── index.ts
```

## How It Works

### Recommendation Algorithm

The AI recommendation system analyzes multiple factors:

1. **Academic Match (55 points)**
   - GPA comparison (30 points)
   - SAT/ACT scores (25 points)

2. **Program Fit (20 points)**
   - Major availability

3. **Location Preference (10 points)**
   - Preferred state/city matching

4. **Budget Fit (10 points)**
   - Tuition within budget

5. **Extracurriculars (5 points)**
   - Activity diversity bonus

**Categorization:**
- Safety: 85+ match score
- Target: 65-84 match score
- Reach: <65 match score

### AI Chat System

The chat system uses OpenAI's GPT-3.5 with:
- User profile context
- Current recommendations
- College database information
- Conversation history

## Usage Guide

### 1. Sign Up & Create Profile
- Create an account with email/password
- Complete your profile with academic information
- Add interests, major preferences, and budget

### 2. Generate Recommendations
- Click "Generate Recommendations" on the dashboard
- Review your personalized college matches
- Explore Safety, Target, and Reach categories
- Save colleges you're interested in

### 3. Use AI Chat
- Ask questions about colleges and admissions
- Get personalized advice based on your profile
- Discuss application strategies
- Learn about scholarships and requirements

### 4. Track Applications
- Save colleges to your list
- Update application status
- Add personal notes for each college

## Validation & Data Quality

### Input Validation
- GPA: 0.0 - 4.0 scale
- SAT: 400 - 1600
- ACT: 1 - 36
- All fields properly validated

### College Data
- Real college information
- Accurate acceptance rates and rankings
- Current tuition data
- Valid test score ranges

### Security
- Row Level Security (RLS) on all tables
- Users can only access their own data
- Secure authentication with Supabase
- Protected API endpoints

## Features in Detail

### Profile Management
- Comprehensive academic tracking
- Dynamic major/interest tags
- Budget planning tools
- Extracurricular activity logging

### Recommendation Display
- Color-coded fit categories
- Detailed match reasoning
- Acceptance probability
- Financial information
- Direct links to college websites

### Chat Interface
- Natural language processing
- Context-aware responses
- Conversation history
- Suggested questions
- Real-time responses

## Building for Production

```bash
npm run build
```

The production build will be created in the `dist/` directory.

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Your Supabase anonymous key |
| `OPENAI_API_KEY` | No | OpenAI API key (for chat feature) |

## Troubleshooting

### Chat Feature Not Working
- Ensure `OPENAI_API_KEY` is configured in Supabase Edge Function secrets
- Check that you have OpenAI API credits
- The app will show a helpful error message if the key is missing

### No Recommendations Generated
- Ensure your profile is complete with at least GPA and one test score
- Check browser console for any errors
- Verify Supabase connection

### Authentication Issues
- Clear browser cache and cookies
- Check Supabase project status
- Verify environment variables are correct

## Future Enhancements

- Essay review and feedback
- Application deadline reminders
- Document upload and management
- Recommendation letter tracking
- Interview preparation resources
- Financial aid calculator
- College comparison tool

## License

MIT License - feel free to use this project for educational purposes.

## Support

For issues or questions, please check the Supabase documentation at https://supabase.com/docs
