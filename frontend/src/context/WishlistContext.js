"use client";
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE =
    typeof window !== "undefined" &&
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://my-shapewear-site.onrender.com";

  // 🔹 Fetch wishlist
  useEffect(() => {
    if (!user) {
      setWishlist([]);
      return;
    }

    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `${API_BASE}/api/wishlist`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        setWishlist(data);
      } catch (err) {
        console.error("Wishlist fetch error");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  // 🔹 ADD ITEM (HARD ADD)
  const addToWishlist = async (productId) => {
    if (!user) return;

    const { data } = await axios.post(
      `${API_BASE}/api/wishlist`,
      { productId },
      { headers: { Authorization: `Bearer ${user.token}` } }
    );

    setWishlist(data);
  };

  // 🔹 REMOVE ITEM (HARD DELETE)
  const removeFromWishlist = async (productId) => {
    if (!user) return;

    const { data } = await axios.delete(
      `${API_BASE}/api/wishlist/${productId}`,
      { headers: { Authorization: `Bearer ${user.token}` } }
    );

    setWishlist(data);
  };

  // 🔹 CLEAR ALL
  const clearWishlist = async () => {
    if (!user) return;

    await axios.delete(`${API_BASE}/api/wishlist`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });

    setWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        loading,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);



// "use client";
// import { createContext, useContext, useState } from "react";
// import { useAuth } from "./AuthContext";

// const WishlistContext = createContext();

// export function WishlistProvider({ children }) {
//   const { user } = useAuth();

//   // 🔒 FRONTEND ONLY MODE
//   const [wishlist, setWishlist] = useState([]);

//   /* ================= ADD ================= */
//   const addToWishlist = (product) => {
//     if (!user) {
//       alert("Please login first");
//       return;
//     }

//     setWishlist((prev) => {
//       const exists = prev.some((p) => p.id === product.id);
//       return exists ? prev : [...prev, product];
//     });
//   };

//   /* ================= REMOVE ================= */
//   const removeFromWishlist = (productId) => {
//     setWishlist((prev) => prev.filter((p) => p.id !== productId));
//   };

//   /* ================= CLEAR ================= */
//   const clearWishlist = () => {
//     setWishlist([]);
//   };

//   return (
//     <WishlistContext.Provider
//       value={{
//         wishlist,
//         wishlistCount: wishlist.length,
//         addToWishlist,
//         removeFromWishlist,
//         clearWishlist,
//       }}
//     >
//       {children}
//     </WishlistContext.Provider>
//   );
// }

// export const useWishlist = () => useContext(WishlistContext);
