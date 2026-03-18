const DEFAULT_API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://my-shapewear-site.onrender.com";

export const API_BASE =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1")
    ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    : DEFAULT_API_BASE;

// generic helper
export async function apiRequest(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) throw new Error("API request failed");

  return res.json();
}


// const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";


// export async function API() {
//   const res = await fetch(`${API_BASE}/products`);
//   // console.log(res)
//   return res.json();
// }
