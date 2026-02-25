// import { useAccount } from '../../hooks/useAccount';
// import { Copy, Trash2 } from 'lucide-react';

// export default function MyCoupons() {
//   const { coupons } = useAccount();

//   return (
//     <div className="space-y-6">
//       <h2 className="text-3xl font-bold text-gray-900">My Coupons</h2>

//       <div className="space-y-4">
//         {coupons.map((coupon) => (
//           <div key={coupon.id} className="border-2 border-pink-200 rounded-lg p-6 bg-gradient-to-r from-pink-50 to-white hover:shadow-md transition">
//             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//               <div className="flex-1">
//                 <h3 className="text-2xl font-bold text-pink-600 mb-2">{coupon.discount}</h3>
//                 <div className="space-y-2">
//                   <div className="flex items-center gap-2">
//                     <code className="bg-white border-2 border-gray-300 px-3 py-1 rounded font-mono font-semibold text-gray-800">
//                       {coupon.code}
//                     </code>
//                     <button className="p-1 hover:bg-gray-100 rounded transition" title="Copy coupon code">
//                       <Copy size={18} className="text-gray-600" />
//                     </button>
//                   </div>
//                   <p className="text-sm text-gray-600">{coupon.minPurchase}</p>
//                   <p className="text-xs text-gray-500">Expiry: {coupon.expiry}</p>
//                 </div>
//               </div>
//               <button className="text-red-500 hover:text-red-700 transition p-2">
//                 <Trash2 size={20} />
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
import { Copy } from "lucide-react";

export default function MyCoupons() {
  const { coupons } = useAccount();

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        My coupon || Clovia
      </h2>

      <div className="space-y-3">

        {coupons?.map((coupon) => (
          <div
            key={coupon.id}
            className="border border-gray-300 bg-white w-full"
          >
            <div className="flex">

              {/* LEFT DISCOUNT BLOCK */}
              <div className="w-[220px] min-h-[130px] border-r border-gray-300 flex items-center justify-center">
                <p className="text-pink-600 font-semibold text-[34px] leading-none text-center">
                  {coupon.discount}
                </p>
              </div>

              {/* RIGHT CONTENT */}
              <div className="flex-1 flex justify-between p-5">

                <div>
                  <div className="inline-block border border-dashed border-gray-400 px-3 py-1 text-sm font-medium mb-3">
                    Code: {coupon.code}
                  </div>

                  <p className="text-gray-700 text-lg mb-2">
                    {coupon.minPurchase}
                  </p>

                  <p className="text-gray-500 italic text-lg">
                    {coupon.expiry}
                  </p>
                </div>

                {/* COPY ICON RIGHT */}
                <button className="text-pink-500 hover:text-pink-600 self-start">
                  <Copy size={22} />
                </button>

              </div>

            </div>
          </div>
        ))}

      </div>
    </div>
  );
}