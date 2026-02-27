"use client";

import { useEffect, useState } from "react";
import { useAccount } from "@/hooks/useAccount";
import { MessageCircle, Mail, Bell, Inbox } from "lucide-react";
import { API_BASE } from "@/lib/api";

const notificationTypes = [
  {
    id: "whatsapp",
    label: "Whatsapp Notifications",
    icon: MessageCircle,
    color: "text-green-500",
  },
  {
    id: "sms",
    label: "SMS Notifications",
    icon: Mail,
    color: "text-blue-500",
  },
  {
    id: "push",
    label: "Push Notifications",
    icon: Bell,
    color: "text-yellow-400",
  },
  {
    id: "email",
    label: "Email Notifications",
    icon: Inbox,
    color: "text-blue-600",
  },
];

export default function ManageNotifications() {
  const { notifications, toggleNotification } = useAccount();
  const [loading, setLoading] = useState(false);

  /* ================= BACKEND FETCH ================= */
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const stored = JSON.parse(localStorage.getItem("user"));
        if (!stored?.token) return;

        setLoading(true);

        // OPTIONAL BACKEND API (future safe)
        await fetch(`${API_BASE}/users/notifications`, {
          headers: {
            Authorization: `Bearer ${stored.token}`,
          },
        });
      } catch (err) {
        console.log("No notification API yet (safe)");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  /* ================= TOGGLE + BACKEND SAVE ================= */
  const handleToggle = async (type) => {
    toggleNotification(type);

    try {
      const stored = JSON.parse(localStorage.getItem("user"));
      if (!stored?.token) return;

      await fetch(`${API_BASE}/users/notifications`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${stored.token}`,
        },
        body: JSON.stringify({ type }),
      });
    } catch (err) {
      console.log("Notification API not available yet");
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">
        Manage Notifications
      </h2>

      <div className="bg-white rounded-lg p-6">
        {loading && (
          <p className="text-sm text-gray-500 mb-4">Loading...</p>
        )}

        <div>
          {notificationTypes.map((notif, index) => {
            const Icon = notif.icon;
            const isEnabled = notifications?.[notif.id];

            return (
              <div
                key={notif.id}
                className={`flex items-center justify-between py-4 px-2 ${
                  index !== notificationTypes.length - 1
                    ? "border-b border-black"
                    : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <Icon
                      size={28}
                      className={notif.color}
                      strokeWidth={2.2}
                    />
                  </div>
                  <span className="text-lg font-semibold text-gray-800">
                    {notif.label}
                  </span>
                </div>

                {/* Toggle */}
                <button
                  onClick={() => handleToggle(notif.id)}
                  style={{
                    backgroundColor: isEnabled ? "#3b82f6" : "#cbd5e1",
                  }}
                  className="relative w-14 h-8 rounded-full transition"
                  type="button"
                >
                  <span
                    style={{
                      width: "20px",
                      height: "20px",
                      left: "4px",
                      top: "4px",
                      transform: isEnabled
                        ? "translateX(22px)"
                        : "translateX(0px)",
                    }}
                    className="absolute rounded-full bg-white shadow-sm transition"
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}