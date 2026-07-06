"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const CategoryContext = createContext();

export const useCategories = () => {
  return useContext(CategoryContext);
};

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);

  // Fetch categories optimally once when context loads
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000"}/api/categories`,
        );
        if (response.ok) {
          const data = await response.json();
          console.log(data)
          // Filter out active categories
          setCategories(data?.categories);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoadingCats(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <CategoryContext.Provider value={{ categories, loadingCats }}>
      {children}
    </CategoryContext.Provider>
  );
};
