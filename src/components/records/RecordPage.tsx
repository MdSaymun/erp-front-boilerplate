import { Card, Flex, Grid } from 'antd';
import type { PropsWithChildren, ReactNode } from 'react';

import { PageContainer } from '@/components/common/PageContainer';

interface RecordPageProps extends PropsWithChildren {
  /** Breadcrumb/page title (usually the document number). */
  title: string;
  subtitle?: ReactNode;
  status?: ReactNode;
  /** Document header block (DocumentHeader). */
  header?: ReactNode;
  /** Stage bar (RecordStageBar). */
  stageBar?: ReactNode;
  /** Workflow actions (DocumentActionBar). */
  actions?: ReactNode;
  /** Right-hand panel on desktop (Chatter), stacked below on mobile. */
  sidePanel?: ReactNode;
}

/**
 * Detail page frame: Breadcrumb → header → stage bar → tabs/content with an
 * optional side panel for activity, comments and attachments.
 */
export function RecordPage({
  title,
  subtitle,
  status,
  header,
  stageBar,
  actions,
  sidePanel,
  children,
}: RecordPageProps) {
  const screens = Grid.useBreakpoint();
  const stacked = screens.xl === false;

  return (
    <PageContainer title={title} subtitle={subtitle} status={status} actions={actions}>
      <Flex vertical gap={16}>
        {header ? <Card size="small">{header}</Card> : null}
        {stageBar ? <Card size="small">{stageBar}</Card> : null}
        <Flex gap={16} vertical={stacked} align="stretch">
          <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
          {sidePanel ? (
            <aside style={{ width: stacked ? '100%' : 360, flexShrink: 0 }}>{sidePanel}</aside>
          ) : null}
        </Flex>
      </Flex>
    </PageContainer>
  );
}
