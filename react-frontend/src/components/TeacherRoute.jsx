// src/components/TeacherRoute.jsx

import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../hooks/useUser";

export default function TeacherRoute() {
  const { user } = useUser();

  return user.role === "Teacher" ? <Outlet /> : <Navigate to="/" replace />;
}
