"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";

export default function BraSizeCalculator() {

    const [underbust, setUnderbust] = useState("");
    const [overbust, setOverbust] = useState("");
    const [result, setResult] = useState(null);

    const calculateSize = () => {

        if (!underbust || !overbust) {
            toast.error("Please enter both measurements");
            return;
        }

        let band = Math.round(underbust);

        if (band % 2 === 0) {
            band = band + 4;
        } else {
            band = band + 5;
        }

        let diff = Math.round(overbust - underbust);

        let cup = "A";

        if (diff === 1) cup = "A";
        if (diff === 2) cup = "B";
        if (diff === 3) cup = "C";
        if (diff === 4) cup = "D";
        if (diff === 5) cup = "DD";
        if (diff >= 6) cup = "E";

        setResult(`${band}${cup}`);
    };

    return (

        <div className="max-w-6xl mx-auto px-6 py-16">

            {/* HERO BANNER */}

            <div className="grid md:grid-cols-2 gap-10 items-center mb-16">

                <div>

                    <h1 className="text-4xl font-bold mb-4">
                        Bra Size Calculator
                    </h1>

                    <p className="text-gray-500 mb-6">
                        Find your perfect bra size in just a few seconds using our
                        easy bra size calculator.
                    </p>

                    <button
                        className="bg-pink-500 text-white px-6 py-3 rounded-lg font-semibold"
                    >
                        Calculate Your Size
                    </button>

                </div>


                <div className="relative w-full h-[350px]">

                    <Image
                        src="/size-catculate/bra-hero-1.jpg"
                        alt="Bra size measurement"
                        fill
                        className="object-cover rounded-xl"
                    />

                </div>

            </div>
            <div className="grid md:grid-cols-2 gap-12 mb-16">

                {/* UNDERBUST */}

                <div className="space-y-4">

                    <Image
                        src="/size-catculate/underbust-guide-1.jpg"
                        alt="Underbust measurement"
                        width={500}
                        height={350}
                        className="rounded-lg"
                    />

                    <h2 className="text-xl font-semibold">
                        Step 1: Measure Underbust
                    </h2>

                    <p className="text-gray-500">
                        Wrap the measuring tape around your ribcage directly under your bust.
                    </p>

                    <input
                        type="number"
                        placeholder="Enter Underbust"
                        value={underbust}
                        onChange={(e) => setUnderbust(e.target.value)}
                        className="border p-3 rounded w-full"
                    />

                </div>


                {/* BUST */}

                <div className="space-y-4">

                    <Image
                        src="/size-catculate/bust-guide-1.jpg"
                        alt="Bust measurement"
                        width={500}
                        height={350}
                        className="rounded-lg"
                    />

                    <h2 className="text-xl font-semibold">
                        Step 2: Measure Bust
                    </h2>

                    <p className="text-gray-500">
                        Measure around the fullest part of your bust while keeping the tape level.
                    </p>

                    <input
                        type="number"
                        placeholder="Enter Overbust"
                        value={overbust}
                        onChange={(e) => setOverbust(e.target.value)}
                        className="border p-3 rounded w-full"
                    />

                </div>

            </div>


            {/* CALCULATE BUTTON */}

            <div className="text-center mb-16">

                <button
                    onClick={calculateSize}
                    className="bg-pink-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-600"
                >
                    Calculate Your Size
                </button>

            </div>


            {/* RESULT */}

            {result && (

                <div className="bg-gray-100 p-12 rounded-xl text-center mb-20">

                    <h2 className="text-3xl font-bold mb-6">
                        Your Bra Size Is
                    </h2>

                    <div className="text-6xl font-bold text-pink-500">
                        {result}
                    </div>

                </div>

            )}

            {/* RECOMMENDED BRAS */}

            {result && (

                <div className="mb-20">

                    <h2 className="text-3xl font-bold text-center mb-10">
                        Recommended Bras For Size {result}
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

                        {/* PRODUCT 1 */}

                        <div className="border rounded-xl p-4 hover:shadow-lg transition">

                            <Image
                                src="/size-catculate/bra-hero-2.webp"
                                alt="T-Shirt Bra"
                                width={300}
                                height={300}
                                className="rounded-lg"
                            />

                            <h3 className="font-semibold mt-3">
                                T-Shirt Bra
                            </h3>

                            <p className="text-gray-500 text-sm">
                                Smooth everyday comfort bra perfect for daily wear.
                            </p>

                            <button className="mt-3 bg-pink-500 text-white px-4 py-2 rounded">
                                Shop Now
                            </button>

                        </div>

                        {/* PRODUCT 2 */}

                        <div className="border rounded-xl p-4 hover:shadow-lg transition">

                            <Image
                                src="/size-catculate/bra-hero-3.webp"
                                alt="Push Up Bra"
                                width={300}
                                height={300}
                                className="rounded-lg"
                            />

                            <h3 className="font-semibold mt-3">
                                Push Up Bra
                            </h3>

                            <p className="text-gray-500 text-sm">
                                Enhances shape and provides extra lift.
                            </p>

                            <button className="mt-3 bg-pink-500 text-white px-4 py-2 rounded">
                                Shop Now
                            </button>

                        </div>

                        {/* PRODUCT 3 */}

                        <div className="border rounded-xl p-4 hover:shadow-lg transition">

                            <Image
                                src="/size-catculate/bra-hero-1.jpg"
                                alt="Lace Bra"
                                width={300}
                                height={300}
                                className="rounded-lg"
                            />

                            <h3 className="font-semibold mt-3">
                                Lace Bra
                            </h3>

                            <p className="text-gray-500 text-sm">
                                Elegant lace bra with premium comfort.
                            </p>

                            <button className="mt-3 bg-pink-500 text-white px-4 py-2 rounded">
                                Shop Now
                            </button>

                        </div>

                        {/* PRODUCT 4 */}

                        <div className="border rounded-xl p-4 hover:shadow-lg transition">

                            <Image
                                src="/size-catculate/bra-hero-2.webp"
                                alt="Full Coverage Bra"
                                width={300}
                                height={300}
                                className="rounded-lg"
                            />

                            <h3 className="font-semibold mt-3">
                                Full Coverage Bra
                            </h3>

                            <p className="text-gray-500 text-sm">
                                Maximum support and coverage for everyday wear.
                            </p>

                            <button className="mt-3 bg-pink-500 text-white px-4 py-2 rounded">
                                Shop Now
                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* BRA SIZE CHART */}

            <h2 className="text-2xl font-bold mb-6">
                Bra Size Chart
            </h2>

            <table className="w-full border mb-20">

                <thead className="bg-gray-100">

                    <tr>
                        <th className="border p-3">Band Size</th>
                        <th className="border p-3">Cup A</th>
                        <th className="border p-3">Cup B</th>
                        <th className="border p-3">Cup C</th>
                        <th className="border p-3">Cup D</th>
                    </tr>

                </thead>

                <tbody>

                    <tr>
                        <td className="border p-3">32</td>
                        <td className="border p-3">81-83</td>
                        <td className="border p-3">83-86</td>
                        <td className="border p-3">86-89</td>
                        <td className="border p-3">89-91</td>
                    </tr>

                    <tr>
                        <td className="border p-3">34</td>
                        <td className="border p-3">86-89</td>
                        <td className="border p-3">89-91</td>
                        <td className="border p-3">91-94</td>
                        <td className="border p-3">94-96</td>
                    </tr>

                    <tr>
                        <td className="border p-3">36</td>
                        <td className="border p-3">91-94</td>
                        <td className="border p-3">94-96</td>
                        <td className="border p-3">96-99</td>
                        <td className="border p-3">99-101</td>
                    </tr>

                </tbody>

            </table>

            {/* VIDEO GUIDE */}

            <div className="bg-gray-50 p-10 rounded-xl mb-20">

                <div className="grid md:grid-cols-2 gap-10 items-center">

                    <div>

                        <h2 className="text-3xl font-bold mb-4">
                            Visual Representation of How to Find Bra Size
                        </h2>

                        <p className="text-gray-600">
                            Watch this quick tutorial to understand how to measure your
                            underbust and bust correctly for the perfect bra fit.
                        </p>

                    </div>


                    <div className="aspect-video">

                        <iframe
                            className="w-full h-full rounded-lg"
                            src="https://www.youtube.com/embed/9C4V7xYVQ9Q"
                            title="Bra Size Measurement Guide"
                            allowFullScreen
                        ></iframe>

                    </div>

                </div>

            </div>

            {/* DOS AND DONTS */}

            <div className="bg-gray-100 p-10 rounded-xl mb-20">

                <h2 className="text-3xl font-bold mb-8 text-center">
                    Quick Tips: Do’s & Don’ts
                </h2>

                <div className="grid md:grid-cols-2 gap-10">

                    {/* DO's */}

                    <div>

                        <h3 className="text-xl font-semibold text-green-600 mb-4">
                            ✔ Do’s
                        </h3>

                        <ul className="space-y-3 text-gray-600">

                            <li>Wear a non-padded bra while measuring.</li>

                            <li>Stand straight and relaxed.</li>

                            <li>Keep the measuring tape flat on your skin.</li>

                            <li>Breathe normally during measurements.</li>

                        </ul>

                    </div>


                    {/* DON'TS */}

                    <div>

                        <h3 className="text-xl font-semibold text-red-500 mb-4">
                            ❌ Don’ts
                        </h3>

                        <ul className="space-y-3 text-gray-600">

                            <li>Do not pull the tape too tight.</li>

                            <li>Do not measure over thick clothing.</li>

                            <li>Avoid wearing the wrong bra during measurement.</li>

                            <li>Do not twist the measuring tape.</li>

                        </ul>

                    </div>

                </div>

            </div>

            {/* CORRECT BRA FIT GUIDE */}

            <div className="mb-24">

                <h2 className="text-3xl font-bold mb-10 text-center">
                    How To Check If Your Bra Fits Correctly
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

                    {/* CUP FIT */}

                    <div className="text-center space-y-3">

                        <Image
                            src="/size-catculate/bust-guide-1.jpg"
                            alt="Cup Fit"
                            width={400}
                            height={300}
                            className="rounded-lg"
                        />

                        <h3 className="font-semibold text-lg">
                            Cup Fit
                        </h3>

                        <p className="text-gray-500 text-sm">
                            Your breasts should sit comfortably inside the cups without spilling or gaps.
                        </p>

                    </div>

                    {/* BAND FIT */}

                    <div className="text-center space-y-3">

                        <Image
                            src="/size-catculate/bust-guide-2.jpg"
                            alt="Band Fit"
                            width={400}
                            height={300}
                            className="rounded-lg"
                        />

                        <h3 className="font-semibold text-lg">
                            Band Fit
                        </h3>

                        <p className="text-gray-500 text-sm">
                            The band should stay straight across your back and feel snug but comfortable.
                        </p>

                    </div>

                    {/* STRAP FIT */}

                    <div className="text-center space-y-3">

                        <Image
                            src="/size-catculate/bust-guide-3.jpg"
                            alt="Strap Fit"
                            width={400}
                            height={300}
                            className="rounded-lg"
                        />

                        <h3 className="font-semibold text-lg">
                            Strap Fit
                        </h3>

                        <p className="text-gray-500 text-sm">
                            Straps should sit comfortably on your shoulders without digging in.
                        </p>

                    </div>

                    {/* CENTER FIT */}

                    <div className="text-center space-y-3">

                        <Image
                            src="/size-catculate/bust-guide-4.jpg"
                            alt="Center Fit"
                            width={400}
                            height={300}
                            className="rounded-lg"
                        />

                        <h3 className="font-semibold text-lg">
                            Center Gore
                        </h3>

                        <p className="text-gray-500 text-sm">
                            The center of the bra should lie flat against your chest.
                        </p>

                    </div>

                </div>

            </div>



            {/* FAQ SECTION */}

            <div className="mb-24">

                <h2 className="text-3xl font-bold mb-10 text-center">
                    Bra Size Calculator – Frequently Asked Questions
                </h2>

                <div className="space-y-8 text-gray-600">

                    <div>
                        <h3 className="font-semibold text-lg">
                            1. How do you measure your bra size correctly?
                        </h3>
                        <p>
                            To measure your bra size correctly, you need two measurements: underbust and overbust.
                            Use a soft measuring tape and measure around your ribcage directly under your bust
                            for the band size, and around the fullest part of your bust for the cup size.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg">
                            2. What is underbust measurement?
                        </h3>
                        <p>
                            Underbust measurement is taken directly below your breasts around the ribcage.
                            This measurement helps determine your band size which provides most of the support
                            in a bra.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg">
                            3. What is bust or overbust measurement?
                        </h3>
                        <p>
                            Overbust measurement is taken around the fullest part of your breasts.
                            This measurement helps determine the cup size of your bra.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg">
                            4. How often should you measure your bra size?
                        </h3>
                        <p>
                            It is recommended to measure your bra size every 6 to 12 months.
                            Body changes, weight changes, pregnancy, or hormonal changes can affect your bra size.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg">
                            5. What if my bra size falls between two sizes?
                        </h3>
                        <p>
                            If your bra size falls between two sizes, it is usually better to choose the larger band
                            size or the cup size that feels more comfortable and supportive.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg">
                            6. Why is it important to wear the correct bra size?
                        </h3>
                        <p>
                            Wearing the correct bra size improves comfort, posture, and breast support.
                            A properly fitting bra also enhances the shape of clothing and prevents
                            back and shoulder discomfort.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg">
                            7. What are common signs of a wrong bra size?
                        </h3>
                        <p>
                            Common signs include straps digging into shoulders, band riding up your back,
                            cups overflowing, gaps in the cups, or discomfort while wearing the bra.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg">
                            8. Can bra size change over time?
                        </h3>
                        <p>
                            Yes, bra size can change due to weight fluctuations, pregnancy, hormonal changes,
                            or aging. That is why regular measurement is recommended.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg">
                            9. What type of bra is best for everyday use?
                        </h3>
                        <p>
                            T-shirt bras and full coverage bras are usually best for everyday wear because
                            they provide comfort, smooth shaping, and good support throughout the day.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg">
                            10. Does the band or the straps provide more support?
                        </h3>
                        <p>
                            The band provides about 80% of the support in a bra while straps provide
                            around 20%. That is why a properly fitting band is very important.
                        </p>
                    </div>

                </div>

            </div>

        </div>

    );

}
