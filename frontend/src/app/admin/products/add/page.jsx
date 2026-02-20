"use client";

import { useState } from "react";
import { Plus, Save } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import {API} from "@/lib/api";

export default function AddProductPage() {

  const [product, setProduct] = useState({
    name: "",
    brand: "",
    category: "",
    subCategory: "",
    shortDescription: "",
    productDetails: "",
    features: [],
    sizeAndFits: [],
    materialCare: [],
    specifications: [],
    variants: [],
    serviceablePincodes: [],
    offers: [],
    metaTitle: "",
    metaDescription: "",
    metaKeywords: [],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    isActive: true,
  });

  /* ===========================
     BASIC CHANGE
  =========================== */
  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  /* ===========================
     ARRAY HELPERS
  =========================== */
  const addFeature = () =>
    setProduct({ ...product, features: [...product.features, ""] });

  const updateFeature = (i, val) => {
    const arr = [...product.features];
    arr[i] = val;
    setProduct({ ...product, features: arr });
  };

  const addMaterial = () =>
    setProduct({ ...product, materialCare: [...product.materialCare, ""] });

  const updateMaterial = (i, val) => {
    const arr = [...product.materialCare];
    arr[i] = val;
    setProduct({ ...product, materialCare: arr });
  };

  /* ===========================
     SPECIFICATIONS
  =========================== */
  const addSpec = () =>
    setProduct({
      ...product,
      specifications: [...product.specifications, { key: "", value: "" }],
    });

  const updateSpec = (i, field, val) => {
    const arr = [...product.specifications];
    arr[i][field] = val;
    setProduct({ ...product, specifications: arr });
  };

  /* ===========================
     SIZE & FIT
  =========================== */
  const addFit = () =>
    setProduct({
      ...product,
      sizeAndFits: [...product.sizeAndFits, { label: "", value: "" }],
    });

  const updateFit = (i, field, val) => {
    const arr = [...product.sizeAndFits];
    arr[i][field] = val;
    setProduct({ ...product, sizeAndFits: arr });
  };

  /* ===========================
     VARIANTS
  =========================== */
  const addVariant = () => {
    setProduct({
      ...product,
      variants: [
        ...product.variants,
        { color: "", colorCode: "", images: [], sizes: [] },
      ],
    });
  };

  const addImage = (vIndex) => {
    const arr = [...product.variants];
    arr[vIndex].images.push({
      url: "",
      isPrimary: false,
      order: 0,
    });
    setProduct({ ...product, variants: arr });
  };

  const addSize = (vIndex) => {
    const arr = [...product.variants];
    arr[vIndex].sizes.push({
      size: "",
      sku: "",
      price: "",
      mrp: "",
      stock: 0,
      isActive: true,
    });
    setProduct({ ...product, variants: arr });
  };

  const updateVariant = (v, field, val) => {
    const arr = [...product.variants];
    arr[v][field] = val;
    setProduct({ ...product, variants: arr });
  };

  const updateImage = (v, i, field, val) => {
    const arr = [...product.variants];
    arr[v].images[i][field] = val;
    setProduct({ ...product, variants: arr });
  };

  const updateSize = (v, s, field, val) => {
    const arr = [...product.variants];
    arr[v].sizes[s][field] = val;
    setProduct({ ...product, variants: arr });
  };

  /* ===========================
     PINCODES
  =========================== */
  const addPincode = () => {
    setProduct({
      ...product,
      serviceablePincodes: [
        ...product.serviceablePincodes,
        { pincode: "", codAvailable: true, estimatedDays: 3 },
      ],
    });
  };

  /* ===========================
     OFFERS
  =========================== */
  const addOffer = () => {
    setProduct({
      ...product,
      offers: [
        ...product.offers,
        {
          title: "",
          code: "",
          discountType: "percentage",
          discountValue: "",
          minOrderValue: "",
          description: "",
          isActive: true,
        },
      ],
    });
  };

  /* ===========================
     SUBMIT
  =========================== */
  const handleSubmit = async () => {
    try {
      await API.post("/products", product);
      alert("Product Added");
    } catch (e) {
      console.log(e);
      alert("Backend not connected");
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">

      <AdminSidebar />

      <main className="flex-1 p-8 space-y-6">

        <h1 className="text-2xl font-bold">Add Product</h1>

        {/* BASIC */}
        <div className="bg-white p-5 rounded border space-y-3">
          <h2 className="font-semibold">Basic Info</h2>

          <input name="name" placeholder="Name" className="border p-2 w-full rounded" onChange={handleChange}/>
          <input name="brand" placeholder="Brand" className="border p-2 w-full rounded" onChange={handleChange}/>
          <input name="category" placeholder="Category" className="border p-2 w-full rounded" onChange={handleChange}/>
          <input name="subCategory" placeholder="Sub Category" className="border p-2 w-full rounded" onChange={handleChange}/>
          <textarea name="shortDescription" placeholder="Short Description" className="border p-2 w-full rounded" onChange={handleChange}/>
          <textarea name="productDetails" placeholder="Product Details" className="border p-2 w-full rounded" onChange={handleChange}/>
        </div>

        {/* FEATURES */}
        <div className="bg-white p-5 rounded border">
          <button onClick={addFeature} className="bg-blue-600 text-white px-3 py-1 rounded flex gap-2">
            <Plus size={16}/> Add Feature
          </button>
          {product.features.map((f,i)=>(
            <input key={i} className="border p-2 w-full mt-2 rounded"
              onChange={(e)=>updateFeature(i,e.target.value)} />
          ))}
        </div>

        {/* SIZE & FIT */}
        <div className="bg-white p-5 rounded border">
          <button onClick={addFit} className="bg-blue-600 text-white px-3 py-1 rounded">
            Add Size & Fit
          </button>

          {product.sizeAndFits.map((f,i)=>(
            <div key={i} className="grid grid-cols-2 gap-2 mt-2">
              <input placeholder="Label" className="border p-2 rounded"
                onChange={(e)=>updateFit(i,"label",e.target.value)} />
              <input placeholder="Value" className="border p-2 rounded"
                onChange={(e)=>updateFit(i,"value",e.target.value)} />
            </div>
          ))}
        </div>

        {/* SPECIFICATIONS */}
        <div className="bg-white p-5 rounded border">
          <button onClick={addSpec} className="bg-blue-600 text-white px-3 py-1 rounded">
            Add Specification
          </button>

          {product.specifications.map((s,i)=>(
            <div key={i} className="grid grid-cols-2 gap-2 mt-2">
              <input placeholder="Key" className="border p-2 rounded"
                onChange={(e)=>updateSpec(i,"key",e.target.value)} />
              <input placeholder="Value" className="border p-2 rounded"
                onChange={(e)=>updateSpec(i,"value",e.target.value)} />
            </div>
          ))}
        </div>

        {/* VARIANTS */}
        <div className="bg-white p-5 rounded border">
          <button onClick={addVariant} className="bg-green-600 text-white px-3 py-1 rounded">
            Add Variant
          </button>

          {product.variants.map((v,vi)=>(
            <div key={vi} className="border p-3 mt-3 rounded">

              <input placeholder="Color" className="border p-2 w-full mb-2 rounded"
                onChange={(e)=>updateVariant(vi,"color",e.target.value)} />

              <input placeholder="Color Code" className="border p-2 w-full mb-2 rounded"
                onChange={(e)=>updateVariant(vi,"colorCode",e.target.value)} />

              <button onClick={()=>addImage(vi)} className="bg-blue-500 text-white px-2 py-1 rounded mb-2">
                Add Image
              </button>

              {v.images.map((img,ii)=>(
                <input key={ii} placeholder="Image URL"
                  className="border p-2 w-full mb-2 rounded"
                  onChange={(e)=>updateImage(vi,ii,"url",e.target.value)}
                />
              ))}

              <button onClick={()=>addSize(vi)} className="bg-purple-600 text-white px-2 py-1 rounded">
                Add Size
              </button>

              {v.sizes.map((s,si)=>(
                <div key={si} className="grid grid-cols-5 gap-2 mt-2">
                  <input placeholder="Size" className="border p-2 rounded"
                    onChange={(e)=>updateSize(vi,si,"size",e.target.value)} />
                  <input placeholder="SKU" className="border p-2 rounded"
                    onChange={(e)=>updateSize(vi,si,"sku",e.target.value)} />
                  <input placeholder="Price" className="border p-2 rounded"
                    onChange={(e)=>updateSize(vi,si,"price",e.target.value)} />
                  <input placeholder="MRP" className="border p-2 rounded"
                    onChange={(e)=>updateSize(vi,si,"mrp",e.target.value)} />
                  <input placeholder="Stock" className="border p-2 rounded"
                    onChange={(e)=>updateSize(vi,si,"stock",e.target.value)} />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* SEO */}
        <div className="bg-white p-5 rounded border space-y-2">
          <input name="metaTitle" placeholder="Meta Title"
            className="border p-2 w-full rounded" onChange={handleChange}/>
          <textarea name="metaDescription" placeholder="Meta Description"
            className="border p-2 w-full rounded" onChange={handleChange}/>
        </div>

        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-6 py-3 rounded flex items-center gap-2"
        >
          <Save size={18}/>
          Save Product
        </button>

      </main>
    </div>
  );
}
