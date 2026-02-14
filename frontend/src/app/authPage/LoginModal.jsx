// "use client";

// import { useState } from "react";
// import { GoogleLogin } from "@react-oauth/google";
// import axios from "axios";
// import { useAuth } from "@/context/AuthContext";
// import AuthModal from "./AuthModal";

// const API_BASE =
//   typeof window !== "undefined" &&
//   (window.location.hostname === "localhost" ||
//     window.location.hostname === "127.0.0.1")
//     ? "http://localhost:5000"
//     : "https://my-shapewear-site.onrender.com";

// /* ================= REUSABLE INPUT ================= */
// export function AuthInput({
//   type = "text",
//   placeholder,
//   value,
//   onChange,
// }) {
//   return (
//     <input
//       type={type}
//       placeholder={placeholder}
//       value={value}
//       onChange={onChange}
//       required
//       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none transition"
//     />
//   );
// }

// /* ================= REUSABLE BUTTON ================= */
// export function AuthButton({
//   children,
//   type = "button",
//   onClick,
//   loading,
//   variant = "primary",
// }) {
//   const base =
//     "w-full py-3 rounded-lg font-semibold transition active:scale-95";

//   const styles = {
//     primary: "bg-pink-600 text-white hover:bg-pink-700",
//     outline: "border border-gray-300 hover:bg-gray-100",
//   };

//   return (
//     <button
//       type={type}
//       onClick={onClick}
//       disabled={loading}
//       className={`${base} ${styles[variant]}`}
//     >
//       {loading ? "Please wait..." : children}
//     </button>
//   );
// }

// /* ================= DIVIDER ================= */
// export function AuthDivider() {
//   return (
//     <div className="flex items-center gap-3 my-4">
//       <div className="flex-1 h-px bg-gray-300"></div>
//       <span className="text-gray-500 text-sm">OR</span>
//       <div className="flex-1 h-px bg-gray-300"></div>
//     </div>
//   );
// }

// /* ================= GOOGLE LOGIN BUTTON ================= */
// export function GoogleLoginButton({ onSuccess }) {
//   return (
//     <div className="w-full">
//       <GoogleLogin
//         onSuccess={async (credentialResponse) => {
//           try {
//             const res = await axios.post(
//               `${API_BASE}/api/users/login/google`,
//               {
//                 credential: credentialResponse.credential,
//               }
//             );

//             onSuccess(res);
//           } catch (error) {
//             alert(
//               error.response?.data?.message ||
//                 "Google login failed"
//             );
//           }
//         }}
//         onError={() => {
//           alert("Google Login Failed");
//         }}
//       />
//     </div>
//   );
// }

// /* ================= MAIN LOGIN MODAL ================= */
// export default function LoginModal({ isOpen, onClose }) {
//   const { login } = useAuth();

//   const [step, setStep] = useState(1);
//   const [view, setView] = useState("password");

//   const [identifier, setIdentifier] = useState("");
//   const [password, setPassword] = useState("");
//   const [otp, setOtp] = useState("");
//   const [confirm, setConfirm] = useState("");
//   const [loading, setLoading] = useState(false);

//   /* ===== COMMON SUCCESS HANDLER ===== */
//   const handleAuthSuccess = (res) => {
//     const token = res.data.token;

//     const userData = {
//       _id: res.data._id,
//       name: res.data.name,
//       email: res.data.email,
//       role: res.data.role,
//     };

//     localStorage.setItem(
//       "userInfo",
//       JSON.stringify({
//         user: userData,
//         token,
//       })
//     );

//     login(userData, token);

//     alert("Successfully Logged In ✅");
//     onClose();
//   };

//   /* ===== PASSWORD LOGIN ===== */
//   const handlePasswordLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const res = await axios.post(
//         `${API_BASE}/api/auth/login`,
//         {
//           email: identifier,
//           password,
//         }
//       );

//       handleAuthSuccess(res);
//     } catch (err) {
//       alert(err.response?.data?.message || "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ===== SEND OTP ===== */
//   const sendOTP = async (mode = "login") => {
//     setLoading(true);
//     try {
//       await axios.post(`${API_BASE}/api/otp/send`, {
//         email: identifier,
//       });

