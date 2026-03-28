"use client";

import { useMemo, useState } from "react";
import ModalWrapper from "./ModalWrapper";

const PANTY_SIZE_ROWS_IN = [
  { size: "S", hip: "36-37.5" },
  { size: "M", hip: "38-39.5" },
  { size: "L", hip: "40-41.5" },
  { size: "XL", hip: "42-43.5" },
  { size: "XXL", hip: "44-45.5" },
  { size: "3XL", hip: "46-47.5" },
  { size: "4XL", hip: "48-49.5" },
];

const INTERNATIONAL_SIZE_ROWS_IN = [
  {
    hip: "36-37.5",
    clovia: "S",
    us: "6",
    uk: "10",
    france: "38",
    international: "36",
  },
  {
    hip: "38-39.5",
    clovia: "M",
    us: "8",
    uk: "12",
    france: "40",
    international: "38",
  },
  {
    hip: "40-41.5",
    clovia: "L",
    us: "10",
    uk: "14",
    france: "42",
    international: "40",
  },
  {
    hip: "42-43.5",
    clovia: "XL",
    us: "12",
    uk: "16",
    france: "44",
    international: "42",
  },
  {
    hip: "44-45.5",
    clovia: "XXL",
    us: "14",
    uk: "18",
    france: "46",
    international: "44",
  },
  {
    hip: "46-47.5",
    clovia: "3XL",
    us: "16",
    uk: "20",
    france: "48",
    international: "46",
  },
  {
    hip: "48-49.5",
    clovia: "4XL",
    us: "18",
    uk: "22",
    france: "50",
    international: "48",
  },
];

function convertRangeToCm(range) {
  if (!range) return "";
  const parts = range.split("-").map((v) => Number(v.trim()));
  if (parts.length !== 2 || parts.some(Number.isNaN)) return range;

  const [min, max] = parts;
  const cmMin = +(min * 2.54).toFixed(1);
  const cmMax = +(max * 2.54).toFixed(1);

  return `${cmMin}-${cmMax}`;
}

