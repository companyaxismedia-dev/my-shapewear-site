"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import FilterBar from "@/components/FilterBar";
import TopFilters from "@/components/TopFilters";

import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import Footer from "@/components/Footer";

import {
  Heart,
  ChevronDown,
  Star,
  X,
  ShoppingCart,
  Zap,
  ChevronsDown,
} from "lucide-react";

/* ===== API BASE ===== */
const API_BASE =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000"
    : "https://my-shapewear-site.onrender.com";

/* visible initially, rest behind "+ N more" -- handled by TopFilters component */


/* ===================================================================
   MAIN PAGE COMPONENT
   =================================================================== */
export default function BraPage() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNavbar, setShowNavbar] = useState(true);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  /* --- Sort --- */
  const [sortOpen, setSortOpen] = useState(false);
  const [sort, setSort] = useState("Recommended");

  /* =========================
     FETCH PRODUCTS
     ========================= */
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const cleanFilters = Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== "")
        );

        const query = new URLSearchParams({
          ...cleanFilters,
          category: "bra",
          page,
          limit: 20,
          ...(sort === "Price: Low to High" && { sort: "price_asc" }),
          ...(sort === "Price: High to Low" && { sort: "price_desc" }),
          ...(sort === "Better Discount" && { sort: "discount_desc" }),
          ...(sort === "Customer Rating" && { sort: "rating" }),
          ...(sort === "What's New" && { sort: "newest" }),
          ...(sort === "Popularity" && { sort: "popularity" }),
        }).toString();

        const res = await fetch(`${API_BASE}/api/products?${query}`);
        const data = await res.json();

        if (data.success) {
          setProducts(data.products);
          setTotalItems(data.total || data.products.length);
        }
      } catch (error) {
        console.error("Error fetching bras:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters, page, sort]);

  /* --- close sort dropdown on outside click --- */
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest("[data-sort-dropdown]")) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
  let lastScrollY = window.scrollY;

  const handleScroll = () => {
    if (window.scrollY > lastScrollY && window.scrollY > 80) {
  setShowNavbar(false);
} else {
  setShowNavbar(true);
}

    lastScrollY = window.scrollY;
  };

  window.addEventListener("scroll", handleScroll);

  return () => window.removeEventListener("scroll", handleScroll);
}, []);


  /* ===================================================================
     RENDER
     =================================================================== */
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fff", fontFamily: "'Assistant', Arial, sans-serif", color: "#282c3f" }}>
    
    <div
  style={{
    position: "sticky",
    top: 0,
    zIndex: 999,
    transition: "transform 0.3s ease",
    transform: showNavbar ? "translateY(0)" : "translateY(-100%)",
  }}
>
  <Navbar />
</div>


      {/* ===== MAIN LAYOUT (Myntra style: fixed left sidebar + right content) ===== */}
      <div
  style={{
    display: "flex",
    width: "100%",
    margin: 0,
  }}
