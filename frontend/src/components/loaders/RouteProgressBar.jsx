"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const isSameOriginNavigableLink = (anchor) => {
  if (!anchor) return false;
  const href = anchor.getAttribute("href");

  if (!href || href.startsWith("#")) return false;
  if (anchor.target === "_blank" || anchor.hasAttribute("download")) return false;

  try {
    const url = new URL(href, window.location.href);
    return url.origin === window.location.origin;
  } catch {
    return false;
  }
};

export default function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const clear = () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    const start = () => {
      clear();
      setVisible(true);
      setProgress(12);

      timerRef.current = window.setInterval(() => {
        setProgress((value) => (value >= 82 ? value : value + Math.max(2, (90 - value) / 6)));
      }, 160);
    };

    const handleDocumentClick = (event) => {
      const anchor = event.target.closest("a");
      if (!isSameOriginNavigableLink(anchor)) return;
      start();
    };

    const handlePopState = () => {
      start();
    };

    document.addEventListener("click", handleDocumentClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      clear();
      document.removeEventListener("click", handleDocumentClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;

    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setProgress(100);
    const timeout = window.setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 220);

    return () => window.clearTimeout(timeout);
  }, [pathname, searchParams, visible]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[999] h-[3px] overflow-hidden">
      <div
        className="h-full origin-left transition-[width,opacity] duration-200 ease-out"
        style={{
          width: `${progress}%`,
          background: "linear-gradient(90deg, #c56f7f 0%, #f19ab0 100%)",
          boxShadow: "0 0 12px rgba(197,111,127,0.55)",
        }}
      />
    </div>
  );
}
