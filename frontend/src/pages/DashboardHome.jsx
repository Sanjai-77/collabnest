import { useNavigate } from 'react-router-dom';
import api from '../config/api';

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

export default function DashboardHome() {
  const [statsData, setStatsData] = useState({
    activeProjects: 0,
    pendingTasks: 0,
    completedTasks: 0,
    joinRequests: 0
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStatsData(res.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await api.get('/activities');
      setActivities(res.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchActivities()]);
      setLoading(false);
    };

    loadData();
    
    const interval = setInterval(() => {
      fetchStats();
      fetchActivities();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { icon: <FolderRoot size={22} />, color: 'blue', value: statsData.activeProjects, label: 'Active Projects', trend: 'Total projects' },
    { icon: <Clock size={22} />, color: 'orange', value: statsData.pendingTasks, label: 'Pending Tasks', trend: 'Assigned to you' },
    { icon: <CheckCircle2 size={22} />, color: 'green', value: statsData.completedTasks, label: 'Completed Tasks', trend: 'Great job!' },
    { icon: <UserPlus size={22} />, color: 'cyan', value: statsData.joinRequests, label: 'Join Requests', trend: 'Pending requests' },
  ];

  const getActivityColor = (type) => {
    switch (type) {
      case 'project_created': return 'var(--primary)';
      case 'task_completed': return 'var(--success)';
      case 'task_created':
      case 'task_assignment': return 'var(--warning)';
      case 'member_joined':
      case 'join_request_accepted': return 'var(--success)';
      case 'join_request_sent': return 'var(--info)';
      case 'message_sent': return '#8c8c8c';
      default: return 'var(--primary)';
    }
  };

  const formatRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="dashboard-home-modern">
      <motion.div 
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ marginBottom: 32 }}
      >
        <Title level={2} style={{ marginBottom: 4 }}>Overview</Title>
        <Text type="secondary">Welcome back! Here's what's happening with your projects today.</Text>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="stats-grid-modern"
      >
        <Row gutter={[20, 20]}>
          {stats.map((s, i) => (
            <Col xs={24} sm={12} lg={6} key={i}>
              <motion.div variants={item}>
                <Card 
                  className={`stat-card-premium ${s.color}`}
                  bodyStyle={{ padding: '24px' }}
                >
                  <div className="stat-card-header">
                    <div className={`stat-icon-wrapper ${s.color}`}>
                      {s.icon}
                    </div>
                    <ArrowUpRight size={16} className="trend-arrow" />
                  </div>
                  <div className="stat-card-body">
                    <Title level={2} style={{ margin: '12px 0 4px' }}>{s.value}</Title>
                    <Text strong>{s.label}</Text>
                    <div className="stat-trend">
                      <TrendingUp size={12} style={{ marginRight: 4 }} />
                      <Text type="secondary" style={{ fontSize: '11px' }}>{s.trend}</Text>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </motion.div>

      <div style={{ marginTop: 32 }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card 
            title={<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Activity size={18} /> <span>Recent Activity</span></div>}
            className="activity-card-modern"
            extra={<Button type="link" size="small">View All</Button>}
          >
            <div className="activity-feed-modern">
              {activities.length > 0 ? (
                <Timeline
                  items={activities.map(act => ({
                    color: getActivityColor(act.type),
                    children: (
                      <div className="activity-item">
                        <Text strong>{act.message}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          {formatRelativeTime(act.createdAt)} • {act.userId?.username || 'User'}
                        </Text>
                      </div>
                    ),
                  }))}
                />
              ) : (
                <Empty description="No recent activities" />
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
