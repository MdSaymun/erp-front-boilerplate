import type { AppNotification } from '@/types/erp';

/** Server-push events. Modules extend this map via declaration merging. */
export interface RealtimeEvents {
  'notification.created': AppNotification;
  'stock.updated': { productId: string; warehouseId: string };
  'document.statusChanged': { documentType: string; documentId: string; status: string };
}

export type RealtimeState = 'disabled' | 'disconnected' | 'connecting' | 'connected';

export interface RealtimeClient {
  readonly state: RealtimeState;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  on: <E extends keyof RealtimeEvents>(
    event: E,
    handler: (payload: RealtimeEvents[E]) => void,
  ) => () => void;
  onStateChange: (handler: (state: RealtimeState) => void) => () => void;
}

/** Used when no hub URL is configured; every call is a no-op. */
export const noopRealtimeClient: RealtimeClient = {
  state: 'disabled',
  connect: async () => {},
  disconnect: async () => {},
  on: () => () => {},
  onStateChange: () => () => {},
};
