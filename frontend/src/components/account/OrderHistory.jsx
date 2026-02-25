// import { useAccount } from '../../hooks/useAccount';
// import { ShoppingBag } from 'lucide-react';

// export default function OrderHistory() {
//   const { orders } = useAccount();

//   if (orders.length === 0) {
//     return (
//       <div className="space-y-6">
//         <h2 className="text-3xl font-bold text-gray-900">Order History</h2>

//         <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-lg">
//           <ShoppingBag size={64} className="text-gray-300 mb-4" />
//           <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Orders Yet</h3>
//           <p className="text-gray-600 mb-6">You haven't placed any orders yet</p>
//           <a
//             href="/"
//             className="bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition"
//           >
//             Continue Shopping
//           </a>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <h2 className="text-3xl font-bold text-gray-900">Order History</h2>

//       <div className="space-y-4">
//         {orders.map((order) => (
//           <div key={order.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
//             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//               <div>
//                 <p className="text-sm text-gray-600">Order ID</p>
//                 <p className="font-semibold text-gray-900">{order.id}</p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-600">Date</p>
//                 <p className="font-semibold text-gray-900">{order.date}</p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-600">Total</p>
//                 <p className="font-semibold text-gray-900">₹{order.total}</p>
//               </div>
//               <button className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition">
//                 View Details
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }


"use client";

import { useAccount } from "@/hooks/useAccount";
import { ShoppingBag } from "lucide-react";

export default function OrderHistory() {
  const { orders } = useAccount();

  if (!orders?.length) {
    return (
      <div className="w-full flex flex-col items-center">

        <h2 className="text-2xl font-bold text-gray-800 mb-8 w-full max-w-6xl">
          Order History
        </h2>

        {/* CENTER BOX */}
<div className="w-full max-w-6xl border border-pink-100 bg-pink-50 p-4">
  <div className="bg-white border border-pink-100 min-h-[280px] flex flex-col items-center justify-center py-8">

    <div className="flex flex-col items-center text-center">

      <ShoppingBag
        size={56}
        className="text-black mb-3"
        strokeWidth={1.8}
      />

      <h3 className="text-4xl font-bold text-black mb-2">
        No Item's
      </h3>

      <p className="text-gray-500 text-lg mb-5 leading-snug">
        You haven't placed any orders yet.
      </p>

      <button
        onClick={() => (window.location.href = "/")}
        className="
          bg-pink-600
          text-white
          font-semibold
          text-[22px]
          px-12
          py-2.5
          rounded-sm
          hover:bg-pink-600
          transition-none
        "
      >
        Continue Shopping
      </button>

    </div>

  </div>
</div>

      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-8 w-full max-w-6xl">
        Order History
      </h2>

      <div className="space-y-4 w-full max-w-6xl">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-pink-200 transition"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                  Order ID
                </p>
                <p className="text-sm font-medium text-gray-800">
                  {order.id}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                  Date
                </p>
                <p className="text-sm font-medium text-gray-800">
                  {order.date}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                  Total
                </p>
                <p className="text-sm font-medium text-gray-800">
                  ₹{order.total}
                </p>
              </div>

              <div className="flex justify-start md:justify-end">
                <button className="text-pink-600 hover:text-pink-700 font-medium text-sm transition">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}