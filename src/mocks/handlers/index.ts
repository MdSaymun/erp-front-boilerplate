import { authHandlers } from './auth';
import { notificationHandlers, resetNotifications } from './notifications';
import { resetSampleRecords, sampleRecordHandlers } from './sampleRecords';
// <mock-imports>

/** All mock handlers. Modules add their own file here while their backend is pending. */
export const handlers = [
  ...authHandlers,
  ...notificationHandlers,
  ...sampleRecordHandlers,
  // <mock-handlers>
];

/** Restores in-memory mock data between tests. */
export function resetMockData(): void {
  resetSampleRecords();
  resetNotifications();
  // <mock-resets>
}
