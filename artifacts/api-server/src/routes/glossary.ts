import { Router } from "express";
import { db, glossaryEntriesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";
import { logger } from "../lib/logger.js";

const router = Router();

async function callGroq(term: string): Promise<{ results: unknown[] }> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content: `You are an expert Arabic linguistics assistant specializing in dialect variations.
When given a term (English or Arabic), return a JSON object with the term translated into 5 Arabic dialects: Egyptian, Levantine, Gulf, Moroccan, and Sudanese.

STRICT RULES:
- "dialect": dialect name in English (e.g. "Egyptian")
- "dialectAr": dialect name in Arabic script ONLY (e.g. "المصري") — never empty
- "term": the LOCAL dialect word in romanized transliteration
- "arabic": the word written in Arabic script — NEVER empty, NEVER use English
- "note": one short usage note in English, max 8 words

If no dialect-specific word exists, use the Modern Standard Arabic translation.
NEVER leave "arabic" or "dialectAr" empty. NEVER put English in "arabic" or "dialectAr" fields.
Return ONLY valid JSON, no markdown. Format:
{"results": [{"dialect":"","dialectAr":"","term":"","arabic":"","note":""}]}`
        },
        { role: "user", content: term }
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Groq API error: ${JSON.stringify(err)}`);
  }

  const data: any = await response.json();
  const text = data.choices[0].message.content;
  return JSON.parse(text);
}

router.post("/glossary/lookup", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { term, category } = req.body;
    if (!term) {
      res.status(400).json({ error: "Term is required" });
      return;
    }

    const parsed = await callGroq(term);

    await db.insert(glossaryEntriesTable).values({
      userId: req.userId!,
      term,
      results: parsed.results,
      category: category || null,
    });

    res.json(parsed);
  } catch (err) {
    logger.error({ err }, "glossary lookup error");
    res.status(500).json({ error: "Glossary lookup failed", detail: String(err) });
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