//       setView(mode === "forgot" ? "verifyForgotOtp" : "verifyOtp");
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to send OTP");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ===== VERIFY OTP LOGIN ===== */
//   const handleVerifyOTPLogin = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.post(`${API_BASE}/api/users/login`, {
//         email: identifier,
//         otp,
//       });

//       handleAuthSuccess(res);
//     } catch (err) {
//       alert(err.response?.data?.message || "Invalid OTP");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ===== RESET PASSWORD ===== */
//   const handleResetPassword = async () => {
//     if (password !== confirm) {
//       return alert("Passwords do not match");
//     }

//     setLoading(true);

//     try {
//       await axios.post(
//         `${API_BASE}/api/users/reset-password`,
//         {
//           email: identifier,
//           otp,
//           newPassword: password,
//         }
//       );

//       alert("Password changed successfully ✅");
//       setView("password");
//     } catch (err) {
//       alert(err.response?.data?.message || "Reset failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <AuthModal isOpen={isOpen} onClose={onClose}>
//       <div className="space-y-5">
//         <h2 className="text-2xl font-bold">Login</h2>

//         {step === 1 && (
//           <form
//             onSubmit={(e) => {
//               e.preventDefault();
//               setStep(2);
//             }}
//             className="space-y-4"
//           >
//             <AuthInput
//               placeholder="Email or Mobile Number"
//               value={identifier}
//               onChange={(e) => setIdentifier(e.target.value)}
//             />

//             <AuthButton type="submit">Continue</AuthButton>

//             <AuthDivider />

//             <GoogleLoginButton
//               onSuccess={handleAuthSuccess}
//             />
//           </form>
//         )}

//         {step === 2 && view === "password" && (
//           <>
//             <form
//               onSubmit={handlePasswordLogin}
//               className="space-y-4"
//             >
//               <AuthInput
//                 placeholder="Email"
//                 value={identifier}
//                 onChange={(e) => setIdentifier(e.target.value)}
//               />

//               <AuthInput
//                 type="password"
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />

//               <AuthButton type="submit" loading={loading}>
//                 Login
//               </AuthButton>
//             </form>

//             <div className="text-right">
//               <button
//                 onClick={() => sendOTP("forgot")}
//                 className="text-sm text-pink-600"
//               >
//                 Forgot Password?
//               </button>
//             </div>

//             <AuthDivider />

//             <AuthButton
//               variant="outline"
//               onClick={() => sendOTP("login")}
//             >
//               Login via OTP
//             </AuthButton>
//           </>
//         )}

//         {view === "verifyOtp" && (
//           <>
//             <AuthInput
//               placeholder="Enter OTP"
//               value={otp}
//               onChange={(e) => setOtp(e.target.value)}
//             />

//             <AuthButton
//               onClick={handleVerifyOTPLogin}
//               loading={loading}
//             >
//               Verify OTP
//             </AuthButton>
//           </>
//         )}

//         {view === "verifyForgotOtp" && (
//           <>
//             <AuthInput
//               placeholder="Enter OTP"
//               value={otp}
//               onChange={(e) => setOtp(e.target.value)}
//             />

//             <AuthButton
//               onClick={() => setView("reset")}
//             >
//               Verify OTP
//             </AuthButton>
//           </>
//         )}

//         {view === "reset" && (
//           <>
//             <AuthInput
//               type="password"
//               placeholder="New Password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />
//             <AuthInput
//               type="password"
//               placeholder="Confirm Password"
//               value={confirm}
//               onChange={(e) => setConfirm(e.target.value)}
//             />

//             <AuthButton
//               onClick={handleResetPassword}
//               loading={loading}
//             >
//               Change Password
//             </AuthButton>
//           </>
//         )}
//       </div>
//     </AuthModal>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "./AuthModal";
import { GoogleLogin } from "@react-oauth/google";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;



/* ================= REUSABLE INPUT ================= */
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

/* ================= REUSABLE BUTTON ================= */
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

/* ================= DIVIDER ================= */
export function AuthDivider() {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-gray-300"></div>
      <span className="text-gray-500 text-sm">OR</span>
      <div className="flex-1 h-px bg-gray-300"></div>
    </div>
  );
}

