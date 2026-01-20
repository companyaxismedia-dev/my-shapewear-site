"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag
} from "lucide-react";

export default function CartPage() {
  const { cart, removeFromCart, updateQty, cartTotal } = useCart();

  /* EMPTY CART */
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <ShoppingBag size={72} className="text-gray-200 mb-4" />
        <h1 className="text-2xl sm:text-3xl font-black italic uppercase">
          Your Cart is Empty
        </h1>
        <p className="text-gray-500 mt-2 mb-6 font-bold text-sm">
          Looks like you haven't added any shapewear yet.
        </p>
        <Link
          href="/"
          className="bg-black text-white px-8 py-4 rounded-full font-black uppercase italic shadow-lg"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-10 sm:py-14">

      <h1 className="text-2xl sm:text-3xl md:text-4xl font-black italic uppercase mb-8 tracking-tighter">
        Your Shopping Bag
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ================= ITEMS ================= */}
        <div className="lg:col-span-2 space-y-5">
          {cart.map((item) => (
            <div
              key={item.id}
              className="bg-white border rounded-2xl p-4 sm:p-5 flex gap-4 items-start sm:items-center"
            >
              {/* IMAGE */}
              <div className="w-20 h-28 sm:w-24 sm:h-32 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* DETAILS */}
              <div className="flex-1">
                <h3 className="font-black text-base sm:text-lg uppercase italic text-gray-900">
                  {item.name}
                </h3>

                <p className="text-blue-600 font-bold text-lg mt-1">
                  ₹{item.price.toLocaleString()}
                </p>

                {/* QTY + REMOVE */}
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <div className="flex items-center border-2 border-gray-200 rounded-xl">
                    <button
                      onClick={() =>
                        updateQty(item.id, Math.max(1, item.qty - 1))
                      }
                      className="p-3 hover:text-blue-600"
                    >
                      <Minus size={16} />
                    </button>

                    <span className="w-8 text-center font-black">
                      {item.qty}
                    </span>

                    <button
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      className="p-3 hover:text-blue-600"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ================= SUMMARY ================= */}
        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 h-fit lg:sticky lg:top-24">
          <h3 className="text-lg sm:text-xl font-black italic uppercase mb-5">
            Order Summary
          </h3>

          <div className="space-y-3 border-b border-gray-200 pb-4 text-sm">
            <div className="flex justify-between font-bold text-gray-500 uppercase">
              <span>Subtotal</span>
              <span>₹{cartTotal().toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-500 uppercase">
              <span>Shipping</span>
              <span className="text-green-600">FREE</span>
            </div>
          </div>

          <div className="flex justify-between items-center py-5">
            <span className="text-xl font-black italic uppercase">
              Total
            </span>
            <span className="text-xl font-black text-blue-600">
              ₹{cartTotal().toLocaleString()}
            </span>
          </div>

          <Link
            href="/checkout"
            className="w-full bg-black text-white py-4 sm:py-5 rounded-2xl font-black text-base sm:text-lg uppercase italic flex items-center justify-center gap-2 shadow-xl hover:bg-gray-800 transition-all"
          >
            Checkout Now <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
