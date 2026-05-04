"use client";

import Link from "next/link";
import { Search } from "lucide-react";

function formatDate(date) {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "2-digit",
    });
}

export default function BlogHero({ posts = [] }) {
    const mainPost = posts?.[0];
    const secondPost = posts?.[1];
    const thirdPost = posts?.[2];

    if (!mainPost) return null;

    return (
        <section className="w-full pb-6 sm:pb-8">
            <div className="relative">
                {/* Desktop / Laptop Search Bar */}
                <div className="absolute right-4 top-4 z-20 hidden w-[300px] lg:block xl:right-8 xl:top-6 xl:w-[430px]">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search the Magazine"
                            className="h-[52px] w-full rounded-full border border-[#ddd2d5] bg-white pl-6 pr-14 text-[15px] text-[#2f2226] shadow-sm outline-none placeholder:text-[#67595d] xl:h-[58px] xl:pl-7 xl:text-[16px]"
                        />
                        <Search
                            size={20}
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-[#8b7a80] xl:right-6 xl:h-[22px] xl:w-[22px]"
                        />
                    </div>
                </div>

                {/* Mobile / Tablet Search */}
                <div className="mb-3 block px-3 pt-3 sm:mb-4 sm:px-4 lg:hidden">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search the Magazine"
                            className="h-[48px] w-full rounded-full border border-[#ddd2d5] bg-white pl-5 pr-12 text-[14px] text-[#2f2226] outline-none placeholder:text-[#67595d] sm:h-[52px] sm:pl-6 sm:pr-14 sm:text-[15px]"
                        />
                        <Search
                            size={18}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b7a80] sm:right-5 sm:h-[20px] sm:w-[20px]"
                        />
                    </div>
                </div>

                {/* Main Hero Banner */}
                <Link href={`/blog/${mainPost.slug}`} className="group block bg-white">
                    <div className="relative h-[220px] w-full overflow-hidden sm:h-[300px] md:h-[400px] lg:h-[520px] xl:h-[620px] 2xl:h-[700px]">
                        <img
                            src={mainPost.image}
                            alt={mainPost.title}
                            className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.02]"
                        />
                    </div>
                </Link>
            </div>

            {/* Editorial Strip */}
            {(secondPost || thirdPost) && (
                <div className="mt-4 grid grid-cols-1 gap-4 px-3 sm:mt-6 sm:grid-cols-2 sm:gap-5 sm:px-4 lg:mt-8 lg:gap-6 lg:px-0">
                    {[secondPost, thirdPost].filter(Boolean).map((post) => (
                        <Link
                            key={post._id}
                            href={`/blog/${post.slug}`}
                            className="group block bg-white"
                        >
                            <div className="relative h-[190px] overflow-hidden rounded-[4px] sm:h-[240px] md:h-[280px] lg:h-[320px]">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                                />
                            </div>

                            <div className="pt-3">
                                <h3 className="line-clamp-2 font-[Playfair_Display] text-[18px] leading-snug text-[#2f2226] sm:text-[20px] lg:text-[22px]">
                                    {post.title}
                                </h3>

                                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] sm:text-[14px]">
                                    <span className="text-[#e56b8a]">
                                        {post.readTime || 4} min read
                                    </span>
                                    <span className="text-[#7f646a]">
                                        {formatDate(post.publishedAt)}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}