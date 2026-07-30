import { z } from 'zod';

const relationSchema = z.object({
  targetId: z.string(),
  targetType: z.enum(['goal', 'task', 'habit', 'diary', 'note', 'finance', 'project']),
  type: z.enum(['blocks', 'supports', 'relates-to', 'derived-from', 'tracks', 'part-of']),
});

const baseEntitySchema = z.object({
  id: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  deletedAt: z.number().optional(),
  relations: z.array(relationSchema),
});

// MVP scope: fields kept loose (passthrough) beyond BaseEntity, since each
// entity's own shape evolves independently — strict validation per entity
// type belongs to the corresponding entities/<kind>/model, not here.
const looseEntity = baseEntitySchema.passthrough();

export const backupV1Schema = z.object({
  backupVersion: z.literal(1),
  exportedAt: z.number(),
  goals: z.array(looseEntity),
  tasks: z.array(looseEntity),
  habits: z.array(looseEntity),
  diary: z.array(looseEntity),
  notes: z.array(looseEntity),
  finance: z.array(looseEntity),
  projects: z.array(looseEntity),
  settings: z.array(looseEntity),
});

export type BackupV1 = z.infer<typeof backupV1Schema>;

export const CURRENT_BACKUP_VERSION = 1;
