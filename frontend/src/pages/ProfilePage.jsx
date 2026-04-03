import { useState, useEffect } from 'react';
import { Card, Tag, Divider, Typography, Avatar, Button } from 'antd';
import { Typography as MuiTypography } from '@mui/material';
import { motion } from 'framer-motion';
import { 
  User as UserIcon, Mail, Github, FileText, Edit3, 
  ShieldCheck, Code2, ExternalLink, Camera, Phone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import { staggerContainer, fadeInUp } from '../utils/motion';

const { Paragraph } = Typography;

const container = staggerContainer();
const item = fadeInUp;

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        setProfile(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
      } catch (err) {
        const userStr = localStorage.getItem('user');
        if (userStr) setProfile(JSON.parse(userStr));
      }
    };
    fetchProfile();
  }, []);

  if (!profile) return null;

  return (
    <div className="profile-page-modern">
      <div className="page-header-simple" style={{ marginBottom: 32 }}>
        <MuiTypography variant="h4" sx={{ fontWeight: 700 }}>Account Settings</MuiTypography>
        <MuiTypography color="text.secondary">Manage your public presence and preferences.</MuiTypography>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item}>
          <Card className="profile-card-premium">
            <div className="profile-hero-modern">
              <div className="profile-avatar-wrapper">
                <Avatar 
                  size={100} 
                  src={profile.profileImage || profile.avatar} 
                  icon={<UserIcon size={40} />} 
                  className="profile-avatar-main" 
                  style={{ backgroundColor: 'var(--primary)' }} 
                />
                <Button 
                  icon={<Camera size={16} />} 
                  className="avatar-edit-btn" 
                  onClick={() => navigate('/dashboard/edit-profile')}
                />
              </div>
              <div className="profile-info-main">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <MuiTypography variant="h5" sx={{ margin: 0, fontWeight: 700 }}>{profile.username}</MuiTypography>
                    <MuiTypography color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      <Mail size={14} /> {profile.email}
                    </MuiTypography>
                    {profile.phone && (
                      <MuiTypography color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        <Phone size={14} /> {profile.phone}
                      </MuiTypography>
                    )}
                  </div>
                  <Button 
                    icon={<Edit3 size={16} />} 
                    onClick={() => navigate('/dashboard/edit-profile')} 
                    className="hero-sec-btn"
                  >
                    Edit Profile
                  </Button>
                </div>
              </div>
            </div>

            <Divider style={{ margin: '32px 0', borderColor: 'var(--border-color)' }} />

            <div className="profile-details-grid">
              <div className="profile-section-item">
                <MuiTypography variant="subtitle2" className="section-label-modern" sx={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.7, textTransform: 'uppercase', fontWeight: 700 }}>
                  <ShieldCheck size={16} /> ABOUT ME
                </MuiTypography>
                <Paragraph className="profile-bio-text">
                  {profile.bio || 'Add a bio to help others get to know you.'}
                </Paragraph>
              </div>

              <div className="profile-section-item">
                <MuiTypography variant="subtitle2" className="section-label-modern" sx={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.7, textTransform: 'uppercase', fontWeight: 700 }}>
                  <Code2 size={16} /> CORE STACK
                </MuiTypography>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {(profile.skills || []).map(s => (
                    <Tag key={s} className="skill-tag-premium">{s}</Tag>
                  ))}
                  {(!profile.skills || profile.skills.length === 0) && <MuiTypography color="text.secondary">No skills listed yet.</MuiTypography>}
                </div>
              </div>

              <div className="auth-grid-2" style={{ marginTop: 20 }}>
                <div className="profile-section-item">
                  <MuiTypography variant="subtitle2" className="section-label-modern" sx={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.7, textTransform: 'uppercase', fontWeight: 700 }}>
                    <Github size={16} /> CONNECT
                  </MuiTypography>
                  {profile.github ? (
                    <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer" className="auth-link" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      @{profile.github} <ExternalLink size={14} />
                    </a>
                  ) : (
                    <MuiTypography color="text.secondary">Not linked</MuiTypography>
                  )}
                </div>

                <div className="profile-section-item">
                  <MuiTypography variant="subtitle2" className="section-label-modern" sx={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.7, textTransform: 'uppercase', fontWeight: 700 }}>
                    <FileText size={16} /> DOCUMENTS
                  </MuiTypography>
                  {profile.resume ? (
                    <div className="resume-tag-modern">
                      <FileText size={14} /> {profile.resume}
                    </div>
                  ) : (
                    <MuiTypography color="text.secondary">No resume uploaded</MuiTypography>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
