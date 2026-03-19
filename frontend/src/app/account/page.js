"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AccountProvider } from "@/context/AccountContext";
import { Suspense } from "react";
import AccountLayout from "@/components/account/AccountLayout";

export default function AccountPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div style={{ textAlign: "center", padding: "40px", fontFamily: "var(--font-body)", color: "var(--color-body)" }}>Loading account details...</div>}>
        <AccountProvider>
          <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
            <AccountLayout />
          </div>
        </AccountProvider>
      </Suspense>
      <Footer />
    </>
  );
}