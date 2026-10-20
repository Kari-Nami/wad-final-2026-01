//src/app/api/user/[user_id]/route.js

/**
 * Specific user id endpoints go here
 */
// src/app/api/user/[user_id]/route.js

import { getAuthenticatedUser, userHasRole } from "@/lib/auth";
import { COLLECTIONS, USER_ROLES } from "@/lib/constant";
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

export async function GET(request, { params }) {
  const user = getAuthenticatedUser(request);
  if (!user) return errorResponse("Unauthorized Request", 401);

  const { user_id: userIdValue } = await params;
  if (!ObjectId.isValid(userIdValue)) {
    return errorResponse("Invalid user id", 400);
  }

  try {
    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);
    const profile = await db.collection(COLLECTIONS.USERS).findOne(
      { _id: new ObjectId(userIdValue) },
      { projection: { username: 1, email: 1, role: 1 } },
    );

    if (!profile) return errorResponse("User not found", 404);

    const isOwnProfile = user.id === userIdValue;
    const isTeacherViewingStudent =
      userHasRole(user, USER_ROLES.TEACHER) &&
      profile.role === USER_ROLES.STUDENT;

    if (!isOwnProfile && !isTeacherViewingStudent) {
      return errorResponse("Forbidden Request", 403);
    }

    return successResponse(
      {
        user: {
          id: profile._id.toString(),
          username: profile.username,
          email: profile.email,
          role: profile.role,
        },
      },
      200,
    );
  } catch (error) {
    printExceptionLog("GET User", error);
    return errorResponse("User Detail Internal Error", 500);
  }
}
