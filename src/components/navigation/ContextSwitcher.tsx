import { BankOutlined } from '@ant-design/icons';
import { Select, Space, Typography } from 'antd';

import { useCurrentContext } from '@/hooks/useCurrentContext';
import { useCompanyStore } from '@/stores/companyStore';

/**
 * Tenant / company context display and switcher.
 * Selecting a company here only changes UI context; the backend validates the
 * user's membership on every request.
 */
export function ContextSwitcher() {
  const { tenant, company, availableCompanies } = useCurrentContext();
  const selectCompany = useCompanyStore((state) => state.selectCompany);

  return (
    <Space size="small" align="center" aria-label="Current tenant and company">
      <BankOutlined aria-hidden />
      <Typography.Text type="secondary" ellipsis style={{ maxWidth: 160 }}>
        {tenant?.name ?? 'No tenant'}
      </Typography.Text>
      {availableCompanies.length > 0 ? (
        <Select
          aria-label="Current company"
          size="small"
          value={company?.id}
          onChange={(value) => selectCompany(value)}
          options={availableCompanies.map((c) => ({ label: c.name, value: c.id }))}
          style={{ minWidth: 180 }}
        />
      ) : (
        <Typography.Text ellipsis style={{ maxWidth: 180 }}>
          No company selected
        </Typography.Text>
      )}
    </Space>
  );
}
