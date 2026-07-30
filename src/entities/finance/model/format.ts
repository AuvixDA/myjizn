export function formatMoney(amountMinorUnits: number, currency: string): string {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency, maximumFractionDigits: 2 }).format(
    amountMinorUnits / 100,
  );
}
