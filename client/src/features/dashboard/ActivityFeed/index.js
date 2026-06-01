import { Card, Skeleton } from 'antd';
import { useDashboardActivity } from '../dashboardQueries.js';
import styles from './ActivityFeed.module.scss';

const DOT_CLASS = {
  success: styles.dot,
  warn: `${styles.dot} ${styles.dotWarn}`,
  info: `${styles.dot} ${styles.dotInfo}`,
};

export default function ActivityFeed() {
  const { data: items = [], isLoading } = useDashboardActivity();

  return (
    <Card title="Activity Feed" variant="borderless" className={styles.panel}>
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : (
        <ul className={styles.feed}>
          {items.map((item) => (
            <li key={item.id}>
              <span className={DOT_CLASS[item.type] || styles.dot} />
              {item.message}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
