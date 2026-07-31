import { useFinanceEntries } from '../../entities/finance/api/financeApi';
import { formatMoney } from '../../entities/finance/model/format';
import { GlassCard } from '../../shared/ui/GlassCard';

const DAY_MS = 24 * 60 * 60 * 1000;

interface FinanceSummaryProps {
  delay?: number;
}

export function FinanceSummary({ delay = 0 }: FinanceSummaryProps) {
  const { data: entries } = useFinanceEntries();
  if (!entries || entries.length === 0) return null;

  const currency = entries[0]?.currency ?? 'RUB';
  const balance = entries.reduce((sum, e) => sum + e.amount, 0);

  const thirtyDaysAgo = Date.now() - 30 * DAY_MS;
  const monthExpense = entries
    .filter((e) => e.amount < 0 && e.date >= thirtyDaysAgo)
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <GlassCard delay={delay} className="flex items-center justify-between">
      <div>
        <h2 className="text-xs text-white/60 mb-1">Баланс</h2>
        <p className={`text-lg font-medium tabular-nums ${balance < 0 ? 'text-rose-300' : ''}`}>
          {formatMoney(balance, currency)}
        </p>
      </div>
      <div className="text-right">
        <h2 className="text-xs text-white/60 mb-1">Расходы за 30 дней</h2>
        <p className="text-lg font-medium tabular-nums text-rose-300">{formatMoney(monthExpense, currency)}</p>
      </div>
    </GlassCard>
  );
}
