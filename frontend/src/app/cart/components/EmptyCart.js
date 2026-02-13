export default function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <img
        src="/empty-bag.png"
        alt="Empty"
        className="w-40 mb-6"
      />
      <h2 className="text-2xl font-semibold mb-2">
        Hey, it feels so light!
      </h2>
      <p className="text-gray-500 mb-6">
        There is nothing in your bag. Let's add some items.
      </p>
      <button className="border border-pink-600 text-pink-600 px-6 py-2 rounded hover:bg-pink-50">
        ADD ITEMS FROM WISHLIST
      </button>
    </div>
  );
}
