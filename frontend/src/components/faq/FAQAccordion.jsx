"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Mail } from "lucide-react";

export default function FAQAccordion({
  items = [],
  title,
  description,
  actionButton,
  showContactSection = true,
}) {
  const [openId, setOpenId] = useState(items?.[0]?.id || null);

  const safeItems = useMemo(
    () => (Array.isArray(items) ? items.filter(Boolean) : []),
    [items]
  );

  return (
    <div className="w-full">

      {title && (
        <div className="mb-10 pb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4" style={{ borderBottom: "1px solid var(--color-border)" }}>

          <div>
            <h2 className="heading-section" style={{ textAlign: "left", fontSize: "clamp(24px, 2.6vw, 34px)" }}>
              {title}
            </h2>

            {description && (
              <p className="text-body" style={{ fontSize: 15, color: "var(--color-muted)" }}>
                {description}
              </p>
            )}
          </div>

          {actionButton && (
            <Link
              href={actionButton.link}
              className="btn-secondary-imkaa w-fit"
            >
              {actionButton.text}
            </Link>
          )}

        </div>
      )}

      <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
        {safeItems.map((item) => {
          const isOpen = openId === item.id;
          return (
            <div key={item.id} className="faq-accordion-item">
              <button
                type="button"
                className="w-full flex items-center justify-between gap-4 py-5 text-left"
                onClick={() => setOpenId(isOpen ? null : item.id)}
              >
                <span className="faq-accordion-question" style={{ padding: 0 }}>
                  {item.question}
                </span>
                <span
                  className="text-muted-sm"
                  style={{
                    fontSize: 13,
                    color: isOpen ? "var(--color-primary)" : "var(--color-muted)",
                    fontWeight: 600,
                  }}
                >
                  {isOpen ? "Hide" : "View"}
                </span>
              </button>

              {isOpen ? (
                <div className="faq-accordion-answer whitespace-pre-line" style={{ paddingTop: 0 }}>
                  {item.answer}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {showContactSection && (
        <div className="mt-12 pt-8" style={{ borderTop: "1px solid var(--color-border)" }}>
          <div className="card-imkaa" style={{ padding: 24, background: "var(--color-bg-alt)" }}>
            <h3 className="title-product" style={{ fontSize: 18, marginBottom: 6 }}>
              Still need help?
            </h3>
            <p className="text-body" style={{ marginBottom: 16 }}>
              If you can’t find what you’re looking for, our support team is happy to help.
            </p>

            <Link href="/contact" className="btn-primary-imkaa w-fit">
              <Mail className="w-4 h-4" />
              Contact Us
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}