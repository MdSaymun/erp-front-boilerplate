import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, Flex, List, Tabs, Typography } from 'antd';
import { useMemo } from 'react';

import { ErrorState } from '@/components/feedback/ErrorState';
import { useLocaleSettings } from '@/hooks/useLocaleSettings';
import { useMutationFeedback } from '@/hooks/useMutationFeedback';
import { createChatterApi } from '@/services/api/chatter';
import { useCompanyStore } from '@/stores/companyStore';
import { formatDateTime } from '@/utils/format/date';

import { ActivityTimeline } from './ActivityTimeline';
import { AttachmentList } from './AttachmentList';
import { CommentComposer } from './CommentComposer';

interface ChatterProps {
  /** Record path, e.g. `/sales/orders/123`. */
  recordPath: string;
  disabled?: boolean;
}

/** Activity log, comments and attachments for any record. */
export function Chatter({ recordPath, disabled }: ChatterProps) {
  const api = useMemo(() => createChatterApi(recordPath), [recordPath]);
  const companyId = useCompanyStore((state) => state.currentCompanyId);
  const client = useQueryClient();
  const settings = useLocaleSettings();
  const feedback = useMutationFeedback({ errorTitle: 'Could not update' });
  const root = ['company', companyId ?? 'none', 'chatter', recordPath] as const;

  const activities = useQuery({
    queryKey: [...root, 'activities'],
    queryFn: ({ signal }) => api.activities(signal),
  });
  const comments = useQuery({
    queryKey: [...root, 'comments'],
    queryFn: ({ signal }) => api.comments(signal),
  });
  const attachments = useQuery({
    queryKey: [...root, 'attachments'],
    queryFn: ({ signal }) => api.attachments(signal),
  });

  const invalidate = () => client.invalidateQueries({ queryKey: root });

  const addComment = useMutation({
    mutationFn: api.addComment,
    onSuccess: invalidate,
    onError: feedback.onError,
  });
  const upload = useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress: (p: number) => void }) =>
      api.upload(file, onProgress),
    onSuccess: invalidate,
    onError: feedback.onError,
  });
  const removeAttachment = useMutation({
    mutationFn: api.removeAttachment,
    onSuccess: invalidate,
    onError: feedback.onError,
  });

  return (
    <Card size="small" title="Activity" className="erp-no-print">
      <Tabs
        size="small"
        items={[
          {
            key: 'comments',
            label: `Comments${comments.data ? ` (${comments.data.totalCount})` : ''}`,
            children: (
              <Flex vertical gap={12}>
                <CommentComposer
                  disabled={disabled}
                  onSubmit={async (body) => {
                    await addComment.mutateAsync(body);
                  }}
                />
                {comments.error ? (
                  <ErrorState
                    error={comments.error}
                    variant="inline"
                    onRetry={() => void comments.refetch()}
                  />
                ) : null}
                <List
                  size="small"
                  loading={comments.isPending}
                  dataSource={[...(comments.data?.items ?? [])].reverse()}
                  locale={{ emptyText: 'No comments yet' }}
                  renderItem={(comment) => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            {formatDateTime(comment.createdAt, settings)}
                          </Typography.Text>
                        }
                        description={<Typography.Text>{comment.body}</Typography.Text>}
                      />
                    </List.Item>
                  )}
                />
              </Flex>
            ),
          },
          {
            key: 'history',
            label: 'History',
            children: activities.error ? (
              <ErrorState
                error={activities.error}
                variant="inline"
                onRetry={() => void activities.refetch()}
              />
            ) : (
              <ActivityTimeline activities={activities.data?.items ?? []} />
            ),
          },
          {
            key: 'attachments',
            label: `Files${attachments.data ? ` (${attachments.data.totalCount})` : ''}`,
            children: (
              <AttachmentList
                attachments={attachments.data?.items ?? []}
                disabled={disabled}
                onUpload={async (file, onProgress) => {
                  await upload.mutateAsync({ file, onProgress });
                }}
                onRemove={async (attachment) => {
                  await removeAttachment.mutateAsync(attachment.id);
                }}
              />
            ),
          },
        ]}
      />
    </Card>
  );
}
