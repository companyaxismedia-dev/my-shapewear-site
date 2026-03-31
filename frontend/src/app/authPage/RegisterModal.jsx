"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import AuthModal from "./AuthModal";
import { useAuth } from "@/context/AuthContext";
import {
  AuthButton,
  AuthDivider,
  AuthInput,
  GoogleLoginButton,
} from "./LoginModal";
import { AuthStatusLoader } from "@/components/loaders/Loaders";
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function RegisterModal({ isOpen, onClose, openLogin }) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    otp: "",
  });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState(null);

  const resetForm = () => {
    setStep(1);
    setLoading(false);
    setActiveAction(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      otp: "",
    });
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const setField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const completeAuth = (res) => {
    const token = res.data.token;
    const userData = {
      _id: res.data._id || res.data.user?._id,
      name: res.data.name || res.data.user?.name || formData.name.trim(),
      email:
        res.data.email ||
        res.data.user?.email ||
        formData.email.toLowerCase().trim(),
      role: res.data.role || res.data.user?.role,
      phone: res.data.phone || res.data.user?.phone || formData.phone.trim(),
    };

    login(userData, token, {
      successMessage: "Account created successfully",
      pendingLabel: "Creating your account...",
    });
    onClose();
  };

  const handleGoogleSuccess = async (res) => {
    completeAuth(res);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setActiveAction("sendOtp");

    if (!formData.email.trim() && !formData.phone.trim()) {
      toast.error("Email or phone number is required");
      setLoading(false);
      setActiveAction(null);
      return;
    }

    try {
      const payload = formData.email.trim()
        ? { email: formData.email.toLowerCase().trim() }
        : { phone: formData.phone.trim() };

      await axios.post(`${API_BASE}/api/otp/send`, payload);
      setStep(2);
      toast.success("OTP sent successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setActiveAction("completeRegister");

    try {
      const res = await axios.post(`${API_BASE}/api/auth/register`, {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        otp: formData.otp.trim(),
      });

      completeAuth(res);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Invalid OTP or registration failed"
      );
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };

  return (
    <AuthModal isOpen={isOpen} onClose={onClose}>
      {loading ? (
        <AuthStatusLoader
          className="mb-4"
          title={activeAction === "sendOtp" ? "Sending OTP" : "Creating your account"}
          description="Please wait while we securely process your request."
        />
      ) : null}

      <div className="space-y-5">
        <div className="space-y-2">
          <span className="inline-flex rounded-full border border-[#ecdce0] bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#a0707d]">
            Join Glovia
          </span>
          <div className="space-y-1">
            <h2
              className="text-[32px] leading-none text-[#4a2e35]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Create Account
            </h2>
            <p className="text-sm text-[#876c74]">
              Save your wishlist, track your orders, and enjoy a smoother checkout.
            </p>
          </div>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <AuthInput
              placeholder="Full Name"
              value={formData.name}
              autoComplete="name"
              onChange={(e) => setField("name", e.target.value)}
            />

            <AuthInput
              type="email"
              placeholder="Email Address"
              value={formData.email}
              autoComplete="email"
              onChange={(e) => setField("email", e.target.value)}
            />

            <AuthInput
              placeholder="Phone Number"
              value={formData.phone}
              inputMode="tel"
              autoComplete="tel"
              onChange={(e) => setField("phone", e.target.value)}
            />

            <AuthInput
              type="password"
              placeholder="Create Password"
              value={formData.password}
              autoComplete="new-password"
              onChange={(e) => setField("password", e.target.value)}
            />

            <AuthButton
              type="submit"
              loading={loading && activeAction === "sendOtp"}
              loadingLabel="Sending OTP..."
            >
              Send OTP
            </AuthButton>

            <AuthDivider />

            <GoogleLoginButton onSuccess={handleGoogleSuccess} />
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="rounded-2xl border border-[#f0e1e6] bg-[#fff7f9] px-4 py-3 text-sm text-[#7f666d]">
              OTP sent to{" "}
              <span className="font-semibold text-[#4a2e35]">
                {formData.email || formData.phone}
              </span>
            </div>

            <AuthInput
              placeholder="Enter OTP"
              value={formData.otp}
              inputMode="numeric"
              onChange={(e) => setField("otp", e.target.value)}
            />

            <AuthButton
              type="submit"
              loading={loading && activeAction === "completeRegister"}
              loadingLabel="Creating account..."
            >
              Complete Registration
            </AuthButton>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm font-medium text-[#b95b70] transition hover:text-[#9f4659]"
            >
              Edit details
            </button>
          </form>
        )}
      </div>

      <p className="mt-6 text-sm text-[#80666e]">
        Already have an account?{" "}
        <span
          onClick={openLogin}
          className="cursor-pointer font-semibold text-[#c0566d] transition hover:text-[#a8455a]"
        >
          Login
        </span>
      </p>
    </AuthModal>
  );
}
