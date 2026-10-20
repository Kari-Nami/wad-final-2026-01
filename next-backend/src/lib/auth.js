import jwt from "jsonwebtoken";
import { USER_ROLES } from "./constant";

const JWT_SECRET = process.env.JWT_SECRET;

export function createJWT(user) {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
}

export function verifyJWT(req) {
  try {
    if (!JWT_SECRET) {
      return null;
    }

    const token = req.cookies.get("token")?.value;

    if (!token) {
      return null;
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.log("==>Verify Token Exception");
    console.log(error.message);
    return null;
  }
}

export function getAuthenticatedUser(request) {
  const user = verifyJWT(request);

  if (
    !user?.id ||
    !user?.username ||
    !Object.values(USER_ROLES).includes(user.role)
  ) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    role: user.role,
  };
}

export function userHasRole(user, role) {
  return Boolean(user && user.role === role);
}
