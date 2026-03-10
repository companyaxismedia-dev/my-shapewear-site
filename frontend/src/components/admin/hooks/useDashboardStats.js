"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export function useDashboardStats(pollInterval = 0, chartPeriod = "7days") {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalSales: null,
        totalOrders: null,
        totalProducts: null,
        totalCustomers: null,
        recentOrders: [],
        recentProducts: [],
        lowStock: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [salesData, setSalesData] = useState([]);
    const [salesLoading, setSalesLoading] = useState(true);


    const fetchStats = async () => {
        setLoading(true);
        const token = localStorage.getItem("adminToken");
        try {
            const res = await apiRequest("/api/admin/stats/counts", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.success) {
                setStats({
                    totalSales: res.totalSales ?? null,
                    totalCustomers: res.totalCustomers ?? null,
                    totalOrders: res.totalOrders ?? null,
                    totalProducts: res.totalProducts ?? null,
                    recentOrders: res.recentOrders ?? [],
                    recentProducts: res.recentProducts ?? [],
                    lowStock: res.lowStock ?? [],
                });
                setError(null);
            } else {
                setError(res.message || "Failed to load counts");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchSalesGraph = async () => {
        setSalesLoading(true);

        const token = localStorage.getItem("adminToken");

        try {
            const res = await apiRequest(
                `/api/admin/sales-graph?period=${chartPeriod}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (res.success) {
                setSalesData(res.data || []);
            }
        } catch (err) {
            console.error("Sales graph error:", err);
        } finally {
            setSalesLoading(false);
        }
    };



    useEffect(() => {
        if (!user?.token) return;

fetchStats();
fetchSalesGraph();

        if (pollInterval > 0) {
            const intervalId = setInterval(fetchStats, pollInterval);
            return () => clearInterval(intervalId);
        }
    }, [user?.token, pollInterval, chartPeriod]);

    return { stats, loading, error, salesData, salesLoading, refetch: fetchStats };
}
