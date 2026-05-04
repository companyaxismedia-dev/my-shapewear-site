import Navbar from "@/components/Navbar";
import BlogHero from "@/components/blog/BlogHero";
import BlogSectionGrid from "@/components/blog/BlogSectionGrid";
import { apiRequest } from "@/lib/api";

async function getBlogPageData() {
  try {
    return await apiRequest("/api/blog");
  } catch (error) {
    console.error("BLOG PAGE FETCH ERROR:", error);
    return null;
  }
}

export const metadata = {
  title: "Blog | Glovia Glamour",
  description:
    "Explore lingerie tips, bra guides, shapewear ideas, buying guides and fashion stories from Glovia Glamour.",
};

export default async function BlogPage() {
  const data = await getBlogPageData();
  const page = data?.page || {};

  const editorialSections = (page.sections || []).filter(
    (section) => section.posts?.length
  );

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f6f1f3]">
        <BlogHero posts={page.heroPosts || []} />

        <BlogSectionGrid
          title="Recent Posts"
          posts={page.recentPosts || []}
          viewAllLink="/blog/section/recent-posts"
          columns={4}
        />

        <BlogSectionGrid
          title="Most Popular Posts"
          posts={page.popularPosts || []}
          viewAllLink="/blog/section/most-popular"
          columns={4}
        />

        {editorialSections.map((section, index) => (
          <BlogSectionGrid
            key={section.key}
            title={section.title}
            posts={section.posts || []}
            viewAllLink={section.viewAllLink}
            columns={index < 2 ? 2 : 4}
          />
        ))}

        {!page.heroPosts?.length &&
        !page.recentPosts?.length &&
        !page.popularPosts?.length &&
        !editorialSections.length ? (
          <div className="mx-auto max-w-[1540px] px-4 py-16 lg:px-6">
            <div className="rounded-[12px] border border-[#ead9de] bg-white p-10 text-center">
              <h2 className="font-[Playfair_Display] text-[28px] text-[#3b2228]">
                No blog posts found
              </h2>
              <p className="mt-3 text-[#6c4e53]">
                Blog data abhi available nahi hai. Backend API ya database posts
                check karo.
              </p>
            </div>
          </div>
        ) : null}
      </main>
    </>
  );
}