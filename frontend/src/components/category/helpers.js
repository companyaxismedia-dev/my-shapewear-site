// "use client";


// export const getImageUrl = (imagePath) => {
//     if (!imagePath) return "/fallback.jpg";
//     const path = typeof imagePath === "object" ? (imagePath.url || imagePath.path) : imagePath;
//     if (!path) return "/fallback.jpg";
//     return path.startsWith("http") ? path : `${API_BASE}${path}`;
// };

// export const getImageUrl = (imagePath) => {
//   // console.log(imagePath)
//   if (!imagePath) return "/fallback.jpg";
  
//   const path =
//     typeof imagePath === "object"
//       ? imagePath.url || imagePath.path
//       : imagePath;

//   if (!path) return "/fallback.jpg";
//   if (path.startsWith("data:image")) return path;
//   if (path.startsWith("http")) return path;
//   return `${API_BASE}${path}`;
//   // return  path.startsWith("http")?path:`${API_BASE}${path}`;
// };


const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const getImageUrl = (img) => {
  if (!img) return "/fallback.jpg";

  const path =
    typeof img === "object" ? img.url || img.path : img;

  if (!path) return "/fallback.jpg";

  if (path.startsWith("http")) return path;
  if (path.startsWith("data:image")) return path;

  return `${API_BASE}${path}`;
};