// src/components/StudentCourseCard.jsx

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import { useNavigate } from "react-router-dom";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const STATUS_COLOR = {
  Open: "success",
  Close: "default",
};

export default function StudentCourseCard({ course }) {
  const navigate = useNavigate();

  return (
    <article className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/70">
      <div className="flex items-start justify-between gap-3">
        <Chip
          size="small"
          color={STATUS_COLOR[course.status]}
          label={course.status}
          variant={course.status === "Close" ? "outlined" : "filled"}
          sx={{ fontWeight: 700 }}
        />
        {course.isEnrolled && (
          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
            Enrolled
          </span>
        )}
      </div>

      <h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">
        {course.name}
      </h2>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
        <PersonOutlineRoundedIcon fontSize="small" />
        Teacher {course.teacher.username}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
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
          {course.seatsRemaining} seats left
        </span>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
        <span className="font-semibold text-slate-900">
          {currency.format(course.price)}
        </span>
        <Button
          endIcon={<ArrowForwardRoundedIcon />}
          onClick={() => navigate(`/student/courses/${course.id}`)}
          sx={{ textTransform: "none", fontWeight: 700 }}
        >
          View course
        </Button>
      </div>
    </article>
  );
}
