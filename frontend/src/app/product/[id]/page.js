"use client";
import { useState } from "react";
import {
  Zap,
  MessageCircle,
  Smartphone,
  QrCode,
  CheckCircle2,
  Truck,
  HelpCircle,
  X,
  MessageSquare
} from "lucide-react";

/* PRODUCT DATA */
const defaultProduct = {
  name: "SEAMLESS BOOTY PADS PANTIES",
  price: 1299,
  mainImage: "/image/Women-HIP-PAD-PANTY/hip-pad-1.webp",
  images: [
    "/image/Women-HIP-PAD-PANTY/hip-pad.webp",
    "/image/Women-HIP-PAD-PANTY/hip-pad-2.webp",
    "/image/Women-HIP-PAD-PANTY/HIP-PAD-3.webp",
    "/image/Women-HIP-PAD-PANTY/MANIFIQUE-Padded-Underwear-3.webp",
    "/image/Women-HIP-PAD-PANTY/Seamless-Booty-Pads-Butt-Enhancer-Panties-7.webp"
  ]
};

export default function ProductDetails({ product = defaultProduct }) {
  const [mainImage, setMainImage] = useState(product.mainImage);
  const [orderStatus, setOrderStatus] = useState("idle");
  const [showHelp, setShowHelp] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    houseNo: "",
    area: "",
    city: "",
    pincode: ""
  });

  const myWhatsApp = "919871147666";

  const helpQuestions = [
    { q: "Order kab deliver hoga?" },
    { q: "Delivery late ho gayi hai" },
    { q: "Size exchange possible hai?" }
  ];

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const isValid =
    formData.name &&
    formData.phone &&
    formData.houseNo &&
    formData.area &&
    formData.pincode;

  const handleWhatsAppOrder = () => {
    if (!isValid) return alert("Complete address fill karein");
    window.open(`https://wa.me/${myWhatsApp}`, "_blank");
    setOrderStatus("success");
  };

  /* SUCCESS */
  if (orderStatus === "success") {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl">
          <CheckCircle2 size={70} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-[#041f41]">
            Order Placed!
          </h2>
          <p className="text-gray-500 mt-2">
            Aapka order confirm ho gaya hai
          </p>

          <div className="bg-blue-50 p-5 rounded-xl mt-6">
            <div className="flex items-center gap-2 font-bold text-blue-700">
              <Truck size={18} /> Estimated Delivery
            </div>
            <p className="text-xl font-black mt-2">
              3 – 5 Working Days
            </p>
          </div>

          <button
            onClick={() => setShowHelp(true)}
            className="mt-6 bg-gray-100 px-6 py-3 rounded-xl font-bold"
          >
            <HelpCircle size={18} className="inline mr-2" />
            Need Help?
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-[1200px] mx-auto px-3 sm:px-4 py-10 relative">

      {/* FLOATING HELP */}
      <button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-5 right-4 z-50 bg-blue-600 text-white p-4 rounded-full shadow-xl"
      >
        <MessageSquare size={22} />
      </button>

      <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-6 lg:p-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* IMAGES */}
          <div className="space-y-4">
            <div className="aspect-[4/5] bg-gray-50 rounded-2xl flex items-center justify-center">
              <img src={mainImage} className="max-h-full p-4" />
            </div>

            <div className="flex gap-2 overflow-x-auto justify-center">
              {product.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  onClick={() => setMainImage(img)}
                  className="w-16 h-20 rounded-lg border cursor-pointer"
                />
              ))}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#041f41] uppercase">
              {product.name}
            </h1>

            <div className="bg-blue-50 p-4 rounded-xl">
              <p className="text-3xl font-black text-blue-700">
                ₹{product.price}
              </p>
              <p className="text-blue-600 font-bold italic flex gap-1">
                <Zap size={14} /> BUY 1 GET 1 FREE
              </p>
            </div>
          </div>

          {/* FORM */}
          <div className="space-y-5">
            <div className="border rounded-2xl p-5">
              <h2 className="font-black text-xl mb-4 flex gap-2">
                <Smartphone size={22} /> Shipping Address
              </h2>

              <div className="grid gap-3">
                <input name="name" placeholder="Full Name" onChange={handleChange} className="p-3 bg-gray-50 rounded-xl" />
                <input name="phone" placeholder="WhatsApp Number" onChange={handleChange} className="p-3 bg-gray-50 rounded-xl" />
                <input name="houseNo" placeholder="House / Flat No" onChange={handleChange} className="p-3 bg-gray-50 rounded-xl" />
                <input name="area" placeholder="Area / Landmark" onChange={handleChange} className="p-3 bg-gray-50 rounded-xl" />
                <div className="grid grid-cols-2 gap-3">
                  <input name="city" placeholder="City" onChange={handleChange} className="p-3 bg-gray-50 rounded-xl" />
                  <input name="pincode" placeholder="Pincode" onChange={handleChange} className="p-3 bg-gray-50 rounded-xl" />
                </div>
              </div>

              <button
                onClick={handleWhatsAppOrder}
                className="w-full mt-5 bg-[#25d366] text-white py-4 rounded-xl font-black flex justify-center gap-2"
              >
                <MessageCircle size={20} /> Order on WhatsApp
              </button>
            </div>

            {/* QR */}
            <div className="bg-[#041f41] text-white p-5 rounded-2xl">
              <h3 className="font-bold flex gap-2 mb-3">
                <QrCode size={18} /> Scan & Pay
              </h3>
              <p className="font-black text-yellow-400">
                AXISMEDIA465@iob
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* HELP MODAL */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl">
            <div className="bg-blue-600 p-4 text-white flex justify-between">
              <p className="font-black">HELP CENTER</p>
              <button onClick={() => setShowHelp(false)}>
                <X />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {helpQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() =>
                    window.open(`https://wa.me/${myWhatsApp}`, "_blank")
                  }
                  className="w-full text-left p-3 rounded-xl border"
                >
                  {q.q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
