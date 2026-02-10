"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const CartContext = createContext();

/* ===============================
   AUTH HEADER HELPER
================================ */
const getAuthHeader = () => {
  if (typeof window === "undefined") return {};
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.token
    ? { Authorization: `Bearer ${user.token}` }
    : {};
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  /* ===============================
     LOAD CART ON APP START
  ================================ */
  useEffect(() => {
    const headers = getAuthHeader();

    if (headers.Authorization) {
      // Logged-in user → DB cart
      fetchCartFromDB();
    } else {
      // Guest user → Local cart
      const localCart = localStorage.getItem("bb-cart");
      if (localCart) {
        try {
          setCart(JSON.parse(localCart));
        } catch {
          setCart([]);
        }
      }
    }
  }, []);

  /* ===============================
     FETCH CART FROM BACKEND
  ================================ */
  const fetchCartFromDB = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/cart",
        { headers: getAuthHeader() }
      );
      setCart(res.data.items || []);
    } catch (err) {
      console.error("Cart fetch error:", err);
    }
  };

  /* ===============================
     SAVE GUEST CART TO LOCAL
  ================================ */
  useEffect(() => {
    const headers = getAuthHeader();
    if (!headers.Authorization) {
      localStorage.setItem("bb-cart", JSON.stringify(cart));
    }
  }, [cart]);

  /* ===============================
     ADD TO CART
  ================================ */
  const addToCart = async (product, size, color = "default") => {
    if (!size) return alert("Please select size");

    const headers = getAuthHeader();

    // 🔐 LOGGED-IN USER
    if (headers.Authorization) {
      try {
        const res = await axios.post(
          "http://localhost:5000/api/cart/add",
          {
            productId: product._id,
            qty: 1,
            size,
            color,
          },
          { headers }
        );
        setCart(res.data.items);
      } catch (err) {
        console.error("Add to cart error:", err);
      }
    }

    // 👤 GUEST USER
    else {
      setCart((prev) => {
        const existing = prev.find(
          (item) =>
            item.productId === product._id &&
            item.size === size &&
            item.color === color
        );

        if (existing) {
          return prev.map((item) =>
            item.productId === product._id &&
            item.size === size &&
            item.color === color
              ? { ...item, qty: item.qty + 1 }
              : item
          );
        }

        return [
          ...prev,
          {
            productId: product._id,
            name: product.name,
            price: product.price,
            image: product.image,
            size,
            color,
            qty: 1,
          },
        ];
      });
    }
  };

  /* ===============================
     REMOVE FROM CART
  ================================ */
  const removeFromCart = async (productId) => {
    const headers = getAuthHeader();

    if (headers.Authorization) {
      try {
        const res = await axios.delete(
          `http://localhost:5000/api/cart/remove/${productId}`,
          { headers }
        );
        setCart(res.data.items);
      } catch (err) {
        console.error("Remove error:", err);
      }
    } else {
      setCart((prev) =>
        prev.filter((item) => item.productId !== productId)
      );
    }
  };

  /* ===============================
     UPDATE QUANTITY (FRONTEND)
     (Backend qty API later)
  ================================ */
  const updateQty = (productId, size, delta) => {
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId && item.size === size
          ? { ...item, qty: Math.max(1, item.qty + delta) }
          : item
      )
    );
  };

  /* ===============================
     CART TOTAL
  ================================ */
  const cartTotal = () =>
    cart.reduce((total, item) => total + item.price * item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        cartTotal,
        setCart,
        fetchCartFromDB,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

/* ===============================
   CUSTOM HOOK
================================ */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
};
