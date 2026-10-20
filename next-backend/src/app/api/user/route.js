//src/app/api/user/route.js

/**
 * User API endpoints go here
 */
// src/app/api/user/route.js

import { getAuthenticatedUser, userHasRole } from "@/lib/auth";
import { COLLECTIONS, USER_ROLES } from "@/lib/constant";
import { getClientPromise } from "@/lib/mongodb";
import {
  errorResponse,
  optionsResponse,
  printExceptionLog,
  successResponse,
} from "@/lib/utils";

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(request) {
  const user = getAuthenticatedUser(request);

  if (!user) return errorResponse("Unauthorized Request", 401);
  if (!userHasRole(user, USER_ROLES.TEACHER)) {
    return errorResponse("Teacher access required", 403);
  }

  try {
    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);
    const students = await db
      .collection(COLLECTIONS.USERS)
      .find(
        { role: USER_ROLES.STUDENT },
        { projection: { username: 1, email: 1, role: 1 } },
      )
      .sort({ username: 1 })
      .toArray();

    return successResponse(
      {
        users: students.map((student) => ({
          id: student._id.toString(),
          username: student.username,
          email: student.email,
          role: student.role,
        })),
      },
      200,
    );
  } catch (error) {
    printExceptionLog("GET Student Directory", error);
    return errorResponse("User List Internal Error", 500);
  }
}
