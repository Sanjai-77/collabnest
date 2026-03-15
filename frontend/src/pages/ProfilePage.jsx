import { useState, useEffect } from 'react';
import { Card, Form, Input, Select, Upload, Button, Avatar, Tag, message, Divider, Typography, Space } from 'antd';
import { motion } from 'framer-motion';
import { 
  User as UserIcon, 
  Mail, 
  Github, 
  FileText, 
  Edit3, 
  Save, 
  Upload as UploadIcon,
  ShieldCheck,
  Code2,
  ExternalLink,
  Camera,
  Phone
} from 'lucide-react';
import api from '../config/api';

const { Title, Text, Paragraph } = Typography;

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
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();
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

  useEffect(() => {
    if (editing && profile) {
      form.setFieldsValue(profile);
    }
  }, [editing, profile, form]);

  const handleSave = () => {
    form.validateFields().then(async (values) => {
      try {
        const payload = { ...values };
        if (payload.resume && Array.isArray(payload.resume) && payload.resume.length > 0) {
          payload.resume = payload.resume[0].name || payload.resume[0].url || '';
        } else if (typeof payload.resume !== 'string') {
          payload.resume = '';
        }

        const res = await api.put('/auth/profile', payload);
        message.success('Profile updated successfully!');
        const newProfile = { ...profile, ...res.data };
        setProfile(newProfile);
        localStorage.setItem('user', JSON.stringify(newProfile));
        setEditing(false);
      } catch (error) {
        console.error('Profile update error:', error);
        message.error(error.response?.data?.message || 'Failed to update profile');
      }
    });
  };

  if (!profile) return null;

  return (
    <div className="profile-page-modern">
      <div className="page-header-simple" style={{ marginBottom: 32 }}>
        <Title level={2}>Account Settings</Title>
        <Text type="secondary">Manage your public presence and preferences.</Text>
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
                <Avatar size={100} src={profile.avatar} icon={<UserIcon size={40} />} className="profile-avatar-main" />
                <Button icon={<Camera size={16} />} className="avatar-edit-btn" />
              </div>
              <div className="profile-info-main">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <Title level={3} style={{ margin: 0 }}>{profile.username}</Title>
                    <Text type="secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <Mail size={14} /> {profile.email}
                    </Text>
                    {profile.phone && (
                      <Text type="secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <Phone size={14} /> {profile.phone}
                      </Text>
                    )}
                  </div>
                  {!editing ? (
                    <Button icon={<Edit3 size={16} />} onClick={() => setEditing(true)} className="hero-sec-btn">Edit Profile</Button>
                  ) : (
                    <Space>
                      <Button onClick={() => setEditing(false)} className="shortcut-btn" style={{ background: 'transparent' }}>Cancel</Button>
                      <Button type="primary" icon={<Save size={16} />} onClick={handleSave} className="auth-btn">Save Changes</Button>
                    </Space>
                  )}
                </div>
              </div>
            </div>

            <Divider style={{ margin: '32px 0', borderColor: 'var(--border-color)' }} />

            {editing ? (
              <Form
                form={form}
                layout="vertical"
                initialValues={{
                  ...profile,
                  resume: profile.resume ? [{ uid: '-1', name: profile.resume, status: 'done', url: profile.resume }] : []
                }}
                requiredMark={false}
              >
                <div className="auth-grid-2">
                  <Form.Item name="username" label="Username" rules={[{ required: true }]}>
                    <Input prefix={<UserIcon size={16} className="input-icon" />} size="large" className="modern-input" />
                  </Form.Item>
                  <Form.Item name="phone" label="Phone Number">
                    <Input prefix={<Phone size={16} className="input-icon" />} size="large" className="modern-input" placeholder="+1..." />
                  </Form.Item>
                  <Form.Item name="github" label="GitHub Username">
                    <Input prefix={<Github size={16} className="input-icon" />} size="large" className="modern-input" placeholder="username" />
                  </Form.Item>
                </div>
                
                <Form.Item name="bio" label="About Me">
                  <Input.TextArea rows={4} placeholder="Describe your background and interests..." className="modern-input" />
                </Form.Item>

                <Form.Item name="skills" label="Technical Skills">
                  <Select
                    mode="multiple"
                    placeholder="Select your core skills"
                    size="large"
                    className="modern-select"
                    options={skillOptions.map(s => ({ label: s, value: s }))}
                  />
                </Form.Item>

                <Form.Item name="resume" label="Curriculum Vitae (PDF)" valuePropName="fileList" getValueFromEvent={(e) => e?.fileList}>
                  <Upload maxCount={1} beforeUpload={() => false}>
                    <Button icon={<UploadIcon size={16} />} className="shortcut-btn">Replace Resume File</Button>
                  </Upload>
                </Form.Item>
              </Form>
            ) : (
              <div className="profile-details-grid">
                <div className="profile-section-item">
                  <Title level={5} className="section-label-modern"><ShieldCheck size={16} /> ABOUT ME</Title>
                  <Paragraph className="profile-bio-text">
                    {profile.bio || 'Add a bio to help others get to know you.'}
                  </Paragraph>
                </div>

                <div className="profile-section-item">
                  <Title level={5} className="section-label-modern"><Code2 size={16} /> CORE STACK</Title>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {(profile.skills || []).map(s => (
                      <Tag key={s} className="skill-tag-premium">{s}</Tag>
                    ))}
                    {(!profile.skills || profile.skills.length === 0) && <Text type="secondary">No skills listed yet.</Text>}
                  </div>
                </div>

                <div className="auth-grid-2" style={{ marginTop: 20 }}>
                  <div className="profile-section-item">
                    <Title level={5} className="section-label-modern"><Github size={16} /> CONNECT</Title>
                    {profile.github ? (
                      <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer" className="auth-link" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        @{profile.github} <ExternalLink size={14} />
                      </a>
                    ) : (
                      <Text type="secondary">Not linked</Text>
                    )}
                  </div>

                  <div className="profile-section-item">
                    <Title level={5} className="section-label-modern"><FileText size={16} /> DOCUMENTS</Title>
                    {profile.resume ? (
                      <div className="resume-tag-modern">
                        <FileText size={14} /> {profile.resume}
                      </div>
                    ) : (
                      <Text type="secondary">No resume uploaded</Text>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
