import { Router } from "express";
import { db, postsTable, postLikesTable, commentsTable, usersTable } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";
import { logger } from "../lib/logger.js";
import { validateBody, validateQuery, validateParams } from "../lib/validation.js";
import { feedSchemas } from "../lib/schemas.js";

const router = Router();

router.get("/feed", authMiddleware, validateQuery(feedSchemas.query), async (req: AuthRequest, res) => {
  try {
    const { specialty } = req.query as { specialty?: string };
    const posts = await db.select().from(postsTable).orderBy(desc(postsTable.createdAt)).limit(50);
    let filtered = posts;
    if (specialty && specialty !== "all") {
      filtered = posts.filter(p => p.specialty === specialty);
    }

    const enriched = await Promise.all(filtered.map(async (post) => {
      const [user] = await db.select({ name: usersTable.name, role: usersTable.role }).from(usersTable)
        .where(eq(usersTable.id, post.userId)).limit(1);
      const comments = await db.select().from(commentsTable).where(eq(commentsTable.postId, post.id));
      const liked = await db.select().from(postLikesTable)
        .where(and(eq(postLikesTable.postId, post.id), eq(postLikesTable.userId, req.userId!))).limit(1);
      return {
        ...post,
        userName: user?.name || null,
        userRole: user?.role || null,
        likedByMe: liked.length > 0,
        commentsCount: comments.length,
        createdAt: post.createdAt.toISOString(),
      };
    }));
    res.json(enriched);
  } catch (err) {
    logger.error({ err }, "getFeed error");
    res.status(500).json({ error: "Failed to get feed" });
  }
});

router.post("/feed/posts", authMiddleware, validateBody(feedSchemas.createPost), async (req: AuthRequest, res) => {
  try {
    const { content, contentAr, specialty } = req.body;
    const [post] = await db.insert(postsTable).values({
      userId: req.userId!,
      content,
      contentAr: contentAr || null,
      specialty: specialty || null,
    }).returning();
    const [user] = await db.select({ name: usersTable.name, role: usersTable.role }).from(usersTable)
      .where(eq(usersTable.id, req.userId!)).limit(1);
    res.status(201).json({
      ...post,
      userName: user?.name || null,
      userRole: user?.role || null,
      likedByMe: false,
      commentsCount: 0,
      createdAt: post.createdAt.toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "createPost error");
    res.status(500).json({ error: "Failed to create post" });
  }
});

router.post("/feed/posts/:id/like", authMiddleware, validateParams(feedSchemas.postIdParams), async (req: AuthRequest, res) => {
  try {
    const { id: postId } = req.params as { id: number };
    const userId = req.userId!;
    const existing = await db.select().from(postLikesTable)
      .where(and(eq(postLikesTable.postId, postId), eq(postLikesTable.userId, userId))).limit(1);

    if (existing.length > 0) {
      await db.delete(postLikesTable).where(and(eq(postLikesTable.postId, postId), eq(postLikesTable.userId, userId)));
      await db.update(postsTable).set({ likes: sql`likes - 1` }).where(eq(postsTable.id, postId));
      const [post] = await db.select({ likes: postsTable.likes }).from(postsTable).where(eq(postsTable.id, postId)).limit(1);
      res.json({ liked: false, likes: post?.likes ?? 0 });
    } else {
      await db.insert(postLikesTable).values({ postId, userId });
      await db.update(postsTable).set({ likes: sql`likes + 1` }).where(eq(postsTable.id, postId));
      const [post] = await db.select({ likes: postsTable.likes }).from(postsTable).where(eq(postsTable.id, postId)).limit(1);
      res.json({ liked: true, likes: post?.likes ?? 0 });
    }
  } catch (err) {
    logger.error({ err }, "likePost error");
    res.status(500).json({ error: "Failed to like post" });
  }
});

router.get("/feed/posts/:id/comments", validateParams(feedSchemas.postIdParams), async (req, res) => {
  try {
    const { id: postId } = req.params as { id: number };
    const comments = await db.select().from(commentsTable).where(eq(commentsTable.postId, postId)).orderBy(commentsTable.createdAt);
    const enriched = await Promise.all(comments.map(async (c) => {
      const [user] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, c.userId)).limit(1);
      return { ...c, userName: user?.name || null, createdAt: c.createdAt.toISOString() };
    }));
    res.json(enriched);
  } catch (err) {
    logger.error({ err }, "getComments error");
    res.status(500).json({ error: "Failed to get comments" });
  }
});

router.post("/feed/posts/:id/comments", authMiddleware, validateParams(feedSchemas.postIdParams), validateBody(feedSchemas.commentBody), async (req: AuthRequest, res) => {
  try {
    const { id: postId } = req.params as { id: number };
    const { content } = req.body;
    const [comment] = await db.insert(commentsTable).values({
      postId,
      userId: req.userId!,
      content,
    }).returning();
    const [user] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    res.status(201).json({ ...comment, userName: user?.name || null, createdAt: comment.createdAt.toISOString() });
  } catch (err) {
    logger.error({ err }, "addComment error");
    res.status(500).json({ error: "Failed to add comment" });
  }
});

router.get("/feed/trending", async (_req, res) => {
  try {
    const posts = await db.select({ specialty: postsTable.specialty }).from(postsTable)
      .where(sql`specialty IS NOT NULL`);
    const counts: Record<string, number> = {};
    for (const post of posts) {
      if (post.specialty) counts[post.specialty] = (counts[post.specialty] || 0) + 1;
    }
    const trending = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([topic, count]) => ({ topic, count }));
    if (trending.length === 0) {
      res.json([
        { topic: "Medical", count: 12 },
        { topic: "Legal", count: 8 },
        { topic: "Social Services", count: 6 },
        { topic: "Mental Health", count: 4 },
        { topic: "General", count: 3 },
      ]);
      return;
    }
    res.json(trending);
  } catch (err) {
    logger.error({ err }, "getTrendingTopics error");
    res.status(500).json({ error: "Failed to get trending topics" });
  }
});

export default router;
