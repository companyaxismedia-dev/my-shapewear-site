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
import { Trash2, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function WishlistPage() {
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

  return (
    <div className="bg-white min-h-screen h-full">
      <Navbar />

      {!loading && wishlist.length === 0 && (
        <>

          <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center text-center">
            <Heart size={90} className="text-pink-500 mb-6" />
            <h1 className="text-3xl font-semibold text-gray-900">
              Your Save for later list is empty!
            </h1>
            <p className="text-gray-500 mt-2">
              Check out the wide range of products we offer
            </p>

            <div className="mt-6 bg-gray-100 px-6 py-3 rounded text-sm text-gray-600">
              Bras &nbsp;|&nbsp; Panties &nbsp;|&nbsp; Nightwear &nbsp;|&nbsp;
              <span className="text-pink-600 font-semibold">Offers</span>
            </div>
          </div>

          <Footer />
        </>
      )}

      {!loading && wishlist.length > 0 && (
        <>

          <div className="max-w-7xl mx-auto px-4 py-10">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-xl font-semibold text-pink-600 flex items-center gap-2">
                ❤️ YOUR WISHLIST ITEMS [{wishlist.length}]
              </h1>

              <button
                onClick={clearWishlist}
                className="border border-gray-300 px-5 py-2 rounded hover:bg-red-50 hover:border-red-400 hover:text-red-500 transition text-sm"
              >
                Delete All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {wishlist.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-xl overflow-hidden bg-white hover:shadow-xl transition group"
                >
                  <div className="relative">
                    <Image
                      src={item.img || item.image}
                      alt={item.name}
                      width={400}
                      height={550}
                      className="w-full object-cover"
                    />

                    {/* Remove */}
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-3 right-3 bg-white p-2 rounded-full shadow hover:bg-red-50 transition"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>

                    {/* Offer */}
                    {item.offer && (
                      <span className="absolute bottom-2 right-2 bg-pink-600 text-white text-[10px] px-2 py-1 font-semibold">
                        {item.offer}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-sm text-gray-800 line-clamp-2 mb-2">
                      {item.name}
                    </h3>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-bold text-gray-900">
                        ₹{item.price}
                      </span>
                      {item.oldPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{item.oldPrice}
                        </span>
                      )}
                    </div>

                    <button className="w-full bg-pink-600 text-white text-xs py-2 rounded hover:bg-pink-700 transition">
                      ADD TO CART
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Footer />
        </>
      )}
    </div>
  );
}
