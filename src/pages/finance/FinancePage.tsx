import { useFinanceEntries } from '../../entities/finance/api/financeApi';
import { formatMoney } from '../../entities/finance/model/format';
import { CreateFinanceForm } from '../../features/create-finance/CreateFinanceForm';
import { FinanceRow } from '../../features/manage-finance/FinanceRow';
import { GlassCard } from '../../shared/ui/GlassCard';
import { Skeleton } from '../../shared/ui/Skeleton';

export function FinancePage() {
  const { data: entries, isPending } = useFinanceEntries();
  const currency = entries?.[0]?.currency ?? 'RUB';
  const balance = entries?.reduce((sum, e) => sum + e.amount, 0) ?? 0;

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Финансы</h1>

      <GlassCard>
        <p className="text-xs text-white/45 mb-1">Баланс</p>
        <p className={`text-3xl font-semibold tabular-nums ${balance < 0 ? 'text-rose-300' : ''}`}>
          {formatMoney(balance, currency)}
        </p>
      </GlassCard>

      <CreateFinanceForm />

      <GlassCard delay={0.05}>
        {isPending && (
          <div className="space-y-3.5">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        )}
        <ul className="space-y-3.5">
          {entries?.map((entry) => (
            <li key={entry.id}>
              <FinanceRow entry={entry} />
            </li>
          ))}
          {entries?.length === 0 && <p className="text-white/40 text-sm">Пока нет записей</p>}
        </ul>
      </GlassCard>
    </div>
  );
}
