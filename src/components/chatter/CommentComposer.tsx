import { SendOutlined } from '@ant-design/icons';
import { Button, Flex, Input } from 'antd';
import { useState } from 'react';

interface CommentComposerProps {
  onSubmit: (body: string) => Promise<void>;
  disabled?: boolean;
}

export function CommentComposer({ onSubmit, disabled }: CommentComposerProps) {
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const body = value.trim();
    if (!body) return;
    setBusy(true);
    try {
      await onSubmit(body);
      setValue('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Flex vertical gap={8}>
      <Input.TextArea
        aria-label="New comment"
        placeholder="Write a comment… (Ctrl+Enter to send)"
        autoSize={{ minRows: 2, maxRows: 6 }}
        value={value}
        disabled={disabled || busy}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') void submit();
        }}
      />
      <Button
        type="primary"
        icon={<SendOutlined />}
        loading={busy}
        disabled={disabled || !value.trim()}
        onClick={() => void submit()}
        style={{ alignSelf: 'flex-end' }}
      >
        Comment
      </Button>
    </Flex>
  );
}
