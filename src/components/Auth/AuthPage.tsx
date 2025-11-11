import { useState } from 'react';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';
import { GraduationCap } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex items-center gap-12">
        <div className="flex-1 hidden lg:block">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-lg">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">CollegeAI</span>
            </div>

            <h1 className="text-5xl font-bold text-gray-900 leading-tight">
              Your AI-Powered
              <br />
              <span className="text-blue-600">College Admission</span>
              <br />
              Companion
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed">
              Get personalized college recommendations based on your academic profile,
              interests, and career goals. Our AI analyzes thousands of data points
              to help you find the perfect fit.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
                <div className="text-gray-600">Colleges in Database</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
                <div className="text-gray-600">Match Accuracy</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex justify-center">
          {isLogin ? (
            <LoginForm onToggle={() => setIsLogin(false)} />
          ) : (
            <SignUpForm onToggle={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
}
