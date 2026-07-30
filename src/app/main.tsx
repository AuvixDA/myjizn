import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AppProviders } from './providers';
import { router } from './router';
import { buildReverseIndex } from '../shared/api/db/relations';
import { initSearchIndex } from '../shared/lib/search/searchClient';
import '../shared/ui/tailwind.css';

// Reverse relations index and search index must exist before any widget
// subscribes to the Life Graph or Search renders, so both are built before
// the first paint rather than lazily.
Promise.all([buildReverseIndex(), initSearchIndex()]).then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>,
  );
});
