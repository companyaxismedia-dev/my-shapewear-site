"use client";
import React, { useEffect, useState } from "react";
import LinkNav from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import {ShoppingCart,User,Menu,HelpCircle,Package,X,ChevronDown,ContactIcon,LogOut} from "lucide-react";
import SearchSection from "./SearchSection";
import LoginModal from "@/app/authPage/LoginModal";
import RegisterModal from "@/app/authPage/RegisterModal";
import UserMenu from "@/app/authPage/UserMenu";
import WishlistButton from "@/app/wishlist/WishlistButton";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

const NAV_LINKS_SIMPLE = [
  { name: "Bras", path: "/bra" },
  { name: "Panties", path: "/panties" },
  { name: "Lingerie", path: "/lingerie" },
  { name: "Shapewear", path: "/shapewear" },
  { name: "Curvy", path: "/curvy" },
  { name: "Tummy Control", path: "/tummy-control" },
];

const NAV_LINKS_HOME = [
  { name: "Panties", path: "/panties" },
  { name: "Lingerie", path: "/lingerie" },
  { name: "Shapewear", path: "/shapewear" },
  { name: "Curvy", path: "/curvy" },
  { name: "Tummy Control", path: "/tummy-control" },
  { name: "Accessories", path: "/accessories" },
];

const BRA_CATEGORIES = {
  styles: [
    { name: "Padded Bras", path: "/bra/padded" },
    { name: "Push-up Bras", path: "/bra/push-up" },
    { name: "T-Shirt Bras", path: "/bra/t-shirt" },
    { name: "Bralettes", path: "/bra/bralette" },
    { name: "Sports Bras", path: "/bra/sports" },
  ],
  padding: [
    { name: "Non Padded", path: "/bra/non-padded" },
    { name: "Lightly Padded", path: "/bra/lightly-padded" },
    { name: "Heavily Padded", path: "/bra/heavily-padded" },
  ],
  coverage: [
    { name: "Full Coverage", path: "/bra/full" },
    { name: "Medium Coverage", path: "/bra/medium" },
    { name: "Demi Cup", path: "/bra/demi" },
  ],
  solutions: [
    { name: "Backless Solution", path: "/bra/backless" },
    { name: "Bridal Wear", path: "/bra/bridal" },
    { name: "Maternity Bras", path: "/bra/maternity" },
    { name: "Teenager Bras", path: "/bra/teenager" },
  ],
};

const DRAWER_LINKS = [
  { name: "Home", path: "/" },
  { name: "Bras", path: "/bra" },
  { name: "Panties", path: "/panties" },
  { name: "Lingerie", path: "/lingerie" },
  { name: "Shapewear", path: "/shapewear" },
  { name: "Curvy", path: "/curvy" },
  { name: "Tummy Control", path: "/tummy-control" },
];

// SHARED COMPONENTS

// Logo Component
function Logo({ width = "w-[150px]", height = "h-[40px]" }) {
  return (
    <LinkNav href="/" className="flex items-center">
      <div className={`relative ${width} ${height} md:w-[180px] md:h-[50px] lg:w-[110px] lg:h-[55px]`}>
        <Image
          src="/hero-image/glovialogo.png"
          alt="Glovia Logo"
          fill
          sizes="(max-width: 768px) 170px, (max-width: 1024px) 210px, 240px"
          priority
          className="block object-contain duration-300 hover:scale-105"
        />
      </div>
    </LinkNav>
  );
}

// Nav Actions Component (Search, User, Wishlist, Cart)
function NavActions({ isSearchOpen, setIsSearchOpen, setLoginOpen, setRegisterOpen }) {
  const { cartItems } = useCart();
  const cartCount = cartItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <div className={`flex items-center gap-2 ${isSearchOpen ? "hidden md:flex" : "flex"}`}>
      <div className="hidden lg:flex items-center gap-2">
        <SearchSection onToggleMobileSearch={(val) => setIsSearchOpen(val)} />
      </div>

      <UserMenu
        openLogin={() => setLoginOpen(true)}
        openRegister={() => setRegisterOpen(true)}
      />
      <WishlistButton onLoginOpen={() => setLoginOpen(true)} />
      <LinkNav href="/cart" className="relative p-1.5 transition-colors" style={{ color: "var(--color-body)" }}>
        <ShoppingCart size={22} className="hover:text-[var(--color-primary)] transition-colors" />
        {cartCount > 0 && (
          <span
            className="absolute top-0 right-0 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse"
            style={{ background: "var(--color-primary)" }}
          >
            {cartCount}
          </span>
        )}
      </LinkNav>
      <LinkNav href="/help" className="hidden sm:flex p-1 hover:text-[var(--color-primary)] transition">
        <HelpCircle size={22} />
      </LinkNav>
    </div>
  );
}

