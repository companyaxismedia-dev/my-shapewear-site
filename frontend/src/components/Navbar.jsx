"use client";
import React, { useEffect, useState } from "react";
import LinkNav from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import {ShoppingCart,User,Menu,HelpCircle,Package,X,ChevronDown,ChevronRight,ContactIcon,LogOut} from "lucide-react";
import SearchSection from "./SearchSection";
import LoginModal from "@/app/authPage/LoginModal";
import RegisterModal from "@/app/authPage/RegisterModal";
import UserMenu from "@/app/authPage/UserMenu";
import WishlistButton from "@/app/wishlist/WishlistButton";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { fetchCategoryTree, filterNavbarCategories } from "@/lib/categories";
import { SkeletonBlock } from "@/components/loaders/Loaders";

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
        const normalized = normalizeNavCategories(filterNavbarCategories(tree));
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
  const { loading: authLoading } = useAuth();
  const cartCount = cartItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <div className={`flex items-center gap-2 ${isSearchOpen ? "hidden md:flex" : "flex"}`}>
      <div className="hidden lg:flex items-center gap-2">
        <SearchSection onToggleMobileSearch={(val) => setIsSearchOpen(val)} />
      </div>

      {authLoading ? (
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-8 w-8 rounded-full" />
          <SkeletonBlock className="h-8 w-8 rounded-full" />
        </div>
      ) : (
        <>
          <UserMenu
            openLogin={() => setLoginOpen(true)}
            openRegister={() => setRegisterOpen(true)}
          />
          <WishlistButton onLoginOpen={() => setLoginOpen(true)} />
        </>
      )}
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
    <div className="flex lg:hidden">
      <SearchSection
        onToggleMobileSearch={(val) => setIsSearchOpen(val)}
        mobileOpen={isSearchOpen}
        setMobileOpen={setIsSearchOpen}
      />
    </div>
  );
}

