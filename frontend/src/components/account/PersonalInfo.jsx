import { useAccount } from '../../hooks/useAccount';
import { useState } from 'react';

export default function PersonalInfo() {
  const { user, updateUserProfile } = useAccount();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUserProfile(formData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Personal Information</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition font-semibold"
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
          <div>
            <p className="text-sm text-gray-600 font-semibold">Name</p>
            <p className="text-gray-900 font-semibold">{user.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-semibold">Birthday</p>
            <p className="text-gray-900 font-semibold">{user.birthday}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-semibold">Email</p>
            <p className="text-gray-900 font-semibold">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-semibold">Anniversary</p>
            <p className="text-gray-900 font-semibold">{user.anniversary}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-semibold">Phone</p>
            <p className="text-gray-900 font-semibold">{user.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-semibold">Profession</p>
            <p className="text-gray-900 font-semibold">{user.profession}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-semibold">Gender</p>
            <p className="text-gray-900 font-semibold">{user.gender}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-semibold">City</p>
            <p className="text-gray-900 font-semibold">{user.city}</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-pink-600"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-pink-600"
            />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone"
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-pink-600"
            />
            <input
              type="date"
              name="birthday"
              value={formData.birthday}
              onChange={handleChange}
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-pink-600"
            />
            <input
              type="text"
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              placeholder="Profession"
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-pink-600"
            />
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-pink-600"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition"
          >
            Save Changes
          </button>
        </form>
      )}
    </div>
  );
}
