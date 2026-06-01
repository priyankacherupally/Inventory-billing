import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import Navbar from './Navbar/Navbar.js';
import styles from './MainLayout.module.scss';

const { Content } = Layout;

export default function MainLayout() {
  return (
    <Layout className={styles.layout}>
      <Navbar />
      <Content className={styles.content}>
        <Outlet />
      </Content>
    </Layout>
  );
}
