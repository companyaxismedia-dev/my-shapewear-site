"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ModalWrapper from "./ModalWrapper";
import {
  CUP_COLUMNS,
  BRA_SIZE_ROWS_IN,
  BRA_INTERNATIONAL_SIZE_ROWS_IN,
  PANTY_SIZE_ROWS_IN,
  PANTY_INTERNATIONAL_SIZE_ROWS_IN,
  TUMMY_CONTROL_SIZE_ROWS_IN,
  CURVY_SIZE_ROWS_IN,
  convertRangeToCm,
  getSizeChartType,
} from "./sizeChartData";

function BraChart({ unit, heading }) {
  const braSizeRows = useMemo(() => {
    if (unit === "in") return BRA_SIZE_ROWS_IN;

    return BRA_SIZE_ROWS_IN.map((row) => ({
      ...row,
      underbust: convertRangeToCm(row.underbust),
      cups: Object.fromEntries(
        Object.entries(row.cups).map(([cup, value]) => [
          cup,
          convertRangeToCm(value),
        ])
      ),
    }));
  }, [unit]);

  const internationalRows = useMemo(() => {
    if (unit === "in") return BRA_INTERNATIONAL_SIZE_ROWS_IN;

    return BRA_INTERNATIONAL_SIZE_ROWS_IN.map(
      ([underbust, overbust, size, us, uk, eu]) => [
        convertRangeToCm(underbust),
        convertRangeToCm(overbust),
        size,
        us,
        uk,
        eu,
      ]
    );
  }, [unit]);

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-[#ead9de] bg-[#fdf6f8] px-4 py-3">
        <div>
          <h3 className="font-playfair text-xl font-semibold text-[#4A2E35] sm:text-2xl">
            {heading}
          </h3>
          <p className="mt-1 text-xs text-[#7a5b63] sm:text-sm">
            Use your underbust and overbust measurements to find your perfect
            fit.
          </p>
        </div>

        <div className="flex items-center rounded-xl border border-[#e5c8d0] bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => unit.set("in")}
            className={`min-w-[52px] rounded-lg px-3 py-1.5 text-sm font-semibold transition ${unit.value === "in"
              ? "bg-[#d98096] text-white shadow-sm"
              : "text-[#7a5b63] hover:bg-[#f8edf1]"
              }`}
          >
            In
          </button>
          <button
            type="button"
            onClick={() => unit.set("cm")}
            className={`min-w-[52px] rounded-lg px-3 py-1.5 text-sm font-semibold transition ${unit.value === "cm"
              ? "bg-[#d98096] text-white shadow-sm"
              : "text-[#7a5b63] hover:bg-[#f8edf1]"
              }`}
          >
            Cm
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-[#ead9de] bg-white p-4">
          <div className="flex flex-row gap-4 sm:gap-5 lg:flex-col">
            <div className="flex-1 text-center">
              <div className="mx-auto mb-3 flex h-[132px] w-[132px] items-center justify-center overflow-hidden rounded-full border border-[#efd7dd] bg-[#fff8fa] sm:h-[150px] sm:w-[150px]">
                <img
                  src="/image/size.jpg"
                  alt="Overbust measurement"
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#5a3a42]">
                Overbust
              </p>
              <p className="mt-1 text-xs leading-5 text-[#7a5b63]">
                Measure around the fullest part of your bust.
              </p>
            </div>

            <div className="flex-1 text-center">
              <div className="mx-auto mb-3 flex h-[132px] w-[132px] items-center justify-center overflow-hidden rounded-full border border-[#efd7dd] bg-[#fff8fa] sm:h-[150px] sm:w-[150px]">
                <img
                  src="/image/size-1.jpg"
                  alt="Underbust measurement"
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#5a3a42]">
                Underbust
              </p>
              <p className="mt-1 text-xs leading-5 text-[#7a5b63]">
                Measure around your ribcage, just under your bust.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#ead9de] bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full border-collapse text-center">
              <thead>
                <tr>
                  <th
                    rowSpan={2}
                    className="border border-[#e8d4da] bg-[#f6dbe3] px-3 py-3 text-xs font-semibold text-[#5a3a42] sm:text-sm"
                  >
                    Band Size
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-[#e8d4da] bg-[#f9f2f4] px-3 py-3 text-xs font-semibold text-[#5a3a42] sm:text-sm"
                  >
                    To Fit Underbust
                    <br />
                    <span className="text-[11px] font-medium text-[#8b6a73]">
                      ({unit.value === "in" ? "Inches" : "CM"})
                    </span>
                  </th>
                  <th
                    colSpan={6}
                    className="border border-[#e8d4da] bg-[#dff2fb] px-3 py-3 text-xs font-semibold text-[#5a3a42] sm:text-sm"
                  >
                    To Fit Over Bust ({unit.value === "in" ? "Inch" : "CM"})
                  </th>
                </tr>
                <tr>
                  {CUP_COLUMNS.map((cup) => (
                    <th
                      key={cup}
                      className="border border-[#e8d4da] bg-[#dff2fb] px-3 py-3 text-xs font-semibold text-[#5a3a42] sm:text-sm"
                    >
                      Cup {cup}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {braSizeRows.map((row) => (
                  <tr key={row.band} className="odd:bg-white even:bg-[#fffafc]">
                    <td className="border border-[#e8d4da] bg-[#f9edf1] px-3 py-3 text-sm font-semibold text-[#6b4650]">
                      {row.band}
                    </td>
                    <td className="border border-[#e8d4da] px-3 py-3 text-sm text-[#6b4650]">
                      {row.underbust}
                    </td>

                    {CUP_COLUMNS.map((cup) => (
                      <td
                        key={`${row.band}-${cup}`}
                        className="border border-[#e8d4da] px-3 py-3 text-sm text-[#6b4650]"
                      >
                        {row.cups[cup] || "—"}
                      </td>
                    ))}
                  </tr>
                ))}

                <tr>
                  <td className="border border-[#e8d4da] bg-[#f9edf1] px-3 py-3 text-sm font-semibold text-[#6b4650]">
                    Free Size
                  </td>
                  <td
                    colSpan={7}
                    className="border border-[#e8d4da] bg-[#eef8fc] px-4 py-3 text-left text-sm text-[#6b4650]"
                  >
                    Our free size products are generally stretch-friendly and
                    can fit well on body sizes S to L depending on style and
                    fabric.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-[#d9eaf4] bg-[#eef7fc] px-4 py-4 text-sm text-[#5f4a51]">
        <p className="mb-1">
          <span className="font-semibold text-[#4A2E35]">Over Bust:</span> With
          a tape measure, measure around the fullest part of your bust. Keep the
          tape snug but not tight.
        </p>
        <p>
          <span className="font-semibold text-[#4A2E35]">Under Bust:</span>
          Measure around the flat part right under your bust. The tape should
          sit straight and comfortable.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-[#ead9de] bg-white p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-playfair text-xl font-semibold text-[#4A2E35] sm:text-2xl">
            International Size Chart
          </h3>
          <span className="rounded-full bg-[#fdf1f5] px-3 py-1 text-xs font-medium text-[#9b6573]">
            {unit.value === "in" ? "Inches" : "Centimeters"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full border-collapse text-center">
            <thead>
              <tr>
                <th className="border border-[#e8d4da] bg-[#eef8fc] px-3 py-3 text-xs font-semibold text-[#5a3a42] sm:text-sm">
                  Underbust
                </th>
                <th className="border border-[#e8d4da] bg-[#eef8fc] px-3 py-3 text-xs font-semibold text-[#5a3a42] sm:text-sm">
                  Overbust
                </th>
                <th className="border border-[#e8d4da] bg-[#f6dbe3] px-3 py-3 text-xs font-semibold text-[#5a3a42] sm:text-sm">
                  Size
                </th>
                <th className="border border-[#e8d4da] bg-[#f9f2f4] px-3 py-3 text-xs font-semibold text-[#5a3a42] sm:text-sm">
                  US Size
                </th>
                <th className="border border-[#e8d4da] bg-[#f9f2f4] px-3 py-3 text-xs font-semibold text-[#5a3a42] sm:text-sm">
                  UK Size
                </th>
                <th className="border border-[#e8d4da] bg-[#f9f2f4] px-3 py-3 text-xs font-semibold text-[#5a3a42] sm:text-sm">
                  EU Size
                </th>
              </tr>
            </thead>

            <tbody>
              {internationalRows.map((row, index) => (
                <tr key={`${row[2]}-${index}`} className="odd:bg-white even:bg-[#fffafc]">
                  {row.map((col, i) => (
                    <td
                      key={`${row[2]}-${i}`}
                      className={`border border-[#e8d4da] px-3 py-3 text-sm text-[#6b4650] ${i === 2 ? "bg-[#fbecf1] font-semibold text-[#5a3a42]" : ""
                        }`}
                    >
                      {col}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 text-center">
          <Link
            href="/bra-size-calculator"
            className="inline-flex items-center justify-center rounded-xl bg-[#d94f8a] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c43e78]"
          >
            View More
          </Link>
        </div>
      </div>
    </>
  );
}

function PantyChart({ unit, heading }) {
  const pantyRows = useMemo(() => {
    if (unit.value === "in") return PANTY_SIZE_ROWS_IN;

    return PANTY_SIZE_ROWS_IN.map((row) => ({
      ...row,
      hip: convertRangeToCm(row.hip, true),
    }));
  }, [unit.value]);

  const internationalRows = useMemo(() => {
    if (unit.value === "in") return PANTY_INTERNATIONAL_SIZE_ROWS_IN;

    return PANTY_INTERNATIONAL_SIZE_ROWS_IN.map((row) => ({
      ...row,
      hip: convertRangeToCm(row.hip, true),
    }));
  }, [unit.value]);

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-[#d6edf7] bg-[#dff2fb] px-4 py-3">
        <h3 className="font-playfair text-[20px] font-semibold text-[#4A2E35] sm:text-[26px]">
          {heading}
        </h3>

        <div className="flex items-center rounded-xl border border-[#e5c8d0] bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => unit.set("in")}
            className={`min-w-[56px] rounded-lg px-3 py-1.5 text-sm font-semibold transition ${unit.value === "in"
              ? "bg-[#f4b9ca] text-white shadow-sm"
              : "text-[#6F5560] hover:bg-[#faf2f5]"
              }`}
          >
            In
          </button>

          <button
            type="button"
            onClick={() => unit.set("cm")}
            className={`min-w-[56px] rounded-lg px-3 py-1.5 text-sm font-semibold transition ${unit.value === "cm"
              ? "bg-[#f4b9ca] text-white shadow-sm"
              : "text-[#6F5560] hover:bg-[#faf2f5]"
              }`}
          >
            Cm
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-[#ead9de] bg-white p-5">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-[170px] w-[170px] items-center justify-center overflow-hidden rounded-full border border-[#efd7dd] bg-[#fff8fa]">
              <img
                src="/hero-image/panty-size.jpg"
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

        <div className="rounded-2xl border border-[#ead9de] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-center">
              <thead>
                <tr>
                  <th
                    colSpan={2}
                    className="border border-[#d9d9d9] bg-white px-4 py-3 text-[16px] font-semibold text-[#4A2E35]"
                  >
                    Size Chart In ({unit.value === "in" ? "INCH" : "CM"})
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

      <div className="mt-5 rounded-2xl border border-[#d6edf7] bg-[#dff2fb] px-4 py-4 text-sm text-[#5A3C46]">
        <p>
          <span className="font-semibold">Hip - </span>
          With a tape measure around the fullest part of your hips. The tape
          should be flat against your body but not too tight.
        </p>
      </div>

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
                <tr key={row.clovia} className="odd:bg-white even:bg-[#fffafc]">
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
    </>
  );
}

function TummyControlChart({ unit, heading }) {
  const tummyRows = useMemo(() => {
    if (unit.value === "in") return TUMMY_CONTROL_SIZE_ROWS_IN;

    return TUMMY_CONTROL_SIZE_ROWS_IN.map((row) => ({
      ...row,
      chest: convertRangeToCm(row.chest, true),
      waist: convertRangeToCm(row.waist, true),
      hip: convertRangeToCm(row.hip, true),
    }));
  }, [unit.value]);

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-[#d6edf7] bg-[#dff2fb] px-4 py-3">
        <h3 className="font-playfair text-[20px] font-semibold text-[#4A2E35] sm:text-[26px]">
          {heading}
        </h3>

        <div className="flex items-center rounded-xl border border-[#e5c8d0] bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => unit.set("in")}
            className={`min-w-[56px] rounded-lg px-3 py-1.5 text-sm font-semibold transition ${unit.value === "in"
              ? "bg-[#f4b9ca] text-white shadow-sm"
              : "text-[#6F5560] hover:bg-[#faf2f5]"
              }`}
          >
            In
          </button>

          <button
            type="button"
            onClick={() => unit.set("cm")}
            className={`min-w-[56px] rounded-lg px-3 py-1.5 text-sm font-semibold transition ${unit.value === "cm"
              ? "bg-[#f4b9ca] text-white shadow-sm"
              : "text-[#6F5560] hover:bg-[#faf2f5]"
              }`}
          >
            Cm
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* LEFT IMAGE */}
        <div className="rounded-2xl border border-[#ead9de] bg-white p-5">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-[300px] w-full items-center justify-center overflow-hidden rounded-2xl border border-[#efd7dd] bg-[#fff8fa]">
              <img
                src="/hero-image/shapewere-size.jpg"
                alt="Tummy control body measurement guide"
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="rounded-2xl border border-[#ead9de] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-center">
              <thead>
                <tr>
                  <th
                    colSpan={4}
                    className="border border-[#d9d9d9] bg-white px-4 py-3 text-[18px] font-semibold text-[#4A2E35]"
                  >
                    Size Chart In ({unit.value === "in" ? "INCH" : "CM"})
                  </th>
                </tr>
                <tr>
                  <th className="border border-[#d9d9d9] bg-[#f6dbe3] px-4 py-3 text-sm font-semibold text-[#4A2E35]">
                    Size
                  </th>
                  <th className="border border-[#d9d9d9] bg-[#dff2fb] px-4 py-3 text-sm font-semibold text-[#4A2E35]">
                    To Fit Chest
                  </th>
                  <th className="border border-[#d9d9d9] bg-[#dff2fb] px-4 py-3 text-sm font-semibold text-[#4A2E35]">
                    To Fit Waist
                  </th>
                  <th className="border border-[#d9d9d9] bg-[#dff2fb] px-4 py-3 text-sm font-semibold text-[#4A2E35]">
                    To Fit Hip
                  </th>
                </tr>
              </thead>

              <tbody>
                {tummyRows.map((row) => (
                  <tr key={row.size} className="odd:bg-white even:bg-[#fffafc]">
                    <td className="border border-[#d9d9d9] bg-[#fdf1f5] px-4 py-3 text-[15px] font-medium text-[#5A3C46]">
                      {row.size}
                    </td>
                    <td className="border border-[#d9d9d9] px-4 py-3 text-[15px] font-medium text-[#5A3C46]">
                      {row.chest}
                    </td>
                    <td className="border border-[#d9d9d9] px-4 py-3 text-[15px] font-medium text-[#5A3C46]">
                      {row.waist}
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
                  <td
                    colSpan={3}
                    className="border border-[#d9d9d9] bg-[#eef7fc] px-4 py-3 text-left text-[15px] leading-6 text-[#5A3C46]"
                  >
                    Our free size products are made of knitted material and can
                    fit well on bodies from sizes S to L.
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
          <span className="font-semibold">Chest - </span>
          Measure the fullest part around your bust. The tape should lay flat
          on your body.
        </p>
        <p className="mt-2">
          <span className="font-semibold">Waist - </span>
          Measure the slimmest part of your waist, right above the belly button.
        </p>
        <p className="mt-2">
          <span className="font-semibold">Hip - </span>
          Measure the fullest part of your hips without making it too tight.
        </p>
      </div>
    </>
  );
}

function CurvyChart({ unit, heading }) {
  const rows = useMemo(() => {
    if (unit.value === "in") return CURVY_SIZE_ROWS_IN;

    return CURVY_SIZE_ROWS_IN.map((row) => ({
      ...row,
      chest: convertRangeToCm(row.chest, true),
      waist: convertRangeToCm(row.waist, true),
      hip: convertRangeToCm(row.hip, true),
    }));
  }, [unit.value]);

  return (
    <>
      <div className="mb-5 flex items-center justify-between rounded-2xl border bg-[#f3e8ff] px-4 py-3">
        <h3 className="font-playfair text-[22px] font-semibold text-[#4A2E35]">
          {heading}
        </h3>

        <div className="flex border rounded bg-white p-1">
          <button
            onClick={() => unit.set("in")}
            className={`px-3 py-1 ${unit.value === "in" ? "bg-purple-400 text-white" : ""
              }`}
          >
            In
          </button>
          <button
            onClick={() => unit.set("cm")}
            className={`px-3 py-1 ${unit.value === "cm" ? "bg-purple-400 text-white" : ""
              }`}
          >
            Cm
          </button>
        </div>
      </div>

      <table className="w-full border text-center">
        <thead>
          <tr>
            <th className="border p-2">Size</th>
            <th className="border p-2">Chest</th>
            <th className="border p-2">Waist</th>
            <th className="border p-2">Hip</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.size}>
              <td className="border p-2">{row.size}</td>
              <td className="border p-2">{row.chest}</td>
              <td className="border p-2">{row.waist}</td>
              <td className="border p-2">{row.hip}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default function SizeChartModal({ onClose, category = "bra" }) {
  const [unitValue, setUnitValue] = useState("in");
  const config = getSizeChartType(category);

  const unit = {
    value: unitValue,
    set: setUnitValue,
  };

  return (
    <ModalWrapper title="Find your Size" onClose={onClose}>
      <div className="custom-scroll max-h-[82vh] overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
        {config.type === "panty" ? (
          <PantyChart unit={unit} heading={config.heading} />
        ) : config.type === "tummy-control" ? (
          <TummyControlChart unit={unit} heading={config.heading} />
        ) : config.type === "curvy" ? (
          <CurvyChart unit={unit} heading={config.heading} />
        ) : (
          <BraChart unit={unit} heading={config.heading} />
        )}
      </div>
    </ModalWrapper>
  );
}