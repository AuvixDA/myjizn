import { motion } from 'framer-motion';
import { useFinanceEntries } from '../../entities/finance/api/financeApi';
import { formatMoney } from '../../entities/finance/model/format';
import { GlassCard } from '../../shared/ui/GlassCard';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function ExpenseByCategory() {
  const { data: entries } = useFinanceEntries();
  if (!entries) return null;

  const recent = entries.filter((e) => e.amount < 0 && e.date >= Date.now() - THIRTY_DAYS_MS);
  if (recent.length === 0) return null;

  const currency = recent[0]?.currency ?? 'RUB';
  const byCategory = new Map<string, number>();
  for (const e of recent) byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + Math.abs(e.amount));
  const sorted = [...byCategory.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const max = sorted[0]?.[1] ?? 1;

  return (
    <GlassCard>
      <h2 className="text-xs text-white/60 mb-4">Расходы по категориям — 30 дней</h2>
      <div className="flex flex-col gap-3">
        {sorted.map(([category, amount]) => (
          <div key={category}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm truncate">{category}</span>
              <span className="text-xs text-white/50 tabular-nums shrink-0 ml-2">{formatMoney(-amount, currency)}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(amount / max) * 100}%` }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-rose-400/70"
              />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
