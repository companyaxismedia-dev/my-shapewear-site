

// "use client";

// import React, { useEffect, useState } from "react";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Autoplay, Navigation, Pagination } from "swiper/modules";
// import { ChevronRight, Heart, Star } from "lucide-react";
// import { ProductDetailsModal } from "./category/ProductDetailsModal";

// import "swiper/css";
// import "swiper/css/navigation";
// import "swiper/css/pagination";

// /* ================= API BASE ================= */

// const API_BASE =
//   typeof window !== "undefined" &&
//     (window.location.hostname === "localhost" ||
//       window.location.hostname === "127.0.0.1")
//     ? "http://localhost:5000"
//     : "https://my-shapewear-site.onrender.com";

// /* ================= CATEGORY MAP ================= */

// const categoryMap = {
//   bra: "bra",
//   panties: "panties",
//   lingerie: "lingerie",
//   curvy: "lingerie",
//   shapewear: "shapewear",
//   "tummy-control": "shapewear",
// };

// /* ================= HOME SECTIONS ================= */

// const homeSections = [
//   { id: "bra", title: "Trending Bras", path: "/bra", count: 8 },
//   { id: "panties", title: "Comfy Panties", path: "/panties", count: 8 },
//   { id: "lingerie", title: "Lingerie Sets", path: "/lingerie", count: 8 },
//   { id: "curvy", title: "Curvy Collection", path: "/curvy", count: 8 },
//   { id: "shapewear", title: "Shapewear Styles", path: "/shapewear", count: 8 },
//   { id: "tummy-control", title: "Tummy Control", path: "/tummy-control", count: 8 },
// ];

// export default function AutoSliceSlider() {
//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [productsData, setProductsData] = useState({});
//   const [loading, setLoading] = useState(true);

//   /* ================= FAST PARALLEL FETCH ================= */

//   useEffect(() => {
//     const loadProducts = async () => {
//       try {
//         const requests = homeSections.map(async (section) => {
//           const backendCategory = categoryMap[section.id];

//           const res = await fetch(
//             `${API_BASE}/api/products?category=${backendCategory}&limit=20`
//           );

//           const result = await res.json();

//           return {
//             id: section.id,
//             products: result.success ? result.products : [],
//           };
//         });

//         const results = await Promise.all(requests);

//         const data = {};
//         results.forEach((r) => {
//           data[r.id] = r.products;
//         });

//         setProductsData(data);
//       } catch (err) {
//         console.error("Slider fetch error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadProducts();
//   }, []);

//   if (loading) return null;

//   return (
//     <div className="flex flex-col gap-12 py-10 bg-white">
//       {homeSections.map((section) => {
//         const products =
//           productsData[section.id]?.slice(0, section.count) || [];

//         if (!products.length) return null;

//         /* ===== SWIPER SAFE CONDITIONS ===== */
//         const enableLoop = products.length >= 6;
//         const enableNav = products.length > 1;

//         return (
//           <div key={section.id} className="w-full">
//             {/* Header */}
//             <div className="flex justify-between items-center mb-6 px-4">
//               <h2 className="text-xl md:text-2xl font-black text-gray-800 uppercase italic border-l-4 border-[#ed4e7e] pl-4">
//                 {section.title}
//               </h2>

//               <a
//                 href={section.path}
//                 className="flex items-center gap-1 text-[10px] font-bold bg-[#ed4e7e] text-white px-4 py-2 rounded-full uppercase"
//               >
//                 View All <ChevronRight size={14} />
//               </a>
//             </div>

//             {/* Slider */}
//             <Swiper
//               modules={[Autoplay, Navigation, Pagination]}
//               observer={true}
//               observeParents={true}
//               watchOverflow={true}
//               spaceBetween={15}
//               loop={enableLoop}
//               autoplay={
//                 enableLoop
//                   ? { delay: 4000, disableOnInteraction: false }
//                   : false
//               }
//               breakpoints={{
//                 320: { slidesPerView: 1.5 },
//                 768: { slidesPerView: 3 },
//                 1024: { slidesPerView: 4.5 },
//               }}
//               pagination={{ clickable: true }}
//               navigation={enableNav}
//               className="homePageSwiper px-4 pb-12"
//             >
//               {products.map((product) => (
//                 <SwiperSlide key={product._id}>
//                   <ProductCard
//                     product={product}
//                     onOpenDetails={() => setSelectedProduct(product)}
//                   />
//                 </SwiperSlide>
//               ))}
//             </Swiper>
//           </div>
//         );
//       })}

//       {selectedProduct && (
//         <ProductDetailsModal
//           product={selectedProduct}
//           onClose={() => setSelectedProduct(null)}
//         />
//       )}

