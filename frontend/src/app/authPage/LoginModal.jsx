"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "./AuthModal";
import { GoogleLogin } from "@react-oauth/google";
import {
  AuthStatusLoader,
  ButtonLoaderLabel,
} from "@/components/loaders/Loaders";
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const toOtpDigits = (value = "") => value.replace(/\D/g, "").slice(0, 6);

/* ================= REUSABLE INPUT ================= */
export function AuthInput({
  type = "text",
  placeholder,
  value,
  onChange,
  inputMode,
  autoComplete,
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      inputMode={inputMode}
      autoComplete={autoComplete}
      required
      className="w-full rounded-[18px] border border-[#e6d4d9] bg-white/95 px-4 py-3.5 text-[15px] text-[#4f3940] placeholder:text-[#a89198] outline-none transition focus:border-[#c56f7f] focus:ring-4 focus:ring-[#f4dde3]"
    />
  );
}

/* ================= REUSABLE BUTTON ================= */
export function AuthButton({
  children,
  type = "button",
  onClick,
  loading,
  loadingLabel = "Please wait...",
  variant = "primary",
}) {
  const base =
    "flex w-full items-center justify-center rounded-[18px] px-4 py-3.5 text-[15px] font-semibold tracking-[0.02em] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-75";

  const styles = {
    primary:
      "bg-[linear-gradient(135deg,#c56f7f_0%,#e48398_100%)] text-white shadow-[0_16px_32px_rgba(197,111,127,0.24)] hover:brightness-[1.03]",
    outline:
      "border border-[#d9c1c9] bg-white text-[#6e525a] hover:border-[#c56f7f] hover:bg-[#fff5f8]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={`${base} ${styles[variant]}`}
    >
      {loading ? <ButtonLoaderLabel label={loadingLabel} /> : children}
    </button>
  );
}

/* ================= DIVIDER ================= */
export function AuthDivider() {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="h-px flex-1 bg-[#eadde1]"></div>
      <span className="text-xs font-medium uppercase tracking-[0.32em] text-[#9b8189]">
        Or
      </span>
      <div className="h-px flex-1 bg-[#eadde1]"></div>
    </div>
  );
}

/* ================= GOOGLE LOGIN BUTTON ================= */
export function GoogleLoginButton({ onSuccess }) {
  const { startAuthTransition, stopAuthTransition } = useAuth();

  return (
    <div className="w-full rounded-[18px] border border-[#e6d4d9] bg-white shadow-[0_8px_20px_rgba(74,46,53,0.04)] p-[1px]">
      <div className="w-full overflow-hidden rounded-[17px]">
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            startAuthTransition("Signing you in...");

            try {
              const res = await axios.post(
                `${API_BASE}/api/auth/google`,
                { credential: credentialResponse.credential }
              );
              onSuccess(res);
            } catch (error) {
              stopAuthTransition();
              toast.error(error.response?.data?.message || "Google login failed");
            }
          }}
          onError={() => {
            stopAuthTransition();
            toast.error("Google Login Failed");
          }}
          width="100%"
          size="large"
          shape="rectangular"
          theme="outline"
        />
      </div>
    </div>
  );
}

