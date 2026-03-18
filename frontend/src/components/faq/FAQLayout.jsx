"use client";

import Header from "./Header";
import FAQSidebar from "./FAQSidebar";
import { useRef, useEffect } from "react";

export default function FAQLayout({ children }) {

    const leftRef = useRef(null);
    const rightRef = useRef(null);

    useEffect(() => {

        const left = leftRef.current;
        const right = rightRef.current;

        if (!left || !right) return;

        const handleLeftScroll = () => {
            right.scrollTop = left.scrollTop;
        };

        const handleRightScroll = () => {
            left.scrollTop = right.scrollTop;
        };

        left.addEventListener("scroll", handleLeftScroll);
        right.addEventListener("scroll", handleRightScroll);

        return () => {
            left.removeEventListener("scroll", handleLeftScroll);
            right.removeEventListener("scroll", handleRightScroll);
        };

    }, []);

    return (

        <div className="min-h-screen bg-gray-50">

            <Header />

            <div className="flex">

                {/* LEFT SIDEBAR */}
                <aside
                    ref={leftRef}
                    className="faq-scroll w-[340px] border-r border-[#eaeaec] h-[calc(100vh-64px)] sticky top-[64px] overflow-y-auto bg-white pl-16"
                >
                    <FAQSidebar />
                </aside>

                {/* RIGHT CONTENT */}
                <main
                    ref={rightRef}
                    className="flex-1 p-10 bg-white h-[calc(100vh-64px)] overflow-y-auto"
                >

                    <div className="w-full max-w-[1000px]">
                        {children}
                    </div>

                </main>

            </div>

        </div>

    );

}