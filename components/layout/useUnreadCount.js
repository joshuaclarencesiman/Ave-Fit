import { useEffect, useState } from "react";
import api from "../../services/api";

/**
 * Admin notification badge count. Re-fetches whenever `key` changes
 * (the layouts pass the current pathname) so the badge stays fresh as
 * the admin moves between pages.
 */
export default function useUnreadCount(key) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
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

  return count;
}
