"use client";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function CartSummary({ openLogin }) {
  const { user } = useAuth();
  const { cartItems } = useCart();

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    if (!user) {
      openLogin();
      return;
    }
    window.location.href = "/checkout";
  };

  return (
    <div className="border p-6 rounded-lg bg-white">
      <h3 className="font-semibold mb-4">
        PRICE DETAILS
      </h3>

      <div className="flex justify-between mb-2">
        <span>Total</span>
        <span>₹{total}</span>
      </div>

      <button
        onClick={handleCheckout}
        className="w-full mt-6 bg-pink-600 text-white py-3 rounded-lg font-semibold"
      >
        PROCEED TO CHECKOUT
      </button>
    </div>
  );
}
