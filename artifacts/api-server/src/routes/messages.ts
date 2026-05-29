import { Router } from "express";
import { db, directMessagesTable, usersTable } from "@workspace/db";
import { eq, or, and, desc, sql } from "drizzle-orm";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";
import { logger } from "../lib/logger.js";
import { validateBody, validateParams } from "../lib/validation.js";
import { messagesSchemas } from "../lib/schemas.js";

const router = Router();

router.get("/messages", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const allMessages = await db.select().from(directMessagesTable)
      .where(or(eq(directMessagesTable.senderId, userId), eq(directMessagesTable.receiverId, userId)))
      .orderBy(desc(directMessagesTable.sentAt));

    // Build conversations by grouping with other user
    const conversationMap = new Map<number, typeof allMessages[0]>();
    for (const msg of allMessages) {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, msg);
      }
    }

    const conversations = await Promise.all(
      Array.from(conversationMap.entries()).map(async ([otherUserId, lastMsg]) => {
        const [user] = await db.select({ name: usersTable.name, role: usersTable.role, isOnline: usersTable.isOnline })
          .from(usersTable).where(eq(usersTable.id, otherUserId)).limit(1);
        const unread = await db.select().from(directMessagesTable)
          .where(and(
            eq(directMessagesTable.senderId, otherUserId),
            eq(directMessagesTable.receiverId, userId),
            eq(directMessagesTable.read, false)
          ));
        return {
          userId: otherUserId,
          userName: user?.name || "Unknown",
          userRole: user?.role || null,
          isOnline: user?.isOnline ?? false,
          lastMessage: lastMsg.content,
          lastMessageAt: lastMsg.sentAt.toISOString(),
          unreadCount: unread.length,
        };
      })
    );
    res.json(conversations);
  } catch (err) {
    logger.error({ err }, "getConversations error");
    res.status(500).json({ error: "Failed to get conversations" });
  }
});

router.get("/messages/:userId", authMiddleware, validateParams(messagesSchemas.userIdParams), async (req: AuthRequest, res) => {
  try {
    const myId = req.userId!;
    const { userId: otherId } = req.params as { userId: number };
    const msgs = await db.select().from(directMessagesTable)
      .where(or(
        and(eq(directMessagesTable.senderId, myId), eq(directMessagesTable.receiverId, otherId)),
        and(eq(directMessagesTable.senderId, otherId), eq(directMessagesTable.receiverId, myId))
      ))
      .orderBy(directMessagesTable.sentAt);

    // Mark as read
    await db.update(directMessagesTable)
      .set({ read: true })
      .where(and(eq(directMessagesTable.senderId, otherId), eq(directMessagesTable.receiverId, myId)));

    const enriched = await Promise.all(msgs.map(async (msg) => {
      const [user] = await db.select({ name: usersTable.name }).from(usersTable)
        .where(eq(usersTable.id, msg.senderId)).limit(1);
      return { ...msg, senderName: user?.name || null, sentAt: msg.sentAt.toISOString() };
    }));
    res.json(enriched);
  } catch (err) {
    logger.error({ err }, "getMessages error");
    res.status(500).json({ error: "Failed to get messages" });
  }
});

router.post("/messages/send", authMiddleware, validateBody(messagesSchemas.send), async (req: AuthRequest, res) => {
  try {
    const { receiverId, content } = req.body;
    const [msg] = await db.insert(directMessagesTable).values({
      senderId: req.userId!,
      receiverId,
      content,
    }).returning();
    logger.info({ event: "message.send", senderId: req.userId, receiverId, messageId: msg.id }, "Direct message sent");
    const [user] = await db.select({ name: usersTable.name }).from(usersTable)
      .where(eq(usersTable.id, req.userId!)).limit(1);
    res.status(201).json({ ...msg, senderName: user?.name || null, sentAt: msg.sentAt.toISOString() });
  } catch (err) {
    logger.error({ err }, "sendMessage error");
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
