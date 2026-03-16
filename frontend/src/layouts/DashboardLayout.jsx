import { useState, useEffect, useRef } from 'react';
import { Layout, Menu, Button, Avatar, Badge, Popover, Dropdown, Input, List, Typography, notification, Drawer } from 'antd';
import { Typography as MuiTypography } from '@mui/material';
import { 
  LayoutDashboard, 
  Briefcase, 
  FolderOpen, 
  UserCheck, 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  Moon, 
  Sun, 
  Rocket, 
  Search, 
  Menu as MenuIcon 
} from 'lucide-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../components/ThemeContext';
import api from '../config/api';
import socket from '../config/socket';

const { Sider, Header, Content } = Layout;

const menuItems = [
  { key: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
  { key: '/dashboard/projects', icon: <Briefcase size={20} />, label: 'Projects' },
  { key: '/dashboard/my-projects', icon: <FolderOpen size={20} />, label: 'My Projects' },
  { key: '/dashboard/join-requests', icon: <UserCheck size={20} />, label: 'Join Requests' },
  { key: '/dashboard/notifications', icon: <Bell size={20} />, label: 'Notifications' },
  { key: '/dashboard/profile', icon: <User size={20} />, label: 'Profile' },
];

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsList, setNotificationsList] = useState([]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  
  const navigate = useNavigate();
  const location = useLocation();
  const socketRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);

    const userStr = localStorage.getItem('user');
    if (userStr) {
      const parsedUser = JSON.parse(userStr);
      setUser(parsedUser);
      fetchUnreadCount();
      fetchRecentNotifications();
      setupSocket(parsedUser._id);
    } else {
      navigate('/login');
    }

    return () => {
      socket.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [navigate]);

  useEffect(() => {
    if (location.pathname === '/dashboard/notifications') {
      setUnreadCount(0);
    }
  }, [location.pathname]);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  const fetchRecentNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotificationsList(res.data.slice(0, 5));
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const setupSocket = (userId) => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.on('connect', () => {
      socket.emit('join_user_room', userId);
    });

    socket.on('new_notification', (newNotif) => {
      setUnreadCount(prev => prev + 1);
      setNotificationsList(prev => [newNotif, ...prev].slice(0, 5));
      
      notification.info({
        message: 'New Notification',
        description: newNotif.message || 'You have a new notification.',
        placement: 'topRight',
        duration: 4,
      });
    });
  };

  const handleLogout = () => {
    socket.disconnect();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handlePopoverOpenChange = async (newOpen) => {
    setPopoverOpen(newOpen);
    if (newOpen && unreadCount > 0) {
      setUnreadCount(0);
      try {
        await api.put('/notifications/read-all');
        setNotificationsList(prev => prev.map(n => ({ ...n, read: true })));
      } catch (err) {
        console.error('Failed to mark notifications as read:', err);
      }
    }
  };

  const avatarMenu = {
    items: [
      { key: 'profile', icon: <User size={16} />, label: 'Profile', onClick: () => navigate('/dashboard/profile') },
      { key: 'settings', icon: <Settings size={16} />, label: 'Settings' },
      { type: 'divider' },
      { key: 'logout', icon: <LogOut size={16} />, label: 'Log Out', danger: true, onClick: handleLogout },
    ],
  };

  const notificationContent = (
    <div style={{ width: 320 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <MuiTypography variant="subtitle2" sx={{ fontWeight: 600 }}>Notifications</MuiTypography>
        <Button type="link" size="small" onClick={() => navigate('/dashboard/notifications')}>View all</Button>
      </div>
      {notificationsList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
          <Bell size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
          <p>No recent notifications</p>
        </div>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={notificationsList}
          renderItem={(item) => (
            <List.Item 
              style={{ 
                padding: '12px 0', 
                borderBottom: '1px solid var(--border-color)',
                cursor: 'pointer'
              }}
            >
              <List.Item.Meta
                avatar={<Avatar src={item.senderAvatar} icon={<User size={20} />} />}
                title={<span style={{ fontSize: '13px', fontWeight: item.read ? 400 : 600 }}>{item.title || 'New Notification'}</span>}
                description={
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {item.message}
                    <div style={{ fontSize: '10px', marginTop: 4, color: 'var(--text-muted)' }}>
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );

  const sidebarContent = (
    <>
      <div className="sidebar-logo">
        <motion.div
          animate={{ rotate: collapsed ? 0 : 360 }}
          transition={{ duration: 0.5 }}
        >
          <Rocket className="logo-icon" size={28} />
        </motion.div>
        {(!collapsed || isMobile) && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="logo-gradient"
          >
            CollabNest
          </motion.span>
        )}
      </div>
      
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => {
          navigate(key);
          if (isMobile) setMobileMenuOpen(false);
        }}
        style={{ background: 'transparent', borderRight: 'none' }}
        className="custom-menu"
      />

      <div className="sidebar-footer">
        {!isMobile && (
          <Button
            type="text"
            icon={collapsed ? <ChevronLeft size={20} style={{ transform: 'rotate(180deg)' }} /> : <ChevronLeft size={20} />}
            onClick={() => setCollapsed(!collapsed)}
            className="collapse-btn"
          />
        )}
      </div>
    </>
  );

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
      {isMobile ? (
        <Drawer
          placement="left"
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
          width={280}
          bodyStyle={{ padding: 0, background: 'var(--bg-sidebar)' }}
          headerStyle={{ display: 'none' }}
        >
          <div className="main-sider" style={{ height: '100%', background: 'var(--bg-sidebar)' }}>
            {sidebarContent}
          </div>
        </Drawer>
      ) : (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={260}
          trigger={null}
          theme={theme}
          className="main-sider"
          style={{
            borderRight: '1px solid var(--border-color)',
            background: 'var(--bg-sidebar)',
            zIndex: 100,
          }}
        >
          {sidebarContent}
        </Sider>
      )}

      <Layout className="site-layout" style={{ background: 'var(--bg-app)' }}>
        <Header 
          className="dashboard-header" 
          style={{ 
            background: 'var(--bg-header)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border-color)',
            position: 'sticky',
            top: 0,
            zIndex: 99,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isMobile ? '0 16px' : '0 24px',
            height: 'var(--header-height)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 20 }}>
            {isMobile ? (
              <Button 
                type="text" 
                icon={<MenuIcon size={24} />} 
                onClick={() => setMobileMenuOpen(true)}
                style={{ color: 'var(--text-secondary)' }}
              />
            ) : collapsed && (
              <Button 
                type="text" 
                icon={<MenuIcon size={20} />} 
                onClick={() => setCollapsed(false)}
                style={{ color: 'var(--text-secondary)' }}
              />
            )}
            <Input
              prefix={<Search size={18} style={{ color: 'var(--text-muted)' }} />}
              placeholder={isMobile ? "Search..." : "Search anything..."}
              className="header-search-modern"
              style={{ 
                width: isMobile ? 140 : 320, 
                borderRadius: '8px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
              }}
            />
          </div>

          <div className="header-actions">
            <div className="theme-toggle-container" style={{ marginRight: 16 }}>
              <Button
                type="text"
                icon={theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                onClick={toggleTheme}
                style={{ color: 'var(--text-secondary)' }}
              />
            </div>

            <Popover
              content={notificationContent}
              trigger="click"
              open={popoverOpen}
              onOpenChange={handlePopoverOpenChange}
              placement="bottomRight"
              overlayClassName="modern-popover"
            >
              <Badge count={unreadCount} size="small" offset={[-2, 4]}>
                <Button 
                  type="text" 
                  icon={<Bell size={20} />} 
                  style={{ color: 'var(--text-secondary)' }}
                />
              </Badge>
            </Popover>

            <Dropdown menu={avatarMenu} trigger={['click']} placement="bottomRight">
              <div className="user-profile-trigger">
                <Avatar
                  src={user?.avatar}
                  icon={<User size={18} />}
                  style={{ backgroundColor: 'var(--primary)' }}
                />
                <span className="user-name">{user?.username?.split(' ')[0]}</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="dashboard-main-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ height: '100%' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Content>
      </Layout>
    </Layout>
  );
}
