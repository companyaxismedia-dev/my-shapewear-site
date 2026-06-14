"use client";

import { useMemo, useState } from "react";
import ModalWrapper from "./ModalWrapper";
import {
  ETHNIC_SIZE_ROWS_IN,
  ETHNIC_INTERNATIONAL_SIZE_ROWS,
  getSizeChartType,
} from "./sizeChartData";

// Convert a plain inch string like "32" to cm
function inToCm(val) {
  const n = parseFloat(val);
  if (isNaN(n)) return val;
  return Math.round(n * 2.54).toString();
}

function UnitToggle({ unit }) {
  return (
    <div className="flex items-center rounded-xl border border-[#e5c8d0] bg-white p-1 shadow-sm">
      <button
        type="button"
        onClick={() => unit.set("in")}
        className={`min-w-[56px] rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
          unit.value === "in"
            ? "bg-[#f4b9ca] text-white shadow-sm"
            : "text-[#6F5560] hover:bg-[#faf2f5]"
        }`}
      >
        In
      </button>
      <button
        type="button"
        onClick={() => unit.set("cm")}
        className={`min-w-[56px] rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
          unit.value === "cm"
            ? "bg-[#f4b9ca] text-white shadow-sm"
            : "text-[#6F5560] hover:bg-[#faf2f5]"
        }`}
      >
        Cm
      </button>
    </div>
  );
}

