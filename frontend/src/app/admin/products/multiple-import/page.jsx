"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import AdminBreadcrumbs from "@/components/admin/AdminBreadcrumbs";
import { API_BASE } from "@/lib/api";
import { productSchema } from "@/components/admin/ProductForm";
import dynamic from 'next/dynamic';
import PaginationComponent from "@/components/admin/common/PaginationComponent";
import SearchFilterComponent from "@/components/admin/common/SearchFilterComponent";
import ImportModal from "@/components/admin/ImportModal";
const ProductForm = dynamic(() => import('@/components/admin/ProductForm').then(mod => mod.ProductForm), { ssr: false });

const normalizePincodeRows = (rows = []) => {
  const list = Array.isArray(rows) ? rows : [];

  return list
    .map((entry) => {
      const source = entry && typeof entry === "object" ? entry : {};
      const rawPincode = source.pincode ?? source.pinCode ?? source.pin ?? entry ?? "";
      const estimatedDays = source.estimatedDays ?? source.deliveryDays ?? source.days ?? "3";
      const codValue = source.codAvailable ?? source.cod ?? source.cashOnDelivery;

      return {
        pincode: String(rawPincode).replace(/\D/g, "").slice(0, 6),
        codAvailable: codValue === undefined ? true : !(codValue === false || codValue === "false" || codValue === "0"),
        estimatedDays: String(estimatedDays || "3"),
      };
    })
    .filter((entry) => entry.pincode);
};

const withServiceablePincodes = (data) => {
  const serviceablePincodes = normalizePincodeRows(
    Array.isArray(data.serviceablePincodes) && data.serviceablePincodes.length
      ? data.serviceablePincodes
      : data.pincodes
  ).map((entry) => ({
    ...entry,
    estimatedDays: Number.parseInt(entry.estimatedDays, 10) || 3,
  }));

  const payload = { ...data, serviceablePincodes };
  delete payload.pincodes;
  return payload;
};

