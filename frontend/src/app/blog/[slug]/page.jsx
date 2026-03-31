import Link from "next/link";
import Navbar from "@/components/Navbar";
import BlogCard from "@/components/blog/BlogCard";
import { Search } from "lucide-react";
import { apiRequest } from "@/lib/api";

async function getBlogDetails(slug) {
  try {
    return await apiRequest(`/api/blog/${slug}`);
  } catch (error) {
    console.error("BLOG DETAILS FETCH ERROR:", error);
    return null;
  }
}

async function getCategoryBlogs(category) {
  try {
    return await apiRequest(`/api/blog/category/${category}`);
  } catch (error) {
    console.error("CATEGORY BLOGS FETCH ERROR:", error);
    return null;
  }
}

async function getBlogLandingPageData() {
  try {
    return await apiRequest("/api/blog");
  } catch (error) {
    console.error("BLOG LANDING FETCH ERROR:", error);
    return null;
  }
}

function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTitle(value) {
  if (!value) return "";
  return value
    .split("-")
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await getBlogDetails(slug);
  const blog = data?.blog;

  return {
    title: blog?.seoTitle || blog?.title || "Blog Details | Glovia Glamour",
    description:
      blog?.seoDescription ||
      blog?.excerpt ||
      "Read the latest blog article from Glovia Glamour.",
  };
}

