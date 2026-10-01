import { env } from '@/config/env';
import { useAuthStore } from '@/stores/authStore';

import { noopRealtimeClient, type RealtimeClient } from './realtimeClient';
import { createSignalRClient } from './signalrClient';

export type { RealtimeClient, RealtimeEvents, RealtimeState } from './realtimeClient';
export { noopRealtimeClient };

/** Application realtime client: SignalR when a hub URL is configured, otherwise a no-op. */
export function createRealtimeClient(): RealtimeClient {
  if (!env.realtimeUrl) return noopRealtimeClient;
  return createSignalRClient(env.realtimeUrl, () => useAuthStore.getState().accessToken);
}
