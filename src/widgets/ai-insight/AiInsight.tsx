import { useGoals } from '../../entities/goal/api/goalApi';
import { useTasks } from '../../entities/task/api/taskApi';
import { useHabits } from '../../entities/habit/api/habitApi';
import { useFinanceEntries } from '../../entities/finance/api/financeApi';
import { computeInsight } from './model/insightEngine';
import { GlassCard } from '../../shared/ui/GlassCard';

interface AiInsightProps {
  delay?: number;
}

export function AiInsight({ delay = 0 }: AiInsightProps) {
  const { data: goals } = useGoals();
  const { data: tasks } = useTasks();
  const { data: habits } = useHabits();
  const { data: finance } = useFinanceEntries();

  if (!goals || !tasks || !habits || !finance) return null;

  const insight = computeInsight({ goals, tasks, habits, finance });
  if (!insight) return null;

  return (
    <GlassCard delay={delay} className="flex items-start gap-3 bg-gradient-to-br from-accent/10 to-transparent">
      <span className="text-lg leading-none mt-0.5">✨</span>
      <div>
        <h2 className="text-xs text-white/60 mb-1">Инсайт</h2>
        <p className="text-sm text-white/85">{insight.text}</p>
      </div>
    </GlassCard>
  );
}
