import React from "react";
import TrackOrder from "./TrackWrapper";

export const metadata = {
  title: "Track Your Order | IMKAA Order Tracking",

  description:
    "Track your IMKAA order in real time. Enter your order details to check shipping status, delivery updates, and estimated arrival for your ethnic wear purchase.",

  keywords: [
    "track order",
    "order tracking",
    "IMKAA order tracking",
    "track shipment",
    "delivery status",
    "courier tracking",
    "track parcel",
    "online order status",
    "ethnic wear order tracking",
    "designer suit delivery",
    "shipping updates",
    "track my order",
  ],

  alternates: {
    canonical: "https://www.imkaa.com/track",
  },

  openGraph: {
    title: "Track Your Order | IMKAA",
    description:
      "Track your IMKAA order with real-time shipping and delivery updates.",
    url: "https://www.imkaa.com/track",
    siteName: "IMKAA",
    type: "website",
    locale: "en_IN",
  },

  twitter: {
    card: "summary_large_image",
    title: "Track Your Order | IMKAA",
    description:
      "Check your IMKAA order status, shipping progress, and estimated delivery date.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

const Page = () => {
  return <TrackOrder />;
};

export default Page;