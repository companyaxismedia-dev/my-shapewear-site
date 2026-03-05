"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProductForm } from "@/components/admin/ProductForm";

export default function AddProductPage() {
  return (
    <AdminLayout>
      <ProductForm mode="add" showLayout={true} />
    </AdminLayout>
  );
}
