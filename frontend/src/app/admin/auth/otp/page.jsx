"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function OTPPage() {
  const router = useRouter();

  const [otp, setOtp] = useState("");

  const verify = async () => {
    const data = JSON.parse(
      sessionStorage.getItem("signupData")
    );

    const res = await fetch(`${API}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        otp,
        role:"admin"
      }),
    });

    const result = await res.json();

    if (!res.ok) return alert(result.message);

    localStorage.setItem("adminToken", result.token);
    // localStorage.setItem("adminRole", result.role);

    router.push("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-2xl shadow w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-center">
          Enter OTP
        </h2>

        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full border p-2 rounded mb-4"
          placeholder="OTP"
        />

        <button
          onClick={verify}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Verify OTP
        </button>
      </div>
    </div>
  );
}