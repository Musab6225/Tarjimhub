import { pgTable, text, serial, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const terminologiesTable = pgTable("terminologies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  term: text("term").notNull(),
  definition: text("definition"),
  category: text("category"),
  dialects: jsonb("dialects").notNull(),
  examples: jsonb("examples"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTerminologySchema = createInsertSchema(terminologiesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTerminology = z.infer<typeof insertTerminologySchema>;
export type Terminology = typeof terminologiesTable.$inferSelect;
