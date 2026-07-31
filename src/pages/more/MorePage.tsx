import { NavLink } from 'react-router-dom';
import {
  GoalIcon,
  DiaryIcon,
  FinanceIcon,
  ProjectIcon,
  StatisticsIcon,
  SearchIcon,
  BackupIcon,
  SettingsIcon,
  ChevronRightIcon,
} from '../../shared/ui/icons';
import { GlassCard } from '../../shared/ui/GlassCard';

const ITEMS = [
  { to: '/goals', label: 'Цели', Icon: GoalIcon },
  { to: '/diary', label: 'Дневник', Icon: DiaryIcon },
  { to: '/finance', label: 'Финансы', Icon: FinanceIcon },
  { to: '/projects', label: 'Проекты', Icon: ProjectIcon },
  { to: '/statistics', label: 'Статистика', Icon: StatisticsIcon },
  { to: '/search', label: 'Поиск', Icon: SearchIcon },
  { to: '/backup', label: 'Бэкап', Icon: BackupIcon },
  { to: '/settings', label: 'Настройки', Icon: SettingsIcon },
] as const;

// Mobile-only overflow destination: the bottom tab bar only fits ~5 items
// comfortably, so less-daily-use sections live behind this list instead of
// competing for the same row (see AppLayout).
export function MorePage() {
  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <h1 className="text-2xl font-semibold tracking-tight">Ещё</h1>
      <GlassCard className="flex flex-col divide-y divide-white/[0.06] p-0">
        {ITEMS.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} className="flex items-center gap-3 px-4 py-3.5 text-sm text-white/80 hover:text-white hover:bg-white/[0.03] transition-colors first:rounded-t-2xl last:rounded-b-2xl">
            <Icon className="size-4 text-white/50" />
            <span className="flex-1">{label}</span>
            <ChevronRightIcon className="size-4 text-white/30" />
          </NavLink>
        ))}
      </GlassCard>
    </div>
  );
}
