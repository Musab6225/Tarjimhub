import { z } from "zod";

const parseIntParam = z.preprocess((value) => {
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  }
  return value;
}, z.number().int().positive());

export const authSchemas = {
  register: z.object({
    name: z.string().min(1),
    nameAr: z.string().nullable().optional(),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.string().min(1),
    primaryLanguagePair: z.string().optional(),
    dialectSpecialty: z.string().nullable().optional(),
  }),
  login: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
};

export const usersSchemas = {
  idParams: z.object({ id: parseIntParam }),
  update: z.object({
    name: z.string().optional(),
    nameAr: z.string().nullable().optional(),
    bio: z.string().nullable().optional(),
    bioAr: z.string().nullable().optional(),
    primaryLanguagePair: z.string().optional(),
    dialectSpecialty: z.string().nullable().optional(),
    certifications: z.string().nullable().optional(),
  }),
};

export const glossarySchemas = {
  lookup: z.object({
    term: z.string().min(1),
    category: z.string().optional(),
  }),
  save: z.object({
    term: z.string().min(1),
    results: z.array(z.unknown()).nonempty(),
    category: z.string().optional(),
  }),
  savedQuery: z.object({
    category: z.string().optional(),
  }),
};

export const feedSchemas = {
  query: z.object({
    specialty: z.string().optional(),
  }),
  createPost: z.object({
    content: z.string().min(1),
    contentAr: z.string().optional().nullable(),
    specialty: z.string().optional().nullable(),
  }),
  postIdParams: z.object({ id: parseIntParam }),
  commentBody: z.object({
    content: z.string().min(1),
  }),
};

export const terminologiesSchemas = {
  save: z.object({
    term: z.string().min(1),
    definition: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    dialects: z.array(z.string()).min(1),
    examples: z.array(z.string()).optional().nullable(),
  }),
  savedQuery: z.object({
    category: z.string().optional(),
  }),
  idParams: z.object({ id: parseIntParam }),
};

export const messagesSchemas = {
  userIdParams: z.object({ userId: parseIntParam }),
  send: z.object({
    receiverId: z.number().int().positive(),
    content: z.string().min(1),
  }),
};

export const jobsSchemas = {
  query: z.object({
    languagePair: z.string().optional(),
    mode: z.string().optional(),
    specialty: z.string().optional(),
    urgent: z.preprocess((value) => {
      if (typeof value === "string") return value === "true";
      return value;
    }, z.boolean().optional()),
  }),
  create: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    languagePair: z.string().min(1),
    dialectPreference: z.string().optional().nullable(),
    mode: z.string().min(1),
    rateOffered: z.number().positive(),
    specialty: z.string().optional().nullable(),
    urgent: z.boolean().optional().default(false),
    remote: z.boolean().optional().default(true),
    location: z.string().optional().nullable(),
  }),
  idParams: z.object({ id: parseIntParam }),
  apply: z.object({ message: z.string().min(1) }),
};
