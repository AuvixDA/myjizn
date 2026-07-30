import { QueryClient } from '@tanstack/react-query';

// A module-level singleton (not created inside a component) so entity api
// modules can call invalidateQueries() from global event-bus subscriptions
// (see entities/*/api's initXEventsSync, wired up once in app/main.tsx),
// independent of whether any consuming page/component is currently
// mounted. Relying on a component-scoped hook for invalidation meant a
// cache update triggered while its page was closed silently never
// happened, and the next visit rendered stale data despite Dexie already
// having the correct state.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      refetchOnWindowFocus: false,
    },
  },
});
