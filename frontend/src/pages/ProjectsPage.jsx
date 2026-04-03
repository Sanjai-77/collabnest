import { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Input, Select, Card, Badge, Avatar, Tag, Spin, message } from 'antd';
import { Typography as MuiTypography } from '@mui/material';
import { Typography } from 'antd';
import { motion } from 'framer-motion';
import { Compass, Plus, Search, Filter, User, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import useSkills from '../hooks/useSkills';
import { staggerContainer, fadeInUp } from '../utils/motion';

const { Paragraph } = Typography;

const container = staggerContainer();
const item = fadeInUp;

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState([]);
  const { skillOptions, loading: skillsLoading } = useSkills();

  // Debounce timer ref
  const debounceRef = useRef(null);

  // Fetch projects from backend with search/filter params
  const fetchProjects = useCallback(async (search, skills) => {
    try {
      setLoading(true);
      const params = {};
      if (search && search.trim()) params.search = search.trim();
      if (skills && skills.length > 0) params.skills = skills.join(',');

      const res = await api.get('/projects', { params });
      setProjects(res.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load — no filters
  useEffect(() => {
    fetchProjects('', []);
  }, [fetchProjects]);

  // Debounced search
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchProjects(value, skillFilter);
    }, 400);
  };

  // Immediate filter on skill selection
  const handleSkillFilterChange = (values) => {
    setSkillFilter(values || []);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    fetchProjects(searchQuery, values || []);
  };

  return (
    <div className="projects-discovery-modern">
      <div className="discovery-header-premium">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <MuiTypography variant="h4" className="discovery-title" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Compass size={28} /> Explore Projects
          </MuiTypography>
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
          placeholder="Search by title, description, or skills..."
          size="large"
          className="modern-input discovery-search"
          value={searchQuery}
          onChange={handleSearchChange}
          allowClear
        />
        <Select
          mode="multiple"
          placeholder="Filter by Skills"
          size="large"
          className="modern-select discovery-select"
          allowClear
          suffixIcon={<Filter size={16} />}
          onChange={handleSkillFilterChange}
          value={skillFilter}
          loading={skillsLoading}
          options={skillOptions}
          maxTagCount="responsive"
        />
      </div>

      {loading ? (
        <div className="loading-state-premium">
          <Spin size="large" />
          <MuiTypography color="text.secondary">Curating your project feed...</MuiTypography>
        </div>
      ) : projects.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="empty-discovery-state"
        >
          <Compass size={64} className="empty-icon" />
          <MuiTypography variant="h6" sx={{ fontWeight: 600 }}>No projects matched your search</MuiTypography>
          <MuiTypography color="text.secondary">Try broader terms or different skills to find more projects.</MuiTypography>
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
                onClick={() => navigate(`/dashboard/projects/${p._id}`)}
              >
                <div className="discovery-card-inner">
                  <div className="card-top-info">
                    <Badge.Ribbon text={p.status || 'Active'} color={p.status === 'completed' ? 'green' : 'blue'}>
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
