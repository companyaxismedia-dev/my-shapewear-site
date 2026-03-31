"use client";

import { Toaster } from "sonner";
import { InlineSpinner } from "@/components/loaders/Loaders";
import { useAuth } from "@/context/AuthContext";

export function ToasterProvider() {
  return (
    <Toaster
      position="bottom-center"
      richColors
      closeButton
      theme="light"
    />
  );
}

export function AuthTransitionOverlay() {
  const { pendingAuthAction } = useAuth();

  if (!pendingAuthAction) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(74,46,53,0.18)] backdrop-blur-sm">
      <div className="mx-4 flex min-w-[220px] items-center gap-3 rounded-[22px] border border-[#ead7dd] bg-[linear-gradient(180deg,#fffdfd_0%,#fff8fa_100%)] px-5 py-4 shadow-[0_24px_60px_rgba(74,46,53,0.16)]">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff0f4] text-[#c56f7f]">
          <InlineSpinner className="h-5 w-5" />
        </span>
        <div className="space-y-1">
          <p
            className="text-sm font-semibold text-[#4a2e35]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Please wait
          </p>
          <p className="text-sm text-[#7f666d]">{pendingAuthAction}</p>
        </div>
      </div>
    </div>
  );
}
