import { Avatar, Dropdown } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/authStore.js';
import styles from './Navbar.module.scss';

export default function Navbar() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const items = [
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <header className={styles.navbar}>
      <div className={styles.brand}>
        <div className={styles.logo}>P</div>
        <span className={styles.brandText}>Patternlab</span>
      </div>

      <Dropdown menu={{ items }} placement="bottomRight" trigger={['click']}>
        <div className={styles.user}>
          <Avatar icon={<UserOutlined />} className={styles.avatar} />
          <span className={styles.userName}>{user?.name || 'admin'}</span>
        </div>
      </Dropdown>
    </header>
  );
}
