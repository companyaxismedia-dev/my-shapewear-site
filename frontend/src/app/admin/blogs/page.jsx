"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  Eye,
  FileText,
  ImagePlus,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import AdminBreadcrumbs from "@/components/admin/AdminBreadcrumbs";
import PaginationComponent from "@/components/admin/common/PaginationComponent";
import DeleteConfirmModal from "@/components/admin/modals/DeleteConfirmModal";
import { API_BASE } from "@/lib/api";

const emptyForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  image: "",
  galleryText: "",
  categoryLabel: "",
  category: "",
  tagsText: "",
  sectionLabel: "",
  section: "",
  isPublished: true,
  isFeatured: false,
  isPopular: false,
  heroRank: 0,
  sectionOrder: 0,
  cardOrder: 0,
  readTime: 4,
  authorName: "Imkaa",
  seoTitle: "",
  seoDescription: "",
  publishedAt: "",
};

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary";

const textareaClass = `${inputClass} min-h-24 resize-y`;
const requiredFieldLabels = {
  title: "Blog Title",
  image: "Cover Image",
  categoryLabel: "Category Label",
  section: "Section",
};

function toLocalDateTimeInput(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (part) => String(part).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

function splitLines(value = "") {
  return String(value)
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function slugifyValue(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resolveMediaUrl(value = "") {
  if (!value) return "";
  return value.startsWith("http") ? value : `${API_BASE}${value}`;
}

function getFieldClass(hasError, baseClass = inputClass) {
  return hasError
    ? `${baseClass} border-red-500 bg-red-50 focus:border-red-500`
    : baseClass;
}

function RequiredLabel({ children }) {
  return (
    <>
      {children} <span className="text-red-500">*</span>
    </>
  );
}

function BlogFormModal({
  open,
  onClose,
  onSubmit,
  form,
  setFormField,
  onSectionChange,
  onCategoryLabelChange,
  submitting,
  mode,
  categoryOptions,
  sectionOptions,
  onImageUpload,
  onGalleryUpload,
  uploadingImage,
  uploadingGallery,
  errors,
}) {
  const coverInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] overflow-y-auto bg-black/45 p-4">
      <div className="mx-auto w-full max-w-6xl">
        <div className="admin-card overflow-hidden">
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold">
                {mode === "edit" ? "Edit Blog" : "Add Blog"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Create blog posts for the storefront and control the section placement from one
                admin form.
              </p>
            </div>

            <button type="button" onClick={onClose} className="btn-muted p-2">
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="grid gap-5 p-5">
            <div className="grid gap-5 xl:grid-cols-[1.2fr,0.8fr]">
              <div className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <RequiredLabel>Blog Title</RequiredLabel>
                    </label>
                    <input
                      className={getFieldClass(Boolean(errors.title))}
                      value={form.title}
                      onChange={(e) => setFormField("title", e.target.value)}
                      placeholder="e.g. Best shapewear for lehenga season"
                    />
                    {errors.title ? (
                      <p className="mt-1 text-xs font-medium text-red-600">{errors.title}</p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Slug
                    </label>
                    <input
                      className={inputClass}
                      value={form.slug}
                      onChange={(e) => setFormField("slug", e.target.value)}
                      placeholder="Auto-generated if left blank"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Author Name
                    </label>
                    <input
                      className={inputClass}
                      value={form.authorName}
                      onChange={(e) => setFormField("authorName", e.target.value)}
                      placeholder="Imkaa"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Excerpt
                    </label>
                    <textarea
                      className={textareaClass}
                      value={form.excerpt}
                      onChange={(e) => setFormField("excerpt", e.target.value)}
                      placeholder="Short summary shown on cards and detail page."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Blog Content
                    </label>
                    <textarea
                      className={`${inputClass} min-h-[240px] resize-y font-mono text-xs sm:text-sm`}
                      value={form.content}
                      onChange={(e) => setFormField("content", e.target.value)}
                      placeholder="Paste HTML content for the blog detail page."
                    />
                  </div>
                </div>

                <div
                  className={`rounded-xl border bg-muted/20 p-4 ${
                    errors.image ? "border-red-500" : "border-border/70"
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        <RequiredLabel>Cover Image</RequiredLabel>
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Main blog card and hero image used across the storefront.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => onImageUpload(e.target.files?.[0], coverInputRef)}
                      />
                      <button
                        type="button"
                        onClick={() => coverInputRef.current?.click()}
                        className="btn-muted flex items-center gap-2 px-3 py-2 text-sm"
                        disabled={uploadingImage}
                      >
                        <Upload className="h-4 w-4" />
                        {uploadingImage ? "Uploading..." : "Upload"}
                      </button>
                    </div>
                  </div>

                  <input
                    className={getFieldClass(Boolean(errors.image))}
                    value={form.image}
                    onChange={(e) => setFormField("image", e.target.value)}
                    placeholder="/uploads/products/images/..."
                  />
                  {errors.image ? (
                    <p className="mt-1 text-xs font-medium text-red-600">{errors.image}</p>
                  ) : null}

                  {form.image ? (
                    <div className="mt-3 overflow-hidden rounded-xl border border-border bg-background">
                      <img
                        src={resolveMediaUrl(form.image)}
                        alt={form.title || "Blog cover preview"}
                        className="h-52 w-full object-cover"
                      />
                    </div>
                  ) : null}
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Gallery Images</h3>
                      <p className="text-xs text-muted-foreground">
                        Optional detail-page gallery. One image URL per line.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        ref={galleryInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => onGalleryUpload(e.target.files, galleryInputRef)}
                      />
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="btn-muted flex items-center gap-2 px-3 py-2 text-sm"
                        disabled={uploadingGallery}
                      >
                        <ImagePlus className="h-4 w-4" />
                        {uploadingGallery ? "Uploading..." : "Upload Images"}
                      </button>
                    </div>
                  </div>

                  <textarea
                    className={`${inputClass} min-h-28 resize-y`}
                    value={form.galleryText}
                    onChange={(e) => setFormField("galleryText", e.target.value)}
                    placeholder={"https://...\nhttps://..."}
                  />

                  {splitLines(form.galleryText).length ? (
                    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                      {splitLines(form.galleryText).map((url, index) => (
                        <div
                          key={`${url}-${index}`}
                          className="overflow-hidden rounded-xl border border-border bg-background"
                        >
                          <img
                            src={resolveMediaUrl(url)}
                            alt={`Gallery ${index + 1}`}
                            className="h-28 w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                  <h3 className="text-sm font-semibold text-foreground">Placement</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    These fields decide where the blog appears on the public blog pages.
                  </p>

                  <div className="mt-4 grid gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <RequiredLabel>Section</RequiredLabel>
                      </label>
                      <select
                        className={getFieldClass(Boolean(errors.section))}
                        value={form.section}
                        onChange={(e) => onSectionChange(e.target.value)}
                      >
                        <option value="">Select a section</option>
                        {sectionOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.section ? (
                        <p className="mt-1 text-xs font-medium text-red-600">{errors.section}</p>
                      ) : null}
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Section Key
                      </label>
                      <input
                        className={inputClass}
                        value={form.section}
                        readOnly
                        placeholder="e.g. buying-guide"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <RequiredLabel>Category Label</RequiredLabel>
                      </label>
                      <input
                        list="blog-category-options"
                        className={getFieldClass(Boolean(errors.categoryLabel))}
                        value={form.categoryLabel}
                        onChange={(e) => onCategoryLabelChange(e.target.value)}
                        placeholder="e.g. Shapewear Tips"
                      />
                      {errors.categoryLabel ? (
                        <p className="mt-1 text-xs font-medium text-red-600">
                          {errors.categoryLabel}
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Category Key
                      </label>
                      <input
                        className={inputClass}
                        value={form.category}
                        onChange={(e) => setFormField("category", e.target.value)}
                        placeholder="e.g. shapewear-tips"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Publish Date
                        </label>
                        <input
                          type="datetime-local"
                          className={inputClass}
                          value={form.publishedAt}
                          onChange={(e) => setFormField("publishedAt", e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Read Time
                        </label>
                        <input
                          type="number"
                          min="1"
                          className={inputClass}
                          value={form.readTime}
                          onChange={(e) => setFormField("readTime", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Hero Rank
                        </label>
                        <input
                          type="number"
                          className={inputClass}
                          value={form.heroRank}
                          onChange={(e) => setFormField("heroRank", e.target.value)}
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
                          readOnly
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Card Order
                        </label>
                        <input
                          type="number"
                          className={inputClass}
                          value={form.cardOrder}
                          onChange={(e) => setFormField("cardOrder", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                  <h3 className="text-sm font-semibold text-foreground">Discovery & SEO</h3>

                  <div className="mt-4 grid gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Tags
                      </label>
                      <textarea
                        className={`${inputClass} min-h-24 resize-y`}
                        value={form.tagsText}
                        onChange={(e) => setFormField("tagsText", e.target.value)}
                        placeholder={"bridal shapewear\nsize guide"}
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        SEO Title
                      </label>
                      <input
                        className={inputClass}
                        value={form.seoTitle}
                        onChange={(e) => setFormField("seoTitle", e.target.value)}
                        placeholder="Search result title"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        SEO Description
                      </label>
                      <textarea
                        className={`${inputClass} min-h-24 resize-y`}
                        value={form.seoDescription}
                        onChange={(e) => setFormField("seoDescription", e.target.value)}
                        placeholder="Search result meta description"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  <label className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">Published</p>
                      <p className="text-xs text-muted-foreground">
                        Unpublished blogs stay hidden from the public blog pages.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-primary"
                      checked={form.isPublished}
                      onChange={(e) => setFormField("isPublished", e.target.checked)}
                    />
                  </label>

                  <label className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">Featured</p>
                      <p className="text-xs text-muted-foreground">
                        Use this for editorial highlights or future featured widgets.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-primary"
                      checked={form.isFeatured}
                      onChange={(e) => setFormField("isFeatured", e.target.checked)}
                    />
                  </label>

                  <label className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">Popular Flag</p>
                      <p className="text-xs text-muted-foreground">
                        Useful for tracking and editorial sorting alongside most-popular sections.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-primary"
                      checked={form.isPopular}
                      onChange={(e) => setFormField("isPopular", e.target.checked)}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <button type="button" onClick={onClose} className="btn-muted px-4 py-2">
                Cancel
              </button>
              <button type="submit" className="btn-primary px-4 py-2" disabled={submitting}>
                {submitting ? "Saving..." : mode === "edit" ? "Update Blog" : "Save Blog"}
              </button>
            </div>
            <datalist id="blog-category-options">
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.label} />
              ))}
            </datalist>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [stats, setStats] = useState({
    totalBlogs: 0,
    publishedCount: 0,
    draftCount: 0,
  });
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [formErrors, setFormErrors] = useState({});
  const [editingBlog, setEditingBlog] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const fetchBlogMeta = useCallback(async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE}/api/admin/blogs/meta`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load blog metadata");
      }

      setCategoryOptions(data.categories || []);
      setSectionOptions(data.sections || []);
    } catch (error) {
      toast.error(error.message || "Failed to load blog metadata");
    }
  }, []);

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        status,
      });

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const res = await fetch(`${API_BASE}/api/admin/blogs?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load blogs");
      }

      setBlogs(data.blogs || []);
      setPagination(data.pagination || { page: 1, limit, total: 0, totalPages: 1 });
      setStats(
        data.stats || {
          totalBlogs: 0,
          publishedCount: 0,
          draftCount: 0,
        }
      );
      setSelectedIds([]);
    } catch (error) {
      toast.error(error.message || "Failed to load blogs");
    } finally {
      setLoading(false);
    }
  }, [limit, page, search, status]);

  useEffect(() => {
    fetchBlogMeta();
  }, [fetchBlogMeta]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);
  useEffect(() => {
    setPage(1);
  }, [search, status, limit]);

  const resetForm = () => {
    setForm({ ...emptyForm });
    setFormErrors({});
    setEditingBlog(null);
    setFormOpen(false);
  };

  const setFormField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    setFormErrors((prev) => {
      if (!prev[field]) return prev;

      const trimmedValue =
        typeof value === "string" ? value.trim() : value;

      if (
        (typeof trimmedValue === "string" && trimmedValue) ||
        typeof trimmedValue === "boolean" ||
        typeof trimmedValue === "number"
      ) {
        const nextErrors = { ...prev };
        delete nextErrors[field];
        return nextErrors;
      }

      return prev;
    });
  }, []);

  const validateBlogForm = useCallback(() => {
    const nextErrors = {};

    Object.entries(requiredFieldLabels).forEach(([field, label]) => {
      const value = form[field];
      if (!String(value || "").trim()) {
        nextErrors[field] = `${label} is required`;
      }
    });

    return nextErrors;
  }, [form]);

  const handleSectionChange = useCallback(
    (sectionKey) => {
      const matchedSection = sectionOptions.find((option) => option.value === sectionKey);

      setForm((prev) => ({
        ...prev,
        section: sectionKey,
        sectionLabel: matchedSection?.label || "",
        sectionOrder: matchedSection?.sectionOrder ?? 0,
      }));

      setFormErrors((prev) => {
        if (!prev.section) return prev;
        const nextErrors = { ...prev };
        delete nextErrors.section;
        return nextErrors;
      });
    },
    [sectionOptions]
  );

  const handleCategoryLabelChange = useCallback((value) => {
    setForm((prev) => {
      const nextCategorySlug = slugifyValue(value);
      const previousAutoSlug = slugifyValue(prev.categoryLabel);
      const shouldSyncCategory =
        !prev.category || prev.category === previousAutoSlug;

      return {
        ...prev,
        categoryLabel: value,
        category: shouldSyncCategory ? nextCategorySlug : prev.category,
      };
    });

    setFormErrors((prev) => {
      if (!prev.categoryLabel) return prev;
      const nextErrors = { ...prev };
      delete nextErrors.categoryLabel;
      return nextErrors;
    });
  }, []);

  const uploadSingleFile = async (file) => {
    if (!file) return "";

    const token = localStorage.getItem("adminToken");
    const data = new FormData();
    data.append("file", file);

    const res = await fetch(`${API_BASE}/api/admin/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: data,
    });

    const payload = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(payload.message || "File upload failed");
    }

    return payload.url;
  };

  const handleImageUpload = async (file, inputRef) => {
    if (!file) return;

    try {
      setUploadingImage(true);
      const uploadedUrl = await uploadSingleFile(file);
      setFormField("image", uploadedUrl);
      toast.success("Cover image uploaded");
    } catch (error) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
      if (inputRef?.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleGalleryUpload = async (files, inputRef) => {
    const selectedFiles = Array.from(files || []);
    if (!selectedFiles.length) return;

    try {
      setUploadingGallery(true);
      const urls = [];

      for (const file of selectedFiles) {
        const uploadedUrl = await uploadSingleFile(file);
        urls.push(uploadedUrl);
      }

      setForm((prev) => {
        const existing = splitLines(prev.galleryText);
        return {
          ...prev,
          galleryText: [...existing, ...urls].join("\n"),
        };
      });
      setFormErrors((prev) => {
        if (!prev.galleryText) return prev;
        const nextErrors = { ...prev };
        delete nextErrors.galleryText;
        return nextErrors;
      });
      toast.success("Gallery images uploaded");
    } catch (error) {
      toast.error(error.message || "Failed to upload gallery images");
    } finally {
      setUploadingGallery(false);
      if (inputRef?.current) {
        inputRef.current.value = "";
      }
    }
  };

  const openEditModal = (blog) => {
    setEditingBlog(blog);
    setFormErrors({});
    setForm({
      title: blog.title || "",
      slug: blog.slug || "",
      excerpt: blog.excerpt || "",
      content: blog.content || "",
      image: blog.image || "",
      galleryText: Array.isArray(blog.gallery) ? blog.gallery.join("\n") : "",
      categoryLabel: blog.categoryLabel || "",
      category: blog.category || "",
      tagsText: Array.isArray(blog.tags) ? blog.tags.join("\n") : "",
      sectionLabel: blog.sectionLabel || "",
      section: blog.section || "",
      isPublished: blog.isPublished !== false,
      isFeatured: blog.isFeatured === true,
      isPopular: blog.isPopular === true,
      heroRank: blog.heroRank ?? 0,
      sectionOrder: blog.sectionOrder ?? 0,
      cardOrder: blog.cardOrder ?? 0,
      readTime: blog.readTime ?? 4,
      authorName: blog.authorName || "Imkaa",
      seoTitle: blog.seoTitle || "",
      seoDescription: blog.seoDescription || "",
      publishedAt: toLocalDateTimeInput(blog.publishedAt),
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateBlogForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      toast.error("Please fill all required blog fields");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("adminToken");
      const isEdit = Boolean(editingBlog?._id);
      const endpoint = isEdit
        ? `${API_BASE}/api/admin/blogs/${editingBlog._id}`
        : `${API_BASE}/api/admin/blogs`;

      const res = await fetch(endpoint, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title,
          slug: form.slug,
          excerpt: form.excerpt,
          content: form.content,
          image: form.image,
          gallery: form.galleryText,
          categoryLabel: form.categoryLabel,
          category: form.category,
          tags: form.tagsText,
          sectionLabel: form.sectionLabel,
          section: form.section,
          isPublished: form.isPublished,
          isFeatured: form.isFeatured,
          isPopular: form.isPopular,
          heroRank: form.heroRank,
          sectionOrder: form.sectionOrder,
          cardOrder: form.cardOrder,
          readTime: form.readTime,
          authorName: form.authorName,
          seoTitle: form.seoTitle,
          seoDescription: form.seoDescription,
          publishedAt: form.publishedAt,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save blog");
      }

      toast.success(isEdit ? "Blog updated successfully" : "Blog created successfully");
      resetForm();
      await Promise.all([fetchBlogs(), fetchBlogMeta()]);
    } catch (error) {
      toast.error(error.message || "Failed to save blog");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget && selectedIds.length === 0) return;

    try {
      const token = localStorage.getItem("adminToken");
      const isBulkDelete = !deleteTarget && selectedIds.length > 0;

      const res = await fetch(
        isBulkDelete
          ? `${API_BASE}/api/admin/blogs/delete-many`
          : `${API_BASE}/api/admin/blogs/${deleteTarget._id}`,
        {
          method: isBulkDelete ? "POST" : "DELETE",
          headers: {
            ...(isBulkDelete ? { "Content-Type": "application/json" } : {}),
            Authorization: `Bearer ${token}`,
          },
          ...(isBulkDelete ? { body: JSON.stringify({ ids: selectedIds }) } : {}),
        }
      );

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete blog");
      }

      toast.success(
        isBulkDelete ? "Selected blogs deleted successfully" : "Blog deleted successfully"
      );
      setDeleteOpen(false);
      setDeleteTarget(null);
      setSelectedIds([]);

      if (blogs.length === 1 && page > 1) {
        setPage((prev) => Math.max(1, prev - 1));
      } else {
        fetchBlogs();
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete blog");
    }
  };

  const allVisibleSelected =
    blogs.length > 0 && blogs.every((blog) => selectedIds.includes(blog._id));

  const selectedCount = selectedIds.length;

  const toggleBlogSelection = (blogId) => {
    setSelectedIds((prev) =>
      prev.includes(blogId) ? prev.filter((id) => id !== blogId) : [...prev, blogId]
    );
  };

  const toggleSelectAllVisible = () => {
    const visibleIds = blogs.map((blog) => blog._id);

    setSelectedIds((prev) => {
      if (allVisibleSelected) {
        return prev.filter((id) => !visibleIds.includes(id));
      }

      return Array.from(new Set([...prev, ...visibleIds]));
    });
  };

  const emptyStateLabel = useMemo(() => {
    if (search.trim()) return "No blogs match your search yet.";
    if (status === "published") return "No published blogs found.";
    if (status === "draft") return "No draft blogs found.";
    return "No blogs available yet.";
  }, [search, status]);

  return (
    <div className="min-w-0">
      <AdminBreadcrumbs
        items={[
          { label: "Home", href: "/admin" },
          { label: "Content", href: "" },
          { label: "Blogs", href: "/admin/blogs" },
        ]}
        mode={null}
      />
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">All Blogs</h1>
          <p className="text-sm text-muted-foreground">
            Manage blog uploads, section placement, and storefront publishing from one page.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setForm({ ...emptyForm, publishedAt: toLocalDateTimeInput(new Date()) });
            setFormErrors({});
            setEditingBlog(null);
            setFormOpen(true);
          }}
          className="btn-primary flex w-full items-center justify-center gap-2 px-4 py-2 text-sm sm:w-auto"
        >
          <Plus size={15} /> Add Blog
        </button>
      </div>

      <div className="mb-4 grid gap-4 xl:grid-cols-3">
        <div className="admin-card flex items-center gap-3 p-4">
          <div className="rounded-full bg-primary/10 p-3 text-primary">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total blogs</p>
            <p className="text-2xl font-semibold">{stats.totalBlogs}</p>
          </div>
        </div>

        <div className="admin-card flex items-center gap-3 p-4">
          <div className="rounded-full bg-emerald-100 p-3 text-emerald-700">
            <Eye className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Published</p>
            <p className="text-2xl font-semibold">{stats.publishedCount}</p>
          </div>
        </div>

        <div className="admin-card flex items-center gap-3 p-4">
          <div className="rounded-full bg-amber-100 p-3 text-amber-700">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Drafts</p>
            <p className="text-2xl font-semibold">{stats.draftCount}</p>
          </div>
        </div>
      </div>

      <div className="admin-card mb-4 p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex w-full flex-col gap-3 md:flex-row">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none transition focus:border-primary"
                placeholder="Search title, slug, category, section..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
          </div>

          {selectedCount > 0 ? (
            <button
              type="button"
              onClick={() => {
                setDeleteTarget(null);
                setDeleteOpen(true);
              }}
              className="btn-destructive flex w-full items-center justify-center gap-2 px-4 py-2 text-sm xl:w-auto"
            >
              <Trash2 size={15} /> Delete Blogs ({selectedCount})
            </button>
          ) : null}
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 lg:hidden">
          {loading ? (
            <div className="admin-card p-5 text-sm text-muted-foreground">Loading blogs...</div>
          ) : blogs.length === 0 ? (
            <div className="admin-card p-5 text-sm text-muted-foreground">{emptyStateLabel}</div>
          ) : (
            blogs.map((blog) => {
              const isSelected = selectedIds.includes(blog._id);

              return (
                <div key={blog._id} className="admin-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 accent-primary"
                        checked={isSelected}
                        onChange={() => toggleBlogSelection(blog._id)}
                        aria-label={`Select ${blog.title}`}
                      />

                      <div className="flex min-w-0 items-start gap-3">
                        <div className="h-16 w-16 overflow-hidden rounded-lg border border-border bg-muted">
                          {blog.image ? (
                            <img
                              src={resolveMediaUrl(blog.image)}
                              alt={blog.title}
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>

                        <div className="min-w-0">
                          <p className="line-clamp-2 font-semibold text-foreground">
                            {blog.title}
                          </p>
                          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                            /{blog.slug}
                          </p>
                        </div>
                      </div>
                    </label>

                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(blog)}
                        className="inline-flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700"
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteTarget(blog);
                          setDeleteOpen(true);
                        }}
                        className="inline-flex items-center justify-center gap-1 rounded-lg bg-red-500 px-3 py-2 text-xs font-medium text-white transition hover:bg-red-600"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Section
                      </p>
                      <p className="mt-1 font-medium text-foreground">{blog.sectionLabel}</p>
                      <p className="text-xs text-muted-foreground">{blog.section}</p>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Category
                      </p>
                      <p className="mt-1 font-medium text-foreground">{blog.categoryLabel}</p>
                      <p className="text-xs text-muted-foreground">{blog.category}</p>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Status
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            blog.isPublished
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {blog.isPublished ? "Published" : "Draft"}
                        </span>
                        {blog.isFeatured ? (
                          <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                            Featured
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Order
                      </p>
                      <div className="mt-1 space-y-1 text-sm text-foreground">
                        <p>Hero: {blog.heroRank ?? 0}</p>
                        <p>Section: {blog.sectionOrder ?? 0}</p>
                        <p>Card: {blog.cardOrder ?? 0}</p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Published
                      </p>
                      <p className="mt-1 text-sm text-foreground">{formatDate(blog.publishedAt)}</p>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Updated
                      </p>
                      <p className="mt-1 text-sm text-foreground">{formatDate(blog.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="hidden lg:block">
          <div className="admin-card min-w-0 overflow-hidden">
            <div className="p-4">
              <table className="w-full table-fixed text-xs xl:text-sm">
            <thead>
              <tr className="bg-muted/30 text-left text-foreground">
                <th className="w-12 px-4 py-4">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-primary"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAllVisible}
                    aria-label="Select all visible blogs"
                  />
                </th>
                <th className="w-[28%] px-4 py-4 font-semibold">Blog</th>
                <th className="w-[14%] px-4 py-4 font-semibold">Section</th>
                <th className="w-[12%] px-4 py-4 font-semibold">Category</th>
                <th className="w-[12%] px-4 py-4 font-semibold">Status</th>
                <th className="hidden w-[12%] px-4 py-4 font-semibold xl:table-cell">Order</th>
                <th className="w-[12%] px-4 py-4 font-semibold">Published</th>
                <th className="hidden w-[10%] px-4 py-4 font-semibold 2xl:table-cell">Updated</th>
                <th className="w-[12%] px-4 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                    Loading blogs...
                  </td>
                </tr>
              ) : blogs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                    {emptyStateLabel}
                  </td>
                </tr>
              ) : (
                blogs.map((blog) => {
                  const isSelected = selectedIds.includes(blog._id);

                  return (
                    <tr key={blog._id} className="border-b border-border/60 last:border-b-0">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-primary"
                          checked={isSelected}
                          onChange={() => toggleBlogSelection(blog._id)}
                          aria-label={`Select ${blog.title}`}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="h-14 w-14 overflow-hidden rounded-lg border border-border bg-muted">
                            {blog.image ? (
                              <img
                                src={resolveMediaUrl(blog.image)}
                                alt={blog.title}
                                className="h-full w-full object-cover"
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <p className="line-clamp-1 font-semibold text-foreground">
                              {blog.title}
                            </p>
                            <p className="line-clamp-1 text-xs text-muted-foreground">
                              /{blog.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-foreground">{blog.sectionLabel}</p>
                          <p className="text-xs text-muted-foreground xl:hidden">
                            Order {blog.cardOrder ?? 0}
                          </p>
                          <p className="hidden text-xs text-muted-foreground xl:block">
                            {blog.section}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-foreground">{blog.categoryLabel}</p>
                          <p className="text-xs text-muted-foreground">{blog.category}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium ${
                              blog.isPublished
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {blog.isPublished ? "Published" : "Draft"}
                          </span>
                          {blog.isFeatured ? (
                            <span className="inline-flex w-fit rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                              Featured
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="hidden px-4 py-4 text-muted-foreground xl:table-cell">
                        <div className="space-y-1">
                          <p>Hero: {blog.heroRank ?? 0}</p>
                          <p>Section: {blog.sectionOrder ?? 0}</p>
                          <p>Card: {blog.cardOrder ?? 0}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CalendarDays className="h-4 w-4" />
                          <span>{formatDate(blog.publishedAt)}</span>
                        </div>
                      </td>
                      <td className="hidden px-4 py-4 text-muted-foreground 2xl:table-cell">
                        {formatDate(blog.updatedAt)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(blog)}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700 xl:px-4 xl:text-sm"
                          >
                            <Pencil size={14} /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteTarget(blog);
                              setDeleteOpen(true);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-500 px-3 py-2 text-xs font-medium text-white transition hover:bg-red-600 xl:px-4 xl:text-sm"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {!loading && pagination.totalPages > 0 ? (
        <PaginationComponent
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          limit={pagination.limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
          className="mt-4 px-0 py-0"
        />
      ) : null}

      <BlogFormModal
        open={formOpen}
        onClose={resetForm}
        onSubmit={handleSubmit}
        form={form}
        setFormField={setFormField}
        onSectionChange={handleSectionChange}
        onCategoryLabelChange={handleCategoryLabelChange}
        submitting={submitting}
        mode={editingBlog ? "edit" : "add"}
        categoryOptions={categoryOptions}
        sectionOptions={sectionOptions}
        onImageUpload={handleImageUpload}
        onGalleryUpload={handleGalleryUpload}
        uploadingImage={uploadingImage}
        uploadingGallery={uploadingGallery}
        errors={formErrors}
      />

      <DeleteConfirmModal
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        title={
          deleteTarget
            ? `Delete ${deleteTarget?.title || "blog"}?`
            : `Delete ${selectedCount} selected blog${selectedCount === 1 ? "" : "s"}?`
        }
        btnName="Delete"
      />
    </div>
  );
}
