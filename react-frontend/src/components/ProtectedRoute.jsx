// src/components/ProtectedRoute.jsx

import CircularProgress from "@mui/material/CircularProgress";
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../hooks/useUser";

export default function ProtectedRoute() {
  const { isInitializing, isLoggedIn } = useUser();

  if (isInitializing) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <CircularProgress size={34} />
          <p className="mt-4 text-sm font-medium text-slate-500">
            Restoring your session…
          </p>
        </div>
      </main>
    );
  }

  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
}
