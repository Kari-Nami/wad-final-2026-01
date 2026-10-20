// src/components/AppHeader.jsx

import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";

export default function AppHeader() {
  const navigate = useNavigate();
  const { isSubmitting, authError, logout } = useUser();

  const onLogout = async () => {
    if (await logout()) {
      navigate("/login", { replace: true });
    }
  };

  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button
            className="flex cursor-pointer items-center gap-3 border-0 bg-transparent p-0 text-left"
            type="button"
            onClick={() => navigate("/")}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-cyan-300">
              <SchoolOutlinedIcon fontSize="small" />
            </span>
            <span>
              <span className="block font-semibold tracking-tight text-slate-950">
                CourseSpace
              </span>
              <span className="block text-xs text-slate-500">
                Online Course Service
              </span>
            </span>
          </button>

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
      {authError && (
        <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 lg:px-8">
          <Alert severity="error">{authError}</Alert>
        </div>
      )}
    </>
  );
}
