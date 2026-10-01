import { BankOutlined } from '@ant-design/icons';
import { Select, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { useCompanySwitch } from '@/hooks/useCompanySwitch';
import { useCurrentContext } from '@/hooks/useCurrentContext';

/**
 * Tenant / company context display and switcher.
 * Selecting a company here only changes UI context; the backend validates the
 * user's membership on every request.
 */
export function ContextSwitcher() {
  const { t } = useTranslation();
  const { tenant, company, availableCompanies } = useCurrentContext();
  const switchCompany = useCompanySwitch();

  return (
    <Space size="small" align="center" aria-label="Current tenant and company">
      <BankOutlined aria-hidden />
      <Typography.Text type="secondary" ellipsis style={{ maxWidth: 160 }}>
        {tenant?.name ?? t('nav.noTenant')}
      </Typography.Text>
      {availableCompanies.length > 0 ? (
        <Select
          aria-label={t('nav.currentCompany')}
          size="small"
          value={company?.id}
          onChange={(value) => void switchCompany(value)}
          options={availableCompanies.map((c) => ({ label: c.name, value: c.id }))}
          style={{ minWidth: 180 }}
        />
      ) : (
        <Typography.Text ellipsis style={{ maxWidth: 180 }}>
          {t('nav.noCompany')}
        </Typography.Text>
      )}
    </Space>
  );
}
