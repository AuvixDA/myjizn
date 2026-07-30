import type { BaseEntity } from '../../../shared/types/entity';

export const SETTINGS_SINGLETON_ID = 'settings';

export interface Settings extends BaseEntity {
  id: typeof SETTINGS_SINGLETON_ID;
  theme: 'dark'; // MVP: dark-only, per UI spec
  weekStartsOn: 'monday' | 'sunday';
  encryptionEnabled: boolean; // post-MVP, see PRD Security section
}
