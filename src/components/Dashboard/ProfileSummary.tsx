import ProfileForm from '../Profile/ProfileForm';

export default function ProfileSummary() {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Profile</h2>
      <ProfileForm />
    </div>
  );
}
