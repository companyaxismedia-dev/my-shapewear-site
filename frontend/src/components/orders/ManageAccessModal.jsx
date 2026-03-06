import { X } from "lucide-react";

export default function ManageAccessModal({ showAccess, setShowAccess, order }) {
  if (!showAccess) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-lg">
        {/* HEADER */}
        <div className="border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Order details shared with
          </h2>
          <button
            onClick={() => setShowAccess(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-gray-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {order?.recipientName || "Customer"}
              </p>
              <p className="text-sm text-gray-600">{order?.recipientPhone}</p>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Only the recipient of the order can track and access order details.
          </p>
        </div>
      </div>
    </div>
  );
}
