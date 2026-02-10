"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthModal from "./AuthModal";
import { useAuth } from "@/context/AuthContext";

export default function LoginModal({ isOpen, onClose, openRegister }) {
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
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

  const handleInitialLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post(`${API_BASE}/api/otp/send`, {
        email: identifier.toLowerCase().trim(),
      });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_BASE}/api/users/login`, {
        email: identifier.toLowerCase().trim(),
        otp: otp.trim(),
      });

      localStorage.setItem("userInfo", JSON.stringify(res.data));
      login(
        {
          name: res.data.user?.name || res.data.name || "User",
          email: res.data.user?.email || identifier,
        },
        res.data.token || null
      );

      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthModal isOpen={isOpen} onClose={onClose}>
      <h2 style={styles.heading}>Login</h2>
      <p style={styles.subText}>Secure OTP based login</p>

      {error && <div style={styles.errorBox}>{error}</div>}

      <form onSubmit={step === 1 ? handleInitialLogin : handleFinalLogin}>
        {step === 1 ? (
          <>
            <input
              type="email"
              placeholder="Registered Email"
              style={styles.input}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
            <button style={styles.button} disabled={loading}>
              {loading ? "SENDING..." : "GET LOGIN CODE"}
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              style={styles.input}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
            />
            <button style={styles.button} disabled={loading}>
              {loading ? "VERIFYING..." : "LOGIN"}
            </button>
          </>
        )}
      </form>

      <p style={styles.footer}>
        New user?{" "}
        <span onClick={openRegister} style={styles.link}>
          Register
        </span>
      </p>
    </AuthModal>
  );
}

const styles = {
  heading: { fontSize: 26, fontWeight: 800 },
  subText: { fontSize: 14, color: "#777", marginBottom: 20 },
  input: {
    width: "100%",
    padding: 14,
    marginBottom: 12,
    borderRadius: 8,
    border: "1px solid #eee",
  },
  button: {
    width: "100%",
    padding: 14,
    backgroundColor: "#E91E63",
    color: "#fff",
    borderRadius: 8,
    border: "none",
    fontWeight: "bold",
  },
  errorBox: {
    background: "#ffebee",
    color: "#c62828",
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  footer: { marginTop: 20, fontSize: 14 },
  link: { color: "#E91E63", fontWeight: "bold", cursor: "pointer" },
};
