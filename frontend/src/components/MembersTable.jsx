import { Table, Avatar, Tag, Button, Popconfirm } from 'antd';
import { User, UserMinus } from 'lucide-react';

export default function MembersTable({ project, onRemove }) {
  if (!project) return null;

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isLeader = String(project.createdBy?._id || project.createdBy) === String(currentUser._id);
  const creatorId = String(project.createdBy?._id || project.createdBy);
  
  const creator = {
    ...(typeof project.createdBy === 'object' ? project.createdBy : { _id: project.createdBy }),
    key: 'creator',
    role: 'Project Lead',
  };

  const members = (project.members || []).map(m => {
    const mId = String(m._id || m);
    return {
      ...(typeof m === 'object' ? m : { _id: m }),
      key: mId,
      role: mId === creatorId ? 'Project Lead' : 'Member'
    };
  });

  // Ensure creator is in the list and avoid duplicates
  const allMembers = [
    ...(members.some(m => String(m._id) === creatorId) ? members : [creator, ...members])
  ].sort((a, b) => a.role === 'Project Lead' ? -1 : 1);

  const columns = [
    {
      title: 'Member',
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar icon={<User size={16} />} src={record.avatar} style={{ backgroundColor: 'var(--primary)' }} />
          <span style={{ fontWeight: 500 }}>{text || 'Collaborator'}</span>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => email || 'N/A'
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'Project Lead' ? 'gold' : 'blue'}>{role}</Tag>
      ),
    },
  ];

  if (isLeader) {
    columns.push({
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        record.role !== 'Project Lead' ? (
          <Popconfirm
            title="Are you sure you want to remove this member from the project?"
            onConfirm={() => onRemove(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="text" 
              danger 
              icon={<UserMinus size={16} />}
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              Remove
            </Button>
          </Popconfirm>
        ) : null
      ),
    });
  }

  return (
    <div style={{ marginTop: 16 }}>
      <Table 
        columns={columns} 
        dataSource={allMembers} 
        pagination={false}
        className="members-table"
      />
    </div>
  );
}
