import { NavLink, Outlet } from 'react-router-dom';
import { HomeIcon, GoalIcon, TaskIcon, NoteIcon, SearchIcon, BackupIcon } from '../shared/ui/icons';

const NAV_ITEMS = [
  { to: '/', label: 'Главная', end: true, Icon: HomeIcon },
  { to: '/goals', label: 'Цели', end: false, Icon: GoalIcon },
  { to: '/tasks', label: 'Задачи', end: false, Icon: TaskIcon },
  { to: '/notes', label: 'Заметки', end: false, Icon: NoteIcon },
  { to: '/search', label: 'Поиск', end: false, Icon: SearchIcon },
  { to: '/backup', label: 'Бэкап', end: false, Icon: BackupIcon },
] as const;

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Desktop / tablet sidebar */}
      <nav className="hidden md:flex md:w-56 shrink-0 border-r border-white/10 p-4 flex-col gap-1">
        <span className="text-lg font-semibold px-2 pb-4">LifeOS</span>
        {NAV_ITEMS.map(({ to, label, end, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <main className="flex-1 p-4 pb-24 md:p-8 md:pb-8">
        <Outlet />
      </main>

      {/* Mobile bottom tab bar */}
      <nav
        className="md:hidden fixed inset-x-0 bottom-0 z-10 border-t border-white/10 bg-surface-raised/80 backdrop-blur-glass"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-6">
          {NAV_ITEMS.map(({ to, label, end, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2 text-[10px] leading-none transition-colors ${
                  isActive ? 'text-white' : 'text-white/50'
                }`
              }
            >
              <Icon className="size-5" />
              <span className="truncate max-w-full px-0.5">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
