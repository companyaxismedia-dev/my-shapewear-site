"use client";

import { createContext, useState, useEffect, useCallback } from "react";
import { API_BASE } from "@/lib/api";

export const AccountContext = createContext();

export function AccountProvider({ children }) {
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const syncStoredUser = useCallback((updatedUser) => {
    if (typeof window === "undefined") return;

    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (!storedUser?.token) return;

    localStorage.setItem(
      "user",
      JSON.stringify({
        ...storedUser,
        ...updatedUser,
        token: storedUser.token,
      })
    );

    window.dispatchEvent(new Event("auth-changed"));
  }, []);

  const fetchUserProfile = useCallback(async (token) => {
    const res = await fetch(`${API_BASE}/api/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch profile");
    }

    const profile = await res.json();
    setUser(profile);
    syncStoredUser(profile);
    return profile;
  }, [syncStoredUser]);

  /* ================= FETCH ACCOUNT DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));

        if (!storedUser?.token) {
          setLoading(false);
          return;
        }

        const headers = {
          Authorization: `Bearer ${storedUser.token}`,
        };

        /* ===== USER ===== */
        await fetchUserProfile(storedUser.token);

        /* ===== ADDRESS ===== */
        const addrRes = await fetch(
          `${API_BASE}/api/users/address`,
          { headers }
        );

        const addrData = await addrRes.json();

        if (addrData?.success) {
          setAddresses(addrData.addresses || []);
        }

        /* ===== ORDERS ===== */
        const orderRes = await fetch(
          `${API_BASE}/api/orders/my-orders`,
          { headers }
        );

        const orderData = await orderRes.json();

        if (orderData?.success) {
          setOrders(orderData.orders || []);
        }

      } catch (err) {
        console.error("Account fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchUserProfile]);

  /* ================= USER UPDATE ================= */
  const updateUserProfile = useCallback((updatedData) => {
    setUser((prev) => {
      const nextUser = { ...prev, ...updatedData };
      syncStoredUser(nextUser);
      return nextUser;
    });
  }, [syncStoredUser]);

  /* ================= ADDRESS ACTIONS ================= */

  const addAddress = useCallback(async (newAddress) => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));

      if (!storedUser?.token) return;

      const res = await fetch(`${API_BASE}/api/users/address`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storedUser.token}`,
        },
        body: JSON.stringify({
          fullName: newAddress.name,
          phone: newAddress.phone,
          addressLine: newAddress.address,
          city: newAddress.city,
          state: newAddress.state,
          pincode: newAddress.pincode,
          label: newAddress.label,
        }),
      });

      const data = await res.json();

      if (data?.success) {
        setAddresses(data.addresses || []);
      }
    } catch (err) {
      console.error("Add address error:", err);
    }
  }, []);

  const deleteAddress = useCallback(async (id) => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser?.token) return;

      await fetch(`${API_BASE}/api/users/address/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${storedUser.token}`,
        },
      });

      setAddresses((prev) =>
        prev.filter((a) => a._id !== id)
      );
    } catch (err) {
      console.error("Delete address error:", err);
    }
  }, []);

  /* ================= PLACEHOLDER (future APIs) ================= */

  const updateBankDetails = useCallback((data) => {
    console.log("Bank update (backend later)", data);
  }, []);

  const toggleNotification = useCallback((type) => {
    console.log("Notification toggle (backend later)", type);
  }, []);

  const value = {
    user,
    addresses,
    orders,
    loading,

    updateUserProfile,
    fetchUserProfile,

    addAddress,
    deleteAddress,

    updateBankDetails,
    toggleNotification,
  };

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  );
}
