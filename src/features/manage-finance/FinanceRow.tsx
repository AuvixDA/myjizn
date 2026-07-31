import { useState } from 'react';
import { updateFinanceEntry, deleteFinanceEntry } from '../../entities/finance/api/financeApi';
import { formatMoney } from '../../entities/finance/model/format';
import type { FinanceEntry } from '../../entities/finance/model/types';
import { Input } from '../../shared/ui/Input';
import { IconButton } from '../../shared/ui/IconButton';
import { PencilIcon, TrashIcon, CheckIcon, XIcon } from '../../shared/ui/icons';

const DATE_FORMAT = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' });

interface FinanceRowProps {
  entry: FinanceEntry;
}

export function FinanceRow({ entry }: FinanceRowProps) {
  const [editing, setEditing] = useState(false);
  const [category, setCategory] = useState(entry.category);
  const [amount, setAmount] = useState(String(Math.abs(entry.amount) / 100));
  const isExpense = entry.amount < 0;

  async function handleSave() {
    const parsed = Number(amount.replace(',', '.'));
    if (!parsed || parsed <= 0 || !category.trim()) return;
    const minorUnits = Math.round(parsed * 100) * (isExpense ? -1 : 1);
    await updateFinanceEntry(entry.id, { amount: minorUnits, category: category.trim(), note: entry.note });
    setEditing(false);
  }

  function handleCancel() {
    setCategory(entry.category);
    setAmount(String(Math.abs(entry.amount) / 100));
    setEditing(false);
  }

  function handleDelete() {
    if (window.confirm(`Удалить запись «${entry.category}»?`)) void deleteFinanceEntry(entry.id);
  }

  if (editing) {
    return (
      <form
        className="flex items-center gap-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          void handleSave();
        }}
      >
        <Input autoFocus aria-label="Категория" value={category} onChange={(e) => setCategory(e.target.value)} className="flex-1 py-1.5" />
        <Input aria-label="Сумма" value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" className="w-20 py-1.5" />
        <IconButton type="submit" label="Сохранить">
          <CheckIcon className="size-4" />
        </IconButton>
        <IconButton type="button" label="Отмена" onClick={handleCancel}>
          <XIcon className="size-4" />
        </IconButton>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-white/35 w-12 shrink-0">{DATE_FORMAT.format(new Date(entry.date))}</span>
      <span className="flex-1 truncate">{entry.category}</span>
      <span className={`tabular-nums text-sm ${isExpense ? 'text-rose-300' : 'text-emerald-300'}`}>
        {isExpense ? '' : '+'}
        {formatMoney(entry.amount, entry.currency)}
      </span>
      <IconButton label="Редактировать" className="opacity-60 hover:opacity-100" onClick={() => setEditing(true)}>
        <PencilIcon className="size-3.5" />
      </IconButton>
      <IconButton label="Удалить" variant="danger" className="opacity-60 hover:opacity-100" onClick={handleDelete}>
        <TrashIcon className="size-3.5" />
      </IconButton>
    </div>
  );
}
