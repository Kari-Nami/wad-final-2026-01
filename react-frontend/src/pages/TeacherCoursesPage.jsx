// src/pages/TeacherCoursesPage.jsx

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import CourseFormDialog from "../components/CourseFormDialog";
import { apiRequest } from "../lib/api";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const STATUS_COLOR = {
  Open: "success",
  Close: "default",
  Cancel: "error",
};

export default function TeacherCoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadCourses = async () => {
      try {
        const data = await apiRequest("/api/course");
        if (isActive) setCourses(data.courses);
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
  }, []);

  const onCreated = (course) => {
    setCourses((current) => [course, ...current]);
    setIsCreating(false);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
              Teacher workspace
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Your courses
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Create classes, control availability, and review enrolled Students.
            </p>
          </div>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setIsCreating(true)}
            sx={{
              px: 2.5,
              py: 1.2,
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 750,
              bgcolor: "#0f172a",
              "&:hover": { bgcolor: "#1e293b" },
            }}
          >
            New course
          </Button>
        </div>

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
              Create your first course
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Add its duration, topics, price, capacity, and enrollment status.
            </p>
            <Button
              sx={{ mt: 3, textTransform: "none", fontWeight: 700 }}
              onClick={() => setIsCreating(true)}
            >
              Create course
            </Button>
          </section>
        ) : (
          <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <article
                key={course.id}
                className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/70"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <MenuBookOutlinedIcon />
                  </span>
                  <Chip
                    size="small"
                    color={STATUS_COLOR[course.status]}
                    label={course.status}
                    variant={course.status === "Close" ? "outlined" : "filled"}
                    sx={{ fontWeight: 700 }}
                  />
                </div>

                <h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">
                  {course.name}
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {course.topics.slice(0, 3).map((topic) => (
                    <span
                      key={topic}
                      className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800"
                    >
                      {topic}
                    </span>
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-slate-500">
                  <span className="flex items-center gap-2">
                    <EventOutlinedIcon fontSize="small" />
                    {course.durationDays} days
                  </span>
                  <span className="flex items-center gap-2">
                    <GroupOutlinedIcon fontSize="small" />
                    {course.enrolledCount}/{course.maxStudents}
                  </span>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                  <span className="font-semibold text-slate-900">
                    {currency.format(course.price)}
                  </span>
                  <Button
                    endIcon={<ArrowForwardRoundedIcon />}
                    onClick={() => navigate(`/teacher/courses/${course.id}`)}
                    sx={{ textTransform: "none", fontWeight: 700 }}
                  >
                    View details
                  </Button>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>

      {isCreating && (
        <CourseFormDialog
          onClose={() => setIsCreating(false)}
          onSaved={onCreated}
        />
      )}
    </div>
  );
}
