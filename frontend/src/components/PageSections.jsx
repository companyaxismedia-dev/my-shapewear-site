"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";
import SectionRenderer from "./SectionRenderer";

export default function PageSections({ slug = "home", compact = false }) {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/pages/${slug}`);
        const data = await res.json();
        setPage(data);
      } catch (err) {
        console.error("Failed to load page sections", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card-imkaa" style={{ padding: 18 }}>
            <div className="skeleton" style={{ aspectRatio: "4 / 3", marginBottom: 14 }} />
            <div className="skeleton" style={{ height: 14, width: "70%", marginBottom: 10 }} />
            <div className="skeleton" style={{ height: 12, width: "45%" }} />
          </div>
        ))}
      </div>
    );
  }
  if (!page) return null;

  return (
    <div>
      {page.sections
        ?.filter((section) => section.type !== 'hero_slider')
        ?.map((section) => (
          <SectionRenderer key={section._id} section={section} compact={compact} />
        ))}
    </div>
  );
}
