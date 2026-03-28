"use client";
import { Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartItem({ item }) {
  const { updateQty, removeItem } = useCart();

  return (
    <div className="flex gap-6 border p-5 rounded-lg bg-white">
      <img
        src={item.image}
        className="w-28 h-36 object-cover rounded"
      />

      <div className="flex-1">
        <h3 className="font-semibold">{item.name}</h3>
        <p className="text-sm text-gray-500 mb-2">
          ₹{item.price}
        </p>

        <div className="flex gap-4 items-center">
          <select
            value={item.quantity}
            onChange={(e) =>
              updateQty(item.id, e.target.value)
            }
            className="border px-2 py-1 rounded"
          >
            {[1, 2, 3, 4, 5].map((q) => (
              <option key={q}>{q}</option>
            ))}
          </select>

          <button
            onClick={() => removeItem(item.id)}
            className="text-red-500 flex items-center gap-1"
          >
            <Trash2 size={16} /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}
