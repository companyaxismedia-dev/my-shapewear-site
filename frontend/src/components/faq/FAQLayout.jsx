"use client";

import FAQSidebar from "./FAQSidebar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function FAQLayout({ children }) {
    return (
        <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
            <Navbar />

            <main className="section-padding">
                <div className="container-imkaa">
                    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 lg:gap-12 items-start">
                        <aside
                            className="card-imkaa"
                            style={{
                                padding: 18,
                                position: "sticky",
                                top: 140,
                                alignSelf: "start",
                                background: "var(--color-card)",
                            }}
                        >
                            <p className="text-muted-sm" style={{ fontSize: 13, marginBottom: 12 }}>
                                Browse
                            </p>
                            <FAQSidebar />
                        </aside>

                        <div className="card-imkaa" style={{ padding: 24, background: "var(--color-card)" }}>
                            {children}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>

    );

}