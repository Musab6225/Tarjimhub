import { Router } from "express";
import { db, glossaryEntriesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { logger } from "../lib/logger.js";

const router = Router();

router.post("/glossary/lookup", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { term, category } = req.body;
    if (!term) {
      res.status(400).json({ error: "Term is required" });
      return;
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: `You are an expert Arabic linguistics assistant specializing in dialect variations. 
When given a term, return a JSON object with the term translated and explained in 5 Arabic dialects: 
Egyptian, Levantine, Gulf, Moroccan, and Sudanese. 
For each dialect include:
- "dialect": dialect name in English
- "dialectAr": dialect name in Arabic
- "term": the term as used in that dialect (transliterated if needed)
- "arabic": the term written in Arabic script
- "note": any important usage note (max 10 words)
Return ONLY valid JSON, no explanation, no markdown. Format:
{"results": [{"dialect":"","dialectAr":"","term":"","arabic":"","note":""}]}`,
      messages: [{ role: "user", content: term }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      res.status(500).json({ error: "Unexpected AI response" });
      return;
    }

    let parsed: { results: unknown[] };
    try {
      parsed = JSON.parse(content.text);
    } catch {
      res.status(500).json({ error: "Failed to parse AI response" });
      return;
    }

    // Save to history automatically
    await db.insert(glossaryEntriesTable).values({
      userId: req.userId!,
      term,
      results: parsed.results,
      category: category || null,
    });

    res.json(parsed);
  } catch (err) {
    logger.error({ err }, "glossary lookup error");
    res.status(500).json({ error: "Glossary lookup failed" });
  }
});

router.post("/glossary/save", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { term, results, category } = req.body;
    if (!term || !results) {
      res.status(400).json({ error: "Term and results required" });
      return;
    }
    const [entry] = await db.insert(glossaryEntriesTable).values({
      userId: req.userId!,
      term,
      results,
      category: category || null,
    }).returning();
    res.status(201).json({ ...entry, savedAt: entry.savedAt.toISOString() });
  } catch (err) {
    logger.error({ err }, "save glossary error");
    res.status(500).json({ error: "Failed to save glossary entry" });
  }
});

router.get("/glossary/history", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const entries = await db.select().from(glossaryEntriesTable)
      .where(eq(glossaryEntriesTable.userId, req.userId!))
      .orderBy(desc(glossaryEntriesTable.savedAt))
      .limit(20);
    res.json(entries.map(e => ({ ...e, savedAt: e.savedAt.toISOString() })));
  } catch (err) {
    logger.error({ err }, "glossary history error");
    res.status(500).json({ error: "Failed to get history" });
  }
});

router.get("/glossary/saved", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { category } = req.query;
    let query = db.select().from(glossaryEntriesTable)
      .where(eq(glossaryEntriesTable.userId, req.userId!))
      .$dynamic();
    if (category && typeof category === "string") {
      const { and, eq: eq2 } = await import("drizzle-orm");
      query = db.select().from(glossaryEntriesTable)
        .where(and(eq(glossaryEntriesTable.userId, req.userId!), eq2(glossaryEntriesTable.category, category)))
        .$dynamic();
    }
    const entries = await query.orderBy(desc(glossaryEntriesTable.savedAt));
    res.json(entries.map(e => ({ ...e, savedAt: e.savedAt.toISOString() })));
  } catch (err) {
    logger.error({ err }, "saved glossary error");
    res.status(500).json({ error: "Failed to get saved glossary" });
  }
});

export default router;
