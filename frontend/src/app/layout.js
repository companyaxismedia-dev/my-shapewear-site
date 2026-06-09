import "./globals.css";
import { Suspense } from "react";
import { AuthTransitionOverlay, ToasterProvider } from "@/components/Providers";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { OrderProvider } from "@/context/OrderContext";
import { ChatProvider } from "@/context/ChatContext";
import RouteProgressBar from "@/components/loaders/RouteProgressBar";

export const metadata = {
  title: {
    default: "Ladies Ethnic Wear Dwarka Delhi | Kurtis, Suits & Coord Sets",
    template: "%s | Imkaa",
  },
  description:
    "Shop stylish ethnic wear in Dwarka Sector 7, New Delhi. Explore short kurtis, long kurtis, three piece suits, two piece suits, party wear suits and coord sets.",

  keywords: [
    "ethnic wear shop in Dwarka",
    "ladies wear shop Dwarka Sector 7",
    "kurti shop Dwarka Delhi",
    "short kurtis for women",
    "long kurtis collection",
    "three piece suit for women",
    "two piece suit women",
    "party wear suits Delhi",
    "coord sets for women",
    "ladies ethnic wear New Delhi",
  ],

  authors: [
    {
      name: "Imkaa",
    },
  ],

  creator: "Imkaa",
  publisher: "Imkaa",

  metadataBase: new URL("www.imkaa.com"),

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: "Ladies Ethnic Wear Dwarka Delhi | Kurtis, Suits & Coord Sets",
    description:
      "Shop stylish ethnic wear in Dwarka Sector 7, New Delhi. Short kurtis, long kurtis, suits, party wear and coord sets.",
    url: "www.imkaa.com",
    siteName: "Imkaa",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ladies Ethnic Wear Collection",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Ladies Ethnic Wear Dwarka Delhi",
    description:
      "Short kurtis, long kurtis, suits and coord sets in Dwarka Delhi.",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </head>
      <body className="antialiased touch-manipulation" suppressHydrationWarning>
        <Suspense fallback={null}>
          <RouteProgressBar />
        </Suspense>
        <ToasterProvider />
        <GoogleOAuthProvider clientId="559542040158-doovmkf989qnidk43m125itm7ricr9ip.apps.googleusercontent.com">
          <AuthProvider>
            <AuthTransitionOverlay />
            <CartProvider>
              <WishlistProvider>
                <OrderProvider>
                  <ChatProvider>
                    <div className="min-h-screen w-full pb-[env(safe-area-inset-bottom)]">
                      {children}
                    </div>
                  </ChatProvider>
                </OrderProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
