"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import {
  Heart,
  Filter,
  ChevronDown,
  Star,
  X,
  ShoppingCart,
  Zap,
  ChevronsDown,
} from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import Footer from "@/components/Footer";

const API_BASE =
  typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000"
    : "https://my-shapewear-site.onrender.com";

export default function PantyPage() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/products?category=panties&limit=50`
        );
        const data = await res.json();
        if (data.success) setProducts(data.products);
      } catch (error) {
        console.error("Error fetching panties:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden text-[#ed4e7e]">
      <div className="w-full sticky top-0 z-50 bg-white border-b border-pink-50 shadow-sm">
        <Navbar />
      </div>

      {/* FILTER HEADER */}
      <div className="px-4 py-3 border-b border-pink-100 flex justify-between items-center bg-white sticky top-[64px] z-40">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Sort By:
          </span>
          <select className="text-[10px] font-bold uppercase outline-none bg-transparent cursor-pointer">
            <option>Low to High</option>
            <option>High to Low</option>
            <option>New Arrivals</option>
          </select>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-1 text-[10px] font-bold uppercase">
            <span className="w-2 h-2 bg-[#ed4e7e] inline-block"></span> Size
          </button>
          <button className="flex items-center gap-2 text-[10px] font-bold uppercase border border-[#ed4e7e] px-3 py-1 rounded-sm">
            <Filter size={12} /> Show Filters
          </button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto flex">
        <aside className="hidden lg:block w-64 p-6 border-r border-pink-50 sticky top-[120px] h-[calc(100vh-120px)] overflow-y-auto no-scrollbar">
          <h2 className="font-bold text-[10px] mb-6 tracking-widest uppercase">
            Refine Your Selection
          </h2>
          {["Size", "Color", "Discount", "Padded", "Price Range", "Material"].map(
            (f) => (
              <div
                key={f}
                className="mb-4 flex justify-between items-center cursor-pointer border-b border-pink-50 pb-2"
              >
                <span className="text-[11px] font-bold uppercase">{f}</span>
                <ChevronDown size={14} />
              </div>
            )
          )}
        </aside>

        <main className="flex-1 p-4">
          {loading ? (
            <p className="text-center">Loading products...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {products.map((item) => (
                <ProductCard
                  key={item._id}
                  item={item}
                  onOpenDetails={() => setSelectedProduct(item)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

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


const getImageUrl = (imagePath) => {
  if (!imagePath) return "/fallback.jpg";

  // If already full URL
  if (typeof imagePath === "string") {
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_BASE}${imagePath}`;
  }

  // If backend sends object
  if (typeof imagePath === "object") {
    const path = imagePath.url || imagePath.path;
    if (!path) return "/fallback.jpg";

    if (path.startsWith("http")) return path;
    return `${API_BASE}${path}`;
  }

  return "/fallback.jpg";
};


