"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function BannerForm({ onSubmit, initialData, loading, sections = [] }) {
  const defaultValues = {
    altText: "",
    link: "",
    active: true,
    sectionId: sections?.[0]?._id || "",
    desktop: null,
    mobile: null,
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: initialData ? {
      altText: initialData.altText || "",
      link: initialData.link || "",
      active: initialData.active ?? true,
      sectionId: initialData.sectionId || sections?.[0]?._id || "",
      desktop: null,
      mobile: null,
    } : defaultValues,
  });

  const activeValue = watch("active");

  useEffect(() => {
    if (initialData) {
      reset({
        altText: initialData.altText || "",
        link: initialData.link || "",
        active: initialData.active ?? true,
        sectionId: initialData.sectionId || sections?.[0]?._id || "",
        desktop: null,
        mobile: null,
      });
      setCurrentSection(initialData.sectionId || sections?.[0]?._id || "");
    } else {
      reset(defaultValues);
      setCurrentSection(sections?.[0]?._id || "");
    }
  }, [initialData, sections, reset]);

  const [desktopPreview, setDesktopPreview] = useState(initialData?.desktopUrl || null);
  const [mobilePreview, setMobilePreview] = useState(initialData?.mobileUrl || null);
  const [currentSection, setCurrentSection] = useState(initialData?.sectionId || sections?.[0]?._id || "");
  const desktopInput = useRef();
  const mobileInput = useRef();

  const onFileChange = (e, type) => {
    const file = e.target.files[0];
    setValue(type, file);
    if (file) {
      const url = URL.createObjectURL(file);
      if (type === "desktop") setDesktopPreview(url);
      if (type === "mobile") setMobilePreview(url);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="font-semibold">Section</label>
          <select
            className="input w-full"
            {...register("sectionId")}
            value={currentSection}
            onChange={(e) => {
              setCurrentSection(e.target.value);
              setValue("sectionId", e.target.value);
            }}
          >
            {sections.map((section) => (
              <option key={section._id} value={section._id}>
                {section.title || section.type || section._id}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-3">
          <div>
            <label className="font-semibold">Link</label>
            <input type="text" className="input" {...register("link")} />
          </div>
          <div className="flex flex-col justify-end">
            <label className="font-semibold">Active</label>
            <input type="checkbox" {...register("active")} className="mt-2" />
          </div>
        </div>
      </div>

      <div>
        <label className="font-semibold">Desktop Banner Image *</label>
        <input
          type="file"
          accept="image/*"
          {...register("desktop", { required: !initialData })}
          ref={desktopInput}
          onChange={(e) => onFileChange(e, "desktop")}
        />
        {desktopPreview && (
          <div className="relative w-full max-w-lg mt-2">
            <img
              src={desktopPreview}
              alt="Desktop Preview"
              className="w-full max-h-64 object-contain rounded border"
            />
            <button
              type="button"
              className="absolute top-2 right-2 bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-red-500 hover:text-white transition"
              onClick={() => {
                setDesktopPreview(null);
                setValue("desktop", null);
                if (desktopInput.current) desktopInput.current.value = "";
              }}
              aria-label="Remove desktop image"
            >
              ✕
            </button>
          </div>
        )}
        {errors.desktop && <span className="text-red-500 text-xs">Desktop image is required</span>}
      </div>

      <div>
        <label className="font-semibold">Mobile Banner Image (optional)</label>
        <input
          type="file"
          accept="image/*"
          {...register("mobile")}
          ref={mobileInput}
          onChange={(e) => onFileChange(e, "mobile")}
        />
        {mobilePreview && (
          <div className="relative w-full max-w-xs mt-2">
            <img
              src={mobilePreview}
              alt="Mobile Preview"
              className="w-full max-h-64 object-contain rounded border"
            />
            <button
              type="button"
              className="absolute top-2 right-2 bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-red-500 hover:text-white transition"
              onClick={() => {
                setMobilePreview(null);
                setValue("mobile", null);
                if (mobileInput.current) mobileInput.current.value = "";
              }}
              aria-label="Remove mobile image"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <div>
        <label className="font-semibold">Alt Text</label>
        <input type="text" className="input" {...register("altText", { required: "Alt text is required" })} />
        {errors.altText && <span className="text-red-500 text-xs">{errors.altText.message}</span>}
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Saving..." : "Save"}
      </button>
    </form>
  );
}

