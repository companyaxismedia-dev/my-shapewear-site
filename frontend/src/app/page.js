import { API_BASE } from "@/lib/api";
import HomeContent from "./HomeContent";

export const revalidate = 120;

const getHomePageData = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/storefront/home`, {
      next: { revalidate },
    });

    if (!res.ok) {
      return { sections: [], heroSlides: [] };
    }
    const data = await res.json();
    const sections = Array.isArray(data?.sections) ? data.sections : [];
    const heroSlides = Array.isArray(data?.heroSlides) ? data.heroSlides : [];

    return { sections, heroSlides };
  } catch (error) {
    console.error("Failed to load home page", error);
    return { sections: [], heroSlides: [] };
  }
};

export default async function Home() {
  const { sections, heroSlides } = await getHomePageData();

  return <HomeContent initialSections={sections} initialHeroSlides={heroSlides} />;
}
