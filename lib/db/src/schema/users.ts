import { pgTable, text, serial, timestamp, integer, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("interpreter"),
  primaryLanguagePair: text("primary_language_pair").notNull().default("Arabic-English"),
  dialectSpecialty: text("dialect_specialty"),
  bio: text("bio"),
  bioAr: text("bio_ar"),
  certifications: text("certifications"),
  sessionsCompleted: integer("sessions_completed").notNull().default(0),
  rating: real("rating"),
  isOnline: boolean("is_online").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
