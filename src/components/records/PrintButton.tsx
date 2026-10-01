import { PrinterOutlined } from '@ant-design/icons';
import { Button } from 'antd';

/** Prints the current record using the print stylesheet; PDF rendering is a report concern. */
export function PrintButton() {
  return (
    <Button icon={<PrinterOutlined />} onClick={() => window.print()} className="erp-no-print">
      Print
    </Button>
  );
}
