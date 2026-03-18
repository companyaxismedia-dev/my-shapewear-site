"use client";
import { useEffect, useState, useCallback } from "react";
import { API_BASE } from "@/lib/api";
import { toast } from "sonner";
import AdminBreadcrumbs from "@/components/admin/AdminBreadcrumbs";
import BannerTable from "./BannerTable";
import BannerModal from "./BannerModal";
import DeleteConfirmModal from "@/components/admin/modals/DeleteConfirmModal";
import PaginationComponent from "@/components/admin/common/PaginationComponent";

export default function AdminBannerPage() {
  const [allBanners, setAllBanners] = useState([]);
  const [banners, setBanners] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editBanner, setEditBanner] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState(25);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchBanners = useCallback(async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const [bannersRes, pageRes] = await Promise.all([
        fetch(`${API_BASE}/api/banner?includeInactive=true`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/admin/pages/home`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const bannersData = await bannersRes.json();
      const pageData = await pageRes.json();

      const allBannersArray = Array.isArray(bannersData) ? bannersData : [];
      setAllBanners(allBannersArray);
      
      // Calculate pagination
      const totalPages = Math.ceil(allBannersArray.length / rows) || 1;
      setPages(totalPages);
      
      // Slice for current page
      const startIdx = (page - 1) * rows;
      const endIdx = startIdx + rows;
      setBanners(allBannersArray.slice(startIdx, endIdx));
      
      setSections(pageData?.sections || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed loading banners");
    }
  }, [page, rows]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleSelect = (id) => {
    setSelectedIds((ids) => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);
  };
  const handleSelectAll = () => {
    setSelectedIds(banners.map(b => b._id));
  };
  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const openAddModal = () => {
    setEditBanner(null);
    setModalOpen(true);
  };
  const openEditModal = (banner) => {
    setEditBanner(banner);
    setModalOpen(true);
  };
  const closeModal = () => {
    setEditBanner(null);
    setModalOpen(false);
  };

  const handleSave = async (formData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const data = new FormData();
      data.append("altText", formData.altText || "");
      data.append("link", formData.link || "");
      data.append("active", formData.active ? "true" : "false");
      data.append("sectionId", formData.sectionId || "");
      if (formData.desktop) data.append("desktop", formData.desktop);
      if (formData.mobile) data.append("mobile", formData.mobile);

      let url, method;
      if (editBanner) {
        url = `${API_BASE}/api/banner/${editBanner._id}`;
        method = "PUT";
      } else {
        url = `${API_BASE}/api/banner`;
        method = "POST";
      }
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      if (!res.ok) {
        const errMsg = await res.text();
        throw new Error(errMsg);
      }
      toast.success(editBanner ? "Banner updated!" : "Banner added!");
      await fetchBanners();
      closeModal();
    } catch (err) {
      toast.error(err.message || "Failed to save banner");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleteTarget(id);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      let response;
      if (deleteTarget) {
        response = await fetch(`${API_BASE}/api/banner/${deleteTarget}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        response = await fetch(`${API_BASE}/api/banner/delete-many`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ids: selectedIds }),
        });
      }
      if (!response.ok) throw new Error("Delete failed");
      toast.success(deleteTarget ? "Banner deleted!" : "Banners deleted!");
      setDeleteOpen(false);
      setDeleteTarget(null);
      setSelectedIds([]);
      await fetchBanners();
    } catch (err) {
      toast.error(err.message || "Failed to delete banner");
    }
  };

  const handleBulkDelete = () => {
    if (!selectedIds.length) {
      toast.error("Select banners first");
      return;
    }
    setDeleteTarget(null);
    setDeleteOpen(true);
  };

  const handleToggle = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");
      
      // Optimistic update - toggle immediately in UI
      const updatedAllBanners = allBanners.map(b => 
        b._id === id ? { ...b, active: !b.active } : b
      );
      setAllBanners(updatedAllBanners);
      
      // Update current page display
      const startIdx = (page - 1) * rows;
      const endIdx = startIdx + rows;
      setBanners(updatedAllBanners.slice(startIdx, endIdx));
      
      // Then verify with server
      const res = await fetch(`${API_BASE}/api/banner/${id}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error("Failed to toggle banner");
      }
      
      toast.success("Banner status updated!");
      
      // Refresh to make sure everything is synced
      await fetchBanners();
    } catch (err) {
      console.error("Toggle error:", err);
      toast.error(err.message || "Failed to toggle banner");
      // Revert the optimistic update on error
      await fetchBanners();
    }
  };

  return (
    <>
      <AdminBreadcrumbs
        items={[
          { label: "Home", href: "/admin" },
          { label: "MyShop", href: "" },
          { label: "Banners", href: "/admin/banner" },
        ]}
        mode={null}
      />
      <h1 className="text-2xl font-bold mb-5">All Banners</h1>
      <div className="admin-card p-4 mb-4 flex justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          <button onClick={openAddModal} className="btn-primary px-4 py-2 flex items-center gap-2 text-sm">
            + Add Banner
          </button>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={handleBulkDelete}
            className="btn-destructive px-4 py-2 flex items-center gap-2 text-sm whitespace-nowrap"
          >
            Delete Banner
          </button>
        </div>
      </div>
      <div className="admin-card overflow-x-auto">
        <BannerTable
          banners={banners}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onEdit={openEditModal}
          onDelete={handleDelete}
          onToggle={handleToggle}
        />
      </div>
      <BannerModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleSave}
        initialData={editBanner}
        loading={loading}
        sections={sections}
      />
      <DeleteConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
        title={deleteTarget ? "Delete Banner?" : "Delete Selected Banners?"}
        btnName="Delete"
      />

      <PaginationComponent
        currentPage={page}
        totalPages={pages}
        limit={rows}
        onPageChange={(newPage) => setPage(newPage)}
        onLimitChange={(newLimit) => {
          setRows(newLimit);
          setPage(1);
        }}
        className="mt-4"
      />

    </>
  );
}
