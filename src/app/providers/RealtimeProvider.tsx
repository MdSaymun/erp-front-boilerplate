import { createContext, type PropsWithChildren, useContext, useEffect, useMemo } from 'react';

import { createRealtimeClient, noopRealtimeClient, type RealtimeClient } from '@/services/realtime';
import { useAuthStore } from '@/stores/authStore';

const RealtimeContext = createContext<RealtimeClient>(noopRealtimeClient);

interface RealtimeProviderProps extends PropsWithChildren {
  client?: RealtimeClient;
}

/** Connects while a session is active; no-op when realtime is not configured. */
export function RealtimeProvider({ children, client }: RealtimeProviderProps) {
  const status = useAuthStore((state) => state.status);
  const value = useMemo(() => client ?? createRealtimeClient(), [client]);

  useEffect(() => {
    if (status !== 'authenticated' || value.state === 'disabled') return undefined;
    void value.connect().catch(() => {});
    return () => {
      void value.disconnect();
    };
  }, [status, value]);

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtimeClient(): RealtimeClient {
  return useContext(RealtimeContext);
}
