"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";

export const faqCategories = [

    { id: "top-queries", label: "Top Queries" },
    { id: "terms-conditions", label: "Terms and Conditions" },
    { id: "contact-us", label: "Contact Us" },
    { id: "social-carnival", label: "Social Carnival Event" },
    { id: "shipping", label: "Shipping, Order Tracking & Delivery" },
    { id: "cancellations", label: "Cancellations and Modifications" },
    { id: "returns", label: "Returns and Exchange" },
    { id: "signup-login", label: "Sign Up and Login" },
    { id: "payments", label: "Payments" },
    { id: "myntra-credit", label: "Myntra Credit" },
    { id: "coupons-cashback", label: "Coupons and My Cashback" },
    { id: "phonepe", label: "PhonePe Wallet" },
    { id: "gift-cards", label: "Gift Cards" },

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

        <aside className="w-full bg-white pt-10">

            <nav>

                {faqCategories.map((cat) => {

                    const isActive = active === cat.id

                    return (

                        <Link
                            key={cat.id}
                            href={`#${cat.id}`}
                            className="flex items-start gap-4 pl-10 pr-10 py-3 transition-colors"
                        >

                            <Star
                                className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? "text-[#d4a537]" : "text-[#c2c2c2]"}`}
                            />

                            <span
                                className={`text-[15px] ${isActive
                                    ? "text-[#d4a537] font-medium"
                                    : "text-[#696e79]"
                                    }`}
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