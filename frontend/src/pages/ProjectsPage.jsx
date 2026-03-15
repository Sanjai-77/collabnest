import { useState, useEffect } from 'react';
import { Button, Input, Select, Card, Badge, Avatar, Tag, Spin, Typography, message } from 'antd';
import { Typography as MuiTypography } from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Compass, 
  Plus, 
  Search, 
  Filter, 
  User, 
  Users, 
  ArrowRight 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';

const { Title, Paragraph } = Typography;

const tagColors = {
  React: 'blue', 'Node.js': 'green', Python: 'gold', 'Machine Learning': 'purple',
  Flutter: 'cyan', MongoDB: 'lime', Django: 'orange', PostgreSQL: 'geekblue',
  TypeScript: 'magenta', Docker: 'volcano', AWS: 'red', 'Data Science': 'purple',
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

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects');
        setProjects(res.data);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSkill = !skillFilter || (p.requiredSkills && p.requiredSkills.includes(skillFilter));
    return matchesSearch && matchesSkill;
  });

  return (
    <div className="projects-discovery-modern">
      <div className="discovery-header-premium">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <Title level={2} className="discovery-title"><Compass size={28} /> Explore Projects</Title>
          <MuiTypography color="text.secondary" className="discovery-subtitle">Find your next big collaboration among amazing student projects.</MuiTypography>
        </motion.div>
        
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Button 
            type="primary" 
            icon={<Plus size={18} />} 
            size="large"
            onClick={() => navigate('/dashboard/projects/create')}
            className="auth-btn create-discovery-btn"
          >
            Create Project
          </Button>
        </motion.div>
      </div>

      <div className="discovery-filters-bar">
        <Input
          prefix={<Search size={18} className="input-icon" />}
          placeholder="Search by title, stack, or keywords..."
          size="large"
          className="modern-input discovery-search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Select
          placeholder="Filter by Skill"
          size="large"
          className="modern-select discovery-select"
          allowClear
          suffixIcon={<Filter size={16} />}
          onChange={setSkillFilter}
          options={Object.keys(tagColors).map(s => ({ label: s, value: s }))}
        />
      </div>

      {loading ? (
        <div className="loading-state-premium">
          <Spin size="large" />
          <MuiTypography color="text.secondary">Curating your project feed...</MuiTypography>
        </div>
      ) : filteredProjects.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="empty-discovery-state"
        >
          <Compass size={64} className="empty-icon" />
          <Title level={4}>No projects matched your search</Title>
          <MuiTypography color="text.secondary">Try broad terms or different skills to find more projects.</MuiTypography>
        </motion.div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="discovery-grid"
        >
          {filteredProjects.map((p) => (
            <motion.div key={p._id} variants={item}>
              <Card 
                className="discovery-card-premium"
                hoverable
                onClick={() => navigate(`/dashboard/projects/${p._id}`)}
              >
                <div className="discovery-card-inner">
                  <div className="card-top-info">
                    <Badge.Ribbon text={p.status || 'Active'} color={p.status === 'completed' ? 'green' : 'blue'}>
                      <div className="card-header-main">
                        <Title level={4} className="card-title-premium">{p.title}</Title>
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
                    {p.requiredSkills?.length > 3 && (
                      <span className="skills-more">+{p.requiredSkills.length - 3}</span>
                    )}
                  </div>

                  <div className="card-footer-discovery">
                    <div className="author-info-lite">
                      <Avatar src={p.createdBy?.avatar} icon={<User size={12} />} className="author-avatar-lite" />
                      <MuiTypography className="author-name-lite">{p.createdBy?.username || 'Collaborator'}</MuiTypography>
                    </div>
                    
                    <div className="team-stats-lite">
                      <Users size={14} />
                      <MuiTypography>{p.members?.length || 0} / {p.teamSize}</MuiTypography>
                    </div>

                  </div>

                  <div className="card-discovery-action">
                    <span>View Project Workspace</span>
                    <ArrowRight size={16} />
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
