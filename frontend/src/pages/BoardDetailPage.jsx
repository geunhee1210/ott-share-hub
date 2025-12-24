import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Eye, Clock, MessageSquare, Heart, Share2, 
  MoreVertical, Edit, Trash2, Send, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { postAPI, commentAPI } from '../services/api';
import './BoardDetailPage.css';

const BoardDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [post, setPost] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [liked, setLiked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const categoryNames = {
    notice: '공지사항',
    party: '파티모집',
    review: '이용후기',
    qna: 'Q&A',
    free: '자유게시판'
  };

  // 게시물 불러오기
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const response = await postAPI.getPost(id);
        if (response.success) {
          setPost(response.post);
        }
      } catch (error) {
        console.error('게시물 불러오기 실패:', error);
        alert('게시물을 찾을 수 없습니다.');
        navigate('/community');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!user) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      const response = await commentAPI.createComment(id, newComment);
      if (response.success) {
        setPost(prev => ({
          ...prev,
          comments: [...prev.comments, response.comment]
        }));
        setNewComment('');
      }
    } catch (error) {
      alert('댓글 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editContent.trim()) return;
    
    try {
      const response = await commentAPI.updateComment(commentId, editContent);
      if (response.success) {
        setPost(prev => ({
          ...prev,
          comments: prev.comments.map(c => 
            c.id === commentId ? { ...c, content: editContent } : c
          )
        }));
        setEditingComment(null);
        setEditContent('');
      }
    } catch (error) {
      alert('댓글 수정에 실패했습니다.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    
    try {
      const response = await commentAPI.deleteComment(commentId);
      if (response.success) {
        setPost(prev => ({
          ...prev,
          comments: prev.comments.filter(c => c.id !== commentId)
        }));
      }
    } catch (error) {
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      const response = await postAPI.deletePost(id);
      if (response.success) {
        alert('게시물이 삭제되었습니다.');
        navigate('/community');
      }
    } catch (error) {
      alert('게시물 삭제에 실패했습니다.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  if (loading) {
    return (
      <div className="board-detail-page loading">
        <div className="container">
          <div className="skeleton" style={{ height: '40px', marginBottom: '16px' }} />
          <div className="skeleton" style={{ height: '200px' }} />
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="board-detail-page">
      <div className="container">
        {/* Back Button */}
        <Link to="/community" className="back-link">
          <ArrowLeft size={18} />
          목록으로
        </Link>

        {/* Post */}
        <article className="post-article">
          <header className="post-header">
            <span className="post-category">📋 {categoryNames[post.category] || post.category}</span>
            <h1>{post.title}</h1>
            
            <div className="post-info">
              <div className="author-info">
                <div className={`author-avatar ${post.authorId === 'admin-001' ? 'admin' : ''}`}>
                  {post.authorName?.charAt(0)}
                </div>
                <div>
                  <span className="author-name">
                    {post.authorName}
                    {post.authorId === 'admin-001' && <span className="admin-badge">관리자</span>}
                  </span>
                  <span className="post-date">{formatDate(post.createdAt)}</span>
                </div>
              </div>
              
              <div className="post-stats">
                <span><Eye size={16} /> {post.views}</span>
                <span><MessageSquare size={16} /> {post.comments?.length || 0}</span>
              </div>
            </div>
          </header>

          <div className="post-content">
            {post.content.split('\n').map((line, i) => (
              <p key={i}>{line || <br />}</p>
            ))}
          </div>

          <footer className="post-footer">
            <div className="post-actions">
              <button 
                className={`action-btn ${liked ? 'liked' : ''}`}
                onClick={() => setLiked(!liked)}
              >
                <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
                좋아요
              </button>
              <button className="action-btn">
                <Share2 size={18} />
                공유
              </button>
            </div>
            
            {user && (user.role === 'admin' || user.id === post.authorId) && (
              <div className="post-menu">
                <button 
                  className="menu-trigger"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <MoreVertical size={18} />
                </button>
                {showMenu && (
                  <div className="menu-dropdown">
                    <Link to={`/community/edit/${post.id}`} className="menu-item">
                      <Edit size={16} /> 수정
                    </Link>
                    <button className="menu-item delete" onClick={handleDeletePost}>
                      <Trash2 size={16} /> 삭제
                    </button>
                  </div>
                )}
              </div>
            )}
          </footer>
        </article>

        {/* Comments Section */}
        <section className="comments-section">
          <h2>댓글 {post.comments?.length || 0}개</h2>

          {/* Comment Form */}
          <form className="comment-form" onSubmit={handleSubmitComment}>
            <div className="comment-input-wrapper">
              {user ? (
                <div className="user-avatar-small">{user.name?.charAt(0)}</div>
              ) : (
                <div className="user-avatar-small guest"><User size={16} /></div>
              )}
              <input
                type="text"
                placeholder={user ? "댓글을 입력하세요..." : "로그인 후 댓글을 작성할 수 있습니다"}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={!user || submitting}
              />
              <button 
                type="submit" 
                className="send-btn" 
                disabled={!user || !newComment.trim() || submitting}
              >
                <Send size={18} />
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="comments-list">
            {post.comments?.map((comment) => (
              <motion.div
                key={comment.id}
                className="comment-item"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="comment-main">
                  <div className={`comment-avatar ${comment.authorId === 'admin-001' ? 'admin' : ''}`}>
                    {comment.authorName?.charAt(0)}
                  </div>
                  <div className="comment-body">
                    <div className="comment-header">
                      <span className="comment-author">
                        {comment.authorName}
                        {comment.authorId === 'admin-001' && <span className="admin-badge">관리자</span>}
                      </span>
                      <span className="comment-date">{formatDate(comment.createdAt)}</span>
                    </div>
                    
                    {editingComment === comment.id ? (
                      <div className="comment-edit-form">
                        <input
                          type="text"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          autoFocus
                        />
                        <div className="edit-actions">
                          <button onClick={() => handleEditComment(comment.id)}>저장</button>
                          <button onClick={() => setEditingComment(null)}>취소</button>
                        </div>
                      </div>
                    ) : (
                      <p className="comment-content">{comment.content}</p>
                    )}
                    
                    <div className="comment-actions">
                      {user && (user.role === 'admin' || user.id === comment.authorId) && editingComment !== comment.id && (
                        <>
                          <button 
                            className="comment-action"
                            onClick={() => {
                              setEditingComment(comment.id);
                              setEditContent(comment.content);
                            }}
                          >
                            수정
                          </button>
                          <button 
                            className="comment-action delete"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            삭제
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {(!post.comments || post.comments.length === 0) && (
              <div className="no-comments">
                <p>아직 댓글이 없습니다. 첫 댓글을 작성해보세요!</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default BoardDetailPage;
