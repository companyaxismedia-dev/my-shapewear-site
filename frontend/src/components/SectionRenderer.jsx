"use client";

import Hero from "@/components/Hero";
import CategorySlider from "@/components/CategorySlider";
import { API_BASE } from "@/lib/api";

export default function SectionRenderer({ section }) {
  if (!section || !section.blocks || section.blocks.length === 0) return null;

  const resolveImage = (src) => {
    if (!src) return src;
    if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) {
      return src;
    }
    if (src.startsWith("/")) {
      return `${API_BASE}${src}`;
    }
    // If it's just a filename, assume it's in /uploads/banner/
    return `${API_BASE}/uploads/banner/${src}`;
  };

  const getGridClasses = (cols) => {
    const c = Math.max(1, Math.min(6, Number(cols) || 1));
    const classes = [
      "grid",
      "gap-4",
      "grid-cols-1",
      c >= 2 ? "sm:grid-cols-2" : null,
      c >= 3 ? "md:grid-cols-3" : null,
      c >= 4 ? "lg:grid-cols-4" : null,
      c >= 5 ? "xl:grid-cols-5" : null,
      c >= 6 ? "2xl:grid-cols-6" : null,
    ];
    return classes.filter(Boolean).join(" ");
  };

  const renderBlockContent = (block) => {
    const data = block.data || {};
    const desktopUrl = data.desktopUrl || data.image || data.img || data.src;
    const mobileUrl = data.mobileUrl;
    const imageAlt = data.altText || data.alt || data.title || "Block image";

    return (
      <picture>
        {mobileUrl ? (
          <source srcSet={resolveImage(mobileUrl)} media="(max-width: 767px)" />
        ) : null}
        {desktopUrl ? (
          <img
            src={resolveImage(desktopUrl || mobileUrl)}
            alt={imageAlt}
            className="w-full h-full object-cover"
          />
        ) : null}
      </picture>
    );
  };

  // GRID LAYOUT (rows × columns)
  if (section.layoutType === "grid") {
    const cols = Math.max(1, Number(section.columns) || 4);
    const rows = Math.max(1, Number(section.rows) || 1);
    const itemsToShow = cols * rows;
    const itemsToDisplay = section.blocks.slice(0, itemsToShow);
    const effectiveCols = Math.min(cols, Math.max(1, itemsToDisplay.length));

    return (
      <div className="py-12">
        <div className="w-full px-4">
          <div className="max-w-full mx-auto">
            {section.title && (
              <h2 className="text-3xl md:text-4xl font-black text-[#ed4e7e] uppercase italic tracking-tight mb-8">
                {section.title}
              </h2>
            )}
            <div className={getGridClasses(effectiveCols)}>
              {itemsToDisplay.map((block) => {
                const data = block.data || {};
                return (
                  <a
                    key={block._id}
                    href={data.link || "#"}
                    className="rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition group"
                  >
                    <div className="aspect-square overflow-hidden bg-gray-100">
                      {renderBlockContent(block)}
                    </div>
                    {data.title && (
                      <div className="p-3 text-center">
                        <p className="text-sm font-semibold group-hover:text-[#ed4e7e] transition">
                          {data.title}
                        </p>
                      </div>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // COLUMNS LAYOUT (rows × columns)
  if (section.layoutType === "columns") {
    const cols = Math.max(1, Number(section.columns) || 3);
    const rows = Math.max(1, Number(section.rows) || 1);
    const itemsToShow = cols * rows;
    const itemsToDisplay = section.blocks.slice(0, itemsToShow);
    const effectiveCols = Math.min(cols, Math.max(1, itemsToDisplay.length));

    return (
      <div className="py-12">
        <div className="w-full px-4">
          <div className="max-w-full mx-auto">
            {section.title && (
              <h2 className="text-3xl md:text-4xl font-black text-[#ed4e7e] uppercase italic tracking-tight mb-8">
                {section.title}
              </h2>
            )}
            <div className={getGridClasses(effectiveCols)}>
              {itemsToDisplay.map((block) => {
                const data = block.data || {};
                return (
                  <a
                    key={block._id}
                    href={data.link || "#"}
                    className="block rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition group"
                  >
                    <div className="aspect-square overflow-hidden bg-gray-100">
                      {renderBlockContent(block)}
                    </div>
                    {data.title && (
                      <div className="p-4 text-center">
                        <p className="text-sm font-semibold group-hover:text-[#ed4e7e] transition">
                          {data.title}
                        </p>
                      </div>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // BANNER LAYOUT (full-width banners stacked vertically)
  if (section.layoutType === "banner") {
    const cols = Math.max(1, Number(section.columns) || 1);
    const rows = Math.max(1, Number(section.rows) || 1);
    const itemsToShow = cols * rows;
    const itemsToDisplay = section.blocks.slice(0, itemsToShow);

    return (
      <div className="py-6">
        <div className="w-full px-4">
          <div className="max-w-full mx-auto space-y-4">
            {itemsToDisplay.map((block) => {
              const data = block.data || {};
              const desktopUrl = data.desktopUrl || data.image || data.img || data.src;
              const mobileUrl = data.mobileUrl;
              
              return (
                <a
                  key={block._id}
                  href={data.link || "#"}
                  target={data.link ? "_blank" : undefined}
                  rel={data.link ? "noreferrer" : undefined}
                  className="block w-full rounded-xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition"
                >
                  <div className="w-full bg-gray-100" style={{ aspectRatio: "16/6" }}>
                    <picture>
                      {mobileUrl ? (
                        <source srcSet={resolveImage(mobileUrl)} media="(max-width: 767px)" />
                      ) : null}
                      {desktopUrl ? (
                        <img
                          src={resolveImage(desktopUrl)}
                          alt={data.altText || "Banner"}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No image
                        </div>
                      )}
                    </picture>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // TYPE-BASED RENDERING (fallback)
  switch (section.type) {
    case "hero_slider": {
      const slides = section.blocks.map((b) => ({
        _id: b._id,
        ...b.data,
      }));
      return <Hero slides={slides} />;
    }

    case "collections":
      return (
        <div className="py-12">
          <div className="max-w-6xl mx-auto px-4">
            {section.title && (
              <h2 className="text-3xl md:text-4xl font-black text-[#ed4e7e] uppercase italic tracking-tight mb-8">
                {section.title}
              </h2>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {section.blocks.map((block) => {
                const data = block.data || {};
                return (
                  <a
                    key={block._id}
                    href={data.link || '#'}
                    className="rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition"
                  >
                    <img
                      src={data.image}
                      alt={data.name || data.title || "Collection"}
                      className="w-full h-44 object-cover"
                    />
                    <div className="p-4 text-center">
                      <p className="text-sm font-semibold">{data.name}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      );

    case "featured_products":
      return (
        <div className="py-10">
          <div className="max-w-6xl mx-auto px-4">
            {section.title && (
              <h2 className="text-3xl md:text-4xl font-black text-[#ed4e7e] uppercase italic tracking-tight mb-8">
                {section.title}
              </h2>
            )}
            <CategorySlider />
          </div>
        </div>
      );

    case "promo_banner":
      return (
        <div className="py-10">
          <div className="max-w-6xl mx-auto px-4">
            {section.blocks.map((block) => {
              const data = block.data || {};
              return (
                <a key={block._id} href={data.link || '#'} className="block mb-6">
                  <img
                    src={data.image}
                    alt={data.altText || 'Promo'}
                    className="w-full h-auto rounded-xl shadow-sm"
                  />
                </a>
              );
            })}
          </div>
        </div>
      );

    default:
      return (
        <div className="py-12">
          <div className="max-w-6xl mx-auto px-4">
            {section.title && (
              <h2 className="text-3xl md:text-4xl font-black text-[#ed4e7e] uppercase italic tracking-tight mb-8">
                {section.title}
              </h2>
            )}
            <div className="grid gap-4">
              {section.blocks.map((block) => {
                const data = block.data || {};
                return (
                  <div key={block._id} className="bg-white p-6 rounded-xl shadow-sm border">
                    {(() => {
                      const desktopUrl =
                        data.desktopUrl || data.image || data.img || data.src;
                      const mobileUrl = data.mobileUrl;
                      const imageAlt =
                        data.altText || data.alt || data.title || "Block image";

                      if (!desktopUrl && !mobileUrl) return null;

                      return (
                        <picture>
                          {mobileUrl ? (
                            <source
                              srcSet={resolveImage(mobileUrl)}
                              media="(max-width: 767px)"
                            />
                          ) : null}
                          <img
                            src={resolveImage(desktopUrl || mobileUrl)}
                            alt={imageAlt}
                            className="w-full h-48 object-cover rounded-lg mb-4"
                          />
                        </picture>
                      );
                    })()}

                    {data.title && <h3 className="text-xl font-semibold mb-2">{data.title}</h3>}
                    {data.description && <p className="text-gray-600 mb-4">{data.description}</p>}
                    {data.link && (
                      <a
                        href={data.link}
                        className="btn-primary px-4 py-2 inline-block"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Learn More
                      </a>
                    )}
                    {!data.image && !data.title && !data.description && !data.link && (
                      <pre className="text-sm text-gray-500 bg-gray-50 p-4 rounded overflow-auto">
                        {JSON.stringify(data, null, 2)}
                      </pre>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
  }
}
