"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Load from LocalStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('vital-cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error parsing cart", e);
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('vital-cart', JSON.stringify(cart));
  }, [cart]);

  // Add Item to Cart
  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find(item => item.id === product.id && item.size === product.size);
      if (exists) {
        return prev.map(item => 
          item.id === product.id && item.size === product.size 
          ? { ...item, qty: item.qty + 1 } 
          : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  // ⭐ FIXED: Update Quantity Function
  const updateQty = (id, newQty) => {
    setCart((prev) => 
      prev.map(item => item.id === id ? { ...item, qty: newQty } : item)
    );
  };

  // ⭐ FIXED: Remove from Cart Function
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter(item => item.id !== id));
  };

  // ⭐ FIXED: cartTotal ab ek function hai (taaki CartPage.js crash na ho)
  const cartTotal = () => {
    return cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      updateQty, 
      removeFromCart, 
      cartCount, 
      cartTotal // Passing as function
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);