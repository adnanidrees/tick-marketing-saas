import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const createWorkspaceSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(40).regex(/^[a-z0-9-]+$/)
});

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(80).optional(),
  password: z.string().min(8),
  workspaceId: z.string().min(1),
  role: z.enum(["CLIENT_ADMIN", "AGENT", "VIEWER"])
});

export const setModulesSchema = z.object({
  workspaceId: z.string().min(1),
  modules: z.array(z.object({ moduleKey: z.string().min(1), enabled: z.boolean() }))
});
