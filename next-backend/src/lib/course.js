// src/lib/course.js

import { COURSE_STATUSES } from "./constant";

const COURSE_NAME_MAX_LENGTH = 120;
const TOPIC_MAX_LENGTH = 80;
const MAX_TOPICS = 20;

export function validateCourseInput(data) {
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const durationDays = Number(data.durationDays);
  const price = Number(data.price);
  const maxStudents = Number(data.maxStudents);
  const status = data.status;
  const topics = Array.isArray(data.topics)
    ? [...new Set(data.topics.map((topic) => String(topic).trim()))].filter(
        Boolean,
      )
    : [];

  if (!name || name.length > COURSE_NAME_MAX_LENGTH) {
    return {
      error: `Course name is required and must not exceed ${COURSE_NAME_MAX_LENGTH} characters`,
    };
  }

  if (!Number.isInteger(durationDays) || durationDays < 1) {
    return { error: "Duration must be a positive whole number of days" };
  }

  if (topics.length < 1 || topics.length > MAX_TOPICS) {
    return { error: `Provide between 1 and ${MAX_TOPICS} topics` };
  }

  if (topics.some((topic) => topic.length > TOPIC_MAX_LENGTH)) {
    return {
      error: `Each topic must not exceed ${TOPIC_MAX_LENGTH} characters`,
    };
  }

  if (!Number.isFinite(price) || price < 0) {
    return { error: "Price must be zero or greater" };
  }

  if (!Number.isInteger(maxStudents) || maxStudents < 1) {
    return { error: "Max Student must be a positive whole number" };
  }

  if (!Object.values(COURSE_STATUSES).includes(status)) {
    return { error: "Status must be Open, Close, or Cancel" };
  }

  return {
    value: {
      name,
      durationDays,
      topics,
      price,
      maxStudents,
      status,
    },
  };
}

export function serializeCourse(course, options = {}) {
  const output = {
    id: course._id.toString(),
    name: course.name,
    durationDays: course.durationDays,
    topics: course.topics,
    price: course.price,
    maxStudents: course.maxStudents,
    status: course.status,
    teacherId: course.teacherId.toString(),
    enrolledCount: course.enrolledStudentIds?.length || 0,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  };

  if (options.enrolledStudents) {
    output.enrolledStudents = options.enrolledStudents;
  }

  if (options.teacher) {
    output.teacher = {
      id: options.teacher._id.toString(),
      username: options.teacher.username,
    };
  }

  if (options.studentId) {
    output.isEnrolled = Boolean(
      course.enrolledStudentIds?.some(
        (id) => id.toString() === options.studentId,
      ),
    );
    output.seatsRemaining = Math.max(
      course.maxStudents - output.enrolledCount,
      0,
    );
  }

  return output;
}

export function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
