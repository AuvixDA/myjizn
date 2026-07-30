import { describe, expect, it, vi } from 'vitest';
import { createEventBus } from './event-bus';

describe('event bus', () => {
  it('delivers events only to subscribers of the matching type', () => {
    const bus = createEventBus();
    const taskHandler = vi.fn();
    const goalHandler = vi.fn();

    bus.on('task.created', taskHandler);
    bus.on('goal.created', goalHandler);
    bus.emit({ type: 'task.created', payload: { id: 't1' } });

    expect(taskHandler).toHaveBeenCalledWith({ type: 'task.created', payload: { id: 't1' } });
    expect(goalHandler).not.toHaveBeenCalled();
  });

  it('stops delivering events after unsubscribe', () => {
    const bus = createEventBus();
    const handler = vi.fn();
    const unsubscribe = bus.on('habit.checked', handler);

    unsubscribe();
    bus.emit({ type: 'habit.checked', payload: { id: 'h1', date: '2026-07-30' } });

    expect(handler).not.toHaveBeenCalled();
  });
});
