"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import AdminBreadcrumbs from "@/components/admin/AdminBreadcrumbs";
import DeleteConfirmModal from "@/components/admin/modals/DeleteConfirmModal";
import SectionEditorModal from "@/components/admin/page/SectionEditorModal";
import BlockEditorModal from "@/components/admin/page/BlockEditorModal";
import { API_BASE } from "@/lib/api";

export default function AdminPageHome() {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [editSection, setEditSection] = useState(null);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [editBlock, setEditBlock] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const loadPage = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE}/api/admin/pages/home`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPage(data);
    } catch (err) {
      toast.error("Failed to load homepage sections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, []);

  const openNewSection = () => {
    setEditSection(null);
    setSectionModalOpen(true);
  };

  const handleEditSection = (section) => {
    setEditSection(section);
    setSectionModalOpen(true);
  };

  const handleDeleteSection = (section) => {
    setConfirmDelete({ type: 'section', target: section });
  };

  const handleEditBlocks = (section) => {
    setActiveSection(section);
    setEditBlock(null);
    setBlockModalOpen(true);
  };

  const handleSaveSection = async (section) => {
    const token = localStorage.getItem("adminToken");
    const method = section._id ? "PUT" : "POST";
    const url = section._id
      ? `${API_BASE}/api/admin/sections/${section._id}`
      : `${API_BASE}/api/admin/pages/home/sections`;

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(section),
    });

    if (!res.ok) {
      const err = await res.json();
      toast.error(err.message || "Failed to save section");
      return;
    }

    toast.success("Section saved");
    setSectionModalOpen(false);
    await loadPage();
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    const { type, target } = confirmDelete;
    const token = localStorage.getItem("adminToken");

    try {
      if (type === 'section') {
        const res = await fetch(`${API_BASE}/api/admin/sections/${target._id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const err = await res.json();
          toast.error(err.message || 'Failed to delete section');
          setConfirmDelete(null);
          return;
        }
        toast.success('Section removed');
      } else if (type === 'block') {
        const res = await fetch(`${API_BASE}/api/admin/blocks/${target._id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const err = await res.json();
          toast.error(err.message || 'Failed to delete block');
          setConfirmDelete(null);
          return;
        }
        toast.success('Block removed');
      }
      setConfirmDelete(null);
      await loadPage();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const openNewBlock = (section) => {
    setActiveSection(section);
    setEditBlock(null);
    setBlockModalOpen(true);
  };

  const handleEditBlock = (section, block) => {
    setActiveSection(section);
    setEditBlock(block);
    setBlockModalOpen(true);
  };

  const handleSaveBlock = async (sectionId, block) => {
    const token = localStorage.getItem("adminToken");

    const isFormData = block instanceof FormData;
    const blockId = isFormData ? block.get("_id") : block._id;

    const url = blockId
      ? `${API_BASE}/api/admin/blocks/${blockId}`
      : `${API_BASE}/api/admin/sections/${sectionId}/blocks`;
    const method = blockId ? "PUT" : "POST";

    if (isFormData) {
      console.log('📤 Sending FormData to:', url);
      console.log('   Has desktop file:', block.has('desktop'));
      console.log('   Has mobile file:', block.has('mobile'));
    }

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      },
      body: isFormData ? block : JSON.stringify(block),
    });

    if (!res.ok) {
      const err = await res.json();
      toast.error(err.message || "Failed to save block");
      console.error('❌ Block save error:', err);
      return;
    }

    const savedData = await res.json();
    console.log('✅ Block saved:', savedData);
    toast.success("Block saved");
    setBlockModalOpen(false);
    await loadPage();
  };

  if (loading) {
    return <div className="py-20 text-center">Loading...</div>;
  }

  return (
    <>
      <AdminBreadcrumbs
        items={[
          { label: "Home", href: "/admin" },
          { label: "MyShop", href: "" },
          { label: "Pages", href: "/admin/pages/home" },
        ]}
        mode={null}
      />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Homepage Sections</h1>
          <button
            onClick={openNewSection}
            className="btn-primary px-4 py-2 text-sm"
          >
            + Add Section
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>ℹ️ Hero Slider (PRIMARY):</strong> The hero section appears at the top of your homepage and can only be created once. 
            It cannot be deleted but can be edited. Add blocks to control the images displayed.
          </p>
        </div>

        <div className="grid gap-4">
          {page.sections?.map((section) => (
            <div key={section._id} className="bg-white shadow-sm rounded-xl border p-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{section.type}</p>
                    {section.type === 'hero_slider' && (
                      <span className="bg-pink-100 text-pink-700 text-xs px-2 py-1 rounded-full font-semibold">
                        PRIMARY
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{section.title || 'No title'}</p>
                  <p className="text-xs text-gray-400">Order: {section.order}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="btn-muted px-3"
                    onClick={() => handleEditSection(section)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-primary px-3"
                    onClick={() => openNewBlock(section)}
                  >
                    + Block
                  </button>
                  <button
                    className={`px-3 ${section.type === 'hero_slider' ? 'btn-muted opacity-50 cursor-not-allowed' : 'btn-destructive'}`}
                    onClick={() => handleDeleteSection(section)}
                    disabled={section.type === 'hero_slider'}
                    title={section.type === 'hero_slider' ? 'Hero Slider section cannot be deleted' : ''}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="mt-4 grid gap-2">
                {section.blocks?.map((block) => (
                  <div
                    key={block._id}
                    className="bg-gray-50 rounded-lg border p-3 flex justify-between items-start"
                  >
                    <div>
                      <p className="text-sm">
                        <span className="font-semibold">Block:</span> {block._id}
                      </p>
                      <pre className="text-xs text-gray-600 mt-1 max-h-24 overflow-auto">
                        {JSON.stringify(block.data, null, 2)}
                      </pre>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        className="btn-muted px-3"
                        onClick={() => handleEditBlock(section, block)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-destructive px-3"
                        onClick={() => setConfirmDelete({ type: 'block', target: block })}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <SectionEditorModal
        open={sectionModalOpen}
        onClose={() => setSectionModalOpen(false)}
        onSave={handleSaveSection}
        initialData={editSection}
        existingSections={page?.sections || []}
      />

      <BlockEditorModal
        open={blockModalOpen}
        onClose={() => setBlockModalOpen(false)}
        onSave={(block) => handleSaveBlock(activeSection._id, block)}
        initialData={editBlock}
      />

      <DeleteConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeleteConfirm}
        title={confirmDelete?.type === 'section' ? 'Delete section?' : 'Delete block?'}
        btnName="Delete"
      />
    </>
  );
}
