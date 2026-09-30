import type { Id, LocaleTag, RecordStatus, TimeZoneId } from './common';
import type { PermissionKey } from './permission';

export interface User {
  id: Id;
  tenantId: Id;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  status: RecordStatus;
  /** Companies this user may work in, as reported by the backend. */
  companyIds: Id[];
  roleIds: Id[];
  /** Effective permission keys, flattened by the backend. UX only. */
  permissions: PermissionKey[];
  preferredLocale?: LocaleTag;
  preferredTimeZone?: TimeZoneId;
}

/** Shape used by headers/menus; avoids dragging the full profile around. */
export interface UserSummary {
  id: Id;
  displayName: string;
  email: string;
  avatarUrl?: string;
}
