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

  // ✅ FETCH WISHLIST
  useEffect(() => {
    if (!user) {
      setWishlist([]);
      return;
    }

    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/api/wishlist`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });


        setWishlist(res.data.wishlist || []);
      } catch (err) {
        console.error("Wishlist fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  // ✅ TOGGLE (ADD / REMOVE)
  const toggleWishlist = async (productId) => {
    if (!user) return alert("Login first");

    await axios.post(
      `${API_BASE}/api/wishlist/toggle`,
      { productId },
      { headers: { Authorization: `Bearer ${user.token}` } }
    );

    // 🔁 REFRESH wishlist after toggle
    const res = await axios.get(`${API_BASE}/api/wishlist`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });

    setWishlist(res.data.wishlist || []);
  };

  // ✅ REMOVE DIRECT
  const removeFromWishlist = async (productId) => {
    if (!user) return;

    await axios.delete(
      `${API_BASE}/api/wishlist/remove/${productId}`,
      { headers: { Authorization: `Bearer ${user.token}` } }
    );

    setWishlist((prev) => prev.filter((p) => p._id !== productId));
  };

  // ❌ CLEAR (optional – you don’t have backend yet)
  const clearWishlist = () => {
    setWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        loading,
        toggleWishlist,
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
