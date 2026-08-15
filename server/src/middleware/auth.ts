import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ACCESS_COOKIE } from "../lib/tokens";

export interface AuthedRequest extends Request {
  userId?: string;
}

// Verifies the access token cookie and attaches userId to the request.
// Every downstream route trusts req.userId as the authenticated caller.
export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.[ACCESS_COOKIE];

  if (!token) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
