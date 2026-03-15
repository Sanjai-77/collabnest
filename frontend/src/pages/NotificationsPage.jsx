import { useState, useEffect, useCallback } from 'react';
import { Button, Empty, Spin, Badge, Tag, Typography, Avatar } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  UserPlus, 
  CheckCircle2, 
  XCircle, 
  Layout, 
  MessageSquare,
  CheckCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import socket from '../config/socket';

const TYPE_CONFIG = {
  join_request:     { icon: <UserPlus size={18} />,       color: 'blue',   label: 'Join Request' },
  join_accepted:    { icon: <CheckCircle2 size={18} />,   color: 'green',  label: 'Accepted' },
  join_rejected:    { icon: <XCircle size={18} />,       color: 'red',    label: 'Declined' },
  task_assignment:  { icon: <Layout size={18} />,       color: 'purple', label: 'Task Assigned' },
  chat_message:     { icon: <MessageSquare size={18} />,  color: 'cyan',   label: 'New Message' },
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item = {
  hidden: { x: -20, opacity: 0 },
  show: { x: 0, opacity: 1 }
};

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit('join_user_room', user._id);
    socket.on('new_notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
    });
    return () => {
      socket.off('new_notification');
    };
  }, [fetchNotifications, user._id]);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const markOneRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <Spin size="large" />
      <Text type="secondary">Fetching updates...</Text>
    </div>
  );

  return (
    <div className="notifications-page-modern">
      <div className="page-header" style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Notifications</Title>
          <Text type="secondary">Manage your project alerts and team updates.</Text>
        </div>
        {unreadCount > 0 && (
          <Button 
            type="text" 
            icon={<CheckCheck size={16} />} 
            onClick={markAllRead}
            style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)' }}
          >
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            padding: '80px 0', 
            background: 'var(--bg-card)', 
            borderRadius: 16, 
            textAlign: 'center',
            border: '1px solid var(--border-color)' 
          }}
        >
          <Bell size={48} style={{ color: 'var(--text-muted)', marginBottom: 16, opacity: 0.2 }} />
          <Title level={4}>No notifications</Title>
          <Text type="secondary">You're all caught up! New alerts will appear here.</Text>
        </motion.div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <AnimatePresence>
            {notifications.map(n => {
              const cfg = TYPE_CONFIG[n.type] || { icon: <Bell size={18} />, color: 'default', label: 'Notification' };
              return (
                <motion.div
                  key={n._id}
                  variants={item}
                  layout
                  onClick={() => {
                    if (!n.read) markOneRead(n._id);
                    if (n.projectId) navigate(`/dashboard/workspace/${n.projectId}`);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 16,
                    padding: '16px 20px',
                    borderRadius: 12,
                    background: n.read ? 'transparent' : 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: n.read ? 'none' : 'var(--shadow-sm)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  whileHover={{ scale: 1.01, backgroundColor: 'var(--bg-card-hover)' }}
                >
                  {!n.read && (
                    <div style={{ 
                      position: 'absolute', 
                      left: 0, 
                      top: 0, 
                      bottom: 0, 
                      width: 4, 
                      background: 'var(--primary)' 
                    }} />
                  )}

                  <div style={{
                    minWidth: 40,
                    height: 40,
                    borderRadius: '10px',
                    background: n.read ? 'var(--bg-app)' : 'var(--primary-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: n.read ? 'var(--text-muted)' : 'var(--primary)',
                  }}>
                    {cfg.icon}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Text strong={!n.read} style={{ fontSize: '14px' }}>
                        {cfg.label}
                      </Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>• {timeAgo(n.createdAt)}</Text>
                    </div>
                    <Text 
                      type={n.read ? 'secondary' : 'primary'} 
                      style={{ fontSize: '14px', lineHeight: 1.5, display: 'block' }}
                    >
                      {n.message}
                    </Text>
                  </div>

                  {!n.read && <Badge dot style={{ backgroundColor: 'var(--primary)', marginTop: 8 }} />}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
