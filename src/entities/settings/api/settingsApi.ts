import { useQuery, useQueryClient } from '@tanstack/react-query';
import { db } from '../../../shared/api/db/schema';
import { SETTINGS_SINGLETON_ID, type Settings } from '../model/types';

export const SETTINGS_QUERY_KEY = ['settings'] as const;

const DEFAULT_SETTINGS: Settings = {
  id: SETTINGS_SINGLETON_ID,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  relations: [],
  theme: 'dark',
  weekStartsOn: 'monday',
  encryptionEnabled: false,
};

async function getOrCreateSettings(): Promise<Settings> {
  const existing = await db.settings.get(SETTINGS_SINGLETON_ID);
  if (existing) return existing;
  await db.settings.add(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}

export function useSettings() {
  return useQuery({ queryKey: SETTINGS_QUERY_KEY, queryFn: getOrCreateSettings });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return async (changes: Partial<Pick<Settings, 'weekStartsOn'>>) => {
    await getOrCreateSettings();
    await db.settings.update(SETTINGS_SINGLETON_ID, { ...changes, updatedAt: Date.now() });
    await queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
  };
}
