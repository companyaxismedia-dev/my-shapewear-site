"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user, logout } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE =
    typeof window !== "undefined" &&
      window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://my-shapewear-site.onrender.com";

  /* ================= FETCH WISHLIST ================= */

  useEffect(() => {
    if (!user || !user.token) {
      setWishlist([]);
      return;
    }

    const fetchWishlist = async () => {
      try {
        setLoading(true);

        const res = await axios.get(`${API_BASE}/api/wishlist`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        setWishlist(res.data.wishlist || []);
      } catch (err) {
        console.error("Wishlist fetch error:", err?.response?.data || err);

        // 🔴 If token expired → auto logout
        if (err.response?.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  /* ================= TOGGLE WISHLIST ================= */

  const toggleWishlist = async (product) => {
    if (!user || !user.token) {
      alert("Please login first");
      return;
    }

    try {
      await axios.post(
        `${API_BASE}/api/wishlist/toggle`,
        { productId: product._id },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setWishlist((prev) => {
        const exists = prev.find((p) => p._id === product._id);

        if (exists) {
          return prev.filter((p) => p._id !== product._id);
        }
        return [...prev, product];
      });
    } catch (err) {
      console.error("Toggle wishlist error:", err?.response?.data || err);

      if (err.response?.status === 401) {
        logout();
      }
    }
  };

  /* ================= REMOVE ================= */

  const removeFromWishlist = async (productId) => {
    if (!user || !user.token) return;

    try {
      await axios.delete(
        `${API_BASE}/api/wishlist/remove/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setWishlist((prev) =>
        prev.filter((p) => p._id !== productId)
      );
    } catch (err) {
      console.error("Remove wishlist error:", err?.response?.data || err);

      if (err.response?.status === 401) {
        logout();
      }
    }
  };

  /* ================= CLEAR ================= */

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
