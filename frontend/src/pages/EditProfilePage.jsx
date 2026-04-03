import { useState, useEffect } from 'react';
import { Card, Form, Input, Select, Upload, Button, Avatar, message, Space, Divider } from 'antd';
import { Typography as MuiTypography } from '@mui/material';
import { motion } from 'framer-motion';
import { 
  User as UserIcon, Save, Camera, Phone, ChevronLeft, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import useSkills from '../hooks/useSkills';
import { fadeInUp } from '../utils/motion';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [newImageFile, setNewImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const { skillOptions, loading: skillsLoading } = useSkills();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        setProfile(res.data);
        form.setFieldsValue(res.data);
      } catch (err) {
        message.error('Failed to load profile data');
      }
    };
    fetchProfile();
  }, [form]);

  const handleSave = () => {
    form.validateFields().then(async (values) => {
      setUploading(true);
      try {
        let profileImageUrl = profile.profileImage;

        // 1. Handle image upload if a new file was selected
        if (newImageFile) {
          const formData = new FormData();
          formData.append('image', newImageFile);
          const uploadRes = await api.post('/users/upload-profile', formData);
          profileImageUrl = uploadRes.data.profileImage;
        }

        // 2. Update profile details
        const payload = { 
          username: values.username,
          bio: values.bio,
          skills: values.skills,
          profileImage: profileImageUrl,
          phone: values.phone
        };

        const res = await api.put('/users/update-profile', payload);
        
        message.success('Profile updated successfully!');
        const updatedUser = { ...profile, ...res.data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Dispatch storage event to notify navbar
        window.dispatchEvent(new Event('storage'));
        
        navigate('/dashboard/profile');
      } catch (error) {
        console.error('Profile update error:', error);
        message.error(error.response?.data?.message || 'Failed to update profile');
      } finally {
        setUploading(false);
      }
    });
  };

  const handleFileSelect = (file) => {
    setNewImageFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return false; // Prevent auto-upload
  };

  if (!profile) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Loader2 className="spinner" size={40} />
    </div>
  );

  return (
    <div className="profile-page-modern">
      <div className="page-header-simple" style={{ marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <MuiTypography variant="h4" sx={{ fontWeight: 700 }}>Edit Profile</MuiTypography>
          <MuiTypography color="text.secondary">Customize your profile visibility and metadata.</MuiTypography>
        </div>
        <Button 
          icon={<ChevronLeft size={16} />} 
          onClick={() => navigate('/dashboard/profile')}
          className="shortcut-btn"
        >
          Back to Profile
        </Button>
      </div>

      <motion.div initial="hidden" animate="show" variants={fadeInUp}>
        <Card className="profile-card-premium" style={{ maxWidth: 800, margin: '0 auto' }}>
          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
          >
            <div style={{ display: 'flex', flexCol: 'column', alignItems: 'center', marginBottom: 32 }}>
              <div className="profile-avatar-wrapper" style={{ position: 'relative', marginBottom: 16 }}>
                <Avatar 
                  size={120} 
                  src={previewUrl || profile.profileImage || profile.avatar} 
                  icon={<UserIcon size={50} />} 
                  style={{ backgroundColor: 'var(--primary)' }} 
                />
                <Upload
                  beforeUpload={handleFileSelect}
                  showUploadList={false}
                  accept="image/*"
                >
                  <Button 
                    icon={<Camera size={18} />} 
                    className="avatar-edit-btn" 
                    style={{ position: 'absolute', bottom: 4, right: 4 }}
                  />
                </Upload>
              </div>
              <MuiTypography variant="subtitle1" sx={{ fontWeight: 600 }}>Profile Photo</MuiTypography>
              <MuiTypography variant="caption" color="text.secondary">PNG, JPG or GIF. Max 5MB.</MuiTypography>
            </div>

            <Divider style={{ borderColor: 'var(--border-color)' }} />

            <div className="auth-grid-2">
              <Form.Item name="username" label="Username" rules={[{ required: true }]}>
                <Input prefix={<UserIcon size={16} className="input-icon" />} size="large" className="modern-input" />
              </Form.Item>
              <Form.Item name="phone" label="Phone Number">
                <Input prefix={<Phone size={16} className="input-icon" />} size="large" className="modern-input" placeholder="+1..." />
              </Form.Item>
            </div>
            
            <Form.Item name="bio" label="About Me">
              <Input.TextArea rows={4} placeholder="Describe your background and interests..." className="modern-input" />
            </Form.Item>

            <Form.Item name="skills" label="Technical Skills">
              <Select
                mode="tags"
                placeholder="Select your core skills"
                size="large"
                className="modern-select"
                loading={skillsLoading}
                options={skillOptions}
                tokenSeparators={[',']}
              />
            </Form.Item>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 32 }}>
              <Button size="large" onClick={() => navigate('/dashboard/profile')} className="shortcut-btn">
                Cancel
              </Button>
              <Button 
                type="primary" 
                size="large" 
                icon={<Save size={18} />} 
                onClick={handleSave} 
                loading={uploading}
                className="auth-btn"
                style={{ minWidth: 140 }}
              >
                Save Changes
              </Button>
            </div>
          </Form>
        </Card>
      </motion.div>
    </div>
  );
}
