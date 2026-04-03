import { Form, Input, InputNumber, Select, Button, Card, Typography, message } from 'antd';
import { Typography as MuiTypography } from '@mui/material';
import { motion } from 'framer-motion';
import { ArrowLeft, Rocket, Users, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../config/api';
import useSkills, { invalidateSkillsCache } from '../hooks/useSkills';
import { staggerContainer, fadeInUp } from '../utils/motion';
const { TextArea } = Input;

const container = staggerContainer();
const item = fadeInUp;

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { skillOptions, loading: skillsLoading } = useSkills();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      // Ensure skills are sent as 'requiredSkills' to match backend model
      const projectData = {
        ...values,
        requiredSkills: values.requiredSkills
      };
      await api.post('/projects', projectData);
      invalidateSkillsCache(); // Refresh cache in case new skills were auto-added
      message.success('Project created successfully!');
      navigate('/dashboard/projects');
    } catch (error) {
      console.error('Create project error:', error);
      message.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-project-page-modern">
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
        <motion.div variants={item} className="page-header-simple">
          <MuiTypography variant="h4" sx={{ fontWeight: 700 }}>Share Your Vision</MuiTypography>
          <MuiTypography color="text.secondary">Create a new project and find the perfect team to build it with.</MuiTypography>
        </motion.div>

        <motion.div variants={item} style={{ marginTop: 32 }}>
          <Card className="form-card-premium">
            <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <div className="form-section-icon"><Info size={18} /></div>
                <MuiTypography variant="h6" sx={{ margin: 0, fontWeight: 700 }}>Basic Information</MuiTypography>
              </div>

              <Form.Item
                name="title"
                label="Project Title"
                rules={[{ required: true, message: 'What is your project called?' }]}
              >
                <Input placeholder="e.g. AI-Powered Study Assistant" size="large" className="modern-input" />
              </Form.Item>

              <Form.Item
                name="description"
                label="Executive Summary"
                rules={[{ required: true, message: 'Please provide a brief description' }]}
              >
                <TextArea 
                  rows={4} 
                  placeholder="Tell us about the problem you're solving and how you plan to build it..." 
                  className="modern-input"
                />
              </Form.Item>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, marginTop: 40 }}>
                <div className="form-section-icon"><Users size={18} /></div>
                <MuiTypography variant="h6" sx={{ margin: 0, fontWeight: 700 }}>Team & Skills</MuiTypography>
              </div>

              <div className="auth-grid-2">
                <Form.Item
                  name="requiredSkills"
                  label="Core Technologies"
                  rules={[{ required: true, message: 'Select at least one skill' }]}
                >
                  <Select
                    mode="tags"
                    placeholder="Search or select skills..."
                    size="large"
                    className="modern-select"
                    loading={skillsLoading}
                    options={skillOptions}
                    tokenSeparators={[',']}
                  />
                </Form.Item>

                <Form.Item
                  name="teamSize"
                  label="Target Team Size"
                  rules={[{ required: true, message: 'How many members do you need?' }]}
                >
                  <InputNumber min={2} max={10} placeholder="4" size="large" style={{ width: '100%' }} className="modern-input" />
                </Form.Item>
              </div>

              <Form.Item style={{ marginTop: 40, marginBottom: 0 }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  size="large" 
                  loading={loading} 
                  className="auth-btn"
                  block
                >
                  Launch Project <Rocket size={18} style={{ marginLeft: 8 }} />
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
