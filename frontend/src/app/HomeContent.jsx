"use client";

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HomeHero from "@/components/HomeHero";
import CategorySlider from "@/components/CategorySlider";
import Footer from "@/components/Footer";
import {
  SectionHeadingSkeleton,
  SkeletonBlock,
} from "@/components/loaders/Loaders";

const AutoSliceSlider = dynamic(() => import("@/components/AutoSliceSlider"), {
  loading: () => (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonBlock key={i} className="aspect-[3/4] rounded-[22px]" />
      ))}
    </div>
  ),
});

const PageSections = dynamic(() => import("@/components/PageSections"), {
  loading: () => (
    <div className="space-y-6">
      <SkeletonBlock className="h-[220px] rounded-[22px]" />
      <SkeletonBlock className="h-[220px] rounded-[22px]" />
    </div>
  ),
});

const HomeReviewsSection = dynamic(() => import("@/components/HomeReviewsSection"), {
  loading: () => <SkeletonBlock className="mx-auto h-[220px] max-w-[1180px] rounded-[22px]" />,
});

export default function HomeContent({
  initialSections = [],
  initialHeroSlides = [],
}) {
  const [usedBannerIds, setUsedBannerIds] = useState([]);

  const bannerSections = useMemo(() => {
    return initialSections.filter(
      (section) =>
        section.type !== "hero_slider" &&
        (section.layoutType === "banner" ||
          section.layoutType === "short_banner" ||
          section.type === "promo_banner"),
    );
  }, [initialSections]);

  const remainingSections = useMemo(() => {
    const usedIdsSet = new Set(usedBannerIds);

    return initialSections.filter((section) => {
      if (section.type === "hero_slider") return false;
      if (usedIdsSet.has(section._id)) return false;
      return true;
    });
  }, [initialSections, usedBannerIds]);

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: "var(--color-bg)" }}
    >
      <Navbar />

      <main className="mx-auto w-full pt-[112px] lg:pt-0">
        <Hero slides={initialHeroSlides} />
        <HomeHero />

        <div className="space-y-0">
          <CategorySlider />

          <section
            className="section-padding lg:!py-10"
            style={{ background: "var(--color-bg)" }}
          >
            <div className="container-imkaa">
              {initialSections.length ? (
                <div className="section-heading-block">
                  <h2 className="heading-section">Our Exclusive Collections</h2>
                  <p className="section-subtitle">
                    Curated for comfort, confidence, and everyday elegance.
                  </p>
                </div>
              ) : (
                <SectionHeadingSkeleton />
              )}
            </div>

            <div className="section-full-bleed">
              <AutoSliceSlider
                bannerSections={bannerSections}
                onUsedBannerIdsChange={setUsedBannerIds}
              />
            </div>
          </section>

          <section
            className="py-8 md:py-10 lg:py-10"
            style={{ background: "var(--color-bg-alt)" }}
          >
            <div className="container-imkaa">
              <PageSections sections={remainingSections} compact />
            </div>
          </section>
          <HomeReviewsSection />
        </div>
      </main>

      <Footer />
    </div>
  );
}
