import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function EmptyCart() {
  return (
    <div className="min-h-screen bg-white text-[#4a2e35]">
      <div className="lg:hidden">

        <div className="mx-auto flex min-h-[calc(100vh-144px)] max-w-[420px] flex-col items-center justify-center px-6 pb-12 pt-5 text-center">
          <img
            src="/cartimage.png"
            alt="Empty cart"
            className="w-[248px] max-w-full"
          />

          <h2 className="mt-8 text-[25px] font-semibold leading-tight text-[#4a2e35]">
            Your Cart Is Empty
          </h2>
          <p className="mt-2 max-w-[250px] text-[17px] leading-7 text-[#8c7480]">
            Looks like you haven&apos;t added anything to your cart yet
          </p>

          <Link
            href="/"
            className="mt-7 inline-flex min-h-[50px] items-center justify-center rounded-[14px] bg-[#c56f7f] px-8 text-[18px] font-medium text-white shadow-[0_7px_14px_rgba(197,111,127,0.28)] transition hover:bg-[#b45e6f]"
          >
            Start Shopping
          </Link>
        </div>
      </div>

      <div className="hidden lg:block">
        <div className="mx-auto flex min-h-[calc(100vh-112px)] max-w-5xl items-center justify-center px-6 py-16">
            <div className="flex justify-center">
              <img
                src="/cartimage.png"
                alt="Empty cart"
                className="w-[360px] max-w-full"
              />
            </div>

            <div className="text-left">
              <h2 className="mt-4 text-5xl font-semibold leading-[1.04] text-[#4a2e35]">
                Your Cart Is Empty
              </h2>
              <p className="mt-4 max-w-md text-lg leading-8 text-[#8c7480]">
                Looks like you haven&apos;t added anything to your cart yet. Explore the collection and pick your next favorite essentials.
              </p>

              <div className="mt-8 flex items-center gap-4">
                <Link
                  href="/"
                  className="inline-flex min-h-[54px] items-center justify-center rounded-[16px] bg-[#c56f7f] px-8 text-base font-semibold text-white shadow-[0_10px_22px_rgba(197,111,127,0.24)] transition hover:bg-[#b45e6f]"
                >
                  Start Shopping
                </Link>

                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="inline-flex min-h-[54px] items-center justify-center rounded-[16px] border border-[#ead7dd] bg-white px-8 text-base font-semibold text-[#c56f7f] transition hover:bg-[#fff5f7]"
                >
                  Go Back
                </button>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
