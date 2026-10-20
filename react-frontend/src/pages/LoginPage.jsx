// src/pages/LoginPage.jsx

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import { useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";

export default function LoginPage() {
  const identifier = useRef(null);
  const password = useRef(null);
  const navigate = useNavigate();
  const {
    isLoggedIn,
    isInitializing,
    isSubmitting,
    authError,
    login,
  } = useUser();

  if (isInitializing) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <CircularProgress size={34} />
      </main>
    );
  }

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (event) => {
    event.preventDefault();

    const loggedIn = await login(
      identifier.current.value.trim(),
      password.current.value,
    );

    if (loggedIn) {
      navigate("/", { replace: true });
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:flex lg:items-center lg:py-12">
      <section className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-300/50 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative hidden min-h-[640px] overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-indigo-500/30 blur-3xl" />

          <div className="relative flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950">
              <SchoolOutlinedIcon />
            </span>
            <span className="text-lg font-semibold tracking-tight">
              CourseSpace
            </span>
          </div>

          <div className="relative max-w-md">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Online learning service
            </p>
            <h1 className="text-5xl font-semibold leading-[1.08] tracking-tight">
              Learn and teach from one shared space.
            </h1>
            <p className="mt-6 text-base leading-7 text-slate-300">
              Sign in to browse courses, manage classes, and keep your learning
              journey moving.
            </p>
          </div>

          <p className="relative text-sm text-slate-400">
            CSX4107 Web Application Development
          </p>
        </div>

        <div className="flex min-h-[620px] items-center p-7 sm:p-12 lg:p-14">
          <div className="w-full">
            <div className="mb-9 lg:hidden">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-cyan-300">
                <SchoolOutlinedIcon />
              </span>
            </div>

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Welcome back
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Sign in to your account
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Use your username or email address and password.
            </p>

            <form className="mt-8 space-y-5" onSubmit={onSubmit}>
              {authError && <Alert severity="error">{authError}</Alert>}

              <TextField
                required
                fullWidth
                autoFocus
                id="identifier"
                name="identifier"
                label="Username or email"
                autoComplete="username"
                inputRef={identifier}
                disabled={isSubmitting}
              />
              <TextField
                required
                fullWidth
                id="password"
                name="password"
                type="password"
                label="Password"
                autoComplete="current-password"
                inputRef={password}
                disabled={isSubmitting}
              />
              <Button
                fullWidth
                size="large"
                variant="contained"
                type="submit"
                disabled={isSubmitting}
                startIcon={
                  isSubmitting ? (
                    <CircularProgress color="inherit" size={18} />
                  ) : (
                    <LockOutlinedIcon />
                  )
                }
                sx={{
                  py: 1.4,
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 700,
                  bgcolor: "#0f172a",
                  "&:hover": { bgcolor: "#1e293b" },
                }}
              >
                {isSubmitting ? "Signing in…" : "Sign in"}
              </Button>
            </form>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">Test accounts</p>
              <p className="mt-2">
                Student: <code>student1</code> / <code>Student123!</code>
              </p>
              <p className="mt-1">
                Teacher: <code>teacher1</code> / <code>Teacher123!</code>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
