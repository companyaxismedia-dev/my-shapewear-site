import CategoryPage from "@/components/category/CategoryPage";
import { fetchCategoryTree, findCategoryBySegments } from "@/lib/categories";
import { notFound } from "next/navigation";

const BASE_URL = "https://www.imkaa.com";

export async function generateMetadata({ params }) {
  const { category } = await params;

  const categoryPath = [category];
  const tree = await fetchCategoryTree();
  const matchedCategory = findCategoryBySegments(tree, categoryPath);

  if (!matchedCategory) {
    return {};
  }

  const canonical = `${BASE_URL}/${matchedCategory.slug}`;

  return {
    title:
      matchedCategory.metaTitle || `${matchedCategory.name} | IMKAA`,

    description:
      matchedCategory.metaDescription || matchedCategory.description,

    keywords: matchedCategory.metaKeywords,

    alternates: {
      canonical,
    },

    openGraph: {
      title:
        matchedCategory.metaTitle || `${matchedCategory.name} | IMKAA`,
      description:
        matchedCategory.metaDescription || matchedCategory.description,
      url: canonical,
      siteName: "IMKAA",
      type: "website",
      images: matchedCategory.image
        ? [
            {
              url: matchedCategory.image,
              width: 1200,
              height: 630,
              alt: matchedCategory.name,
            },
          ]
        : [],
    },

    twitter: {
      card: "summary_large_image",
      title:
        matchedCategory.metaTitle || `${matchedCategory.name} | IMKAA`,
      description:
        matchedCategory.metaDescription || matchedCategory.description,
      images: matchedCategory.image
        ? [matchedCategory.image]
        : [],
    },
  };
}

export default async function Page({ params }) {
  const { category } = await params;

  const categoryPath = [category];

  const tree = await fetchCategoryTree();
  const matchedCategory = findCategoryBySegments(tree, categoryPath);

  if (!matchedCategory) {
    notFound();
  }

  return <CategoryPage categoryPath={categoryPath} />;
}