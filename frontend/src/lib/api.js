// const API_URL = "http://localhost:5000/api";
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";


export async function API() {
  const res = await fetch(`${API_BASE}/products`);
  return res.json();
}
