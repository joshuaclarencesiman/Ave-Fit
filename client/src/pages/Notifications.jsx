import { useEffect, useState } from "react";
import { Bell, CheckCheck, Trash2, Circle } from "lucide-react";
import api from "../services/api";

const typeColors = {
  workout: "bg-green-100 text-green-600",
  membership: "bg-orange-100 text-orange-600",
  payment: "bg-orange-100 text-orange-600",
  alert: "bg-red-100 text-red-600",
  general: "bg-slate-100 text-slate-600",
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [fetchError, setFetchError] = useState("");

  const fetchNotifications = () => {
    setLoading(true);
    setFetchError("");
    api.get("/notifications")
      .then((res) => setNotifications(res.data.data))
      .catch((err) => {
        console.error(err);
        setFetchError(err.response?.data?.message || err.message || "Couldn't load notifications.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications((prev) =>
      prev.map((n) => n.notification_id === id ? { ...n, is_read: true } : n)
    );
  };

  const handleMarkAllRead = async () => {
    await api.put("/notifications/mark-all-read");
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleDelete = async (id) => {
    await api.delete(`/notifications/${id}`);
    setNotifications((prev) => prev.filter((n) => n.notification_id !== id));
  };

  const filtered = notifications.filter((n) => {
    if (filter === "Unread") return !n.is_read;
    if (filter === "Read") return n.is_read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6">
      {fetchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          ⚠️ {fetchError}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Notifications</h1>
          <p className="text-slate-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-medium transition text-sm"
          >
            <CheckCheck size={16} />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {["All", "Unread", "Read"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === f ? "bg-orange-600 text-white" : "bg-white text-slate-600 shadow-sm hover:bg-slate-50"
            }`}
          >
            {f}
            {f === "Unread" && unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Bell size={40} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-400 font-medium">No notifications found.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((notif) => (
              <div
                key={notif.notification_id}
                className={`flex items-start gap-4 px-6 py-4 transition hover:bg-slate-50 ${
                  !notif.is_read ? "bg-orange-50/40" : ""
                }`}
              >
                {/* Type badge */}
                <div className={`mt-1 p-2 rounded-lg flex-shrink-0 ${typeColors[notif.notification_type] || typeColors.general}`}>
                  <Bell size={16} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {!notif.is_read && (
                      <Circle size={8} className="fill-orange-500 text-orange-500 flex-shrink-0" />
                    )}
                    <p className={`text-sm ${!notif.is_read ? "font-semibold text-slate-800" : "text-slate-600"}`}>
                      {notif.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    {notif.user_name && (
                      <span className="text-xs text-slate-400">{notif.user_name}</span>
                    )}
                    {notif.notification_type && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[notif.notification_type] || typeColors.general}`}>
                        {notif.notification_type}
                      </span>
                    )}
                    <span className="text-xs text-slate-400">
                      {new Date(notif.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!notif.is_read && (
                    <button
                      onClick={() => handleMarkRead(notif.notification_id)}
                      className="p-1.5 rounded-lg hover:bg-orange-100 text-orange-500 transition"
                      title="Mark as read"
                    >
                      <CheckCheck size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif.notification_id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}