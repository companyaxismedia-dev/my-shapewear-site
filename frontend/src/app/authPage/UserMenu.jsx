
"use client";
import Link from "next/link";
import { User, LogOut, Heart, Package2, TicketPercent } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { SkeletonBlock } from "@/components/loaders/Loaders";

export default function UserMenu({ openLogin, openRegister }) {
  const { user, logout, loading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (loading) {
    return <SkeletonBlock className="h-8 w-8 rounded-full" />;
  }

  const handleUserClick = () => {
    if (!user) {
      openLogin();
      setDropdownOpen(false); // just in case
    } else {
      setDropdownOpen((prev) => !prev);
    }
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setDropdownOpen(true)}
      onMouseLeave={() => setDropdownOpen(false)}
    >
      {/* USER ICON BUTTON */}
      <button
        className="p-1 hover:text-[#C56F7F] relative z-10 cursor-pointer"
        onClick={handleUserClick}
        aria-haspopup="true"
        aria-expanded={dropdownOpen}
        aria-label="User menu"
        type="button"
      >
        <User size={22} />
      </button>
      {/* HOVER GAP BRIDGE */}
      {/* <div className="absolute flex top-full right-0 w4 h-3 bg-transparent"></div> */}

      {/* DROPDOWN */}
      <div
        className={`
          absolute right-[-78px] top-[calc(100%+12px)] z-[200] w-[264px] translate-x-0 justify-end rounded-[22px] border border-[#ead7dd] bg-[linear-gradient(180deg,#fffdfd_0%,#fff8fa_100%)] shadow-[0_24px_60px_rgba(74,46,53,0.16)] transition-all duration-300 sm:right-1/2 sm:w-[316px] sm:translate-x-[calc(50%-16px)] sm:rounded-[24px]
          ${dropdownOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"}
        `}
      >
        {/* ARROW */}
        <div className="absolute -top-2 right-[88px] h-4 w-4 rotate-45 border-l border-t border-[#ead7dd] bg-[#fffafb] sm:left-auto sm:right-[130px] sm:translate-x-0"></div>

        {!user ? (
          <>
            <div className="border-b border-[#ead7dd] px-4 py-3.5 sm:px-5 sm:py-4">
              <p
                className="text-[20px] leading-none text-[#4a2e35]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Welcome
              </p>
              <p className="mt-2 text-sm text-[#876c74]">
                Sign in to access your account, wishlist, and bag.
              </p>
            </div>

            <div className="flex gap-2.5 p-3.5 sm:gap-3 sm:p-4">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  openRegister();
                }}
                className="flex-1 rounded-[16px] border border-[#c56f7f] py-3 font-semibold tracking-[0.04em] text-[#c0566d] transition hover:bg-[#fff2f6]"
              >
                SIGNUP
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  openLogin();
                }}
                className="flex-1 rounded-[16px] bg-[linear-gradient(135deg,#c56f7f_0%,#e48398_100%)] py-3 font-semibold tracking-[0.04em] text-white shadow-[0_14px_28px_rgba(197,111,127,0.22)] transition hover:brightness-[1.03]"
              >
                LOGIN
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="border-b border-[#ead7dd] px-4 py-3.5 sm:px-5 sm:py-4">
              <p
                className="mt-1 text-[18px] leading-none text-[#4a2e35] sm:text-[20px]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Hi, {user?.name || "User"}
              </p>
              {user?.email ? (
                <p className="mt-1.5 truncate text-[12px] text-[#876c74] sm:text-[13px]">{user.email}</p>
              ) : null}
            </div>

            <div className="flex flex-col px-2 py-1.5 text-[14px] sm:py-2 sm:text-[13px]">
              {[
                ["My Orders", "/account/orders"],
                ["Buy Again", "/buy-again"],
                ["My Recommendations", "/recommendations"],
                ["My Account", "/account/dashboard"],
                ["Wishlist", "/wishlist"],
                ["My Coupons", "/account/coupons"],
                ["Contact us", "/faq#contact-us"],
                ["About us", "/about"],

              ].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setDropdownOpen(false)}
                  className="rounded-2xl px-3.5 py-2 tracking-wide text-[#5f4950] transition hover:bg-[#fff1f5] hover:text-[#c0566d] sm:px-3.5 sm:py-2.5"
                >
                  {label}
                </Link>
              ))}

              <button
                onClick={handleLogout}
                className="mt-1 flex items-center gap-2 rounded-2xl px-3.5 py-2 text-[#b1485c] transition hover:bg-[#fff1f5] sm:px-3.5 sm:py-2.5"
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
