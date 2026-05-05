"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgePercent,
  CalendarDays,
  CheckCircle2,
  Pencil,
  Plus,
  Search,
  TicketPercent,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import AdminBreadcrumbs from "@/components/admin/AdminBreadcrumbs";
import DeleteConfirmModal from "@/components/admin/modals/DeleteConfirmModal";
import PaginationComponent from "@/components/admin/common/PaginationComponent";
import { API_BASE } from "@/lib/api";

const emptyForm = {
  title: "",
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  minOrderValue: 0,
  maxDiscount: "",
  usageLimit: 0,
  isActive: true,
  startDate: "",
  endDate: "",
  applicableCategoriesText: "",
  applicableProductsText: "",
};

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary";

const textareaClass = `${inputClass} min-h-24 resize-y`;

function toDateInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function splitTextList(value = "") {
  return String(value)
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatCurrency(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;
}

function getOfferText(offer) {
  if (offer.discountType === "flat") return `${formatCurrency(offer.discountValue)} OFF`;
  return `${offer.discountValue || 0}% OFF`;
}

function getStatus(offer) {
  const now = new Date();
  const startsAt = offer.startDate ? new Date(offer.startDate) : null;
  const endsAt = offer.endDate ? new Date(offer.endDate) : null;

  if (!offer.isActive) return { label: "Inactive", className: "bg-slate-100 text-slate-600" };
  if (startsAt && startsAt > now) return { label: "Scheduled", className: "bg-blue-50 text-blue-700" };
  if (endsAt && endsAt < now) return { label: "Expired", className: "bg-red-50 text-red-700" };
  return { label: "Active", className: "bg-emerald-50 text-emerald-700" };
}

function OfferFormModal({
  open,
  mode,
  form,
  setForm,
  onClose,
  onSubmit,
  submitting,
}) {
  if (!open) return null;

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-[999] overflow-y-auto bg-black/45 p-4">
      <div className="mx-auto w-full max-w-5xl">
        <div className="admin-card overflow-hidden">
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold">
                {mode === "edit" ? "Edit Offer" : "Create Offer"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage coupon rules used by cart, checkout, account coupons, and payment offers.
              </p>
            </div>
            <button type="button" onClick={onClose} className="btn-muted p-2">
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="grid gap-5 p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Offer Title <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputClass}
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="e.g. Summer shaping sale"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Coupon Code <span className="text-red-500">*</span>
                </label>
                <input
                  className={`${inputClass} uppercase`}
                  value={form.code}
                  onChange={(e) => setField("code", e.target.value.toUpperCase())}
                  placeholder="SAVE20"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Description
                </label>
                <textarea
                  className={textareaClass}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="Short message shown to customers."
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Discount Type <span className="text-red-500">*</span>
                </label>
                <select
                  className={inputClass}
                  value={form.discountType}
                  onChange={(e) => setField("discountType", e.target.value)}
                >
                  <option value="percentage">Percentage</option>
                  <option value="flat">Flat Amount</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Discount Value <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputClass}
                  type="number"
                  min="1"
                  value={form.discountValue}
                  onChange={(e) => setField("discountValue", e.target.value)}
                  placeholder={form.discountType === "flat" ? "500" : "20"}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Minimum Order Value
                </label>
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  value={form.minOrderValue}
                  onChange={(e) => setField("minOrderValue", e.target.value)}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Max Discount
                </label>
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  value={form.maxDiscount}
                  onChange={(e) => setField("maxDiscount", e.target.value)}
                  placeholder="Only used for percentage offers"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Usage Limit
                </label>
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  value={form.usageLimit}
                  onChange={(e) => setField("usageLimit", e.target.value)}
                  placeholder="0 means unlimited"
                />
              </div>

              <div className="rounded-lg border border-border bg-muted/30 px-3 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Used Count
                </p>
                <p className="mt-1 text-xl font-semibold text-foreground">Auto tracked after checkout</p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Start Date
                </label>
                <input
                  className={inputClass}
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setField("startDate", e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputClass}
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setField("endDate", e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Applicable Categories
                </label>
                <textarea
                  className={textareaClass}
                  value={form.applicableCategoriesText}
                  onChange={(e) => setField("applicableCategoriesText", e.target.value)}
                  placeholder="Comma or line separated category names/slugs. Leave blank for all."
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Applicable Product IDs
                </label>
                <textarea
                  className={textareaClass}
                  value={form.applicableProductsText}
                  onChange={(e) => setField("applicableProductsText", e.target.value)}
                  placeholder="Comma or line separated Mongo product IDs. Leave blank for all."
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-3">
                <div>
                  <p className="text-sm font-medium">Active Offer</p>
                  <p className="text-xs text-muted-foreground">
                    Active offers are visible to customers when inside the valid date range.
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={form.isActive}
                  onChange={(e) => setField("isActive", e.target.checked)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={onClose} className="btn-muted px-4 py-2">
                Cancel
              </button>
              <button type="submit" className="btn-primary px-4 py-2" disabled={submitting}>
                {submitting ? "Saving..." : mode === "edit" ? "Update Offer" : "Create Offer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminOffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE}/api/admin/offers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load offers");
      }

      setOffers(Array.isArray(data.offers) ? data.offers : []);
    } catch (error) {
      toast.error(error.message || "Failed to load offers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, limit]);

  const stats = useMemo(() => {
    const now = new Date();
    return offers.reduce(
      (acc, offer) => {
        const endsAt = offer.endDate ? new Date(offer.endDate) : null;
        acc.total += 1;
        if (offer.isActive && (!endsAt || endsAt >= now)) acc.active += 1;
        if (endsAt && endsAt < now) acc.expired += 1;
        acc.used += Number(offer.usedCount || 0);
        return acc;
      },
      { total: 0, active: 0, expired: 0, used: 0 }
    );
  }, [offers]);

  const filteredOffers = useMemo(() => {
    const q = search.trim().toLowerCase();

    return offers.filter((offer) => {
      const status = getStatus(offer).label.toLowerCase();
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      const matchesSearch =
        !q ||
        [offer.title, offer.code, offer.description, offer.discountType]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [offers, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOffers.length / limit));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * limit;
  const paginatedOffers = filteredOffers.slice(pageStart, pageStart + limit);

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingOffer(null);
    setFormOpen(false);
  };

  const openAddModal = () => {
    setForm({ ...emptyForm, startDate: toDateInput(new Date()) });
    setEditingOffer(null);
    setFormOpen(true);
  };

  const openEditModal = (offer) => {
    setEditingOffer(offer);
    setForm({
      title: offer.title || "",
      code: offer.code || "",
      description: offer.description || "",
      discountType: offer.discountType || "percentage",
      discountValue: offer.discountValue ?? "",
      minOrderValue: offer.minOrderValue ?? 0,
      maxDiscount: offer.maxDiscount ?? "",
      usageLimit: offer.usageLimit ?? 0,
      isActive: offer.isActive !== false,
      startDate: toDateInput(offer.startDate),
      endDate: toDateInput(offer.endDate),
      applicableCategoriesText: Array.isArray(offer.applicableCategories)
        ? offer.applicableCategories.join(", ")
        : "",
      applicableProductsText: Array.isArray(offer.applicableProducts)
        ? offer.applicableProducts.map((item) => item?._id || item).join(", ")
        : "",
    });
    setFormOpen(true);
  };

  const buildPayload = () => ({
    title: form.title.trim(),
    code: form.code.trim().toUpperCase(),
    description: form.description.trim(),
    discountType: form.discountType,
    discountValue: Number(form.discountValue || 0),
    minOrderValue: Number(form.minOrderValue || 0),
    maxDiscount:
      form.discountType === "percentage" && form.maxDiscount !== ""
        ? Number(form.maxDiscount)
        : null,
    usageLimit: Number(form.usageLimit || 0),
    isActive: Boolean(form.isActive),
    startDate: form.startDate || new Date().toISOString(),
    endDate: form.endDate,
    applicableCategories: splitTextList(form.applicableCategoriesText),
    applicableProducts: splitTextList(form.applicableProductsText),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      const payload = buildPayload();

      if (!payload.title || !payload.code || !payload.discountValue || !payload.endDate) {
        throw new Error("Title, code, discount value, and end date are required");
      }

      const token = localStorage.getItem("adminToken");
      const isEdit = Boolean(editingOffer?._id);
      const res = await fetch(
        isEdit
          ? `${API_BASE}/api/admin/offers/${editingOffer._id}`
          : `${API_BASE}/api/admin/offers`,
        {
          method: isEdit ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save offer");
      }

      toast.success(isEdit ? "Offer updated successfully" : "Offer created successfully");
      resetForm();
      fetchOffers();
    } catch (error) {
      toast.error(error.message || "Failed to save offer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?._id) return;

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE}/api/admin/offers/${deleteTarget._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete offer");
      }

      toast.success("Offer deleted successfully");
      setDeleteOpen(false);
      setDeleteTarget(null);
      fetchOffers();
    } catch (error) {
      toast.error(error.message || "Failed to delete offer");
    }
  };

  const toggleOfferStatus = async (offer) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE}/api/admin/offers/${offer._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !offer.isActive }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update offer status");
      }

      toast.success(!offer.isActive ? "Offer activated" : "Offer deactivated");
      fetchOffers();
    } catch (error) {
      toast.error(error.message || "Failed to update offer status");
    }
  };

  return (
    <>
      <AdminBreadcrumbs
        items={[
          { label: "Home", href: "/admin" },
          { label: "Offers", href: "/admin/offers" },
        ]}
        mode={null}
      />

      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Offers</h1>
          <p className="text-sm text-muted-foreground">
            Create, edit, delete, and activate coupons shown across cart, checkout, and account coupons.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="btn-primary flex w-full items-center justify-center gap-2 px-4 py-2 text-sm sm:w-auto"
        >
          <Plus size={15} /> Create Offer
        </button>
      </div>

      <div className="mb-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="admin-card flex items-center gap-3 p-4">
          <div className="rounded-full bg-primary/10 p-3 text-primary">
            <TicketPercent className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total offers</p>
            <p className="text-2xl font-semibold">{stats.total}</p>
          </div>
        </div>

        <div className="admin-card flex items-center gap-3 p-4">
          <div className="rounded-full bg-emerald-50 p-3 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active offers</p>
            <p className="text-2xl font-semibold">{stats.active}</p>
          </div>
        </div>

        <div className="admin-card flex items-center gap-3 p-4">
          <div className="rounded-full bg-red-50 p-3 text-red-600">
            <XCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Expired offers</p>
            <p className="text-2xl font-semibold">{stats.expired}</p>
          </div>
        </div>

        <div className="admin-card flex items-center gap-3 p-4">
          <div className="rounded-full bg-violet-50 p-3 text-violet-600">
            <BadgePercent className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total redemptions</p>
            <p className="text-2xl font-semibold">{stats.used}</p>
          </div>
        </div>
      </div>

      <div className="admin-card mb-4 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none transition focus:border-primary"
              placeholder="Search title, code, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              className={inputClass}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="expired">Expired</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="grid gap-3 p-3 sm:p-4">
          {loading ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
              Loading offers...
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
              No offers found.
            </div>
          ) : (
            paginatedOffers.map((offer) => {
              const status = getStatus(offer);
              const categoryCount = offer.applicableCategories?.length || 0;
              const productCount = offer.applicableProducts?.length || 0;

              return (
                <article
                  key={offer._id}
                  className="rounded-xl border border-border/70 bg-white p-4 shadow-sm"
                >
                  <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(180px,1.5fr)_minmax(110px,0.8fr)_minmax(120px,0.9fr)_minmax(130px,1fr)_minmax(150px,1fr)_minmax(110px,0.8fr)_minmax(130px,0.9fr)_auto] xl:items-center">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground sm:text-base">
                        {offer.title}
                      </p>
                      {offer.description ? (
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                          {offer.description}
                        </p>
                      ) : null}
                    </div>

                    <div className="min-w-0">
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground xl:hidden">
                        Code
                      </p>
                      <span className="inline-flex max-w-full rounded-full bg-muted px-3 py-1 text-xs font-bold tracking-wide text-foreground">
                        <span className="truncate">{offer.code}</span>
                      </span>
                    </div>

                    <div>
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground xl:hidden">
                        Discount
                      </p>
                      <p className="text-sm font-semibold text-foreground">{getOfferText(offer)}</p>
                      <p className="mt-1 text-xs capitalize text-muted-foreground">{offer.discountType}</p>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground xl:hidden">
                        Rules
                      </p>
                      <p>Min: {formatCurrency(offer.minOrderValue)}</p>
                      <p>Max: {offer.maxDiscount ? formatCurrency(offer.maxDiscount) : "-"}</p>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground xl:hidden">
                        Validity
                      </p>
                      <div className="flex items-start gap-2">
                        <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <div>
                          <p>{formatDate(offer.startDate)}</p>
                          <p>to {formatDate(offer.endDate)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground xl:hidden">
                        Usage
                      </p>
                      <p>{offer.usedCount || 0} used</p>
                      <p>{offer.usageLimit ? `${offer.usageLimit} limit` : "Unlimited"}</p>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground xl:hidden">
                        Targets
                      </p>
                      <p>{categoryCount ? `${categoryCount} categories` : "All categories"}</p>
                      <p>{productCount ? `${productCount} products` : "All products"}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                      <button
                        type="button"
                        onClick={() => toggleOfferStatus(offer)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                      >
                        {status.label}
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(offer)}
                        className="btn-muted flex items-center gap-1 px-3 py-2 text-xs"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteTarget(offer);
                          setDeleteOpen(true);
                        }}
                        className="btn-destructive flex items-center gap-1 px-3 py-2 text-xs"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      </div>

      <OfferFormModal
        open={formOpen}
        mode={editingOffer ? "edit" : "add"}
        form={form}
        setForm={setForm}
        onClose={resetForm}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <DeleteConfirmModal
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        title={`Delete ${deleteTarget?.code || "Offer"}?`}
        btnName="Delete Offer"
      />
    </>
  );
}
