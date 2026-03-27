"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function HomeHero() {
  return (
    <section
      className="section-padding w-full"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,249,250,0.9) 0%, rgba(252,241,244,0.96) 100%)",
      }}
    >
      <div className="container-imkaa">
        <div
          className="relative overflow-hidden rounded-[28px] border border-[#f1dde3] px-5 py-8 shadow-[0_18px_50px_rgba(116,73,85,0.08)] sm:px-7 sm:py-10 lg:px-12 lg:py-14 xl:px-14 xl:py-16"
          style={{
            background:
              "radial-gradient(circle at top left, rgba(232,187,198,0.26), transparent 34%), radial-gradient(circle at bottom right, rgba(214,150,167,0.18), transparent 28%), linear-gradient(135deg, #fffdfd 0%, #fdf6f7 54%, #fbf0f3 100%)",
          }}
        >
          <div className="pointer-events-none absolute -left-12 top-10 h-28 w-28 rounded-full bg-[#f7d6de]/40 blur-2xl" />
          <div className="pointer-events-none absolute -right-10 bottom-6 h-32 w-32 rounded-full bg-[#efc3cf]/35 blur-3xl" />
          <div className="pointer-events-none absolute inset-y-0 left-[48%] hidden w-px bg-[linear-gradient(180deg,transparent,rgba(197,111,127,0.14),transparent)] xl:block" />

          <div className="grid auto-rows-auto items-center gap-8 lg:gap-16 xl:grid-cols-2">
            <div className="relative z-10">
              <div className="mb-4 inline-flex rounded-full border border-[#ebd2d9] bg-white/70 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a56f7d]">
                Everyday elegance
              </div>

              <h1 className="heading-hero max-w-[13ch]">
                Sculpted comfort, made for everyday elegance.
              </h1>

              <p
                className="max-w-[33rem] text-body text-[#70545d]"
                style={{ fontSize: 16, marginTop: 14 }}
              >
                Premium essentials designed to support, smooth, and move with you - without compromising on softness or style.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:gap-4">
                <Link href="/exclusive" className="btn-primary-imkaa text-center">
                  Shop Exclusive
                </Link>
                <Link href="/bra" className="btn-secondary-imkaa text-center">
                  View Products
                </Link>
              </div>
            </div>

            <div
              className="relative z-10 overflow-hidden rounded-[26px] border border-white/70 bg-white/65 p-2 shadow-[0_24px_60px_rgba(116,73,85,0.12)] backdrop-blur-sm"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.78) 0%, rgba(255,250,251,0.7) 100%)",
              }}
            >
              <div
                className="overflow-hidden rounded-[22px]"
                style={{ position: "relative", width: "100%", aspectRatio: "16 / 10" }}
              >
                <Image
                  src="/hero-image/home-122.jpeg"
                  alt="Premium shapewear collection"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, (max-width: 1536px) 50vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
