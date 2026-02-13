// "use client";
// import { useCart } from "@/context/CartContext";
// import { 
//   Trash2, 
//   Loader2, 
//   CheckCircle, 
//   ShieldCheck, 
//   Search, 
//   ChevronDown 
// } from "lucide-react";
// import { useEffect, useRef, useState } from "react";

//   const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";


// export default function CheckoutPage() {
//   const { cart = [], removeFromCart, cartTotal, clearCart } = useCart() || {};

//   /* 🌸 BABY PINK – DEFINITIONS */
//   const babyPink = "#FCE4EC"; // Global background color
//   const babyPinkCard = "#F8BBD0"; 
//   const babyPinkStrong = "#F48FB1";

//   const [mobileNumber, setMobileNumber] = useState("");
//   const [email, setEmail] = useState("");
//   const [otp, setOtp] = useState(["", "", "", "", "", ""]);
//   const [isOtpSent, setIsOtpSent] = useState(false);
//   const [isVerified, setIsVerified] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [timer, setTimer] = useState(60);

//   const [address, setAddress] = useState({
//     firstName: "", lastName: "", address: "", apartment: "", city: "", state: "Delhi", pin: ""
//   });

//   const otpRefs = useRef([]);

//   const subTotal = typeof cartTotal === "function" ? cartTotal() : 0;
//   const tax = Math.round(subTotal * 0.05);
//   const finalPayable = subTotal + tax;

//   /* ================= OTP LOGIC ================= */
//   useEffect(() => {
//     if (!isOtpSent || timer === 0) return;
//     const interval = setInterval(() => setTimer((t) => t - 1), 1000);
//     return () => clearInterval(interval);
//   }, [isOtpSent, timer]);

//   const handleOtpChange = (val, i) => {
//     if (!/^[0-9]?$/.test(val)) return;
//     const n = [...otp]; n[i] = val; setOtp(n);
//     if (val && i < 5) otpRefs.current[i + 1]?.focus();
//   };

//   const handleOtpKeyDown = (e, i) => {
//     if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
//   };

//   const handleSendOtp = async () => {
//     const cleanMobile = mobileNumber.trim();
//     const cleanEmail = email.trim();

//     if (cleanMobile.length !== 10) return alert("Please enter a valid 10-digit Mobile Number");
//     if (!cleanEmail.includes("@")) return alert("Please enter a valid Email Address");

//     setIsLoading(true);
//     try {
//       const res = await fetch(API_BASE, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email: cleanEmail }),
//       });
//       if (res.ok) {
//         setIsOtpSent(true);
//         setTimer(60);
//       } else {
//         alert("Server error while sending OTP");
//       }
//     } catch (err) { 
//       alert("Failed to connect to server"); 
//     } finally { 
//       setIsLoading(false); 
//     }
//   };

//   const handleVerifyOTP = async () => {
//     const otpValue = otp.join("");
//     if (otpValue.length !== 6) return alert("Enter 6 digit OTP");
    
//     setIsLoading(true);
//     try {
//       const res = await fetch(`${API_BASE}/api/otp/verify`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email: email.trim(), otp: otpValue }),
//       });
//       const data = await res.json();
//       if (data.success) {
//         setIsVerified(true);
//       } else {
//         alert("Invalid OTP, please try again");
//       }
//     } catch (err) { 
//       alert("Verification error"); 
//     } finally { 
//       setIsLoading(false); 
//     }
//   };

//   /* ================= RAZORPAY INTEGRATION ================= */
//   const handleFinalPayment = async () => {
//     if (!address.firstName || !address.address || !address.pin) {
//       return alert("Please fill the required delivery details");
//     }

//     setIsLoading(true);
//     try {
//       const orderRes = await fetch(`${API_BASE}/api/payment/create-order`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ amount: finalPayable }),
//       });
//       const orderData = await orderRes.json();

//       const rzp = new window.Razorpay({
//         key: "rzp_live_S8qV0g09nn545L",
//         amount: orderData.order.amount,
//         currency: "INR",
//         order_id: orderData.order.id,
//         name: "Booty Bloom",
//         description: "Lingerie Purchase",
//         handler: async (res) => {
//           await fetch(`${API_BASE}/api/orders/verify-and-save`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               email: email.trim(),
//               items: cart,
//               amount: finalPayable,
//               paymentId: res.razorpay_payment_id,
//               shippingAddress: address
//             }),
//           });
//           clearCart();
//           window.location.href = "/success";
//         },
//         theme: { color: "#ec4899" }
//       });
//       rzp.open();
//     } catch (err) {
//       alert("Payment initialization failed");
//     } finally { 
//       setIsLoading(false); 
//     }
//   };

