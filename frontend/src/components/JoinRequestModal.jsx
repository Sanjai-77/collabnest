import { useState } from 'react';
import { Modal, Form, Input, Upload, Button, message } from 'antd';
import { GithubOutlined, UploadOutlined } from '@ant-design/icons';
import api from '../config/api';

const { TextArea } = Input;

export default function JoinRequestModal({ open, onClose, projectId }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    form.validateFields().then(async (values) => {
      try {
        setLoading(true);
        const payload = { ...values };
        if (payload.resume && Array.isArray(payload.resume) && payload.resume.length > 0) {
          payload.resume = payload.resume[0].name || payload.resume[0].url || '';
        }
        
        await api.post(`/projects/${projectId}/join`, payload);
        message.success('Join request submitted successfully!');
        form.resetFields();
        onClose();
      } catch (err) {
        console.error(err);
        message.error(err.response?.data?.message || 'Failed to submit request');
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