// Mobile Drawer Component
function MobileDrawer({ menuOpen, setMenuOpen, loginOpen, setLoginOpen, registerOpen, setRegisterOpen, isSearchOpen, setIsSearchOpen, categories = [] }) {
  const { user, logout } = useAuth();
  const [expandedCategories, setExpandedCategories] = useState({});
  const pathname = usePathname();

  const isPathActive = (href = "") =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  const toggleCategory = (categoryKey) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryKey]: !prev[categoryKey],
    }));
  };

  const renderCategoryTree = (nodes = [], level = 0) =>
    nodes.map((category) => {
      const categoryKey = `${category._id || category.slug}-${level}`;
      const hasChildren = Array.isArray(category.subCategories) && category.subCategories.length > 0;
      const isExpanded = expandedCategories[categoryKey];
      const isActive = isPathActive(category.href);
      const isHighlighted = isActive || isExpanded;

      return (
        <div key={categoryKey}>
          <div
            className="flex items-center justify-between gap-2 rounded-xl transition-colors"
            style={{
              paddingLeft: `${16 + level * 18}px`,
              paddingRight: "14px",
              paddingTop: level === 0 ? "12px" : "10px",
              paddingBottom: level === 0 ? "12px" : "10px",
              background: isHighlighted ? "rgba(197, 111, 127, 0.08)" : "transparent",
            }}
          >
            <LinkNav
              href={category.href}
              onClick={() => setMenuOpen(false)}
              className="min-w-0 flex-1 text-sm transition-colors"
              style={{
                color: isHighlighted ? "var(--color-primary)" : "var(--color-heading)",
                fontFamily: "var(--font-body)",
                fontWeight: level === 0 ? 600 : 500,
              }}
            >
              {category.name}
            </LinkNav>

            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleCategory(categoryKey)}
                className="flex h-7 w-7 items-center justify-center rounded-full transition-colors"
                style={{ color: isHighlighted ? "var(--color-primary)" : "var(--color-body)" }}
                aria-label={`${isExpanded ? "Collapse" : "Expand"} ${category.name}`}
              >
                <ChevronRight
                  size={16}
                  className={`transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                />
              </button>
            ) : null}
          </div>

          {hasChildren && isExpanded ? (
            <div className={level === 0 ? "pb-1 pt-1" : "pb-1 pt-1"}>
              {renderCategoryTree(category.subCategories, level + 1)}
            </div>
          ) : null}
        </div>
      );
    });

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
            {user ? (
              <LinkNav
                href="/account/dashboard"
                onClick={() => setMenuOpen(false)}
                className="flex items-center"
                aria-label="Go to account dashboard"
              >
                <User size={20} />
              </LinkNav>
            ) : (
              <button
                type="button"
                onClick={() => { setMenuOpen(false); setLoginOpen(true); }}
                className="flex items-center"
                aria-label="Open login"
              >
                <User size={20} />
              </button>
            )}
            {user ? (
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
                Hi, {user?.name || 'User'}
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
        <div className="flex flex-col gap-1 px-3 py-3">

          <div className="space-y-1">
            {renderCategoryTree(categories)}
          </div>

          <LinkNav
            href="/track"
            onClick={() => setMenuOpen(false)}
            className="rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 transition-colors"
            style={{ color: "var(--color-heading)", fontFamily: "var(--font-body)" }}
          >
            <Package size={16} style={{ color: "var(--color-primary)" }} /> Track Order
          </LinkNav>
          <LinkNav
            href="/contact"
            onClick={() => setMenuOpen(false)}
            className="rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 transition-colors"
            style={{ color: "var(--color-heading)", fontFamily: "var(--font-body)" }}
          >
            <ContactIcon size={16} style={{ color: "var(--color-primary)" }} /> Contact Us
          </LinkNav>
          <LinkNav
            href="/help"
            onClick={() => setMenuOpen(false)}
            className="rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 transition-colors"
            style={{ color: "var(--color-heading)", fontFamily: "var(--font-body)" }}
          >
            <HelpCircle size={16} style={{ color: "var(--color-primary)" }} /> Help
          </LinkNav>

          {user && (
            <button
              onClick={() => {
                setMenuOpen(false);
                logout();
              }}
              className="rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 text-left transition-colors"
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
function HomeNavbar({ onLoginToggle, pathname }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredCategorySlug, setHoveredCategorySlug] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDesktopScrolled, setIsDesktopScrolled] = useState(false);
  const { user } = useAuth();
  const categories = useNavbarCategories();
  const isPathActive = (href = "") =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    if (onLoginToggle) {
      onLoginToggle(loginOpen);
    }
  }, [loginOpen, onLoginToggle]);

  useEffect(() => {
    const handleScroll = () => {
      setIsDesktopScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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

      <header className="imkaa-site-header imkaa-header w-full relative z-[100]">
        <div
          className={`fixed inset-x-0 top-0 lg:hidden ${isSearchOpen ? "z-[80]" : "z-[100]"}`}
          style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}
        >
          <div className="container-imkaa">
            <div className="flex items-center justify-between min-h-[56px] gap-2 md:min-h-[64px]">
              <div className="flex min-w-0 items-center gap-2">
                <button
                  className="p-2 rounded-md transition"
                  style={{ color: "var(--color-body)", background: "transparent" }}
                  onClick={() => setMenuOpen(true)}
                >
                  <Menu size={24} />
                </button>

                <div className="flex items-center justify-start">
                  <Logo width="w-[130px]" height="h-[40px]" />
                </div>
              </div>

              <div className="flex shrink-0 items-center justify-end gap-2">
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

        <div
          className={`fixed inset-x-0 top-[56px] border-b border-[#f0e7ea] bg-[var(--color-bg)] px-3 py-3 md:top-[64px] md:px-4 lg:hidden ${
            isSearchOpen ? "z-[130]" : "z-[99]"
          }`}
        >
          <SearchSection
            onToggleMobileSearch={(val) => setIsSearchOpen(val)}
            mobileMode="bar"
            mobileFixed
            mobilePlaceholder="Search for brands & products"
            mobileOpen={isSearchOpen}
            setMobileOpen={setIsSearchOpen}
          />
        </div>

        <div className="hidden lg:block">
          <div
            className={`origin-top transition-all duration-500 ease-out ${
              isDesktopScrolled
                ? "pointer-events-none -translate-y-8 scale-[0.98] opacity-0"
                : "translate-y-0 scale-100 opacity-100"
            }`}
          >
            <div style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
              <div className="container-imkaa">
                <div className="grid min-h-[68px] grid-cols-3 items-center transition-all duration-500 ease-out">
                  <div />
                  <div className="flex items-center justify-center transition-all duration-500 ease-out">
                    <Logo />
                  </div>
                  <div className="flex items-center justify-end gap-2 transition-all duration-500 ease-out">
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

            <nav
              className="border-b transition-all duration-500 ease-out"
              style={{ background: "var(--color-bg-alt)", borderBottomColor: "var(--color-border)" }}
            >
              <div className="container-imkaa flex items-center justify-center gap-2 py-2 xl:gap-4">
                {categories.map((category, categoryIndex) => {
                  const hasChildren = category.subCategories.length > 0;
                  const isHovered = hoveredCategorySlug === category.slug;
                  const isActive = isPathActive(category.href);

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
                        style={{ color: isActive ? "var(--color-primary)" : undefined, fontWeight: isActive ? 600 : undefined }}
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
                          className="fixed left-0 w-full z-[110]"
                          style={{ top: "110px" }}
                          onMouseEnter={() => setHoveredCategorySlug(category.slug)}
                          onMouseLeave={() => setHoveredCategorySlug(null)}
                        >
                          <div className="h-3 w-full bg-transparent" />
                          <div
                            className="animate-in fade-in slide-in-from-top-2 border-t shadow-2xl"
                            style={{
                              background: "var(--color-bg)",
                              borderTopColor: "var(--color-border)",
                            }}
                          >
                            <div
                              className="mx-auto grid gap-8 px-10 pb-10 pt-6"
                              style={{
                                background: "var(--color-bg)",
                                width: `min(${Math.max(category.subCategories.length, 2) * 300}px, 92vw)`,
                                gridTemplateColumns: `repeat(${Math.max(category.subCategories.length, 1)}, minmax(0, 1fr))`,
                              }}
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
          </div>

          <div
            className={`fixed inset-x-0 top-0 z-[120] shadow-sm transition-all duration-500 ease-out ${
              isDesktopScrolled
                ? "translate-y-0 opacity-100"
                : "pointer-events-none -translate-y-full opacity-0"
            }`}
            style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}
          >
            <div className="container-imkaa">
              <div className="flex min-h-[68px] items-center justify-between gap-2">
                <div
                  className={`flex items-center justify-start lg:flex-none transition-all duration-500 ease-out ${
                    isDesktopScrolled ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
                  }`}
                >
                  <Logo width="w-[130px]" height="h-[40px]" />
                </div>

                <nav
                  className={`flex items-center justify-center flex-1 gap-4 transition-all duration-500 ease-out ${
                    isDesktopScrolled ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                  }`}
                >
                  {categories.map((link, index) => (
                    <LinkNav
                      key={`${link._id || link.slug || link.name}-${index}`}
                      href={link.href}
                      className="simple-nav-link px-3 py-2 rounded transition"
                      style={{
                        color: isPathActive(link.href) ? "var(--color-primary)" : undefined,
                        fontWeight: isPathActive(link.href) ? 600 : undefined,
                      }}
                    >
                      {link.name}
                    </LinkNav>
                  ))}
                </nav>

                <div
                  className={`flex items-center justify-end gap-3 transition-all duration-500 ease-out ${
                    isDesktopScrolled ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"
                  }`}
                >
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

// SIMPLE NAVBAR (for non-home pages)
function SimpleNavbar({ onLoginToggle, pathname }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredCategorySlug, setHoveredCategorySlug] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const categories = useNavbarCategories();
  const isPathActive = (href = "") =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

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

      <header
        className={`imkaa-site-header w-full sticky top-0 ${isSearchOpen ? "z-[80]" : "z-[100]"}`}
        style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}
      >
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
              {categories.map((category, index) => {
                const hasChildren = category.subCategories.length > 0;
                const isHovered = hoveredCategorySlug === category.slug;

                return (
                  <div
                    key={`${category._id || category.slug || category.name}-${index}`}
                    className="relative"
                    onMouseEnter={() => setHoveredCategorySlug(category.slug)}
                    onMouseLeave={() => setHoveredCategorySlug(null)}
                  >
                    <LinkNav
                      href={category.href}
                      className="simple-nav-link px-3 py-2 rounded transition"
                      style={{
                        color: isPathActive(category.href) || isHovered ? "var(--color-primary)" : undefined,
                        fontWeight: isPathActive(category.href) || isHovered ? 600 : undefined,
                      }}
                    >
                      {category.name}
                    </LinkNav>

                    {hasChildren && isHovered ? (
                      <div
                        className="fixed left-0 w-full z-[110]"
                        style={{ top: "56px" }}
                        onMouseEnter={() => setHoveredCategorySlug(category.slug)}
                        onMouseLeave={() => setHoveredCategorySlug(null)}
                      >
                        <div
                          className="animate-in fade-in slide-in-from-top-2 border-t shadow-2xl"
                          style={{
                            background: "var(--color-bg)",
                            borderTopColor: "var(--color-border)",
                          }}
                        >
                          <div
                            className="mx-auto grid gap-8 px-10 pb-10 pt-6"
                            style={{
                              background: "var(--color-bg)",
                              width: `min(${Math.max(category.subCategories.length, 2) * 300}px, 92vw)`,
                              gridTemplateColumns: `repeat(${Math.max(category.subCategories.length, 1)}, minmax(0, 1fr))`,
                            }}
                          >
                            {category.subCategories.map((childCategory, childIndex) => (
                              <div
                                key={`${childCategory._id || childCategory.slug || childCategory.name}-${childIndex}`}
                              >
                                <h3
                                  className="mb-4 border-b pb-2"
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
                                        className="block text-sm transition-all hover:translate-x-1"
                                        style={{
                                          color: "var(--color-body)",
                                          fontWeight: 500,
                                          fontSize: "13px",
                                        }}
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
    <HomeNavbar onLoginToggle={onLoginToggle} pathname={pathname} />
  ) : (
    <SimpleNavbar onLoginToggle={onLoginToggle} pathname={pathname} />
  );
}
