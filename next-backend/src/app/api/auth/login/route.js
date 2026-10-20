// src/app/api/auth/login/route.js

import { createJWT } from "@/lib/auth";
import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import {
  errorResponse,
  optionsResponse,
  printExceptionLog,
  successResponse,
} from "@/lib/utils";
import bcrypt from "bcrypt";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(request) {
  try {
    const data = await request.json();
    const identifier = String(
      data.identifier || data.email || data.username || "",
    ).trim();
    const password = String(data.password || "");

    if (!identifier || !password) {
      return errorResponse("Missing username/email or password", 400);
    }

    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);
    const user = await db.collection("user").findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier },
      ],
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return errorResponse("Invalid username/email or password", 401);
    }

    const safeUser = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    };
    const response = successResponse(
      { message: "Login successful", user: safeUser },
      200,
    );

    response.cookies.set("token", createJWT(user), {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse("Invalid JSON body", 400);
    }

    printExceptionLog("POST Login", error);
    return errorResponse("Login Internal Error", 500);
  }
}
