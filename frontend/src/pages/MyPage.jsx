import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Mail, Bell, CreditCard, Shield, LogOut,
  Edit, Check, X, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import './MyPage.css';

const MyPage = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
  });

  // 로그인 체크
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      setEditData(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || ''
      }));
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const subscriptions = [
    {
      id: 1,
      service: 'Netflix',
      logo: '🎬',
      plan: 'Premium',
      price: 5900,
      nextBilling: '2025-01-20',
      status: 'active',
    },
    {
      id: 2,
      service: 'YouTube Premium',
      logo: '▶️',
      plan: 'Family',
      price: 4900,
      nextBilling: '2025-01-15',
      status: 'active',
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const updateData = {
        name: editData.name,
        phone: editData.phone
      };
      
      // 비밀번호 변경이 있는 경우
      if (editData.currentPassword && editData.newPassword) {
        updateData.currentPassword = editData.currentPassword;
        updateData.newPassword = editData.newPassword;
      }

      const response = await authAPI.updateProfile(updateData);
      if (response.success) {
        updateUser({ ...user, name: editData.name, phone: editData.phone });
        alert('프로필이 수정되었습니다.');
        setIsEditing(false);
        setEditData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
      }
    } catch (error) {
      alert(error.message || '프로필 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: '내 정보', icon: <User size={18} /> },
    { id: 'subscriptions', label: '구독 관리', icon: <CreditCard size={18} /> },
    { id: 'notifications', label: '알림 설정', icon: <Bell size={18} /> },
    { id: 'security', label: '보안', icon: <Shield size={18} /> },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  return (
    <div className="mypage">
      <div className="container">
        <div className="mypage-header">
          <h1>마이페이지</h1>
        </div>

        <div className="mypage-layout">
          {/* Sidebar */}
          <aside className="mypage-sidebar">
            <div className="profile-card">
              <div className="profile-avatar">
                {user.name?.charAt(0)}
              </div>
              <h3>{user.name}</h3>
              <p>{user.email}</p>
              <span className={`role-badge ${user.role}`}>
                {user.role === 'admin' ? '관리자' : '일반회원'}
              </span>
            </div>

            <nav className="mypage-nav">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  <ChevronRight size={16} />
                </button>
              ))}
              <button className="nav-item logout" onClick={handleLogout}>
                <LogOut size={18} />
                <span>로그아웃</span>
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="mypage-main">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div
                className="mypage-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="section-header">
                  <h2>내 정보</h2>
                  {!isEditing ? (
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit size={16} />
                      수정
                    </button>
                  ) : (
                    <div className="edit-actions">
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={handleSaveProfile}
                        disabled={loading}
                      >
                        <Check size={16} />
                        {loading ? '저장중...' : '저장'}
                      </button>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setIsEditing(false);
                          setEditData(prev => ({
                            ...prev,
                            name: user.name || '',
                            phone: user.phone || '',
                            currentPassword: '',
                            newPassword: ''
                          }));
                        }}
                      >
                        <X size={16} />
                        취소
                      </button>
                    </div>
                  )}
                </div>

                <div className="info-list">
                  <div className="info-item">
                    <label>이름</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      />
                    ) : (
                      <span>{user.name}</span>
                    )}
                  </div>
                  <div className="info-item">
                    <label>이메일</label>
                    <span>{user.email}</span>
                  </div>
                  <div className="info-item">
                    <label>연락처</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editData.phone}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        placeholder="010-0000-0000"
                      />
                    ) : (
                      <span>{user.phone || '-'}</span>
                    )}
                  </div>
                  <div className="info-item">
                    <label>회원등급</label>
                    <span className="grade-badge">
                      {user.role === 'admin' ? '👑 관리자' : '🌟 일반회원'}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>가입일</label>
                    <span>{formatDate(user.createdAt)}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Subscriptions Tab */}
            {activeTab === 'subscriptions' && (
              <motion.div
                className="mypage-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="section-header">
                  <h2>구독 관리</h2>
                </div>

                <div className="subscription-list">
                  {user.subscription ? (
                    <div className="subscription-card current-plan">
                      <div className="sub-logo">🌟</div>
                      <div className="sub-info">
                        <h4>{user.subscription.planName} 플랜</h4>
                        <p>현재 구독 중</p>
                      </div>
                      <div className="sub-price">
                        <span className="price">₩{user.subscription.price?.toLocaleString()}</span>
                        <span className="period">/월</span>
                      </div>
                      <div className="sub-status">
                        <span className="status-badge active">이용중</span>
                        <span className="next-billing">
                          만료일: {formatDate(user.subscription.endDate)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-state">
                      <p>구독 중인 플랜이 없습니다.</p>
                      <button 
                        className="btn btn-primary"
                        onClick={() => navigate('/pricing')}
                      >
                        요금제 보기
                      </button>
                    </div>
                  )}
                </div>

                <div className="section-header" style={{ marginTop: '32px' }}>
                  <h3>샘플 구독 서비스</h3>
                </div>
                <div className="subscription-list">
                  {subscriptions.map((sub) => (
                    <div key={sub.id} className="subscription-card">
                      <div className="sub-logo">{sub.logo}</div>
                      <div className="sub-info">
                        <h4>{sub.service}</h4>
                        <p>{sub.plan} 플랜</p>
                      </div>
                      <div className="sub-price">
                        <span className="price">₩{sub.price.toLocaleString()}</span>
                        <span className="period">/월</span>
                      </div>
                      <div className="sub-status">
                        <span className={`status-badge ${sub.status}`}>
                          {sub.status === 'active' ? '이용중' : '만료'}
                        </span>
                        <span className="next-billing">
                          다음 결제: {sub.nextBilling}
                        </span>
                      </div>
                      <button className="btn btn-secondary btn-sm">관리</button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <motion.div
                className="mypage-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="section-header">
                  <h2>알림 설정</h2>
                </div>

                <div className="settings-list">
                  <div className="setting-item">
                    <div>
                      <h4>이메일 알림</h4>
                      <p>중요 공지사항 및 이벤트 정보를 이메일로 받습니다.</p>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <div>
                      <h4>결제 알림</h4>
                      <p>결제 예정일 및 결제 완료 알림을 받습니다.</p>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <div>
                      <h4>마케팅 알림</h4>
                      <p>할인 및 프로모션 정보를 받습니다.</p>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <motion.div
                className="mypage-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="section-header">
                  <h2>보안</h2>
                </div>

                <div className="security-list">
                  <div className="security-item">
                    <div>
                      <h4>비밀번호 변경</h4>
                      <p>정기적으로 비밀번호를 변경하여 계정을 보호하세요.</p>
                    </div>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setActiveTab('profile');
                        setIsEditing(true);
                      }}
                    >
                      변경
                    </button>
                  </div>
                  <div className="security-item">
                    <div>
                      <h4>2단계 인증</h4>
                      <p>계정 보안을 강화합니다.</p>
                    </div>
                    <button className="btn btn-secondary btn-sm">설정</button>
                  </div>
                  <div className="security-item danger">
                    <div>
                      <h4>회원 탈퇴</h4>
                      <p>모든 데이터가 삭제됩니다.</p>
                    </div>
                    <button className="btn btn-outline btn-sm">탈퇴</button>
                  </div>
                </div>
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
