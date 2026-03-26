import CategoryPage from "@/components/category/CategoryPage";

export default async function Page({ params }) {
  const { category, subcategory } = await params;

  return <CategoryPage categoryPath={[category, subcategory]} />;
}
