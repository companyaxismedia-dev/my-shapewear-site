"use client";

import Link from "next/link";
import BlogCard from "./BlogCard";

export default function BlogSectionGrid({
  title,
  posts = [],
  viewAllLink = "/blog",
  columns = 4,
}) {
  if (!posts?.length) return null;

  const gridClass =
    columns === 2
      ? "grid grid-cols-1 gap-6 lg:grid-cols-2"
      : "grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4";

  return (
    <section className="mx-auto max-w-[1540px] px-4 py-4 lg:px-6">
      <div className="mb-4 flex items-end justify-between border-b border-[#ded2d6] pb-3">
        <h2 className="font-[Playfair_Display] text-[24px] font-semibold text-[#2f2226] sm:text-[28px]">
          {title}
        </h2>

        <Link
          href={viewAllLink}
          className="text-[16px] text-[#2f2226] transition hover:text-[#c56f7f]"
        >
          View All
        </Link>
      </div>

      <div className={gridClass}>
        {posts.map((post) => (
          <BlogCard key={post._id} post={post} />
        ))}
      </div>
    </section>
  );
}