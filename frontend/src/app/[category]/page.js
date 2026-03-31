import { notFound } from "next/navigation";
import CategoryPage from "@/components/category/CategoryPage";
import { fetchCategoryTree, findCategoryBySegments } from "@/lib/categories";

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
