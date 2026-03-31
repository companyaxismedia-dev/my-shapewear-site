"use client";

import Hero from "@/components/Hero";
import CategorySlider from "@/components/CategorySlider";
import { API_BASE } from "@/lib/api";

export default function SectionRenderer({ section, compact = false }) {
  if (!section || !section.blocks || section.blocks.length === 0) return null;

  const getSectionSubtitle = (title = "") => {
    const t = String(title).toLowerCase().trim();
    if (!t) return "";
    const presets = [
      { match: "shop by category", subtitle: "Find your perfect fit, thoughtfully curated for you." },
      { match: "our exclusive collections", subtitle: "Curated for comfort, confidence, and everyday elegance." },
      { match: "trending bras", subtitle: "Bestselling silhouettes and fresh new favorites." },
      { match: "best sellers", subtitle: "Loved by customers for fit, feel, and finish." },
      { match: "why choose us", subtitle: "Premium quality, privacy, and service you can trust." },
    ];
    const preset = presets.find((p) => t.includes(p.match));
    // return preset?.subtitle || "Curated pieces designed for comfort and confidence.";
    return preset?.subtitle || "";
  };


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
            className="block w-full h-full object-cover"
            loading="lazy"
          />
        ) : null}
      </picture>
    );
  };

  const SectionHeading = ({ title }) => {
    if (!title) return null;
    return (
      <div className="section-heading-block">
        <h2 className="heading-section">{title}</h2>
        <p className="section-subtitle">{getSectionSubtitle(title)}</p>
      </div>
    );
  };

  const wrapClassName = compact ? "py-6 md:py-10" : "section-padding";

  // COLUMNS LAYOUT (flexible rows × columns - replaces grid)
  if (section.layoutType === "columns") {
    const cols = Math.max(1, Number(section.columns) || 3);
    const rows = Math.max(1, Number(section.rows) || 1);
    const itemsToShow = cols * rows;
    const itemsToDisplay = section.blocks.slice(0, itemsToShow);
    const effectiveCols = Math.min(cols, Math.max(1, itemsToDisplay.length));

    return (
      <section className={wrapClassName}>
        <div className={compact ? "" : "container-imkaa"}>
          <SectionHeading title={section.title} />
          <div className={getGridClasses(effectiveCols)}>
            {itemsToDisplay.map((block) => {
              const data = block.data || {};
              const hasLink = data.link && data.link.trim();
              const handleClick = (e) => {
                if (!hasLink) e.preventDefault();
              };
              const linkProps = hasLink ? { target: "_blank", rel: "noreferrer" } : { onClick: handleClick };
              return (
                <a
                  key={block._id}
                  href={hasLink ? data.link : "#"}
                  className={`block card-imkaa ${hasLink ? "cursor-pointer" : "cursor-default"}`}
                  {...linkProps}
                >
                  <div className="overflow-hidden" style={{ background: "var(--color-bg-alt)" }}>
                    {renderBlockContent(block)}
                  </div>
                  {data.title && (
                    <div className="p-4 text-center">
                      <p className="title-product">
                        {data.title}
                      </p>
                    </div>
                  )}
                </a>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // THREE PER ROW LAYOUT (responsive: 1 on mobile, 2 on tablet, 3 on desktop)
  if (section.layoutType === "three_per_row") {
    const itemsToDisplay = section.blocks.slice(0, 9); // Max 9 for 3 rows

    return (
      <section className={wrapClassName}>
        <div className={compact ? "" : "container-imkaa"}>
          <SectionHeading title={section.title} />
          <div className="mobile-banner-strip md:hidden">
            {itemsToDisplay.map((block) => {
              const data = block.data || {};
              const hasLink = data.link && data.link.trim();
              const handleClick = (e) => {
                if (!hasLink) e.preventDefault();
              };
              const linkProps = hasLink ? { target: "_blank", rel: "noreferrer" } : { onClick: handleClick };

              return (
                <a
                  key={block._id}
                  href={hasLink ? data.link : "#"}
                  className={`mobile-banner-slide card-imkaa banner-block-card ${hasLink ? "cursor-pointer" : "cursor-default"}`}
                  {...linkProps}
                >
                  <div className="overflow-hidden" style={{ background: "var(--color-bg-alt)" }}>
                    {renderBlockContent(block)}
                  </div>
                  {data.title && (
                    <div className="p-4 text-center">
                      <p className="title-product">
                        {data.title}
                      </p>
                    </div>
                  )}
                </a>
              );
            })}
          </div>

          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {itemsToDisplay.map((block) => {
              const data = block.data || {};
              const hasLink = data.link && data.link.trim();
              const handleClick = (e) => {
                if (!hasLink) e.preventDefault();
              };
              const linkProps = hasLink ? { target: "_blank", rel: "noreferrer" } : { onClick: handleClick };
              return (
                <a
                  key={block._id}
                  href={hasLink ? data.link : "#"}
                  className={`block card-imkaa banner-block-card ${hasLink ? "cursor-pointer" : "cursor-default"}`}
                  {...linkProps}
                >
                  <div className="overflow-hidden" style={{ background: "var(--color-bg-alt)" }}>
                    {renderBlockContent(block)}
                  </div>
                  {data.title && (
                    <div className="p-4 text-center">
                      <p className="title-product">
                        {data.title}
                      </p>
                    </div>
                  )}
                </a>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // TWO PER ROW LAYOUT (responsive: 1 on mobile, 2 on tablet+)
  if (section.layoutType === "two_per_row") {
    const itemsToDisplay = section.blocks.slice(0, 8); // Max 8 for 4 rows

    return (
      <section className={wrapClassName}>
        <div className={compact ? "" : "container-imkaa"}>
          <SectionHeading title={section.title} />
          <div className="grid grid-cols-2 gap-3 md:gap-6">
            {itemsToDisplay.map((block) => {
              const data = block.data || {};
              const hasLink = data.link && data.link.trim();
              const handleClick = (e) => {
                if (!hasLink) e.preventDefault();
              };
              const linkProps = hasLink ? { target: "_blank", rel: "noreferrer" } : { onClick: handleClick };
              return (
                <a
                  key={block._id}
                  href={hasLink ? data.link : "#"}
                  className={`block card-imkaa banner-block-card ${hasLink ? "cursor-pointer" : "cursor-default"}`}
                  {...linkProps}
                >
                  <div className="overflow-hidden" style={{ background: "var(--color-bg-alt)" }}>
                    {renderBlockContent(block)}
                  </div>
                  {data.title && (
                    <div className="p-4 text-center">
                      <p className="title-product">
                        {data.title}
                      </p>
                    </div>
                  )}
                </a>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // SHORT BANNER LAYOUT (for section headings - full width, short height)
  if (section.layoutType === "short_banner") {
    const itemsToDisplay = section.blocks.slice(0, 1); // Usually 1 banner

    return (
      <section style={{ paddingTop: compact ? 14 : 20, paddingBottom: compact ? 14 : 20 }}>
        <div className={compact ? "" : "container-imkaa"}>
          {itemsToDisplay.map((block) => {
            const data = block.data || {};
            const desktopUrl = data.desktopUrl || data.image || data.img || data.src;
            const mobileUrl = data.mobileUrl;
            const hasLink = data.link && data.link.trim();
            const handleClick = (e) => {
              if (!hasLink) e.preventDefault();
            };
            const linkProps = hasLink ? { target: "_blank", rel: "noreferrer" } : { onClick: handleClick };

            return (
                <a
                  key={block._id}
                  href={hasLink ? data.link : "#"}
                  className={`block w-full card-imkaa banner-block-card ${hasLink ? "cursor-pointer" : "cursor-default"}`}
                  {...linkProps}
                >
                <div className="w-full" style={{ background: "var(--color-bg-alt)" }}>
                  <picture>
                    {mobileUrl ? (
                      <source srcSet={resolveImage(mobileUrl)} media="(max-width: 767px)" />
                    ) : null}
                    {desktopUrl ? (
                      <img
                        src={resolveImage(desktopUrl)}
                        alt={data.altText || "Short Banner"}
                        className="w-full h-auto object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-64 flex items-center justify-center" style={{ color: "var(--color-muted)" }}>
                        No image
                      </div>
                    )}
                  </picture>
                </div>
              </a>
            );
          })}
        </div>
      </section>
    );
  }

  // BANNER LAYOUT (full-width banners stacked vertically)
  if (section.layoutType === "banner") {
    const cols = Math.max(1, Number(section.columns) || 1);
    const rows = Math.max(1, Number(section.rows) || 1);
    const itemsToShow = cols * rows;
    const itemsToDisplay = section.blocks.slice(0, itemsToShow);

    return (
      <section style={{ paddingTop: compact ? 14 : 20, paddingBottom: compact ? 14 : 20 }}>
        <div className="full-banner-bleed">
          <div className="space-y-4">
            {itemsToDisplay.map((block) => {
              const data = block.data || {};
              const desktopUrl = data.desktopUrl || data.image || data.img || data.src;
              const mobileUrl = data.mobileUrl;
              const hasLink = data.link && data.link.trim();
              const handleClick = (e) => {
                if (!hasLink) e.preventDefault();
              };
              const linkProps = hasLink ? { target: "_blank", rel: "noreferrer" } : { onClick: handleClick };

              return (
                <a
                  key={block._id}
                  href={hasLink ? data.link : "#"}
                  className={`block w-full card-imkaa banner-block-card full-banner-card ${hasLink ? "cursor-pointer" : "cursor-default"}`}
                  {...linkProps}
                >
                  <div className="w-full" style={{ background: "var(--color-bg-alt)" }}>
                    <picture>
                      {mobileUrl ? (
                        <source srcSet={resolveImage(mobileUrl)} media="(max-width: 767px)" />
                      ) : null}
                      {desktopUrl ? (
                        <img
                          src={resolveImage(desktopUrl)}
                          alt={data.altText || "Banner"}
                          className="w-full h-auto object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-64 flex items-center justify-center" style={{ color: "var(--color-muted)" }}>
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
      </section>
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
        <section className={wrapClassName}>
          <div className={compact ? "" : "container-imkaa"}>
            <SectionHeading title={section.title} />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
              {section.blocks.map((block) => {
                const data = block.data || {};
                return (
                  <a
                    key={block._id}
                    href={data.link || '#'}
                    className="card-imkaa"
                  >
                    <img
                      src={data.image}
                      alt={data.name || data.title || "Collection"}
                      className="w-full h-44 object-cover"
                    />
                    <div className="p-4 text-center">
                      <p className="title-product">{data.name}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      );

    case "featured_products":
      return (
        <section className={wrapClassName}>
          <div className={compact ? "" : "container-imkaa"}>
            <SectionHeading title={section.title} />
            <CategorySlider />
          </div>
        </section>
      );

    case "promo_banner":
      return (
        <section className={wrapClassName}>
          <div className={compact ? "" : "container-imkaa"}>
            {section.blocks.map((block) => {
              const data = block.data || {};
              return (
                <a key={block._id} href={data.link || '#'} className="block mb-6">
                  <img
                    src={data.image}
                    alt={data.altText || 'Promo'}
                    className="w-full h-auto card-imkaa"
                  />
                </a>
              );
            })}
          </div>
        </section>
      );

    default:
      return (
        <section className={wrapClassName}>
          <div className={compact ? "" : "container-imkaa"}>
            <SectionHeading title={section.title} />
            <div className="grid gap-4 md:gap-6">
              {section.blocks.map((block) => {
                const data = block.data || {};
                return (
                  <div key={block._id} className="card-imkaa" style={{ padding: 22 }}>
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
                            className="w-full h-48 object-cover mb-4"
                            style={{ borderRadius: 18, border: "1px solid var(--color-border)" }}
                          />
                        </picture>
                      );
                    })()}

                    {data.title && <h3 className="title-product" style={{ fontSize: 18, marginBottom: 8 }}>{data.title}</h3>}
                    {data.description && <p className="text-body" style={{ marginBottom: 14 }}>{data.description}</p>}
                    {data.link && (
                      <a
                        href={data.link}
                        className="btn-secondary-imkaa inline-flex"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Discover More
                      </a>
                    )}
                    {!data.image && !data.title && !data.description && !data.link && (
                      <pre className="text-sm p-4 overflow-auto" style={{ color: "var(--color-muted)", background: "var(--color-bg-alt)", borderRadius: 16, border: "1px solid var(--color-border)" }}>
                        {JSON.stringify(data, null, 2)}
                      </pre>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      );
  }
}
