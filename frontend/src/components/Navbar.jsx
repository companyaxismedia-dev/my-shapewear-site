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
import { fetchCategoryTree } from "@/lib/categories";

const FALLBACK_NAV_CATEGORIES = [
  { name: "Bras", href: "/bra", subCategories: [] },
  { name: "Panties", href: "/panties", subCategories: [] },
  { name: "Lingerie", href: "/lingerie", subCategories: [] },
  { name: "Shapewear", href: "/shapewear", subCategories: [] },
  { name: "Curvy", href: "/curvy", subCategories: [] },
  { name: "Tummy Control", href: "/tummy-control", subCategories: [] },
];

const normalizeNavCategories = (nodes = [], path = []) =>
  nodes.map((node) => {
    const nextPath = [...path, node.slug];
    return {
      _id: node._id,
      name: node.name,
      slug: node.slug,
      href: `/${nextPath.join("/")}`,
      subCategories: normalizeNavCategories(node.subCategories || [], nextPath),
    };
  });

const useNavbarCategories = () => {
  const [categories, setCategories] = useState(FALLBACK_NAV_CATEGORIES);

  useEffect(() => {
    let active = true;

    fetchCategoryTree()
      .then((tree) => {
        if (!active) return;
        const normalized = normalizeNavCategories(tree);
        if (normalized.length) {
          setCategories(normalized);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return categories;
};

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
      <LinkNav href="/checkout/cart" className="relative p-1.5 transition-colors" style={{ color: "var(--color-body)" }}>
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
function MobileDrawer({ menuOpen, setMenuOpen, loginOpen, setLoginOpen, registerOpen, setRegisterOpen, isSearchOpen, setIsSearchOpen, categories = [] }) {
  const { user, logout } = useAuth();
  const drawerLinks = [
    { name: "Home", path: "/" },
    ...categories.map((category) => ({
      name: category.name,
      path: category.href,
    })),
  ];

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
          {drawerLinks.map((link, index) => (
            <LinkNav
              key={`${link.path}-${link.name}-${index}`}
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
  const [hoveredCategorySlug, setHoveredCategorySlug] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user } = useAuth();
  const categories = useNavbarCategories();

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

            {categories.map((category, categoryIndex) => {
              const hasChildren = category.subCategories.length > 0;
              const isHovered = hoveredCategorySlug === category.slug;

              return (
                <div
                  key={`${category._id || category.slug || category.name}-${categoryIndex}`}
                  className="relative group"
                  onMouseEnter={() => setHoveredCategorySlug(category.slug)}
                  onMouseLeave={() => setHoveredCategorySlug(null)}
                >
                  <LinkNav
                    href={category.href}
                    className="flex items-center gap-1 px-3 py-1.5 imkaa-nav-link rounded-full transition"
                  >
                    {category.name}
                    {hasChildren ? (
                      <ChevronDown
                        size={13}
                        className={`transition-transform duration-300 ${isHovered ? "rotate-180" : ""}`}
                        style={{ color: "var(--color-primary)" }}
                      />
                    ) : null}
                  </LinkNav>

                  {hasChildren && isHovered ? (
                    <div
                      className="fixed top-[110px] left-0 w-full z-[110]"
                      onMouseEnter={() => setHoveredCategorySlug(category.slug)}
                      onMouseLeave={() => setHoveredCategorySlug(null)}
                    >
                      <div className="h-3 w-full bg-transparent" />
                      <div
                        className="shadow-2xl border-t flex animate-in fade-in slide-in-from-top-2"
                        style={{ background: "var(--color-bg)", borderTopColor: "var(--color-border)" }}
                      >
                        <div
                          className="w-3/4 grid grid-cols-4 gap-8 p-10"
                          style={{ background: "var(--color-bg)" }}
                        >
                          {category.subCategories.map((childCategory, childIndex) => (
                            <div
                              key={`${childCategory._id || childCategory.slug || childCategory.name}-${childIndex}`}
                            >
                              <h3
                                className="mb-4 pb-2 border-b"
                                style={{
                                  fontFamily: "var(--font-display)",
                                  fontWeight: 600,
                                  color: "var(--color-primary)",
                                  fontSize: "14px",
                                  borderBottomColor: "var(--color-border)",
                                }}
                              >
                                <LinkNav href={childCategory.href}>{childCategory.name}</LinkNav>
                              </h3>
                              <ul className="flex flex-col gap-2.5">
                                {(childCategory.subCategories.length
                                  ? childCategory.subCategories
                                  : [childCategory]
                                ).map((item, itemIndex) => (
                                  <li key={`${item._id || item.slug || item.name}-${itemIndex}`}>
                                    <LinkNav
                                      href={item.href}
                                      className="transition-all hover:translate-x-1 block text-sm"
                                      style={{ color: "var(--color-body)", fontWeight: 500, fontSize: "13px" }}
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
                  ) : null}
                </div>
              );
            })}

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
        categories={categories}
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
  const categories = useNavbarCategories();

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
              {categories.map((link, index) => (
                <LinkNav
                  key={`${link._id || link.slug || link.name}-${index}`}
                  href={link.href}
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
        categories={categories}
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
