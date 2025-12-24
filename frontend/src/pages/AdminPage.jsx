import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, FileText, Users, MessageSquare, Settings,
  BarChart3, TrendingUp, Eye, DollarSign, UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import AdminPosts from '../components/admin/AdminPosts';
import AdminPostWrite from '../components/admin/AdminPostWrite';
import AdminUsers from '../components/admin/AdminUsers';
import AdminComments from '../components/admin/AdminComments';
import './AdminPage.css';

const AdminPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // 관리자 권한 체크
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  const menuItems = [
    { path: '/admin', label: '대시보드', icon: <LayoutDashboard size={18} /> },
    { path: '/admin/posts', label: '게시물 관리', icon: <FileText size={18} /> },
    { path: '/admin/users', label: '회원 관리', icon: <Users size={18} /> },
    { path: '/admin/comments', label: '댓글 관리', icon: <MessageSquare size={18} /> },
    { path: '/admin/settings', label: '설정', icon: <Settings size={18} /> },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-page">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <span className="logo-text">Admin</span>
          <span className="logo-highlight">Panel</span>
        </div>

        <nav className="admin-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-user">
          <div className="admin-avatar">{user.name?.charAt(0)}</div>
          <div>
            <span className="admin-name">{user.name}</span>
            <span className="admin-role">관리자</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="posts" element={<AdminPosts />} />
          <Route path="posts/write" element={<AdminPostWrite />} />
          <Route path="posts/edit/:id" element={<AdminPostWrite />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="comments" element={<AdminComments />} />
          <Route path="settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminAPI.getStats();
        if (response.success) {
          setStats(response.stats);
        }
      } catch (error) {
        console.error('통계 불러오기 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = stats ? [
    { label: '총 회원수', value: stats.totalUsers, change: '+5%', icon: <Users size={24} />, color: '#46D369' },
    { label: '활성 회원', value: stats.activeUsers, change: '+8%', icon: <Eye size={24} />, color: '#E50914' },
    { label: '총 게시물', value: stats.totalPosts, change: '+12%', icon: <FileText size={24} />, color: '#E5A00D' },
    { label: '총 댓글', value: stats.totalComments, change: '+15%', icon: <MessageSquare size={24} />, color: '#0080FF' },
  ] : [];

  return (
    <motion.div
      className="dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="page-header">
        <h1>대시보드</h1>
        <p>OTT Share Hub 관리자 페이지에 오신 것을 환영합니다.</p>
      </div>

      {loading ? (
        <div className="loading-state">데이터를 불러오는 중...</div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="stats-grid">
            {statCards.map((stat, idx) => (
              <div key={idx} className="stat-card">
                <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
                  {stat.icon}
                </div>
                <div className="stat-info">
                  <span className="stat-label">{stat.label}</span>
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-change positive">
                    <TrendingUp size={14} /> {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Charts & Activity */}
          <div className="dashboard-grid">
            <div className="chart-card">
              <div className="card-header">
                <h3><BarChart3 size={18} /> 카테고리별 게시물</h3>
              </div>
              <div className="chart-placeholder">
                <div className="chart-bars">
                  {stats && Object.entries(stats.postsByCategory).map(([key, value], idx) => (
                    <div key={key} className="bar-wrapper">
                      <div 
                        className="bar" 
                        style={{ height: `${Math.min(value * 20, 100)}%` }}
                      />
                      <span className="bar-label">{key}</span>
                      <span className="bar-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="activity-card">
              <div className="card-header">
                <h3>시스템 현황</h3>
              </div>
              <div className="system-status">
                <div className="status-item">
                  <span className="status-label">최근 7일 신규 가입</span>
                  <span className="status-value">{stats?.recentUsers || 0}명</span>
                </div>
                <div className="status-item">
                  <span className="status-label">공지사항</span>
                  <span className="status-value">{stats?.postsByCategory?.notice || 0}개</span>
                </div>
                <div className="status-item">
                  <span className="status-label">파티 모집글</span>
                  <span className="status-value">{stats?.postsByCategory?.party || 0}개</span>
                </div>
                <div className="status-item">
                  <span className="status-label">서버 상태</span>
                  <span className="status-value online">정상</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

// Settings Page Component
const SettingsPage = () => {
  return (
    <motion.div
      className="settings-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="page-header">
        <h1>설정</h1>
        <p>사이트 설정을 관리합니다.</p>
      </div>

      <div className="settings-section">
        <h3>사이트 정보</h3>
        <div className="settings-form">
          <div className="input-group">
            <label>사이트 이름</label>
            <input type="text" defaultValue="OTT Share Hub" />
          </div>
          <div className="input-group">
            <label>사이트 설명</label>
            <textarea defaultValue="프리미엄 OTT 구독 공유 서비스" />
          </div>
          <button className="btn btn-primary">저장</button>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminPage;
