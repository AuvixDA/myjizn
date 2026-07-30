import { createHashRouter } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { HomePage } from '../pages/home/HomePage';
import { GoalsPage } from '../pages/goals/GoalsPage';
import { TasksPage } from '../pages/tasks/TasksPage';
import { NotesPage } from '../pages/notes/NotesPage';
import { SearchPage } from '../pages/search/SearchPage';
import { BackupPage } from '../pages/backup/BackupPage';

// HashRouter: GitHub Pages serves a static SPA with no server-side rewrite
// rules, so hash-based routing avoids 404s on deep-link refresh.
export const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'goals', element: <GoalsPage /> },
      { path: 'tasks', element: <TasksPage /> },
      { path: 'notes', element: <NotesPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'backup', element: <BackupPage /> },
    ],
  },
]);
