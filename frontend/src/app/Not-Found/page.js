"use client";

import Image from "next/image";
import Link from "next/link";

export default function NotFoundPage() {

    return (

        <div className="min-h-screen flex items-center justify-center bg-white px-6">

            <div className="max-w-7xl w-full grid md:grid-cols-2 gap-16 items-center">

                {/* LEFT IMAGE */}

                <div className="flex justify-center">

                    <Image
                        src="/image/notFound.jpg"
                        alt="404 not found"
                        width={500}
                        height={500}
                        className="object-contain"
                    />

                </div>


                {/* RIGHT CONTENT */}

                <div>

                    <p className="text-sm tracking-widest text-gray-600 mb-4">
                        DIDN'T FIND WHAT YOU WERE
                    </p>

                    <h1 className="text-5xl font-bold mb-4">
                        LOOKING FOR?
                    </h1>

                    <p className="text-gray-500 mb-6 text-lg">
                        Find it all here at <span className="font-semibold">IMKAA</span>.
                    </p>

                    <p className="text-gray-500 mb-8">
                        Or look through our popular categories
                    </p>


                    {/* CATEGORY LINKS */}

                    <div className="flex flex-wrap gap-4 text-sm font-semibold">

                        <Link
                            href="/bra"
                            className="text-pink-500 hover:underline"
                        >
                            BRAS
                        </Link>

                        <span>|</span>

                        <Link
                            href="/panties"
                            className="text-pink-500 hover:underline"
                        >
                            PANTIES
                        </Link>

                        <span>|</span>

                        <Link
                            href="/lingerie"
                            className="text-pink-500 hover:underline"
                        >
                            LINGERIE
                        </Link>

                        <span>|</span>

                        <Link
                            href="/shapewear"
                            className="text-pink-500 hover:underline"
                        >
                            SHAPEWEAR
                        </Link>

                        <span>|</span>

                        <Link
                            href="/curvy"
                            className="text-pink-500 hover:underline"
                        >
                            CURVY
                        </Link>

                        <span>|</span>

                        <Link
                            href="/tummy-control"
                            className="text-pink-500 hover:underline"
                        >
                            TUMMY CONTROL
                        </Link>

                    </div>


                    {/* BUTTON */}

                    <div className="mt-10">

                        <Link
                            href="/"
                            className="bg-pink-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-600 transition"
                        >
                            Back To Home
                        </Link>

                    </div>

                </div>

            </div>

        </div>

    );

}