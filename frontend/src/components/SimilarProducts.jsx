"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { ProductGridSkeleton } from "@/components/loaders/Loaders";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const getImageUrl = (url) => {
  if (!url) return "/placeholder.jpg";
  if (url.startsWith("data:image")) return url;
  if (url.startsWith("http")) return url;
  return API_BASE + url;
};

const formatCurrency = (value) => `\u20B9${Number(value || 0).toLocaleString("en-IN")}`;

export default function SimilarProducts({ currentProduct }) {
  const router = useRouter();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentProduct?._id) return;

    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products/similar/${currentProduct._id}`);
        const data = await res.json();

        if (data.success) {
          setAllProducts(data.products || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentProduct]);

  const similarProducts = useMemo(() => {
    if (!currentProduct || !allProducts.length) return [];
    return allProducts.filter((item) => item._id !== currentProduct._id).slice(0, 10);
  }, [currentProduct, allProducts]);

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-[1240px] px-4 pb-3 pt-7 md:px-0 md:pt-10">
        <div className="mb-3 md:mb-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#c56f7f] md:text-[12px]">
            You may also like
          </p>
          <h2 className="font-['Playfair_Display'] text-[20px] font-semibold text-[#4a2e35] md:text-[34px]">
            Similar Products
          </h2>
        </div>
        <ProductGridSkeleton count={5} className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5 md:gap-5" />
      </section>
    );
  }

  if (!similarProducts.length) return null;

  return (
    <section className="mx-auto w-full max-w-[1240px] px-4 pb-3 pt-7 md:px-0 md:pt-10">
      <div className="mb-3 md:mb-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#c56f7f] md:text-[12px]">
          You may also like
        </p>
        <h2 className="font-['Playfair_Display'] text-[20px] font-semibold text-[#4a2e35] md:text-[34px]">
          Similar Products
        </h2>
      </div>

      <div className="grid grid-flow-col auto-cols-[72%] gap-3 overflow-x-auto pb-1 md:grid-flow-row md:auto-cols-auto md:grid-cols-4 lg:grid-cols-5 md:gap-5 md:overflow-visible">
        {similarProducts.map((item) => {
          const firstVariant = item.variants?.[0];
          const firstSize = firstVariant?.sizes?.[0];
          const image = firstVariant?.images?.[0]?.url
            ? getImageUrl(firstVariant.images[0].url)
            : "/placeholder.jpg";
          const price = firstSize?.price || item.minPrice || 0;
          const mrp = firstSize?.mrp || item.mrp || 0;
          const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

          return (
            <button
              key={item._id}
              type="button"
              onClick={() => router.push(`/product/${item.slug}`)}
              className="overflow-hidden rounded-[18px] border border-[#ead7dd] bg-white text-left shadow-[0_2px_10px_rgba(74,46,53,0.04)]"
            >
              <div className="relative aspect-square overflow-hidden bg-[#fff8f6]">
                {item.rating > 0 ? (
                  <div className="absolute bottom-2 left-2 z-10 inline-flex items-center gap-1 rounded-full bg-[rgba(255,255,255,0.94)] px-2 py-1 text-[11px] font-semibold text-[#2f7d63] shadow-[0_6px_18px_rgba(74,46,53,0.10)]">
                    <span>{item.rating}</span>
                    <Star size={11} className="fill-current" />
                  </div>
                ) : null}
                <img src={image} alt={item.name} className="h-full w-full object-cover" />
              </div>

              <div className="space-y-1 px-3 py-3">
                <h3 className="line-clamp-1 text-[13px] font-semibold leading-[1.2] text-[#5b3c46]">
                  {item.brand || item.name}
                </h3>
                <p className="line-clamp-2 text-[12px] leading-[1.35] text-[#7d6670]">{item.name}</p>
                <div className="flex flex-wrap items-baseline gap-1.5 pt-1">
                  <span className="text-[14px] font-bold text-[#a04f62]">{formatCurrency(price)}</span>
                  {mrp > price ? (
                    <>
                      <span className="text-[11px] text-[#a68f97] line-through">{formatCurrency(mrp)}</span>
                      {discount > 0 ? (
                        <span className="text-[11px] font-semibold text-[#d66d52]">({discount}% OFF)</span>
                      ) : null}
                    </>
                  ) : null}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
