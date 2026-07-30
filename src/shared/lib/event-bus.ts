import type { EntityId } from '../types/entity';
import type { Goal } from '../../entities/goal/model/types';

export type LifeOSEvent =
  | { type: 'goal.created'; payload: { id: EntityId } }
  | { type: 'goal.updated'; payload: { id: EntityId; changes: Partial<Goal> } }
  | { type: 'task.created'; payload: { id: EntityId } }
  | { type: 'task.completed'; payload: { id: EntityId; completedAt: number } }
  | { type: 'habit.checked'; payload: { id: EntityId; date: string } }
  | { type: 'finance.created'; payload: { id: EntityId; amount: number } }
  | { type: 'diary.saved'; payload: { id: EntityId } };

type EventType = LifeOSEvent['type'];
type Handler<T extends EventType> = (event: Extract<LifeOSEvent, { type: T }>) => void;

export function createEventBus() {
  const handlers = new Map<EventType, Set<Handler<EventType>>>();

  function emit<T extends LifeOSEvent>(event: T): void {
    handlers.get(event.type)?.forEach((handler) => handler(event));
  }

  function on<T extends EventType>(type: T, handler: Handler<T>): () => void {
    const set = handlers.get(type) ?? new Set();
    set.add(handler as Handler<EventType>);
    handlers.set(type, set);
    return () => set.delete(handler as Handler<EventType>);
  }

  return { emit, on };
}

export type EventBus = ReturnType<typeof createEventBus>;

export const eventBus = createEventBus();
