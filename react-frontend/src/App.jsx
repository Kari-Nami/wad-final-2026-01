// src/App.jsx

import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentRoute from "./components/StudentRoute";
import TeacherRoute from "./components/TeacherRoute";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import StudentCourseDetailPage from "./pages/StudentCourseDetailPage";
import StudentCoursesPage from "./pages/StudentCoursesPage";
import TeacherCourseDetailPage from "./pages/TeacherCourseDetailPage";
import TeacherCoursesPage from "./pages/TeacherCoursesPage";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route element={<TeacherRoute />}>
            <Route path="/teacher/courses" element={<TeacherCoursesPage />} />
            <Route
              path="/teacher/courses/:courseId"
              element={<TeacherCourseDetailPage />}
            />
          </Route>
          <Route element={<StudentRoute />}>
            <Route
              path="/student/courses"
              element={<StudentCoursesPage />}
            />
            <Route
              path="/student/my-courses"
              element={<StudentCoursesPage enrolledOnly />}
            />
            <Route
              path="/student/courses/:courseId"
              element={<StudentCourseDetailPage />}
            />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
