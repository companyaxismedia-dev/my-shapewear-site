"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState(""); // Email ke liye
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: Email Entry, 2: OTP Verification
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Backend API URL
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // --- Step 1: Send OTP ---
  const handleInitialLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Backend ab identifier (email) accept karta hai
      const res = await axios.post(`${API_BASE}/api/otp/send`, { 
        email: identifier.toLowerCase().trim()
      });

      // Agar backend success return kare
      if (res.data) {
        setStep(2); 
      }
    } catch (err) {
      setError(err.response?.data?.message || "User not found or Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  // --- Step 2: Final Login with OTP ---
  const handleFinalLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Backend ke login API par email aur otp bhej rahe hain
      const res = await axios.post(`${API_BASE}/api/users/login`, {
        email: identifier.toLowerCase().trim(),
        otp: otp.trim()
      });

      if (res.data) {
        // User data and Token save karein
        localStorage.setItem("userInfo", JSON.stringify(res.data));
        
        // Redirect to Home
        router.push("/");
        
        // Navbar refresh ke liye
        setTimeout(() => {
          router.refresh();
        }, 100);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP or Credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Login</h2>
        <p style={styles.subText}>Enter your email to receive a login code</p>
        
        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={step === 1 ? handleInitialLogin : handleFinalLogin}>
          {step === 1 ? (
            /* STEP 1: Email Input */
            <>
              <input
                type="email"
                placeholder="Registered Email Address"
                style={styles.input}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
              
              <button type="submit" style={styles.button} disabled={loading}>
                {loading ? "SENDING CODE..." : "GET LOGIN CODE"}
              </button>
            </>
          ) : (
            /* STEP 2: OTP Input */
            <>
              <div style={styles.infoBox}>
                OTP sent to: <b>{identifier}</b> <br/>
                <span style={{fontSize: '11px', color: '#666'}}>
                  (Check your Email Inbox)
                </span>
              </div>
              <input
                type="text"
                placeholder="Enter 6-Digit OTP"
                style={styles.input}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
              />
              <button type="submit" style={styles.button} disabled={loading}>
                {loading ? "VERIFYING..." : "SECURE LOGIN"}
              </button>
              <p onClick={() => {setStep(1); setError("");}} style={styles.backLink}>
                ← Use different email
              </p>
            </>
          )}
        </form>

        <p style={styles.footerLink}>
          New to Glovia? <Link href="/register" style={{ color: "#E91E63", fontWeight: "bold" }}>Register Now</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { height: "90vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fef1f5" },
  card: { width: "380px", padding: "40px", backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", textAlign: "center" },
  heading: { fontSize: "26px", color: "#333", marginBottom: "8px", fontWeight: '800' },
  subText: { fontSize: "14px", color: "#777", marginBottom: "25px" },
  input: { width: "100%", padding: "14px", margin: "10px 0", border: "1px solid #eee", borderRadius: "8px", fontSize: "14px", outlineColor: "#E91E63", backgroundColor: '#fafafa' },
  button: { width: "100%", padding: "15px", backgroundColor: "#E91E63", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", marginTop: "15px", fontSize: "15px" },
  errorBox: { backgroundColor: "#ffebee", color: "#c62828", padding: "12px", borderRadius: "8px", fontSize: "12px", marginBottom: "15px", border: "1px solid #ffcdd2" },
  infoBox: { backgroundColor: "#f0f7ff", color: "#004085", padding: "12px", borderRadius: "8px", fontSize: "13px", marginBottom: "15px", border: "1px solid #b8daff", textAlign: 'left' },
  footerLink: { marginTop: "25px", fontSize: "14px", color: "#888" },
  backLink: { cursor: 'pointer', fontSize: '12px', marginTop: '20px', color: '#666', textDecoration: 'underline' }
};