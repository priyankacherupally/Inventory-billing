import { Card, Button, Skeleton } from 'antd';
import { useDashboardQuickLinks } from '../dashboardQueries.js';
import styles from './QuickLinks.module.scss';

export default function QuickLinks() {
  const { data: links = [], isLoading } = useDashboardQuickLinks();

  return (
    <Card title="Quick Links" variant="borderless" className={styles.panel}>
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : (
        <div className={styles.links}>
          {links.map((link) => (
            <Button
              key={link.key}
              type={link.primary ? 'primary' : 'default'}
              size="large"
              block
            >
              {link.label}
            </Button>
          ))}
        </div>
      )}
    </Card>
  );
}
