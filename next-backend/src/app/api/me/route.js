// src/app/api/me/route.js

import { verifyJWT } from "@/lib/auth";
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
  const session = verifyJWT(request);

  if (!session || !ObjectId.isValid(session.id)) {
    return errorResponse("Unauthorized Request", 401);
  }

  try {
    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);
    const user = await db.collection("user").findOne(
      { _id: new ObjectId(session.id) },
      { projection: { password: 0 } },
    );

    if (!user) {
      return errorResponse("Unauthorized Request", 401);
    }

    return successResponse(
      {
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
      200,
    );
  } catch (error) {
    printExceptionLog("GET Me", error);
    return errorResponse("User Session Internal Error", 500);
  }
}
