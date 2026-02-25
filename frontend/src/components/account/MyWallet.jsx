// import { useAccount } from '../../hooks/useAccount';
// import { Wallet } from 'lucide-react';

// export default function MyWallet() {
//   const { wallet } = useAccount();

//   return (
//     <div className="space-y-6">
//       <h2 className="text-3xl font-bold text-gray-900">My Wallet</h2>

//       <div className="bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-lg p-8 shadow-lg">
//         <div className="flex items-center gap-4 mb-6">
//           <div className="bg-white bg-opacity-20 p-3 rounded-lg">
//             <Wallet size={32} />
//           </div>
//           <div>
//             <p className="text-pink-100 text-sm font-medium">Available Balance</p>
//             <p className="text-4xl font-bold">₹{wallet.balance.toLocaleString('en-IN')}</p>
//           </div>
//         </div>
//         <button className="bg-white text-pink-600 px-6 py-2 rounded-lg font-semibold hover:bg-pink-50 transition">
//           Add Money
//         </button>
//       </div>

//       <div className="space-y-4">
//         <h3 className="text-xl font-bold text-gray-900">Transaction History</h3>
//         {wallet.transactions.length === 0 ? (
//           <div className="bg-gray-50 p-8 rounded-lg text-center">
//             <p className="text-gray-600">No transactions yet</p>
//           </div>
//         ) : (
//           wallet.transactions.map((transaction) => (
//             <div key={transaction.id} className="border border-gray-200 p-4 rounded-lg flex justify-between items-center">
//               <div>
//                 <p className="font-semibold text-gray-900">{transaction.description}</p>
//                 <p className="text-sm text-gray-600">{transaction.date}</p>
//               </div>
//               <p className={`font-bold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
//                 {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
//               </p>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }


"use client";

import { useAccount } from "@/hooks/useAccount";
import { Wallet } from "lucide-react";

export default function MyWallet() {
  const { wallet } = useAccount();

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-8">My Wallet</h2>

      <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg p-8 text-white mb-8 shadow-lg">
        <p className="text-sm opacity-90 mb-2">Available Balance</p>
        <h3 className="text-4xl font-bold">
          ₹{wallet?.balance?.toLocaleString("en-IN")}
        </h3>
      </div>

      <button className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg font-semibold transition mb-8">
        Add Money
      </button>

      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-6">
          Account Statement
        </h3>

        {wallet?.transactions?.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-2 border border-gray-200 rounded-lg overflow-hidden">
            <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 font-semibold text-sm text-gray-700">
              <div>Transaction</div>
              <div>Credit/Debit</div>
              <div>Balance</div>
            </div>

            {wallet?.transactions?.map((transaction, index) => (
              <div
                key={index}
                className="grid grid-cols-3 gap-4 p-4 border-t border-gray-100 text-sm"
              >
                <div className="text-gray-700">
                  {transaction.description}
                </div>

                <div
                  className={
                    transaction.type === "credit"
                      ? "text-green-600 font-medium"
                      : "text-red-600 font-medium"
                  }
                >
                  {transaction.type === "credit" ? "+" : "-"}₹
                  {transaction.amount}
                </div>

                <div className="text-gray-700">{transaction.date}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}