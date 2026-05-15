import { Router } from "express";
import { db, applicationsTable, savedJobsTable, followsTable, postsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";
import { logger } from "../lib/logger.js";

const router = Router();

router.get("/dashboard/stats", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    const [jobsApplied, savedJobs, followers, posts] = await Promise.all([
      db.select().from(applicationsTable).where(eq(applicationsTable.interpreterId, userId)),
      db.select().from(savedJobsTable).where(eq(savedJobsTable.userId, userId)),
      db.select().from(followsTable).where(eq(followsTable.followingId, userId)),
      db.select().from(postsTable).where(eq(postsTable.userId, userId)).orderBy(desc(postsTable.createdAt)).limit(5),
    ]);

    const pendingApplications = jobsApplied.filter(a => a.status === "pending").length;

    const recentActivity = [
      ...jobsApplied.slice(0, 2).map(a => ({
        type: "application",
        description: `Applied to job #${a.jobId}`,
        createdAt: a.appliedAt.toISOString(),
      })),
      ...posts.slice(0, 2).map(p => ({
        type: "post",
        description: `Posted: "${p.content.slice(0, 40)}..."`,
        createdAt: p.createdAt.toISOString(),
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

    res.json({
      sessionsCompleted: 0,
      jobsApplied: jobsApplied.length,
      connections: followers.length,
      savedJobs: savedJobs.length,
      openJobs: 0,
      pendingApplications,
      recentActivity,
    });
  } catch (err) {
    logger.error({ err }, "getDashboardStats error");
    res.status(500).json({ error: "Failed to get stats" });
  }
});

export default router;
