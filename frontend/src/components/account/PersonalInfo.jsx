"use client";

import { useAccount } from "@/hooks/useAccount";
import { useState, useEffect } from "react";
import { API_BASE } from "@/lib/api";

export default function PersonalInfo() {
  const { updateUserProfile } = useAccount();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  /* ===== ONLY SHOPPING REQUIRED FIELDS ===== */
  const fields = [
    "name",
    "email",
    "phone",
    "gender",
    "birthday",
  ];

  /* ================= LOAD USER ================= */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const stored = JSON.parse(localStorage.getItem("user"));
        if (!stored?.token) return;

        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: `Bearer ${stored.token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          const userData = data.user || data;

          setFormData(userData);
          updateUserProfile(userData);
        }
      } catch (err) {
        console.log("User fetch failed");
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= SAVE PROFILE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const stored = JSON.parse(localStorage.getItem("user"));

      await fetch(`${API_BASE}/auth/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${stored?.token}`,
        },
        body: JSON.stringify(formData),
      });

      updateUserProfile(formData);
      setIsEditing(false);
    } catch (err) {
      console.error("Profile update error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          Personal Information
        </h2>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-semibold text-sm"
        >
          {isEditing ? "Cancel" : "Edit"}
        </button>
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {fields.map((key) => (
            <div key={key}>
              <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
                {key}
              </p>
              <p className="text-base text-gray-800">
                {formData?.[key] || "Not provided"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {fields.map((field) => (
              <div key={field}>
                <label className="text-sm text-gray-600 font-medium mb-2 block">
                  {field}
                </label>

                <input
                  type="text"
                  name={field}
                  value={formData?.[field] || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg font-semibold transition"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}
    </div>
  );
}