import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Filter, Edit, Trash2, Eye, 
  ChevronLeft, ChevronRight, MoreVertical
} from 'lucide-react';
import { adminAPI, postAPI } from '../../services/api';
import './AdminPosts.css';

const AdminPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [showMenu, setShowMenu] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = [
    { id: 'all', name: '전체' },
    { id: 'notice', name: '공지사항' },
    { id: 'party', name: '파티모집' },
    { id: 'review', name: '이용후기' },
    { id: 'qna', name: 'Q&A' },
    { id: 'free', name: '자유게시판' },
  ];

  // 게시물 불러오기
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(searchTerm && { search: searchTerm })
      };
      const response = await adminAPI.getPosts(params);
      if (response.success) {
        setPosts(response.posts);
        setTotalPages(response.pagination.totalPages);
      }
    } catch (error) {
      console.error('게시물 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [currentPage, selectedCategory]);

  // 검색 핸들러
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPosts();
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedPosts(posts.map((p) => p.id));
    } else {
      setSelectedPosts([]);
    }
  };

  const handleSelectPost = (id) => {
    setSelectedPosts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        const response = await postAPI.deletePost(id);
        if (response.success) {
          fetchPosts();
        }
      } catch (error) {
        alert('삭제에 실패했습니다.');
      }
      setShowMenu(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPosts.length === 0) return;
    if (window.confirm(`선택한 ${selectedPosts.length}개의 게시물을 삭제하시겠습니까?`)) {
      try {
        for (const id of selectedPosts) {
          await postAPI.deletePost(id);
        }
        setSelectedPosts([]);
        fetchPosts();
      } catch (error) {
        alert('일부 삭제에 실패했습니다.');
      }
    }
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : categoryId;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  return (
    <motion.div
      className="admin-posts"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="page-header">
        <div>
          <h1>게시물 관리</h1>
          <p>게시물을 작성하고 관리합니다.</p>
        </div>
        <Link to="/admin/posts/write" className="btn btn-primary">
          <Plus size={18} />
          새 글 작성
        </Link>
      </div>

      {/* Toolbar */}
      <div className="posts-toolbar">
        <form className="search-box" onSubmit={handleSearch}>
          <Search size={18} />
          <input
            type="text"
            placeholder="제목 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        <div className="filter-group">
          <Filter size={18} />
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {selectedPosts.length > 0 && (
          <button className="btn btn-secondary bulk-delete" onClick={handleBulkDelete}>
            <Trash2 size={16} />
            선택 삭제 ({selectedPosts.length})
          </button>
        )}
      </div>

      {/* Posts Table */}
      <div className="posts-table">
        <table>
          <thead>
            <tr>
              <th className="checkbox-col">
                <input
                  type="checkbox"
                  checked={selectedPosts.length === posts.length && posts.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th>제목</th>
              <th>카테고리</th>
              <th>작성자</th>
              <th>조회수</th>
              <th>댓글</th>
              <th>작성일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="loading-cell">데이터를 불러오는 중...</td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-cell">게시물이 없습니다.</td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id}>
                  <td className="checkbox-col">
                    <input
                      type="checkbox"
                      checked={selectedPosts.includes(post.id)}
                      onChange={() => handleSelectPost(post.id)}
                    />
                  </td>
                  <td className="title-col">
                    <Link to={`/community/${post.id}`}>{post.title}</Link>
                  </td>
                  <td>
                    <span className="category-badge">{getCategoryName(post.category)}</span>
                  </td>
                  <td>{post.authorName}</td>
                  <td><Eye size={14} /> {post.views}</td>
                  <td>{post.commentCount || 0}</td>
                  <td>{formatDate(post.createdAt)}</td>
                  <td className="actions-col">
                    <div className="actions-menu">
                      <button 
                        className="menu-trigger"
                        onClick={() => setShowMenu(showMenu === post.id ? null : post.id)}
                      >
                        <MoreVertical size={16} />
                      </button>
                      {showMenu === post.id && (
                        <div className="menu-dropdown">
                          <Link to={`/admin/posts/edit/${post.id}`} className="menu-item">
                            <Edit size={14} /> 수정
                          </Link>
                          <button 
                            className="menu-item delete"
                            onClick={() => handleDelete(post.id)}
                          >
                            <Trash2 size={14} /> 삭제
                          </button>
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

export default AdminPosts;
