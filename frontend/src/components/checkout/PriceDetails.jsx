"use client";

export default function PriceDetails({
  itemCount,
  totalMrp,
  discount,
  platformFee,
  codFee = 0,
  onContinue,
  showContinue = true,
}) {
  const totalAmount = totalMrp - discount + platformFee + codFee;

  return (
    <div className="p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
      <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-4">
        Price Details ({itemCount} Items)
      </p>

      <div className="space-y-3 text-[14px]">
        <div className="flex justify-between">
          <span className="text-gray-600">Total MRP</span>
          <span>₹{totalMrp}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Discount on MRP</span>
          <span className="text-green-600">-₹{discount}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">
            Platform Fee{" "}
            <span className="text-pink-500 font-bold cursor-pointer">
              Know More
            </span>
          </span>
          <span>₹{platformFee}</span>
        </div>

        {codFee > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">
              Cash/Pay on Delivery Fee{" "}
              <span className="text-pink-500 font-bold cursor-pointer">
                Know More
              </span>
            </span>
            <span>₹{codFee}</span>
          </div>
        )}

        <div className="border-t pt-3 mt-4 flex justify-between font-bold text-lg">
          <span>Total Amount</span>
          <span>₹{totalAmount}</span>
        </div>
      </div>

      {showContinue && onContinue && (
        <button
          onClick={onContinue}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white h-12 uppercase font-bold tracking-widest mt-6 rounded"
        >
          Continue
        </button>
      )}
    </div>
  );
}