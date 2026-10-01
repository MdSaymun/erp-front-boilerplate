import { zodResolver } from '@hookform/resolvers/zod';
import { App, Card, Col, Input, InputNumber, Row, Select, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';

import { ConcurrencyConflictModal } from '@/components/feedback/ConcurrencyConflictModal';
import { ErrorState } from '@/components/feedback/ErrorState';
import { PageLoading } from '@/components/feedback/PageLoading';
import { applyServerErrors } from '@/components/forms/applyServerErrors';
import { ControlledFormItem } from '@/components/forms/ControlledFormItem';
import { EditableLinesTable, type EditableLineColumn } from '@/components/forms/EditableLinesTable';
import { FormPage } from '@/components/forms/FormPage';
import { LocalDatePicker } from '@/components/forms/inputs/LocalDatePicker';
import { MoneyInput } from '@/components/forms/inputs/MoneyInput';
import { ROUTES } from '@/constants/routes';
import { isApiError } from '@/services/api/errors';

import {
  DEFAULT_FORM_VALUES,
  EMPTY_LINE,
  type SampleRecordInput,
  type SampleRecordValues,
  sampleRecordHooks,
  sampleRecordSchema,
  toBody,
  toFormValues,
} from './sampleRecords';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'BDT'].map((c) => ({ value: c, label: c }));
const CATEGORIES = ['alpha', 'beta', 'gamma'].map((c) => ({ value: c, label: c }));

/** Form pattern (create + edit). Reserved codes: ERR → server validation, CONFLICT → 409, CRASH → 500. */
export default function SampleRecordFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { message } = App.useApp();
  const existing = sampleRecordHooks.useDetail(id, { enabled: isEdit });
  const create = sampleRecordHooks.useCreate();
  const update = sampleRecordHooks.useUpdate();
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [conflict, setConflict] = useState(false);
  const [guard, setGuard] = useState<{ allowNext: () => void } | null>(null);

  const defaultValues = useMemo(
    () => (existing.data ? toFormValues(existing.data) : DEFAULT_FORM_VALUES),
    [existing.data],
  );

  const form = useForm<SampleRecordInput, unknown, SampleRecordValues>({
    resolver: zodResolver(sampleRecordSchema),
    values: defaultValues,
    mode: 'onBlur',
  });
  const { control, handleSubmit, formState, setError } = form;
  const currency = useWatch({ control, name: 'currency' });

  const onSubmit = handleSubmit(async (values) => {
    setFormErrors([]);
    try {
      const saved =
        isEdit && id
          ? await update.mutateAsync({
              id,
              body: toBody(values),
              options: { rowVersion: values.rowVersion },
            })
          : await create.mutateAsync(toBody(values));
      message.success(isEdit ? 'Record updated' : 'Record created');
      guard?.allowNext();
      navigate(`${ROUTES.devPatterns}/records/${saved.id}`, { replace: true });
    } catch (error) {
      if (isApiError(error) && error.code === 'conflict') {
        setConflict(true);
        return;
      }
      setFormErrors(applyServerErrors(error, setError));
    }
  });

  const lineColumns: EditableLineColumn<SampleRecordInput>[] = [
    {
      key: 'description',
      title: 'Description',
      render: (index, c) => (
        <ControlledFormItem
          compact
          control={c}
          name={`lines.${index}.description`}
          render={(f, fid) => (
            <Input {...f} id={fid} aria-label={`Line ${index + 1} description`} />
          )}
        />
      ),
    },
    {
      key: 'quantity',
      title: 'Qty',
      width: 140,
      render: (index, c) => (
        <ControlledFormItem
          compact
          control={c}
          name={`lines.${index}.quantity`}
          render={(f, fid) => (
            <InputNumber
              id={fid}
              aria-label={`Line ${index + 1} quantity`}
              value={f.value as number}
              onChange={(v) => f.onChange(v)}
              onBlur={f.onBlur}
              min={0}
              style={{ width: '100%' }}
            />
          )}
        />
      ),
    },
    {
      key: 'unitPrice',
      title: 'Unit price',
      width: 200,
      render: (index, c) => (
        <ControlledFormItem
          compact
          control={c}
          name={`lines.${index}.unitPrice`}
          render={(f, fid) => (
            <MoneyInput
              id={fid}
              aria-label={`Line ${index + 1} unit price`}
              value={f.value as number}
              onChange={f.onChange}
              onBlur={f.onBlur}
              currency={currency || 'USD'}
            />
          )}
        />
      ),
    },
  ];

  if (isEdit && existing.isPending) return <PageLoading label="Loading record" />;
  if (isEdit && existing.error)
    return <ErrorState error={existing.error} onRetry={() => void existing.refetch()} />;

  return (
    <>
      <FormPage
        title={isEdit ? `Edit ${existing.data?.code ?? ''}` : 'New sample record'}
        subtitle="Form pattern"
        status={<Tag color="magenta">DEV</Tag>}
        isDirty={formState.isDirty}
        isSubmitting={formState.isSubmitting}
        onSubmit={onSubmit}
        cancelPath={
          isEdit && id ? `${ROUTES.devPatterns}/records/${id}` : `${ROUTES.devPatterns}/list`
        }
        errorMessages={formErrors}
        guardRef={setGuard}
      >
        <Card size="small" title="Details">
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <ControlledFormItem
                control={control}
                name="code"
                label="Code"
                required
                help="Try ERR, CONFLICT or CRASH to see error handling"
                render={(f, fid) => <Input {...f} id={fid} />}
              />
            </Col>
            <Col xs={24} md={16}>
              <ControlledFormItem
                control={control}
                name="name"
                label="Name"
                required
                render={(f, fid) => <Input {...f} id={fid} />}
              />
            </Col>
            <Col xs={24} md={8}>
              <ControlledFormItem
                control={control}
                name="category"
                label="Category"
                required
                render={(f, fid) => (
                  <Select
                    id={fid}
                    value={f.value}
                    onChange={f.onChange}
                    onBlur={f.onBlur}
                    options={CATEGORIES}
                  />
                )}
              />
            </Col>
            <Col xs={24} md={8}>
              <ControlledFormItem
                control={control}
                name="date"
                label="Date"
                required
                render={(f, fid) => (
                  <LocalDatePicker
                    id={fid}
                    value={f.value}
                    onChange={f.onChange}
                    onBlur={f.onBlur}
                  />
                )}
              />
            </Col>
            <Col xs={24} md={8}>
              <ControlledFormItem
                control={control}
                name="currency"
                label="Currency"
                required
                render={(f, fid) => (
                  <Select
                    id={fid}
                    value={f.value || undefined}
                    onChange={f.onChange}
                    onBlur={f.onBlur}
                    options={CURRENCIES}
                  />
                )}
              />
            </Col>
            <Col span={24}>
              <ControlledFormItem
                control={control}
                name="notes"
                label="Notes"
                render={(f, fid) => <Input.TextArea {...f} id={fid} rows={2} />}
              />
            </Col>
          </Row>
        </Card>
        <Card size="small" title="Lines">
          <EditableLinesTable
            control={control}
            name="lines"
            columns={lineColumns}
            createLine={() => ({ ...EMPTY_LINE })}
            errors={formState.errors}
            minLines={1}
          />
        </Card>
      </FormPage>
      <ConcurrencyConflictModal
        open={conflict}
        onReload={() => {
          setConflict(false);
          void existing.refetch();
        }}
        onKeepEditing={() => setConflict(false)}
      />
    </>
  );
}
