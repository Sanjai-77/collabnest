import { useState, useEffect } from 'react';
import { Card, Badge, Button, Tag, Avatar, Typography, Spin } from 'antd';
import { Typography as MuiTypography } from '@mui/material';
import { motion } from 'framer-motion';
import { Rocket, Plus, Briefcase, Terminal, Users, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import { staggerContainer, fadeInUp } from '../utils/motion';

const tagColors = {
  React: 'blue', 'Node.js': 'green', Python: 'gold', 'Machine Learning': 'purple',
  Django: 'orange', PostgreSQL: 'geekblue',
};

const { Paragraph } = Typography;

const container = staggerContainer();
const item = fadeInUp;

export default function MyProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyProjects = async () => {
      try {
        const res = await api.get('/projects/my');
        setProjects(res.data);
      } catch (error) {
        console.error('Failed to fetch my projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyProjects();
  }, []);

  return (
    <div className="my-projects-modern">
      <div className="discovery-header-premium">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <MuiTypography variant="h4" className="discovery-title" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Rocket size={28} /> My Workspace
          </MuiTypography>
          <MuiTypography color="text.secondary" className="discovery-subtitle">Manage and collaborate on projects you're actively building.</MuiTypography>
        </motion.div>
        
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Button 
            type="primary" 
            icon={<Plus size={18} />} 
            size="large"
            onClick={() => navigate('/dashboard/projects/create')}
            className="auth-btn create-discovery-btn"
          >
            New Project
          </Button>
        </motion.div>
      </div>

      {loading ? (
        <div className="loading-state-premium">
          <Spin size="large" />
          <MuiTypography color="text.secondary">Loading your workspace...</MuiTypography>
        </div>
      ) : projects.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="empty-discovery-state"
        >
          <Briefcase size={64} className="empty-icon" />
          <MuiTypography variant="h6" sx={{ fontWeight: 600 }}>Your workspace is empty</MuiTypography>
          <MuiTypography color="text.secondary">Join an existing project or create one to start collaborating.</MuiTypography>
          <div style={{ marginTop: 32 }}>
            <Button 
              type="primary" 
              size="large" 
              icon={<Terminal size={18} />}
              onClick={() => navigate('/dashboard/projects')}
              className="auth-btn"
            >
              Explore Community
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="discovery-grid"
        >
          {projects.map((p) => (
            <motion.div key={p._id} variants={item}>
              <Card 
                className="discovery-card-premium"
                hoverable
                onClick={() => navigate(`/dashboard/workspace/${p._id}`)}
              >
                <div className="discovery-card-inner">
                  <div className="card-top-info">
                    <Badge.Ribbon text="Lead" color="gold">
                      <div className="card-header-main">
                        <MuiTypography variant="h6" className="card-title-premium" sx={{ fontWeight: 700 }}>{p.title}</MuiTypography>
                        <Paragraph className="card-desc-premium" ellipsis={{ rows: 2 }}>
                          {p.description}
                        </Paragraph>
                      </div>
                    </Badge.Ribbon>
                  </div>

                  <div className="card-skills-strip">
                    {(p.requiredSkills || []).slice(0, 3).map(s => (
                      <Tag key={s} className="skill-tag-premium">{s}</Tag>
                    ))}
                  </div>

                  <div className="card-footer-discovery">
                    <div className="team-stats-lite">
                      <Users size={14} />
                      <MuiTypography>{p.members?.length || 1} / {p.teamSize} Contributors</MuiTypography>
                    </div>
                    
                    <div className="status-indicator-lite">
                      <div className="pulse-dot"></div>
                      <MuiTypography variant="caption" color="text.secondary">Active</MuiTypography>
                    </div>
                  </div>

                  <div className="card-discovery-action">
                    <span>Open Project Hub</span>
                    <ExternalLink size={16} />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
