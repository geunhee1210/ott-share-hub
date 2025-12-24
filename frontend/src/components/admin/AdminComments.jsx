import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, Trash2, ChevronLeft, ChevronRight, 
  MessageSquare, ExternalLink
} from 'lucide-react';
import { adminAPI, commentAPI } from '../../services/api';
import './AdminComments.css';

const AdminComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComments, setSelectedComments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 댓글 불러오기
  const fetchComments = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm })
      };
      const response = await adminAPI.getComments(params);
      if (response.success) {
        setComments(response.comments);
        setTotalPages(response.pagination.totalPages);
      }
    } catch (error) {
      console.error('댓글 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [currentPage]);

  // 검색 핸들러
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchComments();
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedComments(comments.map((c) => c.id));
    } else {
      setSelectedComments([]);
    }
  };

  const handleSelectComment = (id) => {
    setSelectedComments((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id) => {
    if (window.confirm('이 댓글을 삭제하시겠습니까?')) {
      try {
        const response = await commentAPI.deleteComment(id);
        if (response.success) {
          fetchComments();
        }
      } catch (error) {
        alert('삭제에 실패했습니다.');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedComments.length === 0) return;
    if (window.confirm(`선택한 ${selectedComments.length}개의 댓글을 삭제하시겠습니까?`)) {
      try {
        for (const id of selectedComments) {
          await commentAPI.deleteComment(id);
        }
        setSelectedComments([]);
        fetchComments();
      } catch (error) {
        alert('일부 삭제에 실패했습니다.');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  return (
    <motion.div
      className="admin-comments"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="page-header">
        <h1>댓글 관리</h1>
        <p>모든 댓글을 관리합니다.</p>
      </div>

      {/* Toolbar */}
      <div className="comments-toolbar">
        <form className="search-box" onSubmit={handleSearch}>
          <Search size={18} />
          <input
            type="text"
            placeholder="댓글 내용 또는 작성자 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        {selectedComments.length > 0 && (
          <button className="btn btn-secondary bulk-delete" onClick={handleBulkDelete}>
            <Trash2 size={16} />
            선택 삭제 ({selectedComments.length})
          </button>
        )}
      </div>

      {/* Comments Table */}
      <div className="comments-table">
        <table>
          <thead>
            <tr>
              <th className="checkbox-col">
                <input
                  type="checkbox"
                  checked={selectedComments.length === comments.length && comments.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th>댓글 내용</th>
              <th>작성자</th>
              <th>게시글</th>
              <th>작성일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="loading-cell">데이터를 불러오는 중...</td>
              </tr>
            ) : comments.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-cell">댓글이 없습니다.</td>
              </tr>
            ) : (
              comments.map((comment) => (
                <tr key={comment.id}>
                  <td className="checkbox-col">
                    <input
                      type="checkbox"
                      checked={selectedComments.includes(comment.id)}
                      onChange={() => handleSelectComment(comment.id)}
                    />
                  </td>
                  <td className="content-col">
                    <div className="comment-content">
                      <MessageSquare size={14} />
                      <span>{comment.content}</span>
                    </div>
                  </td>
                  <td>{comment.authorName}</td>
                  <td className="post-col">
                    <Link to={`/community/${comment.postId}`} className="post-link">
                      {comment.postTitle?.substring(0, 25)}...
                      <ExternalLink size={12} />
                    </Link>
                  </td>
                  <td>{formatDate(comment.createdAt)}</td>
                  <td>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(comment.id)}
                    >
                      <Trash2 size={14} />
                    </button>
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

export default AdminComments;
