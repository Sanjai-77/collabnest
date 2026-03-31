import { useState, useEffect, useMemo } from 'react';
import { 
  Tabs, Tag, Card, Descriptions, Avatar, List, Spin, 
  Popconfirm, message, Badge, Typography, Divider, Button
} from 'antd';
import { Typography as MuiTypography } from '@mui/material';
import { 
  ChevronLeft, Settings, Trash2, Layout, MessageSquare, 
  Users, Info, Activity, Calendar, Layers
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../config/api';
import TaskBoard from '../components/TaskBoard';
import ChatInterface from '../components/ChatInterface';
import MembersTable from '../components/MembersTable';
import EditProjectModal from '../components/EditProjectModal';

const { Paragraph } = Typography;

export default function WorkspacePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  // Parse once — avoids JSON.parse on every render
  const currentUser = useMemo(() => JSON.parse(localStorage.getItem('user') || '{}'), []);
  const isCreator = String(project?.createdBy?._id || project?.createdBy) === String(currentUser._id);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${id}`);
        const data = res.data;
        // Access Control: Redirect if not leader and not a member
        const currentUserId = String(currentUser._id);
        const projectCreatorId = String(data.createdBy?._id || data.createdBy);
        const memberIds = (data.members || []).map(m => String(m._id || m));
        
        const isUserInMembers = memberIds.includes(currentUserId) || projectCreatorId === currentUserId;
        
        if (!isUserInMembers) {
          message.warning('You are no longer a member of this project');
          navigate('/dashboard/projects');
          return;
        }
        setProject(data);
      } catch (error) {
        console.error('Failed to fetch project:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
    const interval = setInterval(fetchProject, 60000); // 60s — project metadata rarely changes
    return () => clearInterval(interval);
  }, [id, navigate, currentUser._id]);



  if (loading) return <div className="loading-state-premium"><Spin size="large" /><MuiTypography color="text.secondary">Preparing your workspace...</MuiTypography></div>;
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

  const handleRemoveMember = async (userId) => {
    try {
      const res = await api.delete(`/projects/${id}/members/${userId}`);
      setProject(res.data);
      message.success('Member removed successfully');
    } catch (error) {
      console.error('Error removing member:', error);
      message.error(error.response?.data?.message || 'Failed to remove member');
    }
  };

  const overviewTab = (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="details-grid-modern" style={{ marginTop: 20 }}>
        <Card className="details-card-premium">
          <MuiTypography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700 }}>
            <Activity size={20} className="text-primary" /> Project Overview
          </MuiTypography>
          <Divider style={{ margin: '16px 0', borderColor: 'var(--border-color)' }} />
          <Descriptions column={1} labelStyle={{ color: 'var(--text-muted)', fontWeight: 500 }}>
            <Descriptions.Item label="Identity">{project.title}</Descriptions.Item>
            <Descriptions.Item label="Operational Status">
              <Tag color="green" className="status-tag-premium">Active</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Team Capacity">{project.members?.length || 0} / {project.teamSize} Developers</Descriptions.Item>
            <Descriptions.Item label="Inception Date">{new Date(project.createdAt).toLocaleDateString()}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card className="details-card-premium">
          <MuiTypography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700 }}>
            <Info size={20} className="text-primary" /> Strategic Aim
          </MuiTypography>
          <Divider style={{ margin: '16px 0', borderColor: 'var(--border-color)' }} />
          <Paragraph className="profile-bio-text" style={{ fontStyle: 'italic' }}>
            {project.description}
          </Paragraph>
        </Card>
      </div>
    </motion.div>
  );

  const allProjectMembers = [
    ...(project.members || []),
  ].filter(Boolean);

  const handleNewMessage = (msg) => {
    if (activeTab !== 'chat' && msg.senderId?._id !== currentUser._id) {
      setUnreadChatCount(prev => prev + 1);
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === 'chat') setUnreadChatCount(0);
  };

  const tabItems = [
    { key: 'overview', label: <div className="tab-label-modern"><Activity size={16} /> Overview</div>, children: overviewTab },
    { key: 'tasks', label: <div className="tab-label-modern"><Layers size={16} /> Kanban</div>, children: <TaskBoard projectId={id} projectMembers={allProjectMembers} /> },
    { key: 'chat', label: <div className="tab-label-modern"><MessageSquare size={16} /> Collaboration <span>{unreadChatCount > 0 ? unreadChatCount : ''}</span></div>, children: <ChatInterface projectId={id} onNewMessage={handleNewMessage} /> },
    { key: 'members', label: <div className="tab-label-modern"><Users size={16} /> Team</div>, children: <MembersTable project={project} onRemove={handleRemoveMember} /> },
  ];


  return (
    <div className="workspace-modern">
      <div className="discovery-header-premium" style={{ alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button
            type="text"
            icon={<ChevronLeft size={20} />}
            onClick={() => navigate(-1)}
            className="back-btn-modern"
          />
          <div>
            <MuiTypography variant="h5" sx={{ margin: 0, fontWeight: 700 }} className="discovery-title">{project.title}</MuiTypography>
            <div className="status-indicator-lite" style={{ marginTop: 4 }}>
              <div className="pulse-dot"></div>
              <MuiTypography variant="caption" color="text.secondary">Workspace Live</MuiTypography>
            </div>
          </div>
        </div>
        {isCreator && (
          <div style={{ display: 'flex', gap: 12 }}>
            <Button icon={<Settings size={18} />} onClick={() => setEditModalOpen(true)} className="hero-sec-btn">Configure</Button>
            <Popconfirm title="Archive this project?" onConfirm={handleDelete}>
              <Button danger icon={<Trash2 size={18} />} className="shortcut-btn" style={{ color: 'var(--error)' }}>Discard</Button>
            </Popconfirm>
          </div>
        )}
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={handleTabChange} 
        items={tabItems} 
        className="modern-tabs"
        size="large"
      />

      {isCreator && (
        <EditProjectModal 
          open={editModalOpen} 
          onClose={() => setEditModalOpen(false)} 
          project={project}
          onSuccess={(updated) => setProject(updated)}
        />
      )}
    </div>
  );
}
