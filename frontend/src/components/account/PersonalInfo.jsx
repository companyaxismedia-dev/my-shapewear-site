"use client";


import { useAccount } from "@/hooks/useAccount";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { API_BASE } from "@/lib/api";

export default function PersonalInfo() {

  const { updateUserProfile } = useAccount();
  const { user } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);


  // Fetch latest profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      const stored = JSON.parse(localStorage.getItem("user"));
      if (!stored?.token) return;
      const res = await fetch(`${API_BASE}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${stored.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setFormData(data);
      }
    };
    fetchProfile();
  }, [user]);



  const handleChange = (e) => {

    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

  }




  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const stored = JSON.parse(localStorage.getItem("user"));
      const res = await fetch(`${API_BASE}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${stored?.token}`
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error("Failed to update profile");
      const updated = await res.json();
      updateUserProfile(updated);
      localStorage.setItem("user", JSON.stringify({
        ...stored,
        ...updated
      }));
      setFormData(updated);
      setIsEditing(false);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };



  return (

    <div className="w-full max-w-4xl">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-8">

        <h2 className="text-2xl font-bold text-gray-800">
          Personal Information
        </h2>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-2 rounded-md text-sm font-semibold"
        >
          {isEditing ? "Cancel" : "Edit"}
        </button>

      </div>



      {/* VIEW MODE */}

      {!isEditing && (

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">Name</p>
            <p className="text-gray-900">{formData?.name || "Not provided"}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">Email</p>
            <p className="text-gray-900">{formData?.email || "Not provided"}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">Phone</p>
            <p className="text-gray-900">{formData?.phone || "Not provided"}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">Gender</p>
            <p className="text-gray-900">{formData?.gender || "Not provided"}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">Birthday</p>
            <p className="text-gray-900">{formData?.birthday || "Not provided"}</p>
          </div>

        </div>

      )}



      {/* EDIT MODE */}

      {isEditing && (

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* NAME */}

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Full Name
              </label>

              <input
                type="text"
                name="name"
                value={formData?.name || ""}
                onChange={handleChange}
                className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>



            {/* EMAIL */}

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData?.email || ""}
                onChange={handleChange}
                className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>



            {/* PHONE */}

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Phone
              </label>

              <input
                type="text"
                name="phone"
                value={formData?.phone || ""}
                onChange={handleChange}
                className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>



            {/* GENDER */}

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Gender
              </label>

              <select
                name="gender"
                value={formData?.gender || ""}
                onChange={handleChange}
                className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-pink-500 outline-none"
              >

                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>

              </select>
            </div>



            {/* BIRTHDAY */}

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Birthday
              </label>

              <input
                type="date"
                name="birthday"
                value={formData?.birthday || ""}
                onChange={handleChange}
                className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>

          </div>



          <button
            type="submit"
            disabled={loading}
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-md font-semibold"
          >

            {loading ? "Saving..." : "Save Changes"}

          </button>

        </form>

      )}

    </div>

  )

}