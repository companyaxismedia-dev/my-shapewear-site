import CategoryPage from "@/components/category/CategoryPage";

export default async function Page({ params }) {
  const { category } = await params;

  return <CategoryPage category={category} />;
}