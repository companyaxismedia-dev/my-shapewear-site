"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    password: "", 
    otp: "" 
  });
  const [step, setStep] = useState(1); // 1 for Details, 2 for OTP
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Is line ko replace karein
const API_BASE = typeof window !== "undefined" && 
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000" 
    : "https://my-shapewear-site.onrender.com";
    
  // --- Step 1: Request OTP ---
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic Validation
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      // Sirf Email bhej rahe hain kyunki backend ab email identifier use kar raha hai
      const res = await axios.post(`${API_BASE}/api/otp/send`, { 
        email: formData.email.toLowerCase().trim()
      });
      
      if (res.data) {
        setStep(2); // OTP screen dikhao
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Check if Backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // --- Step 2: Verify OTP & Create Account ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Sabhi fields (name, email, phone, password, otp) bhejna zaroori hai
      const res = await axios.post(`${API_BASE}/api/users/register`, {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        otp: formData.otp.trim()
      });
      
      if (res.data) {
        localStorage.setItem("userInfo", JSON.stringify(res.data));
        router.push("/"); 
        router.refresh(); 
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP or Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Create Account</h2>
        <p style={styles.subText}>Verified Signup for Glovia Glamour</p>
        
        {error && <div style={styles.errorBox}>{error}</div>}

        {step === 1 ? (
          /* DETAILS FORM */
          <form onSubmit={handleSendOTP}>
            <input 
              type="text" placeholder="Full Name" style={styles.input} 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})} required 
            />
            <input 
              type="email" placeholder="Email Address" style={styles.input} 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})} required 
            />
            <input 
              type="text" placeholder="Phone Number" style={styles.input} 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})} required 
            />
            <input 
              type="password" placeholder="Set Password" style={styles.input} 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})} required 
            />
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "SENDING CODE..." : "SEND VERIFICATION CODE"}
            </button>
          </form>
        ) : (
          /* OTP VERIFICATION FORM */
          <form onSubmit={handleRegister}>
            <div style={styles.infoBox}>
               Verification code sent to:<br/>
               <b>{formData.email}</b>
            </div>
            
            <input 
              type="text" placeholder="Enter 6-Digit OTP" style={styles.input} 
              value={formData.otp}
              onChange={(e) => setFormData({...formData, otp: e.target.value})} required 
              maxLength={6}
            />
            
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "VERIFYING..." : "COMPLETE REGISTRATION"}
            </button>
            
            <p onClick={() => {setStep(1); setError("");}} style={styles.backLink}>
              ← Edit details
            </p>
          </form>
        )}

        <p style={styles.footerLink}>
          Already have an account? <Link href="/login" style={{ color: "#E91E63", fontWeight: "bold" }}>Login</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
    container: { height: "90vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fef1f5" },
    card: { width: "400px", padding: "40px", backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 10px 40px rgba(0,0,0,0.08)", textAlign: "center" },
    heading: { fontSize: "28px", color: "#333", marginBottom: "8px", fontWeight: "800" },
    subText: { fontSize: "14px", color: "#777", marginBottom: "25px" },
    input: { width: "100%", padding: "14px", margin: "10px 0", border: "1px solid #eee", borderRadius: "8px", fontSize: "14px", outlineColor: "#E91E63", backgroundColor: "#fcfcfc" },
    button: { width: "100%", padding: "15px", backgroundColor: "#E91E63", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", marginTop: "15px", fontSize: "15px" },
    errorBox: { color: "#c62828", backgroundColor: "#ffebee", padding: "12px", borderRadius: "8px", fontSize: "13px", marginBottom: "20px", border: "1px solid #ffcdd2" },
    infoBox: { fontSize: "13px", color: "#555", backgroundColor: "#f0f7ff", padding: "12px", borderRadius: "8px", marginBottom: "15px", border: "1px solid #d0e3ff" },
    backLink: { cursor: 'pointer', fontSize: '13px', marginTop: '20px', color: '#666', textDecoration: 'underline' },
    footerLink: { marginTop: "25px", fontSize: "14px", color: "#888" }
};