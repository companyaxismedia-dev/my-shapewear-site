import "./globals.css";
import Script from "next/script";
import { CartProvider } from "@/context/CartContext";

export const metadata = {
  title: "Shapewear Store | Premium Collection",
  description: "Premium Women Shapewear Collection",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* ✅ MOBILE VIEWPORT (MOST IMPORTANT) */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />

        {/* ✅ GOOGLE FONT (Clovia-style handwritten) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap"
          rel="stylesheet"
        />

        {/* ✅ Razorpay */}
        <Script
          id="razorpay-checkout-js"
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />
      </head>

      <body
        className="
          antialiased
          text-slate-900
          bg-[#f0f2f5]
          overflow-x-hidden
          touch-manipulation
        "
      >
        {/* ✅ GLOBAL APP PROVIDERS */}
        <CartProvider>
          {/* ✅ SAFE AREA SUPPORT (iPhone notch etc.) */}
          <div className="min-h-screen w-full pb-[env(safe-area-inset-bottom)]">
            {children}
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