>

        {/* ====================
            LEFT SIDEBAR (always visible, fixed on left like Myntra)
            ==================== */}
        <aside style={{ flexShrink: 0 }}>
          <FilterBar
            filters={filters}
            setFilters={setFilters}
            setPage={setPage}
            category="bra"
          />
        </aside>

        {/* ====================
            RIGHT SIDE (top filters + products)
            ==================== */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* ---- TOP FILTER BAR (Myntra chip style) + Sort ---- */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              borderBottom: "1px solid #e8e8e8",
              padding: "0 16px",
              minHeight: 48,
              gap: 8,
            }}
          >
            {/* TopFilters component */}
            <TopFilters
              filters={filters}
              setFilters={setFilters}
              setPage={setPage}
            />

            {/* Sort dropdown */}
            <div style={{ position: "relative", flexShrink: 0, paddingTop: 8 }} data-sort-dropdown>
              <button
                onClick={() => setSortOpen(!sortOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: "1px solid #e8e8e8",
                  padding: "8px 14px",
                  fontSize: 13,
                  width: 240,
                  backgroundColor: "#fff",
                  cursor: "pointer",
                  color: "#282c3f",
                }}
              >
                <span>
                  Sort by : <strong>{sort}</strong>
                </span>
                <ChevronDown size={14} />
              </button>

              {sortOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "100%",
                    backgroundColor: "#fff",
                    border: "1px solid #e8e8e8",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    width: 240,
                    zIndex: 100,
                  }}
                >
                  {[
                    "Recommended",
                    "What's New",
                    "Popularity",
                    "Better Discount",
                    "Price: High to Low",
                    "Price: Low to High",
                    "Customer Rating",
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setSort(s);
                        setSortOpen(false);
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 16px",
                        fontSize: 14,
                        color: sort === s ? "#ff3f6c" : "#282c3f",
                        fontWeight: sort === s ? 700 : 400,
                        backgroundColor: "transparent",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ---- PRODUCTS GRID ---- */}
          <main style={{ padding: 16 }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{
                  width: 36,
                  height: 36,
                  border: "3px solid #e8e8e8",
                  borderTop: "3px solid #ff3f6c",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  margin: "0 auto 12px",
                }} />
                <p style={{ color: "#94969f", fontSize: 14 }}>Loading products...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#282c3f" }}>
                  No products found
                </h2>
                <p style={{ fontSize: 14, color: "#94969f", marginTop: 8 }}>
                  Try changing or clearing your filters
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: 16,
                }}
              >
                {products.map((item) => (
                  <ProductCard
                    key={item._id}
                    item={item}
                    onOpenDetails={() => setSelectedProduct(item)}
                  />
                ))}
              </div>
            )}

            {/* ---- PAGINATION ---- */}
            {!loading && products.length > 0 && (
              <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
                padding: "32px 0",
              }}>
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  style={{
                    padding: "8px 20px",
                    fontSize: 13,
                    fontWeight: 700,
                    border: "1px solid #e8e8e8",
                    backgroundColor: page <= 1 ? "#f5f5f5" : "#fff",
                    color: page <= 1 ? "#d4d5d9" : "#282c3f",
                    cursor: page <= 1 ? "not-allowed" : "pointer",
                  }}
                >
                  Previous
                </button>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#282c3f", padding: "0 12px" }}>
                  Page {page}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={products.length < 20}
                  style={{
                    padding: "8px 20px",
                    fontSize: 13,
                    fontWeight: 700,
                    border: "1px solid #e8e8e8",
                    backgroundColor: products.length < 20 ? "#f5f5f5" : "#fff",
                    color: products.length < 20 ? "#d4d5d9" : "#282c3f",
                    cursor: products.length < 20 ? "not-allowed" : "pointer",
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ===== PRODUCT DETAILS MODAL ===== */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
      <Footer />
    </div>
  );
}


/* ===================================================================
   IMAGE URL HELPER
   =================================================================== */
