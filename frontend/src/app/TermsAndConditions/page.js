"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SECTIONS = [
  {
    id: "user-agreement",
    title: "User Agreement",
    content:
      "By accessing or using IMKAA, you agree to follow these terms. Please use the website for lawful purposes only and provide accurate information during checkout and account creation.",
  },
  {
    id: "orders-pricing",
    title: "Orders, Pricing & Payments",
    content:
      "Prices and offers may change without notice. Orders are confirmed only after successful payment (or COD confirmation where available). We reserve the right to cancel orders in cases of suspected fraud, incorrect pricing, or stock unavailability, with a full refund where applicable.",
  },
  {
    id: "shipping-delivery",
    title: "Shipping & Delivery",
    content:
      "Delivery timelines are estimates and may vary by location and demand periods. We use discreet packaging and share tracking details once the order is dispatched.",
  },
  {
    id: "returns-refunds",
    title: "Returns, Exchange & Refunds",
    content:
      "Eligible items may be returned or exchanged within 7 days of delivery, provided they are unused, unwashed, and in original packaging with tags intact. Approved refunds are processed back to the original payment method as per bank timelines.",
  },
  {
    id: "privacy",
    title: "Privacy & Security",
    content:
      "We respect your privacy. We never ask for your password, OTP, CVV, or banking PIN. Please reach out through official support channels if you receive any suspicious communication.",
  },
  {
    id: "contact",
    title: "Contact",
    content:
      "For support, please email support@imkaa.com or call +91 9811 180 043 (Mon–Sun, 9:30 AM to 7:30 PM).",
  },
];

export default function TermsAndConditionsPage() {
  const [openId, setOpenId] = useState(SECTIONS[0].id);

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <Navbar />

      <main className="section-padding">
        <div className="container-imkaa">
          <div className="section-heading-block">
            <h1 className="heading-section">Terms & Conditions</h1>
            <p className="section-subtitle">
              Clear, simple guidelines for shopping with IMKAA.
            </p>
          </div>

          <div className="card-imkaa" style={{ padding: 22 }}>
            <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
              {SECTIONS.map((s) => {
                const isOpen = openId === s.id;
                return (
                  <div key={s.id} className="faq-accordion-item">
                    <button
                      type="button"
                      className="w-full flex items-center justify-between gap-4 py-5 text-left"
                      onClick={() => setOpenId(isOpen ? null : s.id)}
                    >
                      <span className="faq-accordion-question" style={{ padding: 0 }}>
                        {s.title}
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
                      <div className="faq-accordion-answer" style={{ paddingTop: 0 }}>
                        {s.content}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

