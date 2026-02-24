import { useAccount } from '../../hooks/useAccount';
import { MessageCircle, Mail, Bell, Inbox } from 'lucide-react';

const notificationTypes = [
  { id: 'whatsapp', label: 'WhatsApp Notifications', icon: MessageCircle, color: 'text-green-500' },
  { id: 'sms', label: 'SMS Notifications', icon: Mail, color: 'text-blue-500' },
  { id: 'push', label: 'Push Notifications', icon: Bell, color: 'text-yellow-500' },
  { id: 'email', label: 'Email Notifications', icon: Inbox, color: 'text-blue-600' },
];

export default function ManageNotifications() {
  const { notifications, toggleNotification } = useAccount();

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Manage Notifications</h2>

      <div className="space-y-4">
        {notificationTypes.map((notif) => {
          const Icon = notif.icon;
          return (
            <div
              key={notif.id}
              className="flex items-center justify-between bg-gray-50 p-6 rounded-lg border border-gray-200 hover:border-pink-300 transition"
            >
              <div className="flex items-center gap-4">
                <Icon size={28} className={notif.color} />
                <span className="font-semibold text-gray-900">{notif.label}</span>
              </div>
              <button
                onClick={() => toggleNotification(notif.id)}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  notifications[notif.id] ? 'bg-pink-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    notifications[notif.id] ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
