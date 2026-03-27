"use client";
import { Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartItem({ item }) {
  const { updateQty, removeItem } = useCart();

  return (
    <div className="flex gap-6 rounded-[24px] border border-[#ecd9de] bg-white/95 p-5 shadow-[0_10px_30px_rgba(74,46,53,0.05)]">
      <img
        src={item.image}
        className="h-36 w-28 rounded-[18px] object-cover"
      />

      <div className="flex-1">
        <h3 className="font-semibold text-[#4a2e35]">{item.name}</h3>
        <p className="mb-2 text-sm text-[#8d727b]">
          ₹{item.price}
        </p>

        <div className="flex gap-4 items-center">
          <select
            value={item.quantity}
            onChange={(e) =>
              updateQty(item.id, e.target.value)
            }
            className="rounded-full border border-[#e5d4d9] px-3 py-1.5 text-sm text-[#5a3c46] outline-none"
          >
            {[1, 2, 3, 4, 5].map((q) => (
              <option key={q}>{q}</option>
            ))}
          </select>

          <button
            onClick={() => removeItem(item.id)}
            className="flex items-center gap-1 text-[#c56f7f]"
          >
            <Trash2 size={16} /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}
