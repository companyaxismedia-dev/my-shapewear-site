import Image from "next/image";

export default function ProductCard({ product }) {
  return (
    <div className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">

      {/* IMAGE */}
      <div className="relative aspect-[3/4] bg-gray-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badge */}
        <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded shadow">
          Best Seller
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-3 sm:p-4 space-y-1 text-center">

        <h3 className="text-[12px] sm:text-sm font-bold text-gray-800 uppercase leading-snug line-clamp-2">
          {product.name}
        </h3>

        {/* PRICE */}
        <div className="flex justify-center items-center gap-2">
          <span className="font-black text-sm sm:text-base">
            ₹{product.price}
          </span>
          <span className="text-gray-400 line-through text-[10px] sm:text-xs">
            ₹{product.price + 500}
          </span>
        </div>

        {/* QUICK VIEW */}
        <button
          className="
            mt-2 w-full
            text-[10px] sm:text-[11px]
            font-black uppercase tracking-widest
            border border-gray-300 rounded-lg
            py-2
            text-gray-700
            transition-all
            group-hover:bg-black
            group-hover:text-white
            group-hover:border-black
          "
        >
          Quick View
        </button>
      </div>
    </div>
  );
}
