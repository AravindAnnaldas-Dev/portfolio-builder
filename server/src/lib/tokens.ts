import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Response } from "express";

const ACCESS_TOKEN_TTL = (process.env.JWT_EXPIRES_IN || "15m") as jwt.SignOptions["expiresIn"];
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const isProd = process.env.NODE_ENV === "production";

export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";

const baseCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? ("none" as const) : ("lax" as const),
};

export function signAccessToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: ACCESS_TOKEN_TTL });
}

export function generateRefreshToken() {
  const raw = crypto.randomBytes(48).toString("hex");
  const tokenHash = hashRefreshToken(raw);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  return { raw, tokenHash, expiresAt };
}

export function hashRefreshToken(raw: string) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie(ACCESS_COOKIE, accessToken, {
    ...baseCookieOptions,
    maxAge: 15 * 60 * 1000,
    path: "/",
  });
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...baseCookieOptions,
    maxAge: REFRESH_TOKEN_TTL_MS,
    path: "/api/auth",
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_COOKIE, { ...baseCookieOptions, path: "/" });
  res.clearCookie(REFRESH_COOKIE, { ...baseCookieOptions, path: "/api/auth" });
}
