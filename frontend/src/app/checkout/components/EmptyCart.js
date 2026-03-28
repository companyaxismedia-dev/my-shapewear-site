export default function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <img
        src="/empty-bag.png"
        alt="Empty"
        className="w-40 mb-6"
      />
      <h2 className="mb-2 text-2xl font-semibold text-[#4a2e35]">
        Hey, it feels so light!
      </h2>
      <p className="mb-6 text-[#8d727b]">
        There is nothing in your bag. Let's add some items.
      </p>
      <button className="rounded-full border border-[#c56f7f] px-6 py-2 text-sm font-semibold text-[#c56f7f]">
        ADD ITEMS FROM WISHLIST
      </button>
    </div>
  );
}
