import { useEffect, useEffectEvent } from 'react';

import { useRealtimeClient } from '@/app/providers/RealtimeProvider';
import type { RealtimeEvents } from '@/services/realtime';

/** Subscribes to a server-push event for the component's lifetime (typically to invalidate queries). */
export function useRealtimeEvent<E extends keyof RealtimeEvents>(
  event: E,
  handler: (payload: RealtimeEvents[E]) => void,
): void {
  const client = useRealtimeClient();
  const onEvent = useEffectEvent((payload: RealtimeEvents[E]) => handler(payload));

  useEffect(() => client.on(event, (payload) => onEvent(payload)), [client, event]);
}
