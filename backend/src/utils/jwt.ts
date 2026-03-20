import jwt from "jsonwebtoken";
import type { AuthUser } from "../types/auth.js";

const secret = process.env.JWT_SECRET ?? "dev-secret";

export function signToken(user: AuthUser) {
  return jwt.sign(user, secret, { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthUser {
  return jwt.verify(token, secret) as AuthUser;
}
