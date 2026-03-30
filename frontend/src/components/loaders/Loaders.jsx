"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export function SkeletonBlock({ className = "", style = {} }) {
  return <div className={`skeleton rounded-[inherit] ${className}`.trim()} style={style} />;
}

export function InlineSpinner({ className = "h-4 w-4" }) {
  return <Loader2 className={`${className} animate-spin`.trim()} />;
}

export function ButtonLoaderLabel({ label = "Processing..." }) {
  return (
    <span className="inline-flex items-center justify-center gap-2">
      <InlineSpinner className="h-4 w-4" />
      <span>{label}</span>
    </span>
  );
}

export function AuthStatusLoader({
  title = "Please wait",
  description = "We are securely processing your request.",
  className = "",
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-[20px] border border-[#ecdce0] bg-[#fff6f8] px-4 py-3 text-[#7f666d] ${className}`.trim()}
    >
      <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#c56f7f] shadow-[0_6px_18px_rgba(197,111,127,0.12)]">
        <span className="absolute inset-0 rounded-full border-2 border-[#f2c5d0] opacity-70 animate-ping" />
        <InlineSpinner className="relative z-[1] h-4 w-4" />
      </span>
      <div className="space-y-0.5">
        <p className="text-sm font-semibold text-[#4a2e35]">{title}</p>
        <p className="text-xs text-[#876c74]">{description}</p>
      </div>
    </div>
  );
}

export function BannerSkeleton({ className = "" }) {
  return (
    <div
      className={`relative overflow-hidden ${className}`.trim()}
      style={{
        background:
          "linear-gradient(135deg, rgba(255,249,250,1) 0%, rgba(252,241,244,1) 54%, rgba(248,233,238,1) 100%)",
      }}
    >
      <SkeletonBlock className="h-full w-full rounded-none" />
      <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonBlock
            key={index}
            className={index === 0 ? "h-2 w-8 rounded-full" : "h-2 w-2 rounded-full"}
          />
        ))}
      </div>
    </div>
  );
}

export function SectionHeadingSkeleton() {
  return (
    <div className="space-y-3">
      <SkeletonBlock className="h-8 w-64 rounded-full" />
      <SkeletonBlock className="h-4 w-80 max-w-full rounded-full" />
    </div>
  );
}

