import type { EntityId } from '../types/entity';

// Payloads intentionally carry only ids/primitives, never full entities:
// consumers re-read current state from Dexie (source of truth), keeping
// this module free of dependencies on entities/* (shared must stay the
// lowest FSD layer).
export type LifeOSEvent =
  | { type: 'goal.created'; payload: { id: EntityId } }
  | { type: 'goal.updated'; payload: { id: EntityId } }
  | { type: 'goal.deleted'; payload: { id: EntityId } }
  | { type: 'task.created'; payload: { id: EntityId } }
  | { type: 'task.updated'; payload: { id: EntityId } }
  | { type: 'task.completed'; payload: { id: EntityId; completedAt: number } }
  // linkedGoalIds is included (not just the id) because by the time this
  // fires the task row is already gone — consumers can't re-read it from
  // Dexie the way every other handler does, so the ids it needs travel
  // with the event instead.
  | { type: 'task.deleted'; payload: { id: EntityId; linkedGoalIds: EntityId[] } }
  | { type: 'habit.created'; payload: { id: EntityId } }
  | { type: 'habit.updated'; payload: { id: EntityId } }
  | { type: 'habit.checked'; payload: { id: EntityId; date: string } }
  | { type: 'habit.deleted'; payload: { id: EntityId } }
  | { type: 'finance.created'; payload: { id: EntityId; amount: number } }
  | { type: 'finance.updated'; payload: { id: EntityId } }
  | { type: 'finance.deleted'; payload: { id: EntityId } }
  | { type: 'diary.saved'; payload: { id: EntityId } }
  | { type: 'diary.deleted'; payload: { id: EntityId } }
  | { type: 'note.created'; payload: { id: EntityId } }
  | { type: 'note.updated'; payload: { id: EntityId } }
  | { type: 'note.deleted'; payload: { id: EntityId } }
  | { type: 'project.created'; payload: { id: EntityId } };

type EventType = LifeOSEvent['type'];
type Handler<T extends EventType> = (event: Extract<LifeOSEvent, { type: T }>) => void;

// Handlers are stored type-erased (the public on/emit signatures below are
// what keep this type-safe for callers); a single cast point here is
// simpler and safer than threading a generic through the Map itself.
type ErasedHandler = (event: LifeOSEvent) => void;

export function createEventBus() {
  const handlers = new Map<EventType, Set<ErasedHandler>>();

  function emit<T extends LifeOSEvent>(event: T): void {
    handlers.get(event.type)?.forEach((handler) => handler(event));
  }

  function on<T extends EventType>(type: T, handler: Handler<T>): () => void {
    const set = handlers.get(type) ?? new Set();
    const erased = handler as ErasedHandler;
    set.add(erased);
    handlers.set(type, set);
    return () => set.delete(erased);
  }

  return { emit, on };
}

export type EventBus = ReturnType<typeof createEventBus>;

export const eventBus = createEventBus();
