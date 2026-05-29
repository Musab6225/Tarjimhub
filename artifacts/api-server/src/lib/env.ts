import { z } from "zod";

const portParser = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  }
  return value;
}, z.number().int().positive());

const positiveNumberOrDefault = (defaultValue: number) =>
  z.preprocess((value) => {
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? value : parsed;
    }
    if (typeof value === "number") {
      return value;
    }
    return undefined;
  }, z.number().int().positive().default(defaultValue));

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: portParser,
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required."),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters."),
  ANTHROPIC_API_KEY: z.string().min(1, "ANTHROPIC_API_KEY is required."),
  GROQ_API_KEY: z.string().min(1, "GROQ_API_KEY is required."),
  AI_INTEGRATIONS_ANTHROPIC_API_KEY: z.string().optional(),
  CORS_ALLOWED_ORIGINS: z.string().optional(),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  RATE_LIMIT_WINDOW_MS: positiveNumberOrDefault(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: positiveNumberOrDefault(100),
  RATE_LIMIT_MAX_REQUESTS_AUTH: positiveNumberOrDefault(20),
  RATE_LIMIT_MAX_REQUESTS_AI: positiveNumberOrDefault(30),
}).passthrough();

const rawEnv = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  AI_INTEGRATIONS_ANTHROPIC_API_KEY:
    process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  CORS_ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS,
  LOG_LEVEL: process.env.LOG_LEVEL,
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_MAX_REQUESTS_AUTH: process.env.RATE_LIMIT_MAX_REQUESTS_AUTH,
  RATE_LIMIT_MAX_REQUESTS_AI: process.env.RATE_LIMIT_MAX_REQUESTS_AI,
};

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => {
      const path = issue.path.length ? issue.path.join(".") : "root";
      return `- ${path}: ${issue.message}`;
    })
    .join("\n");

  throw new Error(`Environment validation failed:\n${issues}`);
}

export const env = parsed.data;
