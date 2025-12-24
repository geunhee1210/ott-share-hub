import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MessageSquare, Eye, Clock, Pin, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { postAPI } from '../services/api';
import './BoardPage.css';

const BoardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const selectedCategory = searchParams.get('category') || 'all';
  const postsPerPage = 10;

  const categories = [
    { id: 'all', name: '전체', icon: '📋' },
    { id: 'notice', name: '공지사항', icon: '📢' },
    { id: 'party', name: '파티모집', icon: '👥' },
    { id: 'review', name: '이용후기', icon: '⭐' },
    { id: 'qna', name: 'Q&A', icon: '❓' },
    { id: 'free', name: '자유게시판', icon: '💬' },
  ];

  // 게시물 불러오기
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: postsPerPage,
          ...(selectedCategory !== 'all' && { category: selectedCategory }),
          ...(searchTerm && { search: searchTerm })
        };
        
        const response = await postAPI.getPosts(params);
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

    fetchPosts();
  }, [selectedCategory, currentPage, searchTerm]);

  // 검색 디바운스
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // 고정글과 일반글 분리
  const pinnedPosts = posts.filter((post) => post.category === 'notice' && currentPage === 1);
  const regularPosts = posts.filter((post) => post.category !== 'notice' || currentPage !== 1);

  const getCategoryInfo = (categoryId) => {
    return categories.find((cat) => cat.id === categoryId) || { name: categoryId, icon: '📄' };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  return (
    <div className="board-page">
      {/* Header */}
      <section className="board-header">
        <div className="container">
          <h1>커뮤니티</h1>
          <p>다양한 정보와 후기를 공유해보세요</p>
        </div>
      </section>

      <div className="container">
        <div className="board-layout">
          {/* Sidebar */}
          <aside className="board-sidebar">
            <nav className="category-nav">
              <h3>카테고리</h3>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`category-item ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => {
                    setSearchParams(cat.id === 'all' ? {} : { category: cat.id });
                    setCurrentPage(1);
                  }}
                >
                  <span className="category-icon">{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="board-main">
            {/* Search & Write */}
            <div className="board-toolbar">
              <div className="search-box">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="게시글 검색..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              {user && (
                <Link to="/community/write" className="btn btn-primary">
                  <Plus size={18} />
                  글쓰기
                </Link>
              )}
            </div>

            {/* Posts List */}
            <div className="posts-list">
              {loading ? (
                // 로딩 스켈레톤
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="post-item skeleton-item">
                    <div className="skeleton" style={{ width: '80px', height: '20px', marginBottom: '8px' }} />
                    <div className="skeleton" style={{ width: '100%', height: '24px', marginBottom: '8px' }} />
                    <div className="skeleton" style={{ width: '60%', height: '16px' }} />
                  </div>
                ))
              ) : (
                <>
                  {/* Pinned Posts */}
                  {selectedCategory === 'all' && currentPage === 1 && pinnedPosts.map((post) => (
                    <motion.div
                      key={post.id}
                      className="post-item pinned"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Link to={`/community/${post.id}`}>
                        <div className="post-badges">
                          <span className="badge-pin"><Pin size={12} /> 고정</span>
                          <span className="badge-category">{getCategoryInfo(post.category).icon} {getCategoryInfo(post.category).name}</span>
                        </div>
                        <h3 className="post-title">{post.title}</h3>
                        <div className="post-meta">
                          <span className="author">{post.authorName}</span>
                          <span className="meta-item"><Clock size={14} /> {formatDate(post.createdAt)}</span>
                          <span className="meta-item"><Eye size={14} /> {post.views}</span>
                          <span className="meta-item"><MessageSquare size={14} /> {post.commentCount || 0}</span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}

                  {/* Regular Posts */}
                  {(selectedCategory === 'all' ? regularPosts : posts).map((post, idx) => (
                    <motion.div
                      key={post.id}
                      className="post-item"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                    >
                      <Link to={`/community/${post.id}`}>
                        <div className="post-badges">
                          <span className="badge-category">{getCategoryInfo(post.category).icon} {getCategoryInfo(post.category).name}</span>
                        </div>
                        <h3 className="post-title">{post.title}</h3>
                        <div className="post-meta">
                          <span className="author">{post.authorName}</span>
                          <span className="meta-item"><Clock size={14} /> {formatDate(post.createdAt)}</span>
                          <span className="meta-item"><Eye size={14} /> {post.views}</span>
                          <span className="meta-item"><MessageSquare size={14} /> {post.commentCount || 0}</span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}

                  {posts.length === 0 && (
                    <div className="no-posts">
                      <p>게시글이 없습니다.</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={18} />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default BoardPage;
