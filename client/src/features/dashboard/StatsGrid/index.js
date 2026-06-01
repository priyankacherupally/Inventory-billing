import { Card, Col, Row, Statistic, Skeleton } from 'antd';
import {
  ThunderboltOutlined,
  RocketOutlined,
  RiseOutlined,
  HeartOutlined,
} from '@ant-design/icons';
import { useDashboardStats } from '../dashboardQueries.js';
import styles from './StatsGrid.module.scss';

const ICONS = {
  active: <ThunderboltOutlined />,
  velocity: <RocketOutlined />,
  growth: <RiseOutlined />,
  health: <HeartOutlined />,
};

export default function StatsGrid() {
  const { data: stats = [], isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <Row gutter={[20, 20]} className={styles.row}>
        {[1, 2, 3, 4].map((i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card variant="borderless" className={styles.skeletonCard}>
              <Skeleton active paragraph={{ rows: 1 }} />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  return (
    <Row gutter={[20, 20]} className={styles.row}>
      {stats.map((s) => (
        <Col xs={24} sm={12} lg={6} key={s.key}>
          <Card
            className={`${styles.statCard} ${styles[s.accent]}`}
            variant="borderless"
          >
            <div className={styles.statIcon}>{ICONS[s.key]}</div>
            <Statistic
              title={<span className={styles.statLabel}>{s.label}</span>}
              value={s.value}
              suffix={s.suffix}
              styles={{ value: { color: '#fff', fontWeight: 700, fontSize: 28 } }}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
}
