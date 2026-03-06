import { X } from "lucide-react";

export default function CancelOrderModal({
  showCancelModal,
  setShowCancelModal,
  cancelReason,
  setCancelReason,
  handleCancelOrder,
}) {
  if (!showCancelModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-lg">
        {/* HEADER */}
        <div className="border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Cancel Order</h2>
          <button
            onClick={() => setShowCancelModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select reason for cancellation
            </label>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">Select reason</option>
              <option value="changed-mind">Changed my mind</option>
              <option value="found-elsewhere">Found elsewhere</option>
              <option value="not-needed">Not needed anymore</option>
              <option value="price-issue">Price issue</option>
              <option value="other">Other</option>
            </select>
          </div>

          {cancelReason === "other" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Please explain briefly
              </label>
              <textarea
                placeholder="Tell us why you want to cancel..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
                rows="4"
              />
            </div>
          )}

          <button
            onClick={handleCancelOrder}
            disabled={!cancelReason}
            className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel Order
          </button>

          <button
            onClick={() => setShowCancelModal(false)}
            className="w-full bg-gray-100 text-gray-900 font-semibold py-3 rounded-lg hover:bg-gray-200 transition"
          >
            Keep Order
          </button>
        </div>
      </div>
    </div>
  );
}