//       <style jsx global>{`
//         .homePageSwiper {
//           padding-bottom: 40px !important;
//         }
//         .homePageSwiper .swiper-pagination {
//           bottom: 8px !important;
//         }
//       `}</style>
//     </div>
//   );
// }

// /* ================= PRODUCT CARD ================= */

// function ProductCard({ product, onOpenDetails }) {
//   const variant = product?.variants?.[0] || {};

//   const imagePath = variant?.images?.[0];

//   // FIXED PLACEHOLDER (no 404)
//   let image = "/images/placeholder.jpg";

//   if (imagePath) {
//     if (typeof imagePath === "string") {
//       image = imagePath.startsWith("http")
//         ? imagePath
//         : `${API_BASE}${imagePath}`;
//     } else if (typeof imagePath === "object") {
//       const path = imagePath.url || imagePath.path;
//       if (path) {
//         image = path.startsWith("http")
//           ? path
//           : `${API_BASE}${path}`;
//       }
//     }
//   }

//   const firstSize = variant?.sizes?.[0] || {};

//   const price =
//     firstSize?.price ||
//     product?.minPrice ||
//     product?.price ||
//     0;

//   const oldPrice =
//     firstSize?.mrp ||
//     product?.mrp ||
//     null;

//   const discount =
//     oldPrice && price
//       ? Math.round(((oldPrice - price) / oldPrice) * 100)
//       : null;

//   const sizes = variant?.sizes?.map((s) => s.size) || [];

//   const rating = product?.rating || 4.4;
//   const reviews = product?.numReviews || 150;

//   return (
//     <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full">
//       <div
//         className="relative aspect-[3/4] overflow-hidden bg-gray-50 cursor-pointer"
//         onClick={onOpenDetails}
//       >
//         <img
//           src={image}
//           alt={product.name}
//           loading="lazy"
//           className="w-full h-full object-cover object-top hover:scale-110 transition"
//         />

//         {discount && (
//           <div className="absolute top-2 left-2 bg-[#ed4e7e] text-white text-[10px] px-2 py-0.5 font-bold rounded">
//             {discount}% OFF
//           </div>
//         )}
//       </div>

//       <div className="p-3 flex flex-col flex-grow">
//         <h3 className="text-[11px] font-bold truncate uppercase mb-1">
//           {product.name}
//         </h3>

//         <div className="flex items-center gap-1 mb-1">
//           <Star size={10} className="fill-[#ed4e7e] text-[#ed4e7e]" />
//           <span className="text-[10px] font-bold text-[#ed4e7e]">
//             {rating}
//           </span>
//           <span className="text-[9px] text-gray-400">
//             ({reviews})
//           </span>
//         </div>

//         <div className="flex items-center gap-2 mb-3">
//           <span className="text-sm font-black text-gray-900">
//             ₹{price}
//           </span>

//           {oldPrice && (
//             <span className="text-[10px] text-gray-400 line-through">
//               ₹{oldPrice}
//             </span>
//           )}
//         </div>

//         {/* {sizes.length > 0 && (
//           <div className="flex gap-1 mb-3">
//             {sizes.slice(0, 4).map((size) => (
//               <span
//                 key={size}
//                 className="flex-1 text-center border text-[10px] py-1 rounded font-bold text-gray-600"
//               >
//                 {size}
//               </span>
//             ))}
//           </div>
//         )} */}

//         <div className="mt-auto flex items-center gap-2">
//           <button
//             onClick={onOpenDetails}
//             className="flex-1 bg-[#ed4e7e] text-white py-2 text-xs font-bold uppercase rounded active:scale-95 transition"
//           >
//             ADD TO CART
//           </button>
//           <button
//             className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 transition">
//             <Heart size={18} />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { ChevronRight, Heart, Star } from "lucide-react";
import { ProductDetailsModal } from "./category/ProductDetailsModal";

import "swiper/css";
import "swiper/css/navigation";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

/* ================= API BASE ================= */

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/* ================= CATEGORY MAP ================= */

const categoryMap = {
  bra: "bra",
  panties: "panties",
  lingerie: "lingerie",
  curvy: "lingerie",
  shapewear: "shapewear",
  "tummy-control": "shapewear",
};

/* ================= HOME SECTIONS ================= */

const homeSections = [
  { id: "bra", title: "Trending Bras", path: "/bra", count: 8 },
  { id: "panties", title: "Comfy Panties", path: "/panties", count: 8 },
  { id: "lingerie", title: "Lingerie Sets", path: "/lingerie", count: 8 },
  { id: "curvy", title: "Curvy Collection", path: "/curvy", count: 8 },
  { id: "shapewear", title: "Shapewear Styles", path: "/shapewear", count: 8 },
  { id: "tummy-control", title: "Tummy Control", path: "/tummy-control", count: 8 },
];

