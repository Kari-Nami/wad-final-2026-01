// src/pages/TeacherCourseDetailPage.jsx

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

export default function TeacherCourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadCourse = async () => {
      try {
        const data = await apiRequest(`/api/course/${courseId}`);
        if (isActive) setCourse(data.course);
      } catch (requestError) {
        if (isActive) setError(requestError.message);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadCourse();

    return () => {
      isActive = false;
    };
  }, [courseId]);

  const onUpdated = (updatedCourse) => {
    setCourse((current) => ({
      ...current,
      ...updatedCourse,
      enrolledStudents: current.enrolledStudents,
    }));
    setIsEditing(false);
  };

  const onDelete = async () => {
    setIsDeleting(true);
    setError("");

    try {
      await apiRequest(`/api/course/${courseId}`, { method: "DELETE" });
      navigate("/teacher/courses", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
      setConfirmDelete(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Button
          color="inherit"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate("/teacher/courses")}
          sx={{ mb: 3, textTransform: "none", fontWeight: 700 }}
        >
          Back to courses
        </Button>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {isLoading ? (
          <div className="flex min-h-80 items-center justify-center">
            <CircularProgress />
          </div>
        ) : !course ? (
          <section className="rounded-3xl bg-white p-10 text-center">
            <h1 className="text-xl font-semibold">Course unavailable</h1>
            <Button
              onClick={() => navigate("/teacher/courses")}
              sx={{ mt: 2, textTransform: "none" }}
            >
              Return to your courses
            </Button>
          </section>
        ) : (
          <>
            <section className="overflow-hidden rounded-3xl bg-slate-950 p-7 text-white shadow-xl shadow-slate-300/50 sm:p-10">
              <div className="flex flex-col justify-between gap-7 md:flex-row md:items-start">
                <div>
                  <Chip
                    label={course.status}
                    size="small"
                    color={STATUS_COLOR[course.status]}
                    sx={{ mb: 3, fontWeight: 800 }}
                  />
                  <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    {course.name}
                  </h1>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {course.topics.map((topic) => (
                      <span
                        key={topic}
                        className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outlined"
                    startIcon={<EditOutlinedIcon />}
                    onClick={() => setIsEditing(true)}
                    sx={{
                      color: "white",
                      borderColor: "rgba(255,255,255,.35)",
                      textTransform: "none",
                      "&:hover": { borderColor: "white" },
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteOutlineRoundedIcon />}
                    onClick={() => setConfirmDelete(true)}
                    disabled={course.enrolledCount > 0}
                    sx={{ textTransform: "none" }}
                  >
                    Delete
                  </Button>
                </div>
              </div>

              <div className="mt-9 grid gap-4 border-t border-white/10 pt-7 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400">
                    Price
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    {currency.format(course.price)}
                  </p>
                </div>
                <div>
                  <p className="flex items-center gap-1 text-xs uppercase tracking-wider text-slate-400">
                    <EventOutlinedIcon fontSize="inherit" /> Duration
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    {course.durationDays} days
                  </p>
                </div>
                <div>
                  <p className="flex items-center gap-1 text-xs uppercase tracking-wider text-slate-400">
                    <GroupOutlinedIcon fontSize="inherit" /> Enrollment
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    {course.enrolledCount} / {course.maxStudents}
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Enrollment roster
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  Enrolled Students
                </h2>
              </div>

              {course.enrolledStudents.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <PersonOutlineRoundedIcon sx={{ color: "#64748b" }} />
                  <p className="mt-3 font-semibold text-slate-800">
                    No Students enrolled yet
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    This course can be deleted while its roster is empty.
                  </p>
                </div>
              ) : (
                <div className="mt-6 divide-y divide-slate-100">
                  {course.enrolledStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <Avatar sx={{ bgcolor: "#cffafe", color: "#155e75" }}>
                        {student.username.slice(0, 1).toUpperCase()}
                      </Avatar>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {student.username}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
                          <EmailOutlinedIcon fontSize="inherit" /> {student.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {isEditing && course && (
        <CourseFormDialog
          course={course}
          onClose={() => setIsEditing(false)}
          onSaved={onUpdated}
        />
      )}

      <Dialog
        open={confirmDelete}
        onClose={isDeleting ? undefined : () => setConfirmDelete(false)}
      >
        <DialogTitle sx={{ fontWeight: 750 }}>Delete this course?</DialogTitle>
        <DialogContent>
          This permanently removes <strong>{course?.name}</strong>. Only courses
          without enrolled Students can be deleted.
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            color="inherit"
            onClick={() => setConfirmDelete(false)}
            disabled={isDeleting}
          >
            Keep course
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={onDelete}
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={17} /> : null}
          >
            {isDeleting ? "Deleting…" : "Delete course"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
