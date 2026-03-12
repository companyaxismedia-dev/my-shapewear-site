"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { productSchema } from "./ProductForm";
import { API_BASE } from "@/lib/api";

export default function ImportModal({ open, onClose }) {
  const router = useRouter();
  const [fileName, setFileName] = useState("");
  const [parsing, setParsing] = useState(false);

  const uid = () => Math.random().toString(36).slice(2);
  const inputRef = useRef();

  if (!open) return null;

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    setParsing(true);

    const ext = f.name.split('.').pop().toLowerCase();

    // For JSON files, parse as text
    if (ext === 'json') {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const json = JSON.parse(ev.target.result);
          const rows = Array.isArray(json) ? json.map(r => normalizeRow(r)) : [];
          runValidationAndNavigate(rows);
        } catch (err) {
          console.error(err);
          setParsing(false);
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(f);
      return;
    }

    // For CSV and Excel files, use SheetJS (handles CSV, xls, xlsx, etc.)
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        const rows = json.map(r => normalizeRow(r));
        runValidationAndNavigate(rows);
      } catch (err) {
        console.error(err);
        setParsing(false);
        alert('Failed to parse file');
      }
    };
    reader.readAsArrayBuffer(f);
  };

  const normalizeRow = (r) => {
    // Basic normalization: split semicolon-separated lists for features/materialCare
    const copy = { ...r };
    if (typeof copy.features === 'string') copy.features = copy.features ? copy.features.split(';').map(s => s.trim()) : [];
    if (typeof copy.materialCare === 'string') copy.materialCare = copy.materialCare ? copy.materialCare.split(';').map(s => s.trim()) : [];
    if (typeof copy.sizeAndFits === 'string') {
      try { copy.sizeAndFits = JSON.parse(copy.sizeAndFits); } catch { copy.sizeAndFits = []; }
    }
    if (typeof copy.specifications === 'string') {
      try { copy.specifications = JSON.parse(copy.specifications); } catch { copy.specifications = []; }
    }
    if (typeof copy.variants === 'string') {
      try { copy.variants = JSON.parse(copy.variants); } catch { copy.variants = [] }
    }
    if (typeof copy.pincodes === 'string') {
      try { copy.pincodes = JSON.parse(copy.pincodes); } catch { copy.pincodes = []; }
    }

    // Normalize variants: filter out blob URLs from images
    if (Array.isArray(copy.variants)) {
      copy.variants = copy.variants.map(v => ({
        ...v,
        images: Array.isArray(v.images) ? v.images.filter(img => !img.url?.startsWith('blob:')) : [],
        video: (!v.video || v.video?.startsWith('blob:')) ? "" : v.video,
      }));
    }

    // Filter out blob URLs from thumbnail
    if (copy.thumbnail && copy.thumbnail.startsWith('blob:')) {
      copy.thumbnail = "";
    }

    // Normalize pincodes into objects expected by ProductForm / productSchema
    if (Array.isArray(copy.pincodes)) {
      try {
        copy.pincodes = copy.pincodes.map(p => ({ id: uid(), pincode: String(p), codAvailable: true, estimatedDays: '3' }));
      } catch (e) {
        copy.pincodes = [];
      }
    }
    // Convert boolean-like strings
    ['isFeatured','isBestSeller','isNewArrival','isActive'].forEach(k => {
      if (copy[k] === 'true' || copy[k] === '1') copy[k] = true;
      if (copy[k] === 'false' || copy[k] === '0') copy[k] = false;
    });
    return copy;
  };

  const runValidationAndNavigate = async (rows) => {
    const validated = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        await productSchema.validate(row, { abortEarly: false });
        validated.push({ data: row, errors: null, valid: true });
      } catch (err) {
        validated.push({ data: row, errors: err.errors || [err.message], valid: false });
      }
    }

    // Store results in sessionStorage and navigate to import page
    sessionStorage.setItem('multiple_import_data', JSON.stringify(validated));
    setParsing(false);
    onClose?.();
    router.push('/admin/products/multiple-import');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="bg-white rounded-lg p-6 w-[720px] z-10">
        <h3 className="text-lg font-semibold mb-3">Import Products (CSV / JSON)</h3>
        <p className="text-sm text-muted-foreground mb-3">CSV header names should match product fields. Use JSON for complex nested structures.</p>

        <div className="flex items-center gap-3">
          <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls,.json,.txt" onChange={handleFile} className="hidden" />
          <button type="button" className="px-3 py-2 border rounded bg-white btn-primary cursor-pointer" onClick={() => inputRef.current?.click()}>
            {parsing ? 'Parsing...' : 'Choose file'}
          </button>
          <div className="text-sm text-muted-foreground truncate max-w-[420px]">{fileName || 'No file chosen'}</div>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="btn-destructive px-4 py-2 flex items-center gap-2 text-sm whitespace-nowrap cursor-pointer" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
