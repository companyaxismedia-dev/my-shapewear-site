"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import {
  Heart,
  ShoppingBag,
  Star,
  Truck,
  ShieldCheck,
  ChevronRight,
  Tag,
} from "lucide-react";
import SimilarProducts from "@/components/SimilarProducts";

const API_BASE =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000"
    : "https://my-shapewear-site.onrender.com";

export default function ProductPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products/slug/${slug}`);
        const data = await res.json();

        if (data.success) {
          const p = data.product;
          setProduct(p);

          const firstVariant = p.variants?.[0];
          setSelectedVariant(firstVariant);

          const firstSize = firstVariant?.sizes?.[0];
          setSelectedSize(firstSize);

          const firstImg = firstVariant?.images?.[0]?.url;
          setActiveImage(firstImg ? API_BASE + firstImg : "/placeholder.jpg");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchProduct();
  }, [slug]);

  if (loading) return <div className="p-10">Loading...</div>;
  if (!product) return <div className="p-10">Product Not Found</div>;

  /* ================= PRICE ================= */
  const price = selectedSize?.price || product.minPrice;
  const mrp = selectedSize?.mrp || product.mrp;
  const discount =
    mrp && price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const topReviews = product.reviews?.slice(0, 5) || [];

  return (
    <div className="bg-white min-h-screen">
      <Navbar />

      <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-10 py-8 grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* ================= LEFT IMAGE (UNCHANGED) ================= */}
        <div className="flex flex-col-reverse lg:flex-row gap-4">

          <div className="flex lg:flex-col gap-3">
            {selectedVariant?.images?.map((img, i) => (
              <img
                key={i}
                src={`${API_BASE}${img.url}`}
                onMouseEnter={() => setActiveImage(`${API_BASE}${img.url}`)}
                className="w-20 h-24 object-cover cursor-pointer"
              />
            ))}
          </div>

          <div className="flex-1 overflow-hidden rounded">
            <img
              src={activeImage}
              className="w-full max-h-[700px] object-cover"
            />
          </div>
        </div>

        {/* ================= RIGHT SIDE ================= */}
        <div className="space-y-6">

          {/* BRAND + NAME */}
          <div>
            {product.brand && (
              <h2 className="text-xl font-semibold">{product.brand}</h2>
            )}
            <h1 className="text-lg text-gray-700">{product.name}</h1>

            {product.rating > 0 && (
              <div className="flex items-center gap-2 mt-2 text-sm">
                <Star size={15} className="fill-green-600 text-green-600" />
                {product.rating}
                <span className="text-gray-500">
                  ({product.numReviews} Ratings)
                </span>
              </div>
            )}
          </div>

          {/* PRICE */}
          <div className="border-t pt-4">
            <span className="text-3xl font-bold">₹{price}</span>
            {mrp && (
              <>
                <span className="line-through ml-2 text-gray-400">₹{mrp}</span>
                <span className="ml-2 text-orange-600 font-semibold">
                  ({discount}% OFF)
                </span>
              </>
            )}
          </div>

          {/* COLORS */}
          {product.variants?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">SELECT COLOR</h3>
              <div className="flex gap-3">
                {product.variants.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedVariant(v);
                      setSelectedSize(v.sizes?.[0]);
                      setActiveImage(API_BASE + v.images?.[0]?.url);
                    }}
                    className={`w-9 h-9 rounded-full border-2 ${
                      selectedVariant?.color === v.color
                        ? "border-black"
                        : "border-gray-300"
                    }`}
                    style={{ background: v.colorCode || "#ddd" }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* SIZE */}
          {selectedVariant?.sizes?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">SELECT SIZE</h3>
              <div className="flex flex-wrap gap-3">
                {selectedVariant.sizes.map((s, i) => (
                  <button
                    key={i}
                    disabled={s.stock === 0}
                    onClick={() => setSelectedSize(s)}
                    className={`w-12 h-12 rounded-full border ${
                      selectedSize?.size === s.size
                        ? "bg-black text-white"
                        : ""
                    }`}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* BUTTONS */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                if (!selectedSize) return alert("Select size");
                addToCart({
                  productId: product._id,
                  name: product.name,
                  price,
                  image: activeImage,
                  size: selectedSize.size,
                  quantity: 1,
                });
                alert("Added to bag");
              }}
              className="flex-1 bg-pink-600 text-white py-3 rounded flex justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag size={18} />
              ADD TO BAG
            </button>

            <button className="cursor-pointer flex-1 border rounded py-3 flex justify-center gap-2">
              <Heart size={18} />
              WISHLIST
            </button>
          </div>

          {/* DELIVERY */}
          <div className="border-t pt-4 text-sm space-y-2">
            <div className="flex items-center gap-2">
              <Truck size={15} /> Delivery Options
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={15} /> 100% Original Products
            </div>
          </div>

          {/* PRODUCT DETAILS */}
          {product.productDetails && (
            <section className="border-t pt-6">
              <h3 className="font-semibold mb-2">Product Details</h3>
              <p className="text-sm text-gray-700">{product.productDetails}</p>
            </section>
          )}

          {/* FEATURES */}
          {product.features?.length > 0 && (
            <section>
              <h3 className="font-semibold mb-2">Features</h3>
              <ul className="text-sm space-y-1">
                {product.features.map((f, i) => (
                  <li key={i}>• {f}</li>
                ))}
              </ul>
            </section>
          )}

          {/* SIZE & FIT */}
          {product.sizeAndFits?.length > 0 && (
            <section>
              <h3 className="font-semibold mb-2">Size & Fit</h3>
              {product.sizeAndFits.map((s, i) => (
                <p key={i} className="text-sm">
                  {s.label}: {s.value}
                </p>
              ))}
            </section>
          )}

          {/* MATERIAL CARE */}
          {product.materialCare?.length > 0 && (
            <section>
              <h3 className="font-semibold mb-2">Material & Care</h3>
              {product.materialCare.map((m, i) => (
                <p key={i} className="text-sm">{m}</p>
              ))}
            </section>
          )}

          {/* SPECIFICATIONS */}
          {product.specifications?.length > 0 && (
            <section>
              <h3 className="font-semibold mb-2">Specifications</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {product.specifications.map((s, i) => (
                  <div key={i}>
                    <p className="text-gray-500">{s.key}</p>
                    <p>{s.value}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* REVIEWS */}
          {topReviews.length > 0 && (
            <section className="border-t pt-6">
              <h3 className="font-semibold mb-3">Customer Reviews</h3>
              {topReviews.map((r, i) => (
                <div key={i} className="mb-3 text-sm">
                  ⭐ {r.rating} — {r.comment}
                </div>
              ))}
              <button
                onClick={() => router.push(`/product/${slug}/reviews`)}
                className="text-pink-600 flex items-center gap-1"
              >
                View All Reviews <ChevronRight size={16} />
              </button>
            </section>
          )}
        </div>
      </div>

      <SimilarProducts currentProduct={product} />
    </div>
  );
}