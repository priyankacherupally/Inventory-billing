import { Avatar, Dropdown, Tag } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/authStore.js';
import { ROLES } from '../../config/apiConfig.js';
import styles from './Navbar.module.scss';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', roles: [ROLES.ADMIN, ROLES.BILLING_EXECUTIVE] },
  { to: '/billing', label: 'Billing', roles: [ROLES.ADMIN, ROLES.BILLING_EXECUTIVE] },
  { to: '/catalogue', label: 'Catalogue', roles: [ROLES.ADMIN] },
  { to: '/suppliers', label: 'Suppliers', roles: [ROLES.ADMIN] },
  { to: '/purchase', label: 'Purchase', roles: [ROLES.ADMIN] },
  { to: '/users', label: 'Users', roles: [ROLES.ADMIN] },
];

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

  const visibleNav = NAV_ITEMS.filter((item) => item.roles.includes(user?.role));

  return (
    <header className={styles.navbar}>
      <div className={styles.brand}>
        <div className={styles.logo}>P</div>
        <span className={styles.brandText}>Patternlab</span>
      </div>

      <nav className={styles.nav}>
        {visibleNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <Dropdown menu={{ items }} placement="bottomRight" trigger={['click']}>
        <div className={styles.user}>
          <Avatar icon={<UserOutlined />} className={styles.avatar} />
          <span className={styles.userName}>{user?.name || 'User'}</span>
          {user?.role && (
            <Tag color={user.role === ROLES.ADMIN ? 'geekblue' : 'green'}>
              {user.role === ROLES.ADMIN ? 'Admin' : 'Billing'}
            </Tag>
          )}
        </div>
      </Dropdown>
    </header>
  );
}