//   return (
//     /* MAIN WRAPPER - Force Baby Pink */
//     <div className="flex flex-col md:flex-row min-h-screen font-sans" style={{ backgroundColor: babyPink }}>
      
//       {/* LEFT COLUMN: Checkout Flow */}
//       <div className="w-full md:w-[55%] p-6 md:p-16" style={{ backgroundColor: babyPink }}>
//         <div className="max-w-xl ml-auto">
//           <h1 className="text-3xl font-black italic mb-10 text-pink-600 tracking-tighter uppercase">BOOTY BLOOM</h1>

//           {!isVerified ? (
//             /* --- STEP 1: LOGIN & OTP SECTION --- */
//             <div className="p-8 rounded-2xl shadow-sm border border-pink-200 animate-in fade-in duration-500" style={{ backgroundColor: babyPinkCard }}>
//               <div className="mb-6 border-b border-pink-100 pb-4">
//                 <h2 className="text-2xl font-bold text-gray-900">Checkout Login</h2>
//                 <p className="text-gray-500 text-sm">Verify your details to proceed</p>
//               </div>
              
//               <div className="space-y-5">
//                 <div>
//                   <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Mobile Number</label>
//                   <input
//                     type="tel"
//                     placeholder="1234567890"
//                     className="w-full border-b-2 border-gray-100 p-3 outline-none focus:border-pink-500 transition-colors text-lg bg-transparent"
//                     maxLength={10}
//                     onChange={(e) => setMobileNumber(e.target.value)}
//                     disabled={isOtpSent}
//                   />
//                 </div>
                
//                 <div className="pb-4">
//                   <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Email Address</label>
//                   <input
//                     type="email"
//                     placeholder="you@example.com"
//                     className="w-full border-b-2 border-gray-100 p-3 outline-none focus:border-pink-500 transition-colors text-lg bg-transparent"
//                     onChange={(e) => setEmail(e.target.value)}
//                     disabled={isOtpSent}
//                   />
//                 </div>

//                 {isOtpSent && (
//                   <div className="py-4 rounded-2xl border border-pink-200 animate-in zoom-in-95 duration-300" style={{ backgroundColor: babyPinkStrong }}>
//                     <p className="text-center text-[9px] text-pink-400 mb-3 uppercase tracking-[0.2em] font-black">
//                       Enter Security Code
//                     </p>
                    
//                     <div className="flex gap-1.5 justify-center">
//                       {otp.map((d, i) => (
//                         <input
//                           key={i}
//                           ref={(el) => (otpRefs.current[i] = el)}
//                           value={d}
//                           maxLength={1}
//                           type="text"
//                           inputMode="numeric"
//                           className="w-12 h-12 md:w-16 md:h-16 border border-gray-200 rounded-lg text-center font-bold text-base bg-white shadow-sm text-pink-600 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all duration-200"
//                           onChange={(e) => handleOtpChange(e.target.value, i)}
//                           onKeyDown={(e) => handleOtpKeyDown(e, i)}
//                         />
//                       ))}
//                     </div>

//                     <div className="text-center mt-3">
//                       {timer > 0 ? (
//                         <span className="text-[10px] text-gray-400">Resend in <b className="text-pink-600">{timer}s</b></span>
//                       ) : (
//                         <button onClick={handleSendOtp} className="text-[10px] text-pink-600 underline font-bold uppercase tracking-tighter">Resend OTP</button>
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 <button
//                   onClick={isOtpSent ? handleVerifyOTP : handleSendOtp}
//                   disabled={isLoading}
//                   className="w-full bg-pink-600 hover:bg-pink-700 text-white py-4 rounded-xl font-black uppercase tracking-[0.1em] shadow-md shadow-pink-100 transition-all active:scale-[0.98] flex justify-center items-center gap-2 mt-2"
//                 >
//                   {isLoading && <Loader2 className="animate-spin" size={18} />}
//                   {isOtpSent ? "Verify & Continue" : "Send OTP to Email"}
//                 </button>
//               </div>
//             </div>
//           ) : (
//             /* --- STEP 2: DELIVERY & PAYMENT FORM --- */
//             <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
              
