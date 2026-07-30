import { useState, type FormEvent } from 'react';
import { createFinanceEntry } from '../../entities/finance/api/financeApi';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';

type Direction = 'expense' | 'income';

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

export function CreateFinanceForm() {
  const [amount, setAmount] = useState('');
  const [direction, setDirection] = useState<Direction>('expense');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(todayInputValue());
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const parsed = Number(amount.replace(',', '.'));
    if (!parsed || parsed <= 0 || !category.trim()) return;

    setSubmitting(true);
    try {
      const minorUnits = Math.round(parsed * 100) * (direction === 'expense' ? -1 : 1);
      await createFinanceEntry({
        amount: minorUnits,
        category: category.trim(),
        date: new Date(date).getTime(),
      });
      setAmount('');
      setCategory('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <div className="flex rounded-xl bg-white/[0.04] border border-white/[0.08] p-1 shrink-0">
        {(['expense', 'income'] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDirection(d)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              direction === d ? (d === 'expense' ? 'bg-rose-400/20 text-rose-300' : 'bg-emerald-400/20 text-emerald-300') : 'text-white/40'
            }`}
          >
            {d === 'expense' ? 'Расход' : 'Доход'}
          </button>
        ))}
      </div>
      <Input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Сумма"
        inputMode="decimal"
        className="sm:w-28"
      />
      <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Категория" className="flex-1" />
      <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="sm:w-40" />
      <Button type="submit" disabled={submitting || !amount || !category.trim()}>
        Добавить
      </Button>
    </form>
  );
}
