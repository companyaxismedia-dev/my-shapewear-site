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

export default function Home() {
  const [heroSlides, setHeroSlides] = useState([]);
  const [allSections, setAllSections] = useState([]);
  const [usedBannerIds, setUsedBannerIds] = useState([]);

  useEffect(() => {
    const loadHomePage = async () => {
      try {
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

      <main className="w-full mx-auto lg:pt-0">
        <Hero slides={heroSlides} />
        <HomeHero />

        <div className="space-y-0">
          <CategorySlider />

          <section
            className="section-padding"
            style={{ background: "var(--color-bg)" }}
          >
            <div className="container-imkaa">
              <div className="section-heading-block">
                <h2 className="heading-section">Our Exclusive Collections</h2>
                <p className="section-subtitle">
                  Curated for comfort, confidence, and everyday elegance.
                </p>
              </div>

              <AutoSliceSlider
                bannerSections={bannerSections}
                onUsedBannerIdsChange={setUsedBannerIds}
              />
            </div>
          </section>

          <section
            className="py-10 md:py-14"
            style={{ background: "var(--color-bg-alt)" }}
          >
            <div className="container-imkaa">
              <PageSections sections={remainingSections} compact />
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
