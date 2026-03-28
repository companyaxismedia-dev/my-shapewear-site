"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const formatSegmentLabel = (segment = "") =>
    decodeURIComponent(segment)
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

export function getCategoryTrail(pathname, fallbackLabel) {
    const segments = pathname.split("/").filter(Boolean);
    const crumbs = [{ label: "Home", href: "/" }];

    let currentPath = "";
    segments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        const isLast = index === segments.length - 1;
        crumbs.push({
            label: isLast && fallbackLabel ? fallbackLabel : formatSegmentLabel(segment),
            href: isLast ? null : currentPath,
        });
    });

    if (crumbs.length === 1 && fallbackLabel) {
        crumbs.push({ label: fallbackLabel, href: null });
    }

    return crumbs;
}

export default function CategoryBreadcrumb({ currentLabel, totalItems = 0, mobile = false }) {
    const pathname = usePathname();
    const crumbs = getCategoryTrail(pathname, currentLabel);
    const activeLabel = crumbs[crumbs.length - 1]?.label || currentLabel || "Category";
    const productText = `${Number(totalItems || 0).toLocaleString()} products`;

    if (mobile) {
        return (
            <div className="category-mobile-heading">
                <h1>{activeLabel}
                <span>({productText})</span></h1>
            </div>
        );
    }

    return (
        <div className="category-page-intro">
            <nav className="category-page-crumbs" aria-label="Breadcrumb">
                {crumbs.map((crumb, index) => (
                    <React.Fragment key={`${crumb.label}-${index}`}>
                        {crumb.href ? (
                            <Link href={crumb.href}>{crumb.label}</Link>
                        ) : (
                            <span aria-current="page">{crumb.label}</span>
                        )}
                        {index < crumbs.length - 1 ? <span className="category-page-crumb-sep">/</span> : null}
                    </React.Fragment>
                ))}
            </nav>
            <div className="category-page-heading-block">
                <h1>{activeLabel}</h1>
                <span>({productText})</span>
            </div>
        </div>
    );
}