/* ================= GOOGLE LOGIN BUTTON (UPDATED) ================= */
<<<<<<< HEAD
=======
/* ================= GOOGLE LOGIN BUTTON ================= */
>>>>>>> main
export function GoogleLoginButton({ onSuccess }) {
  return (
    <div className="w-full flex justify-center">
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          try {
            const res = await axios.post(
              `${API_BASE}/api/auth/google`,
              {
                credential: credentialResponse.credential,
              }
            );

            onSuccess(res);
          } catch (error) {
            alert(
              error.response?.data?.message ||
                "Google login failed"
            );
          }
        }}
        onError={() => {
          alert("Google Login Failed");
        }}
        width="100%"
        size="large"
        shape="rectangular"
        theme="outline"
      />
    </div>
  );
}

<<<<<<< HEAD
=======



>>>>>>> main
export default function LoginModal({ isOpen, onClose, openRegister }) {
  const { login } = useAuth();

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

  /* ===== COMMON SUCCESS HANDLER ===== */
  const handleAuthSuccess = (res) => {
    const token = res.data.token;

    const userData = {
      _id: res.data._id,
      name: res.data.name,
      email: res.data.email,
      role: res.data.role,
    };

    localStorage.setItem(
      "userInfo",
      JSON.stringify({ user: userData, token })
    );

    login(userData, token);

    alert("Successfully Logged In ✅");
    onClose();
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setActiveAction("passwordLogin");
    setLoading(true);

    try {
      const payload = identifier.includes("@")
  ? { email: identifier, password }
  : { phone: identifier, password };

      const res = await axios.post(`${API_BASE}/api/auth/login`, payload);

      handleAuthSuccess(res);
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };

  const sendLoginOtp = async () => {
    setActiveAction("sendLoginOtp");
    setLoading(true);

    try {
      const payload = identifier.includes("@")
        ? { email: identifier }
        : { phone: identifier };

      await axios.post(`${API_BASE}/api/auth/login/send-otp`, payload);

      setView("verifyOtp");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };

  const verifyLoginOtp = async () => {
    setActiveAction("verifyLoginOtp");
    setLoading(true);

    try {
      const payload = identifier.includes("@")
  ? { email: identifier, otp }
  : { phone: identifier, otp };

const res = await axios.post(
  `${API_BASE}/api/auth/login/verify-otp`,
  payload
);


      handleAuthSuccess(res);
    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };

  const forgotPassword = async () => {
    setActiveAction("forgotPassword");
    setLoading(true);

    try {
const payload = identifier.includes("@")
  ? { email: identifier.toLowerCase().trim() }
  : { phone: identifier.trim() };

await axios.post(`${API_BASE}/api/auth/password/forgot`, payload);

      setView("verifyForgotOtp");
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };

  const verifyForgotOtp = async () => {
  setActiveAction("verifyForgotOtp");
  setLoading(true);

  try {
    const payload = {
      email: identifier.toLowerCase().trim(),
      otp: otp.trim(),
    };

    const res = await axios.post(
      `${API_BASE}/api/auth/password/verify-otp`,
      payload
    );

    localStorage.setItem("resetToken", res.data.resetToken);

    setView("reset");

  } catch (err) {
    alert(err.response?.data?.message || "Invalid OTP");
  } finally {
    setLoading(false);
    setActiveAction(null);
  }
};


const resetPassword = async () => {
  if (password !== confirm) {
    return alert("Passwords do not match");
  }

  setActiveAction("resetPassword");
  setLoading(true);

  try {
    const resetToken = localStorage.getItem("resetToken");

    if (!resetToken) {
      return alert("Reset session expired. Please try again.");
    }

    const res = await axios.post(
      `${API_BASE}/api/auth/password/reset`,
      {
        resetToken,
        newPassword: password,
      }
    );

    alert("Password reset successful ✅");

    localStorage.removeItem("resetToken");

    handleAuthSuccess(res);

  } catch (err) {
    alert(err.response?.data?.message || "Reset failed");
  } finally {
    setLoading(false);
    setActiveAction(null);
  }
};
  return (
    <AuthModal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-5">
        <h2 className="text-2xl font-bold">Login</h2>

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

            <GoogleLoginButton onSuccess={handleAuthSuccess} />
          </form>
        )}

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
