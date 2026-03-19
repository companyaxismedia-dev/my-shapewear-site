"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, MapPin, Phone, Clock, MessageSquare, Send } from "lucide-react";

export default function ContactUs() {
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");
    setTimeout(() => setStatus("Message sent successfully!"), 2000);
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <Navbar />

      <main className="section-padding">
        <div className="container-imkaa">
          <div className="section-heading-block">
            <h1 className="heading-section">Contact</h1>
            <p className="section-subtitle">
              We’re happy to help with orders, sizing, returns, and product questions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="card-imkaa" style={{ padding: 22, textAlign: "center" }}>
              <div className="mx-auto mb-10" style={{ width: 46, height: 46, borderRadius: 9999, background: "rgba(232,183,194,0.22)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)" }}>
                <Mail size={20} />
              </div>
              <h3 className="title-product" style={{ fontSize: 18, marginBottom: 6 }}>Email</h3>
              <a className="footer-link" href="mailto:support@imkaa.com">support@imkaa.com</a>
            </div>

            <div className="card-imkaa" style={{ padding: 22, textAlign: "center" }}>
              <div className="mx-auto mb-10" style={{ width: 46, height: 46, borderRadius: 9999, background: "rgba(232,183,194,0.22)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)" }}>
                <MessageSquare size={20} />
              </div>
              <h3 className="title-product" style={{ fontSize: 18, marginBottom: 6 }}>WhatsApp</h3>
              <a className="footer-link" href="https://wa.me/919811180043" target="_blank" rel="noreferrer">
                +91 9811 180 043
              </a>
            </div>

            <div className="card-imkaa" style={{ padding: 22, textAlign: "center" }}>
              <div className="mx-auto mb-10" style={{ width: 46, height: 46, borderRadius: 9999, background: "rgba(232,183,194,0.22)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)" }}>
                <Clock size={20} />
              </div>
              <h3 className="title-product" style={{ fontSize: 18, marginBottom: 6 }}>Support hours</h3>
              <p className="text-body" style={{ fontSize: 15, color: "var(--color-muted)" }}>Mon–Sun, 9:30 AM – 7:30 PM</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-6">
            <div className="card-imkaa" style={{ padding: 22 }}>
              <div className="flex items-center gap-3 mb-4" style={{ color: "var(--color-primary)" }}>
                <MapPin size={18} />
                <h3 className="title-product" style={{ fontSize: 18 }}>Registered Office</h3>
              </div>
              <p className="text-body">
                Shop No‑21, DDA CSC Market, Sector‑10, Dwarka,
                <br />
                New Delhi – 110075, India
              </p>
              <div className="mt-4 flex items-center gap-3" style={{ color: "var(--color-primary)" }}>
                <Phone size={18} />
                <a className="footer-link" href="tel:+919811180043">+91 9811 180 043</a>
              </div>
            </div>

            <div className="card-imkaa" style={{ padding: 22 }}>
              <div className="flex items-center gap-3 mb-4" style={{ color: "var(--color-primary)" }}>
                <Send size={18} />
                <h3 className="title-product" style={{ fontSize: 18 }}>Send a message</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <input type="text" placeholder="Your name" required className="input-imkaa" />
                <input type="email" placeholder="Email address" required className="input-imkaa" />
                <textarea placeholder="How can we help you?" rows={4} required className="input-imkaa" />
                <button type="submit" className="btn-primary-imkaa w-full">
                  Submit
                </button>
                {status ? (
                  <p className="text-muted-sm" style={{ fontSize: 14, color: "var(--color-muted)", textAlign: "center" }}>
                    {status}
                  </p>
                ) : null}
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

