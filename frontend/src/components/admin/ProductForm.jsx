"use client";

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Plus, Trash2, ChevronRight, Bold, Italic, Underline,
  Link2, List, ChevronDown, X, Image as ImageIcon,
  Save, Calendar, PackagePlus, Check, Info, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import AdminBreadcrumbs from "@/components/admin/AdminBreadcrumbs";

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
  images: [],
  selectedSizes: [],
  sizeDetails: {},
  isExpanded: true,
});

const makeSizeDetail = () => ({ sku: "", price: "", mrp: "", stock: "0", isActive: true });

const makeOffer = () => ({
  id: uid(),
  title: "",
  code: "",
  discountType: "percentage",
  discountValue: "",
  minOrderValue: "",
  description: "",
  isActive: true,
});

const makePincode = () => ({ id: uid(), pincode: "", codAvailable: true, estimatedDays: "3" });

const inp =
  "w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all";

// Helper function for error styling
const getInputClass = (hasError) =>
  cn(inp, hasError && "border-red-500 bg-red-50 focus:ring-red-500");

// Validation Schema
export const productSchema = yup.object().shape({
  name: yup.string().required("Product name is required"),
  brand: yup.string().required("Brand name is required"),
  category: yup.string().required("Product category is required"),
  subCategory: yup.string(),
  shortDescription: yup.string(),
  thumbnail: yup.string(),
  productDetails: yup.string().required("Product details are required"),
  features: yup.array().of(yup.string()),
  materialCare: yup.array().of(yup.string()),
  sizeAndFits: yup.array().of(
    yup.object().shape({
      key: yup.string(),
      value: yup.string(),
    })
  ),
  specifications: yup.array().of(
    yup.object().shape({
      key: yup.string(),
      value: yup.string(),
    })
  ),
  variants: yup.array().of(
    yup.object().shape({
      id: yup.string(),
      color: yup.string().required("Color name is required"),
      colorCode: yup.string().required("Color code is required"),
      video: yup.string(),
      images: yup.array().min(1, "At least one image is required").of(
        yup.object().shape({
          url: yup.string().required(),
          altText: yup.string(),
          isPrimary: yup.boolean(),
          order: yup.number(),
        })
      ),
      selectedSizes: yup.array().min(1, "At least one size is required").of(yup.string()),
      sizeDetails: yup.object(),
      isExpanded: yup.boolean(),
    })
  ).min(1, "At least one variant is required"),
  offers: yup.array().of(
    yup.object().shape({
      id: yup.string(),
      title: yup.string(),
      code: yup.string(),
      discountType: yup.string(),
      discountValue: yup.string(),
      minOrderValue: yup.string(),
      description: yup.string(),
      isActive: yup.boolean(),
    })
  ),
  pincodes: yup.array().of(
    yup.object().shape({
      id: yup.string(),
      pincode: yup.string(),
      codAvailable: yup.boolean(),
      estimatedDays: yup.string(),
    })
  ),
  isFeatured: yup.boolean(),
  isBestSeller: yup.boolean(),
  isNewArrival: yup.boolean(),
  isActive: yup.boolean(),
  metaTitle: yup.string(),
  metaDescription: yup.string(),
  metaKeywords: yup.string(),
});

// ============ COMPONENTS ============

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

function Field({ label, required, hint, error, children, half }) {
  return (
    <div className={cn("space-y-1.5", half && "flex-1")}>
      <label className={cn("text-xs font-medium uppercase tracking-wide", error ? "text-red-600" : "text-muted-foreground")}>
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
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

function SizeDropdown({ selected, onChange, hasError }) {
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
        className={getInputClass(hasError)}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
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
        canvas.height = img.width > maxWidth ? img.height * scale : img.height;

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

      const base64 = await compressImage(file);

      // Convert back to File
      const arr = base64.split(",");
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const compressedFile = new File([u8arr], file.name, { type: mime });

      const url = URL.createObjectURL(compressedFile);

      newImages.push({
        url: url, // Local preview URL
        file: compressedFile, // Stored to be sent in FormData
        altText: file.name,
        isPrimary: images.length === 0 && i === 0,
        order: images.length + i,
      });
    }
    newImages.forEach((img) => onAdd(img));

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
            <img src={img.url.startsWith('http') || img.url.startsWith('blob:') ? img.url : `${API_BASE}${img.url}`} alt={img.altText || ""} className="w-full h-full object-cover" />
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
                  className="px-1.5 py-0.5 rounded-md bg-primary text-primary-foreground text-[10px] font-medium bg-black z-[999] text-blue-500"
                >
                  Set Primary
                </button>
              )}
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="px-1.5 py-0.5 rounded-md bg-destructive text-destructive-foreground text-[10px] font-medium bg-black z-[999] text-red-500"
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

