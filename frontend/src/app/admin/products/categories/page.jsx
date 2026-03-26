"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { Layers3, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import AdminBreadcrumbs from "@/components/admin/AdminBreadcrumbs";
import DeleteConfirmModal from "@/components/admin/modals/DeleteConfirmModal";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const emptyForm = {
  name: "",
  parent: "",
  description: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  isActive: true,
  sortOrder: 0,
};

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary";

const getLevelLabel = (level) => {
  if (level === 0) return "Main";
  if (level === 1) return "Sub";
  if (level === 2) return "Sub-Sub";
  return `Level ${level + 1}`;
};

const flattenTree = (nodes, depth = 0) =>
  nodes.flatMap((node) => [
    { ...node, depth },
    ...flattenTree(node.subCategories || [], depth + 1),
  ]);

const hasAncestor = (category, ancestorId) =>
  Array.isArray(category?.ancestors) &&
  category.ancestors.some((item) => String(item) === String(ancestorId));

function CategoryFormModal({
  open,
  onClose,
  onSubmit,
  categories,
  submitting,
  form,
  setForm,
  mode = "add",
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 p-4">
      <div className="admin-card w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">
              {mode === "edit" ? "Edit Category" : "Add Category"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === "edit"
                ? "Update category details and hierarchy."
                : "Create main, sub, or nested subcategories from one form."}
            </p>
          </div>
          <button onClick={onClose} className="btn-muted p-2">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="grid gap-4 p-5 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Category Name
            </label>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Shapewear"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Parent Category
            </label>
            <select
              className={inputClass}
              value={form.parent}
              onChange={(e) => setForm((prev) => ({ ...prev, parent: e.target.value }))}
            >
              <option value="">None (Main Category)</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {"- ".repeat(category.depth)}
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Description
            </label>
            <textarea
              className={`${inputClass} min-h-24 resize-y`}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Short category description"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Meta Title
            </label>
            <input
              className={inputClass}
              value={form.metaTitle}
              onChange={(e) => setForm((prev) => ({ ...prev, metaTitle: e.target.value }))}
              placeholder="SEO title"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Sort Order
            </label>
            <input
              className={inputClass}
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
              placeholder="0"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Meta Description
            </label>
            <textarea
              className={`${inputClass} min-h-20 resize-y`}
              value={form.metaDescription}
              onChange={(e) => setForm((prev) => ({ ...prev, metaDescription: e.target.value }))}
              placeholder="SEO description"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Meta Keywords
            </label>
            <input
              className={inputClass}
              value={form.metaKeywords}
              onChange={(e) => setForm((prev) => ({ ...prev, metaKeywords: e.target.value }))}
              placeholder="shapewear, body shaper, tummy control"
            />
          </div>

          <div className="md:col-span-2 flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-3">
            <div>
              <p className="text-sm font-medium">Active Category</p>
              <p className="text-xs text-muted-foreground">
                Active categories stay available for assignment.
              </p>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary"
              checked={form.isActive}
              onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-muted px-4 py-2">
              Cancel
            </button>
            <button type="submit" className="btn-primary px-4 py-2" disabled={submitting}>
              {submitting
                ? "Saving..."
                : mode === "edit"
                  ? "Update Category"
                  : "Save Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [tree, setTree] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingCategory, setEditingCategory] = useState(null);

  const fetchCategories = useEffectEvent(async (searchValue = "") => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const params = new URLSearchParams();

      if (searchValue.trim()) {
        params.set("search", searchValue.trim());
      }

      const res = await fetch(`${API_BASE}/api/admin/categories?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load categories");
      }

      setCategories(flattenTree(data.tree || []));
      setTree(data.tree || []);
    } catch (error) {
      toast.error(error.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    fetchCategories(search);
  }, [search]);

  const resetForm = () => {
    setForm({ ...emptyForm });
    setFormOpen(false);
    setEditingCategory(null);
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      const token = localStorage.getItem("adminToken");
      const isEdit = Boolean(editingCategory?._id);
      const endpoint = isEdit
        ? `${API_BASE}/api/admin/categories/${editingCategory._id}`
        : `${API_BASE}/api/admin/categories`;

      const res = await fetch(endpoint, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(
          data.message || `Failed to ${isEdit ? "update" : "create"} category`
        );
      }

      toast.success(isEdit ? "Category updated successfully" : "Category created successfully");
      resetForm();
      fetchCategories(search);
    } catch (error) {
      toast.error(error.message || "Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (category) => {
    const blockedIds = new Set([
      category._id,
      ...categories
        .filter((item) => hasAncestor(item, category._id))
        .map((item) => item._id),
    ]);

    const safeParent = category.parent?._id && !blockedIds.has(category.parent._id)
      ? category.parent._id
      : "";

    setEditingCategory(category);
    setForm({
      name: category.name || "",
      parent: safeParent,
      description: category.description || "",
      metaTitle: category.metaTitle || "",
      metaDescription: category.metaDescription || "",
      metaKeywords: Array.isArray(category.metaKeywords)
        ? category.metaKeywords.join(", ")
        : category.metaKeywords || "",
      isActive: category.isActive !== false,
      sortOrder: category.sortOrder ?? 0,
    });
    setFormOpen(true);
  };

  const selectableParentCategories = editingCategory
    ? categories.filter((category) => {
        if (category._id === editingCategory._id) return false;
        return !hasAncestor(category, editingCategory._id);
      })
    : categories;

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE}/api/admin/categories/${deleteTarget._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete category");
      }

      toast.success("Category deleted successfully");
      setDeleteOpen(false);
      setDeleteTarget(null);
      fetchCategories(search);
    } catch (error) {
      toast.error(error.message || "Failed to delete category");
    }
  };

  return (
    <>
      <AdminBreadcrumbs
        items={[
          { label: "Home", href: "/admin" },
          { label: "MyShop", href: "" },
          { label: "All Categories", href: "/admin/products/categories" },
        ]}
        mode={null}
      />

      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">All Categories</h1>
          <p className="text-sm text-muted-foreground">
            Manage category hierarchy with main, sub, and nested subcategories.
          </p>
        </div>

        <button
          onClick={() => {
            setForm({ ...emptyForm });
            setFormOpen(true);
          }}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
        >
          <Plus size={15} /> Add Category
        </button>
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-[1.5fr,1fr]">
        <div className="admin-card p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none transition focus:border-primary"
              placeholder="Search category, slug, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-card flex items-center gap-3 p-4">
          <div className="rounded-full bg-primary/10 p-3 text-primary">
            <Layers3 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total categories</p>
            <p className="text-2xl font-semibold">{categories.length}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr,1.85fr]">
        <div className="admin-card p-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Hierarchy Preview</h2>
            <p className="text-sm text-muted-foreground">
              Nested categories appear here in tree order.
            </p>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading categories...</p>
          ) : tree.length === 0 ? (
            <p className="text-sm text-muted-foreground">No categories found yet.</p>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category._id}
                  className="rounded-lg border border-border bg-background px-3 py-3"
                  style={{ marginLeft: `${category.depth * 18}px` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-xs text-muted-foreground">
                        /{category.slug} - {getLevelLabel(category.level)}
                      </p>
                    </div>
                    <span className="rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
                      {category.productCount} products
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="admin-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Slug</th>
                <th className="p-3 text-left">Parent</th>
                <th className="p-3 text-left">Level</th>
                <th className="p-3 text-left">Children</th>
                <th className="p-3 text-left">Products</th>
                <th className="p-3 text-left">Created</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-muted-foreground">
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-muted-foreground">
                    No categories available.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category._id} className="border-b">
                    <td className="p-3">
                      <div
                        className="flex items-center gap-2"
                        style={{ paddingLeft: `${category.depth * 16}px` }}
                      >
                        <span className="font-medium">{category.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{category.slug}</td>
                    <td className="p-3">{category.parent?.name || "Main Category"}</td>
                    <td className="p-3">{getLevelLabel(category.level)}</td>
                    <td className="p-3">{category.subCategoryCount}</td>
                    <td className="p-3">{category.productCount}</td>
                    <td className="p-3">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          openEditModal(category);
                        }}
                        className="btn-muted flex items-center gap-1 px-3 py-1.5"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        onClick={() => {
                          setDeleteTarget(category);
                          setDeleteOpen(true);
                        }}
                        className="btn-destructive flex items-center gap-1 px-3 py-1.5"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CategoryFormModal
        open={formOpen}
        onClose={resetForm}
        onSubmit={handleSubmitCategory}
        categories={selectableParentCategories}
        submitting={submitting}
        form={form}
        setForm={setForm}
        mode={editingCategory ? "edit" : "add"}
      />

      <DeleteConfirmModal
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        title={`Delete ${deleteTarget?.name || "category"}?`}
        btnName="Delete"
      />
    </>
  );
}
