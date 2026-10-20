// src/pages/StudentCoursesPage.jsx

import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import StudentCourseCard from "../components/StudentCourseCard";
import { apiRequest } from "../lib/api";

export default function StudentCoursesPage({ enrolledOnly = false }) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadCourses = async () => {
      try {
        const query = new URLSearchParams();
        if (enrolledOnly) query.set("enrolled", "true");
        if (activeSearch && !enrolledOnly) query.set("search", activeSearch);
        const queryString = query.toString();
        const data = await apiRequest(
          `/api/course${queryString ? `?${queryString}` : ""}`,
        );

        if (isActive) {
          setCourses(data.courses);
          setError("");
        }
      } catch (requestError) {
        if (isActive) setError(requestError.message);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadCourses();

    return () => {
      isActive = false;
    };
  }, [activeSearch, enrolledOnly]);

  const onSearch = (event) => {
    event.preventDefault();
    setIsLoading(true);
    setActiveSearch(searchText.trim());
  };

  const switchPage = (path) => {
    setIsLoading(true);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
              Student workspace
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              {enrolledOnly ? "My Courses" : "Course catalog"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              {enrolledOnly
                ? "Review every active course in which you are enrolled."
                : "Explore available classes and find courses by course or Teacher name."}
            </p>
          </div>
          <div className="flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
            <Button
              variant={enrolledOnly ? "text" : "contained"}
              onClick={() => switchPage("/student/courses")}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
            >
              Browse
            </Button>
            <Button
              variant={enrolledOnly ? "contained" : "text"}
              onClick={() => switchPage("/student/my-courses")}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
            >
              My Courses
            </Button>
          </div>
        </div>

        {!enrolledOnly && (
          <form
            className="mt-8 flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row"
            onSubmit={onSearch}
          >
            <TextField
              fullWidth
              size="small"
              label="Search course or Teacher"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              disabled={isLoading}
            />
            <Button
              type="submit"
              variant="contained"
              startIcon={<SearchRoundedIcon />}
              disabled={isLoading}
              sx={{
                px: 3,
                textTransform: "none",
                fontWeight: 750,
                bgcolor: "#0f172a",
                "&:hover": { bgcolor: "#1e293b" },
              }}
            >
              Search
            </Button>
          </form>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 4 }}>
            {error}
          </Alert>
        )}

        {isLoading ? (
          <div className="flex min-h-80 items-center justify-center">
            <CircularProgress />
          </div>
        ) : courses.length === 0 ? (
          <section className="mt-8 flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
              <MenuBookOutlinedIcon />
            </span>
            <h2 className="mt-5 text-xl font-semibold text-slate-900">
              {enrolledOnly ? "No enrolled courses yet" : "No courses found"}
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              {enrolledOnly
                ? "Browse the catalog and enroll in an Open course to see it here."
                : "Try another course or Teacher name."}
            </p>
            {enrolledOnly && (
              <Button
                onClick={() => navigate("/student/courses")}
                sx={{ mt: 3, textTransform: "none", fontWeight: 700 }}
              >
                Browse courses
              </Button>
            )}
          </section>
        ) : (
          <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <StudentCourseCard key={course.id} course={course} />
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
