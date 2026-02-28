"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import "./admin.css";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // allow auth pages
    if (pathname.startsWith("/admin/auth")) return;

    const token = localStorage.getItem("adminToken");

    // ONLY check token (NOT role)
    if (!token) {
      router.push("/admin/auth");
    }
  }, [pathname]);

  return <>{children}</>;
}