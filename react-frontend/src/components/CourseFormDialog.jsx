// src/components/CourseFormDialog.jsx

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { apiRequest } from "../lib/api";

const EMPTY_FORM = {
  name: "",
  durationDays: "",
  topics: "",
  price: "",
  maxStudents: "",
  status: "Open",
};

function initialForm(course) {
  if (!course) return EMPTY_FORM;

  return {
    name: course.name,
    durationDays: String(course.durationDays),
    topics: course.topics.join(", "),
    price: String(course.price),
    maxStudents: String(course.maxStudents),
    status: course.status,
  };
}

export default function CourseFormDialog({ course, onClose, onSaved }) {
  const [form, setForm] = useState(() => initialForm(course));
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = Boolean(course);

  const updateField = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    const payload = {
      name: form.name.trim(),
      durationDays: Number(form.durationDays),
      topics: form.topics
        .split(",")
        .map((topic) => topic.trim())
        .filter(Boolean),
      price: Number(form.price),
      maxStudents: Number(form.maxStudents),
      status: form.status,
    };

    try {
      const data = await apiRequest(
        isEditing ? `/api/course/${course.id}` : "/api/course",
        {
          method: isEditing ? "PUT" : "POST",
          body: JSON.stringify(payload),
        },
      );
      onSaved(data.course);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open fullWidth maxWidth="sm" onClose={isSaving ? undefined : onClose}>
      <form onSubmit={onSubmit}>
        <DialogTitle sx={{ fontWeight: 750 }}>
          {isEditing ? "Edit course" : "Create a new course"}
        </DialogTitle>
        <DialogContent dividers>
          <div className="space-y-5 py-2">
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              required
              fullWidth
              autoFocus
              name="name"
              label="Course name"
              value={form.name}
              onChange={updateField}
              disabled={isSaving}
              slotProps={{ htmlInput: { maxLength: 120 } }}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                required
                fullWidth
                type="number"
                name="durationDays"
                label="Duration (days)"
                value={form.durationDays}
                onChange={updateField}
                disabled={isSaving}
                slotProps={{ htmlInput: { min: 1, step: 1 } }}
              />
              <TextField
                required
                fullWidth
                type="number"
                name="maxStudents"
                label="Max Student"
                value={form.maxStudents}
                onChange={updateField}
                disabled={isSaving}
                slotProps={{ htmlInput: { min: 1, step: 1 } }}
              />
            </div>
            <TextField
              required
              fullWidth
              name="topics"
              label="Topics"
              helperText="Separate multiple topics with commas"
              value={form.topics}
              onChange={updateField}
              disabled={isSaving}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                required
                fullWidth
                type="number"
                name="price"
                label="Price"
                value={form.price}
                onChange={updateField}
                disabled={isSaving}
                slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
              />
              <TextField
                select
                required
                fullWidth
                name="status"
                label="Status"
                value={form.status}
                onChange={updateField}
                disabled={isSaving}
              >
                <MenuItem value="Open">Open</MenuItem>
                <MenuItem value="Close">Close</MenuItem>
                <MenuItem value="Cancel">Cancel</MenuItem>
              </TextField>
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isSaving} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={17} /> : null}
            sx={{ bgcolor: "#0f172a", "&:hover": { bgcolor: "#1e293b" } }}
          >
            {isSaving ? "Saving…" : isEditing ? "Save changes" : "Create course"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
