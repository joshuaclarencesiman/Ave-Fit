import { useEffect, useState } from "react";
<<<<<<< HEAD
import { createNotificationsApi } from "../../services/notificationsApi";
=======
import api from "../../services/api";
>>>>>>> origin/master

/**
 * Admin notification badge count. Re-fetches whenever `key` changes
 * (the layouts pass the current pathname) so the badge stays fresh as
 * the admin moves between pages.
 */
<<<<<<< HEAD
export default function useUnreadCount(key, audience = "admin") {
=======
export default function useUnreadCount(key) {
>>>>>>> origin/master
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
<<<<<<< HEAD
    createNotificationsApi(audience)
      .get("/unread-count")
      .then((res) => {
        if (active) setCount(res.data.count ?? 0);
      })
      .catch((err) => {
        console.error("Unread notification count fetch failed:", err.message);
      });
    return () => {
      active = false;
    };
  }, [key, audience]);
=======
    api
      .get("/notifications/unread-count")
      .then((res) => {
        if (active) setCount(res.data.count ?? 0);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [key]);
>>>>>>> origin/master

  return count;
}
