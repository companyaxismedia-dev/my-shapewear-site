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
  title: "Ethnic Wear Tips & Trends | IMKAA",

  description:
    "Explore IMKAA's fashion blog for ethnic wear styling tips, designer suit trends, festive outfit ideas, fabric guides, shopping advice, and women's fashion inspiration.",

  keywords: [
    "ethnic wear blog",
    "women fashion blog",
    "designer suit blog",
    "kurti styling tips",
    "salwar suit trends",
    "ethnic fashion guide",
    "festive outfit ideas",
    "fashion tips for women",
    "designer ethnic wear",
    "traditional wear blog",
    "wedding outfit ideas",
    "Indian fashion blog",
    "IMKAA blog",
  ],

  alternates: {
    canonical: "https://www.imkaa.com/blog",
  },

  openGraph: {
    title: "IMKAA Fashion Blog | Ethnic Wear Styling Tips & Trends",
    description:
      "Discover ethnic wear styling guides, festive fashion inspiration, buying guides, fabric care tips, and the latest designer suit trends from IMKAA.",
    url: "https://www.imkaa.com/blog",
    siteName: "IMKAA",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: "https://www.imkaa.com/og-image.jpg", // Replace with your actual OG image
        width: 1200,
        height: 630,
        alt: "IMKAA Fashion Blog",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "IMKAA Fashion Blog",
    description:
      "Ethnic wear styling tips, fashion trends, festive outfit ideas, and buying guides.",
    images: ["https://www.imkaa.com/og-image.jpg"], // Replace with your actual image
  },

  robots: {
    index: true,
    follow: true,
  },
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
              <h1 className="font-[Playfair_Display] text-[28px] text-[#3b2228]">
                No blog posts found
              </h1>
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
