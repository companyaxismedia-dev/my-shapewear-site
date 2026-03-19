"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MessageCircle, Package, CheckCircle2, ShieldCheck, RefreshCcw, CreditCard } from "lucide-react";

export default function HelpCenterPage() {
  const myWhatsApp = "919871147666";
  const openWhatsApp = (msg = "") => {
    const text = msg ? encodeURIComponent(msg) : encodeURIComponent("Hi, I need help with my IMKAA order.");
    window.open(`https://wa.me/${myWhatsApp}?text=${text}`, "_blank");
  };

  const categories = useMemo(
    () => [
      { id: "orders", title: "Orders & Delivery", icon: <Package size={18} /> },
      { id: "size", title: "Size & Fitting", icon: <CheckCircle2 size={18} /> },
      { id: "quality", title: "Fabric & Quality", icon: <ShieldCheck size={18} /> },
      { id: "returns", title: "Returns & Exchange", icon: <RefreshCcw size={18} /> },
      { id: "payments", title: "Payments & Safety", icon: <CreditCard size={18} /> },
    ],
    []
  );

  const faqs = useMemo(
    () => ({
      orders: [
        { q: "How long does delivery take?", a: "Most metro orders arrive in 2–4 business days. Other locations typically take 4–7 business days." },
        { q: "Can I track my order?", a: "Yes. Use the Track Order page to see the latest tracking updates once your order is dispatched." },
        { q: "Do you offer COD?", a: "Yes. COD is available on eligible pin codes. You’ll see the available options at checkout." },
        { q: "Will the packaging be discreet?", a: "Yes. We ship in discreet packaging that doesn’t reveal product details." },
      ],
      size: [
        { q: "How do I choose the right size?", a: "Use the product size chart and compare with your measurements. If you’re between sizes, we generally recommend sizing up for comfort." },
        { q: "Will it feel too tight?", a: "Shapewear offers gentle compression. It may feel snug at first, but should not feel restrictive." },
        { q: "What if I ordered the wrong size?", a: "You can request an exchange within 7 days of delivery if the item is unused, unwashed, and in original packaging." },
      ],
      quality: [
        { q: "Is the fabric breathable?", a: "Yes. We focus on soft, breathable materials designed for everyday wear." },
        { q: "How should I wash my product?", a: "We recommend gentle hand-wash in cold water and air-drying to preserve elasticity and fit." },
      ],
      returns: [
        { q: "What is your returns policy?", a: "Eligible items can be returned or exchanged within 7 days of delivery, unused and in original packaging with tags." },
        { q: "When will I receive my refund?", a: "After approval, refunds typically reflect in 5–7 business days depending on your bank/payment method." },
      ],
      payments: [
        { q: "Are online payments secure?", a: "Yes. Payments are processed through secure gateways. We do not store CVV or banking PIN." },
        { q: "A payment failed but money was deducted.", a: "Failed payments are usually auto‑reversed by your bank. If not reversed within 24 hours, contact support with your payment reference." },
      ],
    }),
    []
  );

  const [activeTab, setActiveTab] = useState(categories[0].id);
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <Navbar />

      <main className="py-[25px] md:py-[45px] bg-[var(--color-bg)]">
        <div className="container-imkaa">
          <div className="section-heading-block">
            <h1 className="heading-section">Help Centre</h1>
            <p className="section-subtitle">
              Quick answers, clear policies, and direct support when you need it.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 md:gap-8">
            <aside className="card-imkaa" style={{ padding: 18 }}>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: "Track Order", msg: "Hi, I want to track my order." },
                  { label: "Size Help", msg: "Hi, I need help choosing my size." },
                  { label: "Exchange", msg: "Hi, I want to exchange my product." },
                  { label: "Offers", msg: "Hi, please share current offers." },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className="btn-secondary-imkaa"
                    style={{ height: 44, justifyContent: "center" }}
                    onClick={() => openWhatsApp(item.msg)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <p className="text-muted-sm" style={{ fontSize: 13, marginBottom: 10 }}>
                Categories
              </p>
              <div className="grid grid-cols-1 gap-2">
                {categories.map((c) => {
                  const active = activeTab === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => { setActiveTab(c.id); setOpenFaq(0); }}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition"
                      style={{
                        border: `1px solid ${active ? "var(--color-accent)" : "var(--color-border)"}`,
                        background: active ? "rgba(232,183,194,0.18)" : "var(--color-card)",
                      }}
                    >
                      <span className="flex items-center gap-3" style={{ color: "var(--color-body)", fontWeight: 600, fontSize: 14 }}>
                        <span style={{ color: "var(--color-primary)" }}>{c.icon}</span>
                        {c.title}
                      </span>
                      <span className="text-muted-sm" style={{ fontSize: 13 }}>
                        {active ? "Selected" : "View"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>

            <section className="card-imkaa" style={{ padding: 22 }}>
              <h2 className="heading-section" style={{ textAlign: "left", fontSize: "clamp(24px, 2.6vw, 34px)" }}>
                {categories.find((c) => c.id === activeTab)?.title}
              </h2>
              <p className="text-body" style={{ fontSize: 15, color: "var(--color-muted)", marginTop: 8 }}>
                Tap a question to expand.
              </p>

              <div className="mt-6 divide-y" style={{ borderColor: "var(--color-border)" }}>
                {(faqs[activeTab] || []).map((item, idx) => {
                  const open = openFaq === idx;
                  return (
                    <div key={item.q} className="faq-accordion-item">
                      <button
                        type="button"
                        className="w-full flex items-center justify-between gap-4 py-5 text-left"
                        onClick={() => setOpenFaq(open ? -1 : idx)}
                      >
                        <span className="faq-accordion-question" style={{ padding: 0 }}>
                          {item.q}
                        </span>
                        <span className="text-muted-sm" style={{ fontSize: 13, fontWeight: 600, color: open ? "var(--color-primary)" : "var(--color-muted)" }}>
                          {open ? "Hide" : "View"}
                        </span>
                      </button>
                      {open ? (
                        <div className="faq-accordion-answer" style={{ paddingTop: 0 }}>
                          {item.a}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <div className="mt-10 card-imkaa" style={{ padding: 18, background: "var(--color-bg-alt)" }}>
                <h3 className="title-product" style={{ fontSize: 18, marginBottom: 6 }}>
                  Want direct support?
                </h3>
                <p className="text-body" style={{ marginBottom: 14 }}>
                  Chat with our team on WhatsApp for quick help.
                </p>
                <button type="button" className="btn-primary-imkaa w-fit" onClick={() => openWhatsApp()}>
                  <MessageCircle size={18} />
                  WhatsApp Support
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