//               <section>
//                 <div className="flex items-center gap-3 mb-6">
//                   <div className="bg-pink-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">2</div>
//                   <h2 className="text-2xl font-bold text-gray-900">Shipping Details</h2>
//                   <div className="ml-auto bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 border border-green-200">
//                     <CheckCircle size={12}/> Account Verified
//                   </div>
//                 </div>

//                 <div className="grid gap-4 bg-white p-8 rounded-2xl border border-pink-100 shadow-sm">
//                   <div className="flex gap-4">
//                     <input placeholder="First name" className="w-1/2 p-4 border rounded-xl outline-none focus:ring-2 focus:ring-pink-500 bg-gray-50 border-transparent transition-all" onChange={(e) => setAddress({ ...address, firstName: e.target.value })} />
//                     <input placeholder="Last name" className="w-1/2 p-4 border rounded-xl outline-none focus:ring-2 focus:ring-pink-500 bg-gray-50 border-transparent transition-all" onChange={(e) => setAddress({ ...address, lastName: e.target.value })} />
//                   </div>
//                   <div className="relative">
//                     <input placeholder="Flat / House No. / Building" className="w-full p-4 border rounded-xl outline-none bg-gray-50 border-transparent focus:ring-2 focus:ring-pink-500 transition-all" onChange={(e) => setAddress({ ...address, address: e.target.value })} />
//                     <Search className="absolute right-4 top-4 text-gray-400" size={18} />
//                   </div>
//                   <input placeholder="Area / Colony / Street (Optional)" className="w-full p-4 border rounded-xl outline-none bg-gray-50 border-transparent focus:ring-2 focus:ring-pink-500 transition-all" onChange={(e) => setAddress({ ...address, apartment: e.target.value })} />
//                   <div className="flex gap-4">
//                     <input placeholder="City" className="w-1/3 p-4 border rounded-xl outline-none bg-gray-50 border-transparent focus:ring-2 focus:ring-pink-500 transition-all" onChange={(e) => setAddress({ ...address, city: e.target.value })} />
//                     <div className="w-1/3 relative">
//                       <select className="w-full p-4 border rounded-xl bg-gray-50 border-transparent appearance-none font-medium text-gray-600 outline-none focus:ring-2 focus:ring-pink-500" onChange={(e) => setAddress({ ...address, state: e.target.value })}>
//                         <option>Delhi</option><option>Maharashtra</option><option>Karnataka</option><option>Haryana</option>
//                       </select>
//                       <ChevronDown className="absolute right-4 top-5 text-gray-400" size={16} />
//                     </div>
//                     <input placeholder="PIN code" className="w-1/3 p-4 border rounded-xl outline-none bg-gray-50 border-transparent focus:ring-2 focus:ring-pink-500 transition-all" onChange={(e) => setAddress({ ...address, pin: e.target.value })} />
//                   </div>
//                 </div>
//               </section>

//               <section className="space-y-4">
//                 <div className="px-2">
//                   <h3 className="text-xl font-bold text-gray-900">Payment</h3>
//                   <p className="text-xs text-gray-500">All transactions are secure and encrypted.</p>
//                 </div>

//                 <div className="bg-white border border-pink-100 rounded-2xl overflow-hidden shadow-sm">
//                   <div className="p-5 flex justify-between items-center bg-gray-50/50 border-b border-pink-50">
//                     <span className="text-sm font-bold text-gray-800">Cashfree Payments (UPI, Cards, Wallets)</span>
//                     <div className="flex gap-1">
//                       <span className="bg-white border px-1.5 py-0.5 rounded text-[9px] font-black text-blue-600">UPI</span>
//                       <span className="bg-white border px-1.5 py-0.5 rounded text-[9px] font-black text-blue-800 italic">VISA</span>
//                       <span className="bg-white border px-1.5 py-0.5 rounded text-[9px] font-black text-orange-600">MC</span>
//                     </div>
//                   </div>
//                   <div className="p-10 text-center bg-white">
//                     <div className="w-14 h-14 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
//                       <ShieldCheck className="text-pink-500" size={28} />
//                     </div>
//                     <p className="text-sm text-gray-500 max-w-xs mx-auto">
//                       After clicking "Complete Payment", you will be redirected to Cashfree Payments to complete your purchase securely.
//                     </p>
//                   </div>
//                 </div>
//               </section>

