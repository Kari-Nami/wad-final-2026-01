// src/app/api/course/route.js

import { getAuthenticatedUser, userHasRole } from "@/lib/auth";
import {
  escapeRegExp,
  serializeCourse,
  validateCourseInput,
} from "@/lib/course";
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

export async function GET(request) {
  const user = getAuthenticatedUser(request);

  if (!user) return errorResponse("Unauthorized Request", 401);

  try {
    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);

    if (userHasRole(user, USER_ROLES.STUDENT)) {
      const search = request.nextUrl.searchParams.get("search")?.trim() || "";
      const enrolledOnly =
        request.nextUrl.searchParams.get("enrolled") === "true";
      const studentId = new ObjectId(user.id);
      const match = {
        status: { $ne: COURSE_STATUSES.CANCEL },
        ...(enrolledOnly && { enrolledStudentIds: studentId }),
      };
      const pipeline = [
        { $match: match },
        {
          $lookup: {
            from: COLLECTIONS.USERS,
            localField: "teacherId",
            foreignField: "_id",
            as: "teacher",
          },
        },
        { $unwind: "$teacher" },
      ];

      if (search) {
        const searchPattern = escapeRegExp(search);
        pipeline.push({
          $match: {
            $or: [
              { name: { $regex: searchPattern, $options: "i" } },
              {
                "teacher.username": {
                  $regex: searchPattern,
                  $options: "i",
                },
              },
            ],
          },
        });
      }

      pipeline.push({ $sort: { createdAt: -1 } });
      const courses = await db
        .collection(COLLECTIONS.COURSES)
        .aggregate(pipeline)
        .toArray();

      return successResponse(
        {
          courses: courses.map((course) =>
            serializeCourse(course, {
              teacher: course.teacher,
              studentId: user.id,
            }),
          ),
        },
        200,
      );
    }

    if (!userHasRole(user, USER_ROLES.TEACHER)) {
      return errorResponse("Invalid user role", 403);
    }

    const courses = await db
      .collection(COLLECTIONS.COURSES)
      .find({ teacherId: new ObjectId(user.id) })
      .sort({ createdAt: -1 })
      .toArray();

    return successResponse(
      { courses: courses.map((course) => serializeCourse(course)) },
      200,
    );
  } catch (error) {
    printExceptionLog("GET Teacher Courses", error);
    return errorResponse("Course List Internal Error", 500);
  }
}

export async function POST(request) {
  const user = getAuthenticatedUser(request);

  if (!user) return errorResponse("Unauthorized Request", 401);
  if (!userHasRole(user, USER_ROLES.TEACHER)) {
    return errorResponse("Only Teachers can create courses", 403);
  }

  try {
    const data = await request.json();
    const validation = validateCourseInput(data);

    if (validation.error) {
      return errorResponse(validation.error, 400);
    }

    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);
    const now = new Date();
    const course = {
      ...validation.value,
      teacherId: new ObjectId(user.id),
      enrolledStudentIds: [],
      createdAt: now,
      updatedAt: now,
    };
    const result = await db
      .collection(COLLECTIONS.COURSES)
      .insertOne(course);

    return successResponse(
      { course: serializeCourse({ ...course, _id: result.insertedId }) },
      201,
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse("Invalid JSON body", 400);
    }

    printExceptionLog("POST Course", error);
    return errorResponse("Create Course Internal Error", 500);
  }
}
