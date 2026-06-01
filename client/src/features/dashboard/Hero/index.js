import { Button, Space, Skeleton, Tag } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useDashboardSummary } from '../dashboardQueries.js';
import styles from './Hero.module.scss';

export default function Hero() {
  const { data, isLoading, isError, isFetching, refetch } =
    useDashboardSummary();

  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <Tag className={styles.heroTag} color="magenta">
          Live
        </Tag>

        {isLoading ? (
          <Skeleton active paragraph={{ rows: 2 }} />
        ) : isError ? (
          <>
            <h1 className={styles.title}>Welcome</h1>
            <p className={styles.subtitle}>
              Couldn&apos;t reach the server. Showing a fallback view.
            </p>
          </>
        ) : (
          <>
            <h1 className={styles.title}>
              {data?.title || 'Welcome'},{' '}
              <span className={styles.name}>{data?.name || 'Patternlab'}</span>
            </h1>
            <p className={styles.subtitle}>
              Here&apos;s a quick pulse of your platform today.
            </p>
          </>
        )}

        <Space className={styles.heroActions}>
          <Button
            type="primary"
            size="large"
            icon={<ReloadOutlined spin={isFetching} />}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
          <Button size="large" ghost>
            View reports
          </Button>
        </Space>
      </div>
      <div className={styles.heroGlow} />
    </section>
  );
}
