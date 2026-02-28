
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Trash2, ChevronRight, Bold, Italic, Underline,
  Link2, List, ChevronDown, X, Image as ImageIcon,
  Save, Calendar, PackagePlus, Check, Info, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const CATEGORIES = [
  { value: "bra", label: "Bra" },
  { value: "panties", label: "Panties" },
  { value: "lingerie", label: "Lingerie" },
  { value: "shapewear", label: "Shapewear" },
  { value: "curvy", label: "Curvy" },
  { value: "tummy-control", label: "Tummy Control" },
  { value: "non-padded", label: "Non-Padded" },
];

// Simulated sizes - in production these would be fetched from your backend
const ALL_SIZES = [
  "XS", "S", "M", "L", "XL", "XXL", "XXXL",
  "28A", "30A", "32A", "34A", "36A", "38A",
  "28B", "30B", "32B", "34B", "36B", "38B", "40B",
  "28C", "30C", "32C", "34C", "36C", "38C", "40C",
  "28D", "30D", "32D", "34D", "36D", "38D", "40D",
  "28DD", "30DD", "32DD", "34DD", "36DD", "38DD",
  "28E", "30E", "32E", "34E", "36E",
];
const uid = () => Math.random().toString(36).slice(2);

const makeVariant = () => ({
  id: uid(),
  color: "",
  colorCode: "",
  video: "",
  images: [], // { url, altText, isPrimary, order }
  selectedSizes: [], // size strings chosen via checkbox
  sizeDetails: {}, // { [size]: { sku, price, mrp, stock, isActive } }
  isExpanded: true,
});

const makeSizeDetail = () => ({ sku: "", price: "", mrp: "", stock: "0", isActive: true });

const makeOffer = () => ({
  id: uid(), title: "", code: "", discountType: "percentage",
  discountValue: "", minOrderValue: "", description: "", isActive: true,
});

const makePincode = () => ({ id: uid(), pincode: "", codAvailable: true, estimatedDays: "3" });
const inp =
  "w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all";