// Mobile Search Toggle
function MobileSearchToggle({ isSearchOpen, setIsSearchOpen }) {
  return (
    <div className={`flex lg:hidden ${isSearchOpen ? "hidden" : "flex"}`}>
      <SearchSection onToggleMobileSearch={(val) => setIsSearchOpen(val)} />
    </div>
  );
}

// Mobile Drawer Component
function MobileDrawer({ menuOpen, setMenuOpen, loginOpen, setLoginOpen, registerOpen, setRegisterOpen, isSearchOpen, setIsSearchOpen }) {
  const { user, logout } = useAuth();

  if (!menuOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] lg:hidden"
      style={{ background: "rgba(74,46,53,0.35)" }}
      onClick={() => setMenuOpen(false)}
    >
      <div
        className="w-[85%] md:w-[45%] h-full overflow-y-auto flex flex-col"
        style={{ background: "var(--color-bg)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-5 py-4"
          style={{ background: "var(--color-primary)", color: "#FFF9FA" }}
        >
          <div className="flex items-center gap-3">
            <User size={20} />
            {user ? (
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
                Hi, {user?.name || (typeof window !== 'undefined' && JSON.parse(localStorage.getItem('user') || '{}').name) || 'User'}
              </span>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => { setMenuOpen(false); setLoginOpen(true); }}
                  style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}
                  className="hover:underline"
                >
                  Login
                </button>
                <span className="opacity-60">/</span>
                <button
                  onClick={() => { setMenuOpen(false); setRegisterOpen(true); }}
                  style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}
                  className="hover:underline"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
          <X
            size={22}
            className="cursor-pointer opacity-80 hover:opacity-100"
            onClick={() => setMenuOpen(false)}
          />
        </div>

        {/* Drawer Links */}
        <div className="flex flex-col divide-y" style={{ divideColor: "var(--color-border)" }}>
          {DRAWER_LINKS.map((link) => (
            <LinkNav
              key={link.name}
              href={link.path}
              onClick={() => setMenuOpen(false)}
              className="px-6 py-4 text-sm font-medium transition-colors"
              style={{ color: "var(--color-heading)", fontFamily: "var(--font-body)", fontWeight: 500 }}
            >
              {link.name}
            </LinkNav>
          ))}

          <LinkNav
            href="/track"
            onClick={() => setMenuOpen(false)}
            className="px-6 py-4 text-sm font-medium flex items-center gap-2"
            style={{ color: "var(--color-heading)", fontFamily: "var(--font-body)" }}
          >
            <Package size={16} style={{ color: "var(--color-primary)" }} /> Track Order
          </LinkNav>
          <LinkNav
            href="/contact"
            onClick={() => setMenuOpen(false)}
            className="px-6 py-4 text-sm font-medium flex items-center gap-2"
            style={{ color: "var(--color-heading)", fontFamily: "var(--font-body)" }}
          >
            <ContactIcon size={16} style={{ color: "var(--color-primary)" }} /> Contact Us
          </LinkNav>
          <LinkNav
            href="/help"
            onClick={() => setMenuOpen(false)}
            className="px-6 py-4 text-sm font-medium flex items-center gap-2"
            style={{ color: "var(--color-heading)", fontFamily: "var(--font-body)" }}
          >
            <HelpCircle size={16} style={{ color: "var(--color-primary)" }} /> Help
          </LinkNav>

          {user && (
            <button
              onClick={() => { logout(); setMenuOpen(false); }}
              className="px-6 py-4 text-sm font-medium flex items-center gap-2 text-left"
              style={{ color: "var(--color-primary-hover)", fontFamily: "var(--font-body)" }}
            >
              <LogOut size={16} /> Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Modals Component
function NavModals({ loginOpen, setLoginOpen, registerOpen, setRegisterOpen }) {
  return (
    <>
      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        openRegister={() => { setLoginOpen(false); setRegisterOpen(true); }}
      />
      <RegisterModal
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        openLogin={() => { setLoginOpen(true); setRegisterOpen(false); }}
      />
    </>
  );
}

// HOME NAVBAR
function HomeNavbar({ onLoginToggle }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isBraHovered, setIsBraHovered] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (onLoginToggle) {
      onLoginToggle(loginOpen);
    }
  }, [loginOpen, onLoginToggle]);

  return (
    <>
      <header className="imkaa-site-header imkaa-header w-full sticky top-0 z-[100]">
        {/* MAIN NAVBAR */}
        <div style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
          <div className="container-imkaa">
            <div className="grid grid-cols-3 items-center min-h-[56px] md:min-h-[64px] lg:min-h-[68px]">
              {/* Left: Hamburger */}
              <div className="flex items-center gap-2">
                <button
                  className="lg:hidden p-2 rounded-md transition"
                  style={{ color: "var(--color-body)", background: "transparent" }}
                  onClick={() => setMenuOpen(true)}
                >
                  <Menu size={24} />
                </button>
              </div>

              {/* Center: Logo */}
              <div className="flex items-center justify-center">
                <Logo />
              </div>

              {/* Right: Actions */}
              <div className="flex items-center justify-end gap-2">
                <NavActions
                  isSearchOpen={isSearchOpen}
                  setIsSearchOpen={setIsSearchOpen}
                  setLoginOpen={setLoginOpen}
                  setRegisterOpen={setRegisterOpen}
                />
              </div>
            </div>
          </div>
        </div>

        {/* DESKTOP NAV WITH BRA DROPDOWN */}
        <nav className="hidden lg:block" style={{ background: "var(--color-bg-alt)", borderBottom: "1px solid var(--color-border)" }}>
          <div className="container-imkaa flex items-center justify-center gap-2 xl:gap-4 py-2">
            <LinkNav href="/" className="imkaa-nav-link px-3 py-1.5 rounded-full transition"
              style={{ color: "var(--color-primary)", fontWeight: 600 }}>
              Home
            </LinkNav>

            {/* Bras Dropdown */}
            <div className="relative group"
              onMouseEnter={() => setIsBraHovered(true)}
              onMouseLeave={() => setIsBraHovered(false)}>
              <LinkNav href="/bra"
                className="flex items-center gap-1 px-3 py-1.5 imkaa-nav-link rounded-full transition">
                Bras
                <ChevronDown size={13}
                  className={`transition-transform duration-300 ${isBraHovered ? "rotate-180" : ""}`}
                  style={{ color: "var(--color-primary)" }} />
              </LinkNav>

              {isBraHovered && (
                <div className="fixed top-[110px] left-0 w-full z-[110]"
                  onMouseEnter={() => setIsBraHovered(true)}
                  onMouseLeave={() => setIsBraHovered(false)}>
                  <div className="h-3 w-full bg-transparent" />
                  <div className="shadow-2xl border-t flex animate-in fade-in slide-in-from-top-2"
                    style={{ background: "var(--color-bg)", borderTopColor: "var(--color-border)" }}>
                    <div className="w-1/4 border-r flex flex-col"
                      style={{ background: "var(--color-bg-alt)", borderRightColor: "var(--color-border)" }}>
                      <div className="p-6 border-b" style={{ borderBottomColor: "var(--color-border)" }}>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--color-primary)", fontSize: '18px' }}>
                          Bra Collections
                        </span>
                      </div>
                      {['Shop By Style', 'By Padding', 'By Coverage', 'Specific Solutions'].map((s) => (
                        <div key={s} className="p-4 border-b cursor-pointer transition"
                          style={{ borderBottomColor: "var(--color-border)", color: "var(--color-body)", fontSize: '13px', fontWeight: 500 }}>
                          {s}
                        </div>
                      ))}
                    </div>
                    <div className="w-3/4 grid grid-cols-4 gap-8 p-10" style={{ background: "var(--color-bg)" }}>
                      {Object.entries(BRA_CATEGORIES).map(([key, items]) => (
                        <div key={key}>
                          <h3 className="mb-4 pb-2 border-b" style={{
                            fontFamily: "var(--font-display)",
                            fontWeight: 600, color: "var(--color-primary)", fontSize: '14px',
                            borderBottomColor: "var(--color-border)", textTransform: 'capitalize'
                          }}>{key}</h3>
                          <ul className="flex flex-col gap-2.5">
                            {items.map((item) => (
                              <li key={item.name}>
                                <LinkNav href={item.path}
                                  className="transition-all hover:translate-x-1 block text-sm"
                                  style={{ color: "var(--color-body)", fontWeight: 500, fontSize: '13px' }}>
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

            {NAV_LINKS_HOME.map((link) => (
              <Link key={link.name} href={link.path}
                className="imkaa-nav-link px-3 py-1.5 rounded-full transition">
                {link.name}
              </Link>
            ))}

            <LinkNav href="/exclusive"
              className="px-4 py-1.5 rounded-full text-sm font-semibold transition"
              style={{ background: "var(--color-primary)", color: "#FFF9FA", fontFamily: "var(--font-body)" }}>
              Sale
            </LinkNav>
          </div>
        </nav>
      </header>

      <MobileDrawer 
        menuOpen={menuOpen} 
        setMenuOpen={setMenuOpen}
        loginOpen={loginOpen}
        setLoginOpen={setLoginOpen}
        registerOpen={registerOpen}
        setRegisterOpen={setRegisterOpen}
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
      />

      <NavModals
        loginOpen={loginOpen}
        setLoginOpen={setLoginOpen}
        registerOpen={registerOpen}
        setRegisterOpen={setRegisterOpen}
      />
    </>
  );
}

// SIMPLE NAVBAR (for non-home pages)
function SimpleNavbar({ onLoginToggle }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    if (onLoginToggle) {
      onLoginToggle(loginOpen);
    }
  }, [loginOpen, onLoginToggle]);

  return (
    <>
      <style jsx global>{`
        .simple-nav-link {
          font-family: var(--font-body);
          font-weight: 500;
          font-size: 14px;
          color: var(--color-body);
          letter-spacing: 0.02em;
          transition: color 0.15s ease;
        }
        .simple-nav-link:hover {
          color: var(--color-primary);
        }
      `}</style>

      <header className="imkaa-site-header w-full sticky top-0 z-[100]" style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="container-imkaa">
          <div className="flex items-center justify-between min-h-[56px] md:min-h-[64px] lg:min-h-[68px] gap-2">
            
            {/* Left: Hamburger & Logo */}
            <div className="flex items-center gap-2 lg:gap-0">
              <button
                className="lg:hidden p-2 rounded-md transition"
                style={{ color: "var(--color-body)" }}
                onClick={() => setMenuOpen(true)}
              >
                <Menu size={24} />
              </button>

              {/* Logo */}
              <div className="flex items-center justify-start lg:flex-none">
                <Logo width="w-[130px]" height="h-[40px]" />
              </div>
            </div>

            {/* Center: Desktop Navigation */}
            <nav className="hidden lg:flex items-center justify-center flex-1 gap-4">
              {NAV_LINKS_SIMPLE.map((link) => (
                <LinkNav
                  key={link.name}
                  href={link.path}
                  className="simple-nav-link px-3 py-2 rounded transition"
                >
                  {link.name}
                </LinkNav>
              ))}
            </nav>

            {/* Right: Actions (Search, User, Wishlist, Cart) */}
            <div className="flex items-center justify-end gap-2 lg:gap-3">
              <MobileSearchToggle isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} />

              <NavActions
                isSearchOpen={isSearchOpen}
                setIsSearchOpen={setIsSearchOpen}
                setLoginOpen={setLoginOpen}
                setRegisterOpen={setRegisterOpen}
              />
            </div>
          </div>
        </div>
      </header>

      <MobileDrawer 
        menuOpen={menuOpen} 
        setMenuOpen={setMenuOpen}
        loginOpen={loginOpen}
        setLoginOpen={setLoginOpen}
        registerOpen={registerOpen}
        setRegisterOpen={setRegisterOpen}
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
      />

      <NavModals
        loginOpen={loginOpen}
        setLoginOpen={setLoginOpen}
        registerOpen={registerOpen}
        setRegisterOpen={setRegisterOpen}
      />
    </>
  );
}

// MAIN NAVBAR - Routes between layouts
export default function Navbar({ onLoginToggle }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return isHomePage ? (
    <HomeNavbar onLoginToggle={onLoginToggle} />
  ) : (
    <SimpleNavbar onLoginToggle={onLoginToggle} />
  );
}
