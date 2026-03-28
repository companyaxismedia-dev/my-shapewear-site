"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {Check,Truck,Edit2,ChevronLeft,ChevronRight} from "lucide-react";
import Footer from "@/components/Footer";
import { API_BASE } from "@/lib/api";

export default function OrderSuccessPage() {
  const router = useRouter();
  const params = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const paymentImages = [
    {
      title: "PayNow",
      description:
        "Now you can pay online using Pay Now option from order or Pay on Delivery.",
    },
  ];

  /* ================= FETCH ORDER ================= */
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.token) return;

        const res = await fetch(
         `${API_BASE}/api/orders/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        const data = await res.json();

        if (data.success) {
          setOrder(data.order);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.id]);

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === paymentImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? paymentImages.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading order...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Order not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      <main className="flex-1 w-full px-4 py-8">
        <div className="max-w-2xl mx-auto">

          {/* ================= MAIN CARD ================= */}
          <div className="bg-white rounded-lg shadow-sm p-8 md:p-12 mb-8">

            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-white" strokeWidth={3} />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-center text-green-600 mb-4">
              Order confirmed
            </h1>

            <p className="text-center text-gray-600 text-sm mb-8">
              Your order is confirmed. You will receive an order confirmation
              email/SMS shortly.
            </p>

            {/* DELIVERY */}
            <div className="mb-8 border-t pt-8">
              <p className="text-sm font-semibold mb-4">Delivering to</p>

              <div className="flex items-start gap-4">
                <Truck className="w-5 h-5 text-pink-500 mt-1" />

                <div>
                  <p className="text-sm font-semibold">
                    {order.userInfo?.name} | {order.userInfo?.phone}
                  </p>

                  <p className="text-sm text-gray-500">
                    {order.userInfo?.address}, {order.userInfo?.city} -{" "}
                    {order.userInfo?.pincode}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push(`/order/${order.id || order._id}`)}
              className="text-xs font-semibold text-pink-500 border border-pink-500 px-3 py-2 rounded hover:bg-pink-500 hover:text-white"
            >
              ORDER DETAILS
            </button>

            <div className="flex items-start gap-2 mt-4 text-xs text-gray-500">
              <Edit2 className="w-4 h-4 mt-0.5" />
              <span>You can Track/View/Modify order from order page</span>
            </div>
          </div>

          {/* ================= PAYMENT CARD ================= */}
          <div className="bg-white rounded-lg shadow-sm p-8 md:p-12 mb-8">

            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-lg font-bold">
                Now pay at your convenience
              </h2>

              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                NEW
              </span>
            </div>

            <p className="text-sm text-gray-700 mb-6">
              {paymentImages[currentImageIndex].description}
            </p>

            <div className="flex items-center justify-center gap-6 mb-6">

              <button onClick={prevImage}>
                <ChevronLeft />
              </button>

              <div className="w-40 h-40 bg-pink-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl">👩💳</div>
                  <div className="text-xs mt-2">Pay Now Available</div>
                </div>
              </div>

              <button onClick={nextImage}>
                <ChevronRight />
              </button>
            </div>
          </div>

          {/* ================= BUTTONS ================= */}
          <div className="flex gap-4 justify-center flex-wrap mb-12">

            <button
              onClick={() => router.push("/")}
              className="px-8 py-3 text-sm font-bold border border-black rounded"
            >
              CONTINUE SHOPPING
            </button>

            <button
              onClick={() => router.push("/account/orders")}
              className="px-8 py-3 text-sm font-bold text-white bg-pink-500 rounded"
            >
              VIEW ORDERS
            </button>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}