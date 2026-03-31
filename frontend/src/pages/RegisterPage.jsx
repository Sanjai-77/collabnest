import { Form, Input, Button, Select, Upload, message } from 'antd';
import { Typography as MuiTypography } from '@mui/material';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Rocket, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import GoogleLoginButton from '../components/GoogleLoginButton';
import api from '../config/api';
import { staggerContainer, fadeInUp } from '../utils/motion';

const skillOptions = [
  'React', 'Node.js', 'Python', 'Java', 'C++', 'Machine Learning',
  'Flutter', 'Django', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS',
  'TypeScript', 'Go', 'Rust', 'Figma', 'UI/UX', 'Data Science',
];

const container = staggerContainer(0.08);
const item = fadeInUp;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await api.post('/auth/register', { 
        username: values.username, 
        email: values.email, 
        password: values.password,
      });
      message.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      message.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-modern">
      {/* Dynamic Background */}
      <div className="landing-bg-overlay">
        <div className="gradient-sphere sphere-1"></div>
        <div className="gradient-sphere sphere-2"></div>
        <div className="gradient-sphere sphere-3"></div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="auth-card-modern"
        style={{ maxWidth: 480 }}
      >
        <motion.div variants={item} className="auth-header">
          <div className="auth-logo">
            <Rocket size={32} color="var(--primary)" />
            <span className="logo-gradient">CollabNest</span>
          </div>
          <MuiTypography variant="h4" sx={{ marginTop: '24px', marginBottom: '8px', fontWeight: 700, color: 'var(--text-primary)' }}>Create an account</MuiTypography>
          <MuiTypography sx={{ color: 'var(--text-secondary)' }}>Join CollabNest and start your project journey</MuiTypography>
        </motion.div>

        <motion.div variants={item} style={{ marginTop: 32 }}>
          <Form layout="vertical" onFinish={onFinish} autoComplete="off">
            <Form.Item
              name="username"
              label="Username"
              rules={[{ required: true, message: 'Please enter your username' }]}
            >
              <Input prefix={<User size={18} className="input-icon" />} placeholder="johndoe" size="large" className="modern-input" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input prefix={<Mail size={18} className="input-icon" />} placeholder="you@university.edu" size="large" className="modern-input" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please create a password' },
                { min: 8, message: 'Password must be at least 8 characters' },
              ]}
            >
              <Input.Password prefix={<Lock size={18} className="input-icon" />} placeholder="Min. 8 characters" size="large" className="modern-input" />
            </Form.Item>

            <Form.Item style={{ marginTop: 32 }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large" 
                loading={loading} 
                className="auth-btn"
                block
              >
                Create Account <ArrowRight size={18} style={{ marginLeft: 8 }} />
              </Button>
            </Form.Item>
          </Form>

          <div className="auth-divider">
            <div className="auth-divider-line"></div>
            <span className="auth-divider-text">Or continue with</span>
          </div>

          <GoogleLoginButton />
        </motion.div>

        <motion.div variants={item} className="auth-footer" style={{ marginTop: 24 }}>
          <MuiTypography sx={{ color: 'var(--text-secondary)' }}>
            Already have an account? <Link to="/login" className="auth-link">Sign in here</Link>
          </MuiTypography>
        </motion.div>
      </motion.div>
    </div>
  );
}