export default function PantySizeChartModal({ onClose }) {
  const [unit, setUnit] = useState("in");

  const pantyRows = useMemo(() => {
    if (unit === "in") return PANTY_SIZE_ROWS_IN;

    return PANTY_SIZE_ROWS_IN.map((row) => ({
      ...row,
      hip: convertRangeToCm(row.hip),
    }));
  }, [unit]);

  const internationalRows = useMemo(() => {
    if (unit === "in") return INTERNATIONAL_SIZE_ROWS_IN;

    return INTERNATIONAL_SIZE_ROWS_IN.map((row) => ({
      ...row,
      hip: convertRangeToCm(row.hip),
    }));
  }, [unit]);

  return (
    <ModalWrapper title="Find your Size" onClose={onClose}>
      <div className="custom-scroll max-h-[82vh] overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
        {/* TOP STRIP */}
        <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-[#d6edf7] bg-[#dff2fb] px-4 py-3">
          <h3 className="font-playfair text-[20px] font-semibold text-[#4A2E35] sm:text-[26px]">
            Panty Size Chart
          </h3>

          <div className="flex items-center rounded-xl border border-[#e5c8d0] bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setUnit("in")}
              className={`min-w-[56px] rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                unit === "in"
                  ? "bg-[#f4b9ca] text-white shadow-sm"
                  : "text-[#6F5560] hover:bg-[#faf2f5]"
              }`}
            >
              In
            </button>

            <button
              type="button"
              onClick={() => setUnit("cm")}
              className={`min-w-[56px] rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                unit === "cm"
                  ? "bg-[#f4b9ca] text-white shadow-sm"
                  : "text-[#6F5560] hover:bg-[#faf2f5]"
              }`}
            >
              Cm
            </button>
          </div>
        </div>

        {/* MAIN SECTION */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* LEFT IMAGE */}
          <div className="rounded-2xl border border-[#ead9de] bg-white p-5">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-[170px] w-[170px] items-center justify-center overflow-hidden rounded-full border border-[#efd7dd] bg-[#fff8fa]">
                <img
                  src="/images/hip.png"
                  alt="Hip measurement"
                  className="h-full w-full object-cover"
                />
              </div>

              <p className="text-[14px] font-semibold uppercase tracking-[0.12em] text-[#5A3C46]">
                Hip
              </p>

              <p className="mt-2 text-sm leading-7 text-[#7a5b63]">
                Measure around the fullest part of your hips. Keep the tape flat
                against your body but not too tight.
              </p>
            </div>
          </div>

          {/* MAIN TABLE */}
          <div className="rounded-2xl border border-[#ead9de] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] border-collapse text-center">
                <thead>
                  <tr>
                    <th
                      colSpan={2}
                      className="border border-[#d9d9d9] bg-white px-4 py-3 text-[16px] font-semibold text-[#4A2E35]"
                    >
                      Size Chart In ({unit === "in" ? "INCH" : "CM"})
                    </th>
                  </tr>
                  <tr>
                    <th className="border border-[#d9d9d9] bg-[#f6dbe3] px-4 py-3 text-sm font-semibold text-[#4A2E35]">
                      Size
                    </th>
                    <th className="border border-[#d9d9d9] bg-[#dff2fb] px-4 py-3 text-sm font-semibold text-[#4A2E35]">
                      To Fit Hip
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {pantyRows.map((row) => (
                    <tr key={row.size} className="odd:bg-white even:bg-[#fffafc]">
                      <td className="border border-[#d9d9d9] bg-[#fdf1f5] px-4 py-3 text-[15px] font-medium text-[#5A3C46]">
                        {row.size}
                      </td>
                      <td className="border border-[#d9d9d9] px-4 py-3 text-[15px] font-medium text-[#5A3C46]">
                        {row.hip}
                      </td>
                    </tr>
                  ))}

                  <tr>
                    <td className="border border-[#d9d9d9] bg-[#fdf1f5] px-4 py-3 text-[15px] font-semibold text-[#5A3C46]">
                      Free Size
                    </td>
                    <td className="border border-[#d9d9d9] bg-[#eef7fc] px-4 py-3 text-left text-[15px] leading-6 text-[#5A3C46]">
                      Our free size products are made of stretchable knitted
                      material and can fit well on bodies from sizes S to L.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* NOTE BOX */}
        <div className="mt-5 rounded-2xl border border-[#d6edf7] bg-[#dff2fb] px-4 py-4 text-sm text-[#5A3C46]">
          <p>
            <span className="font-semibold">Hip - </span>
            With a tape measure around the fullest part of your hips. The tape
            should be flat against your body but not too tight.
          </p>
        </div>

        {/* INTERNATIONAL SIZE CHART */}
        <div className="mt-8">
          <h3 className="mb-4 text-center font-playfair text-[22px] font-semibold uppercase text-[#4A2E35] sm:text-[28px]">
            International Size Chart
          </h3>

          <div className="overflow-x-auto rounded-2xl border border-[#ead9de] bg-white">
            <table className="w-full min-w-[900px] border-collapse text-center">
              <thead>
                <tr>
                  <th className="border border-[#d9d9d9] bg-[#dff2fb] px-4 py-3 text-sm font-semibold text-[#4A2E35]">
                    To Fit Hip
                  </th>
                  <th className="border border-[#d9d9d9] bg-[#f6dbe3] px-4 py-3 text-sm font-semibold text-[#4A2E35]">
                    Clovia Size
                  </th>
                  <th className="border border-[#d9d9d9] bg-[#eef8fc] px-4 py-3 text-sm font-semibold text-[#4A2E35]">
                    US Size
                  </th>
                  <th className="border border-[#d9d9d9] bg-[#eef8fc] px-4 py-3 text-sm font-semibold text-[#4A2E35]">
                    English Size
                  </th>
                  <th className="border border-[#d9d9d9] bg-[#eef8fc] px-4 py-3 text-sm font-semibold text-[#4A2E35]">
                    France Size
                  </th>
                  <th className="border border-[#d9d9d9] bg-[#eef8fc] px-4 py-3 text-sm font-semibold text-[#4A2E35]">
                    International Size
                  </th>
                </tr>
              </thead>

              <tbody>
                {internationalRows.map((row) => (
                  <tr
                    key={row.clovia}
                    className="odd:bg-white even:bg-[#fffafc]"
                  >
                    <td className="border border-[#d9d9d9] px-4 py-3 text-[15px] font-medium text-[#5A3C46]">
                      {row.hip}
                    </td>
                    <td className="border border-[#d9d9d9] bg-[#fdf1f5] px-4 py-3 text-[15px] font-medium text-[#5A3C46]">
                      {row.clovia}
                    </td>
                    <td className="border border-[#d9d9d9] px-4 py-3 text-[15px] font-medium text-[#5A3C46]">
                      {row.us}
                    </td>
                    <td className="border border-[#d9d9d9] px-4 py-3 text-[15px] font-medium text-[#5A3C46]">
                      {row.uk}
                    </td>
                    <td className="border border-[#d9d9d9] px-4 py-3 text-[15px] font-medium text-[#5A3C46]">
                      {row.france}
                    </td>
                    <td className="border border-[#d9d9d9] px-4 py-3 text-[15px] font-medium text-[#5A3C46]">
                      {row.international}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}