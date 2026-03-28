"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// const getToken = () => localStorage.getItem("token");

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartSummary, setCartSummary] = useState({
    total: 0,
    subTotal: 0,
    discount: 0,
    shipping: 0,
    platformFee: 30,
    youPay: 30,
  });
  const token = user?.token;

  const buildSummary = (items = []) => {
    const total = items.reduce((sum, item) => sum + (item.mrp || 0) * (item.quantity || 0), 0);
    const subTotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
    const discount = Math.max(total - subTotal, 0);
    const shipping = 0;
    const platformFee = 30;

    return {
      total,
      subTotal,
      discount,
      shipping,
      platformFee,
      youPay: subTotal + shipping + platformFee,
    };
  };

  /* ================= LOAD GUEST ================= */
  const loadGuestCart = async () => {
    const guest = JSON.parse(localStorage.getItem("guestCart") || "[]");

    if (!guest.length) {
      setCartItems([]);
      setCartSummary(buildSummary([]));
      return;
    }

    const formatted = await Promise.all(
      guest.map(async (item, index) => {
        try {
          const res = await axios.get(
            `${API_BASE}/api/products/${item.productId}`,
          );

          const product = res.data.product || res.data;

          const selectedVariant =
            product.variants?.find((v) => v.color === item.color) ||
            product.variants?.[0];

          const selectedSizeObj =
            selectedVariant?.sizes?.find((s) => s.size === item.size) ||
            selectedVariant?.sizes?.[0];

          const price = selectedSizeObj?.price || product.minPrice || 0;
          const mrp = selectedSizeObj?.mrp || product.mrp || price;

          const discount =
            mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

          const image =
            product.thumbnail ||
            selectedVariant?.images?.[0]?.url ||
            "/fallback.jpg";

          const availableSizes = [
            ...new Set(
              (product.variants || []).flatMap((variant) =>
                (variant?.sizes || [])
                  .filter((s) => s?.size)
                  .map((s) => s.size),
              ),
            ),
          ];

          return {
            id: `guest-${index}`, // simple id for guest
            productId: product._id,
            slug: product.slug,
            name: product.name,
            brand: product.brand || "Glovia",
            price,
            mrp,
            discount,
            image,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            seller: "Glovia Glamour",
            deliveryDate: "5-7 Business Days",
            returnText: "3 days return available",
            availableSizes,
            lineTotal: price * item.quantity,
          };
        } catch (error) {
          // Product was deleted or not found - filter it out
          if (error.response?.status === 404) {
            return null; // Mark for filtering
          }
          console.error("Error loading product:", error);
          return null; // Skip on any error
        }
      }),
    );

    // Filter out null items (deleted products)
    const filteredItems = formatted.filter((item) => item !== null);
    setCartItems(filteredItems);
    setCartSummary(buildSummary(filteredItems));
  };

  /* ================= LOAD CART ================= */
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        await mergeGuestCart();
        await fetchCart();
      } else {
        await loadGuestCart();
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
    try {
      const res = await axios.get(`${API_BASE}/api/cart`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      const formatted = Array.isArray(res.data.items) ? res.data.items : [];

      setCartItems(formatted);
      setCartSummary(res.data.summary || buildSummary(formatted));
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCartItems([]);
      setCartSummary(buildSummary([]));
    }
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
        { headers: { Authorization: `Bearer ${user?.token}` } },
      );
    }

    localStorage.removeItem("guestCart");
  };

  /* ================= ADD ================= */
  const addToCart = async ({
    productId,
    size,
    quantity = 1,
    color = "default",
  }) => {
    if (user) {
      await axios.post(
        `${API_BASE}/api/cart`,
        { productId, qty: quantity, size, color },
        { headers: { Authorization: `Bearer ${user?.token}` } },
      );
      await fetchCart();
    } else {
      const guest = JSON.parse(localStorage.getItem("guestCart") || "[]");
      const existingIndex = guest.findIndex(
        (item) =>
          item.productId === productId &&
          item.size === size &&
          item.color === color,
      );
      if (existingIndex > -1) {
        guest[existingIndex].quantity += quantity;
      } else {
        guest.push({ productId, size, quantity, color });
      }
      localStorage.setItem("guestCart", JSON.stringify(guest));
      await loadGuestCart();
    }
  };

  /* ================= UPDATE ================= */
  const updateQty = async (itemId, quantity) => {
    if (user) {
      await axios.put(
        `${API_BASE}/api/cart/${itemId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${user?.token}` } },
      );
      await fetchCart();
    } else {
      const guest = JSON.parse(localStorage.getItem("guestCart") || "[]");
      const index = parseInt(String(itemId).replace("guest-", ""));
      if (!isNaN(index) && guest[index]) {
        guest[index].quantity = quantity;
        localStorage.setItem("guestCart", JSON.stringify(guest));
        await loadGuestCart();
      }
    }
  };

  const updateSize = async (itemId, size) => {
    if (user) {
      try {
        await axios.put(
          `${API_BASE}/api/cart/size/${itemId}`,
          { size },
          { headers: { Authorization: `Bearer ${user?.token}` } },
        );

        await fetchCart();
      } catch (err) {
        alert(err?.response?.data?.message || "Size update failed");
        console.log(err?.response?.data);
      }
    } else {
      const guest = JSON.parse(localStorage.getItem("guestCart") || "[]");
      const index = parseInt(String(itemId).replace("guest-", ""));
      if (!isNaN(index) && guest[index]) {
        guest[index].size = size;
        localStorage.setItem("guestCart", JSON.stringify(guest));
        await loadGuestCart();
      }
    }
  };

  /* ================= REMOVE ================= */
  const removeItem = async (itemId) => {
    if (user) {
      await axios.delete(`${API_BASE}/api/cart/${itemId}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      await fetchCart();
    } else {
      const guest = JSON.parse(localStorage.getItem("guestCart") || "[]");
      const index = parseInt(String(itemId).replace("guest-", ""));
      if (!isNaN(index) && guest[index]) {
        guest.splice(index, 1);
        localStorage.setItem("guestCart", JSON.stringify(guest));
        await loadGuestCart();
      }
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartSummary,
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
