import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Card, Flex, Space } from 'antd';
import { type ReactNode, useEffect, useState } from 'react';
import { type Control, type FieldValues, useForm } from 'react-hook-form';

import { EmptyState } from '@/components/feedback/EmptyState';
import type { ExportFormat } from '@/types/api';
import type { ReportDefinition } from '@/types/reports';
import { downloadBlob } from '@/utils/download';

interface ReportViewerProps<TParams extends FieldValues> {
  definition: ReportDefinition<TParams>;
  /** Renders the parameter fields with ControlledFormItem. */
  renderParameters: (control: Control<TParams>) => ReactNode;
  defaultValues: TParams;
  /** Fetches the rendered report. Undefined until the backend exists. */
  render?: (params: TParams, format: ExportFormat) => Promise<Blob>;
}

/** Parameter form + inline PDF preview (iframe) or download for other formats. */
export function ReportViewer<TParams extends FieldValues>({
  definition,
  renderParameters,
  defaultValues,
  render,
}: ReportViewerProps<TParams>) {
  const { control, handleSubmit, formState } = useForm<TParams>({
    resolver: zodResolver(definition.parametersSchema as never) as never,
    defaultValues: defaultValues as never,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState<ExportFormat | null>(null);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const run = (format: ExportFormat) =>
    handleSubmit(async (params) => {
      if (!render) return;
      setBusy(format);
      try {
        const blob = await render(params, format);
        if (format === 'pdf') setPreviewUrl(URL.createObjectURL(blob));
        else downloadBlob(blob, `${definition.key}.${format}`);
      } finally {
        setBusy(null);
      }
    })();

  return (
    <Flex vertical gap={16}>
      <Card size="small" title={definition.title}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void run(definition.formats[0] ?? 'pdf');
          }}
        >
          {renderParameters(control)}
          <Space wrap>
            {definition.formats.map((format) => (
              <Button
                key={format}
                type={format === 'pdf' ? 'primary' : 'default'}
                loading={busy === format}
                disabled={!render || formState.isSubmitting}
                onClick={() => void run(format)}
              >
                {format === 'pdf' ? 'Preview PDF' : `Download ${format.toUpperCase()}`}
              </Button>
            ))}
          </Space>
        </form>
      </Card>
      {!render ? (
        <Alert
          type="info"
          showIcon
          message="Report rendering is connected when the reporting backend is available."
        />
      ) : previewUrl ? (
        <iframe
          title={definition.title}
          src={previewUrl}
          style={{
            width: '100%',
            height: 640,
            border: '1px solid var(--ant-color-border-secondary)',
          }}
        />
      ) : (
        <EmptyState title="No preview yet" description="Set parameters and choose Preview PDF." />
      )}
    </Flex>
  );
}
