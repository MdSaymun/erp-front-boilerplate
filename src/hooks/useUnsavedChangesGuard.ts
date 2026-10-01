import { App } from 'antd';
import { useCallback, useEffect, useEffectEvent, useRef } from 'react';
import { useBeforeUnload, useBlocker } from 'react-router';

interface GuardOptions {
  title?: string;
  description?: string;
}

/**
 * Blocks in-app navigation and tab close while a form has unsaved changes.
 * Must be used inside a data router. Call `allowNext()` right before a
 * programmatic navigation that should not be blocked (e.g. after a save).
 */
export function useUnsavedChangesGuard(isDirty: boolean, options: GuardOptions = {}) {
  const { modal } = App.useApp();
  const bypassRef = useRef(false);

  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    if (bypassRef.current) return false;
    return isDirty && currentLocation.pathname !== nextLocation.pathname;
  });

  useBeforeUnload(
    useCallback(
      (event: BeforeUnloadEvent) => {
        if (isDirty && !bypassRef.current) event.preventDefault();
      },
      [isDirty],
    ),
  );

  const proceed = useEffectEvent(() => {
    if (blocker.state === 'blocked') blocker.proceed();
  });
  const reset = useEffectEvent(() => {
    if (blocker.state === 'blocked') blocker.reset();
  });

  const openDialog = useEffectEvent(() =>
    modal.confirm({
      title: options.title ?? 'Discard unsaved changes?',
      content:
        options.description ??
        'You have changes that have not been saved. Leaving this page will discard them.',
      okText: 'Discard',
      okButtonProps: { danger: true },
      cancelText: 'Keep editing',
      onOk: () => proceed(),
      onCancel: () => reset(),
    }),
  );

  useEffect(() => {
    if (blocker.state !== 'blocked') return undefined;
    const instance = openDialog();
    return () => instance.destroy();
  }, [blocker.state]);

  const allowNext = useCallback(() => {
    bypassRef.current = true;
  }, []);

  return { allowNext, isBlocked: blocker.state === 'blocked' };
}
