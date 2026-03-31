"use client";

import Image from "next/image";
import Link from "next/link";

const navItems = [
  { label: "LINGERIE", href: "/lingerie" },
  { label: "WOMEN'S WEAR", href: "/new-arrivals" },
  { label: "SHAPEWEAR", href: "/shapewear" },
  { label: "GIFTS", href: "/gift-card" },
];

const quickActions = [
  { label: "RETURN HOME", href: "/" },
  { label: "SHOP NEW ARRIVALS", href: "/new-arrivals" },
];

export default function NotFoundPage({ isAdminPage = false }) {
  const primaryHref = isAdminPage ? "/admin" : "/";

  const actionButtons = (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href={primaryHref}
        className="inline-flex min-h-[44px] items-center justify-center rounded-full px-5 py-2.5 text-[11px] font-bold tracking-[0.02em] text-white transition sm:min-h-[50px] sm:px-7 sm:text-[14px]"
        style={{
          background: "var(--color-primary)",
          fontFamily: "var(--font-body)",
        }}
      >
        {isAdminPage ? "RETURN ADMIN" : "RETURN HOME"}
      </Link>

      {!isAdminPage && (
        <>
          <Link
            href="/new-arrivals"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#5d8b8f] px-5 py-2.5 text-[11px] font-bold tracking-[0.02em] text-white transition hover:brightness-[1.04] sm:min-h-[50px] sm:px-7 sm:text-[14px]"
          >
            SHOP NEW ARRIVALS
          </Link>
        </>
      )}
    </div>
  );

  return (
    <div
      className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#fff7f4_0%,#fffaf8_42%,#fff7f3_100%)]"
      style={{ fontFamily: "var(--font-body)" }}
    >
      <main className="relative mx-auto max-w-[1320px] px-4 py-4 sm:px-6 sm:py-6 md:min-h-screen md:px-8 md:py-8">
        <div className="pointer-events-none absolute -left-16 top-14 h-28 w-28 rounded-full border-[10px] border-[#f1d4ce] opacity-80 sm:h-40 sm:w-40" />
        <div className="pointer-events-none absolute -right-12 bottom-10 h-36 w-36 rounded-full border-[12px] border-[#f3ddd6] opacity-75 sm:h-48 sm:w-48" />
        <div className="pointer-events-none absolute left-8 top-16 h-8 w-8 rounded-full border-2 border-[#ddb6ae] bg-[#f7ddd5] opacity-60" />
        <div className="pointer-events-none absolute right-8 top-20 h-8 w-8 rounded-full border-2 border-[#ddb6ae] bg-[#f7ddd5] opacity-60" />

        <div className="md:hidden">

          <div className="flex items-start gap-4">
            <div className="w-[43%] shrink-0 pt-1">
              <div className="] bg-[linear-gradient(180deg,#fff7f4_0%,#fffaf8_42%,#fff7f3_100%)]">
              <Image
                src="/image/notfound.png"
                alt="404 not found"
                width={320}
                height={320}
                className="h-auto w-full max-w-[180px] object-contain mix-blend-multiply"
                priority
              />
              </div>
            </div>

            <div className="min-w-0 flex-1 pt-2">
              <p className="text-[9px] tracking-[0.28em] text-[#2f2528]">
                DIDN&apos;T FIND WHAT YOU WERE
              </p>

              <h1
                className="mt-2 text-[24px] leading-[0.94] text-[#5a3943]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                LOOKING FOR?
              </h1>

              <p className="mt-2 text-[11px] font-semibold uppercase leading-4 text-[#201b1c]">
                Looks Like We&apos;ve Lost Track Of That Look!
              </p>

              <p className="mt-2 text-[11px] leading-[1.35] text-[#2e2a2c]">
                Sorry, we can&apos;t find the page you&apos;re searching for.
                It seems to have slipped off the rack. Let&apos;s get you back
                to looking your best.
              </p>
            </div>
          </div>

          <div className="mt-4 pl-[calc(43%+16px)]">
            {actionButtons}
          </div>
        </div>

        <div className="hidden md:grid md:min-h-[calc(100vh-64px)] md:grid-cols-[0.98fr_0.92fr] md:items-center md:gap-4 lg:gap-8">
          <div className="relative flex min-h-[420px] items-center justify-center lg:min-h-[520px]">
            <div className="absolute inset-x-8 bottom-10 top-14 rounded-full bg-[radial-gradient(circle,#f7dfd8_0%,#f9ebe6_42%,transparent_72%)] opacity-80" />
            <div className="relative z-10 bg-[linear-gradient(180deg,#fff7f4_0%,#fffaf8_42%,#fff7f3_100%)]">
              <Image
                src="/image/notfound.png"
                alt="404 not found"
                width={760}
                height={760}
                className="h-auto w-full max-w-[610px] object-contain mix-blend-multiply lg:max-w-[700px]"
                priority
              />
            </div>
          </div>

          <div className="relative z-10 max-w-[520px]">
            <div
              className="text-[96px] font-bold leading-[0.84] tracking-[-0.08em] text-transparent lg:text-[132px]"
              style={{
                fontFamily: "var(--font-display)",
                backgroundImage:
                  "linear-gradient(135deg,#f0c8c1 0%,#4c7f82 38%,#f3d4cb 78%,#f8ede7 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                textShadow: "2px 2px 0 rgba(38,28,31,0.18)",
              }}
            >
              404
            </div>

            <h1 className="mt-1 text-[44px] font-black uppercase leading-[0.92] text-[#201b1c] lg:text-[56px]">
              PAGE NOT FOUND
            </h1>

            <p className="mt-5 text-[22px] font-black uppercase leading-tight text-[#201b1c] lg:text-[26px]">
              LOOKS LIKE WE&apos;VE LOST TRACK OF THAT LOOK!
            </p>

            <p className="mt-3 text-[17px] leading-[1.45] text-[#2b2728] lg:text-[19px]">
              Sorry, we can&apos;t find the page you&apos;re searching for.
              <br />
              It seems to have slipped off the rack.
              <br />
              Let&apos;s get you back to looking your best.
            </p>

            <div className="mt-8">{actionButtons}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
