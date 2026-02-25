"use client";
import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import FilterBar from "@/components/FilterBar";
import TopFilters from "@/components/TopFilters";
import Footer from "@/components/Footer";

import {ChevronDown,} from "lucide-react";
import { ProductCard } from "./ProductCard";
import { ProductDetailsModal } from "./ProductDetailsModal";

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function CategoryPage({ category }) {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNavbar, setShowNavbar] = useState(true);
    const [filters, setFilters] = useState({});
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoginActive, setIsLoginActive] = useState(false);

    const [sortOpen, setSortOpen] = useState(false);
    const [sort, setSort] = useState("Recommended");    

    useEffect(() => {
        setPage(1);
    }, [category]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const cleanFilters = Object.fromEntries(
                    Object.entries(filters).filter(([_, v]) => v !== "")
                );

                const query = new URLSearchParams({
                    ...cleanFilters,
                    category: category,
                    page,
                    limit: 20,
                    ...(sort === "Price: Low to High" && { sort: "price_asc" }),
                    ...(sort === "Price: High to Low" && { sort: "price_desc" }),
                    ...(sort === "Better Discount" && { sort: "discount_desc" }),
                    ...(sort === "Customer Rating" && { sort: "rating" }),
                    ...(sort === "What's New" && { sort: "newest" }),
                    ...(sort === "Popularity" && { sort: "popularity" }),
                }).toString();

                const res = await fetch(`${API_BASE}/api/products?${query}`);
                const data = await res.json();

                if (data.success) {
                    setProducts(data.products);
                    setTotalItems(data.total || data.products.length);
                }
            } catch (error) {
                console.error(`Error fetching ${category}:`, error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [filters, page, sort]);

    useEffect(() => {
        const handler = (e) => {
            if (!e.target.closest("[data-sort-dropdown]")) {
                setSortOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        let lastScrollY = window.scrollY;
        const handleScroll = () => {
            // FIX: If login is open, don't hide the navbar
            if (isLoginActive) {
                setShowNavbar(true);
                return;
            }

            if (window.scrollY > lastScrollY && window.scrollY > 80) {
                setShowNavbar(false);
            } else {
                setShowNavbar(true);
            }
            lastScrollY = window.scrollY;
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isLoginActive]);


    return (
        <div className="min-h-screen bg-white text-[#282c3f] font-sans relative">

            <div className={`transition-all duration-500 ${isLoginActive ? "blur-md brightness-75 pointer-events-none" : ""}`}>

                <div className={`sticky top-0 z-[999] transition-transform duration-300 ${showNavbar ? "translate-y-0" : "-translate-y-full"
                    }`}>
                    <Navbar onLoginToggle={(val) => setIsLoginActive(val)} />
                </div>
                <div className="flex w-full m-0">
                    {/* LEFT SIDEBAR */}
                    <aside className="shrink-0 hidden md:block border-r border-gray-100">
                        <FilterBar
                            filters={filters}
                            setFilters={setFilters}
                            setPage={setPage}
                            category={category}
                        />
                    </aside>

                    {/* RIGHT CONTENT */}
                    <div className="flex-1 min-w-0">
                        {/* TOP BAR */}
                        <div className="flex items-start justify-between border-b border-[#e8e8e8] px-4 min-h-[48px] gap-2">
                            <TopFilters
                                filters={filters}
                                setFilters={setFilters}
                                setPage={setPage}
                            />

                            {/* SORT DROPDOWN */}
                            <div className="relative shrink-0 pt-2" data-sort-dropdown>
                                <button
                                    onClick={() => setSortOpen(!sortOpen)}
                                    className="flex items-center justify-between border border-[#e8e8e8] px-3.5 py-2 text-[13px] w-[240px] bg-white cursor-pointer text-[#282c3f]"
                                >
                                    <span>
                                        Sort by : <strong>{sort}</strong>
                                    </span>
                                    <ChevronDown size={14} />
                                </button>

                                {sortOpen && (
                                    <div className="absolute right-0 top-full bg-white border border-[#e8e8e8] shadow-lg w-[240px] z-[100]">
                                        {[
                                            "Recommended",
                                            "What's New",
                                            "Popularity",
                                            "Better Discount",
                                            "Price: High to Low",
                                            "Price: Low to High",
                                            "Customer Rating",
                                        ].map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => {
                                                    setSort(s);
                                                    setSortOpen(false);
                                                }}
                                                className={`block w-full text-left px-4 py-2.5 text-[14px] transition-colors ${sort === s
                                                    ? "text-[#ff3f6c] font-bold"
                                                    : "text-[#282c3f] font-normal hover:bg-gray-50"
                                                    }`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* PRODUCTS GRID */}
                        <main className="p-4">
                            {loading ? (
                                <div className="text-center py-20">
                                    <div className="w-9 h-9 border-4 border-[#e8e8e8] border-t-[#ff3f6c] rounded-full animate-spin mx-auto mb-3" />
                                    <p className="text-[#94969f] text-sm">Loading products...</p>
                                </div>
                            ) : products.length === 0 ? (
                                <div className="text-center py-20">
                                    <h2 className="text-lg font-bold text-[#282c3f]">No products found</h2>
                                    <p className="text-sm text-[#94969f] mt-2">Try changing or clearing your filters</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {products.map((item) => (
                                        <ProductCard
                                            key={item._id}
                                            item={item}
                                            onOpenDetails={() => setSelectedProduct(item)}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* PAGINATION */}
                            {!loading && products.length > 0 && (
                                <div className="flex justify-center items-center gap-2 py-8">
                                    <button
                                        disabled={page <= 1}
                                        onClick={() => setPage((p) => p - 1)}
                                        className={`px-5 py-2 text-[13px] font-bold border transition-colors ${page <= 1
                                            ? "bg-gray-100 text-gray-300 cursor-not-allowed border-gray-200"
                                            : "bg-white text-[#282c3f] cursor-pointer border-[#e8e8e8] hover:border-gray-400"
                                            }`}
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm font-semibold text-[#282c3f] px-3">
                                        Page {page}
                                    </span>
                                    <button
                                        onClick={() => setPage((p) => p + 1)}
                                        disabled={products.length < 20}
                                        className={`px-5 py-2 text-[13px] font-bold border transition-colors ${products.length < 20
                                            ? "bg-gray-100 text-gray-300 cursor-not-allowed border-gray-200"
                                            : "bg-white text-[#282c3f] cursor-pointer border-[#e8e8e8] hover:border-gray-400"
                                            }`}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </main>
                    </div>
                </div>

                {selectedProduct && (
                    <ProductDetailsModal
                        product={selectedProduct}
                        onClose={() => setSelectedProduct(null)}
                    />
                )}
                <Footer />
            </div>
        </div>
    );
}

