"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "./AuthModal";

  //  API BASE (Production Ready)
const API_BASE =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000"
    : "https://my-shapewear-site.onrender.com";

  //  REUSABLE INPUT
export function AuthInput({
  type = "text",
  placeholder,
  value,
  onChange,
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none transition"
    />
  );
}

  //  REUSABLE BUTTON
export function AuthButton({
  children,
  type = "button",
  onClick,
  loading,
  variant = "primary",
}) {
  const base =
    "w-full py-3 rounded-lg font-semibold transition active:scale-95";

  const styles = {
    primary: "bg-pink-600 text-white hover:bg-pink-700",
    outline: "border border-gray-300 hover:bg-gray-100",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={`${base} ${styles[variant]}`}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}

  //  REUSABLE DIVIDER
  export function AuthDivider() {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-gray-300"></div>
      <span className="text-gray-500 text-sm">OR</span>
      <div className="flex-1 h-px bg-gray-300"></div>
    </div>
  );
}

  //  GOOGLE LOGIN
export function GoogleLoginButton() {
  return (
    <button
      onClick={() => (window.location.href = `${API_BASE}/api/auth/google`)}
      className="w-full border border-gray-300 py-3 rounded-lg hover:bg-gray-100 transition font-medium"
    >
      Continue with Google
    </button>
  );
}

  //  MAIN LOGIN MODAL
export default function LoginModal({ isOpen, onClose }) {
  const { login } = useAuth();

  const [step, setStep] = useState(1);
  const [view, setView] = useState("password");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);

      // COMMON LOGIN HANDLER (FIXED)
  const handleAuthSuccess = (res) => {
    const token = res.data.token;
    const userData =
      res.data.user ||
      {
        name: res.data.name || "User",
        email: res.data.email || identifier,
      };

    localStorage.setItem(
      "userInfo",
      JSON.stringify({ user: userData, token })
    );

    login(userData, token);

    alert("Successfully Logged In ✅");
    onClose();
  };

    //  PASSWORD LOGIN
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setActiveAction("passwordLogin");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/api/users/login`, {
        email: identifier,
        password,
      });

      handleAuthSuccess(res);
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };

    //  SEND OTP
  const sendOTP = async (mode = "login") => {
    setLoading(true);

    try {
      await axios.post(`${API_BASE}/api/auth/login/send-otp`, {
        identifier,
      });

      setView("verifyOtp");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };

      // VERIFY OTP LOGIN
  const handleVerifyOTPLogin = async () => {
    setLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE}/api/auth/login/verify-otp`,
        { identifier, otp }
      );

      handleAuthSuccess(res);
    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };

    //   FORGOT PASSWORD
    //  POST /api/auth/password/forgot
  const forgotPassword = async () => {
    setActiveAction("forgotPassword");
    setLoading(true);

    try {
      await axios.post(`${API_BASE}/api/auth/password/forgot`, {
        identifier,
      });

      setView("verifyForgotOtp");
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };

    //   VERIFY FORGOT OTP
    //  POST /api/auth/password/verify-otp
  const verifyForgotOtp = async () => {
    setActiveAction("verifyForgotOtp");
    setLoading(true);

    try {
      await axios.post(
        `${API_BASE}/api/auth/password/verify-otp`,
        { identifier, otp }
      );

      setView("reset");
    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };

    //  RESET PASSWORD
  const handleResetPassword = async () => {
    if (password !== confirm) {
      return alert("Passwords do not match");
    }

    setActiveAction("resetPassword");
    setLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE}/api/users/reset-password`,
        {
          email: identifier,
          otp,
          password,
        }
      );

      alert("Password changed successfully ✅");

      handleAuthSuccess(res);
    } catch (err) {
      alert(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };

    //  GOOGLE LOGIN
    //  POST /api/auth/google
  // const googleLogin = () => {
  //   window.location.href = `${API_BASE}/api/users/login/google`;
  // };

  return (
    <AuthModal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-5">
        <h2 className="text-2xl font-bold">Login</h2>

        {/* STEP   */}
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
              onChange={(e) => setIdentifier(e.target.value)}
            />

            <AuthButton type="submit">
              Continue
            </AuthButton>

            <AuthDivider />
            <GoogleLoginButton />
          </form>
        )}

        {/* STEP 2 PASSWORD */}
        {step === 2 && view === "password" && (
          <>
            <p className="text-sm text-gray-600">
              {identifier}
            </p>

            <form
              onSubmit={handlePasswordLogin}
              className="space-y-4"
            >
              <AuthInput
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <AuthButton
                type="submit"
                loading={
                  loading &&
                  activeAction === "passwordLogin"
                }
              >
                Login
              </AuthButton>
            </form>

            <div className="text-right">
              <button
                onClick={forgotPassword}
                className="text-sm text-pink-600"
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
                activeAction === "sendLoginOtp"
              }
            >
              Login via OTP
            </AuthButton>
          </>
        )}

        {/* VERIFY OTP LOGIN */}
        {view === "verifyOtp" && (
          <>
            <AuthInput
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <AuthButton
              onClick={verifyLoginOtp}
              loading={
                loading &&
                activeAction === "verifyLoginOtp"
              }
            >
              Verify OTP
            </AuthButton>
          </>
        )}

        {/* VERIFY FORGOT OTP */}
        {view === "verifyForgotOtp" && (
          <>
            <AuthInput
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <AuthButton
              onClick={verifyForgotOtp}
              loading={
                loading &&
                activeAction === "verifyForgotOtp"
              }
            >
              Verify OTP
            </AuthButton>
          </>
        )}

        {view === "reset" && (
          <>
            <AuthInput
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <AuthInput
              type="password"
              placeholder="Confirm Password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />

            <AuthButton
              onClick={resetPassword}
              loading={
                loading &&
                activeAction === "resetPassword"
              }
            >
              Change Password
            </AuthButton>
          </>
        )}
      </div>
      <p className="mt-5 text-sm text-gray-600">
        New user?{" "}
        <span
          onClick={openRegister}
          className="text-pink-600 font-semibold cursor-pointer hover:underline"
        >
          Register
        </span>
      </p>

    </AuthModal>
  );
}
