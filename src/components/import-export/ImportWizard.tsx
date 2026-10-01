import { InboxOutlined } from '@ant-design/icons';
import { Alert, Button, Flex, Result, Select, Space, Steps, Table, Typography, Upload } from 'antd';
import { useMemo, useState } from 'react';

import type { ImportResult } from '@/types/api';
import type { ImportFieldMapping, ImportTarget } from '@/types/importExport';

interface ImportWizardProps {
  target: ImportTarget;
  /** Performs the import (usually `resourceApi.import`). */
  onImport: (file: File, mapping: Record<string, string>) => Promise<ImportResult>;
  onDone?: () => void;
}

/** Naive CSV preview parser (comma-separated, quoted fields). Full parsing happens server-side. */
function previewCsv(text: string, maxRows = 20): { columns: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const parse = (line: string) =>
    line
      .match(/("([^"]|"")*"|[^,]*)(,|$)/g)
      ?.map((cell) => cell.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"'))
      .filter((_, i, arr) => i < arr.length - 1 || _ !== '') ?? [];
  const [header = '', ...body] = lines;
  return { columns: parse(header), rows: body.slice(0, maxRows).map(parse) };
}

function autoMap(columns: string[], target: ImportTarget): ImportFieldMapping[] {
  return columns.map((column) => {
    const normalized = column
      .trim()
      .toLowerCase()
      .replace(/[\s_-]/g, '');
    const match = target.fields.find(
      (f) =>
        f.key.toLowerCase() === normalized ||
        f.label.toLowerCase().replace(/[\s_-]/g, '') === normalized,
    );
    return { sourceColumn: column, targetField: match?.key ?? null };
  });
}

/** Upload → map columns → preview → result. Parsing beyond preview is the backend's job. */
export function ImportWizard({ target, onImport, onDone }: ImportWizardProps) {
  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{ columns: string[]; rows: string[][] }>({
    columns: [],
    rows: [],
  });
  const [mapping, setMapping] = useState<ImportFieldMapping[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const missingRequired = useMemo(
    () =>
      target.fields
        .filter((f) => f.required && !mapping.some((m) => m.targetField === f.key))
        .map((f) => f.label),
    [target.fields, mapping],
  );

  const handleFile = async (selected: File) => {
    const text = await selected.text();
    const parsed = previewCsv(text);
    setFile(selected);
    setPreview(parsed);
    setMapping(autoMap(parsed.columns, target));
    setStep(1);
    return false;
  };

  const runImport = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const map = Object.fromEntries(
        mapping.filter((m) => m.targetField).map((m) => [m.sourceColumn, m.targetField as string]),
      );
      setResult(await onImport(file, map));
      setStep(3);
    } catch {
      setError('Import failed. Please check the file and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Flex vertical gap={16}>
      <Steps
        size="small"
        current={step}
        items={[
          { title: 'Upload' },
          { title: 'Map columns' },
          { title: 'Preview' },
          { title: 'Result' },
        ]}
      />

      {step === 0 ? (
        <Upload.Dragger
          accept=".csv,text/csv"
          multiple={false}
          showUploadList={false}
          beforeUpload={(f) => void handleFile(f as File)}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag a CSV file here</p>
          <p className="ant-upload-hint">
            Expected columns: {target.fields.map((f) => f.label).join(', ')}
          </p>
        </Upload.Dragger>
      ) : null}

      {step === 1 ? (
        <>
          {missingRequired.length ? (
            <Alert
              type="warning"
              showIcon
              message={`Required fields not mapped: ${missingRequired.join(', ')}`}
            />
          ) : null}
          <Table
            size="small"
            rowKey="sourceColumn"
            pagination={false}
            dataSource={mapping}
            columns={[
              { title: 'File column', dataIndex: 'sourceColumn', key: 'source' },
              {
                title: 'Target field',
                key: 'target',
                render: (_, row) => (
                  <Select
                    allowClear
                    aria-label={`Map ${row.sourceColumn}`}
                    style={{ width: 240 }}
                    value={row.targetField ?? undefined}
                    options={target.fields.map((f) => ({
                      value: f.key,
                      label: f.required ? `${f.label} *` : f.label,
                    }))}
                    onChange={(value) =>
                      setMapping((m) =>
                        m.map((entry) =>
                          entry.sourceColumn === row.sourceColumn
                            ? { ...entry, targetField: value ?? null }
                            : entry,
                        ),
                      )
                    }
                  />
                ),
              },
            ]}
          />
          <Space>
            <Button onClick={() => setStep(0)}>Back</Button>
            <Button type="primary" disabled={missingRequired.length > 0} onClick={() => setStep(2)}>
              Next
            </Button>
          </Space>
        </>
      ) : null}

      {step === 2 ? (
        <>
          <Typography.Text type="secondary">
            Showing the first {preview.rows.length} rows of {file?.name}.
          </Typography.Text>
          <div className="erp-table-wrapper">
            <Table
              size="small"
              rowKey={(_, i) => String(i)}
              pagination={false}
              scroll={{ x: 'max-content' }}
              dataSource={preview.rows.map((cells) =>
                Object.fromEntries(cells.map((cell, i) => [preview.columns[i] ?? `col${i}`, cell])),
              )}
              columns={preview.columns.map((column) => ({
                title: column,
                dataIndex: column,
                key: column,
              }))}
            />
          </div>
          {error ? <Alert type="error" showIcon message={error} /> : null}
          <Space>
            <Button onClick={() => setStep(1)}>Back</Button>
            <Button type="primary" loading={busy} onClick={() => void runImport()}>
              Import
            </Button>
          </Space>
        </>
      ) : null}

      {step === 3 && result ? (
        <Result
          status={result.failed === 0 ? 'success' : 'warning'}
          title={`${result.imported} rows imported, ${result.failed} failed`}
          extra={
            <Button type="primary" onClick={onDone}>
              Done
            </Button>
          }
        >
          {result.errors.length ? (
            <Table
              size="small"
              rowKey={(row) => `${row.row}-${row.field ?? ''}`}
              pagination={false}
              dataSource={result.errors}
              columns={[
                { title: 'Row', dataIndex: 'row', key: 'row', width: 80 },
                { title: 'Field', dataIndex: 'field', key: 'field', width: 160 },
                { title: 'Message', dataIndex: 'message', key: 'message' },
              ]}
            />
          ) : null}
        </Result>
      ) : null}
    </Flex>
  );
}
