import Dexie, { type EntityTable } from 'dexie';
import type { Goal } from '../../../entities/goal/model/types';
import type { Task } from '../../../entities/task/model/types';
import type { Habit } from '../../../entities/habit/model/types';
import type { DiaryEntry } from '../../../entities/diary/model/types';
import type { Note } from '../../../entities/note/model/types';
import type { FinanceEntry } from '../../../entities/finance/model/types';
import type { Project } from '../../../entities/project/model/types';
import type { Settings } from '../../../entities/settings/model/types';

export class LifeOSDatabase extends Dexie {
  goals!: EntityTable<Goal, 'id'>;
  tasks!: EntityTable<Task, 'id'>;
  habits!: EntityTable<Habit, 'id'>;
  diary!: EntityTable<DiaryEntry, 'id'>;
  notes!: EntityTable<Note, 'id'>;
  finance!: EntityTable<FinanceEntry, 'id'>;
  projects!: EntityTable<Project, 'id'>;
  settings!: EntityTable<Settings, 'id'>;

  constructor() {
    super('lifeos');
    // Only indexed fields need listing; `relations` is queried in-memory
    // via the reverse index built in relations.ts, not via a Dexie index.
    this.version(1).stores({
      goals: 'id, status, updatedAt',
      tasks: 'id, status, dueDate, updatedAt',
      habits: 'id, updatedAt',
      diary: 'id, date, updatedAt',
      notes: 'id, pinned, updatedAt',
      finance: 'id, date, category, updatedAt',
      projects: 'id, status, updatedAt',
      settings: 'id',
    });
  }
}

export const db = new LifeOSDatabase();
