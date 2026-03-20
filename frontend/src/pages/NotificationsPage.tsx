import { useEffect, useState } from "react";
import { EmptyState } from "../components/common/EmptyState";
import { PageTitle } from "../components/common/PageTitle";
import { getNotifications } from "../services/api";
import type { Notification } from "../types";

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    getNotifications().then(setNotifications).catch(() => setNotifications([]));
  }, []);

  return (
    <div className="space-y-4">
      <PageTitle title="Notifications" subtitle="Likes, collaboration requests, challenge wins, and updates." />
      {notifications.length === 0 ? (
        <EmptyState title="No notifications" description="Activity notifications will appear here." />
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <article key={item.id} className="panel p-4">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="mt-1 text-xs text-muted">{item.message}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
