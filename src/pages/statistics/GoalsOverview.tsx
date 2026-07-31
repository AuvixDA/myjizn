import { motion } from 'framer-motion';
import { useGoals } from '../../entities/goal/api/goalApi';
import { GlassCard } from '../../shared/ui/GlassCard';

export function GoalsOverview() {
  const { data: goals } = useGoals();
  const active = goals?.filter((g) => g.status === 'active');

  if (!active || active.length === 0) return null;

  return (
    <GlassCard>
      <h2 className="text-xs text-white/60 mb-4">Прогресс активных целей</h2>
      <div className="flex flex-col gap-3">
        {active.map((goal) => (
          <div key={goal.id}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm truncate">{goal.title}</span>
              <span className="text-xs text-white/50 tabular-nums shrink-0 ml-2">{goal.progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${goal.progress}%` }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-accent-dim to-accent-soft"
              />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