function EthnicChart({ unit, heading }) {
  const rows = useMemo(() => {
    if (unit.value === "in") return ETHNIC_SIZE_ROWS_IN;
    return ETHNIC_SIZE_ROWS_IN.map((row) => ({
      ...row,
      bust: inToCm(row.bust),
      waist: inToCm(row.waist),
      hip: inToCm(row.hip),
    }));
  }, [unit.value]);

  const internationalRows = useMemo(() => {
    if (unit.value === "in") return ETHNIC_INTERNATIONAL_SIZE_ROWS;
    return ETHNIC_INTERNATIONAL_SIZE_ROWS.map((row) => ({
      ...row,
      bust: inToCm(row.bust),
    }));
  }, [unit.value]);

  return (
    <>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-[#ead9de] bg-[#fdf6f8] px-4 py-3">
        <div>
          <h3 className="font-playfair text-xl font-semibold text-[#4A2E35] sm:text-2xl">
            {heading}
          </h3>
          <p className="mt-1 text-xs text-[#7a5b63] sm:text-sm">
            Use your bust, waist and hip measurements to find your perfect fit.
          </p>
        </div>
        <UnitToggle unit={unit} />
      </div>

      {/* Main size chart */}
      <div className="rounded-2xl border border-[#ead9de] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-center">
            <thead>
              <tr>
                <th
                  colSpan={4}
                  className="border border-[#d9d9d9] bg-white px-4 py-3 text-[16px] font-semibold text-[#4A2E35]"
                >
                  Size Chart ({unit.value === "in" ? "Inches" : "Centimeters"})
                </th>
              </tr>
              <tr>
                <th className="border border-[#d9d9d9] bg-[#f6dbe3] px-4 py-3 text-sm font-semibold text-[#4A2E35]">
                  Size
                </th>
                <th className="border border-[#d9d9d9] bg-[#dff2fb] px-4 py-3 text-sm font-semibold text-[#4A2E35]">
                  Bust
                </th>
                <th className="border border-[#d9d9d9] bg-[#dff2fb] px-4 py-3 text-sm font-semibold text-[#4A2E35]">
                  Waist
                </th>
                <th className="border border-[#d9d9d9] bg-[#dff2fb] px-4 py-3 text-sm font-semibold text-[#4A2E35]">
                  Hip
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.size} className="odd:bg-white even:bg-[#fffafc]">
                  <td className="border border-[#d9d9d9] bg-[#fdf1f5] px-4 py-3 text-[15px] font-semibold text-[#5A3C46]">
                    {row.size}
                  </td>
                  <td className="border border-[#d9d9d9] px-4 py-3 text-[15px] text-[#5A3C46]">
                    {row.bust}
                  </td>
                  <td className="border border-[#d9d9d9] px-4 py-3 text-[15px] text-[#5A3C46]">
                    {row.waist}
                  </td>
                  <td className="border border-[#d9d9d9] px-4 py-3 text-[15px] text-[#5A3C46]">
                    {row.hip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Measurement guide */}
      <div className="mt-5 rounded-2xl border border-[#d9eaf4] bg-[#eef7fc] px-4 py-4 text-sm text-[#5f4a51]">
        <p className="mb-1">
          <span className="font-semibold text-[#4A2E35]">Bust — </span>
          Measure around the fullest part of your bust. Keep the tape snug but not tight.
        </p>
        <p className="mb-1">
          <span className="font-semibold text-[#4A2E35]">Waist — </span>
          Measure around the slimmest part of your waist, just above the belly button.
        </p>
        <p>
          <span className="font-semibold text-[#4A2E35]">Hip — </span>
          Measure around the fullest part of your hips, keeping the tape flat and comfortable.
        </p>
      </div>

      {/* International size chart */}
      <div className="mt-8">
        <h3 className="mb-4 text-center font-playfair text-[22px] font-semibold uppercase text-[#4A2E35] sm:text-[26px]">
          International Size Chart
        </h3>

        <div className="overflow-x-auto rounded-2xl border border-[#ead9de] bg-white">
          <table className="w-full min-w-[700px] border-collapse text-center">
            <thead>
              <tr>
                <th className="border border-[#d9d9d9] bg-[#f6dbe3] px-4 py-3 text-sm font-semibold text-[#4A2E35]">
                  Size
                </th>
                <th className="border border-[#d9d9d9] bg-[#dff2fb] px-4 py-3 text-sm font-semibold text-[#4A2E35]">
                  Bust ({unit.value === "in" ? "In" : "Cm"})
                </th>
                <th className="border border-[#d9d9d9] bg-[#eef8fc] px-4 py-3 text-sm font-semibold text-[#4A2E35]">
                  India
                </th>
                <th className="border border-[#d9d9d9] bg-[#eef8fc] px-4 py-3 text-sm font-semibold text-[#4A2E35]">
                  US
                </th>
                <th className="border border-[#d9d9d9] bg-[#eef8fc] px-4 py-3 text-sm font-semibold text-[#4A2E35]">
                  UK
                </th>
                <th className="border border-[#d9d9d9] bg-[#eef8fc] px-4 py-3 text-sm font-semibold text-[#4A2E35]">
                  EU
                </th>
              </tr>
            </thead>
            <tbody>
              {internationalRows.map((row) => (
                <tr key={row.size} className="odd:bg-white even:bg-[#fffafc]">
                  <td className="border border-[#d9d9d9] bg-[#fdf1f5] px-4 py-3 text-[15px] font-semibold text-[#5A3C46]">
                    {row.size}
                  </td>
                  <td className="border border-[#d9d9d9] px-4 py-3 text-[15px] text-[#5A3C46]">
                    {row.bust}
                  </td>
                  <td className="border border-[#d9d9d9] px-4 py-3 text-[15px] text-[#5A3C46]">
                    {row.india}
                  </td>
                  <td className="border border-[#d9d9d9] px-4 py-3 text-[15px] text-[#5A3C46]">
                    {row.us}
                  </td>
                  <td className="border border-[#d9d9d9] px-4 py-3 text-[15px] text-[#5A3C46]">
                    {row.uk}
                  </td>
                  <td className="border border-[#d9d9d9] px-4 py-3 text-[15px] text-[#5A3C46]">
                    {row.eu}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default function SizeChartModal({ onClose, category = "suit" }) {
  const [unitValue, setUnitValue] = useState("in");
  const config = getSizeChartType(category);

  const unit = {
    value: unitValue,
    set: setUnitValue,
  };

  return (
    <ModalWrapper title="Find your Size" onClose={onClose}>
      <div className="custom-scroll max-h-[82vh] overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
        <EthnicChart unit={unit} heading={config.heading} />
      </div>
    </ModalWrapper>
  );
}