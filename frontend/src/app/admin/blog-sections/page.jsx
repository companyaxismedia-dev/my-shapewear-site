"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ListOrdered, Pencil, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";
import AdminBreadcrumbs from "@/components/admin/AdminBreadcrumbs";
import { API_BASE } from "@/lib/api";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary";

const emptyForm = {
  label: "",
  key: "",
  sectionOrder: 0,
};

function slugifyValue(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function SectionFormModal({
  open,
  onClose,
  onSubmit,
  form,
  setForm,
  submitting,
  editingSection,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 p-4">
      <div className="admin-card w-full max-w-2xl overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">
              {editingSection ? "Edit Blog Section" : "Add Blog Section"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage reusable blog sections and their display order.
            </p>
          </div>

          <button type="button" onClick={onClose} className="btn-muted p-2">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="grid gap-4 p-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Section Label <span className="text-red-500">*</span>
            </label>
            <input
              className={inputClass}
              value={form.label}
              onChange={(e) =>
                setForm((prev) => {
                  const nextLabel = e.target.value;
                  const nextKey = slugifyValue(nextLabel);
                  const previousAutoKey = slugifyValue(prev.label);

                  return {
                    ...prev,
                    label: nextLabel,
                    key:
                      !editingSection || !prev.key || prev.key === previousAutoKey
                        ? nextKey
                        : prev.key,
                  };
                })
              }
              placeholder="e.g. Buying Guide"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Section Key <span className="text-red-500">*</span>
            </label>
            <input
              className={inputClass}
              value={form.key}
              onChange={(e) => setForm((prev) => ({ ...prev, key: e.target.value }))}
              placeholder="e.g. buying-guide"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Section Order
            </label>
            <input
              type="number"
              className={inputClass}
              value={form.sectionOrder}
              onChange={(e) => setForm((prev) => ({ ...prev, sectionOrder: e.target.value }))}
              placeholder="0"
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-muted px-4 py-2">
              Cancel
            </button>
            <button type="submit" className="btn-primary px-4 py-2" disabled={submitting}>
              {submitting ? "Saving..." : editingSection ? "Update Section" : "Save Section"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BlogSectionsPage() {
  const [sections, setSections] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  const fetchSections = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE}/api/admin/blog-sections`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load blog sections");
      }

      setSections(data.sections || []);
    } catch (error) {
      toast.error(error.message || "Failed to load blog sections");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const filteredSections = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return sections;

    return sections.filter((section) =>
      [section.label, section.key]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [search, sections]);

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingSection(null);
    setFormOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      const token = localStorage.getItem("adminToken");
      const isEdit = Boolean(editingSection?._id);
      const endpoint = isEdit
        ? `${API_BASE}/api/admin/blog-sections/${editingSection._id}`
        : `${API_BASE}/api/admin/blog-sections`;

      const res = await fetch(endpoint, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          label: form.label,
          key: form.key,
          sectionOrder: form.sectionOrder,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save section");
      }

      toast.success(isEdit ? "Section updated successfully" : "Section created successfully");
      resetForm();
      fetchSections();
    } catch (error) {
      toast.error(error.message || "Failed to save section");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AdminBreadcrumbs
        items={[
          { label: "Home", href: "/admin" },
          { label: "Content", href: "" },
          { label: "Blog Sections", href: "/admin/blog-sections" },
        ]}
        mode={null}
      />

      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Blog Sections</h1>
          <p className="text-sm text-muted-foreground">
            Create, order, and edit the reusable sections used by blog posts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setForm({ ...emptyForm });
            setEditingSection(null);
            setFormOpen(true);
          }}
          className="btn-primary flex w-full items-center justify-center gap-2 px-4 py-2 text-sm sm:w-auto"
        >
          <Plus size={15} /> Add Section
        </button>
      </div>

      <div className="mb-4 grid gap-4 xl:grid-cols-[1.5fr,1fr]">
        <div className="admin-card p-4">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none transition focus:border-primary"
              placeholder="Search section label or key..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-card flex items-center gap-3 p-4">
          <div className="rounded-full bg-primary/10 p-3 text-primary">
            <ListOrdered className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total sections</p>
            <p className="text-2xl font-semibold">{sections.length}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:hidden">
        {loading ? (
          <div className="admin-card p-5 text-sm text-muted-foreground">Loading sections...</div>
        ) : filteredSections.length === 0 ? (
          <div className="admin-card p-5 text-sm text-muted-foreground">
            No blog sections found.
          </div>
        ) : (
          filteredSections.map((section) => (
            <div key={section._id} className="admin-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{section.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">/{section.key}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingSection(section);
                    setForm({
                      label: section.label || "",
                      key: section.key || "",
                      sectionOrder: section.sectionOrder ?? 0,
                    });
                    setFormOpen(true);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700"
                >
                  <Pencil size={13} /> Edit
                </button>
              </div>

              <div className="mt-4 rounded-xl border border-border/70 bg-muted/20 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Section Order
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">{section.sectionOrder}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden lg:block">
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto p-4">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="bg-muted/30 text-left text-foreground">
                  <th className="px-4 py-4 font-semibold">Section Label</th>
                  <th className="px-4 py-4 font-semibold">Section Key</th>
                  <th className="px-4 py-4 font-semibold">Order</th>
                  <th className="px-4 py-4 font-semibold">Updated</th>
                  <th className="px-4 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      Loading sections...
                    </td>
                  </tr>
                ) : filteredSections.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No blog sections found.
                    </td>
                  </tr>
                ) : (
                  filteredSections.map((section) => (
                    <tr key={section._id} className="border-b border-border/60 last:border-b-0">
                      <td className="px-4 py-5 font-semibold text-foreground">{section.label}</td>
                      <td className="px-4 py-5 text-muted-foreground">{section.key}</td>
                      <td className="px-4 py-5">{section.sectionOrder}</td>
                      <td className="px-4 py-5 text-muted-foreground">
                        {new Date(section.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSection(section);
                              setForm({
                                label: section.label || "",
                                key: section.key || "",
                                sectionOrder: section.sectionOrder ?? 0,
                              });
                              setFormOpen(true);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                          >
                            <Pencil size={14} /> Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <SectionFormModal
        open={formOpen}
        onClose={resetForm}
        onSubmit={handleSubmit}
        form={form}
        setForm={setForm}
        submitting={submitting}
        editingSection={editingSection}
      />
    </>
  );
}
