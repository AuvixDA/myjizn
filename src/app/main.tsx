import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AppProviders } from './providers';
import { router } from './router';
import { buildReverseIndex } from '../shared/api/db/relations';
import { initSearchIndex } from '../shared/lib/search/searchClient';
import { initGoalEventsSync } from '../entities/goal/api/goalApi';
import { initTaskEventsSync } from '../entities/task/api/taskApi';
import { initNoteEventsSync } from '../entities/note/api/noteApi';
import { initHabitEventsSync } from '../entities/habit/api/habitApi';
import { initDiaryEventsSync } from '../entities/diary/api/diaryApi';
import { initFinanceEventsSync } from '../entities/finance/api/financeApi';
import { initProjectEventsSync } from '../entities/project/api/projectApi';
import '../shared/ui/tailwind.css';

// Reverse relations index and search index must exist before any widget
// subscribes to the Life Graph or Search renders, so both are built before
// the first paint rather than lazily.
Promise.all([buildReverseIndex(), initSearchIndex()]).then(() => {
  // Global, not component-scoped: query cache invalidation and derived
  // state (goal progress) must stay correct even while the relevant page
  // isn't mounted to "hear" the event (see queryClient.ts).
  initGoalEventsSync();
  initTaskEventsSync();
  initNoteEventsSync();
  initHabitEventsSync();
  initDiaryEventsSync();
  initFinanceEventsSync();
  initProjectEventsSync();

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>,
  );
});
