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
  Heart
} from "lucide-react";

export default function Footer() {

  const productColumns = [


    {
      title: "BRAS",
      url: "/bra",
      links: [
        "Backless Bra",
        "Bralette",
        "Bridal Bra",
        "Cotton Bra",
        "Full Coverage Bra",
        "Padded Bra",
        "Push Up Bra",
        "Strapless Bra",
        "T-shirt Bra",
        "Underwire"
      ]

    },
    {
      title: "PANTIES",
      url: "/panties",
      links: [
        "Bikini Panties",
        "Boy Shorts",
        "Bra Panty Set",
        "Cotton Panties",
        "Hipster",
        "Sexy Panties",
        "Thong"
      ]
    },
    {
      title: "NIGHTWEAR",
      url: "/lingerie",
      links: [
        "Babydoll",
        "Bridal Nightwear",
        "Camisole",
        "Cotton Nightwear",
        "Night Suit",
        "Night Dress",
        "Pajamas",
        "Sexy Nightwear",
        "Tank Top"
      ]
    },
    {
      title: "ACTIVEWEAR",
      url: "/shapewear",
      links: [
        "Active Shorts",
        "Sports Bra",
        "Sports Tshirts",
        "Tights",
        "Gym Wear",
        "Yoga Dress"
      ]

    }
  ];

  const quickLinks = [
    { label: "Magazine", link: "/magazine" },
    { label: "Bra Size Calculator", link: "/bra-size-calculator" },
    { label: "Shop By Sizes", link: "/shop-by-sizes" },
    { label: "Shop By Colors", link: "/shop-by-colors" },
    { label: "Period Tracker", link: "/period-tracker" },
    { label: "Save For Later", link: "/wishlist" },
    { label: "Become an Affiliate", link: "/affiliate" },
    { label: "Sales and Service", link: "/support" }
  ];

  const policyLinks = [
    { label: "About Us", link: "/about" },
    { label: "Contact Us", link: "/faq#contact-us" },
    { label: "Shipping Policy", link: "/faq#shipping" },
    { label: "Privacy Policy", link: "/faq#terms-conditions" },
    { label: "Terms & Conditions", link: "/TermsAndConditions" },
    { label: "Return & Exchange Policy", link: "/faq#returns" },
    { label: "Track your order", link: "/order" },
    { label: "Sitemap", link: "/sitemap" },
    { label: "FAQs", link: "/faq" }

  ]

  const features = [
    { icon: <Truck size={28} />, title: "FREE SHIPPING", desc: "On orders above ₹999" },
    { icon: <ShieldCheck size={28} />, title: "100% PRIVACY", desc: "Discreet Packaging" },
    { icon: <RotateCcw size={28} />, title: "EASY RETURNS", desc: "7 Days No Question" },
    { icon: <Lock size={28} />, title: "QUICK COD", desc: "Pay on delivery" }
  ]

  return (

    <footer className="bg-[#fafafa] pt-16 text-gray-700">

      <div className="max-w-7xl mx-auto px-6">

        {/* PRODUCT LINKS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 border-b pb-12">

          {productColumns.map((col) => (
            <div key={col.title}>
              <h4 className="text-pink-600 font-bold mb-4 tracking-widest text-sm">
                {col.title}
              </h4>

              <ul className="space-y-2 text-sm">
                {col.links.map((l) => (
                  <li key={l}>
                    <Link
                      href={col.url}
                      className="hover:text-pink-600 cursor-pointer"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* QUICK LINKS */}
          <div>
            <h4 className="text-pink-600 font-bold mb-4 tracking-widest text-sm">
              QUICK LINKS
            </h4>

            <ul className="space-y-2 text-sm">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.link}
                    className="hover:text-pink-600 cursor-pointer"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* POLICY */}
          <div>
            <h4 className="text-pink-600 font-bold mb-4 tracking-widest text-sm">
              HELP
            </h4>

            <ul className="space-y-2 text-sm">
              {policyLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.link}
                    className="hover:text-pink-600 cursor-pointer"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* NEWSLETTER */}
          <div className="col-span-2">

            <h4 className="text-pink-600 font-bold mb-4 tracking-widest text-sm">
              STAY IN TOUCH
            </h4>

            <input
              placeholder="Email"
              className="w-full border p-3 rounded mb-3"
            />

            <button className="w-full bg-pink-500 text-white py-3 rounded font-semibold">
              SUBSCRIBE →
            </button>

            {/* SOCIAL */}
            <div className="flex gap-3 mt-4">

              {[
                { icon: <Facebook size={18} />, link: "https://facebook.com" },
                { icon: <Twitter size={18} />, link: "https://twitter.com" },
                { icon: <Youtube size={18} />, link: "https://youtube.com" },
                { icon: <Instagram size={18} />, link: "https://instagram.com" }
              ].map((item, i) => (
                <a
                  key={i}
                  href={item.link}
                  target="_blank"
                  className="w-9 h-9 flex items-center justify-center bg-gray-200 rounded-full hover:bg-pink-500 hover:text-white cursor-pointer"
                >
                  {item.icon}
                </a>
              ))}

            </div>

          </div>

        </div>




        {/* BUSINESS INFO */}
        <div className="grid md:grid-cols-2 gap-12 py-12">

          <div>

            <p className="text-pink-600 font-bold mb-2">
              REGISTERED BUSINESS INFORMATION
            </p>

            <h3 className="text-2xl font-bold">
              IMKAA
            </h3>

            <p className="text-sm mt-2">
              Jaina-2 distics center, janak puri, New Delhi - 110075, India
            </p>

          </div>

          <div className="space-y-4">

            <div className="flex items-center gap-3">
              <Phone size={18} className="text-pink-500" />
              +91 9811180043
            </div>

            <div className="flex items-center gap-3">
              <Mail size={18} className="text-pink-500" />
              inboxdwarka@gmail.com
            </div>

          </div>

        </div>

        {/* COPYRIGHT */}
        <div className="text-center border-t pt-6 pb-8">

          <p className="text-pink-500 tracking-[4px] text-xs mb-2">
            CONFIDENCE AUR COMFORT KA NAYA NAAM
          </p>

          <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
            © 2026 IMKAA | Made with <Heart size={12} className="text-pink-500 fill-pink-500" /> in Bharat
          </p>

        </div>

      </div>

    </footer>

  )
}