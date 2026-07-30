import { z } from 'zod';
import { backupV1Schema, CURRENT_BACKUP_VERSION, type BackupV1 } from './schema';

type Migration = (data: unknown) => unknown;

// Each future backupVersion bump adds one entry here: (version - 1) -> version.
// Kept as a chain (not a single big switch) so each step stays reviewable
// in isolation, per PRD "BACKUP".
const migrations: Record<number, Migration> = {
  1: (data) => data,
};

const versionEnvelope = z.object({ backupVersion: z.number() });

export function migrateBackup(raw: unknown): BackupV1 {
  const { backupVersion } = versionEnvelope.parse(raw);

  let data = raw;
  for (let v = backupVersion; v < CURRENT_BACKUP_VERSION; v++) {
    const step = migrations[v + 1];
    if (!step) {
      throw new Error(`No migration path from backupVersion ${v} to ${v + 1}`);
    }
    data = step(data);
  }

  return backupV1Schema.parse(data);
}
