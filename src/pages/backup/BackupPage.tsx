import { useRef, useState, type ChangeEvent } from 'react';
import { exportBackup, downloadBackupFile, importBackupFile } from '../../shared/api/backup/backupApi';
import { GlassCard } from '../../shared/ui/GlassCard';
import { Button } from '../../shared/ui/Button';

export function BackupPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function handleExport() {
    const backup = await exportBackup();
    downloadBackupFile(backup);
    setStatus('Экспорт завершён.');
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await importBackupFile(file);
      setStatus('Импорт завершён, данные заменены.');
    } catch (error) {
      setStatus(`Ошибка импорта: ${(error as Error).message}`);
    } finally {
      event.target.value = '';
    }
  }

  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <h1 className="text-2xl font-semibold tracking-tight">Резервное копирование</h1>
      <GlassCard className="flex flex-col gap-3">
        <p className="text-sm text-white/60">
          Все данные хранятся локально в браузере без шифрования. Экспорт создаёт один JSON-файл
          со всеми сущностями.
        </p>
        <div className="flex gap-2">
          <Button onClick={handleExport}>Экспорт</Button>
          <Button variant="ghost" onClick={() => fileInputRef.current?.click()}>
            Импорт
          </Button>
          <input ref={fileInputRef} type="file" accept="application/json" hidden onChange={handleImport} />
        </div>
        {status && <p className="text-xs text-white/55">{status}</p>}
      </GlassCard>
    </div>
  );
}
