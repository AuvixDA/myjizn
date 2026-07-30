import { NavLink, Outlet } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/goals', label: 'Goals' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/notes', label: 'Notes' },
  { to: '/search', label: 'Search' },
  { to: '/backup', label: 'Backup' },
] as const;

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <nav className="md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-white/10 p-4 flex md:flex-col gap-1 overflow-x-auto">
        <span className="hidden md:block text-lg font-semibold px-2 pb-4">LifeOS</span>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={'end' in item ? item.end : false}
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm whitespace-nowrap transition-colors ${
                isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <main className="flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
