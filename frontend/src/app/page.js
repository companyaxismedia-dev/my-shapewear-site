"use client";
import React, { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import OfferSection from "@/components/OfferSection";
import HomeHero from "@/components/HomeHero";
import CategorySlider from "@/components/CategorySlider";
import AutoSliceSlider from "@/components/AutoSliceSlider";
import Footer from "@/components/Footer";
import { Truck, ShieldCheck, RotateCcw, Zap } from "lucide-react";
import PageSections from "@/components/PageSections";

export default function Home() {
  const [heroSlides, setHeroSlides] = useState([]);

  useEffect(() => {
    const loadHeroSlides = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/pages/home`);
        const data = await res.json();
        
        console.log("📄 Page Data:", data);
        console.log("📋 All Sections:", data.sections);
        
        // Extract only hero_slider sections and convert blocks to slides format
        const heroSections = data.sections?.filter((s) => {
          console.log(`Section Type: "${s.type}" | Blocks: ${s.blocks?.length}`);
          return s.type === "hero_slider";
        }) || [];
        
        console.log("🎬 Hero Sections Found:", heroSections.length, heroSections);
        
        const slides = [];
        
        heroSections.forEach((section) => {
          if (section.blocks && Array.isArray(section.blocks)) {
            section.blocks.forEach((block) => {
              console.log("Block Data:", block.data);
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
        
        console.log("🖼️ Final Slides Array:", slides);
        setHeroSlides(slides);
      } catch (err) {
        console.error("Failed to load hero slides", err);
      }
    };

    loadHeroSlides();
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "var(--color-bg)" }}>
      <Navbar />

      <main className="w-full mx-auto">
        <Hero slides={heroSlides} />
        <HomeHero />

        <div className="space-y-0">
          <CategorySlider />

          {/* Exclusive collections */}
          <section className="section-padding" style={{ background: "var(--color-bg)" }}>
            <div className="container-imkaa">
              <div className="section-heading-block">
                <h2 className="heading-section">Our Exclusive Collections</h2>
                <p className="section-subtitle">
                  Curated for comfort, confidence, and everyday elegance.
                </p>
              </div>

              <AutoSliceSlider />
            </div>
          </section>

          {/* Dynamic sections from CMS */}
          <section className="py-10 md:py-14" style={{ background: "var(--color-bg-alt)" }}>
            <div className="container-imkaa">
              <PageSections slug="home" compact />
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
