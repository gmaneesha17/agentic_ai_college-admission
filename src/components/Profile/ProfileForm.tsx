import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { UserProfile } from '../../types';
import { Save, Loader2, Plus, X } from 'lucide-react';

export default function ProfileForm({ onComplete }: { onComplete?: () => void }) {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<Partial<UserProfile>>({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    date_of_birth: profile?.date_of_birth || '',
    country: profile?.country || 'USA',
    state: profile?.state || '',
    city: profile?.city || '',
    gpa: profile?.gpa || undefined,
    sat_score: profile?.sat_score || undefined,
    act_score: profile?.act_score || undefined,
    career_goals: profile?.career_goals || '',
    budget_min: profile?.budget_min || 0,
    budget_max: profile?.budget_max || undefined,
    preferred_majors: profile?.preferred_majors || [],
    interests: profile?.interests || [],
    preferred_locations: profile?.preferred_locations || [],
    extracurriculars: profile?.extracurriculars || [],
  });

  const [newMajor, setNewMajor] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newActivity, setNewActivity] = useState({ name: '', role: '', duration: '' });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name,
        phone: profile.phone || '',
        date_of_birth: profile.date_of_birth || '',
        country: profile.country || 'USA',
        state: profile.state || '',
        city: profile.city || '',
        gpa: profile.gpa,
        sat_score: profile.sat_score,
        act_score: profile.act_score,
        career_goals: profile.career_goals || '',
        budget_min: profile.budget_min || 0,
        budget_max: profile.budget_max,
        preferred_majors: profile.preferred_majors || [],
        interests: profile.interests || [],
        preferred_locations: profile.preferred_locations || [],
        extracurriculars: profile.extracurriculars || [],
      });
    }
  }, [profile]);

  const addMajor = () => {
    if (newMajor.trim() && !formData.preferred_majors?.includes(newMajor.trim())) {
      setFormData({
        ...formData,
        preferred_majors: [...(formData.preferred_majors || []), newMajor.trim()],
      });
      setNewMajor('');
    }
  };

  const removeMajor = (major: string) => {
    setFormData({
      ...formData,
      preferred_majors: formData.preferred_majors?.filter((m) => m !== major),
    });
  };

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests?.includes(newInterest.trim())) {
      setFormData({
        ...formData,
        interests: [...(formData.interests || []), newInterest.trim()],
      });
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setFormData({
      ...formData,
      interests: formData.interests?.filter((i) => i !== interest),
    });
  };

  const addLocation = () => {
    if (newLocation.trim() && !formData.preferred_locations?.includes(newLocation.trim())) {
      setFormData({
        ...formData,
        preferred_locations: [...(formData.preferred_locations || []), newLocation.trim()],
      });
      setNewLocation('');
    }
  };

  const removeLocation = (location: string) => {
    setFormData({
      ...formData,
      preferred_locations: formData.preferred_locations?.filter((l) => l !== location),
    });
  };

  const addActivity = () => {
    if (newActivity.name.trim()) {
      setFormData({
        ...formData,
        extracurriculars: [
          ...(formData.extracurriculars || []),
          {
            name: newActivity.name.trim(),
            role: newActivity.role.trim(),
            duration: newActivity.duration.trim(),
          },
        ],
      });
      setNewActivity({ name: '', role: '', duration: '' });
    }
  };

  const removeActivity = (index: number) => {
    setFormData({
      ...formData,
      extracurriculars: formData.extracurriculars?.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    if (formData.gpa && (formData.gpa < 0 || formData.gpa > 4)) {
      setError('GPA must be between 0 and 4');
      setLoading(false);
      return;
    }

    if (formData.sat_score && (formData.sat_score < 400 || formData.sat_score > 1600)) {
      setError('SAT score must be between 400 and 1600');
      setLoading(false);
      return;
    }

    if (formData.act_score && (formData.act_score < 1 || formData.act_score > 36)) {
      setError('ACT score must be between 1 and 36');
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      await refreshProfile();
      setSuccess(true);
      setLoading(false);

      if (onComplete) {
        setTimeout(() => onComplete(), 1500);
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4">
          Profile updated successfully!
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
            <input
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State/Region</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Academic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">GPA (0-4 scale)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="4"
              value={formData.gpa || ''}
              onChange={(e) => setFormData({ ...formData, gpa: parseFloat(e.target.value) || undefined })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SAT Score (400-1600)</label>
            <input
              type="number"
              min="400"
              max="1600"
              value={formData.sat_score || ''}
              onChange={(e) => setFormData({ ...formData, sat_score: parseInt(e.target.value) || undefined })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ACT Score (1-36)</label>
            <input
              type="number"
              min="1"
              max="36"
              value={formData.act_score || ''}
              onChange={(e) => setFormData({ ...formData, act_score: parseInt(e.target.value) || undefined })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Interests & Goals</h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Majors</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newMajor}
                onChange={(e) => setNewMajor(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMajor())}
                placeholder="e.g., Computer Science"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addMajor}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.preferred_majors?.map((major) => (
                <span
                  key={major}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {major}
                  <button type="button" onClick={() => removeMajor(major)}>
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                placeholder="e.g., Robotics, Music"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addInterest}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.interests?.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  {interest}
                  <button type="button" onClick={() => removeInterest(interest)}>
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Career Goals</label>
            <textarea
              value={formData.career_goals}
              onChange={(e) => setFormData({ ...formData, career_goals: e.target.value })}
              rows={3}
              placeholder="Describe your career aspirations..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Preferences</h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Locations</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
                placeholder="e.g., California, New York"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addLocation}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.preferred_locations?.map((location) => (
                <span
                  key={location}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                >
                  {location}
                  <button type="button" onClick={() => removeLocation(location)}>
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Budget ($)</label>
              <input
                type="number"
                min="0"
                value={formData.budget_min || ''}
                onChange={(e) => setFormData({ ...formData, budget_min: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Budget ($)</label>
              <input
                type="number"
                min="0"
                value={formData.budget_max || ''}
                onChange={(e) => setFormData({ ...formData, budget_max: parseInt(e.target.value) || undefined })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Extracurricular Activities</h3>

        <div className="space-y-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={newActivity.name}
              onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
              placeholder="Activity name"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              value={newActivity.role}
              onChange={(e) => setNewActivity({ ...newActivity, role: e.target.value })}
              placeholder="Your role"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={newActivity.duration}
                onChange={(e) => setNewActivity({ ...newActivity, duration: e.target.value })}
                placeholder="Duration"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addActivity}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {formData.extracurriculars?.map((activity, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
              <div>
                <div className="font-medium text-gray-900">{activity.name}</div>
                <div className="text-sm text-gray-600">
                  {activity.role && `${activity.role} • `}
                  {activity.duration}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeActivity(index)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Profile
            </>
          )}
        </button>
      </div>
    </form>
  );
}