export default function AutoSliceSlider() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productsData, setProductsData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const requests = homeSections.map(async (section) => {
          const backendCategory = categoryMap[section.id];

          const res = await fetch(
            `${API_BASE}/api/products?category=${backendCategory}&limit=20`
          );

          const result = await res.json();

          return {
            id: section.id,
            products: result.success ? result.products : [],
          };
        });

        const results = await Promise.all(requests);

        const data = {};
        results.forEach((r) => {
          data[r.id] = r.products;
        });

        setProductsData(data);
      } catch (err) {
        console.error("Slider fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) return null;

  return (
    <div className="flex flex-col gap-12 py-10 bg-white">
      {homeSections.map((section) => {
        const products =
          productsData[section.id]?.slice(0, section.count) || [];

        if (!products.length) return null;

        const enableLoop = products.length >= 6;
        const enableNav = products.length > 1;

        return (
          <div key={section.id} className="w-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 px-4">
              <h2 className="text-xl md:text-2xl font-black text-gray-800 uppercase italic border-l-4 border-[#ed4e7e] pl-4">
                {section.title}
              </h2>

              <a
                href={section.path}
                className="flex items-center gap-1 text-[10px] font-bold bg-[#ed4e7e] text-white px-4 py-2 rounded-full uppercase"
              >
                View All <ChevronRight size={14} />
              </a>
            </div>

            <Swiper
              modules={[Autoplay, Navigation]}
              spaceBetween={15}
              loop={enableLoop}
              autoplay={
                enableLoop
                  ? { delay: 4000, disableOnInteraction: false }
                  : false
              }
              breakpoints={{
                320: { slidesPerView: 1.5 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4.5 },
              }}
              // pagination={{ clickable: true }}
              navigation={enableNav}
              className="homePageSwiper px-4">
              {products.map((product) => (
                <SwiperSlide key={product._id}>
                  <ProductCard
                    product={product}
                    onOpenDetails={() => setSelectedProduct(product)}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        );
      })}

      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}


function ProductCard({ product, onOpenDetails }) {
  const variant = product?.variants?.[0] || {};
  const { wishlist, toggleWishlist, removeFromWishlist } = useWishlist();
  const { user } = useAuth();

  const isWishlisted = wishlist.some((p) => p._id === product._id);

  const imagePath = variant?.images?.[0]?.url;
  let image = "/images/placeholder.jpg";

  if (imagePath) {
    image = imagePath.startsWith("http")
      ? imagePath
      : imagePath.startsWith("data:image")
        ? imagePath
        : `${API_BASE}${imagePath}`;
  }

  const firstSize = variant?.sizes?.[0] || {};
  const price = firstSize?.price || product?.minPrice || 0;
  const oldPrice = firstSize?.mrp || product?.mrp || null;

  const discount =
    oldPrice && price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : null;

  const rating = product?.rating || 4.4;
  const reviews = product?.numReviews || 150;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full">

      {/* IMAGE */}
      <div
        className="relative aspect-[3/4] overflow-hidden bg-gray-50 cursor-pointer"
        onClick={onOpenDetails}
      >
        <img
          src={image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-top hover:scale-110 transition"
        />

        {/* WISHLIST BUTTON */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!user) return alert("Please login to use wishlist");

            isWishlisted
              ? removeFromWishlist(product._id)
              : toggleWishlist(product);
          }}
          className="absolute top-2 right-2 z-20 bg-white rounded-full w-[30px] h-[30px] flex items-center justify-center shadow-md hover:scale-110 transition-transform"
        >
          <Heart
            size={16}
            className={`transition-colors ${isWishlisted
              ? "fill-[#ed4e7e] stroke-[#ed4e7e]"
              : "stroke-[#ed4e7e]"
              }`}
          />
        </button>

        {discount && (
          <div className="absolute top-2 left-2 bg-[#ed4e7e] text-white text-[10px] px-2 py-0.5 font-bold rounded">
            {discount}% OFF
          </div>
        )}
      </div>

      {/* DETAILS */}
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-[11px] font-bold truncate uppercase mb-1">
          {product.name}
        </h3>

        <div className="flex items-center gap-1 mb-1">
          <Star size={10} className="fill-[#ed4e7e] text-[#ed4e7e]" />
          <span className="text-[10px] font-bold text-[#ed4e7e]">
            {rating}
          </span>
          <span className="text-[9px] text-gray-400">
            ({reviews})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-gray-900">
            ₹{price}
          </span>

          {oldPrice && (
            <span className="text-[10px] text-gray-400 line-through">
              ₹{oldPrice}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}