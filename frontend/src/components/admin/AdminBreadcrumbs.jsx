"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function AdminBreadcrumbs({ items = [], mode }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-1.5">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-primary transition-colors duration-200"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={
                  isLast
                    ? "text-primary font-medium"
                    : "cursor-default"
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
          <span className="text-primary font-medium">
            {mode === "edit" ? "Edit Product" : "Add New Product"}
          </span>
        </>
      )}
    </nav>
  );
}