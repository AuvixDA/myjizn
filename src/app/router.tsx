import { lazy } from 'react';
import { createHashRouter } from 'react-router-dom';
import { AppLayout } from './AppLayout';

// Routes are code-split per page — the initial bundle only needs the app
// shell; each page's chunk loads on first visit (see AnimatedOutlet's
// Suspense boundary for the loading state).
const HomePage = lazy(() => import('../pages/home/HomePage').then((m) => ({ default: m.HomePage })));
const GoalsPage = lazy(() => import('../pages/goals/GoalsPage').then((m) => ({ default: m.GoalsPage })));
const TasksPage = lazy(() => import('../pages/tasks/TasksPage').then((m) => ({ default: m.TasksPage })));
const NotesPage = lazy(() => import('../pages/notes/NotesPage').then((m) => ({ default: m.NotesPage })));
const SearchPage = lazy(() => import('../pages/search/SearchPage').then((m) => ({ default: m.SearchPage })));
const BackupPage = lazy(() => import('../pages/backup/BackupPage').then((m) => ({ default: m.BackupPage })));
const SettingsPage = lazy(() => import('../pages/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })));

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
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
]);
