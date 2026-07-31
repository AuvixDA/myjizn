import { NavLink } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  HomeIcon,
  GoalIcon,
  TaskIcon,
  FlameIcon,
  NoteIcon,
  DiaryIcon,
  FinanceIcon,
  ProjectIcon,
  StatisticsIcon,
  SearchIcon,
  BackupIcon,
  SettingsIcon,
  MoreIcon,
} from '../shared/ui/icons';
import { AnimatedOutlet } from './AnimatedOutlet';

// Desktop sidebar fits every section as a plain vertical list.
const DESKTOP_NAV_ITEMS = [
  { to: '/', label: 'Главная', end: true, Icon: HomeIcon },
  { to: '/goals', label: 'Цели', end: false, Icon: GoalIcon },
  { to: '/tasks', label: 'Задачи', end: false, Icon: TaskIcon },
  { to: '/habits', label: 'Привычки', end: false, Icon: FlameIcon },
  { to: '/notes', label: 'Заметки', end: false, Icon: NoteIcon },
  { to: '/diary', label: 'Дневник', end: false, Icon: DiaryIcon },
  { to: '/finance', label: 'Финансы', end: false, Icon: FinanceIcon },
  { to: '/projects', label: 'Проекты', end: false, Icon: ProjectIcon },
  { to: '/statistics', label: 'Статистика', end: false, Icon: StatisticsIcon },
  { to: '/search', label: 'Поиск', end: false, Icon: SearchIcon },
  { to: '/backup', label: 'Бэкап', end: false, Icon: BackupIcon },
] as const;

// Mobile bottom bar only fits ~5 items before it gets cramped, so it keeps
// the daily-use core and pushes everything else behind "Ещё" (see MorePage).
const MOBILE_NAV_ITEMS = [
  { to: '/', label: 'Главная', end: true, Icon: HomeIcon },
  { to: '/tasks', label: 'Задачи', end: false, Icon: TaskIcon },
  { to: '/habits', label: 'Привычки', end: false, Icon: FlameIcon },
  { to: '/notes', label: 'Заметки', end: false, Icon: NoteIcon },
  { to: '/more', label: 'Ещё', end: false, Icon: MoreIcon },
] as const;

const SPRING = { type: 'spring', stiffness: 500, damping: 38 } as const;
const FOCUS_RING = 'outline-none focus-visible:ring-2 focus-visible:ring-accent-soft';

export function AppLayout() {
  const reduceMotion = useReducedMotion();
  const pillTransition = reduceMotion ? { duration: 0 } : SPRING;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Перейти к содержимому
      </a>

      {/* Desktop / tablet sidebar */}
      <nav className="hidden md:flex md:w-56 shrink-0 border-r border-white/[0.06] p-4 flex-col gap-1 overflow-y-auto">
        <span className="text-lg font-semibold px-2 pb-4 tracking-tight">LifeOS</span>
        {DESKTOP_NAV_ITEMS.map(({ to, label, end, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={`relative rounded-lg px-3 py-2 text-sm transition-colors text-white/55 hover:text-white/90 [&.active]:text-white ${FOCUS_RING}`}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active-pill"
                    transition={pillTransition}
                    className="absolute inset-0 rounded-lg bg-white/[0.08] border border-white/[0.06]"
                  />
                )}
                <span className="relative flex items-center gap-2.5">
                  <Icon className="size-4 shrink-0" />
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}

        <NavLink
          to="/settings"
          className={`relative mt-auto rounded-lg px-3 py-2 text-sm transition-colors text-white/60 hover:text-white/90 [&.active]:text-white ${FOCUS_RING}`}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId="sidebar-active-pill"
                  transition={pillTransition}
                  className="absolute inset-0 rounded-lg bg-white/[0.08] border border-white/[0.06]"
                />
              )}
              <span className="relative flex items-center gap-2.5">
                <SettingsIcon className="size-4 shrink-0" />
                Настройки
              </span>
            </>
          )}
        </NavLink>
      </nav>

      <main id="main-content" className="relative flex-1 p-4 pb-24 md:p-8 md:pb-8 overflow-x-hidden">
        <NavLink
          to="/settings"
          className={`md:hidden absolute top-4 right-4 z-10 flex items-center justify-center size-9 rounded-full bg-white/[0.06] text-white/60 [&.active]:text-white [&.active]:bg-white/[0.12] ${FOCUS_RING}`}
          aria-label="Настройки"
        >
          <SettingsIcon className="size-4" />
        </NavLink>
        <AnimatedOutlet />
      </main>

      {/* Mobile bottom tab bar */}
      <nav
        className="md:hidden fixed inset-x-0 bottom-0 z-10 border-t border-white/[0.06] bg-surface-raised/70 backdrop-blur-glass"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-5">
          {MOBILE_NAV_ITEMS.map(({ to, label, end, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={`relative flex flex-col items-center gap-1 py-2.5 ${FOCUS_RING} focus-visible:ring-inset`}
            >
              {({ isActive }) => (
                <>
                  <span className="relative flex items-center justify-center">
                    {isActive && (
                      <motion.span
                        layoutId="mobile-active-pill"
                        transition={pillTransition}
                        className="absolute -inset-2 rounded-full bg-accent/20"
                      />
                    )}
                    <Icon className={`relative size-5 transition-colors ${isActive ? 'text-white' : 'text-white/45'}`} />
                  </span>
                  <span className={`text-[10px] leading-none truncate max-w-full px-0.5 transition-colors ${isActive ? 'text-white' : 'text-white/60'}`}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