const getImageUrl = (imagePath) => {
  if (!imagePath) return "/fallback.jpg";
  if (typeof imagePath === "string") {
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_BASE}${imagePath}`;
  }
  if (typeof imagePath === "object") {
    const path = imagePath.url || imagePath.path;
    if (!path) return "/fallback.jpg";
    if (path.startsWith("http")) return path;
    return `${API_BASE}${path}`;
  }
  return "/fallback.jpg";
};


/* ===================================================================
   PRODUCT CARD (Myntra Bra style)
   =================================================================== */
function ProductCard({ item, onOpenDetails }) {
  const { wishlist, toggleWishlist, removeFromWishlist } = useWishlist();
const { user } = useAuth();
const { addToCart } = useCart();
  const [showSizes, setShowSizes] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
const isWishlisted = wishlist.some((p) => p.id === item._id);  const cardRef = React.useRef(null);

  const image = getImageUrl(item.variants?.[0]?.images?.[0]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setShowSizes(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSizeSelect = (size) => {
    const variant = item.variants?.[0];

addToCart({
  productId: item._id,
  name: item.name,
  price: variant?.price || item.minPrice,
  image,
  size,
  quantity: 1,
});
    setShowSizes(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1500);
  };

  return (
    <div
      ref={cardRef}
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
        border: "1px solid #e8e8e8",
        overflow: "hidden",
        position: "relative",
        transition: "box-shadow 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      {/* IMAGE */}
      <div style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden", backgroundColor: "#f5f5f6" }}>
        <img
          src={image}
          alt={item.name}
          onClick={onOpenDetails}
          style={{
            cursor: "pointer",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top",
            transition: "transform 0.4s",
            filter: showSizes ? "blur(3px)" : "none",
            transform: showSizes ? "scale(1.05)" : "scale(1)",
          }}
          onMouseEnter={(e) => { if (!showSizes) e.currentTarget.style.transform = "scale(1.05)"; }}
          onMouseLeave={(e) => { if (!showSizes) e.currentTarget.style.transform = "scale(1)"; }}
        />

        {/* DISCOUNT */}
        {item.discount > 0 && (
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            backgroundColor: "#ff905a",
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            padding: "2px 8px",
            zIndex: 10,
          }}>
            {item.discount}% OFF
          </div>
        )}

        {/* WISHLIST */}
        <button
onClick={() => {
  if (!user) return alert("Please login to use wishlist");

  isWishlisted
    ? removeFromWishlist(item._id)
    : toggleWishlist({ id: item._id, ...item });
}}          style={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 20,
            backgroundColor: "#fff",
            border: "none",
            borderRadius: "50%",
            width: 30,
            height: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
          }}
        >
          <Heart
            size={16}
            fill={isWishlisted ? "#ed4e7e" : "none"}
            stroke="#ed4e7e"
          />
        </button>

        {/* RATING BADGE */}
        {item.rating > 0 && (
          <div style={{
            position: "absolute",
            bottom: 8,
            left: 8,
            backgroundColor: "rgba(255,255,255,0.95)",
            borderRadius: 2,
            padding: "2px 6px",
            display: "flex",
            alignItems: "center",
            gap: 3,
            fontSize: 12,
            fontWeight: 700,
            color: "#282c3f",
            zIndex: 10,
          }}>
            {item.rating}
            <Star size={10} fill="#14958f" stroke="14958f" />
            <span style={{ color: "#94969f", fontWeight: 400, fontSize: 11 }}>
              | {item.numReviews || 0}
            </span>
          </div>
        )}

        {/* SIZE OVERLAY */}
        {showSizes && (
          <div style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(4px)",
            zIndex: 15,
          }}>
            <div style={{ textAlign: "center" }}>
              <p style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                color: "#ed4e7e",
                letterSpacing: "1.5px",
                marginBottom: 12,
              }}>
                SELECT SIZE
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", padding: "0 12px" }}>
                {item.variants?.[0]?.sizes?.map((s, i) => (
                  <button
                    key={i}
                    disabled={s.stock === 0}
                    onClick={() => handleSizeSelect(s.size)}
                    style={{
                      padding: "4px 10px",
                      border: "1px solid #ed4e7e",
                      color: s.stock === 0 ? "#d4d5d9" : "#ed4e7e",
                      backgroundColor: "transparent",
                      borderColor: s.stock === 0 ? "#d4d5d9" : "#ed4e7e",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: s.stock === 0 ? "not-allowed" : "pointer",
                      borderRadius: 2,
                    }}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUCCESS POP */}
        {showSuccess && (
          <div style={{
            position: "absolute",
            bottom: 12,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#282c3f",
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            padding: "6px 14px",
            borderRadius: 20,
            zIndex: 20,
            whiteSpace: "nowrap",
          }}>
            Added to Bag
          </div>
        )}
      </div>

      {/* DETAILS */}
      <div style={{ padding: 10, display: "flex", flexDirection: "column", flex: 1, backgroundColor: "#fff" }}>
        <h3 style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#282c3f",
          margin: "0 0 2px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          textTransform: "uppercase",
        }}>
          {item.name}
        </h3>

        <p style={{
          fontSize: 12,
          color: "#535766",
          margin: "0 0 6px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {item.subCategory || "Bra"}
        </p>

        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#282c3f" }}>
            Rs. {item.minPrice}
          </span>
          {item.mrp > item.minPrice && (
            <>
              <span style={{ fontSize: 12, color: "#94969f", textDecoration: "line-through" }}>
                Rs. {item.mrp}
              </span>
              <span style={{ fontSize: 12, color: "#ff905a", fontWeight: 600 }}>
                ({item.discount}% OFF)
              </span>
            </>
          )}
        </div>

        {/* ADD TO BAG */}
        <button
          onClick={() => setShowSizes(true)}
          style={{
            marginTop: "auto",
            paddingTop: 8,
            width: "100%",
            padding: "8px 0",
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            color: "#faf5f6",
            backgroundColor: "#ed4e7e",
            border: "1px solid #ed4e7e",
            cursor: "pointer",
          }}
        >
          ADD TO BAG
        </button>
      </div>
    </div>
  );
}


/* ===================================================================
   PRODUCT DETAILS MODAL
   =================================================================== */
export function ProductDetailsModal({ product, onClose }) {
  const { addToCart } = useCart();
  const [variant, setVariant] = useState(product.variants?.[0]);
  const [size, setSize] = useState("");
  const router = useRouter();

  const image = getImageUrl(variant?.images?.[0]); // ⭐ YE LINE ADD KARO


  const handleShowMore = () => {
  router.push(`/product/${product.slug}`);
};

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 860,
          backgroundColor: "#fff",
          borderRadius: 8,
          overflow: "hidden",
          display: "flex",
          flexDirection: "row",
          maxHeight: "90vh",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 50,
            backgroundColor: "#fff",
            border: "none",
            borderRadius: "50%",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
          }}
        >
          <X size={20} />
        </button>

        {/* IMAGE SIDE */}
        <div style={{ width: "50%", backgroundColor: "#f5f5f6", flexShrink: 0 }}>
          <img
            src={image}
            alt={product.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        {/* DETAILS SIDE */}
        <div style={{ width: "50%", padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#282c3f", textTransform: "uppercase", margin: 0 }}>
            {product.name}
          </h1>

          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: "#ed4e7e" }}>
              Rs. {
                variant?.sizes?.find((s) => s.size === size)?.price ||
                variant?.sizes?.[0]?.price ||
                product.minPrice || 0
              }
            </span>
            {product.mrp > product.minPrice && (
              <span style={{ fontSize: 16, color: "#94969f", textDecoration: "line-through" }}>
                Rs. {product.mrp}
              </span>
            )}
          </div>

          {/* COLOR */}
          {product.variants?.length > 1 && (
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 8, color: "#282c3f" }}>
                Select Color
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {product.variants.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => { setVariant(v); setSize(""); }}
                    style={{
                      padding: "6px 14px",
                      border: variant?.color === v.color ? "2px solid #ed4e7e" : "1px solid #d4d5d9",
                      backgroundColor: variant?.color === v.color ? "#fff0f3" : "#fff",
                      color: "#282c3f",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      borderRadius: 2,
                    }}
                  >
                    {v.color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SIZE */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 8, color: "#282c3f" }}>
              Select Size
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {variant?.sizes?.map((s) => (
                <button
                  key={s.size}
                  onClick={() => setSize(s.size)}
                  style={{
                    padding: "8px 16px",
                    border: size === s.size ? "2px solid #ed4e7e" : "1px solid #d4d5d9",
                    backgroundColor: size === s.size ? "#fff0f3" : "#fff",
                    color: "#282c3f",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    borderRadius: 2,
                  }}
                >
                  {s.size}
                </button>
              ))}
            </div>
          </div>

          {/* ACTIONS */}
          <button
onClick={() => {
  if (!size) return alert("Select size");

  addToCart({
    productId: product._id,
    size,
    quantity: 1,
  });

  alert("Added to cart");
}}            style={{
              width: "100%",
              padding: "14px 0",
              fontSize: 14,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: "#fff",
              backgroundColor: "#ed4e7e",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <ShoppingCart size={16} />
            ADD TO BAG
          </button>

          <button
            style={{
              width: "100%",
              padding: "14px 0",
              fontSize: 14,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: "#282c3f",
              backgroundColor: "#fff",
              border: "1px solid #d4d5d9",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Zap size={16} />
            BUY NOW
          </button>

          <button
  onClick={handleShowMore}
  style={{
    width: "100%",
    padding: "14px 0",
    fontSize: 14,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: "#ed4e7e",
    backgroundColor: "#fff",
    border: "1px solid #ed4e7e",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    transition: "all 0.3s ease",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = "#ed4e7e";
    e.currentTarget.style.color = "#fff";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = "#fff";
    e.currentTarget.style.color = "#ed4e7e";
  }}
>
  Show More Details
  <ChevronsDown size={16} />
</button>
        </div>
      </div>
    </div>
  );
}
