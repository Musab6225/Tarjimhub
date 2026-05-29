import { Router } from "express";
import { db, terminologiesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";
import { logger } from "../lib/logger.js";
import { validateBody, validateQuery, validateParams } from "../lib/validation.js";
import { terminologiesSchemas } from "../lib/schemas.js";

const router = Router();

router.post("/terminologies/save", authMiddleware, validateBody(terminologiesSchemas.save), async (req: AuthRequest, res) => {
  try {
    const { term, definition, category, dialects, examples } = req.body;
    const [entry] = await db.insert(terminologiesTable).values({
      userId: req.userId!,
      term,
      definition: definition || null,
      category: category || null,
      dialects,
      examples: examples || null,
    }).returning();
    res.status(201).json({ ...entry, createdAt: entry.createdAt.toISOString(), updatedAt: entry.updatedAt.toISOString() });
  } catch (err) {
    console.error("Save terminology error:", err);
    logger.error({ err }, "save terminology error");
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: "Failed to save terminology", detail: errorMessage });
  }
});

router.get("/terminologies/saved", authMiddleware, validateQuery(terminologiesSchemas.savedQuery), async (req: AuthRequest, res) => {
  try {
    const { category } = req.query as { category?: string };
    let query = db.select().from(terminologiesTable)
      .where(eq(terminologiesTable.userId, req.userId!))
      .$dynamic();
    if (category && typeof category === "string") {
      const { and, eq: eq2 } = await import("drizzle-orm");
      query = db.select().from(terminologiesTable)
        .where(and(eq(terminologiesTable.userId, req.userId!), eq2(terminologiesTable.category, category)))
        .$dynamic();
    }
    const entries = await query.orderBy(desc(terminologiesTable.createdAt));
    res.json(entries.map(e => ({ ...e, createdAt: e.createdAt.toISOString(), updatedAt: e.updatedAt.toISOString() })));
  } catch (err) {
    logger.error({ err }, "get saved terminologies error");
    res.status(500).json({ error: "Failed to get saved terminologies" });
  }
});

router.get("/terminologies/:id", authMiddleware, validateParams(terminologiesSchemas.idParams), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as { id: number };
    const [entry] = await db.select().from(terminologiesTable)
      .where(eq(terminologiesTable.id, parseInt(id)))
      .limit(1);
    
    if (!entry || entry.userId !== req.userId!) {
      res.status(404).json({ error: "Terminology not found" });
      return;
    }
    
    res.json({ ...entry, createdAt: entry.createdAt.toISOString(), updatedAt: entry.updatedAt.toISOString() });
  } catch (err) {
    logger.error({ err }, "get terminology error");
    res.status(500).json({ error: "Failed to get terminology" });
  }
});

router.delete("/terminologies/:id", authMiddleware, validateParams(terminologiesSchemas.idParams), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as { id: number };
    const [entry] = await db.select().from(terminologiesTable)
      .where(eq(terminologiesTable.id, parseInt(id)))
      .limit(1);
    
    if (!entry || entry.userId !== req.userId!) {
      res.status(404).json({ error: "Terminology not found" });
      return;
    }
    
    await db.delete(terminologiesTable).where(eq(terminologiesTable.id, parseInt(id)));
    res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "delete terminology error");
    res.status(500).json({ error: "Failed to delete terminology" });
  }
});

export default router;
