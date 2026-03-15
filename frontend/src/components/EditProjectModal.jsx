import { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, message } from 'antd';

const skillOptions = [
  'React', 'Node.js', 'Python', 'Java', 'C++', 'Machine Learning',
  'Flutter', 'Django', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS',
  'TypeScript', 'Go', 'Rust', 'Figma', 'UI/UX', 'Data Science',
];

export default function EditProjectModal({ open, onClose, project, onSuccess }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && project) {
      form.setFieldsValue({
        title: project.title,
        description: project.description,
        requiredSkills: project.requiredSkills,
        teamSize: project.teamSize,
      });
    }
  }, [open, project, form]);

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/projects/${project._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(values),
        });
        
        const data = await res.json();
        if (res.ok) {
          message.success('Project updated successfully');
          onSuccess(data);
          onClose();
        } else {
          message.error(data.message || 'Failed to update project');
        }
      } catch (err) {
        console.error(err);
        message.error('Server error');
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <Modal
      title="Edit Project"
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="title" label="Project Title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description" rules={[{ required: true }]}>
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item name="requiredSkills" label="Required Skills" rules={[{ required: true }]}>
          <Select mode="multiple" options={skillOptions.map(s => ({ label: s, value: s }))} />
        </Form.Item>
        <Form.Item name="teamSize" label="Team Size" rules={[{ required: true }]}>
          <InputNumber min={2} max={20} style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
