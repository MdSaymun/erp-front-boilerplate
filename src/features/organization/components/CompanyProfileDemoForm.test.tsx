import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CompanyProfileDemoForm } from '@/features/organization/components/CompanyProfileDemoForm';
import { renderWithProviders } from '@/test/utils';

describe('CompanyProfileDemoForm', () => {
  it('renders an Ant Design form with labelled fields', () => {
    renderWithProviders(<CompanyProfileDemoForm />);

    expect(
      screen.getByRole('form', { name: 'Company profile demonstration form' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Company name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Base currency/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Time zone/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Validate' })).toBeInTheDocument();
  });

  it('shows Zod validation messages and blocks submission for invalid input', async () => {
    const user = userEvent.setup();
    const onSubmitted = vi.fn();
    renderWithProviders(<CompanyProfileDemoForm onSubmitted={onSubmitted} />);

    await user.type(screen.getByLabelText(/Company name/), 'A');
    await user.click(screen.getByRole('button', { name: 'Validate' }));

    expect(
      await screen.findByText('Company name must be at least 2 characters'),
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Currency must be a 3-letter ISO 4217 code'),
    ).toBeInTheDocument();
    expect(await screen.findByText('Time zone is required')).toBeInTheDocument();
    expect(onSubmitted).not.toHaveBeenCalled();
  });
});
