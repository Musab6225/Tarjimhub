import { Router } from "express";
import { db, jobsTable, applicationsTable, savedJobsTable, usersTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";
import { logger } from "../lib/logger.js";
import { validateBody, validateParams, validateQuery } from "../lib/validation.js";
import { jobsSchemas } from "../lib/schemas.js";

const router = Router();

router.get("/jobs", validateQuery(jobsSchemas.query), async (req, res) => {
  try {
    const { languagePair, mode, specialty, urgent } = req.query as {
      languagePair?: string;
      mode?: string;
      specialty?: string;
      urgent?: boolean;
    };
    const jobs = await db.select().from(jobsTable).orderBy(desc(jobsTable.createdAt));
    let filtered = jobs;
    if (languagePair) filtered = filtered.filter(j => j.languagePair.toLowerCase().includes(languagePair.toLowerCase()));
    if (mode) filtered = filtered.filter(j => j.mode === mode);
    if (specialty) filtered = filtered.filter(j => j.specialty === specialty);
    if (urgent === true) filtered = filtered.filter(j => j.urgent);

    // Enrich with client name and application count
    const enriched = await Promise.all(filtered.map(async (job) => {
      const [client] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, job.clientId)).limit(1);
      const apps = await db.select().from(applicationsTable).where(eq(applicationsTable.jobId, job.id));
      return {
        ...job,
        clientName: client?.name || null,
        applicationsCount: apps.length,
        createdAt: job.createdAt.toISOString(),
      };
    }));
    res.json(enriched);
  } catch (err) {
    logger.error({ err }, "listJobs error");
    res.status(500).json({ error: "Failed to list jobs" });
  }
});

router.post("/jobs", authMiddleware, validateBody(jobsSchemas.create), async (req: AuthRequest, res) => {
  try {
    const { title, description, languagePair, dialectPreference, mode, rateOffered, specialty, urgent, remote, location } = req.body;
    const [job] = await db.insert(jobsTable).values({
      clientId: req.userId!,
      title, description, languagePair,
      dialectPreference: dialectPreference || null,
      mode, rateOffered,
      specialty: specialty || null,
      urgent: urgent || false,
      remote: remote !== false,
      location: location || null,
    }).returning();
    logger.info({ event: "job.create", userId: req.userId, jobId: job.id, title, mode }, "Job created successfully");
    res.status(201).json({ ...job, clientName: null, applicationsCount: 0, createdAt: job.createdAt.toISOString() });
  } catch (err) {
    logger.error({ err }, "createJob error");
    res.status(500).json({ error: "Failed to create job" });
  }
});

router.get("/jobs/saved", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const saved = await db.select().from(savedJobsTable).where(eq(savedJobsTable.userId, req.userId!));
    const jobIds = saved.map(s => s.jobId);
    if (jobIds.length === 0) {
      res.json([]);
      return;
    }
    const jobs = await db.select().from(jobsTable).orderBy(desc(jobsTable.createdAt));
    const filtered = jobs.filter(j => jobIds.includes(j.id));
    res.json(filtered.map(j => ({ ...j, clientName: null, applicationsCount: 0, createdAt: j.createdAt.toISOString() })));
  } catch (err) {
    logger.error({ err }, "getSavedJobs error");
    res.status(500).json({ error: "Failed to get saved jobs" });
  }
});

router.get("/jobs/:id", validateParams(jobsSchemas.idParams), async (req, res) => {
  try {
    const { id } = req.params as { id: number };
    const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, id)).limit(1);
    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }
    const [client] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, job.clientId)).limit(1);
    const apps = await db.select().from(applicationsTable).where(eq(applicationsTable.jobId, id));
    res.json({ ...job, clientName: client?.name || null, applicationsCount: apps.length, createdAt: job.createdAt.toISOString() });
  } catch (err) {
    logger.error({ err }, "getJob error");
    res.status(500).json({ error: "Failed to get job" });
  }
});

router.post("/jobs/:id/apply", authMiddleware, validateParams(jobsSchemas.idParams), validateBody(jobsSchemas.apply), async (req: AuthRequest, res) => {
  try {
    const { id: jobId } = req.params as { id: number };
    const { message } = req.body;
    const [app] = await db.insert(applicationsTable).values({
      jobId,
      interpreterId: req.userId!,
      message,
    }).returning();
    logger.info({ event: "job.apply", userId: req.userId, jobId, applicationId: app.id }, "Job application submitted");
    res.status(201).json({ ...app, interpreterName: null, appliedAt: app.appliedAt.toISOString() });
  } catch (err) {
    logger.error({ err }, "applyToJob error");
    res.status(500).json({ error: "Failed to apply" });
  }
});

router.get("/jobs/:id/applications", authMiddleware, validateParams(jobsSchemas.idParams), async (req: AuthRequest, res) => {
  try {
    const { id: jobId } = req.params as { id: number };
    const apps = await db.select().from(applicationsTable).where(eq(applicationsTable.jobId, jobId));
    const enriched = await Promise.all(apps.map(async (app) => {
      const [user] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, app.interpreterId)).limit(1);
      return { ...app, interpreterName: user?.name || null, appliedAt: app.appliedAt.toISOString() };
    }));
    res.json(enriched);
  } catch (err) {
    logger.error({ err }, "getJobApplications error");
    res.status(500).json({ error: "Failed to get applications" });
  }
});

router.post("/jobs/:id/save", authMiddleware, validateParams(jobsSchemas.idParams), async (req: AuthRequest, res) => {
  try {
    const { id: jobId } = req.params as { id: number };
    const userId = req.userId!;
    const existing = await db.select().from(savedJobsTable)
      .where(and(eq(savedJobsTable.userId, userId), eq(savedJobsTable.jobId, jobId))).limit(1);
    if (existing.length > 0) {
      await db.delete(savedJobsTable).where(and(eq(savedJobsTable.userId, userId), eq(savedJobsTable.jobId, jobId)));
      res.json({ saved: false });
    } else {
      await db.insert(savedJobsTable).values({ userId, jobId });
      res.json({ saved: true });
    }
  } catch (err) {
    logger.error({ err }, "saveJob error");
    res.status(500).json({ error: "Failed to save job" });
  }
});

export default router;
