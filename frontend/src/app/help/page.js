import React from "react";
import HelpCenterPage from "./HelpWrapper";

export const metadata = {
  title: "Help Center | Customer Support & FAQs | IMKAA",

  description:
    "Need assistance? Visit the IMKAA Help Center for answers to frequently asked questions, order tracking, shipping information, returns, refunds, size guidance, and customer support.",

  keywords: [
    "IMKAA help",
    "help center",
    "customer support",
    "order tracking",
    "shipping information",
    "returns and refunds",
    "exchange policy",
    "size guide",
    "payment support",
    "FAQs",
    "ethnic wear support",
    "contact IMKAA",
  ],

  alternates: {
    canonical: "https://www.imkaa.com/help",
  },

  openGraph: {
    title: "Help Center | IMKAA Customer Support",
    description:
      "Get help with your orders, shipping, returns, payments, and more. Find answers to common questions in the IMKAA Help Center.",
    url: "https://www.imkaa.com/help",
    siteName: "IMKAA",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Help Center | IMKAA",
    description:
      "Find answers to FAQs, order tracking, returns, shipping, payments, and customer support.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

const Page = () => {
  return <HelpCenterPage />;
};

export default Page;