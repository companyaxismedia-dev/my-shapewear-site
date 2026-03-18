"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";
import SectionRenderer from "./SectionRenderer";

export default function PageSections({ slug = "home" }) {
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

  if (loading) return <div className="py-20 text-center">Loading...</div>;
  if (!page) return null;

  return (
    <div>
      {page.sections
        ?.filter((section) => section.type !== 'hero_slider')
        ?.map((section) => (
          <SectionRenderer key={section._id} section={section} />
        ))}
    </div>
  );
}
