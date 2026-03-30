"use client";

import { usePathname } from "next/navigation";
import NotFoundPage from "./Not-Found/page";

export default function NotFound() {
  const pathname  = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");
  return <NotFoundPage isAdminPage={isAdminPage} />;
}
