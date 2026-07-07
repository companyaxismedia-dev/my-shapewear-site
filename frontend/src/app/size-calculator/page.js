import React from 'react'
import SizeCalculator from './SizeCalculatorWrapper'

export const metadata = {
  title: "Women's Size Calculator | Find Your Perfect Ethnic Wear Size | IMKAA",

  description:
    "Use IMKAA's Women's Size Calculator to find your perfect kurti, suit, salwar suit, and ethnic wear size. Get accurate measurements for a comfortable and elegant fit.",

  keywords: [
    "size calculator",
    "women size calculator",
    "ethnic wear size guide",
    "kurti size chart",
    "salwar suit size chart",
    "dress size calculator",
    "women clothing size",
    "IMKAA size calculator",
    "designer suit size guide",
    "ladies size chart",
    "online size calculator",
    "perfect fit ethnic wear",
  ],

  alternates: {
    canonical: "https://www.imkaa.com/size-calculator",
  },

  openGraph: {
    title: "Women's Size Calculator",
    description:
      "Find your perfect ethnic wear size with IMKAA's Size Calculator. Measure accurately before shopping for kurtis, suits, and festive wear.",
    url: "https://www.imkaa.com/size-calculator",
    siteName: "IMKAA",
    type: "website",
    images: [
      {
        url: "https://www.imkaa.com/og-image.jpg", // Replace with your OG image
        width: 1200,
        height: 630,
        alt: "IMKAA Size Calculator",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Women's Size Calculator | IMKAA",
    description:
      "Find your perfect kurti and ethnic wear size with IMKAA's online size calculator.",
    images: ["https://www.imkaa.com/og-image.jpg"], // Replace with your OG image
  },

  robots: {
    index: true,
    follow: true,
  },
};


const page = () => {
  return (
    <SizeCalculator />
  )
}

export default page