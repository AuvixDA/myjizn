import { v4 as uuid } from 'uuid';
import { useQuery } from '@tanstack/react-query';
import { db } from '../../../shared/api/db/schema';
import { queryClient } from '../../../shared/api/queryClient';
import { reindexEntity, getIncomingRelations } from '../../../shared/api/db/relations';
import { deleteEntity } from '../../../shared/api/db/delete';
import { indexRecord } from '../../../shared/lib/search/searchClient';
import { eventBus } from '../../../shared/lib/event-bus';
import type { Project } from '../model/types';
import type { EntityId } from '../../../shared/types/entity';

export const PROJECTS_QUERY_KEY = ['projects'] as const;

export interface CreateProjectInput {
  title: string;
  description?: string;
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const now = Date.now();
  const project: Project = {
    id: uuid(),
    createdAt: now,
    updatedAt: now,
    relations: [],
    title: input.title,
    description: input.description,
    status: 'active',
  };
  await db.projects.add(project);
  reindexEntity('project', project);
  indexRecord({ id: project.id, kind: 'project', title: project.title });
  eventBus.emit({ type: 'project.created', payload: { id: project.id } });
  return project;
}

export async function updateProjectTitle(id: EntityId, title: string): Promise<void> {
  await db.projects.update(id, { title, updatedAt: Date.now() });
  indexRecord({ id, kind: 'project', title });
  eventBus.emit({ type: 'project.updated', payload: { id } });
}

export async function updateProjectStatus(id: EntityId, status: Project['status']): Promise<void> {
  await db.projects.update(id, { status, updatedAt: Date.now() });
  eventBus.emit({ type: 'project.updated', payload: { id } });
}

export async function deleteProject(id: EntityId): Promise<void> {
  await deleteEntity('project', id);
  eventBus.emit({ type: 'project.deleted', payload: { id } });
}

export function useProjects() {
  return useQuery({
    queryKey: PROJECTS_QUERY_KEY,
    queryFn: () => db.projects.orderBy('updatedAt').reverse().toArray(),
  });
}

// Number of tasks linked to this project via a "part-of" relation, read
// straight from the in-memory reverse index (no extra Dexie query). Not a
// hook — call it during render; the PROJECTS_QUERY_KEY invalidation wired
// up below already re-renders callers when a link changes.
export function getLinkedTaskCount(projectId: EntityId): number {
  return getIncomingRelations(projectId).filter((r) => r.sourceType === 'task' && r.relation.type === 'part-of').length;
}

export function initProjectEventsSync(): void {
  const invalidate = () => queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
  eventBus.on('project.created', invalidate);
  eventBus.on('project.updated', invalidate);
  eventBus.on('project.deleted', invalidate);
  // Linking a task to a project (or deleting a linked task) changes the
  // linked-item count shown on the project card.
  eventBus.on('task.created', invalidate);
  eventBus.on('task.deleted', invalidate);
}
