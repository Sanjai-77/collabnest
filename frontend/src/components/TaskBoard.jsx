import { useState, useEffect } from 'react';
import { Card, Button, Input, Modal, Form, Select, Tag, Spin, message, Empty, Typography, Avatar, Tooltip, DatePicker } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, User, Clock, MoreVertical, Layout as LayoutIcon, CheckCircle2, Circle, Loader2, Calendar } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const { Text, Title } = Typography;

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: '#6366f1', icon: <Circle size={16} /> },
  { id: 'in-progress', title: 'In Progress', color: '#f59e0b', icon: <Loader2 size={16} /> },
  { id: 'completed', title: 'Completed', color: '#22c55e', icon: <CheckCircle2 size={16} /> },
];

export default function TaskBoard({ projectId, projectMembers = [] }) {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchTasks();
    }
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/tasks/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error(err);
      message.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTask = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}/accept`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        message.success('Task accepted');
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
      message.error('Failed to accept task');
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}/complete`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        message.success('Task marked as completed');
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
      message.error('Failed to complete task');
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    const taskId = draggableId;
    const newStatus = destination.droppableId;

    const originalTasks = [...tasks];
    setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Failed to update task');
    } catch (err) {
      console.error(err);
      message.error('Failed to update task status');
      setTasks(originalTasks);
    }
  };

  const handleCreateTask = async (values) => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...values, projectId })
      });

      if (res.ok) {
        message.success('Task created successfully');
        form.resetFields();
        setIsModalOpen(false);
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
      message.error('Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <Spin size="large" />
      <Text type="secondary">Organizing your workspace...</Text>
    </div>
  );

  return (
    <div className="task-board-modern">
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Project Board</Title>
          <Text type="secondary" style={{ fontSize: '13px' }}>Track progress and manage team tasks.</Text>
        </div>
        <Button 
          type="primary" 
          icon={<Plus size={16} />} 
          onClick={() => setIsModalOpen(true)}
          style={{ borderRadius: '6px', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          Add Task
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board" style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 16 }}>
          {COLUMNS.map(column => (
            <div 
              key={column.id} 
              className="kanban-column-modern"
              style={{ 
                flex: 1, 
                minWidth: 300, 
                background: 'var(--bg-app)', 
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid var(--border-color)',
                height: 'fit-content',
                maxHeight: 'calc(100vh - 250px)'
              }}
            >
              <div 
                className="column-header" 
                style={{ 
                  padding: '16px 20px', 
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: column.color, display: 'flex' }}>{column.icon}</span>
                  <Text strong style={{ fontSize: '14px' }}>{column.title}</Text>
                  <Tag 
                    style={{ 
                      margin: 0, 
                      borderRadius: '10px', 
                      background: 'var(--bg-card)', 
                      border: '1px solid var(--border-color)',
                      fontSize: '11px',
                      padding: '0 8px'
                    }}
                  >
                    {tasks.filter(t => t.status === column.id).length}
                  </Tag>
                </div>
                <Button type="text" icon={<MoreVertical size={16} />} size="small" />
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div 
                    className="column-body"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={{ 
                      padding: '12px', 
                      flex: 1, 
                      overflowY: 'auto',
                      minHeight: 150,
                      background: snapshot.isDraggingOver ? 'var(--bg-card-hover)' : 'transparent',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <AnimatePresence mode="popLayout">
                      {tasks
                        .filter((t) => t.status === column.id)
                        .map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided, snapshot) => (
                              <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  marginBottom: 12,
                                }}
                              >
                                <Card
                                  size="small"
                                  className="task-card-modern"
                                  style={{
                                    borderRadius: '12px',
                                    background: 'var(--bg-card)',
                                    border: snapshot.isDragging
                                      ? '1px solid var(--primary)'
                                      : '1px solid var(--border-color)',
                                    boxShadow: snapshot.isDragging
                                      ? 'var(--shadow-lg)'
                                      : 'var(--shadow-sm)',
                                  }}
                                  bodyStyle={{ padding: '16px' }}
                                >
                                  <div style={{ marginBottom: 12 }}>
                                    <Text
                                      strong
                                      style={{ fontSize: '14px', display: 'block', marginBottom: 6 }}
                                    >
                                      {task.title}
                                    </Text>
                                    {task.description && (
                                      <Text
                                        type="secondary"
                                        style={{
                                          fontSize: '12px',
                                          display: '-webkit-box',
                                          WebkitLineClamp: 2,
                                          WebkitBoxOrient: 'vertical',
                                          overflow: 'hidden',
                                          lineHeight: '1.5',
                                        }}
                                      >
                                        {task.description}
                                      </Text>
                                    )}
                                  </div>

                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      marginTop: 16,
                                    }}
                                  >
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Clock size={12} style={{ color: 'var(--text-muted)' }} />
                                        <Text type="secondary" style={{ fontSize: '11px' }}>
                                          {new Date(task.createdAt).toLocaleDateString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                          })}
                                        </Text>
                                      </div>
                                      {task.dueDate && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                          <Calendar size={12} style={{ color: 'var(--primary)' }} />
                                          <Text style={{ fontSize: '11px', color: 'var(--primary)' }}>
                                            Due: {new Date(task.dueDate).toLocaleDateString(undefined, {
                                              month: 'short',
                                              day: 'numeric',
                                            })}
                                          </Text>
                                        </div>
                                      )}
                                    </div>

                                    {task.assignedTo && (
                                      <Tooltip title={`Assigned to ${task.assignedTo.name}`}>
                                        <Avatar
                                          size={24}
                                          src={task.assignedTo.avatar}
                                          icon={<User size={12} />}
                                          style={{ backgroundColor: 'var(--primary)' }}
                                        />
                                      </Tooltip>
                                    )}
                                  </div>

                                  {task.assignedTo && String(task.assignedTo._id || task.assignedTo) === String(currentUser._id) && (
                                    <div style={{ marginTop: 16, borderTop: '1px solid var(--border-color)', paddingTop: 12 }}>
                                      {task.status === 'todo' && (
                                        <Button 
                                          type="primary" 
                                          size="small" 
                                          block 
                                          onClick={() => handleAcceptTask(task._id)}
                                          className="auth-btn"
                                        >
                                          Accept Task
                                        </Button>
                                      )}
                                      {task.status === 'in-progress' && (
                                        <Button 
                                          type="primary" 
                                          size="small" 
                                          block 
                                          onClick={() => handleCompleteTask(task._id)}
                                          style={{ background: '#22c55e', borderColor: '#22c55e' }}
                                        >
                                          Mark as Completed
                                        </Button>
                                      )}
                                    </div>
                                  )}
                                </Card>
                              </motion.div>
                            )}
                          </Draggable>
                        ))}
                    </AnimatePresence>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
      </div>
    </DragDropContext>

    <Modal
      title={<Title level={4} style={{ margin: 0 }}>Create Task</Title>}
      open={isModalOpen}
      onCancel={() => {
        setIsModalOpen(false);
        form.resetFields();
      }}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      centered
      okText="Create task"
      cancelText="Cancel"
      width={480}
      bodyStyle={{ paddingTop: 16 }}
    >
      <Form form={form} layout="vertical" onFinish={handleCreateTask} initialValues={{ status: 'todo' }}>
        <Form.Item name="title" label="Task Title" rules={[{ required: true, message: 'What needs to be done?' }]}>
          <Input placeholder="Enter task title..." size="large" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} placeholder="Add more details about this task..." />
        </Form.Item>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Form.Item name="assignedTo" label="Assignee">
            <Select
              placeholder="Search member..."
              allowClear
              size="large"
              optionLabelProp="label"
            >
              {projectMembers.map(member => (
                <Select.Option key={member._id} value={member._id} label={member.name}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar size={20} src={member.avatar} icon={<User size={12} />} />
                    {member.name}
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select size="large">
              {COLUMNS.map(col => (
                <Select.Option key={col.id} value={col.id}>{col.title}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </div>
        <Form.Item name="dueDate" label="Due Date">
          <DatePicker size="large" style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  </div>
);
}
