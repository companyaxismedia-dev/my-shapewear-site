"use client";

export default function AddressList({
  addresses = [],
  selectedAddressId,
  onSelect,
  onEdit,
  onRemove,
}) {
  return (
    <div className="space-y-4">
      {addresses.map((addr) => {
        const id = addr._id || addr.id;
        const selected = selectedAddressId === id;

        return (
          <div
            key={id}
            onClick={() => onSelect(id)}
            className={`border bg-white cursor-pointer transition-all rounded-sm ${
              selected
                ? "border-[#ff3f6c]"
                : "border-[#eaeaec] hover:border-[#d4d5d9]"
            }`}
          >
            <div className="p-5">
              <div className="flex items-start gap-3">

                {/* RADIO */}
                <div className="mt-1">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selected
                        ? "border-[#ff3f6c]"
                        : "border-[#94969f]"
                    }`}
                  >
                    {selected && (
                      <div className="w-2 h-2 rounded-full bg-[#ff3f6c]" />
                    )}
                  </div>
                </div>

                {/* CONTENT */}
                <div className="flex-1">

                  {/* NAME + TAG */}
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-[16px] text-[#282c3f]">
                      {addr.fullName || addr.name}
                    </h3>

                    <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-[2px] rounded-[10px] uppercase">
                      {addr.type || "HOME"}
                    </span>
                  </div>

                  {/* ADDRESS */}
                  <p className="text-[14px] text-[#535766] leading-6">
                    {addr.addressLine || addr.address},{" "}
                    {addr.locality}, {addr.city}, {addr.state} -{" "}
                    {addr.pincode}
                  </p>

                  {/* MOBILE */}
                  <p className="mt-2 text-[14px] font-semibold text-[#282c3f]">
                    Mobile: {addr.phone || addr.mobile}
                  </p>

                  {/* COD */}
                  <p className="mt-3 text-[14px] text-[#535766]">
                    • Cash on Delivery available
                  </p>

                  {/* BUTTONS */}
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(id);
                      }}
                      className="h-10 px-6 border border-[#d4d5d9] text-[12px] font-bold uppercase tracking-wide hover:border-[#282c3f] transition"
                    >
                      Remove
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(addr);
                      }}
                      className="h-10 px-6 border border-[#d4d5d9] text-[12px] font-bold uppercase tracking-wide hover:border-[#282c3f] transition"
                    >
                      Edit
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}