// "use client";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import axios from "axios";
// import { useAuth } from "@/context/AuthContext";

// export default function WishlistPage() {
//   const { user } = useAuth();
//   const router = useRouter();
//   const [wishlist, setWishlist] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!user) {
//       router.replace("/"); // or open login modal if you prefer
//       return;
//     }

//     const fetchWishlist = async () => {
//       try {
//         const res = await axios.get(
//           "https://my-shapewear-site.onrender.com/api/wishlist" || "/wishlist",
//           {
//             headers: {
//               Authorization: `Bearer ${user.token}`,
//             },
//           }
//         );
//         setWishlist(res.data);
//       } catch (err) {
//         console.error("Wishlist fetch failed", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchWishlist();
//   }, [user, router]);

//   if (!user) return null;
//   if (loading) return <p className="p-6">Loading wishlist...</p>;

//   return (
//     <div className="max-w-6xl mx-auto p-6">
//       <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>

//       {wishlist.length === 0 ? (
//         <p>Your wishlist is empty.</p>
//       ) : (
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//           {wishlist.map((item) => (
//             <div
//               key={item._id}
//               className="border rounded-lg p-4 hover:shadow"
//             >
//               <img
//                 src={item.image}
//                 alt={item.name}
//                 className="w-full h-40 object-cover rounded"
//               />
//               <h3 className="mt-2 font-semibold">{item.name}</h3>
//               <p className="text-sm text-gray-600">₹{item.price}</p>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }


"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import Image from "next/image";
import { Trash2 } from "lucide-react";

export default function Wishlist() {
  const { user } = useAuth();
  const router = useRouter();
  const {
    wishlist,
    loading,
    removeFromWishlist,
    clearWishlist,
  } = useWishlist();

  if (!user) {
    router.push("/");
    return null;
  }

  if (!loading && wishlist.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <Image
          src="/wishlist-empty.svg"
          alt="Empty Wishlist"
          width={120}
          height={120}
        />
        <h2 className="text-2xl font-bold mt-6">
          Your Save for later list is empty!
        </h2>
        <p className="text-gray-500 mt-2">
          Check out the wide range of products we offer
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-pink-600 flex items-center gap-2">
          ❤️ YOUR WISHLIST ITEMS [{wishlist.length}]
        </h1>

        <button
          onClick={clearWishlist}
          className="border px-4 py-2 rounded hover:bg-red-50 text-sm transition"
        >
          Delete All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map((item) => (
          <div
            key={item._id}
            className="border rounded-xl p-3 hover:shadow-lg transition group"
          >
            <div className="relative">
              <Image
                src={item.image}
                alt={item.name}
                width={300}
                height={400}
                className="rounded-lg"
              />
              <button
                onClick={() => removeFromWishlist(item._id)}
                className="absolute top-2 right-2 bg-white p-1 rounded-full shadow hover:bg-red-50"
              >
                <Trash2 size={16} className="text-red-500" />
              </button>
            </div>

            <h3 className="mt-3 text-sm font-medium line-clamp-2">
              {item.name}
            </h3>

            <div className="flex justify-between items-center mt-2">
              <span className="font-bold text-gray-800">
                ₹{item.price}
              </span>
              <button className="bg-pink-600 text-white text-xs px-3 py-2 rounded hover:bg-pink-700 transition">
                ADD TO CART
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
