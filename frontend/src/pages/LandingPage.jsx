import { Button, Typography } from 'antd';
import { Typography as MuiTypography } from '@mui/material';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Rocket, 
  Users, 
  Layout, 
  MessageSquare, 
  CheckCircle, 
  ArrowRight, 
  Zap,
  Globe,
  Shield,
  Star
} from 'lucide-react';

// Typography components destructured from Ant Design
const { Paragraph } = Typography;

const features = [
  {
    icon: <Users size={24} />,
    title: 'Find Teammates',
    desc: 'Discover skilled students and build your dream project team based on expertise and interests.',
    color: '#6366f1'
  },
  {
    icon: <Layout size={24} />,
    title: 'Manage Projects',
    desc: 'Track progress with Kanban boards, assign tasks, and hit milestones together seamlessly.',
    color: '#06b6d4'
  },
  {
    icon: <MessageSquare size={24} />,
    title: 'Real-time Chat',
    desc: 'Communicate instantly with your team through project-based chat channels.',
    color: '#22c55e'
  },
  {
    icon: <CheckCircle size={24} />,
    title: 'Task Tracking',
    desc: 'Organize work into actionable tasks with status tracking and priority labeling.',
    color: '#f59e0b'
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const item = {
  hidden: { y: 30, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

export default function LandingPage() {
  return (
    <div className="landing-page-modern">
      {/* Dynamic Background */}
      <div className="landing-bg-overlay">
        <div className="gradient-sphere sphere-1"></div>
        <div className="gradient-sphere sphere-2"></div>
        <div className="gradient-sphere sphere-3"></div>
      </div>

      {/* Navbar */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="landing-nav"
      >
        <div className="landing-logo">
          <motion.div
            animate={{ rotate: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
          >
            <Rocket size={28} className="logo-icon" color="var(--primary)" />
          </motion.div>
          <span className="logo-gradient">CollabNest</span>
        </div>
        <div className="landing-nav-btns">
          <Link to="/login">
            <Button type="text" size="large" className="nav-link-btn">Log In</Button>
          </Link>
          <Link to="/register">
            <Button type="primary" size="large" className="nav-cta-btn">Get Started</Button>
          </Link>
        </div>
      </motion.nav>

      {/* Hero section */}
      <section className="hero-section">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="hero-badge"
        >
          <Zap size={14} fill="currentColor" />
          <span>Built for the next generation of builders</span>
        </motion.div>
        
        <motion.h1 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="hero-title"
        >
          Build Amazing Projects <br />
          <span className="text-gradient">Faster, Together</span>
        </motion.h1>
        
        <motion.p 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="hero-subtitle"
        >
          The all-in-one workspace for student collaboration. Find your team, 
          manage your tasks, and bring your ideas to life in a beautiful environment.
        </motion.p>
        
        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="hero-cta"
        >
          <Link to="/register">
            <Button type="primary" size="large" className="hero-main-btn">
              Start Collaborating <ArrowRight size={18} />
            </Button>
          </Link>
          <Link to="/login">
            <Button size="large" className="hero-sec-btn">Explore Projects</Button>
          </Link>
        </motion.div>

        {/* Hero Visual */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="hero-visual"
        >
          <div className="hero-card-mockup">
            <div className="mockup-header">
              <div className="dots"><span/><span/><span/></div>
            </div>
            <div className="mockup-content">
              <div className="skeleton line-1"></div>
              <div className="skeleton line-2"></div>
              <div className="skeleton grid">
                <div className="box"></div>
                <div className="box"></div>
                <div className="box"></div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="section-header">
          <MuiTypography variant="h4" sx={{ fontWeight: 800 }}>Everything you need to ship</MuiTypography>
          <MuiTypography color="text.secondary">Powerful tools designed specifically for student project lifecycles.</MuiTypography>
        </div>
        
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="features-grid"
        >
          {features.map((f, i) => (
            <motion.div 
              key={i}
              variants={item}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="feature-card-premium"
            >
              <div className="feature-icon" style={{ background: `${f.color}15`, color: f.color }}>
                {f.icon}
              </div>
              <MuiTypography variant="h6" sx={{ fontWeight: 700 }}>{f.title}</MuiTypography>
              <MuiTypography color="text.secondary">{f.desc}</MuiTypography>
              <div className="feature-border" style={{ background: f.color }}></div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Social Proof Section (Optional) */}
      <section className="stats-strip">
        <div className="stat-item">
          <MuiTypography variant="h5" sx={{ fontWeight: 800 }}>1k+</MuiTypography>
          <MuiTypography color="text.secondary">Active Projects</MuiTypography>
        </div>
        <div className="stat-item">
          <MuiTypography variant="h5" sx={{ fontWeight: 800 }}>5k+</MuiTypography>
          <MuiTypography color="text.secondary">Students</MuiTypography>
        </div>
        <div className="stat-item">
          <MuiTypography variant="h5" sx={{ fontWeight: 800 }}>100+</MuiTypography>
          <MuiTypography color="text.secondary">Universities</MuiTypography>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer-modern">
        <div className="footer-content">
          <div className="footer-logo">
            <Rocket size={20} color="var(--primary)" />
            <span>CollabNest</span>
          </div>
          <p>© 2026 CollabNest. Built for the future of student innovation.</p>
          <div className="footer-links">
            <Globe size={18} />
            <Shield size={18} />
            <Star size={18} />
          </div>
        </div>
      </footer>
    </div>
  );
}
