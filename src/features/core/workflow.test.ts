import { describe, expect, it } from 'vitest';

import { getAvailableTransitions, isEditable } from '@/features/core/workflow';
import type { WorkflowTransition } from '@/types/erp';

const transitions: WorkflowTransition[] = [
  { from: 'draft', to: 'pending', action: 'submit' },
  { from: 'pending', to: 'confirmed', action: 'confirm' },
  { from: 'pending', to: 'draft', action: 'reset' },
];

describe('workflow helpers', () => {
  it('returns only transitions available from the current status', () => {
    expect(getAvailableTransitions('pending', transitions).map((t) => t.action)).toEqual([
      'confirm',
      'reset',
    ]);
    expect(getAvailableTransitions('done', transitions)).toEqual([]);
  });

  it('knows which statuses allow editing', () => {
    expect(isEditable('draft')).toBe(true);
    expect(isEditable('posted')).toBe(false);
  });
});
