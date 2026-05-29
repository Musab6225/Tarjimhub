import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware, signToken, type AuthRequest } from "../middlewares/auth.js";
import { logger } from "../lib/logger.js";
import { validateBody } from "../lib/validation.js";
import { authSchemas } from "../lib/schemas.js";

const router = Router();

router.post("/auth/register", validateBody(authSchemas.register), async (req, res) => {
  try {
    const { name, nameAr, email, password, role, primaryLanguagePair, dialectSpecialty } = req.body;
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      logger.warn({ event: "user.register", email }, "Email already registered");
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(usersTable).values({
      name,
      nameAr: nameAr || null,
      email,
      passwordHash,
      role,
      primaryLanguagePair: primaryLanguagePair || "Arabic-English",
      dialectSpecialty: dialectSpecialty || null,
    }).returning();

    const token = signToken(user.id, user.role);
    logger.info({ event: "user.register", userId: user.id, email, role }, "User registered successfully");
    const { passwordHash: _, ...safeUser } = user;
    res.status(201).json({ token, user: { ...safeUser, isOnline: false } });
  } catch (err) {
    logger.error({ err, event: "user.register" }, "register error");
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/auth/login", validateBody(authSchemas.login), async (req, res) => {
  try {
    const { email, password } = req.body;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) {
      logger.warn({ event: "user.login", email }, "Invalid login attempt");
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      logger.warn({ event: "user.login", userId: user.id, email }, "Invalid login attempt");
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const token = signToken(user.id, user.role);
    logger.info({ event: "user.login", userId: user.id, email }, "User login successful");
    const { passwordHash: _, ...safeUser } = user;
    res.json({ token, user: { ...safeUser, isOnline: true } });
  } catch (err) {
    logger.error({ err, event: "user.login" }, "login error");
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
