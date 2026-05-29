import { type ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { logger } from "../lib/logger.js";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ZodError) {
    const issues = err.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));

    logger.warn({ err, path: req.path, method: req.method }, "Validation error");
    return res.status(400).json({
      error: "Validation failed",
      details: issues,
    });
  }

  const status = (err as any).statusCode || (err as any).status || 500;
  const message = err instanceof Error ? err.message : "Internal Server Error";

  logger.error(
    { err, path: req.path, method: req.method, query: req.query },
    "Unhandled server error",
  );

  res.status(status).json({
    error: message,
    code: (err as any).code ?? "INTERNAL_SERVER_ERROR",
    ...(process.env.NODE_ENV !== "production" ? { stack: err instanceof Error ? err.stack : undefined } : {}),
  });
};