export default function MultipleImportPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [submittingIds, setSubmittingIds] = useState([]);
  const [selected, setSelected] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const formRef = useRef(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [importOpen, setImportOpen] = useState(false);


  const filteredItems = items.filter((item) =>
    item.data?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredItems.length / limit);

  const paginatedItems = filteredItems.slice(
    (page - 1) * limit,
    page * limit
  );

  useEffect(() => {
    const raw = sessionStorage.getItem('multiple_import_data');
    if (!raw) {
      // router.push('/admin/products');
      router.push("/admin/products/multiple-import") // for empty multiple import
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setItems(parsed.map((r, i) => ({ id: i, ...r })));
    } catch (err) {
      console.error(err);
      // router.push('/admin/products');
      router.push("/admin/products/multiple-import")

    }
  }, []);

  const submitSingle = async (itemId) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    try {
      // validate again
      await productSchema.validate(item.data, { abortEarly: false });
    } catch (err) {
      const updated = items.map(it => it.id === itemId ? { ...it, errors: err.errors || [err.message], valid: false } : it);
      setItems(updated);
      toast.error('Validation errors. Fix highlighted rows.');
      return;
    }

    try {
      setSubmittingIds(prev => [...prev, itemId]);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE}/api/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...withServiceablePincodes(item.data), status: 'published' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Create failed');
      toast.success('Product created');
      // remove item from preview after successful creation
      setItems(prev => {
        const remaining = prev.filter(it => it.id !== itemId);
        const toStore = remaining.map(p => ({ data: p.data, errors: p.errors, valid: p.valid, created: p.created, createdProductId: p.createdProductId }));
        sessionStorage.setItem('multiple_import_data', JSON.stringify(toStore));
        return remaining;
      });
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to create product');
    } finally {
      setSubmittingIds(prev => prev.filter(id => id !== itemId));
    }
  };

  const submitAll = async () => {
    const toSubmit = items.filter(i => !i.created);
    if (!toSubmit.length) {
      toast('Nothing to submit');
      return;
    }

    const token = localStorage.getItem('adminToken');
    const results = [];
    const createdIds = [];
    for (let it of toSubmit) {
      try {
        await productSchema.validate(it.data, { abortEarly: false });
      } catch (err) {
        // mark error and skip
        setItems(prev => prev.map(p => p.id === it.id ? { ...p, errors: err.errors || [err.message], valid: false } : p));
        results.push({ id: it.id, success: false, error: 'Validation failed' });
        continue;
      }

      try {
        const res = await fetch(`${API_BASE}/api/admin/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...withServiceablePincodes(it.data), status: 'published' }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Create failed');
        results.push({ id: it.id, success: true });
        createdIds.push(it.id);
      } catch (err) {
        results.push({ id: it.id, success: false, error: err.message });
        setItems(prev => prev.map(p => p.id === it.id ? { ...p, errors: [err.message || 'Submit failed'] } : p));
      }
    }
    // Remove created items from preview and update sessionStorage
    if (createdIds.length) {
      setItems(prev => {
        const remaining = prev.filter(p => !createdIds.includes(p.id));
        const toStore = remaining.map(p => ({ data: p.data, errors: p.errors, valid: p.valid, created: p.created, createdProductId: p.createdProductId }));
        sessionStorage.setItem('multiple_import_data', JSON.stringify(toStore));
        return remaining;
      });
    }

    const successCount = results.filter(r => r.success).length;
    toast.success(`${successCount} products created`);
    // Optionally navigate to all products after bulk create
    // router.push('/admin/products');
  };

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const deleteSelected = async () => {
    if (!selected.length) { toast.error('Select items first'); return; }
    try {
      const importId = items[0]?.importId;
      if (importId) {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`${API_BASE}/api/admin/imports/${importId}/delete-items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ indices: selected }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Delete failed');
      }
      // remove from UI and sessionStorage
      setItems(prev => prev.filter(p => !selected.includes(p.id)));
      const remaining = items.filter(p => !selected.includes(p.id)).map(p => ({ data: p.data, errors: p.errors, valid: p.valid, created: p.created, createdProductId: p.createdProductId }));
      sessionStorage.setItem('multiple_import_data', JSON.stringify(remaining));
      setSelected([]);
      toast.success('Deleted selected items');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to delete');
    }
  };

  const deleteSingle = async (itemId) => {
    try {
      const importId = items[0]?.importId;
      if (importId) {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`${API_BASE}/api/admin/imports/${importId}/delete-items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ indices: [itemId] }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Delete failed');
      }
      const remaining = items.filter(p => p.id !== itemId).map(p => ({ data: p.data, errors: p.errors, valid: p.valid, created: p.created, createdProductId: p.createdProductId }));
      sessionStorage.setItem('multiple_import_data', JSON.stringify(remaining));
      setItems(prev => prev.filter(p => p.id !== itemId));
      toast.success('Item deleted');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to delete');
    }
  };

  const openEdit = (item) => {
    const transformImportRow = (row) => {
      const copy = { ...row };

      // Normalize category
      if (copy.category) {
        if (typeof copy.category === 'string') {
          if (copy.category.startsWith('[')) {
            try {
              copy.category = JSON.parse(copy.category);
            } catch (e) {
              copy.category = [copy.category];
            }
          } else {
            copy.category = copy.category.split(',').map(c => c.trim()).filter(Boolean);
          }
        } else if (!Array.isArray(copy.category)) {
          copy.category = [String(copy.category)];
        }
      } else {
        copy.category = [];
      }

      // Normalize subcategory
      const subCatValue = copy.subCategory || copy.subcategory || "";
      copy.subCategory = typeof subCatValue === 'string' ? subCatValue.trim() : String(subCatValue);
      copy.subcategory = copy.subCategory;

      // Normalize delivery rules into the shape ProductForm expects while editing
      if (Array.isArray(copy.serviceablePincodes) && copy.serviceablePincodes.length) {
        copy.serviceablePincodes = normalizePincodeRows(copy.serviceablePincodes);
      } else if (Array.isArray(copy.pincodes)) {
        copy.serviceablePincodes = normalizePincodeRows(copy.pincodes);
      } else if (typeof copy.pincodes === 'string') {
        try {
          const parsed = JSON.parse(copy.pincodes);
          if (Array.isArray(parsed)) copy.serviceablePincodes = normalizePincodeRows(parsed);
        } catch (e) {
          copy.serviceablePincodes = normalizePincodeRows(copy.pincodes.split(/[;,]/).map(p => p.trim()).filter(Boolean));
        }
      }

      // Normalize variants to expected shape
      if (Array.isArray(copy.variants)) {
        copy.variants = copy.variants.map(v => {
          const uid = () => Math.random().toString(36).slice(2);

          // Convert sizes array to selectSizes and sizeDetails
          let selectedSizes = [];
          let sizeDetails = {};

          if (Array.isArray(v.sizes) && v.sizes.length > 0) {
            selectedSizes = v.sizes.map(s => s.size || s);
            sizeDetails = {};
            v.sizes.forEach(s => {
              const size = s.size || s;
              sizeDetails[size] = {
                sku: s.sku || "",
                price: s.price || 0,
                mrp: s.mrp || 0,
                stock: parseInt(s.stock) || 0,
                isActive: s.isActive !== false,
              };
            });
          }

          return {
            id: uid(),
            color: v.color || v.colorName || "",
            colorCode: v.colorCode || v.colorHex || "",
            video: v.video && !v.video.startsWith('blob:') ? v.video : "",
            images: Array.isArray(v.images)
              ? v.images.filter(img => img && img.url && !img.url.startsWith('blob:'))
              : [],
            selectedSizes: selectedSizes,
            sizeDetails: sizeDetails,
            isExpanded: true,
          };
        });
      }

      return copy;
    };

    setEditItem({ ...item, data: transformImportRow(item.data) });
  };

  const denormalizeFormData = (formData) => {
    // Convert ProductForm format back to import format
    const result = { ...formData };

    // Ensure both subCategory and subcategory are set
    const subCatValue = formData.subCategory || formData.subcategory || "";
    result.subCategory = typeof subCatValue === 'string' ? subCatValue.trim() : String(subCatValue);
    result.subcategory = result.subCategory;

    // Ensure thumbnail is preserved
    result.thumbnail = formData.thumbnail || "";

    // Preserve full delivery rules after editing imported rows
    if (Array.isArray(formData.pincodes)) {
      result.serviceablePincodes = normalizePincodeRows(formData.pincodes).map(p => ({
        pincode: p.pincode,
        codAvailable: p.codAvailable !== false,
        estimatedDays: Number.parseInt(p.estimatedDays, 10) || 3,
      }));
      result.pincodes = result.serviceablePincodes;
    }

    // Convert variants format back to import format
    if (Array.isArray(formData.variants)) {
      result.variants = formData.variants.map(v => {
        const variant = {
          color: v.color || "",
          colorCode: v.colorCode || "",
          colorName: v.color || "",
          colorHex: v.colorCode || "",
          video: v.video || "",
          images: [],
          sizes: [],
        };

        // Preserve images with all their properties (url, altText, isPrimary, order)
        if (Array.isArray(v.images) && v.images.length > 0) {
          variant.images = v.images.map(img => ({
            url: img.url || "",
            altText: img.altText || "",
            isPrimary: img.isPrimary !== false,
            order: typeof img.order === 'number' ? img.order : 0,
          }));
        }

        // Convert selectedSizes + sizeDetails back to sizes array
        if (Array.isArray(v.selectedSizes) && v.selectedSizes.length > 0) {
          variant.sizes = v.selectedSizes.map(size => {
            const detail = v.sizeDetails?.[size] || {};
            return {
              size: size,
              sku: detail.sku || "",
              price: parseFloat(detail.price) || 0,
              mrp: parseFloat(detail.mrp) || 0,
              stock: parseInt(detail.stock, 10) || 0,
              isActive: detail.isActive !== false,
            };
          });
        }

        return variant;
      });
    }

    return result;
  };

  const closeEdit = () => setEditItem(null);

  const onEditSuccess = (createdProduct) => {
    // remove the item from preview after successful publish
    setItems(prev => {
      const remaining = prev.filter(p => p.id !== editItem.id);
      const toStore = remaining.map(p => ({ data: p.data, errors: p.errors, valid: p.valid, created: p.created, createdProductId: p.createdProductId }));
      sessionStorage.setItem('multiple_import_data', JSON.stringify(toStore));
      return remaining;
    });
    closeEdit();
    toast.success('Product published and removed from import preview');
  };

  return (
    <>
      <AdminBreadcrumbs
        items={[
          { label: 'Home', href: '/admin' },
          { label: 'MyShop', href: '' },
          { label: 'Multiple Import', href: '/admin/products/multiple-import' },
        ]}
        mode={null}
      />

      <h1 className="text-2xl font-bold mb-5">Imported Products Preview</h1>

      <div className="admin-card p-4 mb-4 flex justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          <button onClick={() => router.push('/admin/')} className="btn-muted px-4 py-2">Back</button>
          <button onClick={() => router.push('/admin/products')} className="btn-primary2 px-4 py-2">All Products</button>
        </div>

        <div className="flex gap-2 items-center">
          <SearchFilterComponent
            searchValue={search}
            // onSearchChange={(val) => setSearch(val)}
            onSearchChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            showExpandButton={true}
            expandDirection="right"
          />
          <button onClick={submitAll} className="btn-primary px-4 py-2">Submit All</button>
          <button onClick={deleteSelected} className="btn-destructive px-4 py-2">Delete Products</button>

        </div>
      </div>

      <div className="admin-card overflow-x-auto">
        <table className="w-full table-fixed text-sm">
          <colgroup>
            <col className="w-[50px]" />
            <col className="w-[320px]" />
            <col className="w-[120px]" />
            <col className="w-[120px]" />
            <col className="w-[150px]" />
            <col className="w-[150px]" />
            <col className="w-[220px]" />
          </colgroup>
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="p-3"></th>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-left">Brand</th>
              <th className="p-3 text-left">Category / Subcategory</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Errors</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-lg font-semibold text-slate-600">
                      No products imported
                    </p>

                    <p className="text-sm text-slate-500">
                      Import a file to preview products here.
                    </p>

                    <button
                      onClick={() => setImportOpen(true)}
                      className="btn-primary px-4 py-2 flex items-center gap-2 text-sm"
                    >
                      Import Products
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedItems.map((p) => (
                <tr key={p.id} className={`border-b ${p.errors ? 'bg-red-50' : ''}`}>
                  <td className="p-3">
                    <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} />
                  </td>
                  <td className="p-3">{p.data.name || 'No Name'}</td>
                  <td className="p-3">{p.data.brand || '-'}</td>
                  <td className="p-3">{p.data.category || '-'} / {p.data.subcategory || '-'}</td>
                  <td className="p-3">{p.created ? 'Created' : p.valid === false ? 'Invalid' : 'Ready'}</td>
                  {p.errors ? (
                    <td
                      className="p-3 text-xs text-red-600">{p.errors ? p.errors.join('; ') : ''}
                    </td>) : (
                    <td className="p-3 text-green-600">No errors</td>
                  )}

                  <td className="p-3">
                    <div className="flex gap-2">
                      {p.created ? (
                        <button onClick={() => router.push(`/admin/products/edit/${p.createdProductId}`)} className="btn-muted px-3 py-1">Edit</button>
                      ) : (
                        <button onClick={() => openEdit(p)} className="btn-muted px-3 py-1">Edit</button>
                      )}
                      <button disabled={p.created} onClick={() => submitSingle(p.id)} className="btn-primary px-3 py-1">{p.created ? 'Done' : 'Submit'}</button>
                      <button onClick={() => deleteSingle(p.id)} className="btn-destructive px-3 py-1">Delete</button>
                    </div>
                  </td>
                </tr>
              )))}
          </tbody>
        </table>
      </div>
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={closeEdit} />
          <div className="bg-white p-4 rounded-lg z-10 w-[900px] max-h-[90vh] overflow-auto">
            <h3 className="text-lg font-semibold mb-2">Edit Imported Item</h3>
            <ProductForm
              ref={formRef}
              mode="edit"
              initialData={editItem.data}
              onSuccess={onEditSuccess}
              onClose={closeEdit}
              showLayout={false}
            />
            <div className="mt-3 flex justify-end gap-2">
              <button className="px-3 py-2 bg-primary/10 rounded" onClick={async () => {
                if (!formRef.current) return;
                try {
                  const { valid, values } = await formRef.current.save();
                  if (!valid) {
                    toast.error('Fix validation errors before saving');
                    return;
                  }

                  // Convert ProductForm data back to import format before storing
                  const denormalizedData = denormalizeFormData(values);

                  // update item in preview and sessionStorage (do not publish)
                  setItems(prev => {
                    const updated = prev.map(p => p.id === editItem.id ? { ...p, data: denormalizedData, errors: null, valid: true } : p);
                    const toStore = updated.map(p => {
                      // Preserve all fields from the original item structure
                      const stored = { ...p };
                      delete stored.id; // Remove transient id
                      return { data: stored.data, errors: stored.errors, valid: stored.valid, created: stored.created, createdProductId: stored.createdProductId, importId: stored.importId };
                    });
                    sessionStorage.setItem('multiple_import_data', JSON.stringify(toStore));
                    console.log('Updated item in preview and sessionStorage', updated.find(p => p.id === editItem.id));
                    return updated;
                  });

                  toast.success('Saved import row');
                  closeEdit();
                } catch (err) {
                  console.error(err);
                  toast.error('Failed to save');
                }
              }}>Save</button>

              <button className="px-3 py-2" onClick={closeEdit}>Close</button>
            </div>
          </div>
        </div>
      )}
      <PaginationComponent
        currentPage={page}
        totalPages={totalPages}
        limit={limit}
        onPageChange={(p) => setPage(p)}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        className="mt-4"
      />
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />

    </>
  );
}
