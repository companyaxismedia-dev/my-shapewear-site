"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import AuthModal from "./AuthModal";
import { useAuth } from "@/context/AuthContext";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

export default function RegisterModal({ isOpen, onClose, openLogin }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    otp: "",
  });

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const {googleAuth} = useGoogleAuth();

  const resetForm = () => {
    setStep(1);
    setError("");
    setLoading(false);
  };

  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen]);

  const API_BASE =
    typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1")
      ? "http://localhost:5000"
      : "https://my-shapewear-site.onrender.com";

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/api/otp/send`, {
        email: formData.email.toLowerCase().trim(),
      });

      if (res.data) setStep(2);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to send OTP. Check if Backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_BASE}/api/users/register`, {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        otp: formData.otp.trim(),
      });

      if (res.data) {
        localStorage.setItem("userInfo", JSON.stringify(res.data));
        login(
          {
            name: res.data.user?.name || formData.name,
            email: res.data.user?.email || formData.email,
          },
          res.data.token || null
        );

        onClose();
        router.push("/");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Invalid OTP or Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthModal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-[28px] text-[#333] mb-2 font-extrabold">
        Create Account
      </h2>

      <p className="text-[14px] text-[#777] mb-[20px]">
        Verified Signup for Glovia Glamour
      </p>

      {error && (
        <div className="text-[#c62828] bg-[#ffebee] p-3 rounded-[8px] text-[13px] mb-5 border border-[#ffcdd2]">
          {error}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleSendOTP}>
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-[8px] my-[7px] border border-[#eee] rounded-[8px] text-[14px] bg-[#fcfcfc] focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
          />

          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-[9px] my-[7px] border border-[#eee] rounded-[8px] text-[14px] bg-[#fcfcfc] focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />

          <input
            type="text"
            placeholder="Phone Number"
            className="w-full p-[9px] my-[8px] border border-[#eee] rounded-[8px] text-[14px] bg-[#fcfcfc] focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            required
          />

          <input
            type="password"
            placeholder="Set Password"
            className="w-full p-[9px] my-[8px] border border-[#eee] rounded-[8px] text-[14px] bg-[#fcfcfc] focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />
          <div className="flex justify-between items-center mt-[10px] gap-3">

            <button
              type="submit"
              disabled={loading}
              className="w-1/2 p-[9px] bg-[#E91E63] text-white rounded-[8px] font-bold cursor-pointer text-[14px] disabled:opacity-70"
            >
              {/* {loading ? "SENDING CODE..." : "SEND VERIFICATION CODE"} */}
              {loading ? "SENDING CODE..." : "SIGN UP"}
            </button>

            <button
              type="button"
              className="w-1/2 p-[10px] border border-gray-300 rounded-[8px] text-[13px] cursor-pointer font-semibold hover:bg-gray-50 transition"
              onClick={googleAuth}
            >
              Sign in via Google
            </button>

          </div>

        </form>
      ) : (
        <form onSubmit={handleRegister}>
          <div className="text-[13px] text-[#555] bg-[#f0f7ff] p-3 rounded-[8px] mb-[15px] border border-[#d0e3ff]">
            {/* Verification code sent to: */}
            <br />
            <b>{formData.email}</b>
          </div>

          <input
            type="text"
            placeholder="Enter 6-Digit OTP"
            className="w-full p-[14px] my-[10px] border border-[#eee] rounded-[8px] text-[14px] bg-[#fcfcfc] focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
            value={formData.otp}
            onChange={(e) =>
              setFormData({ ...formData, otp: e.target.value })
            }
            required
            maxLength={6}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full p-[15px] bg-[#E91E63] text-white border-none rounded-[8px] font-bold cursor-pointer mt-[15px] text-[15px] disabled:opacity-70"
          >
            {loading ? "VERIFYING..." : "COMPLETE REGISTRATION"}
          </button>

          <p
            onClick={() => {
              setStep(1);
              setError("");
            }}
            className="cursor-pointer text-[13px] mt-[20px] text-[#666] underline"
          >
            ← Edit details
          </p>
        </form>
      )}

      <p className="mt-[25px] text-[14px] text-[#888]">
        Already have an account?{" "}
        <span
          onClick={openLogin}
          className="text-[#E91E63] font-bold cursor-pointer"
        >
          Login
        </span>
      </p>
    </AuthModal>
  );


}
