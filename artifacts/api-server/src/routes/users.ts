import { Router } from "express";
import { db, usersTable, followsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";
import { logger } from "../lib/logger.js";
import { validateParams, validateBody } from "../lib/validation.js";
import { usersSchemas } from "../lib/schemas.js";

const router = Router();

router.get("/users/:id", authMiddleware, validateParams(usersSchemas.idParams), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as { id: number };
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const { passwordHash: _, ...safeUser } = user;
    res.json({ ...safeUser, isOnline: false });
  } catch (err) {
    logger.error({ err }, "getUser error");
    res.status(500).json({ error: "Failed to get user" });
  }
});

router.put("/users/:id", authMiddleware, validateParams(usersSchemas.idParams), validateBody(usersSchemas.update), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as { id: number };
    if (id !== req.userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const { name, nameAr, bio, bioAr, primaryLanguagePair, dialectSpecialty, certifications } = req.body;
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (nameAr !== undefined) updates.nameAr = nameAr;
    if (bio !== undefined) updates.bio = bio;
    if (bioAr !== undefined) updates.bioAr = bioAr;
    if (primaryLanguagePair !== undefined) updates.primaryLanguagePair = primaryLanguagePair;
    if (dialectSpecialty !== undefined) updates.dialectSpecialty = dialectSpecialty;
    if (certifications !== undefined) updates.certifications = certifications;
    const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
    const { passwordHash: _, ...safeUser } = user;
    logger.info({ event: "user.update", userId: id }, "User profile updated");
    res.json({ ...safeUser, isOnline: true });
  } catch (err) {
    logger.error({ err }, "updateUser error");
    res.status(500).json({ error: "Failed to update user" });
  }
});

router.post("/users/:id/follow", authMiddleware, validateParams(usersSchemas.idParams), async (req: AuthRequest, res) => {
  try {
    const { id: followingId } = req.params as { id: number };
    const followerId = req.userId!;
    const existing = await db.select().from(followsTable)
      .where(and(eq(followsTable.followerId, followerId), eq(followsTable.followingId, followingId)))
      .limit(1);
    if (existing.length === 0) {
      await db.insert(followsTable).values({ followerId, followingId });
    }
    logger.info({ event: "user.follow", followerId, followingId }, "User followed another user");
    res.json({ following: true });
  } catch (err) {
    logger.error({ err }, "followUser error");
    res.status(500).json({ error: "Failed to follow user" });
  }
});

router.delete("/users/:id/follow", authMiddleware, validateParams(usersSchemas.idParams), async (req: AuthRequest, res) => {
  try {
    const { id: followingId } = req.params as { id: number };
    const followerId = req.userId!;
    await db.delete(followsTable)
      .where(and(eq(followsTable.followerId, followerId), eq(followsTable.followingId, followingId)));
    logger.info({ event: "user.unfollow", followerId, followingId }, "User unfollowed another user");
    res.json({ following: false });
  } catch (err) {
    logger.error({ err }, "unfollowUser error");
    res.status(500).json({ error: "Failed to unfollow user" });
  }
});

export default router;
