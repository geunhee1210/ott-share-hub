import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Filter, MoreVertical, Ban, 
  CheckCircle, XCircle, ChevronLeft, ChevronRight, Trash2
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showMenu, setShowMenu] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 사용자 불러오기
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      };
      const response = await adminAPI.getUsers(params);
      if (response.success) {
        setUsers(response.users);
        setTotalPages(response.pagination.totalPages);
      }
    } catch (error) {
      console.error('사용자 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, statusFilter]);

  // 검색 핸들러
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  // 상태 변경
  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      const response = await adminAPI.updateUser(user.id, { status: newStatus });
      if (response.success) {
        fetchUsers();
      }
    } catch (error) {
      alert('상태 변경에 실패했습니다.');
    }
    setShowMenu(null);
  };

  // 사용자 삭제
  const handleDelete = async (userId) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      const response = await adminAPI.deleteUser(userId);
      if (response.success) {
        fetchUsers();
      }
    } catch (error) {
      alert(error.message || '삭제에 실패했습니다.');
    }
    setShowMenu(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  return (
    <motion.div
      className="admin-users"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="page-header">
        <h1>회원 관리</h1>
        <p>회원 정보를 관리합니다.</p>
      </div>

      {/* Toolbar */}
      <div className="users-toolbar">
        <form className="search-box" onSubmit={handleSearch}>
          <Search size={18} />
          <input
            type="text"
            placeholder="이름 또는 이메일 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        <div className="filter-group">
          <Filter size={18} />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">전체 상태</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>회원 정보</th>
              <th>등급</th>
              <th>상태</th>
              <th>가입일</th>
              <th>최근 로그인</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="loading-cell">데이터를 불러오는 중...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-cell">회원이 없습니다.</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="user-info-col">
                    <div className="user-info">
                      <div className={`user-avatar ${user.role === 'admin' ? 'admin' : ''}`}>
                        {user.name?.charAt(0)}
                      </div>
                      <div>
                        <span className="user-name">{user.name}</span>
                        <span className="user-email">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role === 'admin' ? '관리자' : '일반'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.status}`}>
                      {user.status === 'active' ? (
                        <><CheckCircle size={12} /> 활성</>
                      ) : (
                        <><XCircle size={12} /> 비활성</>
                      )}
                    </span>
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>{user.lastLoginAt ? formatDate(user.lastLoginAt) : '-'}</td>
                  <td className="actions-col">
                    <div className="actions-menu">
                      <button 
                        className="menu-trigger"
                        onClick={() => setShowMenu(showMenu === user.id ? null : user.id)}
                      >
                        <MoreVertical size={16} />
                      </button>
                      {showMenu === user.id && (
                        <div className="menu-dropdown">
                          <button 
                            className="menu-item"
                            onClick={() => handleToggleStatus(user)}
                          >
                            {user.status === 'active' ? (
                              <><Ban size={14} /> 비활성화</>
                            ) : (
                              <><CheckCircle size={14} /> 활성화</>
                            )}
                          </button>
                          {user.role !== 'admin' && (
                            <button 
                              className="menu-item delete"
                              onClick={() => handleDelete(user.id)}
                            >
                              <Trash2 size={14} /> 삭제
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="page-btn" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            <ChevronLeft size={18} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button 
              key={page}
              className={`page-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button 
            className="page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default AdminUsers;
