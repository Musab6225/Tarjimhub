import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware, signToken, type AuthRequest } from "../middlewares/auth.js";
import { logger } from "../lib/logger.js";

const router = Router();

router.post("/auth/register", async (req, res) => {
  try {
    const { name, nameAr, email, password, role, primaryLanguagePair, dialectSpecialty } = req.body;
    if (!name || !email || !password || !role) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(usersTable).values({
      name,
      nameAr: nameAr || null,
      email,
      passwordHash,
      role: role || "interpreter",
      primaryLanguagePair: primaryLanguagePair || "Arabic-English",
      dialectSpecialty: dialectSpecialty || null,
    }).returning();
    const token = signToken(user.id, user.role);
    const { passwordHash: _, ...safeUser } = user;
    res.status(201).json({ token, user: { ...safeUser, isOnline: false } });
  } catch (err) {
    logger.error({ err }, "register error");
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password required" });
      return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const token = signToken(user.id, user.role);
    const { passwordHash: _, ...safeUser } = user;
    res.json({ token, user: { ...safeUser, isOnline: true } });
  } catch (err) {
    logger.error({ err }, "login error");
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/auth/me", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }
    const { passwordHash: _, ...safeUser } = user;
    res.json({ ...safeUser, isOnline: true });
  } catch (err) {
    logger.error({ err }, "getMe error");
    res.status(500).json({ error: "Failed to get user" });
  }
});

export default router;