export default async function BlogDetailsPage({ params }) {
  const { slug } = await params;

  const detailsData = await getBlogDetails(slug);
  const blog = detailsData?.blog || null;
  const relatedBlogs = detailsData?.relatedBlogs || [];

  if (!blog) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#f8f4f5]">
          <div className="mx-auto max-w-[1400px] px-4 py-16 lg:px-6">
            <div className="rounded-[12px] border border-[#ead9de] bg-white p-10 text-center">
              <h1 className="font-[Playfair_Display] text-[30px] text-[#3b2228]">
                Blog not found
              </h1>
              <p className="mt-3 text-[#6c4e53]">
                Jo blog tum open kar rahe ho woh available nahi hai.
              </p>

              <Link
                href="/blog"
                className="mt-5 inline-flex rounded-full bg-[#c56f7f] px-5 py-3 text-white transition hover:bg-[#b45e6f]"
              >
                Back to Blog
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  const [categoryData, landingData] = await Promise.all([
    blog.category ? getCategoryBlogs(blog.category) : null,
    getBlogLandingPageData(),
  ]);

  const categoryPosts = (categoryData?.blogs || []).filter(
    (item) => item.slug !== blog.slug
  );

  const recentPosts = landingData?.page?.recentPosts || [];

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f8f4f5]">
        <section className="mx-auto max-w-[1540px] px-4 py-6 lg:px-6">
          {/* breadcrumb */}
          <div className="mb-4 text-[14px] text-[#8c7379]">
            <Link href="/blog" className="hover:text-[#c56f7f]">
              Magazine
            </Link>
            <span className="mx-1">»</span>

            {blog.sectionLabel ? (
              <>
                <Link
                  href={`/blog/section/${blog.section}`}
                  className="hover:text-[#c56f7f]"
                >
                  {blog.sectionLabel}
                </Link>
                <span className="mx-1">»</span>
              </>
            ) : null}

            {blog.categoryLabel ? (
              <>
                <Link
                  href={`/blog/category/${blog.category}`}
                  className="hover:text-[#c56f7f]"
                >
                  {blog.categoryLabel}
                </Link>
                <span className="mx-1">»</span>
              </>
            ) : null}

            <span className="text-[#5b4047]">{blog.title}</span>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_390px]">
            {/* left content */}
            <div>
              <h1 className="font-[Playfair_Display] text-[28px] leading-tight text-[#2f2226] sm:text-[38px] lg:text-[48px]">
                {blog.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[15px] text-[#7d6369]">
                <span>{formatDate(blog.publishedAt)}</span>
                <span>{blog.readTime || 4} min read</span>
                <span>{blog.authorName || "Glovia Glamour"}</span>
              </div>

              <div className="mt-5 overflow-hidden rounded-[6px] border border-[#ead9de] bg-white">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="h-auto w-full object-cover"
                />
              </div>

              {blog.excerpt ? (
                <p className="mt-6 text-[18px] leading-9 text-[#4f343b]">
                  {blog.excerpt}
                </p>
              ) : null}

              <div className="mt-6 flex flex-wrap gap-3">
                {blog.categoryLabel ? (
                  <Link
                    href={`/blog/category/${blog.category}`}
                    className="border-b border-[#f3a0b3] text-[15px] text-[#e8567c]"
                  >
                    {blog.categoryLabel}
                  </Link>
                ) : null}

                {(blog.tags || []).map((tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                    className="border-b border-[#f3a0b3] text-[15px] text-[#e8567c]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <article className="prose prose-lg mt-8 max-w-none text-[#2f2226] prose-headings:font-[Playfair_Display] prose-headings:font-semibold prose-headings:text-[#2f2226] prose-p:leading-9 prose-p:text-[#2f2226] prose-li:text-[#2f2226] prose-strong:text-[#2f2226] prose-a:text-[#e8567c]">
                <div dangerouslySetInnerHTML={{ __html: blog.content || "" }} />
              </article>

              {blog.gallery?.length ? (
                <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {blog.gallery.map((img, index) => (
                    <div
                      key={`${img}-${index}`}
                      className="overflow-hidden rounded-[8px] border border-[#ead9de] bg-white"
                    >
                      <img
                        src={img}
                        alt={`${blog.title}-${index + 1}`}
                        className="h-[260px] w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {/* right sidebar */}
            <aside className="lg:pt-3">
              <div className="sticky top-24 space-y-8">
                <div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search the Magazine"
                      className="h-[54px] w-full rounded-full border border-[#ddd2d5] bg-white pl-6 pr-14 text-[15px] text-[#2f2226] shadow-sm outline-none placeholder:text-[#7d6c72]"
                    />
                    <Search
                      size={20}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-[#8b7a80]"
                    />
                  </div>
                </div>

                {recentPosts.length ? (
                  <div>
                    <h2 className="mb-4 font-[Playfair_Display] text-[22px] text-[#2f2226]">
                      Recent Post
                    </h2>

                    <div className="space-y-5">
                      {recentPosts
                        .filter((item) => item.slug !== blog.slug)
                        .slice(0, 4)
                        .map((item) => (
                          <Link
                            key={item._id}
                            href={`/blog/${item.slug}`}
                            className="flex gap-4"
                          >
                            <div className="h-[92px] w-[92px] flex-shrink-0 overflow-hidden rounded-[4px] border border-[#ead9de] bg-white">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="h-full w-full object-cover"
                              />
                            </div>

                            <div className="min-w-0">
                              <h3 className="line-clamp-3 font-[Playfair_Display] text-[18px] leading-snug text-[#2f2226]">
                                {item.title}
                              </h3>
                              <p className="mt-2 text-[14px] text-[#9b8187]">
                                {formatDate(item.publishedAt)}
                              </p>
                            </div>
                          </Link>
                        ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </aside>
          </div>
        </section>

        {/* bottom category section like clovia */}
        {categoryPosts.length ? (
          <section className="mx-auto max-w-[1540px] px-4 pb-12 lg:px-6">
            <div className="mb-4 flex items-end justify-between border-b border-[#ddd2d5] pb-3">
              <h2 className="font-[Playfair_Display] text-[30px] text-[#2f2226]">
                {blog.categoryLabel || formatTitle(blog.category)}
              </h2>

              <Link
                href={`/blog/category/${blog.category}`}
                className="text-[16px] text-[#2f2226] transition hover:text-[#c56f7f]"
              >
                View All
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-2">
              {categoryPosts.slice(0, 4).map((post) => (
                <BlogCard key={post._id} post={post} />
              ))}
            </div>
          </section>
        ) : null}

        {/* optional related articles */}
        {relatedBlogs.length ? (
          <section className="mx-auto max-w-[1540px] px-4 pb-14 lg:px-6">
            <div className="mb-4 border-b border-[#ddd2d5] pb-3">
              <h2 className="font-[Playfair_Display] text-[28px] text-[#2f2226]">
                Related Articles
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {relatedBlogs.slice(0, 4).map((post) => (
                <BlogCard key={post._id} post={post} />
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </>
  );
}