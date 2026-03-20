import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/common/EmptyState";
import { PageTitle } from "../components/common/PageTitle";
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "../services/api";
import type { Notification } from "../types";

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadNotifications = () => getNotifications().then(setNotifications).catch(() => setNotifications([]));

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    const handleChanged = () => loadNotifications();
    window.addEventListener("buildspace:notifications-changed", handleChanged);
    return () => window.removeEventListener("buildspace:notifications-changed", handleChanged);
  }, []);

  const unreadCount = notifications.filter((entry) => !entry.isRead).length;

  return (
    <div className="space-y-4">
      <PageTitle title="Notifications" subtitle="Likes, collaboration requests, challenge wins, and updates." />
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">{unreadCount} unread</p>
        <button
          className="btn-secondary"
          onClick={async () => {
            await markAllNotificationsAsRead();
            await loadNotifications();
          }}
          disabled={notifications.length === 0 || unreadCount === 0}
        >
          Mark all as read
        </button>
      </div>
      {notifications.length === 0 ? (
        <EmptyState title="No notifications" description="Activity notifications will appear here." />
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <article key={item.id} className={`panel p-4 ${item.isRead ? "opacity-80" : "border-accent/45"}`}>
              <p className="text-sm font-medium">{item.title}</p>
              <p className="mt-1 text-xs text-muted">{item.message}</p>
              <div className="mt-3 flex items-center gap-2">
                {item.link && (
                  <Link to={item.link} className="btn-secondary px-3 py-1.5 text-xs">
                    View
                  </Link>
                )}
                {!item.isRead && (
                  <button
                    className="btn-secondary px-3 py-1.5 text-xs"
                    onClick={async () => {
                      await markNotificationAsRead(item.id);
                      await loadNotifications();
                    }}
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
