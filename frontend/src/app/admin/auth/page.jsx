"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API = "http://localhost:5000";

export default function AdminAuth() {
  const router = useRouter();

  const [mode, setMode] = useState("signin");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  // ===== LOGIN =====
  const signin = async () => {
    const res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
      }),
    });

    const data = await res.json();

    if (!res.ok) return alert(data.message);

    localStorage.setItem("adminToken", data.token);
    localStorage.setItem("adminRole", data.role);

    router.push("/admin");
  };

  // ===== SIGNUP STEP 1 =====
  const sendOTP = async () => {
    const res = await fetch(`${API}/api/otp/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: form.email }),
    });

    const data = await res.json();

    if (!res.ok) return alert(data.message);

    sessionStorage.setItem("signupData", JSON.stringify(form));

    router.push("/admin/auth/otp");
  };

  const submit = () => {
    if (mode === "signin") signin();
    else sendOTP();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">

        <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setMode("signin")}
            className={`flex-1 py-2 rounded ${
              mode === "signin" ? "bg-blue-600 text-white" : ""
            }`}
          >
            Sign In
          </button>

          <button
            onClick={() => setMode("signup")}
            className={`flex-1 py-2 rounded ${
              mode === "signup" ? "bg-blue-600 text-white" : ""
            }`}
          >
            Sign Up
          </button>
        </div>

        {mode === "signup" && (
          <>
            <input
              placeholder="Name"
              className="w-full border p-2 rounded mb-2"
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <input
              placeholder="Phone"
              className="w-full border p-2 rounded mb-2"
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />
          </>
        )}

        <input
          placeholder="Email"
          className="w-full border p-2 rounded mb-2"
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded mb-4"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <button
          onClick={submit}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          {mode === "signin" ? "Sign In" : "Send OTP"}
        </button>
      </div>
    </div>
  );
}