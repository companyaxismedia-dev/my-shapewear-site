// import { useAccount } from '../../hooks/useAccount';
// import { MessageCircle, Mail, Bell, Inbox } from 'lucide-react';

// const notificationTypes = [
//   { id: 'whatsapp', label: 'WhatsApp Notifications', icon: MessageCircle, color: 'text-green-500' },
//   { id: 'sms', label: 'SMS Notifications', icon: Mail, color: 'text-blue-500' },
//   { id: 'push', label: 'Push Notifications', icon: Bell, color: 'text-yellow-500' },
//   { id: 'email', label: 'Email Notifications', icon: Inbox, color: 'text-blue-600' },
// ];

// export default function ManageNotifications() {
//   const { notifications, toggleNotification } = useAccount();

//   return (
//     <div className="space-y-6">
//       <h2 className="text-3xl font-bold text-gray-900">Manage Notifications</h2>

//       <div className="space-y-4">
//         {notificationTypes.map((notif) => {
//           const Icon = notif.icon;
//           return (
//             <div
//               key={notif.id}
//               className="flex items-center justify-between bg-gray-50 p-6 rounded-lg border border-gray-200 hover:border-pink-300 transition"
//             >
//               <div className="flex items-center gap-4">
//                 <Icon size={28} className={notif.color} />
//                 <span className="font-semibold text-gray-900">{notif.label}</span>
//               </div>
//               <button
//                 onClick={() => toggleNotification(notif.id)}
//                 className={`relative w-14 h-8 rounded-full transition-colors ${
//                   notifications[notif.id] ? 'bg-pink-600' : 'bg-gray-300'
//                 }`}
//               >
//                 <span
//                   className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
//                     notifications[notif.id] ? 'translate-x-7' : 'translate-x-1'
//                   }`}
//                 />
//               </button>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }


"use client";

import { useAccount } from "@/hooks/useAccount";
import { MessageCircle, Mail, Bell, Inbox } from "lucide-react";

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

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Manage Notifications</h2>
      
      <div className="bg-white rounded-lg p-6">
        <div>
          {notificationTypes.map((notif, index) => {
            const Icon = notif.icon;
            const isEnabled = notifications && notifications[notif.id];

            return (
              <div
                key={notif.id}
                className={`flex items-center justify-between py-4 px-2 ${
                  index !== notificationTypes.length - 1 ? "border-b border-black" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                    <Icon size={28} className={notif.color} strokeWidth={2.2} />
                  </div>
                  <span className="text-lg font-semibold text-gray-800">{notif.label}</span>
                </div>

                {/* Toggle Switch */}
                <button
                  onClick={() => toggleNotification(notif.id)}
                  style={{
                    backgroundColor: isEnabled ? "#3b82f6" : "#cbd5e1",
                  }}
                  className="relative flex-shrink-0 w-14 h-8 rounded-full transition-all duration-300 ease-in-out focus:outline-none"
                  aria-pressed={isEnabled}
                  type="button"
                >
                  <span
                    style={{
                      width: "20px",
                      height: "20px",
                      left: "4px",
                      top: "4px",
                      transform: isEnabled ? "translateX(22px)" : "translateX(0px)",
                    }}
                    className="absolute rounded-full bg-white shadow-sm transition-all duration-300 ease-in-out"
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