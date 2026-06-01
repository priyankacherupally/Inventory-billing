import { Tabs, Typography } from 'antd';
import BillCreate from './BillCreate.js';
import BillHistory from './BillHistory.js';

const { Title } = Typography;

export default function Billing() {
  return (
    <div style={{ padding: 32 }}>
      <Title level={2} style={{ marginTop: 0, marginBottom: 16 }}>
        Billing
      </Title>
      <Tabs
        defaultActiveKey="new"
        items={[
          { key: 'new', label: 'New Bill', children: <BillCreate /> },
          { key: 'history', label: 'Bill History', children: <BillHistory /> },
        ]}
      />
    </div>
  );
}