"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("bb-cart");
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) { setCart([]); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("bb-cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, selectedSize) => {
    if (!selectedSize) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id && item.size === selectedSize);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id && item.size === selectedSize ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { 
        ...product, 
        offerPrice: product.offerPrice || product.price || 0, 
        img: product.img || (product.images && product.images[0]), 
        size: selectedSize, 
        qty: 1 
      }];
    });
  };

  const removeFromCart = (id, size) => {
    setCart((prev) => prev.filter((item) => !(item.id === id && item.size === size)));
  };

  const updateQty = (id, size, delta) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id && item.size === size) ? { ...item, qty: Math.max(1, item.qty + delta) } : item)
    );
  };

  const cartTotal = () => {
    return cart.reduce((total, item) => total + (parseFloat(item.offerPrice) || 0) * item.qty, 0);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, cartTotal, setCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};