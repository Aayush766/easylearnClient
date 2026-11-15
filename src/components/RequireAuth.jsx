import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../context/useAuth";

export default function RequireAuth({ roles, children }) {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <div role="status" aria-live="polite">Loading your secure workspace…</div>;
  if (!user) return <Navigate to="/login/student" replace state={{ from: location }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to={user.role === "TRAINER" ? "/trainer" : "/student"} replace />;
  return children;
}
