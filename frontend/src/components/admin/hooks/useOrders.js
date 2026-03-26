"use client";

import { useEffect, useState, useCallback } from "react";
import { apiRequest } from "@/lib/api";

export function useOrders(startDate, endDate, page = 1, limit = 10, search = "", status = "") {

  const [orders,setOrders] = useState([]);
  const [analytics,setAnalytics] = useState(null);
  const [loading,setLoading] = useState(true);
  const [total,setTotal] = useState(0);
  const [pages,setPages] = useState(1);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");

      let q = [];
      if (startDate) q.push(`startDate=${startDate}`);
      if (endDate) q.push(`endDate=${endDate}`);
      if (page) q.push(`page=${page}`);
      if (limit) q.push(`limit=${limit}`);
      if (search) q.push(`search=${encodeURIComponent(search)}`);
      if (status) q.push(`status=${encodeURIComponent(status)}`);

      const query = q.length ? `?${q.join("&")}` : "";

      const resOrders = await apiRequest(`/api/admin/orders${query}`,{
        headers:{Authorization:`Bearer ${token}`}
      });

      const analyticsQuery = [];
      if (startDate) analyticsQuery.push(`startDate=${startDate}`);
      if (endDate) analyticsQuery.push(`endDate=${endDate}`);
      const analyticsQ = analyticsQuery.length ? `?${analyticsQuery.join("&")}` : "";

      const resAnalytics = await apiRequest(`/api/admin/orders/analytics${analyticsQ}`,{
        headers:{Authorization:`Bearer ${token}`}
      });


      if(resOrders && resOrders.success){
        // Map orders to new schema if needed
        setOrders((resOrders.orders || []).map((o) => ({
          id: o.id || o._id,
          orderNumber: o.orderNumber,
          createdAt: o.createdAt,
          status: o.status,
          customer: o.customer,
          phone: o.phone,
          payment: o.payment,
          paymentMethod: o.paymentMethod,
          total: o.total,
          items: o.items,
          shipment: o.shipment,
          products: o.products,
          userInfo: o.userInfo,
          pricing: o.pricing,
          coupon: o.coupon,
          offersEarned: o.offersEarned,
          statusHistory: o.statusHistory,
          invoiceNumber: o.invoiceNumber,
          supportTicketIds: o.supportTicketIds,
        })));
        setTotal(resOrders.total || 0);
        setPages(resOrders.pages || 1);
      }

      if(resAnalytics && resAnalytics.success){
        setAnalytics(resAnalytics);
      }

    } catch (err) {
      console.error("useOrders fetch error", err);
    } finally {
      setLoading(false);
    }
  },[startDate,endDate,page,limit,search,status]);

  useEffect(()=>{
    fetchOrders();
  },[fetchOrders]);

  return {orders,analytics,loading,total,pages,refetch:fetchOrders};
}