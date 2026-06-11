"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { FiX, FiUploadCloud } from "react-icons/fi";

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
    control,
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
  
  const desktopInput = useRef(null);
  const mobileInput = useRef(null);

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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Settings Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Section</label>
          <select
            className="input w-full bg-white"
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
        
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Banner Link (URL)</label>
          <input 
            type="text" 
            placeholder="e.g. /collections/summer-sale" 
            className="input w-full bg-white" 
            {...register("link")} 
          />
        </div>

        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-sm font-semibold text-gray-700">Alt Text</label>
          <input 
            type="text" 
            placeholder="Description of the banner for SEO"
            className={`input w-full bg-white ${errors.altText ? "border-red-500 focus:ring-red-500" : ""}`} 
            {...register("altText", { required: "Alt text is required" })} 
          />
          {errors.altText && <span className="text-red-500 text-xs mt-1">{errors.altText.message}</span>}
        </div>
      </div>

      {/* Image Uploads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Desktop Image */}
        <Controller
  name="desktop"
  control={control}
  rules={{
    required: !initialData ? "Desktop image is required" : false,
  }}
  render={({ field }) => (
    <>
      <div className="relative group">
        {desktopPreview ? (
          <div className="relative w-full aspect-video bg-gray-100 rounded-xl border-2 border-gray-200 overflow-hidden">
            <img
              src={desktopPreview}
              alt="Desktop Preview"
              className="w-full h-full object-cover"
            />

            <button
              type="button"
              className="absolute top-2 right-2 bg-white rounded-full p-2"
              onClick={() => {
                setDesktopPreview(null);
                field.onChange(null);

                if (desktopInput.current) {
                  desktopInput.current.value = "";
                }
              }}
            >
              <FiX size={18} />
            </button>
          </div>
        ) : (
          <div
            className={`w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer
              ${
                errors.desktop
                  ? "border-red-400 bg-red-50"
                  : "border-gray-300"
              }`}
            onClick={() => desktopInput.current?.click()}
          >
            <FiUploadCloud size={32} />
            <span>Click to upload</span>
          </div>
        )}

        <input
          ref={desktopInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (!file) return;

            field.onChange(file);

            const preview = URL.createObjectURL(file);
            setDesktopPreview(preview);
          }}
        />
      </div>

      {errors.desktop && (
        <p className="text-red-500 text-xs mt-1">
          {errors.desktop.message}
        </p>
      )}
    </>
  )}
/>

        {/* Mobile Image */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700 flex justify-between">
            <span>Mobile Banner</span>
            <span className="text-xs text-gray-400 font-normal">Ratio: 4:5 (Optional)</span>
          </label>
          
          <div className="relative group">
            {mobilePreview ? (
              <div className="relative w-full aspect-[4/5] max-w-[240px] mx-auto bg-gray-100 rounded-xl border-2 border-gray-200 overflow-hidden flex items-center justify-center">
                <img
                  src={mobilePreview}
                  alt="Mobile Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    className="bg-white text-red-600 rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
                    onClick={() => {
                      setMobilePreview(null);
                      setValue("mobile", null);
                      if (mobileInput.current) mobileInput.current.value = "";
                    }}
                    title="Remove Image"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div 
                className="w-full aspect-[4/5] max-w-[240px] mx-auto rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-gray-50"
                onClick={() => mobileInput.current?.click()}
              >
                <FiUploadCloud size={32} className="text-gray-400" />
                <span className="text-sm mt-2 font-medium text-gray-600">Click to upload</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              {...register("mobile")}
              ref={(e) => {
                register("mobile").ref(e);
                mobileInput.current = e;
              }}
              onChange={(e) => onFileChange(e, "mobile")}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2 mt-2 border-t border-gray-100">
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" {...register("active")} className="sr-only peer" />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
          <span className="ml-3 text-sm font-medium text-gray-900">Active Status</span>
        </label>
      </div>

      <button 
        type="submit" 
        className="btn-primary w-full py-3 mt-2 text-base shadow-lg hover:shadow-xl transition-shadow" 
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Saving Banner...
          </span>
        ) : (
          "Save Banner"
        )}
      </button>
    </form>
  );
}

