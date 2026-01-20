"use client";
import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { ShieldCheck, MessageCircle, QrCode } from "lucide-react";

export default function Checkout() {
  const { cartItems } = useCart();

  const product =
    cartItems.length > 0
      ? cartItems[0]
      : { name: "Butt Lifter Shaper", price: 1179 };

  const totalPayable = product.price;
  const myWhatsApp = "919871147666";

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    houseNo: "",
    area: "",
    city: "",
    pincode: "",
  });

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const isValid =
    formData.name &&
    formData.phone &&
    formData.houseNo &&
    formData.area &&
    formData.pincode;

  /* WhatsApp Order */
  const handleWhatsAppOrder = () => {
    if (!isValid) return alert("Please fill complete address details!");

    const msg = `
*New Order*
Product: ${product.name}
Name: ${formData.name}
Phone: ${formData.phone}
Address:
${formData.houseNo}, ${formData.area}
${formData.city} - ${formData.pincode}
Total: ₹${totalPayable}
    `;
    window.open(`https://wa.me/${myWhatsApp}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  /* Razorpay */
  const handlePayment = async () => {
    if (!isValid) return alert("Please fill complete address details!");

    try {
      const res = await fetch("http://localhost:5000/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalPayable }),
      });

      const orderData = await res.json();

      const options = {
        key: "rzp_live_S5jkUVvVI8UcY2",
        amount: totalPayable * 100,
        currency: "INR",
        name: "BOOTY BLOOM",
        order_id: orderData.order.id,
        handler: async (response) => {
          await fetch("http://localhost:5000/api/payment/verify-and-save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              customerData: formData,
              paymentId: response.razorpay_payment_id,
              amount: totalPayable,
              items: [product],
            }),
          });
          window.location.href = "/success";
        },
        prefill: {
          name: formData.name,
          contact: formData.phone,
        },
        theme: { color: "#2874f0" },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      alert("Server error!");
    }
  };

  return (
    <section className="min-h-screen bg-[#f1f3f6] py-6 sm:py-10 px-3 sm:px-4">
      <div className="max-w-[1100px] mx-auto flex flex-col lg:flex-row gap-6">

        {/* LEFT */}
        <div className="lg:w-2/3 space-y-5">
          {/* Address */}
          <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm">
            <h2 className="text-gray-600 font-black uppercase text-sm mb-4">
              Delivery Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                name="name"
                placeholder="Full Name *"
                onChange={handleChange}
                className="border p-3 rounded-lg"
              />
              <input
                name="phone"
                placeholder="WhatsApp Number *"
                onChange={handleChange}
                className="border p-3 rounded-lg"
              />
              <input
                name="houseNo"
                placeholder="House / Flat No *"
                onChange={handleChange}
                className="border p-3 rounded-lg sm:col-span-2"
              />
              <input
                name="area"
                placeholder="Area / Landmark *"
                onChange={handleChange}
                className="border p-3 rounded-lg sm:col-span-2"
              />
              <input
                name="city"
                placeholder="City"
                onChange={handleChange}
                className="border p-3 rounded-lg"
              />
              <input
                name="pincode"
                placeholder="Pincode *"
                onChange={handleChange}
                className="border p-3 rounded-lg"
              />
            </div>
          </div>

          {/* QR Payment */}
          <div className="bg-[#001e3c] text-white p-5 rounded-xl border-l-4 border-yellow-400">
            <h3 className="font-bold uppercase text-sm flex items-center gap-2 mb-4">
              <QrCode size={18} className="text-yellow-400" />
              Direct Scan & Pay
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="bg-white p-2 rounded-lg">
                <img src="/image/page_1.png" alt="QR" className="w-28 h-28" />
              </div>

              <div className="text-sm space-y-2">
                <p className="font-bold">AXIS MEDIA</p>
                <p>
                  UPI ID:{" "}
                  <span className="text-yellow-400 font-mono font-black">
                    AXISMEDIA465@iob
                  </span>
                </p>

                <button
                  onClick={handleWhatsAppOrder}
                  className="bg-[#25D366] px-4 py-3 rounded-lg font-bold flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  <MessageCircle size={18} /> Send Receipt on WhatsApp
                </button>
              </div>
            </div>
          </div>

          {/* Razorpay */}
          <button
            onClick={handlePayment}
            className="w-full bg-[#fb641b] text-white py-4 rounded-xl font-black uppercase shadow-md"
          >
            Pay Online (Secure Razorpay)
          </button>
        </div>

        {/* RIGHT */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-xl shadow-sm p-5 lg:sticky lg:top-24">
            <h3 className="font-black uppercase text-sm border-b pb-2 text-gray-600">
              Price Details
            </h3>

            <div className="py-4">
              <div className="flex justify-between text-lg font-black">
                <span>Total Payable</span>
                <span className="text-blue-600">₹{totalPayable}</span>
              </div>
            </div>

            <div className="text-xs text-gray-500 flex items-center gap-2">
              <ShieldCheck size={14} /> 100% Safe Payments via Razorpay
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
