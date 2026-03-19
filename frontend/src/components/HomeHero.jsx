"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function HomeHero() {
  return (
    <section className="section-padding w-full" style={{ background: "var(--color-bg)" }}>
      <div className="container-imkaa">
        <div className="grid items-center gap-8 lg:gap-16 xl:grid-cols-2 auto-rows-auto">
          {/* Left: Content */}
          <div>
            <h1 className="heading-hero">
              Sculpted comfort, made for everyday elegance.
            </h1>
            <p className="text-body" style={{ fontSize: 16, marginTop: 14 }}>
              Premium essentials designed to support, smooth, and move with you — without compromising on softness or style.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8">
              <Link href="/exclusive" className="btn-primary-imkaa">
                Shop Collection
              </Link>
              <Link href="/bra" className="btn-secondary-imkaa">
                View Products
              </Link>
            </div>
          </div>

          {/* Right: Premium Image */}
          <div
            className="card-imkaa"
            style={{
              borderRadius: 22,
              overflow: "hidden",
              background: "var(--color-card)",
            }}
          >
            <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 10" }}>
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
    </section>
  );
}

