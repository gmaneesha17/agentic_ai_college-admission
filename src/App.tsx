// import { useAuth } from './contexts/AuthContext';
// import AuthPage from './components/Auth/AuthPage';
// import Dashboard from './components/Dashboard/Dashboard';
// import ProfileForm from './components/Profile/ProfileForm';
// import { Loader2 } from 'lucide-react';
// import { useState } from 'react';

// function App() {
//   const { user, profile, loading } = useAuth();
//   const [showProfileSetup, setShowProfileSetup] = useState(false);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-100 flex items-center justify-center">
//         <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
//       </div>
//     );
//   }

//   if (!user) {
//     return <AuthPage />;
//   }

//   if (!profile?.gpa && !showProfileSetup) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
//         <div className="max-w-4xl w-full">
//           <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
//             <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to CollegeAI!</h1>
//             <p className="text-gray-600 mb-6">
//               Let's set up your profile to get personalized college recommendations. This will help our AI
//               understand your academic background, interests, and goals to provide the best matches.
//             </p>
//             <button
//               onClick={() => setShowProfileSetup(true)}
//               className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
//             >
//               Complete Your Profile
//             </button>
//           </div>
//           {showProfileSetup && (
//             <div className="bg-white rounded-2xl shadow-xl p-8">
//               <ProfileForm onComplete={() => window.location.reload()} />
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   }

//   return <Dashboard />;
// }

// export default App;






import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import AuthPage from './components/Auth/AuthPage';
import Dashboard from './components/Dashboard/Dashboard';
import ProfileForm from './components/Profile/ProfileForm';
import { Loader2 } from 'lucide-react';

function App() {
  const { user, profile, loading } = useAuth();
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  if (!profile?.gpa && !showProfileSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to CollegeAI!
            </h1>
            <p className="text-gray-600 mb-6">
              Let's set up your profile to get personalized college recommendations. 
              This will help our AI understand your academic background, interests, 
              and goals to provide the best matches.
            </p>
            <button
              onClick={() => setShowProfileSetup(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Complete Your Profile
            </button>
          </div>

          {showProfileSetup && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <ProfileForm onComplete={() => window.location.reload()} />
            </div>
          )}
        </div>
      </div>
    );
  }

  return <Dashboard />;
}

export default App;
