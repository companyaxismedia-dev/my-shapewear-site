import Link from "next/link";
import Navbar from "@/components/Navbar";
import BlogCard from "@/components/blog/BlogCard";
import { Search } from "lucide-react";
import { apiRequest } from "@/lib/api";

function formatTitle(value) {
  if (!value) return "";
  return value
    .split("-")
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(" ");
}

function normalizeValue(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/\s+/g, "-");
}

async function getBlogPageData() {
  try {
    return await apiRequest("/api/blog");
  } catch (error) {
    console.error("BLOG PAGE FETCH ERROR:", error);
    return null;
  }
}

async function getSectionBlogs(section) {
  try {
    return await apiRequest(`/api/blog/section/${section}`);
  } catch (error) {
    console.error("SECTION BLOGS FETCH ERROR:", error);
    return null;
  }
}

function resolveSectionPosts(page, sectionParam) {
  const normalizedSection = normalizeValue(sectionParam);

  if (normalizedSection === "recent-posts") {
    return {
      title: "Recent Posts",
      blogs: page?.recentPosts || [],
    };
  }

  if (normalizedSection === "most-popular") {
    return {
      title: "Most Popular Posts",
      blogs: page?.popularPosts || [],
    };
  }

  const matchedSection =
    (page?.sections || []).find((section) => {
      const keyMatch = normalizeValue(section?.key) === normalizedSection;
      const slugMatch = normalizeValue(section?.slug) === normalizedSection;
      const titleMatch = normalizeValue(section?.title) === normalizedSection;
      const viewAllMatch =
        normalizeValue(section?.viewAllLink?.split("/").pop()) === normalizedSection;

      return keyMatch || slugMatch || titleMatch || viewAllMatch;
    }) || null;

  if (matchedSection) {
    return {
      title: matchedSection.title || formatTitle(sectionParam),
      blogs: matchedSection.posts || [],
    };
  }

  return {
    title: formatTitle(sectionParam),
    blogs: [],
  };
}

export async function generateMetadata({ params }) {
  const { section } = await params;
  const sectionTitle = formatTitle(section);

  return {
    title: `${sectionTitle} | Blog | Glovia Glamour`,
    description: `Explore ${sectionTitle} articles from Glovia Glamour blog.`,
  };
}

export default async function BlogSectionPage({ params }) {
  const { section } = await params;
  const sectionParam = section;

  const pageData = await getBlogPageData();
  const page = pageData?.page || {};

  let { title, blogs } = resolveSectionPosts(page, sectionParam);

  if (!blogs?.length) {
    const sectionData = await getSectionBlogs(sectionParam);
    if (sectionData?.blogs?.length) {
      blogs = sectionData.blogs;
      title = sectionData.title || title;
    }
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f8f4f5]">
        <section className="mx-auto max-w-[1540px] px-4 py-6 lg:px-6">
          <div className="mb-3 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 text-[14px] text-[#8b6f76]">
                <Link href="/blog" className="hover:text-[#c56f7f]">
                  Magazine
                </Link>
                <span className="mx-1">»</span>
                <span>{title}</span>
              </div>

              <h1 className="font-[Playfair_Display] text-[30px] font-semibold text-[#2f2226] sm:text-[38px]">
                {title}
              </h1>
            </div>

            <div className="w-full lg:w-[360px] xl:w-[420px]">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search the Magazine"
                  className="h-[54px] w-full rounded-full border border-[#ddd2d5] bg-white pl-6 pr-14 text-[15px] text-[#2f2226] shadow-sm outline-none placeholder:text-[#7b6d71]"
                />
                <Search
                  size={20}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-[#8b7a80]"
                />
              </div>
            </div>
          </div>

          <div className="mb-7 h-[1px] w-full bg-[#ded2d6]" />

          {blogs?.length ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2">
              {blogs.map((post) => (
                <BlogCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <div className="rounded-[12px] border border-[#ead9de] bg-white p-10 text-center">
              <h2 className="font-[Playfair_Display] text-[28px] text-[#3b2228]">
                No posts found
              </h2>
              <p className="mt-3 text-[#6c4e53]">
                Is section me abhi koi published blog nahi mila.
              </p>
            </div>
          )}
        </section>
      </main>
    </>
  );
}