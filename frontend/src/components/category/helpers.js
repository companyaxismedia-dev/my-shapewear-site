const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const getImageUrl = (img) => {
  if (!img) return "/fallback.jpg";

  const path =
    typeof img === "object" ? img.url || img.path : img;

  if (!path) return "/fallback.jpg";

  if (path.startsWith("http")) return path;
  if (path.startsWith("data:image")) return path;
  if (path.startsWith("blob:")) return path;

  return `${API_BASE}${path}`;
};