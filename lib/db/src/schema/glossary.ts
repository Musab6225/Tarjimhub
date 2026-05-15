import { pgTable, text, serial, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const glossaryEntriesTable = pgTable("glossary_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  term: text("term").notNull(),
  results: jsonb("results").notNull(),
  category: text("category"),
  savedAt: timestamp("saved_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGlossaryEntrySchema = createInsertSchema(glossaryEntriesTable).omit({ id: true, savedAt: true });
export type InsertGlossaryEntry = z.infer<typeof insertGlossaryEntrySchema>;
export type GlossaryEntry = typeof glossaryEntriesTable.$inferSelect;
