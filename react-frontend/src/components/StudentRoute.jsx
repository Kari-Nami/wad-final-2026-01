// src/components/StudentRoute.jsx

import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../hooks/useUser";

export default function StudentRoute() {
  const { user } = useUser();

  return user.role === "Student" ? <Outlet /> : <Navigate to="/" replace />;
}