// ============ MAIN FORM COMPONENT ============

export const ProductForm = forwardRef(function ProductForm({
  mode = "add",
  initialData = null,
  onClose = null,
  onSuccess = null,
  showLayout = true,
}, ref) {
  const router = useRouter();
  const productDetailsRef = useRef(null);

  const [isPublishSubmitting, setIsPublishSubmitting] = useState(false);
  const [isDraftSubmitting, setIsDraftSubmitting] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState({});
  const [thumbnailFile, setThumbnailFile] = useState(null);

  // Initialize form with React Hook Form and Yup validation
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
    trigger,
    reset,
  } = useForm({
    resolver: yupResolver(productSchema),
    defaultValues: {
      name: "",
      brand: "",
      category: "",
      subCategory: "",
      shortDescription: "",
      thumbnail: "",
      productDetails: "",
      features: [""],
      materialCare: [""],
      sizeAndFits: [{ key: "", value: "" }],
      specifications: [{ key: "", value: "" }],
      variants: [makeVariant()],
      offers: [],
      pincodes: [],
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: false,
      isActive: true,
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
    },
  });

  // Watch form values for dynamic updates
  const watchedVariants = watch("variants");
  const watchedFeatures = watch("features");
  const watchedMaterialCare = watch("materialCare");
  const watchedSizeAndFits = watch("sizeAndFits");
  const watchedSpecifications = watch("specifications");
  const watchedOffers = watch("offers");
  const watchedPincodes = watch("pincodes");

  // Initialize form data when editing
  useEffect(() => {
    if (mode === "edit" && initialData) {
      const formData = {
        name: initialData.name || "",
        brand: initialData.brand || "",
        category: initialData.category || "",
        subCategory: initialData.subCategory || "",
        shortDescription: initialData.shortDescription || "",
        thumbnail: initialData.thumbnail || "",
        productDetails: initialData.productDetails || "",
        features: initialData.features?.length ? initialData.features : [""],
        materialCare: initialData.materialCare?.length ? initialData.materialCare : [""],
        sizeAndFits: initialData.sizeAndFits?.length
          ? initialData.sizeAndFits.map(s => ({ key: s.label || s.key, value: s.value }))
          : [{ key: "", value: "" }],
        specifications: initialData.specifications?.length
          ? initialData.specifications.map(s => ({ key: s.key, value: s.value }))
          : [{ key: "", value: "" }],
        variants: initialData.variants?.length
          ? initialData.variants.map(v => ({
            id: uid(),
            color: v.color || "",
            colorCode: v.colorCode || "",
            video: v.video || "",
            images: v.images || [],
            selectedSizes: v.sizes?.map(s => s.size) || [],
            sizeDetails: v.sizes?.reduce((acc, s) => {
              acc[s.size] = {
                sku: s.sku || "",
                price: s.price?.toString() || "",
                mrp: s.mrp?.toString() || "",
                stock: s.stock?.toString() || "0",
                isActive: s.isActive !== false,
              };
              return acc;
            }, {}) || {},
            isExpanded: true,
          }))
          : [makeVariant()],
        offers: initialData.offers?.length
          ? initialData.offers.map(o => ({
            id: uid(),
            title: o.title || "",
            code: o.code || "",
            discountType: o.discountType || "percentage",
            discountValue: o.discountValue?.toString() || "",
            minOrderValue: o.minOrderValue?.toString() || "",
            description: o.description || "",
            isActive: o.isActive !== false,
          }))
          : [],
        pincodes: initialData.serviceablePincodes?.length
          ? initialData.serviceablePincodes.map(p => ({
            id: uid(),
            pincode: p.pincode || "",
            codAvailable: p.codAvailable !== false,
            estimatedDays: p.estimatedDays?.toString() || "3",
          }))
          : [],
        isFeatured: initialData.isFeatured || false,
        isBestSeller: initialData.isBestSeller || false,
        isNewArrival: initialData.isNewArrival || false,
        isActive: initialData.isActive !== false,
        metaTitle: initialData.metaTitle || "",
        metaDescription: initialData.metaDescription || "",
        metaKeywords: Array.isArray(initialData.metaKeywords)
          ? initialData.metaKeywords.join(", ")
          : (initialData.metaKeywords || ""),
      };
      reset(formData);
    }
  }, [mode, initialData, reset]);

  useImperativeHandle(ref, () => ({
    save: async () => {
      // run validation and return values
      const valid = await trigger();
      const values = getValues();
      return { valid, values };
    },
  }));

  const updateSizeDetail = (variantId, size, field, value) => {
    const currentVariants = getValues("variants");
    const updatedVariants = currentVariants.map(v =>
      v.id === variantId
        ? {
          ...v,
          sizeDetails: {
            ...v.sizeDetails,
            [size]: {
              ...(v.sizeDetails[size] || makeSizeDetail()),
              [field]: value,
            },
          },
        }
        : v
    );
    setValue("variants", updatedVariants);
  };

  const vUpdate = (id, field, value) => {
    const currentVariants = getValues("variants");
    const updatedVariants = currentVariants.map(v =>
      v.id === id ? { ...v, [field]: value } : v
    );
    setValue("variants", updatedVariants);
  };

  const vGet = (id) => watchedVariants.find(v => v.id === id);

  const vImgAdd = (id, img) => {
    const currentVariants = getValues("variants");
    const updatedVariants = currentVariants.map(v =>
      v.id === id ? { ...v, images: [...v.images, img] } : v
    );
    setValue("variants", updatedVariants);
  };

  const vImgRemove = (id, i) => {
    const currentVariants = getValues("variants");
    const updatedVariants = currentVariants.map(v => {
      if (v.id === id) {
        const imgs = v.images.filter((_, j) => j !== i);
        if (imgs.length > 0 && !imgs.some(x => x.isPrimary)) imgs[0].isPrimary = true;
        return { ...v, images: imgs };
      }
      return v;
    });
    setValue("variants", updatedVariants);
  };

  const vImgSetPrimary = (id, i) => {
    const currentVariants = getValues("variants");
    const updatedVariants = currentVariants.map(v =>
      v.id === id
        ? {
          ...v,
          images: v.images.map((img, j) => ({ ...img, isPrimary: j === i })),
        }
        : v
    );
    setValue("variants", updatedVariants);
  };

  // Helper functions for arrays
  const strUpdate = (field, i, v) => {
    const currentArray = getValues(field);
    const updatedArray = currentArray.map((x, j) => j === i ? v : x);
    setValue(field, updatedArray);
  };

  const strAdd = (field) => {
    const currentArray = getValues(field);
    setValue(field, [...currentArray, ""]);
  };

  const strRemove = (field, i) => {
    const currentArray = getValues(field);
    setValue(field, currentArray.filter((_, j) => j !== i));
  };

  const kvUpdate = (field, i, key, v) => {
    const currentArray = getValues(field);
    const updatedArray = currentArray.map((x, j) =>
      j === i ? { ...x, [key]: v } : x
    );
    setValue(field, updatedArray);
  };

  const kvAdd = (field) => {
    const currentArray = getValues(field);
    setValue(field, [...currentArray, { key: "", value: "" }]);
  };

  const kvRemove = (field, i) => {
    const currentArray = getValues(field);
    setValue(field, currentArray.filter((_, j) => j !== i));
  };

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

    return data.url;
  };

  const handleSizeSelect = (variantId, sizes) => {
    const currentVariants = getValues("variants");
    const updatedVariants = currentVariants.map(v => {
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
    });
    setValue("variants", updatedVariants);
  };

  const onSubmit = async (formData, isDraft = false) => {
    console.log("onSubmit called with:", { formData, isDraft });

    // Set loading state for the correct button
    if (isDraft) {
      setIsDraftSubmitting(true);
    } else {
      setIsPublishSubmitting(true);
    }

    // Validate that we have formData
    if (!formData || typeof formData !== 'object') {
      console.error("Invalid formData received:", formData);
      toast.error("Form data is invalid. Please try again.");
      if (isDraft) setIsDraftSubmitting(false);
      else setIsPublishSubmitting(false);
      return;
    }

    // For non-draft submissions, ensure required fields are present
    // Draft submissions do NOT require validation
    if (!isDraft) {
      if (!formData.name?.trim()) {
        toast.error("Product name is required");
        setIsPublishSubmitting(false);
        return;
      }
      if (!formData.brand?.trim()) {
        toast.error("Brand name is required");
        setIsPublishSubmitting(false);
        return;
      }
      if (!formData.category?.trim()) {
        toast.error("Product category is required");
        setIsPublishSubmitting(false);
        return;
      }
      if (!formData.productDetails?.trim()) {
        toast.error("Product details are required");
        setIsPublishSubmitting(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        toast.error("Session expired. Please login again.");
        router.push("/admin/auth");
        return;
      }

      // Build the API payload
      console.log("Building payload with formData:", formData);
      const payload = {
        name: formData.name,
        brand: formData.brand,
        category: formData.category,
        subCategory: formData.subCategory || "",
        shortDescription: formData.shortDescription || "",
        thumbnail: formData.thumbnail || "",
        productDetails: formData.productDetails,
        features: formData.features.filter(f => f.trim()),
        materialCare: formData.materialCare.filter(m => m.trim()),
        sizeAndFits: formData.sizeAndFits.filter(s => s.key && s.value),
        specifications: formData.specifications.filter(s => s.key && s.value),
        variants: formData.variants.map(v => ({
          color: v.color,
          colorCode: v.colorCode,
          video: v.video || "",
          images: v.images.map((img, i) => ({
            ...img,
            file: undefined, // Strip out file objects from the JSON payload
            isPrimary: i === 0,
            order: i,
          })),
          sizes: Object.entries(v.sizeDetails).map(([size, detail]) => ({
            size,
            sku: detail.sku,
            price: parseFloat(detail.price) || 0,
            mrp: parseFloat(detail.mrp) || 0,
            stock: parseInt(detail.stock) || 0,
            isActive: detail.isActive !== false,
          })),
        })),
        offers: formData.offers?.filter(o => o.title && o.code) || [],
        pincodes: formData.pincodes?.map(p => ({
          pincode: p.pincode,
          codAvailable: p.codAvailable || false,
          estimatedDays: parseInt(p.estimatedDays) || 3,
        })) || [],
        isFeatured: formData.isFeatured || false,
        isBestSeller: formData.isBestSeller || false,
        isNewArrival: formData.isNewArrival || false,
        isActive: formData.isActive !== false,
        status: isDraft ? "draft" : "published",
        metaTitle: formData.metaTitle || "",
        metaDescription: formData.metaDescription || "",
        metaKeywords: formData.metaKeywords || "",
      };

      const formDataObj = new FormData();
      // Appending stringified form payload into 'variants' structure is allowed.
      // We send top-level keys individually to the backend.
      Object.keys(payload).forEach((key) => {
        if (typeof payload[key] === "object" && payload[key] !== null) {
          formDataObj.append(key, JSON.stringify(payload[key]));
        } else {
          formDataObj.append(key, payload[key]);
        }
      });

      // Append Media files based on fieldname pattern that backend expects: `images_${variantIndex}` or `video_${variantIndex}`.
      formData.variants.forEach((v, variantIndex) => {
        // Images
        v.images.forEach((img) => {
          if (img.file) {
            formDataObj.append(`images_${variantIndex}`, img.file);
          }
        });
        // Video
        if (uploadedVideo[v.id]) {
          formDataObj.append(`video_${variantIndex}`, uploadedVideo[v.id]);
        }
      });

      // Append thumbnail file
      if (thumbnailFile) {
        formDataObj.append("thumbnail", thumbnailFile);
      }

      const isEditWithId = mode === "edit" && initialData && initialData._id;
      const endpoint = isEditWithId
        ? `${API_BASE}/api/admin/products/${initialData._id}`
        : `${API_BASE}/api/admin/products`;

      const method = isEditWithId ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          // "Content-Type" will be automatically set to multipart/form-data by the browser
          Authorization: `Bearer ${token}`,
        },
        body: formDataObj,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${mode === "edit" ? "update" : "create"} product`);
      }

      const successMessage = isDraft
        ? "Product saved as draft!"
        : `Product ${mode === "edit" ? "updated" : "created"} successfully!`;

      toast.success(data.message || successMessage);

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(data.product);
      }

      // Redirect based on mode only if caller did not provide an onSuccess handler
      if (!onSuccess) {
        setTimeout(() => {
          if (isDraft && mode === "add") {
            router.push("/admin/products/drafts");
          } else {
            router.push("/admin/products");
          }
        }, 500);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(error.message || "Failed to submit form");
    } finally {
      if (isDraft) setIsDraftSubmitting(false);
      else setIsPublishSubmitting(false);
    }
  };





  const formContent = (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        {/* Name and Description */}
        <Card title="Name and Description">
          <div className="space-y-4">
            <div className="flex gap-4">
              <Field label="Product Name" required error={errors.name?.message} half>
                <input
                  className={getInputClass(!!errors.name)}
                  placeholder="e.g. Glovia Ultra Comfort Bra"
                  {...register("name")}
                />
              </Field>
              <Field label="Brand Name" required error={errors.brand?.message} half>
                <input
                  className={getInputClass(!!errors.brand)}
                  placeholder="e.g. Glovia"
                  {...register("brand")}
                />
              </Field>
            </div>

            <Field label="Short Description" error={errors.shortDescription?.message}>
              <textarea
                className={cn(getInputClass(!!errors.shortDescription), "resize-none h-20")}
                placeholder="Brief summary shown in product listings..."
                {...register("shortDescription")}
              />
            </Field>

            <Field label="Product Details" required error={errors.productDetails?.message}>
              <textarea
                className={cn(getInputClass(!!errors.productDetails), "resize-none h-32")}
                placeholder="Detailed product description, materials, styling notes..."
                {...register("productDetails")}
              />
            </Field>

            <Field label="Key Features" hint="Each entry becomes a bullet point on the product page">
              <div className="space-y-2">
                {watchedFeatures.map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    <input
                      className={inp}
                      placeholder={`Feature ${i + 1}`}
                      value={f}
                      onChange={e => strUpdate("features", i, e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => strRemove("features", i)}
                      disabled={watchedFeatures.length === 1}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => strAdd("features")}
                  className="flex items-center gap-1.5 text-sm text-primary hover:underline font-medium mt-1"
                >
                  <Plus className="w-4 h-4" /> Add Feature
                </button>
              </div>
            </Field>
          </div>
        </Card>

        {/* Category */}
        <Card title="Category">
          <div className="flex gap-4">
            <Field label="Product Category" required error={errors.category?.message} half>
              <select
                className={getInputClass(!!errors.category)}
                {...register("category")}
              >
                <option value="">Select category...</option>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Sub Category" half hint="e.g. Full Coverage, Sports, Lace">
              <input
                className={inp}
                placeholder="e.g. Full Coverage"
                {...register("subCategory")}
              />
            </Field>
          </div>
        </Card>

        {/* Variants */}
        <Card
          title="Variants   "
          subtitle="Each variant = one color with its own images & sizes"
          action={
            <button
              type="button"
              onClick={() => setValue("variants", [...watchedVariants, makeVariant()])}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Color
            </button>
          }
        >
          <div className="space-y-4">
            {watchedVariants.map((variant, vIdx) => (
              <div key={variant.id} className="border border-border rounded-xl relative overflow-visible">
                {/* Variant header */}
                <div
                  className="flex items-center gap-3 px-4 py-3 bg-muted/40 cursor-pointer"
                  onClick={() => vUpdate(variant.id, "isExpanded", !variant.isExpanded)}
                >
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
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      const currentVariants = getValues("variants");
                      setValue("variants", currentVariants.filter(v => v.id !== variant.id));
                    }}
                    disabled={watchedVariants.length === 1}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {variant.isExpanded && (
                  <div className="p-5 space-y-5">
                    <div className="flex gap-4">
                      <Field label="Color Name" required error={errors.variants?.[vIdx]?.color?.message} half>
                        <input
                          className={getInputClass(!!errors.variants?.[vIdx]?.color)}
                          placeholder="e.g. Midnight Black"
                          value={variant.color}
                          onChange={(e) => vUpdate(variant.id, "color", e.target.value)}
                        />
                      </Field>

                      <Field label="Color Code / Thumbnail" required error={errors.variants?.[vIdx]?.colorCode?.message} half>
                        {!(
                          variant.colorCode?.startsWith("data:") ||
                          variant.colorCode?.startsWith("http")
                        ) ? (
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={variant.colorCode || "#000000"}
                              onChange={(e) => vUpdate(variant.id, "colorCode", e.target.value)}
                              className="w-10 h-10 rounded-lg border border-border cursor-pointer flex-shrink-0 p-0.5 bg-background"
                            />

                            <input
                              className={`${inp} w-36`}
                              placeholder="#10b981"
                              value={variant.colorCode}
                              onChange={(e) => vUpdate(variant.id, "colorCode", e.target.value)}
                            />

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
                                  vUpdate(variant.id, "colorCode", url);
                                }}
                              />
                            </label>
                          </div>
                        ) : (
                          <div className="flex items-start pl-2">
                            <div className="relative w-24 h-24 rounded-lg border overflow-hidden">
                              <img
                                src={variant.colorCode}
                                alt="thumbnail"
                                className="w-full h-full object-cover"
                              />

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

                            const url = URL.createObjectURL(file);

                            // Save local preview URL for rendering
                            vUpdate(variant.id, "video", url);

                            setUploadedVideo((prev) => ({
                              ...prev,
                              [variant.id]: file,
                            }));
                          }}
                        />
                      ) : (
                        /* FILE SELECTED BOX */
                        <div
                          className={`${inp} flex items-center justify-between px-3`}
                        >
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
                          className={inp}
                          placeholder="https://cdn.example.com/video.mp4"
                          value={variant.video}
                          onChange={(e) => vUpdate(variant.id, "video", e.target.value)}
                        />
                      </Field>
                    )}

                    <Field label="Variant Images" error={errors.variants?.[vIdx]?.images?.message}>
                      <ImageUploadArea
                        images={variant.images}
                        onAdd={(img) => vImgAdd(variant.id, img)}
                        onRemove={(i) => vImgRemove(variant.id, i)}
                        onSetPrimary={(i) => vImgSetPrimary(variant.id, i)}
                      />
                    </Field>

                    <Field label="Available Sizes" hint="Select which sizes are available for this color" error={errors.variants?.[vIdx]?.selectedSizes?.message}>
                      <SizeDropdown
                        selected={variant.selectedSizes}
                        onChange={(sizes) => handleSizeSelect(variant.id, sizes)}
                        hasError={!!errors.variants?.[vIdx]?.selectedSizes}
                      />
                    </Field>

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

        {/* Size & Fits */}
        <Card title="Size & Fits" subtitle="Dynamic attributes e.g. Fabric: 80% Cotton, Padding: Lightly Padded">
          <div className="space-y-2">
            {watchedSizeAndFits.map((sf, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className={inp}
                  placeholder="Label (e.g. Fabric)"
                  value={sf.key}
                  onChange={e => kvUpdate("sizeAndFits", i, "key", e.target.value)}
                />
                <input
                  className={inp}
                  placeholder="Value (e.g. 80% Cotton)"
                  value={sf.value}
                  onChange={e => kvUpdate("sizeAndFits", i, "value", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => kvRemove("sizeAndFits", i)}
                  disabled={watchedSizeAndFits.length === 1}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => kvAdd("sizeAndFits")}
              className="flex items-center gap-1.5 text-sm text-primary hover:underline font-medium mt-1"
            >
              <Plus className="w-4 h-4" /> Add Entry
            </button>
          </div>
        </Card>

        {/* Material & Care */}
        <Card title="Material & Care">
          <div className="space-y-2">
            {watchedMaterialCare.map((m, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <input
                  className={inp}
                  placeholder="e.g. Hand wash in cold water only"
                  value={m}
                  onChange={e => strUpdate("materialCare", i, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => strRemove("materialCare", i)}
                  disabled={watchedMaterialCare.length === 1}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => strAdd("materialCare")}
              className="flex items-center gap-1.5 text-sm text-primary hover:underline font-medium mt-1"
            >
              <Plus className="w-4 h-4" /> Add Instruction
            </button>
          </div>
        </Card>

        {/* Specifications */}
        <Card title="Specifications" subtitle="Technical specs e.g. Closure: Hook & Eye, Wire: Underwired">
          <div className="space-y-2">
            {watchedSpecifications.map((spec, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className={inp}
                  placeholder="Spec name (e.g. Closure)"
                  value={spec.key}
                  onChange={e => kvUpdate("specifications", i, "key", e.target.value)}
                />
                <input
                  className={inp}
                  placeholder="Value (e.g. Hook & Eye)"
                  value={spec.value}
                  onChange={e => kvUpdate("specifications", i, "value", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => kvRemove("specifications", i)}
                  disabled={watchedSpecifications.length === 1}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => kvAdd("specifications")}
              className="flex items-center gap-1.5 text-sm text-primary hover:underline font-medium mt-1"
            >
              <Plus className="w-4 h-4" /> Add Specification
            </button>
          </div>
        </Card>

        {/* Offers */}
        <Card title="Offers"
          subtitle="Promotional offers for this product"
          action={
            <button
              type="button"
              onClick={() => setValue("offers", [...watchedOffers, makeOffer()])}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Offer
            </button>
          }
        >
          {watchedOffers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No offers added yet.</p>
          ) : (
            <div className="space-y-4">
              {watchedOffers.map((offer, i) => (
                <div key={offer.id} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">Offer {i + 1}</p>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={offer.isActive}
                          className="accent-primary"
                          onChange={e => {
                            const currentOffers = getValues("offers");
                            const updatedOffers = currentOffers.map((o, j) =>
                              j === i ? { ...o, isActive: e.target.checked } : o
                            );
                            setValue("offers", updatedOffers);
                          }}
                        />
                        Active
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const currentOffers = getValues("offers");
                          setValue("offers", currentOffers.filter((_, j) => j !== i));
                        }}
                        className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Title">
                      <input
                        className={inp}
                        placeholder="e.g. Summer Sale"
                        value={offer.title}
                        onChange={e => {
                          const currentOffers = getValues("offers");
                          const updatedOffers = currentOffers.map((o, j) =>
                            j === i ? { ...o, title: e.target.value } : o
                          );
                          setValue("offers", updatedOffers);
                        }}
                      />
                    </Field>
                    <Field label="Code">
                      <input
                        className={inp}
                        placeholder="e.g. SUMMER20"
                        value={offer.code}
                        onChange={e => {
                          const currentOffers = getValues("offers");
                          const updatedOffers = currentOffers.map((o, j) =>
                            j === i ? { ...o, code: e.target.value } : o
                          );
                          setValue("offers", updatedOffers);
                        }}
                      />
                    </Field>
                    <Field label="Discount Type">
                      <select
                        className={inp}
                        value={offer.discountType}
                        onChange={e => {
                          const currentOffers = getValues("offers");
                          const updatedOffers = currentOffers.map((o, j) =>
                            j === i ? { ...o, discountType: e.target.value } : o
                          );
                          setValue("offers", updatedOffers);
                        }}
                      >
                        <option value="percentage">Percentage</option>
                        <option value="flat">Flat</option>
                      </select>
                    </Field>
                    <Field label="Discount Value">
                      <input
                        type="number"
                        className={inp}
                        placeholder="20"
                        value={offer.discountValue}
                        onChange={e => {
                          const currentOffers = getValues("offers");
                          const updatedOffers = currentOffers.map((o, j) =>
                            j === i ? { ...o, discountValue: e.target.value } : o
                          );
                          setValue("offers", updatedOffers);
                        }}
                      />
                    </Field>
                    <Field label="Min Order Value">
                      <input
                        type="number"
                        className={inp}
                        placeholder="500"
                        value={offer.minOrderValue}
                        onChange={e => {
                          const currentOffers = getValues("offers");
                          const updatedOffers = currentOffers.map((o, j) =>
                            j === i ? { ...o, minOrderValue: e.target.value } : o
                          );
                          setValue("offers", updatedOffers);
                        }}
                      />
                    </Field>
                  </div>
                  <Field label="Description">
                    <input
                      className={inp}
                      placeholder="Offer description..."
                      value={offer.description}
                      onChange={e => {
                        const currentOffers = getValues("offers");
                        const updatedOffers = currentOffers.map((o, j) =>
                          j === i ? { ...o, description: e.target.value } : o
                        );
                        setValue("offers", updatedOffers);
                      }}
                    />
                  </Field>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Serviceable Pincodes */}
        <Card title="Serviceable Pincodes"
          subtitle="Areas where this product can be delivered"
          action={
            <button
              type="button"
              onClick={() => setValue("pincodes", [...watchedPincodes, makePincode()])}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Pincode
            </button>
          }
        >
          {watchedPincodes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No pincodes added. Leave empty for all areas.</p>
          ) : (
            <div className="space-y-2">
              {watchedPincodes.map((pc, i) => (
                <div key={pc.id} className="flex items-center gap-2">
                  <input
                    className={cn(inp, "max-w-[130px]")}
                    placeholder="400001"
                    value={pc.pincode}
                    onChange={e => {
                      const currentPincodes = getValues("pincodes");
                      const updatedPincodes = currentPincodes.map((x, j) =>
                        j === i ? { ...x, pincode: e.target.value } : x
                      );
                      setValue("pincodes", updatedPincodes);
                    }}
                  />
                  <input
                    type="number"
                    className={cn(inp, "max-w-[80px]")}
                    placeholder="3"
                    value={pc.estimatedDays}
                    onChange={e => {
                      const currentPincodes = getValues("pincodes");
                      const updatedPincodes = currentPincodes.map((x, j) =>
                        j === i ? { ...x, estimatedDays: e.target.value } : x
                      );
                      setValue("pincodes", updatedPincodes);
                    }}
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">days</span>
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={pc.codAvailable}
                      className="accent-primary"
                      onChange={e => {
                        const currentPincodes = getValues("pincodes");
                        const updatedPincodes = currentPincodes.map((x, j) =>
                          j === i ? { ...x, codAvailable: e.target.checked } : x
                        );
                        setValue("pincodes", updatedPincodes);
                      }}
                    />
                    COD
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const currentPincodes = getValues("pincodes");
                      setValue("pincodes", currentPincodes.filter((_, j) => j !== i));
                    }}
                    className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Right Sidebar */}
      <div className="space-y-5">
        <Card title="Product Status">
          <div className="divide-y divide-border">
            <Toggle
              checked={watch("isActive")}
              onChange={v => setValue("isActive", v)}
              label="Active"
              desc="Visible to customers"
            />
            <Toggle
              checked={watch("isFeatured")}
              onChange={v => setValue("isFeatured", v)}
              label="Featured"
              desc="Show on homepage"
            />
            <Toggle
              checked={watch("isBestSeller")}
              onChange={v => setValue("isBestSeller", v)}
              label="Best Seller"
              desc="Best seller badge"
            />
            <Toggle
              checked={watch("isNewArrival")}
              onChange={v => setValue("isNewArrival", v)}
              label="New Arrival"
              desc="New arrival badge"
            />
          </div>
        </Card>

        {/* Thumbnail */}
        <Card title="Thumbnail">
          <Field label="Thumbnail" error={errors.thumbnail?.message} hint="Auto-set from first variant image if empty">
            {/* IF NO FILE SELECTED */}
            {!thumbnailFile ? (
              <input
                type="file"
                accept="image/*"
                className={getInputClass(!!errors.thumbnail)}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  try {
                    // Upload thumbnail file immediately
                    const uploadedUrl = await uploadFile(file);
                    setValue("thumbnail", uploadedUrl); // Save real file path
                    setThumbnailFile(file); // Store file for upload
                  } catch (err) {
                    console.error("Thumbnail upload error:", err);
                    toast.error("Failed to upload thumbnail");
                  }
                }}
              />
            ) : (
              /* FILE SELECTED BOX */
              <div className={cn(getInputClass(!!errors.thumbnail), "flex items-center justify-between px-3")}>
                <span className="truncate">{thumbnailFile.name}</span>
                <button
                  type="button"
                  className="text-sm text-red-500 hover:text-red-700"
                  onClick={() => {
                    setThumbnailFile(null);
                    setValue("thumbnail", "");
                  }}
                >
                  Remove
                </button>
              </div>
            )}
            {watch("thumbnail") && (
              <div className="mt-2 relative group rounded-lg overflow-hidden border border-border aspect-square w-full max-w-[100px]">

                <img
                  src={watch("thumbnail").startsWith('http') || watch("thumbnail").startsWith('blob:') ? watch("thumbnail") : `${API_BASE}${watch("thumbnail")}`}
                  alt="thumbnail"
                  className="w-full h-full object-cover"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">

                  <button
                    type="button"
                    className="px-1.5 py-0.5 rounded-md bg-destructive text-destructive-foreground text-[10px] font-medium bg-black z-[999] text-red-500"
                    onClick={() => {
                      setThumbnailFile(null);
                      setValue("thumbnail", "");
                    }}
                  >
                    Remove
                  </button>

                </div>
              </div>
            )}
          </Field>
        </Card>

        {/* SEO */}
        <Card title="SEO">
          <div className="space-y-3">
            <Field label="Meta Title">
              <input
                className={inp}
                placeholder="e.g. Buy Comfort Bra Online | Glovia"
                {...register("metaTitle")}
              />
              <p className="text-xs text-muted-foreground mt-1">{watch("metaTitle")?.length || 0}/60 chars</p>
            </Field>
            <Field label="Meta Description">
              <textarea
                className={cn(inp, "resize-none h-20")}
                placeholder="SEO description for search engines..."
                {...register("metaDescription")}
              />
              <p className="text-xs text-muted-foreground">{watch("metaDescription")?.length || 0}/160 chars</p>
            </Field>
            <Field label="Meta Keywords" hint="Comma separated">
              <input
                className={inp}
                placeholder="bra, comfort bra, padded bra"
                {...register("metaKeywords")}
              />
            </Field>
          </div>
        </Card>

        {/* Submit Buttons */}
        <div className="admin-card p-4">
          <div className="space-y-2">
            <form onSubmit={handleSubmit((data) => onSubmit(data, false))}>
              <button
                type="submit"
                disabled={isPublishSubmitting || isDraftSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary border border-border text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPublishSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PackagePlus className="w-4 h-4" />}
                {isPublishSubmitting ? "Saving..." : mode === "edit" ? "Update Product" : "Publish Product"}
              </button>

            </form>
            {/* {mode === "add" && ( */}
            <button
              type="button"
              onClick={async (e) => {
                e.preventDefault();
                if (isDraftSubmitting || isPublishSubmitting) return;
                const draftData = getValues();
                await onSubmit(draftData, true);
              }}
              disabled={isDraftSubmitting || isPublishSubmitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* {isDraftSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {isDraftSubmitting ? "Saving..." : "Save as Draft"} */}
              {isDraftSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isDraftSubmitting
                ? "Saving..."
                : mode === "edit"
                  ? "Update Draft"
                  : "Save as Draft"}
            </button>
            {/* )} */}
          </div>
        </div>
      </div>
    </div>
  );

  if (!showLayout) {
    return formContent;
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6 ">
        <AdminBreadcrumbs
          mode={mode === "edit" ? "edit" : "add"}
          items={[
            { label: "Home", href: "/admin" },
            { label: "MyShop", href: "/admin/products" },
          ]}
        />

        <div className="flex items-start justify-between mt-2">

          <div>

            <h1 className="text-2xl font-bold text-foreground">
              {mode === "edit" ? "Edit Product" : "Add New Product"}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {mode === "edit" ? "Update product details and information" : "Add a new product to your store"}
            </p>
          </div>

          <button className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
            >
            Import Products
          </button>
        </div>
      </div>
      
      {formContent}
    </div>
  );
})
