import { createContext, useContext, useState, useEffect } from "react";

const UserAuthContext = createContext(null);

export function UserAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // JWTs are session credentials; keep them out of persistent localStorage.
    // Migrate older AveFit builds once, then remove the persistent token.
    let savedToken = sessionStorage.getItem("avefit_user_token");
    const legacyToken = localStorage.getItem("avefit_user_token");
    if (!savedToken && legacyToken) {
      savedToken = legacyToken;
      sessionStorage.setItem("avefit_user_token", legacyToken);
      sessionStorage.removeItem("avefit_user_token");
    }
    const savedUser = localStorage.getItem("avefit_user");
    if (savedToken && savedUser) {
      try { setToken(savedToken); setUser(JSON.parse(savedUser)); }
      catch { sessionStorage.removeItem("avefit_user_token"); localStorage.removeItem("avefit_user"); }
    }
    setLoading(false);
  }, []);

  const loginUser = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    sessionStorage.setItem("avefit_user_token", userToken);
    localStorage.setItem("avefit_user", JSON.stringify(userData));
  };

  // Patch the cached user object without a full re-login (e.g. after onboarding completes).
  const updateUser = (patch) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...patch };
      localStorage.setItem("avefit_user", JSON.stringify(next));
      return next;
    });
  };

  const logoutUser = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem("avefit_user_token");
    localStorage.removeItem("avefit_user");
  };

  return (
    <UserAuthContext.Provider value={{ user, token, loading, loginUser, updateUser, logoutUser }}>
      {children}
    </UserAuthContext.Provider>
  );
}

export const useUserAuth = () => useContext(UserAuthContext);