"use client";

export default function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Delete Products?",
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">
      <div className="bg-white p-6 rounded-xl w-[400px]">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Are you sure? This action cannot be undone.
        </p>

        <div className="flex justify-end gap-2 mt-4">
          <button className="btn-muted" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-destructive" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}