import type { RealtimeClient, RealtimeEvents, RealtimeState } from './realtimeClient';

type Handler = (payload: unknown) => void;

/**
 * SignalR adapter. The library is loaded on first connect so it never enters
 * the main bundle. The access token comes from the auth store at connect time.
 */
export function createSignalRClient(
  hubUrl: string,
  getAccessToken: () => string | null,
): RealtimeClient {
  const handlers = new Map<string, Set<Handler>>();
  const stateHandlers = new Set<(state: RealtimeState) => void>();
  let state: RealtimeState = 'disconnected';
  let connection: {
    start: () => Promise<void>;
    stop: () => Promise<void>;
    on: (name: string, cb: Handler) => void;
    onclose: (cb: () => void) => void;
    onreconnecting: (cb: () => void) => void;
    onreconnected: (cb: () => void) => void;
  } | null = null;

  const setState = (next: RealtimeState) => {
    state = next;
    stateHandlers.forEach((h) => h(next));
  };

  const dispatch = (event: string, payload: unknown) =>
    handlers.get(event)?.forEach((h) => h(payload));

  return {
    get state() {
      return state;
    },
    async connect() {
      if (connection) return;
      setState('connecting');
      const signalR = await import('@microsoft/signalr');
      const built = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, { accessTokenFactory: () => getAccessToken() ?? '' })
        .withAutomaticReconnect()
        .build();
      (
        ['notification.created', 'stock.updated', 'document.statusChanged'] satisfies Array<
          keyof RealtimeEvents
        >
      ).forEach((event) => built.on(event, (payload: unknown) => dispatch(event, payload)));
      built.onclose(() => setState('disconnected'));
      built.onreconnecting(() => setState('connecting'));
      built.onreconnected(() => setState('connected'));
      connection = built;
      await built.start();
      setState('connected');
    },
    async disconnect() {
      await connection?.stop();
      connection = null;
      setState('disconnected');
    },
    on(event, handler) {
      const set = handlers.get(event) ?? new Set();
      set.add(handler as Handler);
      handlers.set(event, set);
      return () => {
        set.delete(handler as Handler);
      };
    },
    onStateChange(handler) {
      stateHandlers.add(handler);
      return () => {
        stateHandlers.delete(handler);
      };
    },
  };
}
