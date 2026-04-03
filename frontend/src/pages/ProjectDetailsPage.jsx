import { useState, useEffect, useCallback } from 'react';
import { Typography, Button, Tag, Space, Avatar, List, Card, Spin, message, Popconfirm } from 'antd';
import { Typography as MuiTypography } from '@mui/material';
import { 
  ArrowLeft, ArrowRight, Clock, CheckCircle2, XCircle, 
  User, Users, Layout, Edit3, Trash2, Target
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../config/api';
import JoinRequestModal from '../components/JoinRequestModal';
import EditProjectModal from '../components/EditProjectModal';
import { staggerContainer, fadeInUp } from '../utils/motion';

const { Paragraph } = Typography;

const REQUEST_STATUS_CONFIG = {
  pending:  { color: 'orange', icon: <Clock size={14} />, label: 'Review Pending' },
  accepted: { color: 'green',  icon: <CheckCircle2 size={14} />, label: 'Accepted' },
  rejected: { color: 'red',    icon: <XCircle size={14} />, label: 'Rejected' },
};

const container = staggerContainer();
const item = fadeInUp;

export default function ProjectDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myRequest, setMyRequest] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isCreator = project?.createdBy?._id === currentUser._id;
  const isMember = project?.members?.some(m => m._id === currentUser._id);
  const isRemoved = project?.removedUsers?.some(r => r.userId === currentUser._id);

  const fetchProject = useCallback(async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchMyRequest = useCallback(async () => {
    try {
      const res = await api.get('/join-requests/my');
      const found = res.data.find(r => r.project?._id === id);
      setMyRequest(found || null);
    } catch (error) {
      console.error('Failed to fetch my requests:', error);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
    fetchMyRequest();
  }, [fetchProject, fetchMyRequest]);

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;
  if (!project) return <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-secondary)' }}>Project not found</div>;

  const handleDelete = async () => {
    try {
      await api.delete(`/projects/${project._id}`);
      message.success('Project deleted');
      navigate('/dashboard/projects');
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const renderJoinButton = () => {
    if (isMember) return null;
    if (myRequest && myRequest.status === 'pending') {
      return (
        <Button disabled size="large" className="auth-btn" style={{ opacity: 0.8, cursor: 'not-allowed' }}>
          <Clock size={18} style={{ marginRight: 8 }} /> Request Pending
        </Button>
      );
    }
    
    // If the user was removed, they can request again (unless they have a new pending request)
    if (isRemoved) {
      return (
        <Space direction="vertical" align="end" size={2}>
          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
            You were removed from this project earlier.
          </Typography.Text>
          <Button type="primary" size="large" onClick={() => setModalOpen(true)} className="auth-btn" style={{ backgroundColor: 'var(--warning-color)' }}>
            Request Again <ArrowRight size={18} style={{ marginLeft: 8 }} />
          </Button>
        </Space>
      );
    }

    if (myRequest && myRequest.status !== 'pending') {
       const cfg = REQUEST_STATUS_CONFIG[myRequest.status] || REQUEST_STATUS_CONFIG.pending;
       return (
            <Tag color={cfg.color} icon={cfg.icon} className="status-tag-premium">
              {cfg.label}
            </Tag>
       );
    }
    return (
      <Button type="primary" size="large" onClick={() => setModalOpen(true)} className="auth-btn">
        Join This Team <ArrowRight size={18} style={{ marginLeft: 8 }} />
      </Button>
    );
  };

  return (
    <div className="project-details-modern">
      <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
        <Button
          type="text"
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate(-1)}
          className="back-btn-modern"
        >
          Back to Projects
        </Button>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        style={{ marginTop: 24 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24, marginBottom: 40 }}>
          <motion.div variants={item}>
            <MuiTypography variant="h3" sx={{ margin: 0, letterSpacing: '-0.02em', fontWeight: 800 }}>{project.title}</MuiTypography>
            <Space style={{ marginTop: 12 }}>
              <div className="leader-badge-premium">
                <Avatar size={24} src={project.createdBy?.avatar} icon={<User size={14} />} style={{ backgroundColor: 'var(--primary)' }} />
                <MuiTypography sx={{ fontWeight: 600, fontSize: '12px' }}>{project.createdBy?.username}</MuiTypography>
              </div>
              <Tag className="members-tag-premium">
                <Users size={12} style={{ marginRight: 6 }} />
                {project.members?.length || 0} / {project.teamSize} Members
              </Tag>
            </Space>
          </motion.div>

          <motion.div variants={item} style={{ display: 'flex', gap: 12 }}>
            {isCreator ? (
              <Space>
                <Button size="large" onClick={() => navigate(`/dashboard/workspace/${id}`)} icon={<Layout size={18} />} className="hero-sec-btn">Workspace</Button>
                <Button size="large" icon={<Edit3 size={18} />} onClick={() => setEditModalOpen(true)} className="icon-btn-modern" />
                <Popconfirm title="Delete project?" onConfirm={handleDelete}>
                  <Button size="large" icon={<Trash2 size={18} />} danger className="icon-btn-modern danger" />
                </Popconfirm>
              </Space>
            ) : (
              <Space>
                {renderJoinButton()}
                {(isMember) && (
                  <Button type="primary" size="large" onClick={() => navigate(`/dashboard/workspace/${id}`)} icon={<Rocket size={18} />} className="auth-btn">Open Workspace</Button>
                )}
              </Space>
            )}
          </motion.div>
        </div>

        <div className="details-grid-modern">
          <motion.div variants={item} className="details-main-col">
            <Card className="details-card-premium" title={<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Target size={18} /> <span>Description</span></div>}>
              <Paragraph style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1.8 }}>
                {project.description}
              </Paragraph>
              
              <div style={{ marginTop: 32 }}>
                <MuiTypography sx={{ display: 'block', marginBottom: '12px', fontWeight: 600 }}>Required Competencies</MuiTypography>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {(project.requiredSkills || []).map(s => (
                    <Tag key={s} className="skill-tag-premium">{s}</Tag>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={item} className="details-side-col">
            <Card className="details-card-premium" title={<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Users size={18} /> <span>The Team</span></div>}>
              <List
                dataSource={project.members || []}
                renderItem={(m) => (
                  <List.Item className="member-list-item-premium">
                    <List.Item.Meta
                      avatar={<Avatar src={m.avatar} style={{ backgroundColor: 'var(--primary)' }} icon={<User size={14} />} />}
                      title={<MuiTypography sx={{ fontWeight: 600 }}>{m.username}</MuiTypography>}
                      description={<MuiTypography color="text.secondary" sx={{ fontSize: '11px' }}>{m._id === project.createdBy?._id || m._id === 'creator' ? 'Project Lead' : 'Contributor'}</MuiTypography>}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </motion.div>
        </div>
      </motion.div>

      <JoinRequestModal open={modalOpen} onClose={() => setModalOpen(false)} projectId={id} onSuccess={() => {
        fetchProject();
        fetchMyRequest();
      }} />
      {isCreator && (
        <EditProjectModal open={editModalOpen} onClose={() => setEditModalOpen(false)} project={project} onSuccess={(updated) => setProject(updated)} />
      )}
    </div>
  );
}
