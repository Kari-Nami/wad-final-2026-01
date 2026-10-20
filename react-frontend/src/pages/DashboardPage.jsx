// src/pages/DashboardPage.jsx

import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, isSubmitting, authError, logout } = useUser();

  const onLogout = async () => {
    if (await logout()) {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-cyan-300">
              <SchoolOutlinedIcon fontSize="small" />
            </span>
            <div>
              <p className="font-semibold tracking-tight text-slate-950">
                CourseSpace
              </p>
              <p className="text-xs text-slate-500">Online Course Service</p>
            </div>
          </div>

          <Button
            color="inherit"
            onClick={onLogout}
            disabled={isSubmitting}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={17} />
              ) : (
                <LogoutOutlinedIcon />
              )
            }
            sx={{ textTransform: "none", fontWeight: 650 }}
          >
            Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {authError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {authError}
          </Alert>
        )}

        <section className="overflow-hidden rounded-3xl bg-slate-950 p-7 text-white shadow-xl shadow-slate-300/50 sm:p-10">
          <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
            <div>
              <Chip
                label={user.role}
                size="small"
                sx={{
                  mb: 3,
                  bgcolor: "#67e8f9",
                  color: "#0f172a",
                  fontWeight: 800,
                }}
              />
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Welcome, {user.username}.
              </h1>
              <p className="mt-3 max-w-xl text-slate-300">
                Your authentication session is active. Course management and
                enrollment tools will appear here in the next stage.
              </p>
            </div>
            <Avatar
              sx={{
                width: 72,
                height: 72,
                bgcolor: "#22d3ee",
                color: "#0f172a",
                fontSize: 28,
                fontWeight: 800,
              }}
            >
              {user.username.slice(0, 1).toUpperCase()}
            </Avatar>
          </div>
        </section>

        <section className="mt-6 grid gap-6 md:grid-cols-[1fr_1.5fr]">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Signed-in account
            </p>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-slate-500">Username</dt>
                <dd className="mt-1 font-semibold text-slate-900">
                  {user.username}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Email</dt>
                <dd className="mt-1 font-semibold text-slate-900">
                  {user.email}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Role</dt>
                <dd className="mt-1 font-semibold text-slate-900">
                  {user.role}
                </dd>
              </div>
            </dl>
          </article>

          <article className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
              <MenuBookOutlinedIcon />
            </span>
            <h2 className="mt-5 text-xl font-semibold text-slate-900">
              {user.role === "Teacher"
                ? "Teacher course management"
                : "Student course catalog"}
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              This area confirms that role-based rendering works. The course
              features will be connected after their backend rules are ready.
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}
