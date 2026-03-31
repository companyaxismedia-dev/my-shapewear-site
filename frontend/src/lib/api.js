const PUBLIC_API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://my-shapewear-site.onrender.com";

const SERVER_API_BASE =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

export const API_BASE =
  typeof window === "undefined" ? SERVER_API_BASE : PUBLIC_API_BASE;

// generic helper
export async function apiRequest(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: options.cache || "no-store",
  });

  if (!res.ok) {
    throw new Error("API request failed");
  }

  return res.json();
}