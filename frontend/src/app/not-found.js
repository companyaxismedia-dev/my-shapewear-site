"use client";

import NotFoundPage from "./Not-Found/page";
import { useEffect,useState } from "react";

export default function NotFound() {
  const [isAdminPage, setIsAdminPage] = useState(false);
  useEffect(() => {
    if(typeof window !== "undefined") {
      setIsAdminPage(window.location.pathname.startsWith("/admin"));
    }
  } , []);
  return <NotFoundPage isAdminPage={isAdminPage} />;
}
