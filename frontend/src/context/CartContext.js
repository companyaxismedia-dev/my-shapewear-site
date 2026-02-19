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

const getToken = () => localStorage.getItem("token");

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);

  /* ================= LOAD CART ================= */
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        await mergeGuestCart();
        await fetchCart();
      } else {
        const guest = localStorage.getItem("guestCart");
        if (guest) setCartItems(JSON.parse(guest));
      }
    };

    loadCart();
  }, [user]);

  /* ================= FETCH CART ================= */
  // const fetchCart = async () => {
  //   const res = await axios.get(`${API_BASE}/api/cart`, {
  //     headers: { Authorization: `Bearer ${getToken()}` },
  //   });

  //   // const formatted = res.data.items.map((item) => ({
  //   //   id: item._id,
  //   //   productId: item.product._id,
  //   //   name: item.product.name,
  //   //   price: item.product.price,
  //   //   image: item.product.images?.[0] || "/fallback.jpg",
  //   //   quantity: item.qty,
  //   //   size: item.size,
  //   //   color: item.color,
  //   // }));

  //   const formatted = res.data.items.map((item) => ({
  //     id: item._id,
  //     productId: item.product._id,
  //     name: item.product.name,
  //     brand: item.product.brand || "Glovia",
  //     price: item.product.price,
  //     mrp: item.product.mrp || item.product.price,
  //     discount: item.product.discount || 0,
  //     image:
  //       item.product.images?.[0] ||
  //       item.product.variants?.[0]?.images?.[0] ||
  //       "/fallback.jpg",
  //     quantity: item.qty,
  //     size: item.size,
  //     color: item.color,
  //     seller: "Glovia Glamour",
  //     deliveryDate: "5-7 Business Days",
  //   }));

  //   setCartItems(formatted);
  // };

  const fetchCart = async () => {
    const res = await axios.get(`${API_BASE}/api/cart`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    const formatted = res.data.items.map((item) => {
      const product = item.product;

      const price = product.price || 0;
      const mrp = product.mrp || price;
      const discount =
        mrp > price
          ? Math.round(((mrp - price) / mrp) * 100)
          : 0;

      const image =
        product.images?.[0] ||
        product.variants?.[0]?.images?.[0] ||
        "/fallback.jpg";

      //       let image = "";

      // if (product.images?.length > 0) {
      //   image = product.images[0];
      // } else if (product.variants?.length > 0) {
      //   for (const variant of product.variants) {
      //     if (variant.images?.length > 0) {
      //       image = variant.images[0];
      //       break;
      //     }
      //   }
      // }
      // if (!image) {
      //   image = "https://via.placeholder.com/300";
      // }

      // 🔥 Find correct variant using cart color
      const selectedVariant = product.variants?.find(
        (v) => v.color === item.color
      ) || product.variants?.[0];

      // 🔥 Extract size list from that variant
      const availableSizes =
        selectedVariant?.sizes?.map((s) => s.size) || [];

      return {
        id: item._id,
        productId: product._id,
        slug: product.slug,
        name: product.name,
        brand: product.brand || "Glovia",
        price,
        mrp,
        discount,
        image,
        quantity: item.qty,
        size: item.size,
        color: item.color,
        seller: "Glovia Glamour",
        deliveryDate: "5-7 Business Days",
        returnText: "3 days return available",

        // ✅ NOW THIS WILL WORK
        availableSizes,
      };
    });

    setCartItems(formatted);
    };


  /* ================= MERGE GUEST ================= */
  const mergeGuestCart = async () => {
    const guest = JSON.parse(localStorage.getItem("guestCart") || "[]");

    if (!guest.length) return;

    for (const item of guest) {
      await axios.post(
        `${API_BASE}/api/cart`,
        {
          productId: item.productId,
          qty: item.quantity,
          size: item.size,
          color: item.color,
        },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
    }

    localStorage.removeItem("guestCart");
  };

  /* ================= ADD ================= */
  const addToCart = async ({ productId, size, quantity = 1, color = "default" }) => {
    if (user) {
      await axios.post(
        `${API_BASE}/api/cart`,
        { productId, qty: quantity, size, color },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      fetchCart();
    } else {
      const updated = [...cartItems, { productId, size, quantity, color }];
      setCartItems(updated);
      localStorage.setItem("guestCart", JSON.stringify(updated));
    }
  };

  /* ================= UPDATE ================= */
  const updateQty = async (itemId, quantity) => {
    if (user) {
      await axios.put(
        `${API_BASE}/api/cart/${itemId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      fetchCart();
    } else {
      const updated = cartItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );
      setCartItems(updated);
      localStorage.setItem("guestCart", JSON.stringify(updated));
    }
  };

  const updateSize = async (itemId, size) => {
    if (user) {
      await axios.put(
        `${API_BASE}/api/cart/size/${itemId}`,
        { size },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      fetchCart();
    } else {
      const updated = cartItems.map((item) =>
        item.id === itemId ? { ...item, size } : item
      );
      setCartItems(updated);
      localStorage.setItem("guestCart", JSON.stringify(updated));
    }
  };


  /* ================= REMOVE ================= */
  const removeItem = async (itemId) => {
    if (user) {
      await axios.delete(
        `${API_BASE}/api/cart/${itemId}`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      fetchCart();
    } else {
      const updated = cartItems.filter((item) => item.id !== itemId);
      setCartItems(updated);
      localStorage.setItem("guestCart", JSON.stringify(updated));
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQty,
        updateSize,
        removeItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
