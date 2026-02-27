import "./globals.css";
import Script from "next/script";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

export const metadata = {
  title: "Shapewear Store | Premium Collection",
  description: "Premium Women Shapewear Collection",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      
      <body className="antialiased text-slate-900 bg-[#f0f2f5] touch-manipulation">

        {/* Razorpay Script */}
        <Script
          id="razorpay-checkout-js"
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />

        <GoogleOAuthProvider clientId="559542040158-doovmkf989qnidk43m125itm7ricr9ip.apps.googleusercontent.com">

          <AuthProvider>
            <CartProvider>
              <WishlistProvider>

                <div className="min-h-screen w-full pb-[env(safe-area-inset-bottom)]">
                  {children}
                </div>

              </WishlistProvider>
            </CartProvider>
          </AuthProvider>

        </GoogleOAuthProvider>

      </body>
    </html>
  );
}