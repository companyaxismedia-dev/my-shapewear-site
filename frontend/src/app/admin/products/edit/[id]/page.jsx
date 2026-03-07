"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProductForm } from "@/components/admin/ProductForm";
import { Loader2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("adminToken");

        if (!token) {
          setError("No authentication token found");
          return;
        }

        // Try the admin endpoint first (for published products)
        let res = await fetch(`${API_BASE}/api/admin/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // If admin endpoint fails, try the drafts endpoint
        if (!res.ok) {
          res = await fetch(`${API_BASE}/api/admin/products/drafts/${productId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }

        // If both fail, try the regular products endpoint
        if (!res.ok) {
          res = await fetch(`${API_BASE}/api/products/${productId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || `Failed to fetch product: ${res.status}`);
        }

        setProduct(data.product || data.data);
      } catch (err) {
        const errorMsg = err.message || "Failed to load product";
        setError(errorMsg);
        toast.error(errorMsg);
        console.error("Product fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading product...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <div className="text-center">
            <p className="text-destructive font-semibold mb-2">{error}</p>
            <p className="text-muted-foreground text-sm mb-4">
              Product ID: {productId}
            </p>
          </div>
          <button
            onClick={() => router.push("/admin/products")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Back to Products
          </button>
        </div>
      </AdminLayout>
    );
  }

  if (!product) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <p className="text-muted-foreground">Product not found</p>
          <button
            onClick={() => router.push("/admin/products")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Back to Products
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <ProductForm mode="edit" initialData={product} showLayout={true} />
    </AdminLayout>
  );
}
