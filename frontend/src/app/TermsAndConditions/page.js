import React from "react";
import TermsAndConditionsPage from "./Wrapper";

export const metadata = {
  title: "Terms & Conditions | IMKAA",

  description:
    "Read IMKAA's Terms & Conditions for using our website, placing orders, payments, shipping, returns, refunds, intellectual property, and customer responsibilities.",

  keywords: [
    "IMKAA terms and conditions",
    "terms of service",
    "website terms",
    "online shopping terms",
    "customer agreement",
    "shipping terms",
    "returns policy",
    "refund policy",
    "payment terms",
    "legal information",
  ],

  alternates: {
    canonical: "https://www.imkaa.com/TermsAndConditions",
  },

  openGraph: {
    title: "Terms & Conditions | IMKAA",
    description:
      "Review IMKAA's Terms & Conditions for website usage, orders, payments, shipping, returns, and customer responsibilities.",
    url: "https://www.imkaa.com/terms-and-conditions",
    siteName: "IMKAA",
    type: "website",
    locale: "en_IN",
  },

  twitter: {
    card: "summary_large_image",
    title: "Terms & Conditions | IMKAA",
    description:
      "Read IMKAA's Terms & Conditions for shopping, payments, shipping, returns, and website usage.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

const Page = () => {
  return <TermsAndConditionsPage />;
};

export default Page;