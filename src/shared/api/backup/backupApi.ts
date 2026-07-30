import { db } from '../db/schema';
import { buildReverseIndex } from '../db/relations';
import { initSearchIndex } from '../../lib/search/searchClient';
import { migrateBackup } from './migrate';
import { CURRENT_BACKUP_VERSION, type BackupV1 } from './schema';

export async function exportBackup(): Promise<BackupV1> {
  const [goals, tasks, habits, diary, notes, finance, projects, settings] = await Promise.all([
    db.goals.toArray(),
    db.tasks.toArray(),
    db.habits.toArray(),
    db.diary.toArray(),
    db.notes.toArray(),
    db.finance.toArray(),
    db.projects.toArray(),
    db.settings.toArray(),
  ]);

  return {
    backupVersion: CURRENT_BACKUP_VERSION,
    exportedAt: Date.now(),
    goals,
    tasks,
    habits,
    diary,
    notes,
    finance,
    projects,
    settings,
    // Concrete entity types (Goal, Task, ...) are always a superset of the
    // loose zod "passthrough" shape used to validate untrusted imports, so
    // this boundary cast is safe for export (data we produced ourselves).
  } as unknown as BackupV1;
}

export function downloadBackupFile(backup: BackupV1): void {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `lifeos-backup-${new Date(backup.exportedAt).toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

// Import overwrites local data (MVP scope: no merge strategy — the PRD
// treats backup as a full snapshot, not a sync mechanism, since LifeOS is
// explicitly single-device/offline-only).
export async function importBackupFile(file: File): Promise<void> {
  const raw = JSON.parse(await file.text());
  const backup = migrateBackup(raw);

  await db.transaction(
    'rw',
    [db.goals, db.tasks, db.habits, db.diary, db.notes, db.finance, db.projects, db.settings],
    async () => {
      await Promise.all([
        db.goals.clear(),
        db.tasks.clear(),
        db.habits.clear(),
        db.diary.clear(),
        db.notes.clear(),
        db.finance.clear(),
        db.projects.clear(),
        db.settings.clear(),
      ]);
      await Promise.all([
        db.goals.bulkAdd(backup.goals as never[]),
        db.tasks.bulkAdd(backup.tasks as never[]),
        db.habits.bulkAdd(backup.habits as never[]),
        db.diary.bulkAdd(backup.diary as never[]),
        db.notes.bulkAdd(backup.notes as never[]),
        db.finance.bulkAdd(backup.finance as never[]),
        db.projects.bulkAdd(backup.projects as never[]),
        db.settings.bulkAdd(backup.settings as never[]),
      ]);
    },
  );

  await Promise.all([buildReverseIndex(), initSearchIndex()]);
}
