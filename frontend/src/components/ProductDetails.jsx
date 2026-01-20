"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Star,
  Zap,
  CreditCard,
  MessageCircle,
  Smartphone,
  QrCode,
  CheckCircle2,
  Truck
} from "lucide-react";

/* ---------------- PRODUCT DATA ---------------- */
const defaultProduct = {
  id: "seamless-booty-pads-panties",
  name: "SEAMLESS BOOTY PADS PANTIES",
  price: 1299,
  originalPrice: 2699,
  mainImage: "/image/Women-HIP-PAD-PANTY/hip-pad-1.webp",
  images: [
    "/image/Women-HIP-PAD-PANTY/hip-pad.webp",
    "/image/Women-HIP-PAD-PANTY/hip-pad-2.webp",
    "/image/Women-HIP-PAD-PANTY/HIP-PAD-3.webp",
    "/image/Women-HIP-PAD-PANTY/MANIFIQUE-Padded-Underwear-3.webp",
    "/image/Women-HIP-PAD-PANTY/Seamless-Booty-Pads-Butt-Enhancer-Panties-7.webp",
    "/image/Women-HIP-PAD-PANTY/sizes.webp"
  ]
};

export default function ProductDetails({ product = defaultProduct }) {
  const [mainImage, setMainImage] = useState(product.mainImage);
  const [selectedSize, setSelectedSize] = useState("M");
  const [orderStatus, setOrderStatus] = useState("idle");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    houseNo: "",
    area: "",
    city: "",
    pincode: "",
    state: ""
  });

  const myWhatsApp = "919871147666";

  useEffect(() => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    document.body.appendChild(s);
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const isValid =
    formData.name &&
    formData.phone &&
    formData.houseNo &&
    formData.area &&
    formData.pincode;

  /* ---------------- SUCCESS SCREEN ---------------- */
  if (orderStatus === "success") {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl">
          <CheckCircle2 size={70} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-[#041f41] mb-2">
            Order Placed!
          </h2>
          <p className="text-gray-500 mb-6">
            Thank you for shopping with Booty Bloom
          </p>

          <div className="bg-blue-50 p-5 rounded-xl mb-6">
            <div className="flex items-center gap-2 font-bold text-blue-700">
              <Truck size={18} />
              Estimated Delivery
            </div>
            <p className="text-xl font-black mt-2">3 – 5 Working Days</p>
          </div>

          <button
            onClick={() => setOrderStatus("idle")}
            className="text-blue-600 font-bold underline"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- MAIN LAYOUT ---------------- */
  return (
    <section
      id="main-product-section"
      className="max-w-[1200px] mx-auto px-3 sm:px-4 py-10"
    >
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8">

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ---------- LEFT : PRODUCT ---------- */}
          <div className="space-y-5">

            {/* Main Image */}
            <div className="relative aspect-[4/5] rounded-2xl bg-gray-50 overflow-hidden border">
              <Image
                src={mainImage}
                alt={product.name}
                fill
                className="object-contain p-2"
              />
              <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full">
                BEST SELLER
              </span>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto justify-center">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setMainImage(img)}
                  className={`relative w-16 h-20 flex-shrink-0 rounded-lg border-2 ${
                    mainImage === img
                      ? "border-blue-600"
                      : "border-gray-200"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#041f41] uppercase">
              {product.name}
            </h1>

            <div className="bg-blue-50 p-4 rounded-xl">
              <p className="text-3xl sm:text-4xl font-black text-blue-700">
                ₹{product.price}
              </p>
              <p className="text-blue-600 font-black italic flex items-center gap-1 mt-1">
                <Zap size={14} fill="currentColor" />
                BUY 1 GET 1 FREE
              </p>
            </div>

            {/* Sizes */}
            <div className="flex gap-2">
              {["S", "M", "L", "XL"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`w-12 h-12 rounded-xl border-2 font-black ${
                    selectedSize === s
                      ? "bg-blue-600 text-white"
                      : "border-gray-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* ---------- RIGHT : FORM ---------- */}
          <div className="space-y-6 lg:sticky lg:top-24">

            <div className="border rounded-2xl p-5">
              <h2 className="font-black text-xl mb-4 flex items-center gap-2">
                <Smartphone size={22} />
                Shipping Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input name="name" placeholder="Full Name *" onChange={handleChange} className="p-3 bg-gray-50 rounded-xl" />
                <input name="phone" placeholder="WhatsApp Number *" onChange={handleChange} className="p-3 bg-gray-50 rounded-xl" />
                <input name="houseNo" placeholder="House / Flat No *" onChange={handleChange} className="sm:col-span-2 p-3 bg-gray-50 rounded-xl" />
                <input name="area" placeholder="Area / Landmark *" onChange={handleChange} className="sm:col-span-2 p-3 bg-gray-50 rounded-xl" />
                <input name="city" placeholder="City" onChange={handleChange} className="p-3 bg-gray-50 rounded-xl" />
                <input name="pincode" placeholder="Pincode *" onChange={handleChange} className="p-3 bg-gray-50 rounded-xl" />
                <input name="state" placeholder="State" onChange={handleChange} className="sm:col-span-2 p-3 bg-gray-50 rounded-xl" />
              </div>

              {/* Total */}
              <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center justify-between bg-blue-50 p-4 rounded-xl">
                <p className="font-black text-xl">
                  Total: <span className="text-blue-600">₹{product.price}</span>
                </p>

                <button
                  onClick={() => {
                    if (!isValid) return alert("Complete address fill karein");
                    window.open(
                      `https://wa.me/${myWhatsApp}`,
                      "_blank"
                    );
                    setOrderStatus("success");
                  }}
                  className="w-full sm:w-auto bg-[#25d366] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 justify-center"
                >
                  <MessageCircle size={18} /> WhatsApp Order
                </button>
              </div>

              {/* Razorpay */}
              <button
                onClick={() => {
                  if (!isValid) return alert("Complete address fill karein");
                  const options = {
                    key: "rzp_live_S5jkUVvVI8UcY2",
                    amount: product.price * 100,
                    currency: "INR",
                    name: "BOOTY BLOOM",
                    handler: () => setOrderStatus("success"),
                    prefill: { name: formData.name, contact: formData.phone }
                  };
                  new window.Razorpay(options).open();
                }}
                className="w-full mt-4 bg-blue-600 text-white py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2"
              >
                <CreditCard size={22} /> Pay Securely Online
              </button>
            </div>

            {/* QR */}
            <div className="bg-[#041f41] text-white p-5 rounded-2xl">
              <h3 className="font-bold flex items-center gap-2 mb-3">
                <QrCode size={18} /> Direct Scan & Pay
              </h3>

              <div className="flex items-center gap-4">
                <img
                  src="/image/page_1.png"
                  alt="QR"
                  className="w-24 h-24 bg-white p-2 rounded-xl"
                />
                <div>
                  <p className="text-sm">UPI ID</p>
                  <p className="font-black text-yellow-400">
                    AXISMEDIA465@iob
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