//               <button 
//                 onClick={handleFinalPayment} 
//                 disabled={isLoading} 
//                 className="w-full bg-black hover:bg-gray-900 text-white py-6 rounded-2xl font-black text-xl uppercase tracking-widest shadow-2xl transition-all active:scale-[0.98] flex justify-center items-center gap-3 mt-4"
//               >
//                 {isLoading ? <Loader2 className="animate-spin" /> : "Complete Payment"}
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* RIGHT COLUMN: Order Summary */}
//       <div className="w-full md:w-[45%] p-6 md:p-16 border-l border-pink-200" style={{ backgroundColor: babyPink }}>
//         <div className="max-w-md">
//           <h3 className="text-xs font-black tracking-[0.2em] text-gray-400 mb-8 uppercase">Your Cart</h3>
          
//           <div className="space-y-6 mb-10 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
//             {cart.length > 0 ? cart.map((item, idx) => (
//               <div key={idx} className="flex items-center gap-5 group">
//                 <div className="relative bg-white p-2 rounded-2xl border border-gray-200 shadow-sm transition-transform group-hover:scale-105">
//                   <img src={item.img || item.image || "/placeholder.png"} alt={item.name} className="w-16 h-20 object-cover rounded-lg" />
//                   <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full font-bold shadow-md">{item.qty || 1}</span>
//                 </div>
//                 <div className="flex-1">
//                   <h3 className="text-sm font-bold text-gray-800 leading-tight">{item.name}</h3>
//                   <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Size: {item.size || "Standard"}</p>
//                 </div>
//                 <p className="text-sm font-black text-gray-900">₹{(item.offerPrice || item.price || 0).toLocaleString()}</p>
//               </div>
//             )) : (
//                 <p className="text-gray-400 italic">Cart is empty</p>
//             )}
//           </div>

//           <div className="border-t border-pink-200 pt-8 space-y-4">
//             <div className="flex justify-between text-sm">
//                 <span className="text-gray-500 font-medium">Subtotal</span>
//                 <span className="font-bold text-gray-900">₹{subTotal.toLocaleString()}</span>
//             </div>
//             <div className="flex justify-between text-sm">
//                 <span className="text-gray-500 font-medium">GST (5%)</span>
//                 <span className="font-bold text-gray-900">₹{tax.toLocaleString()}</span>
//             </div>
//             <div className="flex justify-between text-sm border-b border-dashed border-pink-200 pb-4">
//                 <span className="text-gray-500 font-medium">Shipping</span>
//                 <span className="text-pink-600 font-black text-xs uppercase tracking-widest tracking-tighter">FREE</span>
//             </div>
            
//             <div className="flex justify-between text-2xl font-black text-gray-900 pt-2">
//               <span>Total</span>
//               <div className="flex items-baseline gap-1">
//                 <span className="text-xs font-bold text-gray-400 mr-1">INR</span>
//                 ₹{finalPayable.toLocaleString()}
//               </div>
//             </div>
//           </div>

//           <div className="mt-12 bg-white/50 p-4 rounded-2xl flex gap-4 items-center border border-pink-100">
//              <div className="bg-green-100 text-green-600 p-2 rounded-full"><ShieldCheck size={20}/></div>
//              <p className="text-[10px] leading-relaxed text-gray-500 font-medium">
//                100% Secure Checkout. <br/>
//                <span className="font-bold text-gray-800 underline uppercase italic">30-Day Happiness Guarantee</span>
//              </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import { useCart } from "@/context/CartContext";
import EmptyCart from "./components/EmptyCart";
import CartItem from "./components/CartItem";
import CartSummary from "./components/CartSummary";
// import LoginModal from "@/components/LoginModal";
import { useState } from "react";
import LoginModal from "../authPage/LoginModal";

export default function CartPage() {
  const { cartItems } = useCart();
  const [openLogin, setOpenLogin] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {cartItems.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>

          <CartSummary
            openLogin={() => setOpenLogin(true)}
          />
        </div>
      )}

      <LoginModal
        isOpen={openLogin}
        onClose={() => setOpenLogin(false)}
      />
    </div>
  );
}
