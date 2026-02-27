"use client";
const API_BASE =
    typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1")
        ? "http://localhost:5000"
        : "https://my-shapewear-site.onrender.com";


// export const getImageUrl = (imagePath) => {
//     if (!imagePath) return "/fallback.jpg";
//     const path = typeof imagePath === "object" ? (imagePath.url || imagePath.path) : imagePath;
//     if (!path) return "/fallback.jpg";
//     return path.startsWith("http") ? path : `${API_BASE}${path}`;
// };

export const getImageUrl = (imagePath) => {
  if (!imagePath) return "/fallback.jpg";

  const path =
    typeof imagePath === "object"
      ? imagePath.url || imagePath.path
      : imagePath;

  if (!path) return "/fallback.jpg";
  if (path.startsWith("data:image")) return path;
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
};