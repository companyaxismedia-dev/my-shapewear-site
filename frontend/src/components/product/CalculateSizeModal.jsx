"use client";

import { useMemo, useState } from "react";
import ModalWrapper from "./ModalWrapper";

function toInches(value, unit) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return 0;
  return unit === "cm" ? num / 2.54 : num;
}

function roundToNearestEven(value) {
  return Math.round(value / 2) * 2;
}

function clampBandSize(band) {
  if (band < 28) return 28;
  if (band > 44) return 44;
  return band;
}

function getBandSize(underBustIn) {
  return clampBandSize(roundToNearestEven(underBustIn));
}

function getCupSize(diffIn) {
  const roundedDiff = Math.round(diffIn);

  switch (roundedDiff) {
    case 1:
      return "A";
    case 2:
      return "B";
    case 3:
      return "C";
    case 4:
      return "D";
    case 5:
      return "DD";
    case 6:
      return "E";
    case 7:
      return "F";
    case 8:
      return "G";
    default:
      return null;
  }
}

function calculateBraSize(overBust, underBust, unit) {
  const overIn = toInches(overBust, unit);
  const underIn = toInches(underBust, unit);

  if (!overIn || !underIn) {
    return {
      ok: false,
      message: "Please enter both measurements.",
    };
  }

  if (overIn <= underIn) {
    return {
      ok: false,
      message:
        "Oops! Something is wrong. Please check your measurements again or visit our stores for expert consultation.",
    };
  }

  if (underIn < 23 || underIn > 49 || overIn < 26 || overIn > 60) {
    return {
      ok: false,
      message:
        "Oops! Something is wrong. Please check your measurements again or visit our stores for expert consultation.",
    };
  }

  const diff = overIn - underIn;

  if (diff < 1 || diff > 8) {
    return {
      ok: false,
      message:
        "Oops! Something is wrong. Please check your measurements again or visit our stores for expert consultation.",
    };
  }

  const band = getBandSize(underIn);
  const cup = getCupSize(diff);

  if (!cup) {
    return {
      ok: false,
      message:
        "Oops! Something is wrong. Please check your measurements again or visit our stores for expert consultation.",
    };
  }

  return {
    ok: true,
    size: `${band}${cup}`,
    band,
    cup,
  };
}

export default function CalculateSizeModal({ onClose }) {
  const [unit, setUnit] = useState("in");
  const [overBust, setOverBust] = useState("");
  const [underBust, setUnderBust] = useState("");
  const [result, setResult] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const unitLabel = useMemo(() => (unit === "in" ? "Inches" : "Cm"), [unit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    const calc = calculateBraSize(overBust, underBust, unit);
    setResult(calc);
  };

  const handleUnitChange = (nextUnit) => {
    if (nextUnit === unit) return;

    setUnit(nextUnit);
    setOverBust("");
    setUnderBust("");
    setResult(null);
    setSubmitted(false);
  };

  return (
  <ModalWrapper
    title="Bra Size Calculator"
    onClose={onClose}
    className="!h-auto !w-[620px] !max-w-[620px] flex-none rounded-[12px]"
  >
    <div className="px-6 pb-7 pt-5">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="mb-8 flex justify-end pr-1">
          <div className="inline-flex overflow-hidden rounded-[4px] border-2 border-black bg-white">
            <button
              type="button"
              onClick={() => handleUnitChange("in")}
              className={`min-w-[54px] px-3 py-1.5 text-[14px] font-medium leading-none transition ${
                unit === "in" ? "bg-black text-white" : "bg-white text-black"
              }`}
            >
              In
            </button>

            <button
              type="button"
              onClick={() => handleUnitChange("cm")}
              className={`min-w-[54px] border-l-2 border-black px-3 py-1.5 text-[14px] font-medium leading-none transition ${
                unit === "cm" ? "bg-black text-white" : "bg-white text-black"
              }`}
            >
              Cm
            </button>
          </div>
        </div>

        <div className="mt-1 space-y-8">
          <div className="grid grid-cols-[260px_120px_90px] items-center gap-x-4">
            <label className="text-[18px] font-normal leading-none text-black">
              Over Bust Measurement
            </label>

            <input
              type="number"
              step="0.1"
              min="0"
              value={overBust}
              onChange={(e) => setOverBust(e.target.value)}
              className="h-[44px] w-[120px] rounded-[4px] border border-[#cfcfcf] bg-white px-3 text-[16px] outline-none"
            />

            <span className="text-[16px] font-normal leading-none text-black">
              {unitLabel}
            </span>
          </div>

          <div className="grid grid-cols-[260px_120px_90px] items-center gap-x-4">
            <label className="text-[18px] font-normal leading-none text-black">
              Under Bust Measurement
            </label>

            <input
              type="number"
              step="0.1"
              min="0"
              value={underBust}
              onChange={(e) => setUnderBust(e.target.value)}
              className="h-[44px] w-[120px] rounded-[4px] border border-[#cfcfcf] bg-white px-3 text-[16px] outline-none"
            />

            <span className="text-[16px] font-normal leading-none text-black">
              {unitLabel}
            </span>
          </div>
        </div>

        {submitted && result?.ok === false && (
          <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-center text-[14px] leading-6 text-red-600">
            {result.message}
          </div>
        )}

        {submitted && result?.ok === true && (
          <div className="mt-5 rounded-md border border-green-200 bg-green-50 px-4 py-4 text-center">
            <p className="text-sm text-green-700">Your recommended size</p>
            <p className="mt-1 text-[28px] font-bold leading-none text-green-800">
              {result.size}
            </p>
            <p className="mt-2 text-[13px] text-green-700">
              Band: {result.band} | Cup: {result.cup}
            </p>
          </div>
        )}

        <div className="mt-9 flex justify-center">
          <button
            type="submit"
            className="h-[46px] min-w-[210px] rounded-[4px] bg-black px-8 text-[17px] font-semibold uppercase leading-none text-white transition hover:opacity-90"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  </ModalWrapper>
);
}