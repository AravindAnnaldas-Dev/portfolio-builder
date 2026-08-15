import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  clearAuthCookies,
  generateRefreshToken,
  hashRefreshToken,
  setAuthCookies,
  signAccessToken,
} from "../lib/tokens";

const router = Router();

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Issues a short-lived access token (15m) and a long-lived refresh token (30d).
// Both are set as httpOnly cookies — never exposed to client-side JS — and the
// refresh token is stored in the DB as a hash so a leaked database dump alone
// can't be replayed as a session.
async function issueSession(res: import("express").Response, userId: string) {
  const accessToken = signAccessToken(userId);
  const { raw, tokenHash, expiresAt } = generateRefreshToken();
  await prisma.refreshToken.create({ data: { userId, tokenHash, expiresAt } });
  setAuthCookies(res, accessToken, raw);
}

// Register: hash the password with bcrypt before it ever touches the DB.
// bcrypt's salt is embedded in the hash, so no separate salt column is needed.
router.post("/register", async (req, res) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { email, password, name } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashed, name },
  });

  await issueSession(res, user.id);
  res.status(201).json({ user: { id: user.id, email: user.email, name: user.name } });
});

// Login: compare the submitted password against the stored hash, never the reverse.
router.post("/login", async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  await issueSession(res, user.id);
  res.json({ user: { id: user.id, email: user.email, name: user.name } });
});

// Refresh: exchanges a valid refresh token cookie for a new access token.
// The refresh token is rotated on every use (old hash deleted, new one stored)
// so a stolen-and-replayed refresh token is only usable once before it's invalidated.
router.post("/refresh", async (req, res) => {
  const raw = req.cookies?.[REFRESH_COOKIE];
  if (!raw) {
    return res.status(401).json({ error: "Missing refresh token" });
  }

  const tokenHash = hashRefreshToken(raw);
  const record = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!record || record.expiresAt < new Date()) {
    if (record) await prisma.refreshToken.delete({ where: { id: record.id } }).catch((e) => console.error("refresh token cleanup failed", e));
    clearAuthCookies(res);
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }

  await prisma.refreshToken.delete({ where: { id: record.id } });
  await issueSession(res, record.userId);
  res.json({ ok: true });
});

// Logout: revokes the refresh token server-side and clears both cookies.
router.post("/logout", async (req, res) => {
  const raw = req.cookies?.[REFRESH_COOKIE];
  if (raw) {
    await prisma.refreshToken
      .delete({ where: { tokenHash: hashRefreshToken(raw) } })
      .catch((e) => console.error("logout token cleanup failed", e));
  }
  clearAuthCookies(res);
  res.status(204).end();
});

// Me: lets the client hydrate the logged-in user on page load from the access
// token cookie alone, instead of trusting anything read from localStorage.
router.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(401).json({ error: "User not found" });
  res.json({ user: { id: user.id, email: user.email, name: user.name } });
});

export default router;
