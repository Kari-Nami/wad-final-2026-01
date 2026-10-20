// src/app/api/course/[course_id]/route.js

import { getAuthenticatedUser, userHasRole } from "@/lib/auth";
import { serializeCourse, validateCourseInput } from "@/lib/course";
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

function getTeacher(request) {
  const user = getAuthenticatedUser(request);

  if (!user) return { error: errorResponse("Unauthorized Request", 401) };
  if (!userHasRole(user, USER_ROLES.TEACHER)) {
    return { error: errorResponse("Teacher access required", 403) };
  }

  return { user };
}

async function getCourseId(params) {
  const { course_id: courseId } = await params;
  return ObjectId.isValid(courseId) ? new ObjectId(courseId) : null;
}

export async function GET(request, { params }) {
  const user = getAuthenticatedUser(request);
  if (!user) return errorResponse("Unauthorized Request", 401);

  const courseId = await getCourseId(params);
  if (!courseId) return errorResponse("Invalid course id", 400);

  try {
    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);

    if (userHasRole(user, USER_ROLES.STUDENT)) {
      const course = await db.collection(COLLECTIONS.COURSES).findOne({
        _id: courseId,
        status: { $ne: COURSE_STATUSES.CANCEL },
      });

      if (!course) return errorResponse("Course not found", 404);

      const teacher = await db.collection(COLLECTIONS.USERS).findOne(
        { _id: course.teacherId },
        { projection: { username: 1 } },
      );

      if (!teacher) return errorResponse("Course Teacher not found", 404);

      return successResponse(
        {
          course: serializeCourse(course, {
            teacher,
            studentId: user.id,
          }),
        },
        200,
      );
    }

    if (!userHasRole(user, USER_ROLES.TEACHER)) {
      return errorResponse("Invalid user role", 403);
    }

    const course = await db.collection(COLLECTIONS.COURSES).findOne({
      _id: courseId,
      teacherId: new ObjectId(user.id),
    });

    if (!course) return errorResponse("Course not found", 404);

    const studentIds = course.enrolledStudentIds || [];
    const students = studentIds.length
      ? await db
          .collection(COLLECTIONS.USERS)
          .find(
            { _id: { $in: studentIds } },
            { projection: { username: 1, email: 1, role: 1 } },
          )
          .toArray()
      : [];
    const enrolledStudents = students.map((student) => ({
      id: student._id.toString(),
      username: student.username,
      email: student.email,
      role: student.role,
    }));

    return successResponse(
      { course: serializeCourse(course, { enrolledStudents }) },
      200,
    );
  } catch (error) {
    printExceptionLog("GET Course", error);
    return errorResponse("Course Detail Internal Error", 500);
  }
}

export async function PUT(request, { params }) {
  const auth = getTeacher(request);
  if (auth.error) return auth.error;

  const courseId = await getCourseId(params);
  if (!courseId) return errorResponse("Invalid course id", 400);

  try {
    const data = await request.json();
    const validation = validateCourseInput(data);

    if (validation.error) {
      return errorResponse(validation.error, 400);
    }

    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);
    const filter = {
      _id: courseId,
      teacherId: new ObjectId(auth.user.id),
    };
    const course = await db.collection(COLLECTIONS.COURSES).findOne(filter);

    if (!course) return errorResponse("Course not found", 404);

    const enrolledCount = course.enrolledStudentIds?.length || 0;
    if (validation.value.maxStudents < enrolledCount) {
      return errorResponse(
        "Max Student cannot be lower than the current enrollment",
        409,
      );
    }

    const updatedAt = new Date();
    const updateResult = await db.collection(COLLECTIONS.COURSES).updateOne(
      {
        ...filter,
        $expr: {
          $lte: [
            { $size: { $ifNull: ["$enrolledStudentIds", []] } },
            validation.value.maxStudents,
          ],
        },
      },
      { $set: { ...validation.value, updatedAt } },
    );

    if (!updateResult.matchedCount) {
      return errorResponse(
        "Max Student cannot be lower than the current enrollment",
        409,
      );
    }

    return successResponse(
      {
        course: serializeCourse({
          ...course,
          ...validation.value,
          updatedAt,
        }),
      },
      200,
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse("Invalid JSON body", 400);
    }

    printExceptionLog("PUT Course", error);
    return errorResponse("Update Course Internal Error", 500);
  }
}

export async function DELETE(request, { params }) {
  const auth = getTeacher(request);
  if (auth.error) return auth.error;

  const courseId = await getCourseId(params);
  if (!courseId) return errorResponse("Invalid course id", 400);

  try {
    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);
    const filter = {
      _id: courseId,
      teacherId: new ObjectId(auth.user.id),
    };
    const course = await db.collection(COLLECTIONS.COURSES).findOne(filter);

    if (!course) return errorResponse("Course not found", 404);
    if ((course.enrolledStudentIds?.length || 0) > 0) {
      return errorResponse(
        "A course with enrolled Students cannot be deleted",
        409,
      );
    }

    const result = await db.collection(COLLECTIONS.COURSES).deleteOne({
      ...filter,
      $or: [
        { enrolledStudentIds: { $exists: false } },
        { enrolledStudentIds: { $size: 0 } },
      ],
    });

    if (!result.deletedCount) {
      return errorResponse("Course could not be deleted", 409);
    }

    return successResponse({ message: "Course deleted successfully" }, 200);
  } catch (error) {
    printExceptionLog("DELETE Course", error);
    return errorResponse("Delete Course Internal Error", 500);
  }
}
