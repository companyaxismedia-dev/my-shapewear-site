"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import AuthModal from "./AuthModal";
import { useAuth } from "@/context/AuthContext";

export default function LoginModal({ isOpen, onClose, openRegister }) {
  const [step, setStep] = useState(1);
  const [loginMethod, setLoginMethod] = useState("password"); 
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  const API_BASE =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
      ? "http://localhost:5000"
      : "https://my-shapewear-site.onrender.com";

  // STEP 1 → Continue
  const handleContinue = (e) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    setStep(2);
  };

  // PASSWORD LOGIN 
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setIdentifier()

    try {
      const res = await axios.post(`${API_BASE}/api/users/login-password`, {
        identifier,
        password,
      });

      login(res.data.user, res.data.token);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    } 
  };

  // OTP SEND
  const handleSendOtp = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/otp/send`, { identifier });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // OTP VERIFY
  const handleOtpLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/users/login-otp`, {
        identifier,
        otp,
      });

      login(res.data.user, res.data.token);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      await axios.post(`${API_BASE}/api/otp/resend`, { identifier });
      alert("OTP Resent");
    } catch (err) {
      alert("Failed to resend OTP");
    }
  };

  return (
    <AuthModal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-2xl font-bold mb-6">Login</h2>

      {error && (
        <div className="mb-4 bg-red-100 text-red-600 px-3 py-2 rounded">
          {error}
        </div>
      )}

      {/* STEP 1 - IDENTIFIER */}
      {step === 1 && (
        <form onSubmit={handleContinue} className="space-y-4">
          <input
            type="text"
            placeholder="Email or Mobile Number"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-pink-500"
          />

          <button className="w-full bg-pink-600 text-white py-3 rounded-lg">
            Continue
          </button>

          <div className="flex items-center gap-2 my-4">
            <hr className="flex-1" />
            <span className="text-sm text-gray-500">OR</span>
            <hr className="flex-1" />
          </div>

          <button
            type="button"
            className="w-full border py-3 rounded-lg font-semibold"
            onClick={() => router.push("/api/auth/google")}
          >
            Login with Google
          </button>
        </form>
      )}

      {/* STEP 2 - CHOOSE METHOD */}
      {step === 2 && (
        <div className="space-y-4">
          <button
            className="w-full bg-pink-600 text-white py-3 rounded-lg"
            onClick={() => setLoginMethod("password")}
          >
            Login via Password
          </button>

          <div className="flex items-center gap-2 my-2">
            <hr className="flex-1" />
            <span className="text-sm text-gray-500">OR</span>
            <hr className="flex-1" />
          </div>

          <button
            className="w-full border py-3 rounded-lg"
            onClick={() => {
              setLoginMethod("otp");
              handleSendOtp();
            }}
          >
            Login via OTP
          </button>

          {loginMethod === "password" && (
            <form onSubmit={handlePasswordLogin} className="space-y-3 mt-4">
              <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border px-4 py-3 rounded-lg"
              />

              <button className="w-full bg-pink-600 text-white py-3 rounded-lg">
                {loading ? "Logging in..." : "Login"}
              </button>

              <div className="text-right text-sm text-pink-600 cursor-pointer">
                Forgot Password?
              </div>
            </form>
          )}
        </div>
      )}

      {/* STEP 3 - OTP LOGIN */}
      {step === 3 && loginMethod === "otp" && (
        <form onSubmit={handleOtpLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            maxLength={6}
            className="w-full border px-4 py-3 rounded-lg text-center tracking-widest"
          />

          <button className="w-full bg-pink-600 text-white py-3 rounded-lg">
            {loading ? "Verifying..." : "Verify & Login"}
          </button>

          <div
            className="text-sm text-pink-600 text-center cursor-pointer"
            onClick={resendOtp}
          >
            Resend OTP
          </div>
        </form>
      )}

      <p className="mt-6 text-sm text-center">
        New user?{" "}
        <span
          onClick={openRegister}
          className="text-pink-600 font-bold cursor-pointer"
        >
          Register
        </span>
      </p>
    </AuthModal>
  );
}
