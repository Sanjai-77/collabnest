import { useState, useEffect } from 'react';
import { Tabs, Tag, Card, Descriptions, Avatar, List, Spin, Popconfirm, message, Badge, Typography, Divider } from 'antd';
import { 
  ChevronLeft, 
  Settings, 
  Trash2, 
  Layout, 
  MessageSquare, 
  Users, 
  Info,
  Activity,
  Calendar,
  Layers
} from 'lucide-react';
import { Button } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import TaskBoard from '../components/TaskBoard';
import ChatInterface from '../components/ChatInterface';
import MembersTable from '../components/MembersTable';
import EditProjectModal from '../components/EditProjectModal';

const { Title, Text, Paragraph } = Typography;

export default function WorkspacePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isCreator = String(project?.createdBy?._id || project?.createdBy) === String(currentUser._id);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/projects/${id}`);
        if (res.ok) {
          const data = await res.json();
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
        }
      } catch (error) {
        console.error('Failed to fetch project:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
    const interval = setInterval(fetchProject, 30000);
    return () => clearInterval(interval);
  }, [id, navigate, currentUser._id]);



  if (loading) return <div className="loading-state-premium"><Spin size="large" /><Text type="secondary">Preparing your workspace...</Text></div>;
  if (!project) return <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-secondary)' }}>Project not found</div>;

  const handleDelete = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${project._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        message.success('Project deleted');
        navigate('/dashboard/projects');
      } else {
        message.error('Failed to delete project');
      }
    } catch (err) {
      console.error(err);
      message.error('Server error');
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/projects/${id}/members/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const updatedProject = await res.json();
        setProject(updatedProject);
        message.success('Member removed successfully');
      } else {
        const err = await res.json();
        message.error(err.message || 'Failed to remove member');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      message.error('Server error');
    }
  };

  const overviewTab = (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="details-grid-modern" style={{ marginTop: 20 }}>
        <Card className="details-card-premium">
          <Title level={4} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Activity size={20} className="text-primary" /> Project Overview
          </Title>
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
          <Title level={4} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Info size={20} className="text-primary" /> Strategic Aim
          </Title>
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
            <Title level={3} style={{ margin: 0 }} className="discovery-title">{project.title}</Title>
            <div className="status-indicator-lite" style={{ marginTop: 4 }}>
              <div className="pulse-dot"></div>
              <Text size="small" type="secondary">Workspace Live</Text>
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
