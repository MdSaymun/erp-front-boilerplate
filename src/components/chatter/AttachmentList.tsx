import { DeleteOutlined, PaperClipOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, List, Typography, Upload } from 'antd';

import { useLocaleSettings } from '@/hooks/useLocaleSettings';
import type { Attachment } from '@/types/erp';
import { formatDateTime } from '@/utils/format/date';

interface AttachmentListProps {
  attachments: Attachment[];
  onUpload: (file: File, onProgress: (percent: number) => void) => Promise<void>;
  onRemove?: (attachment: Attachment) => Promise<void>;
  disabled?: boolean;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentList({ attachments, onUpload, onRemove, disabled }: AttachmentListProps) {
  const settings = useLocaleSettings();

  return (
    <>
      <Upload
        showUploadList={false}
        disabled={disabled}
        customRequest={({ file, onSuccess, onError, onProgress }) => {
          onUpload(file as File, (percent) => onProgress?.({ percent }))
            .then(() => onSuccess?.({}))
            .catch((error: unknown) => onError?.(error as Error));
        }}
      >
        <Button icon={<UploadOutlined />} disabled={disabled}>
          Attach file
        </Button>
      </Upload>
      <List
        size="small"
        dataSource={attachments}
        locale={{ emptyText: 'No attachments' }}
        style={{ marginTop: 8 }}
        renderItem={(attachment) => (
          <List.Item
            actions={
              onRemove && !disabled
                ? [
                    <Button
                      key="remove"
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      aria-label={`Remove ${attachment.fileName}`}
                      onClick={() => void onRemove(attachment)}
                    />,
                  ]
                : undefined
            }
          >
            <List.Item.Meta
              avatar={<PaperClipOutlined />}
              title={
                attachment.url ? (
                  <a href={attachment.url} target="_blank" rel="noreferrer">
                    {attachment.fileName}
                  </a>
                ) : (
                  attachment.fileName
                )
              }
              description={
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {formatSize(attachment.sizeBytes)} ·{' '}
                  {formatDateTime(attachment.uploadedAt, settings)}
                </Typography.Text>
              }
            />
          </List.Item>
        )}
      />
    </>
  );
}
