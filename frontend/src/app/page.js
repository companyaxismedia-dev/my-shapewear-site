"use client";

import React, { useEffect, useMemo, useState } from "react";
import { API_BASE } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HomeHero from "@/components/HomeHero";
import CategorySlider from "@/components/CategorySlider";
import AutoSliceSlider from "@/components/AutoSliceSlider";
import Footer from "@/components/Footer";
import PageSections from "@/components/PageSections";
import HomeReviewsSection from "@/components/HomeReviewsSection";
import {
  BannerSkeleton,
  SectionHeadingSkeleton,
  SkeletonBlock,
} from "@/components/loaders/Loaders";

export default function Home() {
  const [heroSlides, setHeroSlides] = useState([]);
  const [allSections, setAllSections] = useState([]);
  const [usedBannerIds, setUsedBannerIds] = useState([]);
  const [homeLoading, setHomeLoading] = useState(true);

  useEffect(() => {
    const loadHomePage = async () => {
      try {
        setHomeLoading(true);
        const res = await fetch(`${API_BASE}/api/pages/home`);
        const data = await res.json();

        const sections = data?.sections || [];
        setAllSections(sections);

        const heroSections = sections.filter((s) => s.type === "hero_slider");

        const slides = [];
        heroSections.forEach((section) => {
          if (Array.isArray(section.blocks)) {
            section.blocks.forEach((block) => {
              slides.push({
                _id: block._id,
                desktopUrl: block.data?.desktopUrl || block.data?.image,
                mobileUrl: block.data?.mobileUrl,
                link: block.data?.link,
                altText: block.data?.altText,
              });
            });
          }
        });

        setHeroSlides(slides);
      } catch (err) {
        console.error("Failed to load home page", err);
      } finally {
        setHomeLoading(false);
      }
    };

    loadHomePage();
  }, []);

  const bannerSections = useMemo(() => {
    return allSections.filter(
      (section) =>
        section.type !== "hero_slider" &&
        (section.layoutType === "banner" ||
          section.layoutType === "short_banner" ||
          section.type === "promo_banner")
    );
  }, [allSections]);

  const remainingSections = useMemo(() => {
    const usedIdsSet = new Set(usedBannerIds);

    return allSections.filter((section) => {
      if (section.type === "hero_slider") return false;
      if (usedIdsSet.has(section._id)) return false;
      return true;
    });
  }, [allSections, usedBannerIds]);

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: "var(--color-bg)" }}
    >
      <Navbar />

      <main className="mx-auto w-full pt-[112px] lg:pt-0">
        {homeLoading ? (
          <BannerSkeleton className="min-h-[320px] md:min-h-[420px]" />
        ) : (
          <Hero slides={heroSlides} />
        )}
        <HomeHero />

        <div className="space-y-0">
          <CategorySlider />

          <section
            className="section-padding lg:!py-10"
            style={{ background: "var(--color-bg)" }}
          >
            <div className="container-imkaa">
              {homeLoading ? (
                <SectionHeadingSkeleton />
              ) : (
                <div className="section-heading-block">
                  <h2 className="heading-section">Our Exclusive Collections</h2>
                  <p className="section-subtitle">
                    Curated for comfort, confidence, and everyday elegance.
                  </p>
                </div>
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
            {homeLoading ? (
              <div className="container-imkaa space-y-6">
                <SkeletonBlock className="h-[220px] rounded-[28px]" />
                <SkeletonBlock className="h-[220px] rounded-[28px]" />
              </div>
            ) : (
              <div className="container-imkaa">
                <PageSections sections={remainingSections} compact />
              </div>
            )}
          </section>
          <HomeReviewsSection />

        </div>
      </main>

      <Footer />
    </div>
  );
}