function ProductCard({ item, onOpenDetails }) {
  const { wishlist, toggleWishlist, removeFromWishlist } = useWishlist();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [showSizes, setShowSizes] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const cardRef = React.useRef(null);

  // const image =
  //   item.variants?.[0]?.images?.[0]
  //     ? `${API_BASE}${item.variants[0].images[0]}`
  //     : "/fallback.jpg";
  const image = getImageUrl(
    item.variants?.[0]?.images?.[0]
  );


  const isWishlisted = wishlist.some((p) => p.id === item._id);

  /* ================= CLOSE ON OUTSIDE CLICK ================= */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        cardRef.current &&
        !cardRef.current.contains(event.target)
      ) {
        setShowSizes(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleWishlist = () => {
    if (!user) {
      alert("Please login to use wishlist");
      return;
    }
    isWishlisted
      ? removeFromWishlist(item._id)
      : toggleWishlist({ id: item._id, ...item });
  };

  const handleSizeSelect = (size) => {
    const variant = item.variants?.[0];

    addToCart({
      productId: item._id,
      name: item.name,
      price: variant?.price || item.price,
      image,
      size,
      quantity: 1,
    });

    setShowSizes(false);

    /* ===== SUCCESS MESSAGE ===== */
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 1500);
  };

  return (
    <div
      ref={cardRef}
      className="group flex flex-col bg-white border border-pink-50 relative rounded-sm overflow-hidden shadow-sm h-full transition-all hover:shadow-md"
    >
      {/* ================= IMAGE SECTION ================= */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#fff5f8]">

        {/* IMAGE */}
        <img
          src={image}
          alt={item.name}
          onClick={onOpenDetails}
          className={`cursor-pointer w-full h-full object-cover object-top transition-all duration-500 group-hover:scale-105 ${showSizes ? "blur-sm scale-105" : ""
            }`}
        />

        {/* DISCOUNT */}
        {item.discount > 0 && (
          <div className="absolute top-0 left-0 bg-[#ed4e7e] text-white text-[9px] px-2 py-0.5 font-bold z-10">
            {item.discount}% OFF
          </div>
        )}

        {/* WISHLIST */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 z-20 bg-white p-1 rounded-full shadow hover:scale-110 transition"
        >
          <Heart
            size={18}
            fill={isWishlisted ? "#ed4e7e" : "none"}
            stroke="#ed4e7e"
          />
        </button>

        {/* ================= SIZE OVERLAY ================= */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${showSizes
            ? "opacity-100 visible"
            : "opacity-0 invisible"
            }`}
        >
          <div className="bg-white/95 backdrop-blur-md p-5 rounded-xl shadow-2xl transform transition-all duration-300 scale-100">

            <p className="text-xs font-bold uppercase mb-3 text-center text-[#ed4e7e] tracking-wider">
              SELECT SIZE
            </p>

            <div className="flex gap-3 flex-wrap justify-center">
              {item.variants?.[0]?.sizes?.map((s, i) => (
                <button
                  key={i}
                  disabled={s.stock === 0}
                  onClick={() => handleSizeSelect(s.size)}
                  className="px-3 py-1 border border-[#ed4e7e] text-[#ed4e7e] rounded text-xs font-medium hover:bg-[#ed4e7e] hover:text-white transition duration-200"
                >
                  {s.size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ================= SUCCESS POP ================= */}
        {showSuccess && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-4 py-2 rounded-full shadow-lg animate-bounce">
            Added to Bag ✓
          </div>
        )}
      </div>

      {/* ================= DETAILS ================= */}
      <div className="p-3 flex flex-col flex-grow bg-white">
        <h3 className="text-[10px] font-bold truncate uppercase mb-1">
          {item.name}
        </h3>

        <div className="flex gap-2 mt-1">
          <span className="font-black text-black">
            ₹{item.minPrice}
          </span>
          {item.mrp > item.minPrice && (
            <span className="text-xs line-through text-gray-400">
              ₹{item.mrp}
            </span>
          )}
        </div>


        <div className="flex items-center gap-1 mt-1.5 mb-3">
          <Star size={10} className="fill-[#ed4e7e] text-[#ed4e7e]" />
          <span className="text-[10px] font-bold">
            {item.rating}
          </span>
          <span className="text-[10px] text-pink-300">
            ({item.numReviews})
          </span>
        </div>

        {/* ADD TO CART BUTTON */}
        <div className="mt-auto w-full px-1 pb-1">
          <button
            onClick={() => setShowSizes(true)}
            className="cursor-pointer w-full bg-[#ed4e7e] text-white py-2.5 text-[12px] font-bold uppercase tracking-widest rounded-sm shadow-sm flex items-center justify-center active:scale-95 transition-all hover:scale-105"
          >
            ADD TO CART
          </button>
        </div>
      </div>
    </div>
  );
}



export function ProductDetailsModal({ product, onClose }) {
  const { addToCart } = useCart();
  const router = useRouter();

  const [variant, setVariant] = useState(product.variants?.[0]);
  const [size, setSize] = useState("");

  // const image =
  //   variant?.images?.[0]
  //     ? `${API_BASE}${variant.images[0]}`
  //     : "/fallback.jpg";
  const image = getImageUrl(
    variant?.images?.[0]
  );


  const handleCartAdd = () => {
    if (!size) return alert("Select size");

    addToCart({
      productId: product._id,
      size,
      quantity: 1,
    });

    alert("Added to cart");
  };

  const handleBuyNow = () => {
    handleCartAdd();
    router.push("/cart");
  };

  const handleShowMore = () => {
    router.push(`/product/${product.slug}`); // ✅ Navigate using slug
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-white rounded-full hover:rotate-90 transition"
        >
          <X size={24} />
        </button>

        <div className="md:w-1/2 bg-[#fff5f8]">
          <img
            src={image}
            className="w-full h-full object-cover"
            alt={product.name}
          />
        </div>

        <div className="md:w-1/2 p-6 space-y-6 overflow-y-auto">
          <h1 className="text-2xl font-black uppercase">
            {product.name}
          </h1>

          <div className="flex items-center gap-2">
  <span className="text-2xl font-black text-[#ed4e7e]">
    ₹{
      variant?.sizes?.find((s) => s.size === size)?.price ||
      variant?.sizes?.[0]?.price ||
      product.minPrice ||
      0
    }
  </span>

  {product.mrp > product.minPrice && (
    <span className="line-through text-gray-400">
      ₹{product.mrp}
    </span>
  )}
</div>


          {/* COLOR */}
          <div>
            <p className="text-xs font-bold uppercase mb-2">
              Select Color
            </p>
            <div className="flex gap-2">
              {product.variants?.map((v, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setVariant(v);
                    setSize("");
                  }}
                  className={`px-3 py-1 border rounded transition ${variant?.color === v.color
                      ? "bg-[#ed4e7e] text-white border-[#ed4e7e]"
                      : "hover:scale-105"
                    }`}>

                  {v.color}
                </button>
              ))}
            </div>
          </div>

          {/* SIZE */}
          <div>
            <p className="text-xs font-bold uppercase mb-2">
              Select Size
            </p>
            <div className="flex gap-2 flex-wrap">
              {variant?.sizes?.map((s) => (
                <button
                  key={s.size}
                  onClick={() => setSize(s.size)}
                  className={`px-4 py-2 border rounded transition ${size === s.size
                    ? "bg-[#ed4e7e] text-white"
                    : "hover:scale-105"
                    }`}                >
                  {s.size}
                </button>
              ))}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <button
            onClick={handleCartAdd}
            className="w-full bg-[#ed4e7e] text-white py-3 font-bold uppercase hover:scale-105 transition"
          >
            <ShoppingCart size={16} className="inline mr-2" />
            Add to Cart
          </button>

          <button
            onClick={handleBuyNow}
            className="w-full bg-black text-white py-3 font-bold uppercase hover:scale-105 transition"
          >
            <Zap size={16} className="inline mr-2" />
            Buy Now
          </button>

          {/* ✅ SHOW MORE DETAILS BUTTON */}
          <button
            onClick={handleShowMore}
            className="w-full flex items-center justify-center gap-2 border border-[#ed4e7e] text-[#ed4e7e] py-3 font-bold uppercase hover:bg-[#ed4e7e] hover:text-white transition-all duration-300 group"
          >
            Show More Details
            <ChevronsDown className="group-hover:translate-y-1 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </div>
  );
}