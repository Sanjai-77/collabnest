import { useState, useEffect } from 'react';
import { Card, Avatar, Button, Typography, Tag, Space, message, Spin, Empty, Tabs } from 'antd';
import { Typography as MuiTypography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../config/api';
import { 
  User, 
  Check, 
  X, 
  Github, 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Inbox, 
  Send,
  MessageSquare,
  ArrowUpRight
} from 'lucide-react';

const { Title, Paragraph } = Typography;

const STATUS_CONFIG = {
  pending:  { icon: <Clock size={14} />, color: 'orange', label: 'Pending' },
  accepted: { icon: <CheckCircle2 size={14} />, color: 'green', label: 'Accepted' },
  rejected: { icon: <XCircle size={14} />, color: 'red', label: 'Rejected' },
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function JoinRequestsPage() {
  const [incoming, setIncoming] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [incomingRes, sentRes] = await Promise.all([
        api.get('/join-requests'),
        api.get('/join-requests/my'),
      ]);
      setIncoming(incomingRes.data);
      setSent(sentRes.data);
    } catch (error) {
      console.error('Failed to fetch join requests:', error);
      message.error('Could not load join requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    try {
      await api.put(`/join-requests/${id}`, { status });
      message.success(`Request ${status} successfully`);
      setIncoming(prev => prev.filter(req => req._id !== id));
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || `Failed to ${status} request`);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;

  const IncomingTab = () => (
    incoming.length === 0 ? (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state-modern">
        <Empty description={<MuiTypography color="text.secondary">No pending requests for your projects</MuiTypography>} />
      </motion.div>
    ) : (
      <motion.div variants={container} initial="hidden" animate="show" className="requests-stack">
        <AnimatePresence>
          {incoming.map(request => (
            <motion.div key={request._id} variants={item} exit={{ opacity: 0, scale: 0.95 }}>
              <Card className="details-card-premium request-card-modern">
                <div className="request-card-header-modern">
                  <div className="user-info-modern">
                    <Avatar size={48} src={request.user?.avatar} icon={<User size={24} />} className="profile-avatar-main" />
                    <div>
                       <Title level={4} style={{ margin: 0 }}>{request.user?.username}</Title>
                      <MuiTypography color="text.secondary" sx={{ fontSize: '13px' }}>
                        Wants to join <MuiTypography component="span" sx={{ fontWeight: 600 }}>{request.project?.title}</MuiTypography>
                      </MuiTypography>
                    </div>
                  </div>
                  <div className="request-actions-modern">
                    <Button type="primary" icon={<Check size={18} />} onClick={() => handleAction(request._id, 'accepted')} className="auth-btn">Accept</Button>
                    <Button icon={<X size={18} />} danger onClick={() => handleAction(request._id, 'rejected')} className="hero-sec-btn">Decline</Button>
                  </div>
                </div>

                <div className="request-message-box">
                  <MessageSquare size={16} className="message-icon" />
                  <Paragraph className="message-text">"{request.message}"</Paragraph>
                </div>

                <div className="request-meta-bottom">
                  <div className="user-skills-lite">
                    {(request.user?.skills || []).slice(0, 4).map(s => (
                      <Tag key={s} className="skill-tag-premium">{s}</Tag>
                    ))}
                  </div>
                  <Space className="user-links-lite">
                    {request.github && <a href={`https://github.com/${request.github}`} target="_blank" rel="noopener noreferrer" className="auth-link"><Github size={14} /> GitHub</a>}
                    {request.resume && <a href={request.resume} target="_blank" rel="noopener noreferrer" className="auth-link"><FileText size={14} /> Resume</a>}
                  </Space>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    )
  );

  const SentTab = () => (
    sent.length === 0 ? (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state-modern">
        <Empty description={<MuiTypography color="text.secondary">You haven't sent any requests yet</MuiTypography>} />
      </motion.div>
    ) : (
      <motion.div variants={container} initial="hidden" animate="show" className="requests-stack">
        {sent.map(request => {
          const cfg = STATUS_CONFIG[request.status] || STATUS_CONFIG.pending;
          return (
            <motion.div key={request._id} variants={item}>
              <Card className="details-card-premium request-card-modern">
                <div className="request-card-header-modern">
                  <div>
                    <Title level={4} style={{ margin: 0 }}>{request.project?.title}</Title>
                    <MuiTypography color="text.secondary" sx={{ fontSize: '12px' }}>Submitted on {new Date(request.createdAt).toLocaleDateString()}</MuiTypography>
                  </div>
                  <Tag color={cfg.color} icon={cfg.icon} className="status-tag-premium">{cfg.label}</Tag>
                </div>
                <div className="request-message-box">
                  <MessageSquare size={16} className="message-icon" />
                  <Paragraph className="message-text">"{request.message}"</Paragraph>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    )
  );

  const tabItems = [
    { key: 'incoming', label: <div className="tab-label-modern"><Inbox size={16} /> Incoming <span>{incoming.length}</span></div>, children: <IncomingTab /> },
    { key: 'sent', label: <div className="tab-label-modern"><Send size={16} /> Sent <span>{sent.length}</span></div>, children: <SentTab /> },
  ];

  return (
    <div className="join-requests-page-modern">
      <div className="page-header-simple" style={{ marginBottom: 32 }}>
        <Title level={2}>Network Requests</Title>
        <MuiTypography color="text.secondary">Manage your collaborations and project invitations.</MuiTypography>
      </div>

      <Tabs defaultActiveKey="incoming" items={tabItems} className="modern-tabs" />
    </div>
  );
}
