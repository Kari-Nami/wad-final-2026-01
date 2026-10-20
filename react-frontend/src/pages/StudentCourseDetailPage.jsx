// src/pages/StudentCourseDetailPage.jsx

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import Alert from "@mui/material/Alert";
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
import { apiRequest } from "../lib/api";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function StudentCourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [confirmEnroll, setConfirmEnroll] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const onEnroll = async () => {
    setIsEnrolling(true);
    setError("");

    try {
      const data = await apiRequest(`/api/course/${courseId}/enroll`, {
        method: "POST",
      });
      setCourse(data.course);
      setSuccess(data.message);
      setConfirmEnroll(false);
    } catch (requestError) {
      setError(requestError.message);
      setConfirmEnroll(false);
    } finally {
      setIsEnrolling(false);
    }
  };

  const enrollLabel = () => {
    if (course.isEnrolled) return "Already enrolled";
    if (course.status !== "Open") return "Enrollment closed";
    if (course.seatsRemaining < 1) return "Course full";
    return "Enroll now";
  };

  const canEnroll =
    course &&
    !course.isEnrolled &&
    course.status === "Open" &&
    course.seatsRemaining > 0;

  return (
    <div className="min-h-screen bg-slate-100">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Button
          color="inherit"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate("/student/courses")}
          sx={{ mb: 3, textTransform: "none", fontWeight: 700 }}
        >
          Back to catalog
        </Button>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {isLoading ? (
          <div className="flex min-h-80 items-center justify-center">
            <CircularProgress />
          </div>
        ) : !course ? (
          <section className="rounded-3xl bg-white p-10 text-center">
            <h1 className="text-xl font-semibold">Course unavailable</h1>
            <p className="mt-2 text-sm text-slate-500">
              It may have been cancelled or removed.
            </p>
          </section>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.5fr_0.75fr]">
            <section className="rounded-3xl bg-slate-950 p-7 text-white shadow-xl shadow-slate-300/50 sm:p-10">
              <div className="flex flex-wrap items-center gap-2">
                <Chip
                  label={course.status}
                  color={course.status === "Open" ? "success" : "default"}
                  size="small"
                  sx={{ fontWeight: 800 }}
                />
                {course.isEnrolled && (
                  <Chip
                    icon={<CheckCircleOutlineRoundedIcon />}
                    label="Enrolled"
                    size="small"
                    sx={{ bgcolor: "#e0e7ff", color: "#3730a3" }}
                  />
                )}
              </div>

              <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                {course.name}
              </h1>
              <p className="mt-4 flex items-center gap-2 text-slate-300">
                <PersonOutlineRoundedIcon />
                Taught by {course.teacher.username}
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {course.topics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-slate-200"
                  >
                    {topic}
                  </span>
                ))}
              </div>

              <div className="mt-10 grid gap-5 border-t border-white/10 pt-7 sm:grid-cols-2">
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
                    <GroupOutlinedIcon fontSize="inherit" /> Class size
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    {course.enrolledCount} / {course.maxStudents} enrolled
                  </p>
                </div>
              </div>
            </section>

            <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Course price</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
                {currency.format(course.price)}
              </p>
              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-800">
                  {course.seatsRemaining} seats remaining
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Enrollment is available only while this course is Open and
                  space remains.
                </p>
              </div>
              <Button
                fullWidth
                size="large"
                variant="contained"
                disabled={!canEnroll}
                onClick={() => setConfirmEnroll(true)}
                sx={{
                  mt: 5,
                  py: 1.3,
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 750,
                  bgcolor: "#0f172a",
                  "&:hover": { bgcolor: "#1e293b" },
                }}
              >
                {enrollLabel()}
              </Button>
            </aside>
          </div>
        )}
      </main>

      <Dialog
        open={confirmEnroll}
        onClose={isEnrolling ? undefined : () => setConfirmEnroll(false)}
      >
        <DialogTitle sx={{ fontWeight: 750 }}>Confirm enrollment</DialogTitle>
        <DialogContent>
          Enroll in <strong>{course?.name}</strong> with Teacher {" "}
          <strong>{course?.teacher.username}</strong>?
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            color="inherit"
            onClick={() => setConfirmEnroll(false)}
            disabled={isEnrolling}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={onEnroll}
            disabled={isEnrolling}
            startIcon={isEnrolling ? <CircularProgress size={17} /> : null}
          >
            {isEnrolling ? "Enrolling…" : "Confirm enrollment"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
