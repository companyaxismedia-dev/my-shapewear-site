"use client";

import Link from "next/link";
import { Search, User, Heart, ShoppingBag } from "lucide-react";

export default function Header() {

    return (

        <header className="bg-white border-b border-[#eaeaec] h-[64px] sticky top-0 z-50">

            <div className="flex items-center justify-between h-full px-12">

                <Link href="/" className="text-3xl font-bold text-pink-500">
                    M
                </Link>

                <div className="relative w-[500px]">

                    <input
                        placeholder="Search for products, brands and more"
                        className="w-full bg-[#f5f5f6] px-4 py-[10px] text-[14px] outline-none rounded"
                    />

                    <Search className="absolute right-3 top-[10px] h-4 w-4 text-[#696e79]" />

                </div>

                <div className="flex items-center gap-8 text-[#282c3f]">

                    <User />

                    <Heart />

                    <ShoppingBag />

                </div>

            </div>

        </header>

    )

}