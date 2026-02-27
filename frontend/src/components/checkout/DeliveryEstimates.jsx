"use client";

export default function DeliveryEstimates({ cartItems = [] }) {
  if (!cartItems.length) return null;

  const getDeliveryDate = (index) => {
    const d = new Date();
    d.setDate(d.getDate() + 2 + index);
    return d.toDateString().slice(4);
  };

  return (
    <div className="mb-6">

      {/* TITLE */}
      <p className="text-[14px] font-bold text-[#535766] uppercase mb-4">
        Delivery Estimates
      </p>

      {/* PRODUCTS */}
      <div>
        {cartItems.map((item, i) => (
          <div
            key={i}
            className="flex gap-3 py-3 border-b border-[#eaeaec] last:border-0"
          >
            <img
              src={
                item?.product?.thumbnail ||
                item?.product?.image ||
                item?.product?.images?.[0] ||
                item?.productImage ||
                item?.image ||
                "/placeholder.png"
              }
              alt="product"
              className="w-12 h-16 object-cover"
            />

            <p className="text-[14px] text-[#282c3f] leading-5">
              Estimated delivery by{" "}
              <span className="font-bold">
                {getDeliveryDate(i)}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}