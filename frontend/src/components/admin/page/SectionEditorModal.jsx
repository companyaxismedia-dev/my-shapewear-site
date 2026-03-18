"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";

const KNOWN_SECTION_TYPES = [
  "hero_slider",
];

const LAYOUT_TYPES = [
  { value: "grid", label: "Grid Layout (4 cols, flexible)" },
  { value: "columns", label: "Column Layout (rows × columns)" },
  { value: "banner", label: "Full Banner" },
];

export default function SectionEditorModal({ open, onClose, onSave, initialData, existingSections = [] }) {
  // Check if hero_slider already exists (and we're not editing it)
  const heroSliderExists = existingSections?.some(
    (s) => s.type === "hero_slider" && (!initialData || s._id !== initialData._id)
  );

  const defaultValues = {
    type: "hero_slider",
    customType: "",
    layoutType: "grid",
    rows: 1,
    columns: 4,
    title: "",
    order: 0,
    active: true,
    device: "all",
    startDate: "",
    endDate: "",
    settings: {},
  };

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: initialData || defaultValues,
  });

  const selectedType = useWatch({ control, name: "type" });
  const selectedLayout = useWatch({ control, name: "layoutType" });

  useEffect(() => {
    if (!initialData) {
      reset(defaultValues);
      return;
    }

    const isKnown = KNOWN_SECTION_TYPES.includes(initialData.type);
    if (isKnown) {
      reset({ ...defaultValues, ...initialData, customType: "" });
    } else {
      reset({ ...defaultValues, ...initialData, type: "__custom__", customType: initialData.type });
    }
  }, [initialData, reset]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full p-6">
        <h2 className="text-lg font-semibold mb-4">
          {initialData ? "Edit Section" : "Add Section"}
        </h2>
        <form
          onSubmit={handleSubmit((values) => {
            const type = values.type === "__custom__" ? values.customType?.trim() ?? "" : values.type;
            onSave({
              ...values,
              type,
              active:
                values.active === true || values.active === "true" || values.active === 1,
              order: Number(values.order) || 0,
            });
          })}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-semibold mb-1">Type</label>
            <select
              {...register("type", { required: true })}
              className="input w-full"
            >
              {KNOWN_SECTION_TYPES.map((t) => (
                <option 
                  key={t} 
                  value={t}
                  disabled={t === "hero_slider" && heroSliderExists}
                >
                  {t.replace(/_/g, " ")} {t === "hero_slider" && heroSliderExists ? "(already exists)" : ""}
                </option>
              ))}
              <option value="__custom__">Other (custom)</option>
            </select>
            {errors.type && <p className="text-red-500 text-xs">Type is required</p>}
            {heroSliderExists && (
              <p className="text-blue-500 text-xs mt-1">
                ℹ️ Hero Slider section already exists and can only be created once
              </p>
            )}
          </div>

          {selectedType === "__custom__" ? (
            <div>
              <label className="block text-sm font-semibold mb-1">Custom type</label>
              <input
                type="text"
                className="input w-full"
                {...register("customType", { required: true })}
              />
              {errors.customType && (
                <p className="text-red-500 text-xs">Custom type is required</p>
              )}
            </div>
          ) : null}

          <div>
            <label className="block text-sm font-semibold mb-1">Layout Type</label>
            <select {...register("layoutType")} className="input w-full">
              {LAYOUT_TYPES.map((lt) => (
                <option key={lt.value} value={lt.value}>
                  {lt.label}
                </option>
              ))}
            </select>
          </div>

          {(selectedLayout === "columns" || selectedLayout === "grid") ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-1">Rows</label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  className="input w-full"
                  {...register("rows", { valueAsNumber: true })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Columns</label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  step={1}
                  className="input w-full"
                  {...register("columns", { valueAsNumber: true })}
                />
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1">Title</label>
              <input
                type="text"
                className="input w-full"
                {...register("title")}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Order</label>
              <input
                type="number"
                min={0}
                step={1}
                className="input w-full"
                {...register("order", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1">Device</label>
              <select {...register("device")} className="input w-full">
                <option value="all">All</option>
                <option value="mobile">Mobile</option>
                <option value="desktop">Desktop</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Active</label>
              <select {...register("active")} className="input w-full">
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1">Start Date</label>
              <input type="date" className="input w-full" {...register("startDate")} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">End Date</label>
              <input type="date" className="input w-full" {...register("endDate")} />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" className="btn-muted px-4 py-2" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary px-4 py-2">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
