"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Dot } from "lucide-react";

export const faqCategories = [
    { id: "top-queries", label: "Top Queries" },
    { id: "shipping", label: "Shipping & Delivery" },
    { id: "returns", label: "Returns & Exchange" },
    { id: "payments", label: "Payments & Safety" },
    { id: "terms-conditions", label: "Terms & Conditions" },
    { id: "contact-us", label: "Contact & Support" },
];

export default function FAQSidebar() {
    const [active, setActive] = useState(() => {
        if (typeof window !== "undefined" && window.location.hash) {
            return window.location.hash.replace("#", "");
        }
        return "top-queries";
    });

    useEffect(() => {

        const sections = document.querySelectorAll("section[id]");

        const observer = new IntersectionObserver(


            (entries) => {

                entries.forEach((entry) => {

                    if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
                        setActive(entry.target.id);
                    }

                });

            },
            {
                rootMargin: "-40% 0px -40% 0px",
                threshold: 0.2
            }
        );

        sections.forEach((section) => observer.observe(section));

        return () => observer.disconnect();

    }, []);



    return (

        <aside className="w-full pt-8">

            <nav>

                {faqCategories.map((cat) => {

                    const isActive = active === cat.id

                    return (

                        <Link
                            key={cat.id}
                            href={`#${cat.id}`}
                            className="flex items-start gap-3 px-6 py-3 rounded-xl transition-colors"
                            style={{
                                background: isActive ? "rgba(234,215,221,0.35)" : "transparent",
                            }}
                        >

                            <Dot className="w-5 h-5 flex-shrink-0" style={{ color: isActive ? "var(--color-primary)" : "var(--color-accent)" }} />

                            <span
                                className="text-[14px]"
                                style={{
                                    color: isActive ? "var(--color-heading)" : "var(--color-body)",
                                    fontWeight: isActive ? 600 : 500,
                                }}
                            >
                                {cat.label}
                            </span>

                        </Link>

                    )

                })}

            </nav>

        </aside>

    )

}