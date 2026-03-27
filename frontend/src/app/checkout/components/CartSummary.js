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
    <div className="rounded-[24px] border border-[#ecd9de] bg-white/95 p-6 shadow-[0_10px_30px_rgba(74,46,53,0.05)]">
      <h3 className="mb-4 text-sm font-semibold tracking-[0.18em] text-[#7f646d]">
        PRICE DETAILS
      </h3>

      <div className="mb-2 flex justify-between text-[15px] text-[#5a3c46]">
        <span>Total</span>
        <span>₹{total}</span>
      </div>

      <button
        onClick={handleCheckout}
        className="mt-6 w-full rounded-full bg-[#c56f7f] py-3 text-sm font-semibold text-white"
      >
        PROCEED TO CHECKOUT
      </button>
    </div>
  );
}
