// src/app/api/auth/logout/route.js

import { optionsResponse, successResponse } from "@/lib/utils";

export function OPTIONS() {
  return optionsResponse();
}

function logoutResponse() {
  const response = successResponse({ message: "Logout successful" }, 200);

  response.cookies.set("token", "", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

export function POST() {
  return logoutResponse();
}

export function GET() {
  return logoutResponse();
}
