import BlogCard from "@/components/blog/BlogCard";
import { apiRequest } from "@/lib/api";

async function getCategoryBlogs(category) {
  try {
    return await apiRequest(`/api/blog/category/${category}`);
  } catch (error) {
    console.error("CATEGORY BLOGS FETCH ERROR:", error);
    return null;
  }
}

function formatTitle(value) {
  if (!value) return "";
  return value
    .split("-")
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }) {
  return {
    title: `${formatTitle(params.category)} | Blog | Glovia Glamour`,
    description: `Explore ${formatTitle(
      params.category
    )} blog posts from Glovia Glamour.`,
  };
}

export default async function BlogCategoryPage({ params }) {
  const data = await getCategoryBlogs(params.category);
  const blogs = data?.blogs || [];

  return (
    <main className="min-h-screen bg-[#f8f4f5]">
      <section className="mx-auto max-w-[1400px] px-4 py-8">
        <div className="mb-6">
          <h1 className="font-[Playfair_Display] text-[32px] text-[#3b2228] sm:text-[42px]">
            {formatTitle(params.category)}
          </h1>
        </div>

        {blogs.length ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
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
              Is category me abhi koi blog available nahi hai.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}