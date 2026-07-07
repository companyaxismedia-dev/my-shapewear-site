"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";

export default function SizeCalculator() {

    const [bust, setBust] = useState("");
    const [waist, setWaist] = useState("");
    const [hips, setHips] = useState("");
    const [result, setResult] = useState(null);

    const calculateSize = () => {

        if (!bust || !waist || !hips) {
            toast.error("Please enter all measurements");
            return;
        }

        const bustNum = parseFloat(bust);

        let size = "S";

        if (bustNum < 34) size = "XS";
        else if (bustNum >= 34 && bustNum < 36) size = "S";
        else if (bustNum >= 36 && bustNum < 38) size = "M";
        else if (bustNum >= 38 && bustNum < 40) size = "L";
        else if (bustNum >= 40 && bustNum < 42) size = "XL";
        else if (bustNum >= 42) size = "XXL";

        setResult(size);
    };

    return (

        <div className="max-w-6xl mx-auto px-6 py-16">

            {/* HERO BANNER */}

            <div className="grid md:grid-cols-2 gap-10 items-center mb-16">

                <div>

                    <h1 className="text-4xl font-bold mb-4">
                        Ethnic Wear Size Calculator
                    </h1>

                    <p className="text-gray-500 mb-6">
                        Find your perfect ethnic wear size in just a few seconds using our
                        easy size calculator. Designed for Suits, Kurta Sets, and Palazzos.
                    </p>

                    <button
                        onClick={calculateSize}
                        className="bg-pink-500 text-white px-6 py-3 rounded-lg font-semibold"
                    >
                        Calculate Your Size
                    </button>

                </div>


                <div className="relative w-full h-[350px]">

                    <Image
                        src="/size-catculate/size-calculate.webp"
                        alt="Suit size measurement"
                        fill
                        className="object-cover rounded-xl"
                    />

                </div>

            </div>

            <div className="grid md:grid-cols-3 gap-12 mb-16">

                {/* BUST */}

                <div className="space-y-4">

                    <h2 className="text-xl font-semibold">
                        Step 1: Measure Bust
                    </h2>

                    <p className="text-gray-500 text-sm">
                        Wrap the measuring tape around the fullest part of your bust.
                    </p>

                    <input
                        type="number"
                        placeholder="Enter Bust (inches)"
                        value={bust}
                        onChange={(e) => setBust(e.target.value)}
                        className="border p-3 rounded w-full"
                    />

                </div>


                {/* WAIST */}

                <div className="space-y-4">

                    <h2 className="text-xl font-semibold">
                        Step 2: Measure Waist
                    </h2>

                    <p className="text-gray-500 text-sm">
                        Measure around the narrowest part of your waistline.
                    </p>

                    <input
                        type="number"
                        placeholder="Enter Waist (inches)"
                        value={waist}
                        onChange={(e) => setWaist(e.target.value)}
                        className="border p-3 rounded w-full"
                    />

                </div>

                {/* HIPS */}

                <div className="space-y-4">

                    <h2 className="text-xl font-semibold">
                        Step 3: Measure Hips
                    </h2>

                    <p className="text-gray-500 text-sm">
                        Measure around the fullest part of your hips.
                    </p>

                    <input
                        type="number"
                        placeholder="Enter Hips (inches)"
                        value={hips}
                        onChange={(e) => setHips(e.target.value)}
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
                        Your Recommended Size Is
                    </h2>

                    <div className="text-6xl font-bold text-pink-500">
                        {result}
                    </div>

                </div>

            )}

            {/* SIZE CHART */}

            <h2 className="text-2xl font-bold mb-6">
                Standard Ethnic Wear Size Chart
            </h2>

            <table className="w-full border mb-20 text-center">

                <thead className="bg-gray-100">

                    <tr>
                        <th className="border p-3">Size</th>
                        <th className="border p-3">Bust (inches)</th>
                        <th className="border p-3">Waist (inches)</th>
                        <th className="border p-3">Hips (inches)</th>
                    </tr>

                </thead>

                <tbody>

                    <tr>
                        <td className="border p-3 font-semibold">XS</td>
                        <td className="border p-3">32</td>
                        <td className="border p-3">26</td>
                        <td className="border p-3">34</td>
                    </tr>

                    <tr>
                        <td className="border p-3 font-semibold">S</td>
                        <td className="border p-3">34</td>
                        <td className="border p-3">28</td>
                        <td className="border p-3">36</td>
                    </tr>

                    <tr>
                        <td className="border p-3 font-semibold">M</td>
                        <td className="border p-3">36</td>
                        <td className="border p-3">30</td>
                        <td className="border p-3">38</td>
                    </tr>

                    <tr>
                        <td className="border p-3 font-semibold">L</td>
                        <td className="border p-3">38</td>
                        <td className="border p-3">32</td>
                        <td className="border p-3">40</td>
                    </tr>

                    <tr>
                        <td className="border p-3 font-semibold">XL</td>
                        <td className="border p-3">40</td>
                        <td className="border p-3">34</td>
                        <td className="border p-3">42</td>
                    </tr>

                    <tr>
                        <td className="border p-3 font-semibold">XXL</td>
                        <td className="border p-3">42</td>
                        <td className="border p-3">36</td>
                        <td className="border p-3">44</td>
                    </tr>

                </tbody>

            </table>

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

                            <li>Wear fitted clothing while measuring.</li>

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

                            <li>Do not twist the measuring tape.</li>

                        </ul>

                    </div>

                </div>

            </div>

            {/* FAQ SECTION */}

            <div className="mb-24">

                <h2 className="text-3xl font-bold mb-10 text-center">
                    Size Calculator – Frequently Asked Questions
                </h2>

                <div className="space-y-8 text-gray-600">

                    <div>
                        <h3 className="font-semibold text-lg">
                            1. How do you measure your ethnic wear size correctly?
                        </h3>
                        <p>
                            To measure your size correctly, you need three main measurements: bust, waist, and hips.
                            Use a soft measuring tape and keep it level across your body.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg">
                            2. What if my measurements fall between two sizes?
                        </h3>
                        <p>
                            If your measurements fall between two sizes, it is usually better to choose the larger size for a comfortable fit, especially for non-stretch fabrics.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg">
                            3. Why is it important to wear the correct size?
                        </h3>
                        <p>
                            Wearing the correct size improves comfort, posture, and ensures the garment drapes elegantly on your body as intended by the design.
                        </p>
                    </div>

                </div>

            </div>

        </div>

    );

}
