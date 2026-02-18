"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

const API_BASE =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000"
    : "https://my-shapewear-site.onrender.com";

/* ================= GET TOKEN SAFE ================= */
const getToken = () => {
  if (typeof window === "undefined") return null;

  const user = localStorage.getItem("user");
  if (!user) return null;

  try {
    const parsed = JSON.parse(user);
    return parsed?.token || null;
  } catch {
    return null;
  }
};

export const CartProvider = ({ children }) => {
  const { user, logout } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD CART ================= */

  useEffect(() => {
    if (user) {
      fetchCartFromDB();
    } else {
      const local = localStorage.getItem("guestCart");
      if (local) setCartItems(JSON.parse(local));
    }
  }, [user]);

  /* ================= FETCH CART ================= */

  const fetchCartFromDB = async () => {
    const token = getToken();
    if (!token) return;

    try {
      setLoading(true);

      const res = await axios.get(`${API_BASE}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCartItems(res.data.items || []);
      setSummary(res.data.summary || null);
    } catch (err) {
      console.error("Cart fetch error:", err.response?.data || err.message);

      // 🔥 AUTO LOGOUT IF TOKEN INVALID
      if (err.response?.status === 401) {
        logout?.();
        localStorage.removeItem("user");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= ADD TO CART ================= */

  const addToCart = async (product) => {
    const token = getToken();

    if (token) {
      try {
        await axios.post(
          `${API_BASE}/api/cart/item`,
          product,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        fetchCartFromDB();
      } catch (err) {
        console.error("Add cart error:", err.response?.data);
      }
    } else {
      const updated = [...cartItems, product];
      setCartItems(updated);
      localStorage.setItem("guestCart", JSON.stringify(updated));
    }
  };

  /* ================= UPDATE QTY ================= */

  const updateQty = async (itemId, qty) => {
    const token = getToken();

    if (token) {
      try {
        await axios.put(
          `${API_BASE}/api/cart/item/${itemId}`,
          { quantity: qty },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        fetchCartFromDB();
      } catch (err) {
        console.error("Update qty error:", err.response?.data);
      }
    } else {
      const updated = cartItems.map((item) =>
        item.id === itemId ? { ...item, quantity: qty } : item
      );
      setCartItems(updated);
      localStorage.setItem("guestCart", JSON.stringify(updated));
    }
  };

  /* ================= REMOVE ITEM ================= */

  const removeItem = async (itemId) => {
    const token = getToken();

    if (token) {
      try {
        await axios.delete(`${API_BASE}/api/cart/item/${itemId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchCartFromDB();
      } catch (err) {
        console.error("Remove error:", err.response?.data);
      }
    } else {
      const updated = cartItems.filter((item) => item.id !== itemId);
      setCartItems(updated);
      localStorage.setItem("guestCart", JSON.stringify(updated));
    }
  };

  /* ================= CLEAR CART ================= */

  const clearCart = async () => {
    const token = getToken();

    if (token) {
      try {
        await axios.delete(`${API_BASE}/api/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchCartFromDB();
      } catch (err) {
        console.error("Clear cart error:", err.response?.data);
      }
    } else {
      setCartItems([]);
      localStorage.removeItem("guestCart");
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        summary,
        loading,
        addToCart,
        updateQty,
        removeItem,
        clearCart,
        fetchCartFromDB,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
