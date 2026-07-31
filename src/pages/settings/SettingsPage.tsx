import { useSettings, useUpdateSettings } from '../../entities/settings/api/settingsApi';
import { GlassCard } from '../../shared/ui/GlassCard';
import { Select } from '../../shared/ui/Input';

export function SettingsPage() {
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();

  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <h1 className="text-2xl font-semibold tracking-tight">Настройки</h1>

      <GlassCard className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Тема</p>
            <p className="text-xs text-white/55">В MVP доступна только тёмная тема</p>
          </div>
          <span className="text-sm text-white/50">Тёмная</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Начало недели</p>
            <p className="text-xs text-white/55">Влияет на будущие модули (Привычки)</p>
          </div>
          {settings && (
            <Select
              aria-label="Начало недели"
              value={settings.weekStartsOn}
              onChange={(e) => updateSettings({ weekStartsOn: e.target.value as 'monday' | 'sunday' })}
              className="w-36 py-1.5"
            >
              <option value="monday">Понедельник</option>
              <option value="sunday">Воскресенье</option>
            </Select>
          )}
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Шифрование данных</p>
            <p className="text-xs text-white/55">Для Финансов и Дневника, появится позже</p>
          </div>
          <span className="text-xs rounded-full px-2.5 py-1 bg-white/[0.06] text-white/55">Скоро</span>
        </div>
      </GlassCard>

      <GlassCard>
        <p className="text-sm font-medium mb-1">О приложении</p>
        <p className="text-xs text-white/55">
          LifeOS — офлайн PWA. Все данные хранятся локально в этом браузере, серверов и аккаунтов нет.
        </p>
      </GlassCard>
    </div>
  );
}
