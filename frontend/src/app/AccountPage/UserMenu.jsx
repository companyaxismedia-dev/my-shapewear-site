"use client";
import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function UserMenu({ openLogin, openRegister }) {
  const { user, logout } = useAuth();

  return (
    <div className="relative group">
      {/* USER ICON */}
      <button className="p-1 hover:text-pink-600 relative z-10">
        <User size={22} />
      </button>

      {/* HOVER GAP BRIDGE */}
      <div className="absolute top-full right-0 w-14 h-3 bg-transparent"></div>

      {/* DROPDOWN */}
      <div
        className="
          absolute
          top-[calc(100%+6px)]
          right-0
          w-[320px]
          bg-white
          border
          rounded-xl
          shadow-2xl
          opacity-0
          invisible
          group-hover:opacity-100
          group-hover:visible
          transition-opacity
          duration-200
          z-[200]
        "
      >
        {/* ARROW (REFERENCE STYLE) */}
        <div className="absolute -top-2 right-7 w-4 h-4 bg-white rotate-45 border-l border-t"></div>

        {!user ? (
          <>
            <div className="p-5 border-b">
              <p className="font-semibold">Welcome</p>
              <p className="text-sm text-gray-500">
                To access your account
              </p>
            </div>

            <div className="flex gap-4 p-5">
              <button
                onClick={openRegister}
                className="flex-1 border border-pink-600 text-pink-600 py-2 rounded-lg font-semibold hover:bg-pink-50"
              >
                SIGNUP
              </button>
              <button
                onClick={openLogin}
                className="flex-1 bg-pink-600 text-white py-2 rounded-lg font-semibold hover:bg-pink-700"
              >
                LOGIN
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="p-5 border-b">
              <p className="font-semibold">Hi, {user.name}</p>
            </div>

            <div className="flex flex-col text-sm">
              {[
                ["My Orders", "/orders"],
                ["Buy Again", "/buy-again"],
                ["My Recommendations", "/recommendations"],
                ["My Account", "/account"],
                ["Wishlist", "/wishlist"],
                ["My Coupons", "/coupons"],
              ].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="px-6 py-3 hover:bg-gray-50 tracking-wide"
                >
                  {label}
                </Link>
              ))}

              <button
                onClick={logout}
                className="px-6 py-3 flex items-center gap-2 text-red-500 hover:bg-red-50"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
