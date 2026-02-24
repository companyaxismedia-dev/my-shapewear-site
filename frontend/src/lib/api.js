// const API_URL = "http://localhost:5000/api";
// const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
export const API_BASE =
  typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000"
    : "https://my-shapewear-site.onrender.com";


export async function API() {
  const res = await fetch(`${API_BASE}/products`);
  return res.json();
}
