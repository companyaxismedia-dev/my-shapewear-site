"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";

export default function BlockEditorModal({ open, onClose, onSave, initialData }) {
  const defaultValues = useMemo(
    () => ({
      link: initialData?.data?.link || "",
      active: initialData?.data?.active ?? true,
      data: initialData?.data || {},
    }),
    [initialData]
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  const [mode, setMode] = useState("form");
  const [desktopPreview, setDesktopPreview] = useState(initialData?.data?.desktopUrl || null);
  const [mobilePreview, setMobilePreview] = useState(initialData?.data?.mobileUrl || null);
  const desktopInput = useRef();
  const mobileInput = useRef();

  const watchedData = watch("data");

  useEffect(() => {
    reset(defaultValues);
    setDesktopPreview(initialData?.data?.desktopUrl || null);
    setMobilePreview(initialData?.data?.mobileUrl || null);

    if (initialData) {
      setValue(
        "data",
        JSON.stringify(initialData.data || {}, null, 2),
        { shouldValidate: false, shouldDirty: false }
      );
    }
  }, [initialData, defaultValues, reset, setValue]);

  if (!open) return null;

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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full p-6">
        <h2 className="text-lg font-semibold mb-4">
          {initialData ? "Edit Block" : "Add Block"}
        </h2>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            className={`px-3 py-2 rounded ${mode === "form" ? "bg-pink-500 text-white" : "bg-gray-100"}`}
            onClick={() => setMode("form")}
          >
            Form
          </button>
          <button
            type="button"
            className={`px-3 py-2 rounded ${mode === "json" ? "bg-pink-500 text-white" : "bg-gray-100"}`}
            onClick={() => setMode("json")}
          >
            JSON
          </button>
        </div>

        <form
          onSubmit={handleSubmit((values) => {
            if (mode === "json") {
              const parsed = typeof values.data === "string" ? JSON.parse(values.data) : values.data;
              onSave({ ...initialData, data: parsed });
              return;
            }

            // FORM MODE: Get files directly from input refs (not from react-hook-form)
            const formData = new FormData();
            
            // Build the data object with link and active
            const blockDataObj = {
              link: values.link || "",
              active: values.active ? true : false,
            };
            
            formData.append("data", JSON.stringify(blockDataObj));
            
            // Get files directly from DOM refs (react-hook-form doesn't handle files well)
            if (desktopInput.current?.files?.[0]) {
              const desktopFile = desktopInput.current.files[0];
              formData.append("desktop", desktopFile);
              console.log('📸 Desktop file selected:', desktopFile.name, desktopFile.size, 'bytes');
            }
            if (mobileInput.current?.files?.[0]) {
              const mobileFile = mobileInput.current.files[0];
              formData.append("mobile", mobileFile);
              console.log('📸 Mobile file selected:', mobileFile.name, mobileFile.size, 'bytes');
            }
            
            if (initialData?._id) formData.append("_id", initialData._id);

            console.log('📤 Submitting FormData with files...');
            onSave(formData);
          })}
          className="space-y-4"
        >
          {mode === "form" ? (
            <>
              <div>
                <label className="block text-sm font-semibold mb-1">Link</label>
                <input
                  type="text"
                  className="input w-full"
                  {...register("link")}
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  {...register("active")}
                />
                <label htmlFor="active" className="text-sm">
                  Active
                </label>
              </div>

              <div>
                <label className="font-semibold">Desktop Image {!initialData && "*"}</label>
                <input
                  type="file"
                  accept="image/*"
                  {...register("desktop", { 
                    required: !initialData ? "Desktop image is required" : false 
                  })}
                  ref={desktopInput}
                  onChange={(e) => onFileChange(e, "desktop")}
                />
                {errors.desktop && <p className="text-red-500 text-xs mt-1">{errors.desktop.message}</p>}
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
              </div>

              <div>
                <label className="font-semibold">Mobile Image (optional)</label>
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
            </>
          ) : (
            <div>
              <label className="block text-sm font-semibold mb-1">Block Data (JSON)</label>
              <textarea
                {...register("data", {
                  required: "Data is required",
                  validate: (value) => {
                    try {
                      JSON.parse(value);
                      return true;
                    } catch (err) {
                      return "Invalid JSON";
                    }
                  },
                })}
                className="input w-full h-40 font-mono text-xs"
                value={watchedData}
                onChange={(e) => setValue("data", e.target.value)}
              />
              {errors.data && <p className="text-red-500 text-xs">{errors.data.message}</p>}
            </div>
          )}

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
