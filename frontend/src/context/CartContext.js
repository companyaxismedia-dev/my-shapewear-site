"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

const CartContext = createContext();

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// const getToken = () => localStorage.getItem("token");

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [pendingItemIds, setPendingItemIds] = useState({});
  const [cartSummary, setCartSummary] = useState({
    total: 0,
    subTotal: 0,
    discount: 0,
    productDiscount: 0,
    couponDiscount: 0,
    shipping: 0,
    platformFee: 30,
    youPay: 30,
    appliedCoupon: null,
  });
  const token = user?.token;

  const readGuestCoupon = () => {
    try {
      return JSON.parse(localStorage.getItem("guestCoupon") || "null");
    } catch {
      return null;
    }
  };

  const writeGuestCoupon = (coupon) => {
    if (coupon?.code) {
      localStorage.setItem("guestCoupon", JSON.stringify(coupon));
    } else {
      localStorage.removeItem("guestCoupon");
    }
  };

  const calculateCouponDiscount = (subTotal, coupon) => {
    if (!coupon?.code) return 0;
    if (subTotal < (coupon.minOrderValue || 0)) return 0;

    if (coupon.discountType === "flat") {
      return Math.min(coupon.discountValue || 0, subTotal);
    }

    let discount = (subTotal * (coupon.discountValue || 0)) / 100;
    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }

    return Math.min(discount, subTotal);
  };

  const buildSummary = (items = [], appliedCoupon = null) => {
    const total = items.reduce((sum, item) => sum + (item.mrp || 0) * (item.quantity || 0), 0);
    const subTotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
    const productDiscount = Math.max(total - subTotal, 0);
    const couponDiscount = calculateCouponDiscount(subTotal, appliedCoupon);
    const shipping = 0;
    const platformFee = 30;

    return {
      total,
      subTotal,
      discount: productDiscount,
      productDiscount,
      couponDiscount,
      shipping,
      platformFee,
      youPay: Math.max(subTotal + shipping + platformFee - couponDiscount, 0),
      appliedCoupon: couponDiscount > 0 ? appliedCoupon : null,
    };
  };

  const applyCartPayload = (data) => {
    if (Array.isArray(data?.items)) {
      setCartItems(data.items);
    }

    if (data?.summary) {
      setCartSummary(data.summary);
    }
  };

  /* ================= LOAD GUEST ================= */
  const loadGuestCart = async () => {
    setCartLoading(true);
    const guest = JSON.parse(localStorage.getItem("guestCart") || "[]");

    if (!guest.length) {
      setCartItems([]);
      writeGuestCoupon(null);
      setCartSummary(buildSummary([]));
      setCartLoading(false);
      return;
    }

    try {
      const ids = [...new Set(guest.map((item) => item.productId).filter(Boolean))];
      const res = await axios.post(`${API_BASE}/api/products/batch`, { ids });
      const productsById = new Map(
        (res.data?.products || []).map((product) => [String(product._id), product]),
      );

      const formatted = guest
        .map((item, index) => {
          const product = productsById.get(String(item.productId));
          if (!product) return null;
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
            category: product.category || "",
            subCategory: product.subCategory || "",
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
        })
        .filter(Boolean);

      const guestCoupon = readGuestCoupon();
      const nextSummary = buildSummary(formatted, guestCoupon);
      if (guestCoupon?.code && !nextSummary.appliedCoupon) {
        writeGuestCoupon(null);
      }
      setCartItems(formatted);
      setCartSummary(nextSummary);
    } catch (error) {
      console.error("Error loading guest cart:", error);
      setCartItems([]);
      setCartSummary(buildSummary([]));
    } finally {
      setCartLoading(false);
    }
  };

  /* ================= LOAD CART ================= */
  useEffect(() => {
    const loadCart = async () => {
      setCartLoading(true);
      if (user) {
        const merged = await mergeGuestCart();
        if (!merged) {
          await fetchCart();
        }
        const guestCoupon = readGuestCoupon();
        if (guestCoupon?.code) {
          try {
            await applyCoupon(guestCoupon.code, { silent: true });
          } catch {
            writeGuestCoupon(null);
          }
          writeGuestCoupon(null);
        }
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
      setCartLoading(true);
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
    } finally {
      setCartLoading(false);
    }
  };

  const applyCoupon = async (code, options = {}) => {
    const normalizedCode = String(code || "").trim().toUpperCase();

    if (!normalizedCode) {
      throw new Error("Please enter a coupon code");
    }

    if (user) {
      const res = await axios.post(
        `${API_BASE}/api/cart/coupon`,
        { code: normalizedCode },
        { headers: { Authorization: `Bearer ${user?.token}` } },
      );

      applyCartPayload(res.data);
      if (!options.silent) {
        toast.success(res.data?.message || "Coupon applied");
      }
      return res.data;
    }

    const currentSummary = buildSummary(cartItems);
    const res = await axios.post(`${API_BASE}/api/offers/validate`, {
      code: normalizedCode,
      cartTotal: currentSummary.subTotal,
      cartItems,
    });

    const offer = res.data?.offer;
    const coupon = offer
      ? {
          code: offer.code,
          title: offer.title || "",
          discountType: offer.discountType || "",
          discountValue: offer.discountValue || 0,
          maxDiscount: offer.maxDiscount ?? null,
          minOrderValue: offer.minOrderValue || 0,
        }
      : null;

    writeGuestCoupon(coupon);
    setCartSummary(buildSummary(cartItems, coupon));
    if (!options.silent) {
      toast.success("Coupon applied");
    }
    return res.data;
  };

  const removeCoupon = async (options = {}) => {
    if (user) {
      const res = await axios.delete(`${API_BASE}/api/cart/coupon`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      if (res.data?.summary) {
        applyCartPayload(res.data);
      }
      if (!options.silent) {
        toast.success(res.data?.message || "Coupon removed");
      }
      return;
    }

    writeGuestCoupon(null);
    setCartSummary(buildSummary(cartItems));
    if (!options.silent) {
      toast.success("Coupon removed");
    }
  };

  /* ================= MERGE GUEST ================= */
  const mergeGuestCart = async () => {
    const guest = JSON.parse(localStorage.getItem("guestCart") || "[]");

    if (!guest.length) return false;

    const res = await axios.post(
      `${API_BASE}/api/cart/merge`,
      { items: guest },
      { headers: { Authorization: `Bearer ${user?.token}` } },
    );

    applyCartPayload(res.data);

    localStorage.removeItem("guestCart");
    return true;
  };

  /* ================= ADD ================= */
  const addToCart = async ({
    productId,
    size,
    quantity = 1,
    color = "default",
  }) => {
    if (user) {
      const res = await axios.post(
        `${API_BASE}/api/cart`,
        { productId, qty: quantity, size, color },
        { headers: { Authorization: `Bearer ${user?.token}` } },
      );
      applyCartPayload(res.data);
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
    setPendingItemIds((prev) => ({ ...prev, [itemId]: "quantity" }));
    setSummaryLoading(true);
    if (user) {
      const res = await axios.put(
        `${API_BASE}/api/cart/${itemId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${user?.token}` } },
      );
      applyCartPayload(res.data);
    } else {
      const guest = JSON.parse(localStorage.getItem("guestCart") || "[]");
      const index = parseInt(String(itemId).replace("guest-", ""));
      if (!isNaN(index) && guest[index]) {
        guest[index].quantity = quantity;
        localStorage.setItem("guestCart", JSON.stringify(guest));
        await loadGuestCart();
      }
    }
    setPendingItemIds((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
    setSummaryLoading(false);
  };

  const updateSize = async (itemId, size) => {
    setPendingItemIds((prev) => ({ ...prev, [itemId]: "size" }));
    setSummaryLoading(true);
    if (user) {
      try {
        const res = await axios.put(
          `${API_BASE}/api/cart/size/${itemId}`,
          { size },
          { headers: { Authorization: `Bearer ${user?.token}` } },
        );
        applyCartPayload(res.data);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Size update failed");
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
    setPendingItemIds((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
    setSummaryLoading(false);
  };

  /* ================= REMOVE ================= */
  const removeItem = async (itemId) => {
    setPendingItemIds((prev) => ({ ...prev, [itemId]: "remove" }));
    setSummaryLoading(true);
    if (user) {
      const res = await axios.delete(`${API_BASE}/api/cart/${itemId}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      applyCartPayload(res.data);
    } else {
      const guest = JSON.parse(localStorage.getItem("guestCart") || "[]");
      const index = parseInt(String(itemId).replace("guest-", ""));
      if (!isNaN(index) && guest[index]) {
        guest.splice(index, 1);
        localStorage.setItem("guestCart", JSON.stringify(guest));
        await loadGuestCart();
      }
    }
    setPendingItemIds((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
    setSummaryLoading(false);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartSummary,
        cartLoading,
        summaryLoading,
        pendingItemIds,
        addToCart,
        updateQty,
        updateSize,
        removeItem,
        applyCoupon,
        removeCoupon,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
