import React from "react";
import AboutClientWrapper from "./AboutClientWrapper";

export const metadata = {
  title: "About Imkaa | Premium Ethnic Wear for Women",
  description:
    "Learn about Imkaa, a premium ethnic fashion brand offering elegant sarees, salwar suits, kurtis, lehengas, co-ord sets, and handcrafted women's apparel designed with timeless craftsmanship and modern style.",
  keywords: [
    "Imkaa",
    "About Imkaa",
    "Women's Ethnic Wear",
    "Indian Fashion",
    "Designer Sarees",
    "Salwar Suits",
    "Kurtis",
    "Lehengas",
    "Co-ord Sets",
    "Ethnic Clothing",
    "Traditional Wear",
    "Indian Women's Fashion",
  ],
  alternates: {
    canonical: "https://imkaa.in/about",
  },
  openGraph: {
    title: "About Imkaa | Premium Ethnic Wear for Women",
    description:
      "Discover the story behind Imkaa and our passion for creating elegant, premium ethnic wear for women with exceptional craftsmanship and timeless designs.",
    url: "https://imkaa.in/about",
    siteName: "Imkaa",
    images: [
      {
        url: "https://imkaa.in/og-image.jpg", // Replace with your actual OG image
        width: 1200,
        height: 630,
        alt: "About Imkaa",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Imkaa | Premium Ethnic Wear for Women",
    description:
      "Discover Imkaa's journey, values, and commitment to premium ethnic fashion for women.",
    images: ["https://imkaa.in/og-image.jpg"], // Replace with your actual image
  },
  robots: {
    index: true,
    follow: true,
  },
};

const Page = () => {
  return <AboutClientWrapper />;
};

export default Page;