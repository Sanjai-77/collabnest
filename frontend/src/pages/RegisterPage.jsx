import { Form, Input, Button, Select, Upload, message, Typography } from 'antd';
import { Typography as MuiTypography } from '@mui/material';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Github, UploadCloud, Rocket, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import GoogleLoginButton from '../components/GoogleLoginButton';
import api from '../config/api';

const { Title } = Typography;

const skillOptions = [
  'React', 'Node.js', 'Python', 'Java', 'C++', 'Machine Learning',
  'Flutter', 'Django', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS',
  'TypeScript', 'Go', 'Rust', 'Figma', 'UI/UX', 'Data Science',
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

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
          <Title level={2} style={{ marginTop: 24, marginBottom: 8 }}>Create your account</Title>
          <MuiTypography color="text.secondary">Join the community of student collaborators</MuiTypography>
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

          <div style={{ margin: '24px 0', textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }}></div>
            <span style={{ position: 'relative', padding: '0 12px', background: 'var(--card-bg)', color: 'var(--text-secondary)', fontSize: '13px', zIndex: 1 }}>Or continue with</span>
          </div>

          <GoogleLoginButton />
        </motion.div>

        <motion.div variants={item} className="auth-footer">
          <MuiTypography color="text.secondary">
            Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
          </MuiTypography>
        </motion.div>
      </motion.div>
    </div>
  );
}
