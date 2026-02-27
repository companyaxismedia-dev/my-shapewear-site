"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";
import { Wallet } from "lucide-react";

export default function MyWallet() {
  const [walletData, setWalletData] = useState({
    balance: 0,
    transactions: [],
  });

  const [loading, setLoading] = useState(false);

  /* ================= FETCH WALLET ================= */
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const stored = JSON.parse(localStorage.getItem("user"));
        if (!stored?.token) return;

        setLoading(true);

        const res = await fetch(`${API_BASE}/api/users/wallet`, {
          headers: {
            Authorization: `Bearer ${stored.token}`,
          },
        });

        if (!res.ok) throw new Error("Wallet fetch failed");

        const data = await res.json();

        setWalletData({
          balance: data?.wallet?.balance || data?.balance || 0,
          transactions:
            data?.wallet?.transactions ||
            data?.transactions ||
            [],
        });
      } catch (err) {
        console.log("Wallet API safe error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, []);

  return (
    <div className="w-full">

      {/* TITLE (SMALL LIKE CLOVIA) */}
      <h2 className="text-[20px] font-semibold text-gray-900 mb-4">
       My Wallet
        </h2>

      {loading && (
        <p className="text-xs text-gray-500 mb-3">
          Loading wallet...
        </p>
      )}

      {/* ================= BALANCE CARD ================= */}
      <div className="border border-gray-200 mb-6 bg-white">

        <div className="flex items-center gap-3 px-4 py-3">

          <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
            <Wallet size={16} className="text-gray-600" />
          </div>

          <div>
            <p className="text-[14px] text-gray-700 leading-none">
              Clovia Credits
            </p>

            <p className="text-[28px] font-semibold text-black leading-tight mt-1">
              ₹{walletData.balance?.toLocaleString("en-IN")}
            </p>
          </div>

        </div>
      </div>

      {/* ================= ACCOUNT STATEMENT ================= */}
      <h3 className="text-[20px] font-semibold text-black mb-2">
       Account Statement
         </h3>

      <div className="border border-gray-200">

        {/* HEADER */}
        <div className="grid grid-cols-3 bg-gray-50 text-[12px] font-medium text-gray-700 px-4 py-2 border-b">
          <div>Transaction</div>
          <div>Credit/Debit</div>
          <div>Balance</div>
        </div>

        {/* EMPTY STATE */}
        {walletData.transactions.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-xs">
            Page 1 of
          </div>
        ) : (
          walletData.transactions.map((t, i) => (
            <div
              key={i}
              className="grid grid-cols-3 px-4 py-2 text-[11px] border-b last:border-0"
            >
              <div className="text-gray-700">
                {t.description || "Wallet Transaction"}
              </div>

              <div
                className={
                  t.type === "credit"
                    ? "text-green-600 font-medium"
                    : "text-red-600 font-medium"
                }
              >
                {t.type === "credit" ? "+" : "-"}₹{t.amount}
              </div>

              <div className="text-gray-700">
                ₹{t.balance || walletData.balance}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}