"use client";

import Link from "next/link";

function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function BlogCard({ post }) {
  if (!post) return null;

  return (
    <Link href={`/blog/${post.slug}`} className="group block rounded-[4px] bg-white">
      <div className="relative h-[240px] overflow-hidden rounded-[4px] sm:h-[260px] lg:h-[285px]">
        <img
          src={post.image}
          alt={post.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </div>

      <div className="px-1 pt-3 pb-2">
        <h3 className="line-clamp-2 font-[Playfair_Display] text-[19px] leading-snug text-[#2f2226] sm:text-[20px]">
          {post.title}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-[14px]">
          <span className="text-[#e56b8a]">{post.readTime || 4} min read</span>
          <span className="text-[#7f646a]">{formatDate(post.publishedAt)}</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-2">
          {(post.tags || []).slice(0, 2).map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className="text-[15px] text-[#e56b8a] underline underline-offset-4"
            >
              {tag}
            </span>
          ))}

          {post.categoryLabel ? (
            <span className="text-[15px] text-[#e56b8a] underline underline-offset-4">
              {post.categoryLabel}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}