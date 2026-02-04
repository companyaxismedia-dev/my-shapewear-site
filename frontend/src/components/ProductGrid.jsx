import ProductCard from "./ProductCard";

const products = [
  // --- WOMEN HIP PAD PANTY (BLACK) ---
  {
    id: 1,
    name: "Women Hip Pad Panty – Black",
    price: 1299,
    image: "/image/Women-HIP-PAD-PANTY/Women-HIP-PAD-PANTY-BLACK-1.webp",
  },
  {
    id: 2,
    name: "Women Hip Pad Panty – Black",
    price: 1299,
    image: "/image/Women-HIP-PAD-PANTY/Women-HIP-PAD-PANTY-BLACK-2.webp",
  },
  {
    id: 3,
    name: "Women Hip Pad Panty – Black",
    price: 1299,
    image: "/image/Women-HIP-PAD-PANTY/Women-HIP-PAD-PANTY-BLACK-3.webp",
  },

  // --- SKIN COLOR ---
  {
    id: 4,
    name: "Women Hip Pad Panty – Skin",
    price: 1299,
    image: "/image/Women-HIP-PAD-PANTY/Women-HIP-PAD-PANTY-SKIN-1.webp",
  },
  {
    id: 5,
    name: "Women Hip Pad Panty – Skin",
    price: 1299,
    image: "/image/Women-HIP-PAD-PANTY/Women-HIP-PAD-PANTY-SKIN-2.webp",
  },
  {
    id: 6,
    name: "Women Hip Pad Panty – Skin",
    price: 1299,
    image: "/image/Women-HIP-PAD-PANTY/Women-HIP-PAD-PANTY-SKIN-3.webp",
  },
  {
    id: 7,
    name: "Women Hip Pad Panty – Skin",
    price: 1299,
    image: "/image/Women-HIP-PAD-PANTY/Women-HIP-PAD-PANTY-SKIN-4.webp",
  },

  // --- SEAMLESS BOOTY PADS ---
  ...Array.from({ length: 9 }, (_, i) => ({
    id: 20 + i,
    name: "Seamless Booty Pads Panties",
    price: 1399,
    image: `/image/Women-HIP-PAD-PANTY/Seamless-Booty-Pads-Butt-Enhancer-Panties-${i + 1}.webp`,
  })),

  // --- MANIFIQUE PADDED UNDERWEAR ---
  ...Array.from({ length: 6 }, (_, i) => ({
    id: 40 + i,
    name: "MANIFIQUE Padded Underwear",
    price: 1799,
    image: `/image/Women-HIP-PAD-PANTY/MANIFIQUE-Padded-Underwear-${i + 1}.webp`,
  })),
];

export default function ProductGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
      <h2 className="text-2xl sm:text-3xl font-black uppercase italic mb-10 tracking-tight text-[#041f41]">
        Featured Products
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
