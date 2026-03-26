"use client";
import React from "react";
import Link from "next/link";
import {
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Phone,
  Mail,
  Truck,
  RotateCcw,
  Lock,
  ShieldCheck,
} from "lucide-react";

const INTER = "'Inter', sans-serif";
const PLAYFAIR = "'Playfair Display', serif";

export default function Footer() {

  const shopLinks = [
    { label: "Bras", link: "/bra" },
    { label: "Panties", link: "/panties" },
    { label: "Lingerie", link: "/lingerie" },
    { label: "Shapewear", link: "/shapewear" },
    { label: "Curvy Collection", link: "/curvy" },
    { label: "Tummy Control", link: "/tummy-control" },
    { label: "Sale", link: "/exclusive" },
  ];

  const supportLinks = [
    { label: "Track Your Order", link: "/order" },
    { label: "Shipping Policy", link: "/faq#shipping" },
    { label: "Returns & Exchange", link: "/faq#returns" },
    { label: "FAQs", link: "/faq" },
    { label: "Help Centre", link: "/help" },
    { label: "Contact Us", link: "/faq#contact-us" },
    { label: "Bra Size Calculator", link: "/bra-size-calculator" },
  ];

  const companyLinks = [
    { label: "About Us", link: "/about" },
    { label: "Privacy Policy", link: "/faq#terms-conditions" },
    { label: "Terms & Conditions", link: "/TermsAndConditions" },
    { label: "Sitemap", link: "/sitemap" },
  ];

  const socials = [
    { icon: <Facebook size={16} />, link: "https://facebook.com" },
    { icon: <Twitter size={16} />, link: "https://twitter.com" },
    { icon: <Youtube size={16} />, link: "https://youtube.com" },
    { icon: <Instagram size={16} />, link: "https://instagram.com" },
  ];

  return (
    <footer style={{
      background: '#FDF4F6',
      borderTop: '1px solid #EBCFD6',
      fontFamily: INTER,
    }}>

      {/* ── Trust Bar ── */}
      <div style={{ background: '#FCEFEA', borderBottom: '1px solid #EAD7DD' }}>
        <div className="max-w-[1280px] mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Truck size={22} />, title: "Free Shipping", desc: "On orders above ₹999" },
              { icon: <ShieldCheck size={22} />, title: "Discreet Packaging", desc: "100% private delivery" },
              { icon: <RotateCcw size={22} />, title: "Easy Returns", desc: "7-day no-question returns" },
              { icon: <Lock size={22} />, title: "Quick COD", desc: "Pay on delivery" },
            ].map((b) => (
              <div key={b.title} className="flex flex-col items-center text-center gap-2">
                <div style={{ color: '#C56F7F' }}>{b.icon}</div>
                <p style={{ fontFamily: INTER, fontWeight: 600, fontSize: '14px', color: '#5A3C46' }}>
                  {b.title}
                </p>
                <p style={{ fontFamily: INTER, fontSize: '13px', color: '#8C7480' }}>
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Footer ── */}
      <div className="max-w-[1280px] mx-auto px-6 py-14">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 md:gap-10">

          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2">
            <h3 style={{ fontFamily: PLAYFAIR, fontWeight: 700, fontSize: '28px', color: '#4A2E35', marginBottom: '10px' }}>
              IMKAA
            </h3>
            <p style={{ fontFamily: INTER, fontSize: '14px', color: '#A06C7B', lineHeight: '1.7', maxWidth: '280px', marginBottom: '20px' }}>
              Curated comfort, confidence, and everyday elegance — designed for the modern woman.
            </p>

            {/* Newsletter */}
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontFamily: INTER, fontWeight: 600, fontSize: '13px', color: '#8E4F61', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                Stay in Touch
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  style={{
                    background: '#FFF9FA',
                    border: '1px solid #E7CCD3',
                    borderRadius: '9999px',
                    padding: '10px 16px',
                    fontSize: '13px',
                    color: '#6F5560',
                    outline: 'none',
                    flex: 1,
                    fontFamily: INTER,
                  }}
                />
                <button
                  className="w-full sm:w-auto"
                  style={{
                    background: '#C56F7F',
                    color: '#FFF9FA',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '10px 18px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: INTER,
                    whiteSpace: 'nowrap',
                  }}
                >                  Subscribe
                </button>
              </div>
            </div>

            {/* Socials */}
            <div className="flex gap-3">
              {socials.map((s, i) => (
                <a key={i} href={s.link} target="_blank" rel="noreferrer"
                  style={{
                    width: 36, height: 36,
                    background: '#FFF4F6',
                    border: '1px solid #EAD7DD',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#C56F7F',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#C56F7F'; e.currentTarget.style.color = '#FFF9FA'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#FFF4F6'; e.currentTarget.style.color = '#C56F7F'; }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Shop Column */}
          <div className="min-w-0">
            <h4 style={{ fontFamily: INTER, fontWeight: 600, fontSize: '13px', color: '#8E4F61', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px', wordBreak: 'break-word', }}>
              Shop
            </h4>
            <ul className="space-y-2">
              {shopLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.link}
                    style={{ fontFamily: INTER, fontSize: '14px', color: '#A06C7B', display: 'block', lineHeight: 1.8, textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#C56F7F'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#A06C7B'}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div className="min-w-0">
            <h4 style={{ fontFamily: INTER, fontWeight: 600, fontSize: '13px', color: '#8E4F61', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
              Support
            </h4>
            <ul className="space-y-2">
              {supportLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.link}
                    style={{ fontFamily: INTER, fontSize: '14px', color: '#A06C7B', display: 'block', lineHeight: 1.8, textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#C56F7F'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#A06C7B'}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company + Contact Column */}
          {/* Company Column */}
          <div className="min-w-0">
            <h4 style={{ fontFamily: INTER, fontWeight: 600, fontSize: '13px', color: '#8E4F61', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
              Company
            </h4>
            <ul className="space-y-2">
              {companyLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.link}
                    style={{ fontFamily: INTER, fontSize: '14px', color: '#A06C7B', display: 'block', lineHeight: 1.8, textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#C56F7F'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#A06C7B'}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="min-w-0">
            <h4 style={{ fontFamily: INTER, fontWeight: 600, fontSize: '13px', color: '#8E4F61', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
              Contact
            </h4>
            <div className="space-y-2">
              <a
                href="tel:+919811180043"
                className="flex items-center gap-2"
                style={{ fontFamily: INTER, fontSize: '13px', color: '#A06C7B', textDecoration: 'none' }}
              >
                <Phone size={13} style={{ color: '#C56F7F', flexShrink: 0 }} />
                +91 9811 180 043
              </a>
              <a
                href="mailto:support@imkaa.com"
                className="flex items-center gap-2"
                style={{ fontFamily: INTER, fontSize: '13px', color: '#A06C7B', textDecoration: 'none' }}
              >
                <Mail size={13} style={{ color: '#C56F7F', flexShrink: 0 }} />
                support@imkaa.com
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div style={{ borderTop: '1px solid #E8D6DB' }}>
        <div className="max-w-[1280px] mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <p style={{ fontFamily: INTER, fontSize: '13px', color: '#A06C7B' }}>
            © {new Date().getFullYear()} IMKAA. All rights reserved. Made with ♥ in India.
          </p>
          <div className="flex items-center gap-1" style={{ fontSize: '12px', color: '#A06C7B', fontFamily: INTER }}>
            <span>Janak Puri, New Delhi – 110075</span>
          </div>
          <div className="flex gap-4">
            {[
              { label: "Privacy", href: "/faq#terms-conditions" },
              { label: "Terms", href: "/TermsAndConditions" },
              { label: "Returns", href: "/faq#returns" },
            ].map((l) => (
              <Link key={l.label} href={l.href}
                style={{ fontFamily: INTER, fontSize: '13px', color: '#A06C7B', textDecoration: 'none' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#C56F7F'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#A06C7B'}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
}
