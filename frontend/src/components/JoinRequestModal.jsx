import { useState } from 'react';
import { Modal, Form, Input, Upload, Button, message } from 'antd';
import { GithubOutlined, UploadOutlined } from '@ant-design/icons';

const { TextArea } = Input;

export default function JoinRequestModal({ open, onClose, projectId }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    form.validateFields().then(async (values) => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/projects/${projectId}/join`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(values),
        });
        
        const data = await res.json();
        if (res.ok) {
          message.success('Join request submitted successfully!');
          form.resetFields();
          onClose();
        } else {
          message.error(data.message || 'Failed to submit request');
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
      title="Request to Join Project"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Submit Request"
      confirmLoading={loading}
      width={520}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="message"
          label="Why do you want to join?"
          rules={[{ required: true, message: 'Please introduce yourself and your motivation' }]}
        >
          <TextArea
            rows={4}
            placeholder="Tell the team leader why you'd be a great addition to the team…"
          />
        </Form.Item>
        <Form.Item name="github" label="GitHub Profile">
          <Input prefix={<GithubOutlined />} placeholder="https://github.com/username" />
        </Form.Item>
        <Form.Item name="resume" label="Resume (Optional)" valuePropName="fileList" getValueFromEvent={(e) => e?.fileList}>
          <Upload maxCount={1} beforeUpload={() => false}>
            <Button icon={<UploadOutlined />}>Upload Resume</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
}
