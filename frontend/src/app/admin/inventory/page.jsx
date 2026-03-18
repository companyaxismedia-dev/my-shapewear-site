"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown,Plus,Grid3x3,List,Save,RotateCcw,ArrowUpDown} from "lucide-react";
import { toast } from "sonner";
import AdminBreadcrumbs from "@/components/admin/AdminBreadcrumbs";
import DeleteConfirmModal from "@/components/admin/modals/DeleteConfirmModal";
import SearchFilterComponent from "@/components/admin/common/SearchFilterComponent";
import PaginationComponent from "@/components/admin/common/PaginationComponent";
import InventoryGridViewModal from "@/components/admin/modals/InventoryGridViewModal";
import { API_BASE } from "@/lib/api";

export default function InventoryPage() {
  const router = useRouter();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(["all"]);
  const [catOpen, setCatOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [pages, setPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [sortBy, setSortBy] = useState(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [changes, setChanges] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [originalValues, setOriginalValues] = useState({});

  // Verify admin access
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/auth");
    }
  }, [router]);

  // Fetch all categories from database on mount
  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(`${API_BASE}/api/admin/inventory?limit=1000`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "public, max-age=3600",
          },
        });

        const data = await res.json();
        if (data.success && data.inventory) {
          const uniqueCategories = [
            ...new Set(
              data.inventory
                .map((item) => item.category)
                .filter((cat) => cat)
            ),
          ].sort();
          setAllCategories(uniqueCategories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchAllCategories();
  }, []);

  // Fetch inventory with ISR caching
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");

      const categoryFilter = selectedCategories.includes("all")
        ? ""
        : selectedCategories.filter((c) => c !== "all").join(",");

      const params = new URLSearchParams({
        page,
        limit,
        keyword: search,
        ...(categoryFilter && { category: categoryFilter }),
      });

      // Fetch inventory with cache control headers
      const res = await fetch(`${API_BASE}/api/admin/inventory?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "public, max-age=0, must-revalidate",
        },
      });

      const data = await res.json();

      if (data.success) {
        let sortedInventory = data.inventory || [];

        // Apply sorting
        if (sortBy) {
          if (sortBy === "name-asc") {
            sortedInventory.sort((a, b) => a.productName.localeCompare(b.productName));
          } else if (sortBy === "name-desc") {
            sortedInventory.sort((a, b) => b.productName.localeCompare(a.productName));
          } else if (sortBy === "price-asc") {
            sortedInventory.sort((a, b) => (a.price || 0) - (b.price || 0));
          } else if (sortBy === "price-desc") {
            sortedInventory.sort((a, b) => (b.price || 0) - (a.price || 0));
          } else if (sortBy === "stock-asc") {
            sortedInventory.sort((a, b) => (a.stock || 0) - (b.stock || 0));
          } else if (sortBy === "stock-desc") {
            sortedInventory.sort((a, b) => (b.stock || 0) - (a.stock || 0));
          } else if (sortBy === "date-newest") {
            sortedInventory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          } else if (sortBy === "date-oldest") {
            sortedInventory.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          }
        }

        setInventory(sortedInventory);
        setPages(data.pages || 1);
      } else {
        toast.error(data.message || "Failed to load inventory");
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast.error("Error loading inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [page, limit, search, selectedCategories, sortBy]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".filter-dropdown")) {
        setCatOpen(false);
      }
      if (!e.target.closest(".sort-dropdown")) {
        setSortOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* ================= CATEGORY TOGGLE ================= */
  const toggleCategory = (c) => {
    let newCategories = [...selectedCategories];

    if (c === "all") {
      // If "all" is being clicked
      if (newCategories.includes("all")) {
        // Remove "all" if it's already selected
        newCategories = newCategories.filter((x) => x !== "all");
      } else {
        // Set to only "all"
        newCategories = ["all"];
      }
    } else {
      // For individual categories
      // Remove "all" if it exists
      newCategories = newCategories.filter((x) => x !== "all");

      if (newCategories.includes(c)) {
        // Remove the category if it's already selected
        newCategories = newCategories.filter((x) => x !== c);
      } else {
        // Add the category
        newCategories = [...newCategories, c];
      }

      // If no specific categories, default to "all"
      if (newCategories.length === 0) {
        newCategories = ["all"];
      }
    }

    setSelectedCategories(newCategories);
    setPage(1); // Reset to first page when filter changes
  };

  /* ================= SELECT ALL ================= */
  const toggleSelectAll = () => {
    if (selectedIds.length === inventory.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(inventory.map((p) => p._id));
    }
  };

  /* ================= CHANGES TRACKING ================= */
  const updateProductField = (productId, field, value) => {
    // Store original value on first change
    if (!originalValues[productId]) {
      const item = inventory.find(p => p._id === productId);
      if (item) {
        setOriginalValues(prev => ({
          ...prev,
          [productId]: {
            sku: item.sku,
            category: item.category,
            minPrice: item.minPrice,
            maxPrice: item.maxPrice,
            totalStock: item.totalStock,
          }
        }));
      }
    }

    setChanges((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  // Save individual row
  const handleSaveRow = async (productId) => {
    if (!changes[productId]) {
      toast.error("No changes in this row");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const item = inventory.find(p => p._id === productId);

      if (!item) {
        toast.error("Product not found");
        return;
      }

      // Use the correct endpoint with variantIndex and sizeIndex
      const changedData = changes[productId];
      const updatePayload = {
        price: changedData.price !== undefined ? changedData.price : item.price,
        mrp: changedData.mrp !== undefined ? changedData.mrp : item.mrp,
        stock: changedData.stock !== undefined ? changedData.stock : item.stock,
      };

      await fetch(`${API_BASE}/api/admin/inventory/${item.productId}/${item.variantIndex}/${item.sizeIndex}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      });

      toast.success("Row saved successfully");

      // Update original values and clear changes for this row
      setOriginalValues(prev => {
        const newValues = { ...prev };
        delete newValues[productId];
        return newValues;
      });

      setChanges(prev => {
        const newChanges = { ...prev };
        delete newChanges[productId];
        return newChanges;
      });

      // Check if any other changes exist
      const remainingChanges = Object.keys(changes).filter(key => key !== productId && changes[key]);
      if (remainingChanges.length === 0) {
        setHasChanges(false);
      }

      await fetchInventory();
    } catch (error) {
      toast.error("Failed to save row");
      console.error(error);
    }
  };

  // Reset individual row
  const handleResetRow = (productId) => {
    setChanges(prev => {
      const newChanges = { ...prev };
      delete newChanges[productId];
      return newChanges;
    });

    setOriginalValues(prev => {
      const newValues = { ...prev };
      delete newValues[productId];
      return newValues;
    });

    toast.success("Row reset");

    // Check if any changes remain
    const remainingChanges = Object.keys(changes).filter(key => key !== productId && changes[key]);
    if (remainingChanges.length === 0) {
      setHasChanges(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!hasChanges) {
      toast.error("No changes to save");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");

      for (const [productId, fields] of Object.entries(changes)) {
        const item = inventory.find(p => p._id === productId);

        if (!item) {
          console.error(`Product not found for ID: ${productId}`);
          continue;
        }

        // Use the correct endpoint with variantIndex and sizeIndex
        const updatePayload = {
          price: fields.price !== undefined ? fields.price : item.price,
          mrp: fields.mrp !== undefined ? fields.mrp : item.mrp,
          stock: fields.stock !== undefined ? fields.stock : item.stock,
        };

        await fetch(`${API_BASE}/api/admin/inventory/${item.productId}/${item.variantIndex}/${item.sizeIndex}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatePayload),
        });
      }

      toast.success("All changes saved successfully");
      setChanges({});
      setOriginalValues({});
      setHasChanges(false);
      await fetchInventory();
    } catch (error) {
      toast.error("Failed to save changes");
      console.error(error);
    }
  };

  const handleResetChanges = () => {
    setChanges({});
    setOriginalValues({});
    setHasChanges(false);
    toast.success("All changes reset");
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      if (deleteTarget) {
        await fetch(`${API_BASE}/api/admin/inventory/${deleteTarget}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await fetch(`${API_BASE}/api/admin/inventory/delete-many`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ids: selectedIds }),
        });
      }

      toast.success("Deleted successfully");
      setDeleteOpen(false);
      setDeleteTarget(null);
      setSelectedIds([]);
      await fetchInventory();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <>
      <AdminBreadcrumbs
        items={[
          { label: "Home", href: "/admin" },
          { label: "Inventory", href: "/admin/inventory" },
        ]}
        mode={null}
      />

      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Inventory Products</h1>

        {/* SAVE/RESET BUTTONS - TOP RIGHT */}
        {hasChanges && (
          <div className="flex gap-2">
            <button
              onClick={handleSaveChanges}
              className="btn-primary px-4 py-2 flex items-center gap-2 text-sm whitespace-nowrap"
            >
              <Save size={14} /> Save Changes
            </button>
            <button
              onClick={handleResetChanges}
              className="btn-muted px-4 py-2 flex items-center gap-2 text-sm whitespace-nowrap"
            >
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        )}
      </div>

      {/* HEADER - LEFT / CENTER / RIGHT LAYOUT */}
      <div className="admin-card p-4 mb-4 flex justify-between flex-wrap gap-3 relative z-[300] overflow-visible">
        {/* LEFT: CATEGORY & ADD */}
        <div className="flex gap-2">
          <div className="relative filter-dropdown z-[100]">
            <button
              onClick={() => setCatOpen(!catOpen)}
              className="btn-primary px-4 py-2 flex items-center gap-2 text-sm whitespace-nowrap"
            >
              {selectedCategories.includes("all")
                ? "All"
                : `${selectedCategories.length} Selected`}
              <ChevronDown size={14} />
            </button>

            {catOpen && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-2xl p-4 z-[101] w-64 border border-slate-200">
                <div className="text-xs font-bold text-slate-700 px-2 pb-2 mb-2">Filter by Category</div>
                <label className="flex gap-3 text-sm px-2 py-2 hover:bg-slate-50 rounded cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes("all")}
                    onChange={() => toggleCategory("all")}
                    className="w-4 h-4 accent-blue-500"
                  />
                  <span className="font-medium text-slate-700">All Products</span>
                </label>
                <div className="my-2 border-t border-slate-200"></div>
                <div className="max-h-64 overflow-y-auto">
                  {allCategories.length > 0 ? (
                    allCategories.map((c) => (
                      <label key={c} className="flex gap-3 text-sm px-2 py-2 hover:bg-slate-50 rounded cursor-pointer transition">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(c)}
                          onChange={() => toggleCategory(c)}
                          className="w-4 h-4 accent-blue-500"
                        />
                        <span className="text-slate-700">{c}</span>
                      </label>
                    ))
                  ) : (
                    <div className="text-sm text-slate-500 px-2 py-2">No categories found</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            className="btn-muted px-3 py-2 flex items-center gap-1 text-sm"
            title="Add new product"
          >
            <Plus size={15} />
          </button>
        </div>

        {/* CENTER: SEARCH */}

        {/* RIGHT SIDE */}
        <div className="flex gap-2 items-center">
          {/* SEARCH */}
          <SearchFilterComponent
            searchValue={search}
            onSearchChange={setSearch}
            showExpandButton={true}
            expandDirection="left"
          />

          {/* SORT */}
          <div className="sort-dropdown relative z-[9999]">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="btn-muted p-2 flex items-center gap-1 transition"
              title="Sort products"
            >
              <ArrowUpDown size={16} />
            </button>

            {sortOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-slate-200 bg-white shadow-xl p-2 z-[9999]">
                <div className="text-md font-bold text-slate-700 px-2 ">Sort By</div>
                <div className="my-2 border-t border-slate-200"></div>


                <button
                  onClick={() => {
                    setSortBy(sortBy === "name-asc" ? null : "name-asc");
                    setSortOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition ${sortBy === "name-asc"
                    ? "bg-blue-500 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                    }`}
                >
                  Name (A-Z)
                </button>
                <button
                  onClick={() => {
                    setSortBy(sortBy === "name-desc" ? null : "name-desc");
                    setSortOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition ${sortBy === "name-desc"
                    ? "bg-blue-500 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                    }`}
                >
                  Name (Z-A)
                </button>
                <button
                  onClick={() => {
                    setSortBy(sortBy === "stock-asc" ? null : "stock-asc");
                    setSortOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition ${sortBy === "stock-asc"
                    ? "bg-blue-500 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                    }`}
                >
                  Stock (Low to High)
                </button>
                <button
                  onClick={() => {
                    setSortBy(sortBy === "stock-desc" ? null : "stock-desc");
                    setSortOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition ${sortBy === "stock-desc"
                    ? "bg-blue-500 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                    }`} 
                >
                  Stock (High to Low)
                </button>
                <button
                  onClick={() => {
                    setSortBy(sortBy === "price-asc" ? null : "price-asc");
                    setSortOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition ${sortBy === "price-asc"
                    ? "bg-blue-500 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                    }`}
                >
                  Price (Low to High)
                </button>
                <button
                  onClick={() => {
                    setSortBy(sortBy === "price-desc" ? null : "price-desc");
                    setSortOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition ${sortBy === "price-desc"
                    ? "bg-blue-500 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                    }`}
                >
                  Price (High to Low)
                </button>
                <button
                  onClick={() => {
                    setSortBy(sortBy === "date-newest" ? null : "date-newest");
                    setSortOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition ${sortBy === "date-newest"
                    ? "bg-blue-500 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                    }`}
                >
                  Latest First
                </button>
                <button
                  onClick={() => {
                    setSortBy(sortBy === "date-oldest" ? null : "date-oldest");
                    setSortOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition ${sortBy === "date-oldest"
                    ? "bg-blue-500 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                    }`}
                >
                  Oldest First
                </button>
              </div>
            )}
          </div>

          {/* VIEW TOGGLE */}
          <button
            onClick={() => setViewMode(viewMode === "table" ? "grid" : "table")}
            className={`btn-muted p-2 ${viewMode === "grid" ? "bg-blue-100" : ""}`}
            title={viewMode === "table" ? "Switch to grid view" : "Switch to table view"}
          >
            {viewMode === "table" ? (
              <Grid3x3 size={16} />
            ) : (
              <List size={16} />
            )}
          </button>
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === "table" && (
        <div className="admin-card overflow-x-auto relative z-0">
          <table className="w-full text-sm">
            <colgroup>
              <col className="w-[50px]" />
              <col className="w-[300px]" />
              <col className="w-[100px]" />
              <col className="w-[100px]" />
              <col className="w-[100px]" />
              <col className="w-[100px]" />
              <col className="w-[100px]" />
              <col className="w-[150px]" />
            </colgroup>

            <thead className="border-b bg-muted/40">
              <tr>
                <th className="p-3 pr-0 text-left">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === inventory.length && inventory.length > 0}
                      onChange={toggleSelectAll}
                    />

                    {selectedIds.length > 0 && (
                      <span className="px-1 py-1 text-xs font-semibold rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                        {selectedIds.length}
                      </span>
                    )}
                  </div>
                </th>
                <th className="p-3 pl-0 text-left">Product</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">SKU</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">MRP</th>
                <th className="p-3 text-left">Stock</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {inventory.map((item) => {
                const rowChanges = changes[item._id] || {};
                const hasRowChanges = Object.keys(rowChanges).length > 0;

                return (
                  <tr key={item._id} className={`border-b hover:bg-gray-50 ${hasRowChanges ? 'bg-blue-50' : ''}`}>
                    <td className="p-3 ">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds((prev) => [...prev, item._id]);
                          } else {
                            setSelectedIds((prev) =>
                              prev.filter((id) => id !== item._id)
                            );
                          }
                        }}
                      />
                    </td>

                    <td className="p-3 pl-0">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image?.startsWith("http") ? item.image : `${API_BASE}${item.image}`}
                          className="w-12 h-12 rounded border object-cover"
                          alt={item.productName}
                        />
                        <div className="min-w-0">
                          <div className="font-medium truncate">{item.productName}</div>
                          <div className="text-xs text-gray-500">
                            {item.color || "N/A"} / {item.size || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="font-small truncate">
                        {item.category}
                      </div>
                    </td>

                    <td className="p-3">
                      <input
                        type="text"
                        value={rowChanges.sku !== undefined ? rowChanges.sku : (item.sku || "")}
                        onChange={(e) =>
                          updateProductField(item._id, "sku", e.target.value)
                        }
                        className="px-2 py-1 border rounded text-xs w-full"
                        placeholder="SKU"
                      />
                    </td>


                    <td className="p-3">
                      <input
                        type="number"
                        value={rowChanges.price !== undefined ? rowChanges.price : (item.price || 0)}
                        onChange={(e) =>
                          updateProductField(item._id, "price", parseFloat(e.target.value) || 0)
                        }
                        className="px-2 py-1 border rounded text-xs w-full"
                      />
                    </td>

                    <td className="p-3">
                      <input
                        type="number"
                        value={rowChanges.mrp !== undefined ? rowChanges.mrp : (item.mrp || 0)}
                        onChange={(e) =>
                          updateProductField(item._id, "mrp", parseFloat(e.target.value) || 0)
                        }
                        className="px-2 py-1 border rounded text-xs w-full"
                      />
                    </td>

                    <td className="p-3">
                      <input
                        type="number"
                        value={rowChanges.stock !== undefined ? rowChanges.stock : (item.stock || 0)}
                        onChange={(e) =>
                          updateProductField(item._id, "stock", parseInt(e.target.value) || 0)
                        }
                        className="px-2 py-1 border rounded text-xs w-full"
                      />
                    </td>

                    <td className="p-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleSaveRow(item._id)}
                          disabled={!hasRowChanges}
                          className={`px-2 py-1 text-xs whitespace-nowrap flex items-center gap-1 rounded transition ${hasRowChanges
                            ? "btn-primary hover:shadow-md cursor-pointer"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                            }`}
                        >
                          <Save size={12} /> Save
                        </button>
                        <button
                          onClick={() => handleResetRow(item._id)}
                          disabled={!hasRowChanges}
                          className={`px-2 py-1 text-xs whitespace-nowrap flex items-center gap-1 rounded transition ${hasRowChanges
                            ? "btn-muted hover:shadow-md cursor-pointer"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                            }`}
                        >
                          <RotateCcw size={12} /> Reset
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === "grid" && (
        <InventoryGridViewModal
          inventory={inventory}
          changes={changes}
          onUpdateField={updateProductField}
          onSaveRow={handleSaveRow}
          onResetRow={handleResetRow}
        />
      )}

      {/* PAGINATION COMPONENT */}
      <PaginationComponent
        currentPage={page}
        totalPages={pages}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />

      <DeleteConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
