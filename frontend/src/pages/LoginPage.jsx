import { Form, Input, Button, Checkbox, message } from 'antd';
import { Typography as MuiTypography } from '@mui/material';
import { motion } from 'framer-motion';
import { Mail, Lock, Rocket, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import GoogleLoginButton from '../components/GoogleLoginButton';
import api from '../config/api';
import { staggerContainer, fadeInUp } from '../utils/motion';

const container = staggerContainer();
const item = fadeInUp;

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/login', { email: values.email, password: values.password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      message.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      message.error(error.response?.data?.message || 'Login failed');
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
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="auth-card-modern"
      >
        <motion.div variants={item} className="auth-header">
          <div className="auth-logo">
            <Rocket size={32} color="var(--primary)" />
            <span className="logo-gradient">CollabNest</span>
          </div>
          <MuiTypography variant="h4" sx={{ marginTop: '24px', marginBottom: '8px', fontWeight: 700 }}>Welcome back</MuiTypography>
          <MuiTypography color="text.secondary">Enter your credentials to access your workspace</MuiTypography>
        </motion.div>

        <motion.div variants={item} style={{ marginTop: 32 }}>
          <Form layout="vertical" onFinish={onFinish} autoComplete="off">
            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input 
                prefix={<Mail size={18} className="input-icon" />} 
                placeholder="you@university.edu" 
                size="large" 
                className="modern-input"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password 
                prefix={<Lock size={18} className="input-icon" />} 
                placeholder="••••••••" 
                size="large"
                className="modern-input"
              />
            </Form.Item>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Checkbox><MuiTypography color="text.secondary" sx={{ fontSize: '13px', display: 'inline' }}>Remember me</MuiTypography></Checkbox>
              <Link to="#" className="forgot-link">Forgot password?</Link>
            </div>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large" 
                loading={loading} 
                className="auth-btn"
                block
              >
                Sign In <ArrowRight size={18} style={{ marginLeft: 8 }} />
              </Button>
            </Form.Item>
          </Form>

          <div className="auth-divider">
            <div className="auth-divider-line"></div>
            <span className="auth-divider-text">Or continue with</span>
          </div>

          <GoogleLoginButton />
        </motion.div>

        <motion.div variants={item} className="auth-footer">
          <MuiTypography color="text.secondary">
            Don't have an account? <Link to="/register" className="auth-link">Create an account for free</Link>
          </MuiTypography>
        </motion.div>
      </motion.div>
    </div>
  );
}
