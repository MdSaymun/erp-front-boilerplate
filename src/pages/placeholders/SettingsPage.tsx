import { Card } from 'antd';

import { CompanyProfileDemoForm } from '@/features/organization/components/CompanyProfileDemoForm';

import { ModulePlaceholder } from './ModulePlaceholder';

/** Settings placeholder hosting the form-integration demonstration. */
export default function SettingsPage() {
  return (
    <ModulePlaceholder>
      <Card title="Company profile (demonstration form)" size="small">
        <CompanyProfileDemoForm />
      </Card>
    </ModulePlaceholder>
  );
}
