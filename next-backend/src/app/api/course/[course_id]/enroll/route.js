// src/app/api/course/[course_id]/enroll/route.js

import { getAuthenticatedUser, userHasRole } from "@/lib/auth";
import { serializeCourse } from "@/lib/course";
import { COLLECTIONS, COURSE_STATUSES, USER_ROLES } from "@/lib/constant";
import { getClientPromise } from "@/lib/mongodb";
import {
  errorResponse,
  optionsResponse,
  printExceptionLog,
  successResponse,
} from "@/lib/utils";
import { ObjectId } from "mongodb";

export function OPTIONS() {
  return optionsResponse();
}

function enrollmentError(course, studentId) {
  if (!course || course.status === COURSE_STATUSES.CANCEL) {
    return errorResponse("Course not found", 404);
  }

  if (course.status !== COURSE_STATUSES.OPEN) {
    return errorResponse("Only Open courses accept enrollment", 409);
  }

  if (
    course.enrolledStudentIds?.some(
      (enrolledId) => enrolledId.toString() === studentId.toString(),
    )
  ) {
    return errorResponse("You are already enrolled in this course", 409);
  }

  if ((course.enrolledStudentIds?.length || 0) >= course.maxStudents) {
    return errorResponse("This course is full", 409);
  }

  return errorResponse("Enrollment could not be completed", 409);
}

export async function POST(request, { params }) {
  const user = getAuthenticatedUser(request);

  if (!user) return errorResponse("Unauthorized Request", 401);
  if (!userHasRole(user, USER_ROLES.STUDENT)) {
    return errorResponse("Only Students can enroll in courses", 403);
  }

  const { course_id: courseIdValue } = await params;
  if (!ObjectId.isValid(courseIdValue)) {
    return errorResponse("Invalid course id", 400);
  }

  try {
    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);
    const courseId = new ObjectId(courseIdValue);
    const studentId = new ObjectId(user.id);
    const result = await db.collection(COLLECTIONS.COURSES).updateOne(
      {
        _id: courseId,
        status: COURSE_STATUSES.OPEN,
        enrolledStudentIds: { $ne: studentId },
        $expr: {
          $lt: [
            { $size: { $ifNull: ["$enrolledStudentIds", []] } },
            "$maxStudents",
          ],
        },
      },
      {
        $addToSet: { enrolledStudentIds: studentId },
        $set: { updatedAt: new Date() },
      },
    );

    if (!result.modifiedCount) {
      const course = await db
        .collection(COLLECTIONS.COURSES)
        .findOne({ _id: courseId });
      return enrollmentError(course, studentId);
    }

    const course = await db
      .collection(COLLECTIONS.COURSES)
      .findOne({ _id: courseId });
    const teacher = await db.collection(COLLECTIONS.USERS).findOne(
      { _id: course.teacherId },
      { projection: { username: 1 } },
    );

    return successResponse(
      {
        message: "Enrollment successful",
        course: serializeCourse(course, {
          teacher,
          studentId: user.id,
        }),
      },
      200,
    );
  } catch (error) {
    printExceptionLog("POST Course Enrollment", error);
    return errorResponse("Enrollment Internal Error", 500);
  }
}
