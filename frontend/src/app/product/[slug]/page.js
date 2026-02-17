"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  const [selectedSize, setSelectedSize] = useState("");
  const [activeImage, setActiveImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [topReviews, setTopReviews] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/products/slug/${slug}`
        );
        const data = await res.json();

        if (data.success) {
          setProduct(data.product);
          setSelectedVariant(data.product.variants?.[0]);
          setActiveImage(
            data.product.variants?.[0]?.images?.[0]
              ? API_BASE + data.product.variants[0].images[0]
              : "/placeholder.jpg"
          );
          setTopReviews(data.product.reviews?.slice(0, 5) || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchProduct();
  }, [slug]);

  if (loading) return <div className="p-10">Loading...</div>;
  if (!product) return <div className="p-10">Product Not Found</div>;

  const price = selectedVariant?.price || product.price;
  const mrp = selectedVariant?.mrp || product.mrp;

  return (
    <div className="bg-white min-h-screen">
      <Navbar />

      {/* ================= RESPONSIVE CONTAINER ================= */}
      <div
        className="
        w-full
        max-w-[1600px]
        mx-auto
        px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16
        py-8
        grid
        grid-cols-1
        lg:grid-cols-2
        xl:grid-cols-[1.05fr_1fr]
        gap-10 xl:gap-14 2xl:gap-20
      "
      >
        {/* ================= LEFT IMAGE SECTION ================= */}
        <div className="flex flex-col-reverse lg:flex-row gap-4">

          {/* Thumbnails */}
          <div className="flex lg:flex-col gap-3">
            {selectedVariant?.images?.map((img, i) => (
              <img
                key={i}
                src={`${API_BASE}${img}`}
                onMouseEnter={() =>
                  setActiveImage(`${API_BASE}${img}`)
                }
                className="
                  w-16 h-20
                  sm:w-18 sm:h-22
                  md:w-20 md:h-24
                  object-cover
                  rounded
                  cursor-pointer
                  border
                  hover:border-black
                  hover:scale-105
                  transition duration-300
                "
              />
            ))}
          </div>

          {/* Main Image */}
          <div className="flex-1 overflow-hidden rounded">
            <img
              src={activeImage}
              className="
                w-full
                max-h-[600px]
                xl:max-h-[700px]
                2xl:max-h-[800px]
                object-cover
                hover:scale-105
                transition duration-500
              "
            />
          </div>
        </div>

        {/* ================= RIGHT DETAILS SECTION ================= */}
        <div className="space-y-6">

          {/* Title */}
          <div>
            <h1 className="text-2xl font-semibold tracking-wide">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 mt-2 text-sm">
              <Star size={16} className="fill-green-600 text-green-600" />
              <span>{product.rating}</span>
              <span className="text-gray-500">
                ({product.numReviews} Reviews)
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold">₹{price}</span>
            {mrp && (
              <>
                <span className="line-through text-gray-400">
                  ₹{mrp}
                </span>
                <span className="text-orange-600 font-medium">
                  {Math.round(((mrp - price) / mrp) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          {/* ================= SELECT COLOR ================= */}
          {product.variants?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">SELECT COLOR</h3>
              <div className="flex gap-3 flex-wrap">
                {product.variants.map((variant, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedVariant(variant);
                      setActiveImage(
                        variant.images?.[0]
                          ? API_BASE + variant.images[0]
                          : "/placeholder.jpg"
                      );
                      setSelectedSize("");
                    }}
                    className={`
                      w-10 h-10 rounded-full border-2
                      transition duration-300
                      hover:scale-110
                      ${
                        selectedVariant?.color === variant.color
                          ? "border-black"
                          : "border-gray-300"
                      }
                    `}
                    style={{ backgroundColor: variant.colorCode || "#ddd" }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* SIZE */}
          <div>
            <div className="flex justify-between mb-3">
              <h3 className="font-semibold">SELECT SIZE</h3>
              <span className="text-pink-600 cursor-pointer text-sm hover:underline">
                Size Chart
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              {selectedVariant?.sizes?.map((s, i) => (
                <button
                  key={i}
                  disabled={s.stock === 0}
                  onClick={() => setSelectedSize(s.size)}
                  className={`
                    w-12 h-12 rounded-full border text-sm font-medium
                    transition duration-300
                    ${
                      selectedSize === s.size
                        ? "bg-black text-white border-black scale-105"
                        : "hover:border-black hover:scale-105"
                    }
                  `}
                >
                  {s.size}
                </button>
              ))}
            </div>
          </div>

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
                  size: selectedSize,
                  quantity: 1,
                });
                alert("Added to bag");
              }}
              className="
                flex-1 min-w-[160px]
                bg-pink-600 text-white py-3 rounded
                hover:bg-pink-700 hover:scale-105
                transition duration-300
                flex items-center justify-center gap-2
              "
            >
              <ShoppingBag size={18} />
              ADD TO BAG
            </button>

            <button
              className="
                flex-1 min-w-[160px]
                border rounded py-3
                hover:border-black hover:scale-105
                transition duration-300
                flex items-center justify-center gap-2
              "
            >
              <Heart size={18} />
              WISHLIST
            </button>
          </div>

          {/* DELIVERY */}
          <div className="space-y-2 text-sm text-gray-700 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Truck size={16} /> Delivery Options
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} /> 100% Original Products
            </div>
          </div>

          {/* ================= BEST OFFERS ================= */}
          <div className="pt-6 border-t">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Tag size={16} /> Best Offers
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✔ 10% Instant Discount</li>
              <li>✔ Free Shipping above ₹999</li>
              <li>✔ 7 Day Easy Returns</li>
            </ul>
          </div>

          {/* DESCRIPTION */}
          <div className="pt-6 border-t">
            <h3 className="font-semibold mb-2">
              Product Details
            </h3>
            <p className="text-gray-600 text-sm leading-6">
              {product.description}
            </p>
          </div>

          {/* TOP 5 REVIEWS */}
          <div className="pt-8 border-t">
            <h3 className="font-semibold mb-4">
              Customer Reviews
            </h3>

            {topReviews.map((rev, i) => (
              <div key={i} className="mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <Star
                    size={14}
                    className="fill-green-600 text-green-600"
                  />
                  <span>{rev.rating}</span>
                </div>
                <p className="mt-1 text-gray-700">
                  {rev.comment}
                </p>
              </div>
            ))}

            <button
              onClick={() =>
                router.push(`/product/${slug}/reviews`)
              }
              className="text-pink-600 font-medium flex items-center gap-1 hover:underline"
            >
              View All Reviews <ChevronRight size={16} />
            </button>
          </div>

        </div>
        
      </div>
                {/* ===== SIMILAR PRODUCTS ===== */}
<SimilarProducts currentProduct={product} />

    </div>
  );
}
