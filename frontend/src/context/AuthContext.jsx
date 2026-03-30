"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

const AuthContext = createContext();

const AUTH_STORAGE_KEYS = ["user", "userInfo", "token", "selectedAddressId"];
const AUTH_TOAST_KEY = "auth-toast";
const AUTH_PENDING_KEY = "auth-pending";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingAuthAction, setPendingAuthAction] = useState(null);

  useEffect(() => {
    const storedPendingAction = sessionStorage.getItem(AUTH_PENDING_KEY);
    if (storedPendingAction) {
      setPendingAuthAction(storedPendingAction);
    }

    const syncUserFromStorage = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const legacyUserInfo = localStorage.getItem("userInfo");

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else if (legacyUserInfo) {
          const parsedLegacy = JSON.parse(legacyUserInfo);
          const normalizedUser = parsedLegacy?.user
            ? {
                ...parsedLegacy.user,
                token: parsedLegacy.token || parsedLegacy.user?.token,
              }
            : parsedLegacy;

          if (normalizedUser) {
            localStorage.setItem("user", JSON.stringify(normalizedUser));
            setUser(normalizedUser);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
        setUser(null);
      }
      setLoading(false);
    };

    syncUserFromStorage();

    const handleStorage = (event) => {
      if (!event.key || AUTH_STORAGE_KEYS.includes(event.key)) {
        syncUserFromStorage();
      }
    };

    const handleAuthChanged = () => {
      syncUserFromStorage();
    };

    const pendingToast = sessionStorage.getItem(AUTH_TOAST_KEY);
    if (pendingToast) {
      sessionStorage.removeItem(AUTH_TOAST_KEY);
      toast.success(pendingToast);
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener("auth-changed", handleAuthChanged);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("auth-changed", handleAuthChanged);
    };
  }, []);

  useEffect(() => {
    if (!loading && pendingAuthAction) {
      sessionStorage.removeItem(AUTH_PENDING_KEY);
      const timeoutId = window.setTimeout(() => {
        setPendingAuthAction(null);
      }, 300);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }
  }, [loading, pendingAuthAction]);

  const reloadPageWithToast = (message, pendingLabel) => {
    sessionStorage.setItem(AUTH_TOAST_KEY, message);
    sessionStorage.setItem(AUTH_PENDING_KEY, pendingLabel);
    setPendingAuthAction(pendingLabel);
    window.location.reload();
  };

  const login = (
    userData,
    token,
    {
      successMessage = "Successfully logged in",
      pendingLabel = "Signing you in...",
    } = {}
  ) => {
    const userWithToken = { ...userData, token };

    localStorage.setItem("user", JSON.stringify(userWithToken));
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("auth-changed"));
    setUser(userWithToken);
    reloadPageWithToast(successMessage, pendingLabel);
  };

  const logout = () => {
    AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    window.dispatchEvent(new Event("auth-changed"));
    setUser(null);
    reloadPageWithToast("Logged out successfully", "Signing you out...");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        pendingAuthAction,
        setPendingAuthAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
