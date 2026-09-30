import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DocumentStatusTag } from '@/components/documents/DocumentStatusTag';

describe('DocumentStatusTag', () => {
  it('renders a readable label so status never relies on colour alone', () => {
    render(<DocumentStatusTag status="pending" />);

    const tag = screen.getByText('Pending approval');
    expect(tag).toBeInTheDocument();
    expect(tag).toHaveAttribute('data-status', 'pending');
  });
});
