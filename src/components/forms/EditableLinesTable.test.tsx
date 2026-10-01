import { zodResolver } from '@hookform/resolvers/zod';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from 'antd';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { ControlledFormItem } from '@/components/forms/ControlledFormItem';
import { EditableLinesTable } from '@/components/forms/EditableLinesTable';
import { renderWithProviders } from '@/test/utils';

const schema = z.object({
  lines: z
    .array(z.object({ description: z.string().min(1, { error: 'Required' }) }))
    .min(1, { error: 'Add at least one line' }),
});
type Values = z.infer<typeof schema>;

function Harness({ onValid }: { onValid: (values: Values) => void }) {
  const { control, handleSubmit, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { lines: [{ description: 'first' }, { description: 'second' }] },
  });
  return (
    <form onSubmit={handleSubmit(onValid)}>
      <EditableLinesTable<Values, 'lines'>
        control={control}
        name="lines"
        createLine={() => ({ description: '' })}
        errors={formState.errors}
        columns={[
          {
            key: 'description',
            title: 'Description',
            render: (index, c) => (
              <ControlledFormItem
                compact
                control={c}
                name={`lines.${index}.description`}
                render={(f, id) => (
                  <Input {...f} id={id} aria-label={`Line ${index + 1} description`} />
                )}
              />
            ),
          },
        ]}
      />
      <button type="submit">submit</button>
    </form>
  );
}

describe('EditableLinesTable', () => {
  it('adds, reorders and removes lines, and surfaces per-line validation', async () => {
    const user = userEvent.setup();
    const onValid = vi.fn();
    renderWithProviders(<Harness onValid={onValid} />);

    await user.click(screen.getByRole('button', { name: /Add line/ }));
    expect(screen.getAllByRole('textbox')).toHaveLength(3);

    await user.click(screen.getByRole('button', { name: 'Move line 2 up' }));
    expect(screen.getByLabelText('Line 1 description')).toHaveValue('second');

    await user.click(screen.getByRole('button', { name: 'submit' }));
    expect(await screen.findByText('Required')).toBeInTheDocument();
    expect(onValid).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Remove line 3' }));
    await user.click(screen.getByRole('button', { name: 'submit' }));
    expect(onValid).toHaveBeenCalledWith(
      { lines: [{ description: 'second' }, { description: 'first' }] },
      expect.anything(),
    );
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(3);
  });
});