/* ================= MAIN LOGIN MODAL ================= */
export default function LoginModal({
  isOpen,
  onClose,
  openRegister,
}) {
  const { login, startAuthTransition, stopAuthTransition } = useAuth();

  const [step, setStep] = useState(1);
  const [view, setView] = useState("password");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState(null);

  const resetForm = () => {
    setStep(1);
    setView("password");
    setIdentifier("");
    setPassword("");
    setOtp("");
    setConfirm("");
    setLoading(false);
    setActiveAction(null);
  };

  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen]);

  /* ===== SUCCESS HANDLER ===== */
  const handleAuthSuccess = (res) => {
    const token = res.data.token;

    const userData = {
      _id: res.data._id,
      name: res.data.name,
      email: res.data.email,
      role: res.data.role,
    };

    login(userData, token, {
      successMessage: "Successfully logged in",
      pendingLabel: "Signing you in...",
    });
    onClose();
  };

  /* ===== PASSWORD LOGIN ===== */
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setActiveAction("passwordLogin");
    setLoading(true);
    startAuthTransition("Signing you in...");
    let didCompleteAuth = false;

    try {
      const clean = identifier.trim();

      const payload = clean.includes("@")
        ? { email: clean.toLowerCase(), password }
        : { phone: clean, password };

      const res = await axios.post(
        `${API_BASE}/api/auth/login`,
        payload
      );

      handleAuthSuccess(res);
      didCompleteAuth = true;
    } catch (err) {
      stopAuthTransition();
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      if (!didCompleteAuth) {
        setLoading(false);
        setActiveAction(null);
      }
    }
  };

  /* ===== SEND LOGIN OTP ===== */
  const sendLoginOtp = async () => {
    setActiveAction("sendLoginOtp");
    setLoading(true);
    startAuthTransition("Sending OTP...");

    try {
      const clean = identifier.trim();

      const payload = clean.includes("@")
        ? { email: clean.toLowerCase() }
        : { phone: clean };

      await axios.post(
        `${API_BASE}/api/auth/login/send-otp`,
        payload
      );

      setView("verifyOtp");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
      setActiveAction(null);
      stopAuthTransition();
    }
  };

  /* ===== VERIFY LOGIN OTP ===== */
  const verifyLoginOtp = async () => {
    setActiveAction("verifyLoginOtp");
    setLoading(true);
    startAuthTransition("Signing you in...");
    let didCompleteAuth = false;

    try {
      const clean = identifier.trim();

      const payload = clean.includes("@")
        ? { email: clean.toLowerCase(), otp: otp.trim() }
        : { phone: clean, otp: otp.trim() };

      const res = await axios.post(
        `${API_BASE}/api/auth/login/verify-otp`,
        payload
      );

      handleAuthSuccess(res);
      didCompleteAuth = true;
    } catch (err) {
      stopAuthTransition();
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      if (!didCompleteAuth) {
        setLoading(false);
        setActiveAction(null);
      }
    }
  };

  /* ===== FORGOT PASSWORD ===== */
  const forgotPassword = async () => {
    setActiveAction("forgotPassword");
    setLoading(true);
    startAuthTransition("Verifying your account...");

    try {
      const clean = identifier.trim();

      const payload = clean.includes("@")
        ? { email: clean.toLowerCase() }
        : { phone: clean };

      await axios.post(
        `${API_BASE}/api/auth/password/forgot`,
        payload
      );

      setView("verifyForgotOtp");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
      setActiveAction(null);
      stopAuthTransition();
    }
  };

  /* ===== VERIFY FORGOT OTP ===== */
  const verifyForgotOtp = async () => {
    setActiveAction("verifyForgotOtp");
    setLoading(true);
    startAuthTransition("Verifying your account...");

    try {
      const clean = identifier.trim();

      const payload = clean.includes("@")
        ? { email: clean.toLowerCase(), otp: otp.trim() }
        : { phone: clean, otp: otp.trim() };

      const res = await axios.post(
        `${API_BASE}/api/auth/password/verify-otp`,
        payload
      );

      localStorage.setItem(
        "resetToken",
        res.data.resetToken
      );

      setView("reset");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
      setActiveAction(null);
      stopAuthTransition();
    }
  };

  /* ===== RESET PASSWORD ===== */
  const resetPassword = async () => {
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    setActiveAction("resetPassword");
    setLoading(true);
    startAuthTransition("Updating your password...");
    let didCompleteAuth = false;

    try {
      const resetToken =
        localStorage.getItem("resetToken");

      const res = await axios.post(
        `${API_BASE}/api/auth/password/reset`,
        {
          resetToken,
          newPassword: password,
        }
      );

      localStorage.removeItem("resetToken");

      handleAuthSuccess(res);
      didCompleteAuth = true;
    } catch (err) {
      stopAuthTransition();
      toast.error(err.response?.data?.message || "Reset failed");
    } finally {
      if (!didCompleteAuth) {
        setLoading(false);
        setActiveAction(null);
      }
    }
  };

  return (
    <AuthModal isOpen={isOpen} onClose={onClose}>
      {loading ? (
        <AuthStatusLoader
          className="mb-4"
          title={
            activeAction === "passwordLogin" || activeAction === "verifyLoginOtp"
              ? "Signing you in"
              : activeAction === "sendLoginOtp"
                ? "Sending OTP"
                : activeAction === "forgotPassword" || activeAction === "verifyForgotOtp"
                  ? "Verifying your account"
                  : "Updating your password"
          }
          description="Please wait while we securely process your request."
        />
      ) : null}

      <div className="space-y-5">
        <div className="space-y-2">
          <div className="space-y-1">
            <h2
              className="text-[34px] leading-none text-[#4a2e35]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Login
            </h2>
            <p className="text-sm text-[#876c74]">
              Access your wishlist, saved bag, orders, and exclusive offers.
            </p>
          </div>
        </div>

        {step === 1 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!identifier.trim()) return;
              setStep(2);
            }}
            className="space-y-4"
          >
            <AuthInput
              placeholder="Email or Mobile Number"
              value={identifier}
              inputMode="email"
              autoComplete="username"
              onChange={(e) => setIdentifier(e.target.value)}
            />

            <AuthButton type="submit">
              Continue
            </AuthButton>

            <AuthDivider />

            <GoogleLoginButton
              onSuccess={handleAuthSuccess}
            />
          </form>
        )}

        {step === 2 && view === "password" && (
          <>
            <p className="rounded-2xl border border-[#f0e1e6] bg-[#fff7f9] px-4 py-3 text-sm text-[#7f666d]">
              Signing in as <span className="font-semibold text-[#4a2e35]">{identifier}</span>
            </p>

            <form
              onSubmit={handlePasswordLogin}
              className="space-y-4"
            >
              <AuthInput
                type="password"
                placeholder="Password"
                value={password}
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
              />

            <AuthButton
              type="submit"
              loading={
                loading &&
                  activeAction ===
                    "passwordLogin"
              }
              loadingLabel="Signing in..."
            >
              Login
            </AuthButton>
            </form>

            <div className="text-right">
              <button
                type="button"
                onClick={forgotPassword}
                className="text-sm font-medium text-[#b95b70] transition hover:text-[#9f4659]"
              >
                Forgot Password?
              </button>
            </div>

            <AuthDivider />

            <AuthButton
              variant="outline"
              onClick={sendLoginOtp}
              loading={
                loading &&
                  activeAction ===
                    "sendLoginOtp"
              }
              loadingLabel="Sending OTP..."
            >
              Login via OTP
            </AuthButton>
          </>
        )}

        {view === "verifyOtp" && (
          <div className="space-y-4">
            <p className="rounded-2xl border border-[#f0e1e6] bg-[#fff7f9] px-4 py-3 text-sm text-[#7f666d]">
              Enter the OTP sent to <span className="font-semibold text-[#4a2e35]">{identifier}</span>
            </p>
            <AuthInput
              placeholder="Enter OTP"
              value={otp}
              inputMode="numeric"
              onChange={(e) => setOtp(toOtpDigits(e.target.value))}
            />

            <AuthButton
              onClick={verifyLoginOtp}
              loading={
                loading &&
                  activeAction ===
                    "verifyLoginOtp"
              }
              loadingLabel="Verifying OTP..."
            >
              Verify OTP
            </AuthButton>
          </div>
        )}

        {view === "verifyForgotOtp" && (
          <div className="space-y-4">
            <p className="rounded-2xl border border-[#f0e1e6] bg-[#fff7f9] px-4 py-3 text-sm text-[#7f666d]">
              Verify the OTP to reset your password for <span className="font-semibold text-[#4a2e35]">{identifier}</span>
            </p>
            <AuthInput
              placeholder="Enter OTP"
              value={otp}
              inputMode="numeric"
              onChange={(e) => setOtp(toOtpDigits(e.target.value))}
            />

            <AuthButton
              onClick={verifyForgotOtp}
              loading={
                loading &&
                  activeAction ===
                    "verifyForgotOtp"
              }
              loadingLabel="Verifying OTP..."
            >
              Verify OTP
            </AuthButton>
          </div>
        )}

        {view === "reset" && (
          <div className="space-y-4">
            <AuthInput
              type="password"
              placeholder="New Password"
              value={password}
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <AuthInput
              type="password"
              placeholder="Confirm Password"
              value={confirm}
              autoComplete="new-password"
              onChange={(e) => setConfirm(e.target.value)}
            />

            <AuthButton
              onClick={resetPassword}
              loading={
                loading &&
                  activeAction ===
                    "resetPassword"
              }
              loadingLabel="Updating password..."
            >
              Change Password
            </AuthButton>
          </div>
        )}
      </div>

      <p className="mt-6 text-sm text-[#80666e]">
        New user?{" "}
        <span
          onClick={openRegister}
          className="cursor-pointer font-semibold text-[#c0566d] transition hover:text-[#a8455a]"
        >
          Register
        </span>
      </p>
    </AuthModal>
  );
}
