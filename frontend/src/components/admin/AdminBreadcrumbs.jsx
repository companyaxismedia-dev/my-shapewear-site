"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function AdminBreadcrumbs({ items = [], mode="default" }) {
  return (
    <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex min-w-0 items-center gap-1.5">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="truncate hover:text-primary transition-colors duration-200"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={
                  isLast
                    ? "truncate text-primary font-medium"
                    : "cursor-default truncate"
                }
              >
                {item.label}
              </span>
            )}

            {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
          </div>
        );
      })}

      {/* Optional Mode */}
      {mode && (
        <>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="truncate text-primary font-medium">
            {mode === "edit" ? "Edit Product" : "Add New Product"}
          </span>
        </>
      )}
    </nav>
  );
}
