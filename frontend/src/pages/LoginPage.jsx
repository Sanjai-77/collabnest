import { Form, Input, Button, Checkbox, message, Typography } from 'antd';
import { motion } from 'framer-motion';
import { Mail, Lock, Rocket, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import GoogleLoginButton from '../components/GoogleLoginButton';

const { Title, Text } = Typography;

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

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email, password: values.password }),
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        message.success('Login successful!');
        navigate('/dashboard');
      } else {
        message.error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error('Server error, please try again later');
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
          <Title level={2} style={{ marginTop: 24, marginBottom: 8 }}>Welcome back</Title>
          <Text type="secondary">Enter your credentials to access your workspace</Text>
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
              <Checkbox><Text type="secondary" style={{ fontSize: '13px' }}>Remember me</Text></Checkbox>
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

          <div style={{ margin: '24px 0', textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }}></div>
            <span style={{ position: 'relative', padding: '0 12px', background: 'var(--card-bg)', color: 'var(--text-secondary)', fontSize: '13px', zIndex: 1 }}>Or continue with</span>
          </div>

          <GoogleLoginButton />
        </motion.div>

        <motion.div variants={item} className="auth-footer">
          <Text type="secondary">
            Don't have an account? <Link to="/register" className="auth-link">Create one for free</Link>
          </Text>
        </motion.div>
      </motion.div>
    </div>
  );
}
