import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import usersRouter from "./users.js";
import glossaryRouter from "./glossary.js";
import jobsRouter from "./jobs.js";
import feedRouter from "./feed.js";
import messagesRouter from "./messages.js";
import dashboardRouter from "./dashboard.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(glossaryRouter);
router.use(jobsRouter);
router.use(feedRouter);
router.use(messagesRouter);
router.use(dashboardRouter);

export default router;