export function ProductCardSkeleton({ compact = false }) {
  return (
    <div
      className="overflow-hidden rounded-[20px] border border-[#ecd9de] bg-white shadow-[0_8px_24px_rgba(74,46,53,0.05)]"
      style={{ minHeight: compact ? 260 : 320 }}
    >
      <SkeletonBlock className="aspect-[3/4] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <SkeletonBlock className="h-4 w-11/12 rounded-full" />
        <SkeletonBlock className="h-3 w-2/5 rounded-full" />
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-4 w-20 rounded-full" />
          <SkeletonBlock className="h-3 w-12 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({
  count = 8,
  className = "grid grid-cols-2 gap-x-3 gap-y-[18px] sm:gap-x-4 sm:gap-y-[22px] lg:grid-cols-3 lg:gap-x-5 lg:gap-y-[26px] xl:grid-cols-4 xl:gap-y-7 2xl:grid-cols-5 2xl:gap-x-[22px] 2xl:gap-y-[30px]",
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function SearchSuggestionSkeleton({ rows = 5 }) {
  return (
    <div className="w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-xl">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 border-b border-gray-50 px-4 py-3 last:border-none">
          <SkeletonBlock className="h-12 w-10 rounded-md" />
          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonBlock className="h-3.5 w-4/5 rounded-full" />
            <SkeletonBlock className="h-3 w-1/3 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function OfferListSkeleton({ rows = 2, className = "" }) {
  return (
    <div className={`space-y-3 ${className}`.trim()}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex gap-3">
          <SkeletonBlock className="mt-1 h-4 w-4 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonBlock className="h-3.5 w-3/5 rounded-full" />
            <SkeletonBlock className="h-3 w-full rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CartItemSkeleton() {
  return (
    <div className="overflow-hidden rounded-[4px] border border-[#ece5e8] bg-white shadow-[0_6px_18px_rgba(45,28,35,0.05)]">
      <div className="flex gap-4 p-4">
        <SkeletonBlock className="h-[120px] w-[96px] shrink-0 rounded-[4px]" />
        <div className="min-w-0 flex-1 space-y-3">
          <SkeletonBlock className="h-4 w-1/3 rounded-full" />
          <SkeletonBlock className="h-4 w-4/5 rounded-full" />
          <div className="flex flex-wrap gap-3">
            <SkeletonBlock className="h-9 w-20 rounded-[4px]" />
            <SkeletonBlock className="h-9 w-20 rounded-[4px]" />
          </div>
          <SkeletonBlock className="h-5 w-32 rounded-full" />
          <SkeletonBlock className="h-3.5 w-40 rounded-full" />
        </div>
      </div>
      <div className="flex gap-4 border-t border-[#eee3e6] px-4 py-3">
        <SkeletonBlock className="h-4 w-24 rounded-full" />
        <SkeletonBlock className="h-4 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function CartItemsSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <CartItemSkeleton key={index} />
      ))}
    </div>
  );
}

export function AddressCardSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-[4px] border border-[#ece5e8] bg-white p-5 shadow-[0_6px_18px_rgba(45,28,35,0.05)]"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <SkeletonBlock className="h-5 w-5 rounded-full" />
              <SkeletonBlock className="h-4 w-40 rounded-full" />
              <SkeletonBlock className="h-5 w-16 rounded-full" />
            </div>
            <SkeletonBlock className="h-3.5 w-full rounded-full" />
            <SkeletonBlock className="h-3.5 w-4/5 rounded-full" />
            <SkeletonBlock className="h-3.5 w-1/3 rounded-full" />
            <div className="flex gap-3 pt-1">
              <SkeletonBlock className="h-9 w-24 rounded-[4px]" />
              <SkeletonBlock className="h-9 w-24 rounded-[4px]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function OrderSummarySkeleton({ lines = 6 }) {
  return (
    <div className="rounded-[4px] border border-[#ece5e8] bg-white p-6 shadow-[0_6px_18px_rgba(45,28,35,0.05)]">
      <SkeletonBlock className="mb-5 h-5 w-40 rounded-full" />
      <div className="space-y-4 border-t border-[#eee3e6] pt-5">
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <SkeletonBlock className="h-3.5 w-28 rounded-full" />
            <SkeletonBlock className="h-3.5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TrackResultSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-[#ecd9de] bg-white p-6 shadow-[0_12px_34px_rgba(74,46,53,0.05)]">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <SkeletonBlock className="h-3 w-28 rounded-full" />
            <SkeletonBlock className="h-8 w-48 rounded-full" />
            <SkeletonBlock className="h-4 w-32 rounded-full" />
          </div>
          <div className="space-y-2">
            <SkeletonBlock className="h-3 w-20 rounded-full" />
            <SkeletonBlock className="h-5 w-24 rounded-full" />
          </div>
        </div>
        <div className="mt-10 flex items-center justify-between gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center gap-3">
              <SkeletonBlock className="h-10 w-10 rounded-full" />
              <SkeletonBlock className="h-3 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="rounded-[2rem] border border-[#ecd9de] bg-white p-6 shadow-[0_12px_34px_rgba(74,46,53,0.05)]">
            <SkeletonBlock className="mb-5 h-4 w-32 rounded-full" />
            <div className="space-y-4">
              <SkeletonBlock className="h-4 w-4/5 rounded-full" />
              <SkeletonBlock className="h-4 w-full rounded-full" />
              <SkeletonBlock className="h-4 w-3/5 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductPageSkeleton() {
  return (
    <div className="mx-auto max-w-[1240px] px-4 pb-10 pt-[72px] md:px-4 md:pt-24">
      <div className="hidden md:grid md:grid-cols-[minmax(620px,0.95fr)_minmax(360px,0.85fr)] md:gap-9">
        <section className="grid grid-cols-[88px_minmax(0,1fr)] items-start gap-4">
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonBlock key={index} className="aspect-[4/5] w-full rounded-2xl" />
            ))}
          </div>
          <SkeletonBlock className="min-h-[620px] w-full rounded-[28px]" />
        </section>
        <section className="space-y-6 rounded-[28px] border border-[#ead7dd] bg-white p-7 shadow-[0_8px_28px_rgba(74,46,53,0.06)]">
          <div className="space-y-3">
            <SkeletonBlock className="h-3.5 w-24 rounded-full" />
            <SkeletonBlock className="h-10 w-4/5 rounded-full" />
            <SkeletonBlock className="h-4 w-full rounded-full" />
            <SkeletonBlock className="h-4 w-2/3 rounded-full" />
          </div>
          <SkeletonBlock className="h-12 w-48 rounded-full" />
          <div className="space-y-4">
            <SkeletonBlock className="h-4 w-32 rounded-full" />
            <div className="flex gap-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-11 w-11 rounded-full" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <SkeletonBlock className="h-4 w-28 rounded-full" />
            <div className="flex gap-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-12 w-12 rounded-full" />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_180px] gap-3">
            <SkeletonBlock className="h-[52px] rounded-full" />
            <SkeletonBlock className="h-[52px] rounded-full" />
          </div>
        </section>
      </div>
      <div className="space-y-4 md:hidden">
        <SkeletonBlock className="h-[520px] w-full rounded-b-[28px]" />
        <div className="px-4">
          <div className="space-y-3 rounded-[22px] bg-white py-2">
            <SkeletonBlock className="h-3.5 w-20 rounded-full" />
            <SkeletonBlock className="h-8 w-4/5 rounded-full" />
            <SkeletonBlock className="h-4 w-full rounded-full" />
            <SkeletonBlock className="h-6 w-40 rounded-full" />
          </div>
          <SkeletonBlock className="mt-3 h-28 rounded-[22px]" />
          <SkeletonBlock className="mt-3 h-28 rounded-[22px]" />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <SkeletonBlock className="h-12 rounded-2xl" />
            <SkeletonBlock className="h-12 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AsyncImage({
  src,
  alt,
  className = "",
  skeletonClassName = "",
  ...props
}) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${className}`.trim()}>
      {!loaded ? <SkeletonBlock className={`absolute inset-0 ${skeletonClassName}`.trim()} /> : null}
      <img
        {...props}
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`${className} ${props.className || ""} ${loaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300 object-cover`.trim()}
      />
    </div>
  );
}