function Card({ title, subtitle, children, className, action }) {
  return (
    <div className={cn("admin-card", className)}>
      <div className={cn("px-5 py-4 border-b border-border flex items-center justify-between", !title && "hidden")}>
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({ label, required, hint, children, half }) {
  return (
    <div className={cn("space-y-1.5", half && "flex-1")}>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Toggle({ checked, onChange, label, desc }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
      </div>
      <label className="inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className={cn("toggle-track")} />
      </label>
    </div>
  );
}
function RichToolbar({ editorRef }) {
  const exec = (cmd, val) => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    try {
      document.execCommand(cmd, false, val ?? null);
    } catch (e) {
      console.error("Editor command failed", e);
    }
  };
  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 border-t border-border bg-muted/40 rounded-b-lg">
      {[
        { icon: Bold, cmd: "bold", title: "Bold" },
        { icon: Italic, cmd: "italic", title: "Italic" },
        { icon: Underline, cmd: "underline", title: "Underline" },
      ].map(({ icon: Icon, cmd, title }) => (
        <button
          key={cmd}
          type="button"
          title={title}
          onMouseDown={(e) => { e.preventDefault(); exec(cmd); }}
          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon className="w-3.5 h-3.5" />
        </button>
      ))}
      <div className="w-px h-4 bg-border mx-1" />
      <button
        type="button"
        title="Insert Link"
        onMouseDown={(e) => {
          e.preventDefault();
          const url = prompt("Enter URL:");
          if (url) exec("createLink", url);
        }}
        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
      >
        <Link2 className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        title="Bullet List"
        onMouseDown={(e) => { e.preventDefault(); exec("insertUnorderedList"); }}
        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
      >
        <List className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
function SizeDropdown({ selected, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = ALL_SIZES.filter(s => s.toLowerCase().includes(search.toLowerCase()));
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggle = (size) => {
    onChange(selected.includes(size)
      ? selected.filter(s => s !== size)
      : [...selected, size]
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={cn(inp, "flex items-center justify-between text-left")}
      >
        <span className={selected.length ? "text-foreground" : "text-muted-foreground"}>
          {selected.length ? `${selected.length} size(s) selected` : "Select available sizes..."}
        </span>
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selected.map(s => (
            <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              {s}
              <button type="button" onClick={() => toggle(s)} className="hover:text-primary/70">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {open && (
        <div className="absolute top-full left-0 right-0 z-[9999] mt-1 bg-white border border-gray-300 rounded-lg shadow-xl">
          <div className="p-2 border-b border-border">
            <input
              className={cn(inp, "text-xs")}
              placeholder="Search sizes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-52 overflow-y-auto p-2 grid grid-cols-3 sm:grid-cols-4 gap-1">
            {filtered.map(size => (
              <button
                key={size}
                type="button"
                onClick={() => toggle(size)}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs transition-colors text-left",
                  selected.includes(size)
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted text-foreground"
                )}
              >
                <div
                  className={cn(
                    "w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0",
                    selected.includes(size)
                      ? "bg-black border-black"
                      : "border-gray-400 bg-white"
                  )}
                >
                  {selected.includes(size) && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                </div>
                {size}
              </button>
            ))}
          </div>
          <div className="p-2 border-t border-border flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
function ImageUploadArea({ images, onAdd, onRemove, onSetPrimary }) {
  const fileRef = useRef(null);

  // const handleFile = (e) => {
  //   const files = Array.from(e.target.files || []);
  //   files.forEach((file, i) => {
  //     const url = URL.createObjectURL(file);
  //     onAdd({ url, altText: file.name, isPrimary: images.length === 0 && i === 0, order: images.length + i });
  //   });
  //   e.target.value = "";
  // };

  // const toBase64 = (file) =>
  //   new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.onload = () => resolve(reader.result);
  //     reader.onerror = reject;
  //     reader.readAsDataURL(file);
  //   });



  const compressImage = (file, maxWidth = 1200, quality = 0.7) =>
    new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target.result;
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = maxWidth / img.width;

        canvas.width = img.width > maxWidth ? maxWidth : img.width;
        canvas.height =
          img.width > maxWidth ? img.height * scale : img.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL("image/jpeg", quality));
      };

      reader.readAsDataURL(file);
    });

  const handleFile = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // const base64 = await new Promise((resolve, reject) => {
      //   const reader = new FileReader();
      //   reader.onload = () => resolve(reader.result);
      //   reader.onerror = reject;
      //   reader.readAsDataURL(file);
      // });

      const base64 = await compressImage(file);

      newImages.push({
        url: base64,
        altText: file.name,
        isPrimary: images.length === 0 && i === 0,
        order: images.length + i,
      });
    }

    newImages.forEach(img => onAdd(img));

    e.target.value = "";
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="aspect-square rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary/60 transition-all flex flex-col items-center justify-center gap-1.5 text-primary"
        >
          <ImageIcon className="w-5 h-5" />
          <span className="text-xs font-medium">Click to Upload</span>
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFile} className="hidden" />

        {images.map((img, i) => (
          <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-border bg-muted">
            <img src={img.url} alt={img.altText || ""} className="w-full h-full object-cover" />
            {img.isPrimary && (
              <span className="absolute top-1 left-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground bg-black z-[999] text-green-500">
                Primary
              </span>
            )}
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
              {!img.isPrimary && (
                <button
                  type="button"
                  onClick={() => onSetPrimary(i)}
                  className="px-1.5 py-0.5 rounded-md bg-primary text-primary-foreground text-[10px] font-medium bg-black z-[999] text-red-500"
                >
                  Set Primary
                </button>
              )}
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="px-1.5 py-0.5 rounded-md bg-destructive text-destructive-foreground text-[10px] font-medium bg-black z-[999] text-white"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
        <Info className="w-3 h-3" /> First image is primary. Hover to set primary or remove.
      </p>
    </div>
  );
}
// export default function AddProduct() {
export function AddProductForm({
  mode = "add",
  initialData = null,
  onClose = null,
  onSuccess = null,
}) {
  const router = useRouter();
  const productDetailsRef = useRef(null);



  const [isSubmitting, setIsSubmitting] = useState(false);

  // Basic fields
  const [form, setForm] = useState({
    name: "", brand: "", category: "", subCategory: "",
    shortDescription: "", thumbnail: "",
    isFeatured: false, isBestSeller: false, isNewArrival: false, isActive: true,
    metaTitle: "", metaDescription: "", metaKeywords: "",
  });

  const [productDetails, setProductDetails] = useState("");
  const [features, setFeatures] = useState([""]);
  const [materialCare, setMaterialCare] = useState([""]);
  const [sizeAndFits, setSizeAndFits] = useState([{ key: "", value: "" }]);
  const [specifications, setSpecifications] = useState([{ key: "", value: "" }]);
  const [variants, setVariants] = useState([makeVariant()]);
  const [offers, setOffers] = useState([]);
  const [pincodes, setPincodes] = useState([]);
  const [uploadedVideo, setUploadedVideo] = useState({});
  // const [thumbnailImage, setThumbnailImage] = useState({});

  const setField = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const strUpdate = (setter, i, v) => setter(p => p.map((x, j) => j === i ? v : x));
  const strAdd = (setter) => setter(p => [...p, ""]);
  const strRemove = (setter, i) => setter(p => p.filter((_, j) => j !== i));
  const kvUpdate = (setter, i, f, v) => setter(p => p.map((x, j) => j === i ? { ...x, [f]: v } : x));
  const kvAdd = (setter) => setter(p => [...p, { key: "", value: "" }]);
  const kvRemove = (setter, i) => setter(p => p.filter((_, j) => j !== i));
  const vUpdate = (id, f, v) => setVariants(p => p.map(x => x.id === id ? { ...x, [f]: v } : x));
  const vGet = (id) => variants.find(v => v.id === id);

  const updateSizeDetail = (variantId, size, field, value) => {
    const v = vGet(variantId);
    vUpdate(variantId, "sizeDetails", {
      ...v.sizeDetails,
      [size]: { ...(v.sizeDetails[size] || makeSizeDetail()), [field]: value }
    });
  };


  useEffect(() => {
    if (!initialData) return;

    const p = initialData;

    setForm({
      name: p.name || "",
      brand: p.brand || "",
      category: p.category || "",
      subCategory: p.subCategory || "",
      shortDescription: p.shortDescription || "",
      thumbnail: p.thumbnail || "",
      isFeatured: p.isFeatured,
      isBestSeller: p.isBestSeller,
      isNewArrival: p.isNewArrival,
      isActive: p.isActive,
      metaTitle: p.metaTitle || "",
      metaDescription: p.metaDescription || "",
      metaKeywords: (p.metaKeywords || []).join(","),
    });

    setProductDetails(p.productDetails || "");
    setFeatures(p.features || [""]);
    setMaterialCare(p.materialCare || [""]);

    setSizeAndFits(
      p.sizeAndFits?.map(s => ({
        key: s.label,
        value: s.value,
      })) || [{ key: "", value: "" }]
    );

    setSpecifications(p.specifications || []);

    setVariants(
      p.variants.map(v => ({
        id: uid(),
        color: v.color,
        colorCode: v.colorCode,
        video: v.video || "",
        images: v.images || [],
        selectedSizes: v.sizes?.map(s => s.size) || [],
        sizeDetails: Object.fromEntries(
          (v.sizes || []).map(s => [
            s.size,
            {
              sku: s.sku,
              price: s.price,
              mrp: s.mrp,
              stock: s.stock,
              isActive: s.isActive,
            },
          ])
        ),
        isExpanded: true,
      }))
    );

    setOffers(p.offers || []);
    setPincodes(p.serviceablePincodes || []);
  }, [initialData]);

  useEffect(() => {
  if (productDetailsRef.current) {
    productDetailsRef.current.innerHTML = productDetails || "";
  }
}, [productDetails]);


  const uploadFile = async (file) => {
    const token = localStorage.getItem("adminToken");

    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch(`${API_BASE}/api/admin/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: fd,
    });

    const data = await res.json();

    if (!data.success) throw new Error("Upload failed");

    return data.url; // backend returns uploaded url
  };

  const ensureSizeDetails = (variantId, sizes) => {
    const v = vGet(variantId);
    const updated = { ...v.sizeDetails };
    sizes.forEach(s => { if (!updated[s]) updated[s] = makeSizeDetail(); });
    vUpdate(variantId, "sizeDetails", updated);
  };

  const handleSizeSelect = (variantId, sizes) => {
    setVariants(prev =>
      prev.map(v => {
        if (v.id !== variantId) return v;

        const updatedDetails = { ...v.sizeDetails };

        sizes.forEach(s => {
          if (!updatedDetails[s]) {
            updatedDetails[s] = makeSizeDetail();
          }
        });

        return {
          ...v,
          selectedSizes: sizes,
          sizeDetails: updatedDetails,
        };
      })
    );
  };
  const vImgAdd = (id, img) => vUpdate(id, "images", [...vGet(id).images, img]);
  const vImgRemove = (id, i) => {
    const imgs = vGet(id).images.filter((_, j) => j !== i);
    if (imgs.length > 0 && !imgs.some(x => x.isPrimary)) imgs[0].isPrimary = true;
    vUpdate(id, "images", imgs);
  };
  const vImgSetPrimary = (id, i) => vUpdate(id, "images",
    vGet(id).images.map((img, j) => ({ ...img, isPrimary: j === i }))
  );

  const handleSubmit = async (isDraft = false) => {
    if (!form.name || !form.category) {
      toast.error("Product name and category are required");
      return;
    }
    if (variants.length === 0 || !variants[0].color) {
      toast.error("At least one variant with a color is required");
      return;
    }

    const payload = {
      ...form,
      productDetails,
      features: features.filter(Boolean),
      materialCare: materialCare.filter(Boolean),
      sizeAndFits: sizeAndFits.filter(s => s.key).map(s => ({ label: s.key, value: s.value })),
      specifications: specifications.filter(s => s.key).map(s => ({ key: s.key, value: s.value })),
      metaKeywords: form.metaKeywords.split(",").map(k => k.trim()).filter(Boolean),
      variants: variants.map(v => ({
        color: v.color,
        colorCode: v.colorCode,
        // colorThumbnail: v.colorThumbnail,
        video: v.video || undefined,
        images: v.images.map((img, i) => ({
          ...img,
          isPrimary: i === 0,
          order: i,
        })),
        sizes: v.selectedSizes
          .filter(s => v.sizeDetails[s]?.sku && v.sizeDetails[s]?.price)
          .map(s => ({
            size: s,
            sku: v.sizeDetails[s].sku.toUpperCase(),
            price: Number(v.sizeDetails[s].price),
            mrp: v.sizeDetails[s].mrp ? Number(v.sizeDetails[s].mrp) : undefined,
            stock: Number(v.sizeDetails[s].stock) || 0,
            isActive: v.sizeDetails[s].isActive,
          })),
      })),
      offers: offers.map(({ id, ...o }) => ({ ...o, discountValue: Number(o.discountValue), minOrderValue: Number(o.minOrderValue) })),
      serviceablePincodes: pincodes.map(({ id, ...p }) => ({ ...p, estimatedDays: Number(p.estimatedDays) })),
      isActive: isDraft ? false : form.isActive,
    };

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        mode === "edit"
          ? `${API_BASE}/api/admin/products/${initialData._id}`
          : `${API_BASE}/api/products`,
        {
          method: mode === "edit" ? "PUT" : "POST",
          // method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create product");
      }

      toast.success(isDraft ? "Draft saved successfully!" : "Product created successfully!");
      // router.push("/admin/products");
      if (mode === "edit") {
        onSuccess?.();
        onClose?.();
      } else {
        router.push("/admin/products");
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong");
      console.error("Product creation error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <AdminLayout>
      {/* ── Page Header ── */}
      <div className="mb-6">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
          <span>Home</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>Products</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-primary font-medium">Add New Product</span>
        </nav>
<h1 className="text-2xl font-bold text-foreground">
  {mode === "edit" ? "Edit Product" : "Add New Product"}
</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Add a new product to your store</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Card title="Name and Description">
            <div className="space-y-4">
              <div className="flex gap-4">
                <Field label="Product Name" required half>
                  <input className={inp} placeholder="e.g. Glovia Ultra Comfort Bra" value={form.name}
                    onChange={e => setField("name", e.target.value)} />
                </Field>
                <Field label="Brand Name" half>
                  <input className={inp} placeholder="e.g. Glovia" value={form.brand}
                    onChange={e => setField("brand", e.target.value)} />
                </Field>
              </div>

              <Field label="Short Description">
                <textarea className={cn(inp, "resize-none h-20")}
                  placeholder="Brief summary shown in product listings..."
                  value={form.shortDescription}
                  onChange={e => setField("shortDescription", e.target.value)} />
              </Field>
              <Field label="Product Details">
                <div className="border border-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-ring">
                  <div
                    ref={productDetailsRef}
                    contentEditable
                    onInput={(e) => setProductDetails(e.currentTarget.innerHTML)}
                    suppressContentEditableWarning
                    className="min-h-[120px] px-3 py-2 text-sm text-foreground outline-none prose prose-sm max-w-none"
                    style={{ lineHeight: 1.6 }}
                    data-placeholder="Detailed product description, materials, styling notes..."
                    onFocus={e => {
                      if (!e.currentTarget.textContent) e.currentTarget.classList.add("empty");
                    }}
                  />
                  <RichToolbar editorRef={productDetailsRef} />
                </div>
              </Field>
              <Field label="Key Features" hint="Each entry becomes a bullet point on the product page">
                <div className="space-y-2">
                  {features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      <input className={inp} placeholder={`Feature ${i + 1}`} value={f}
                        onChange={e => strUpdate(setFeatures, i, e.target.value)} />
                      <button type="button" onClick={() => strRemove(setFeatures, i)}
                        disabled={features.length === 1}
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-30">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => strAdd(setFeatures)}
                    className="flex items-center gap-1.5 text-sm text-primary hover:underline font-medium mt-1">
                    <Plus className="w-4 h-4" /> Add Feature
                  </button>
                </div>
              </Field>
            </div>
          </Card>
          <Card title="Category">
            <div className="flex gap-4">
              <Field label="Product Category" required half>
                <select className={inp} value={form.category} onChange={e => setField("category", e.target.value)}>
                  <option value="">Select category...</option>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </Field>
              <Field label="Sub Category" half hint="e.g. Full Coverage, Sports, Lace">
                <input className={inp} placeholder="e.g. Full Coverage"
                  value={form.subCategory} onChange={e => setField("subCategory", e.target.value)} />
              </Field>
            </div>
          </Card>
          <Card
            title="Variants"
            subtitle="Each variant = one color with its own images & sizes"
            action={
              <button type="button" onClick={() => setVariants(p => [...p, makeVariant()])}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold hover:bg-primary/90 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add Color
              </button>
            }
          >
            <div className="space-y-4">
              {variants.map((variant, vIdx) => (
                <div key={variant.id} className="border border-border rounded-xl relative  overflow-visible">
                  {/* Variant header */}
                  <div className="flex items-center gap-3 px-4 py-3 bg-muted/40 cursor-pointer"
                    onClick={() => vUpdate(variant.id, "isExpanded", !variant.isExpanded)}>
                    <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", !variant.isExpanded && "-rotate-90")} />
                    {variant.colorCode?.startsWith("data:") ||
                      variant.colorCode?.startsWith("http") ? (
                      <img
                        src={variant.colorCode}
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm object-cover"
                      />
                    ) : (
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                        style={{ backgroundColor: variant.colorCode || "#ffffff" }}
                      />
                    )}
                    <span className="text-sm font-medium text-foreground flex-1 truncate">
                      {variant.color || `Color Variant ${vIdx + 1}`}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {variant.selectedSizes.length} size(s) · {variant.images.length} image(s)
                    </span>
                    <button type="button" onClick={e => { e.stopPropagation(); setVariants(p => p.filter(v => v.id !== variant.id)); }}
                      disabled={variants.length === 1}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-30">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {variant.isExpanded && (
                    <div className="p-5 space-y-5">
                      {/* Color row */}
                      {/* <div className="flex gap-4">
                        <Field label="Color Name" required half>
                          <input className={inp} placeholder="e.g. Midnight Black"
                            value={variant.color} onChange={e => vUpdate(variant.id, "color", e.target.value)} />
                        </Field>
                        <Field label="Color Code" half>
                          <div className="flex gap-2">
                            <input type="color" value={variant.colorCode}
                              onChange={e => vUpdate(variant.id, "colorCode", e.target.value)}
                              className="w-10 h-10 rounded-lg border border-border cursor-pointer flex-shrink-0 p-0.5 bg-background" />
                            <input className={inp} placeholder="#10b981" value={variant.colorCode}
                              onChange={e => vUpdate(variant.id, "colorCode", e.target.value)} />
                          </div>
                        </Field>
                      </div> */}

                      <div className="flex gap-4">

                        {/* COLOR NAME */}
                        <Field label="Color Name" required half>
                          <input
                            className={inp}
                            placeholder="e.g. Midnight Black"
                            value={variant.color}
                            onChange={(e) =>
                              vUpdate(variant.id, "color", e.target.value)
                            }
                          />
                        </Field>

                        {/* COLOR CODE OR THUMBNAIL */}
                        <Field label="Color Code / Thumbnail" half>

                          {!(
                            variant.colorCode?.startsWith("data:") ||
                            variant.colorCode?.startsWith("http")
                          ) ? (

                            /* ===== NO IMAGE STATE ===== */
                            <div className="flex items-center gap-3">

                              {/* COLOR PICKER */}
                              <input
                                type="color"
                                value={variant.colorCode}
                                onChange={(e) =>
                                  vUpdate(variant.id, "colorCode", e.target.value)
                                }
                                className="w-10 h-10 rounded-lg border border-border cursor-pointer flex-shrink-0 p-0.5 bg-background"
                              />

                              {/* COLOR CODE INPUT */}
                              <input
                                className={`${inp} w-36`}
                                placeholder="#10b981"
                                value={variant.colorCode}
                                onChange={(e) =>
                                  vUpdate(variant.id, "colorCode", e.target.value)
                                }
                              />

                              {/* CLEAN FILE INPUT */}
                              <label className="px-3 py-2 border rounded-lg cursor-pointer text-sm whitespace-nowrap">
                                Choose File
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    const url = await uploadFile(file);

                                    // save image URL in variant
                                    vUpdate(variant.id, "colorCode", url);

                                    // setThumbnailImage((prev) => ({
                                    //   ...prev,
                                    //   [variant.id]: file,
                                    // }));
                                  }}
                                />
                              </label>

                            </div>

                          ) : (

                            /* ===== IMAGE UPLOADED STATE ===== */
                            <div className="flex items-start pl-2">

                              <div className="relative w-24 h-24 rounded-lg border overflow-hidden">
                                <img
                                  src={variant.colorCode}
                                  alt="thumbnail"
                                  className="w-full h-full object-cover"
                                />

                                {/* REMOVE ICON */}
                                <button
                                  type="button"
                                  className="absolute top-1 right-1 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-black"
                                  onClick={() => {
                                    vUpdate(variant.id, "colorCode", "");
                                  }}
                                >
                                  ✕
                                </button>
                              </div>

                            </div>

                          )}

                        </Field>
                      </div>

                      {/* <Field label="Video URL (Optional)">
                        <input className={inp} placeholder="https://cdn.example.com/video.mp4"
                          value={variant.video} onChange={e => vUpdate(variant.id, "video", e.target.value)} />
                      </Field> */}

                      {/* Upload Video */}
                      <Field label="Upload Video">

                        {/* IF NO FILE SELECTED */}
                        {!uploadedVideo?.[variant.id] ? (
                          <input
                            type="file"
                            accept="video/*"
                            className={inp}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              const url = await uploadFile(file);

                              // save URL in variant (IMPORTANT)
                              vUpdate(variant.id, "video", url);

                              setUploadedVideo((prev) => ({
                                ...prev,
                                [variant.id]: file,
                              }));
                            }}
                          />
                        ) : (

                          /* FILE SELECTED BOX */
                          <div className={`${inp} flex items-center justify-between px-3`}>
                            <span className="truncate">
                              {uploadedVideo[variant.id].name}
                            </span>

                            <button
                              type="button"
                              className="text-sm text-red-500 hover:text-red-700"
                              onClick={() => {
                                setUploadedVideo((prev) => {
                                  const copy = { ...prev };
                                  delete copy[variant.id];
                                  return copy;
                                });
                              }}
                            >
                              Remove
                            </button>
                          </div>

                        )}

                      </Field>
                      {/* URL shows only if NO upload */}
                      {!uploadedVideo[variant.id] && (
                        <Field label="Video URL (Optional)">
                          <input
                            className={inp}   // 👈 SAME STYLE
                            placeholder="https://cdn.example.com/video.mp4"
                            value={variant.video}
                            onChange={(e) =>
                              vUpdate(variant.id, "video", e.target.value)
                            }
                          />
                        </Field>
                      )}
                      {/* Images */}
                      <Field label="Variant Images">
                        <ImageUploadArea
                          images={variant.images}
                          onAdd={(img) => vImgAdd(variant.id, img)}
                          onRemove={(i) => vImgRemove(variant.id, i)}

                          onSetPrimary={(i) => vImgSetPrimary(variant.id, i)}
                        />
                      </Field>

                      {/* Sizes - Checkbox dropdown */}
                      <Field label="Available Sizes" hint="Select which sizes are available for this color">
                        <SizeDropdown
                          selected={variant.selectedSizes}
                          onChange={(sizes) => handleSizeSelect(variant.id, sizes)}
                        />
                      </Field>

                      {/* Size details table */}
                      {variant.selectedSizes.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Size Details</p>
                          <div className="overflow-x-auto rounded-lg border border-border">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-muted/40 border-b border-border">
                                  {["Size", "SKU *", "Price ₹ *", "MRP ₹", "Stock", "Active"].map(h => (
                                    <th key={h} className="text-left text-xs font-medium text-muted-foreground px-3 py-2.5 whitespace-nowrap">
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border">
                                {variant.selectedSizes.map(size => {
                                  const d = variant.sizeDetails[size] || makeSizeDetail();
                                  return (
                                    <tr key={size} className="hover:bg-muted/20 transition-colors">
                                      <td className="px-3 py-2">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted text-foreground text-xs font-semibold">
                                          {size}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2">
                                        <input className={cn(inp, "min-w-[110px] uppercase")} placeholder="BRA-BLK-32B"
                                          value={d.sku} onChange={e => updateSizeDetail(variant.id, size, "sku", e.target.value)} />
                                      </td>
                                      <td className="px-3 py-2">
                                        <div className="flex items-center gap-1 min-w-[90px]">
                                          <span className="text-muted-foreground text-xs">₹</span>
                                          <input type="number" min="0" className={inp} placeholder="899"
                                            value={d.price} onChange={e => updateSizeDetail(variant.id, size, "price", e.target.value)} />
                                        </div>
                                      </td>
                                      <td className="px-3 py-2">
                                        <div className="flex items-center gap-1 min-w-[90px]">
                                          <span className="text-muted-foreground text-xs">₹</span>
                                          <input type="number" min="0" className={inp} placeholder="1299"
                                            value={d.mrp} onChange={e => updateSizeDetail(variant.id, size, "mrp", e.target.value)} />
                                        </div>
                                      </td>
                                      <td className="px-3 py-2">
                                        <input type="number" min="0" className={cn(inp, "min-w-[70px]")} placeholder="0"
                                          value={d.stock} onChange={e => updateSizeDetail(variant.id, size, "stock", e.target.value)} />
                                      </td>
                                      <td className="px-3 py-2">
                                        <label className="inline-flex items-center cursor-pointer">
                                          <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={d.isActive}
                                            onChange={(e) => updateSizeDetail(variant.id, size, "isActive", e.target.checked)}
                                          />
                                          <div className="toggle-track" />
                                        </label>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* ── Size & Fits ── */}
          <Card title="Size & Fits" subtitle="Dynamic attributes e.g. Fabric: 80% Cotton, Padding: Lightly Padded">
            <div className="space-y-2">
              {sizeAndFits.map((sf, i) => (
                <div key={i} className="flex gap-2">
                  <input className={inp} placeholder="Label (e.g. Fabric)" value={sf.key}
                    onChange={e => kvUpdate(setSizeAndFits, i, "key", e.target.value)} />
                  <input className={inp} placeholder="Value (e.g. 80% Cotton)" value={sf.value}
                    onChange={e => kvUpdate(setSizeAndFits, i, "value", e.target.value)} />
                  <button type="button" onClick={() => kvRemove(setSizeAndFits, i)}
                    disabled={sizeAndFits.length === 1}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-30">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => kvAdd(setSizeAndFits)}
                className="flex items-center gap-1.5 text-sm text-primary hover:underline font-medium mt-1">
                <Plus className="w-4 h-4" /> Add Entry
              </button>
            </div>
          </Card>

          {/* ── Material & Care ── */}
          <Card title="Material & Care">
            <div className="space-y-2">
              {materialCare.map((m, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground flex-shrink-0" />
                  <input className={inp} placeholder="e.g. Hand wash in cold water only" value={m}
                    onChange={e => strUpdate(setMaterialCare, i, e.target.value)} />
                  <button type="button" onClick={() => strRemove(setMaterialCare, i)}
                    disabled={materialCare.length === 1}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-30">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => strAdd(setMaterialCare)}
                className="flex items-center gap-1.5 text-sm text-primary hover:underline font-medium mt-1">
                <Plus className="w-4 h-4" /> Add Instruction
              </button>
            </div>
          </Card>

          {/* ── Specifications ── */}
          <Card title="Specifications" subtitle="Technical specs e.g. Closure: Hook & Eye, Wire: Underwired">
            <div className="space-y-2">
              {specifications.map((spec, i) => (
                <div key={i} className="flex gap-2">
                  <input className={inp} placeholder="Spec name (e.g. Closure)" value={spec.key}
                    onChange={e => kvUpdate(setSpecifications, i, "key", e.target.value)} />
                  <input className={inp} placeholder="Value (e.g. Hook & Eye)" value={spec.value}
                    onChange={e => kvUpdate(setSpecifications, i, "value", e.target.value)} />
                  <button type="button" onClick={() => kvRemove(setSpecifications, i)}
                    disabled={specifications.length === 1}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-30">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => kvAdd(setSpecifications)}
                className="flex items-center gap-1.5 text-sm text-primary hover:underline font-medium mt-1">
                <Plus className="w-4 h-4" /> Add Specification
              </button>
            </div>
          </Card>

          {/* ── Offers ── */}
          <Card title="Offers"
            subtitle="Promotional offers for this product"
            action={
              <button type="button" onClick={() => setOffers(p => [...p, makeOffer()])}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add Offer
              </button>
            }
          >
            {offers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No offers added yet.</p>
            ) : (
              <div className="space-y-4">
                {offers.map((offer, i) => (
                  <div key={offer.id} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">Offer {i + 1}</p>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                          <input type="checkbox" checked={offer.isActive} className="accent-primary"
                            onChange={e => setOffers(p => p.map((o, j) => j === i ? { ...o, isActive: e.target.checked } : o))} />
                          Active
                        </label>
                        <button type="button" onClick={() => setOffers(p => p.filter((_, j) => j !== i))}
                          className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Title"><input className={inp} placeholder="e.g. Summer Sale" value={offer.title}
                        onChange={e => setOffers(p => p.map((o, j) => j === i ? { ...o, title: e.target.value } : o))} /></Field>
                      <Field label="Code"><input className={inp} placeholder="e.g. SUMMER20" value={offer.code}
                        onChange={e => setOffers(p => p.map((o, j) => j === i ? { ...o, code: e.target.value } : o))} /></Field>
                      <Field label="Discount Type">
                        <select className={inp} value={offer.discountType}
                          onChange={e => setOffers(p => p.map((o, j) => j === i ? { ...o, discountType: e.target.value } : o))}>
                          <option value="percentage">Percentage</option>
                          <option value="flat">Flat</option>
                        </select>
                      </Field>
                      <Field label="Discount Value">
                        <input type="number" className={inp} placeholder="20" value={offer.discountValue}
                          onChange={e => setOffers(p => p.map((o, j) => j === i ? { ...o, discountValue: e.target.value } : o))} />
                      </Field>
                      <Field label="Min Order Value">
                        <input type="number" className={inp} placeholder="500" value={offer.minOrderValue}
                          onChange={e => setOffers(p => p.map((o, j) => j === i ? { ...o, minOrderValue: e.target.value } : o))} />
                      </Field>
                    </div>
                    <Field label="Description">
                      <input className={inp} placeholder="Offer description..." value={offer.description}
                        onChange={e => setOffers(p => p.map((o, j) => j === i ? { ...o, description: e.target.value } : o))} />
                    </Field>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* ── Serviceable Pincodes ── */}
          <Card title="Serviceable Pincodes"
            subtitle="Areas where this product can be delivered"
            action={
              <button type="button" onClick={() => setPincodes(p => [...p, makePincode()])}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add Pincode
              </button>
            }
          >
            {pincodes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No pincodes added. Leave empty for all areas.</p>
            ) : (
              <div className="space-y-2">
                {pincodes.map((pc, i) => (
                  <div key={pc.id} className="flex items-center gap-2">
                    <input className={cn(inp, "max-w-[130px]")} placeholder="400001" value={pc.pincode}
                      onChange={e => setPincodes(p => p.map((x, j) => j === i ? { ...x, pincode: e.target.value } : x))} />
                    <input type="number" className={cn(inp, "max-w-[80px]")} placeholder="3" value={pc.estimatedDays}
                      onChange={e => setPincodes(p => p.map((x, j) => j === i ? { ...x, estimatedDays: e.target.value } : x))} />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">days</span>
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer whitespace-nowrap">
                      <input type="checkbox" checked={pc.codAvailable} className="accent-primary"
                        onChange={e => setPincodes(p => p.map((x, j) => j === i ? { ...x, codAvailable: e.target.checked } : x))} />
                      COD
                    </label>
                    <button type="button" onClick={() => setPincodes(p => p.filter((_, j) => j !== i))}
                      className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
        <div className="space-y-5">
          <Card title="Product Status">
            <div className="divide-y divide-border">
              <Toggle checked={form.isActive} onChange={v => setField("isActive", v)} label="Active" desc="Visible to customers" />
              <Toggle checked={form.isFeatured} onChange={v => setField("isFeatured", v)} label="Featured" desc="Show on homepage" />
              <Toggle checked={form.isBestSeller} onChange={v => setField("isBestSeller", v)} label="Best Seller" desc="Best seller badge" />
              <Toggle checked={form.isNewArrival} onChange={v => setField("isNewArrival", v)} label="New Arrival" desc="New arrival badge" />
            </div>
          </Card>

          {/* ── Thumbnail ── */}
          <Card title="Thumbnail URL">
            <Field label="Thumbnail" hint="Auto-set from first variant image if empty">
              <input className={inp} placeholder="https://cdn.example.com/thumb.jpg"
                value={form.thumbnail} onChange={e => setField("thumbnail", e.target.value)} />
              {form.thumbnail && (
                <div className="mt-2 rounded-lg overflow-hidden border border-border aspect-square w-full max-w-[100px]">
                  <img src={form.thumbnail} alt="thumbnail" className="w-full h-full object-cover" />
                </div>
              )}
            </Field>
          </Card>
          <Card title="SEO">
            <div className="space-y-3">
              <Field label="Meta Title">
                <input className={inp} placeholder="e.g. Buy Comfort Bra Online | Glovia"
                  value={form.metaTitle} onChange={e => setField("metaTitle", e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">{form.metaTitle.length}/60 chars</p>
              </Field>
              <Field label="Meta Description">
                <textarea className={cn(inp, "resize-none h-20")}
                  placeholder="SEO description for search engines..."
                  value={form.metaDescription} onChange={e => setField("metaDescription", e.target.value)} />
                <p className="text-xs text-muted-foreground">{form.metaDescription.length}/160 chars</p>
              </Field>
              <Field label="Meta Keywords" hint="Comma separated">
                <input className={inp} placeholder="bra, comfort bra, padded bra"
                  value={form.metaKeywords} onChange={e => setField("metaKeywords", e.target.value)} />
              </Field>
            </div>
          </Card>
          <div className="admin-card p-4">
            <div className="space-y-2">
              <button type="button" onClick={() => handleSubmit(false)} disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PackagePlus className="w-4 h-4" />} {isSubmitting ? "Saving..." : "Add Product"}
              </button>
              <button type="button" onClick={() => handleSubmit(true)} disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <Save className="w-4 h-4" /> Save as Draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}


export default function AddProduct() {
  return <AddProductForm />;
}