"use client";

import { CheckCircle, Circle, XCircle } from "lucide-react";

export default function TrackingTimeline({
  events = [],
  currentStatus,
}) {
  const sortedEvents = [...events].sort(
    (a, b) =>
      new Date(b.timestamp || b.createdAt).getTime() -
      new Date(a.timestamp || a.createdAt).getTime()
  );

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case "cancelled":
        return <XCircle className="w-8 h-8 text-red-600" />;
      default:
        return <Circle className="w-8 h-8 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "text-green-600";
      case "cancelled":
        return "text-red-600";
      case "shipped":
      case "on-the-way":
        return "text-blue-600";
      case "returned":
        return "text-orange-600";
      case "processing":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  if (!sortedEvents.length) {
    return (
      <p className="text-sm text-gray-500">
        No tracking updates yet
      </p>
    );
  }

  return (
    <div className="relative">
      <div className="space-y-0">
        {sortedEvents.map((event, index) => {
          const isLast = index === sortedEvents.length - 1;

          const status =
            event.status || event.title || "processing";

          const date =
            event.timestamp || event.createdAt || new Date();

          return (
            <div key={index} className="flex gap-6 pb-6">
              {/* LEFT DOT */}
              <div className="flex flex-col items-center">
                {getStatusIcon(status)}
                {!isLast && (
                  <div className="w-1 h-16 bg-gray-300 mt-2"></div>
                )}
              </div>

              {/* RIGHT CONTENT */}
              <div className="flex-1 pt-1">
                <p className={`font-semibold ${getStatusColor(status)}`}>
                  {status.charAt(0).toUpperCase() +
                    status.slice(1).replace("-", " ")}
                </p>

                <p className="text-gray-600 text-sm mt-1">
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  {" at "}
                  {new Date(date).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>

                {event.location && (
                  <p className="text-gray-500 text-sm mt-1">
                    {event.location}
                  </p>
                )}

                {event.description && (
                  <p className="text-gray-700 text-sm mt-2">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}