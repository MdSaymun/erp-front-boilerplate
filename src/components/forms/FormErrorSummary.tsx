import { Alert } from 'antd';

interface FormErrorSummaryProps {
  messages: string[];
  title?: string;
}

/** Form-level problems that could not be attached to a specific field. */
export function FormErrorSummary({
  messages,
  title = 'Please correct the following',
}: FormErrorSummaryProps) {
  if (messages.length === 0) return null;
  return (
    <Alert
      type="error"
      showIcon
      role="alert"
      style={{ marginBottom: 16 }}
      message={title}
      description={
        <ul style={{ margin: 0, paddingInlineStart: 20 }}>
          {messages.map((message, index) => (
            <li key={`${index}-${message}`}>{message}</li>
          ))}
        </ul>
      }
    />
  );
}
