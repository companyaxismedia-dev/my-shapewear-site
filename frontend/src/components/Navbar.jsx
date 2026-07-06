"use client";
import React, { useEffect, useState } from "react";
import LinkNav from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import {
  ShoppingCart,
  User,
  Menu,
  HelpCircle,
  Package,
  X,
  ChevronDown,
  Store,
  Smartphone,
  ContactIcon,
  LogOut,
} from "lucide-react";
import SearchSection from "./SearchSection";
import LoginModal from "@/app/authPage/LoginModal";
import RegisterModal from "@/app/authPage/RegisterModal";
import UserMenu from "@/app/AccountPage/UserMenu";
import WishlistButton from "@/app/wishlist/WishlistButton";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCategories } from "@/context/CategoryContext";

export default function Navbar({ onLoginToggle }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isBraHovered, setIsBraHovered] = useState(false);
  const [mobileBraOpen, setMobileBraOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    if (onLoginToggle) {
      onLoginToggle(loginOpen);
    }
  }, [loginOpen, onLoginToggle]);

  const { cartItems } = useCart();
  const cartCount =
    cartItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  // Consume categories from context
  const { categories, loadingCats } = useCategories();
  

  // Replace isBraHovered with a dynamic active category ID
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Ref to hold the timeout so we can clear it
  const hoverTimeoutRef = React.useRef(null);

  const handleMouseEnter = (categoryId) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setActiveMenuId(categoryId);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveMenuId(null);
    }, 300); // 300ms delay before closing
  };

  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap");
        .clovia-font {
          font-family: "Great Vibes", cursive;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <header className="w-full font-sans shadow-sm sticky top-0 z-[100] bg-white">
        {/* ================= FIXED TOP HEADER BAR ================= */}
        <div className="hidden md:block text-[10px] font-semibold uppercase">
          <div className="w-full px-4 md:px-8 h-8 flex items-center justify-between text-gray-600 leading-none">
            {/* Left Side */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-[11px]">🚚 Free Returns</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11px]">🔒 100% Privacy</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11px]">💵 Cash on Delivery</span>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-6">
              <LinkNav href="/track" className="text-pink-600">
                Track Order
              </LinkNav>
              <LinkNav
                href="/app"
                className="flex items-center gap-1 hover:text-pink-600"
              >
                <Smartphone size={12} /> Download App
              </LinkNav>
              <LinkNav
                href="/stores"
                className="flex items-center gap-1 hover:text-pink-600"
              >
                <Store size={12} /> Our Stores
              </LinkNav>
            </div>
          </div>
        </div>

        {/* ================= MAIN LOGO BAR ================= */}
        <div className="bg-white px-4 md:px-6 lg:px-10 border-b border-gray-50">
          <div className="w-full flex items-center justify-between relative py-2">
            <div
              className={`flex items-center z-10 w-[45%] ${isSearchOpen ? "invisible md:visible" : ""}`}
            >
              <button
                className="lg:hidden text-black p-2 -ml-2 rounded-md active:bg-pink-100"
                onClick={() => setMenuOpen(true)}
              >
                <Menu size={26} />
              </button>
            </div>

            {/* Logo Section */}
            <div
              className={`absolute inset-0 flex items-center justify-center pointer-events-none z-[100] ${isSearchOpen ? "hidden md:flex" : "flex"}`}
            >
              <LinkNav href="/" className=" items-center pointer-events-auto">
                <div className="relative w-[170px] h-[56px] md:w-[210px] md:h-[70px] lg:w-[240px] lg:h-[80px] -ml-15 lg:mt-0 md:-ml-45 lg:-ml-1">
                  <Image
                    src="/hero-image/glovialogo.png"
                    alt="Glovia Logo"
                    fill
                    sizes="(max-width: 768px) 170px, (max-width: 1024px) 210px, 240px"
                    priority
                    className="object-contain duration-300 hover:scale-105 -ml-7 lg:ml-2 mt-1 lg:mt-[-9]"
                  />
                </div>
              </LinkNav>
            </div>

            <div className="flex items-center justify-end sm:gap-1 lg:gap-2 md:gap-2 text-gray-700 z-10 w-[45%]">
              <SearchSection
                onToggleMobileSearch={(val) => setIsSearchOpen(val)}
              />
              <LinkNav
                href="/help"
                className=" hidden sm:flex p-1 hover:text-pink-600 transition"
              >
                <HelpCircle size={22} />
              </LinkNav>
              <div
                className={`flex items-center gap-1 lg:gap-2 ${isSearchOpen ? "hidden md:flex" : "flex"}`}
              >
                <UserMenu
                  openLogin={() => setLoginOpen(true)}
                  openRegister={() => setRegisterOpen(true)}
                />
                <WishlistButton onLoginOpen={() => setLoginOpen(true)} />
                <LinkNav href="/cart" className="relative p-1">
                  <ShoppingCart size={22} />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 bg-pink-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse">
                      {cartCount}
                    </span>
                  )}
                </LinkNav>
              </div>
            </div>
          </div>
        </div>

        {/* ================= DESKTOP NAV ================= */}
        <nav className="hidden lg:block bg-black text-white px-4 md:px-10">
          <div className="w-full flex items-center justify-center gap-6 xl:gap-10 py-3 text-[11px] xl:text-[13px] font-semibold uppercase tracking-wider relative">
            <LinkNav
              href="/"
              className="text-pink-400 hover:text-white transition-colors"
            >
              Home
            </LinkNav>

            {categories?.filter((cat) => cat.isActive)?.map((cat, index) => {
              const hasGroups = cat.groups && cat.groups.length > 0;
              const isMenuOpen = activeMenuId === cat._id;

              if (hasGroups) {
                return (
                  <div
                    key={cat._id}
                    className="group px-3"
                    onMouseEnter={() => handleMouseEnter(cat._id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <LinkNav
                      href={`/${cat.slug}`}
                      className="hover:text-pink-400 transition-colors flex items-center gap-1"
                    >
                      {cat.name}{" "}
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-300 ${isMenuOpen ? "rotate-180" : ""}`}
                      />
                    </LinkNav>

                    {isMenuOpen && (
                      <div
                        className="absolute top-full left-0 w-full z-[110]"
                        onMouseEnter={() => handleMouseEnter(cat._id)}
                        onMouseLeave={handleMouseLeave}
                      >
                        {/* Bridge gap for continuous hovering */}
                        <div className="h-[15px] w-full bg-transparent"></div>

                        <div className="bg-white text-black shadow-2xl border-t-2 flex animate-in fade-in slide-in-from-top-2 w-full mt-[-13px]">
                          {/* Left Panel */}
                          <div className="w-1/4 bg-gray-50 border-r border-gray-100 flex flex-col uppercase min-h-[300px]">
                            <div className="p-6 border-b border-gray-200 bg-pink-50 text-pink-600 font-bold">
                              {cat.name} Collections
                            </div>
                            {cat.groups.map((group) => (
                              <div
                                key={group._id}
                                className="p-4 border-b border-gray-100 hover:bg-white cursor-pointer hover:text-pink-600 font-medium"
                              >
                                {group.leftPanelName}
                              </div>
                            ))}
                          </div>

                          {/* Right Columns Dynamically Mapped */}
                          <div className="w-3/4 flex flex-wrap gap-10 p-10 bg-white">
                            {cat.groups.map((group) => (
                              <div key={group._id} className="min-w-[150px]">
                                <h3 className="font-black text-pink-600 mb-4 text-[13px] border-b-2 border-pink-100 pb-2 uppercase tracking-tight">
                                  {group.title}
                                </h3>
                                <ul className="flex flex-col gap-3">
                                  {group.items.map((item) => (
                                    <li key={item._id}>
                                      <LinkNav
                                        href={
                                          item.path ||
                                          `/${cat.slug}/${item.slug}`
                                        }
                                        className="hover:text-pink-600 text-[11px] font-bold transition-all hover:translate-x-1 block"
                                      >
                                        {item.name}
                                      </LinkNav>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              // Normal Flat Links
              return (
                <Link
                  key={cat._id}
                  href={`/${cat.slug}`}
                  className="hover:text-pink-400 transition-colors"
                >
                  <span>{cat.name}</span>
                </Link>
              );
            })}

            <LinkNav
              href="/exclusive"
              className="bg-pink-600 px-3 py-1 rounded-sm whitespace-nowrap"
            >
              Sales
            </LinkNav>
          </div>
        </nav>

        <div className="bg-[#e50075] text-white text-center py-2 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">
          Valentine Special: Buy 2 Get 1 Free on Best Sellers
        </div>
      </header>

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        openRegister={() => {
          setLoginOpen(false);
          setRegisterOpen(true);
        }}
      />

      <RegisterModal
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        openLogin={() => {
          setLoginOpen(true);
          setRegisterOpen(false);
        }}
      />

      {/* ================= MOBILE DRAWER ================= */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/60 lg:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="bg-white w-[85%] md:w-[45%] h-full overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#e50075] p-4 flex items-center justify-between text-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <User size={20} fill="white" />
                <div className="flex items-center gap-1 font-medium text-[15px]">
                  {user ? (
                    <span>Hi, {user.name}</span>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setLoginOpen(true);
                        }}
                        className="hover:underline"
                      >
                        Login
                      </button>
                      <span>&</span>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setRegisterOpen(true);
                        }}
                        className="hover:underline"
                      >
                        SignUp
                      </button>
                    </>
                  )}
                </div>
              </div>
              <X
                size={24}
                className="text-white cursor-pointer opacity-90 hover:opacity-100"
                onClick={() => setMenuOpen(false)}
              />
            </div>

            <div className="p-2 flex flex-col font-bold text-sm uppercase tracking-widest divide-y divide-gray-100">
              <LinkNav
                href="/"
                className="px-6 py-5 active:bg-pink-50"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </LinkNav>

              {categories?.map((cat) => {
                const hasGroups = cat.groups && cat.groups.length > 0;
                const isMobileOpen = activeMenuId === cat._id;

                if (hasGroups) {
                  return (
                    <div className="flex flex-col" key={cat._id}>
                      <div
                        className="px-6 py-5 active:bg-pink-50 flex justify-between items-center cursor-pointer"
                        onClick={() =>
                          setActiveMenuId(isMobileOpen ? null : cat._id)
                        }
                      >
                        <span className={isMobileOpen ? "text-pink-600" : ""}>
                          {cat.name}
                        </span>
                        <ChevronDown
                          size={18}
                          className={`transition-transform duration-300 ${isMobileOpen ? "rotate-180 text-pink-600" : ""}`}
                        />
                      </div>

                      {isMobileOpen && (
                        <div className="bg-gray-50 px-8 py-4 flex flex-col gap-6 lowercase">
                          {cat.groups.map((group) => (
                            <div key={group._id}>
                              <h3 className="text-[10px] text-pink-500 font-black uppercase mb-3 tracking-tighter">
                                {group.title}
                              </h3>
                              <div className="flex flex-col gap-3 border-l-2 border-pink-100 pl-4">
                                {group.items.map((sub) => (
                                  <LinkNav
                                    key={sub._id}
                                    href={
                                      sub.path || `/${cat.slug}/${sub.slug}`
                                    }
                                    className="text-gray-600 text-[12px] font-medium"
                                    onClick={() => setMenuOpen(false)}
                                  >
                                    {sub.name}
                                  </LinkNav>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                // Normal Flat Links
                return (
                  <LinkNav
                    key={cat._id}
                    href={`/${cat.slug}`}
                    className="px-6 py-5 active:bg-pink-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    {cat.name}
                  </LinkNav>
                );
              })}
              <LinkNav
                href="/track"
                className="px-6 py-5 active:bg-pink-50 flex items-center gap-2"
                onClick={() => setMenuOpen(false)}
              >
                <Package size={18} /> Track Order
              </LinkNav>
              <LinkNav
                href="/contact"
                className="px-6 py-5 active:bg-pink-50 flex items-center gap-2"
                onClick={() => setMenuOpen(false)}
              >
                <ContactIcon size={18} /> Contact Us
              </LinkNav>
              <LinkNav
                href="/help"
                className="px-6 py-5 active:bg-pink-50 flex items-center gap-2"
                onClick={() => setMenuOpen(false)}
              >
                <HelpCircle size={18} /> Help
              </LinkNav>
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="px-6 py-5 active:bg-pink-50 flex items-center gap-2"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
