import { useCallback, useEffect, useMemo, useState } from "react";
import api, { setAccessToken } from "../services/api";
import AuthContext from "./AuthContext.js";
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const applySession = useCallback((session) => {
    setAccessToken(session?.accessToken);
    setUser(session?.user || null);
    return session?.user || null;
  }, []);

  useEffect(() => {
    let active = true;
    api.post("/api/auth/refresh").then((session) => {
      if (!active) return;
      setAccessToken(session?.accessToken);
      return api.get("/api/auth/me");
    }).then((result) => {
      if (active && result?.user) setUser(result.user);
    }).catch(() => { if (active) applySession(null); }).finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, [applySession]);

  const login = useCallback(async (email, password, role) => applySession(await api.post("/api/auth/login", { email, password, role })), [applySession]);
  const logout = useCallback(async () => {
    try { await api.post("/api/auth/logout"); } finally { applySession(null); }
  }, [applySession]);
  const value = useMemo(() => ({ user, ready, login, logout, setUser }), [user, ready, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
