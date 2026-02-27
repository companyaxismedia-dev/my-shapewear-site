"use client";

export default function PriceDetails({
  itemCount = 0,
  totalMrp = 0,
  discount = 0,
  platformFee = 0,
  codFee = 0,
  showContinue = true,
  onContinue,
  loading = false,
  highlightContinue = false,
  hasSelectedAddress = false, // ⭐ IMPORTANT FIX
}) {
  // SAFE NUMBERS
  const safeMrp = Number(totalMrp || 0);
  const safeDiscount = Number(discount || 0);
  const safePlatform = Number(platformFee || 0);
  const safeCod = Number(codFee || 0);

  // TOTAL CALCULATION
  const totalAmount =
    safeMrp - safeDiscount + safePlatform + safeCod;

  // FORMAT PRICE (Myntra style)
  const formatPrice = (value) =>
    new Intl.NumberFormat("en-IN").format(value);

  return (
    <div className="pt-2 bg-white">

      {/* HEADER */}
      <p className="text-[12px] font-bold text-[#535766] uppercase mb-4">
        Price Details ({itemCount}{" "}
        {itemCount === 1 ? "Item" : "Items"})
      </p>

      {/* ROWS */}
      <div className="space-y-3 text-[13px]">

        <div className="flex justify-between">
          <span className="text-[#282c3f]">Total MRP</span>
          <span>₹{formatPrice(safeMrp)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-[#282c3f]">Discount on MRP</span>
          <span className="text-[#03a685]">
            - ₹{formatPrice(safeDiscount)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-[#282c3f]">
            Platform Fee{" "}
            <span className="text-[#ff3f6c] font-semibold cursor-pointer">
              Know More
            </span>
          </span>
          <span>₹{formatPrice(safePlatform)}</span>
        </div>

        {safeCod > 0 && (
          <div className="flex justify-between">
            <span className="text-[#282c3f]">COD Fee</span>
            <span>₹{formatPrice(safeCod)}</span>
          </div>
        )}

        {/* TOTAL */}
        <div className="border-t border-[#eaeaec] pt-4 mt-4 flex justify-between font-bold text-[18px]">
          <span>Total Amount</span>
          <span>₹{formatPrice(totalAmount)}</span>
        </div>
      </div>

      {/* CONTINUE BUTTON */}
      {showContinue && (
        <>
          <button
            onClick={onContinue}
            disabled={loading || !hasSelectedAddress}
            className={`w-full mt-4 h-12 text-white font-bold uppercase tracking-wider transition-all duration-300
              ${
                loading || !hasSelectedAddress
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#ff3f6c] hover:bg-[#ff527b]"
              }
              ${
                highlightContinue
                  ? "scale-[1.03] shadow-[0_0_0_6px_rgba(255,63,108,0.15)]"
                  : "scale-100"
              }
            `}
          >
            {loading ? "Processing..." : "Continue"}
          </button>

          {/* ERROR MESSAGE */}
          {!hasSelectedAddress && (
            <p className="text-[#ff3f6c] text-sm mt-3 text-center">
              Please choose a delivery address to continue.
            </p>
          )}
        </>
      )}
    </div>
  );
}