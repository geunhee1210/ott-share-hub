import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { postAPI } from '../services/api';
import './PostWritePage.css';

const PostWritePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'free'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { id: 'notice', name: '공지사항', adminOnly: true },
    { id: 'party', name: '파티모집' },
    { id: 'review', name: '이용후기' },
    { id: 'qna', name: 'Q&A' },
    { id: 'free', name: '자유게시판' }
  ];

  // 수정 모드: 기존 게시물 불러오기
  useEffect(() => {
    if (isEdit) {
      const fetchPost = async () => {
        try {
          const response = await postAPI.getPost(id);
          if (response.success) {
            setFormData({
              title: response.post.title,
              content: response.post.content,
              category: response.post.category
            });
          }
        } catch (error) {
          alert('게시물을 찾을 수 없습니다.');
          navigate('/community');
        }
      };
      fetchPost();
    }
  }, [id, isEdit, navigate]);

  // 로그인 체크
  useEffect(() => {
    if (!user) {
      alert('로그인이 필요합니다.');
      navigate('/login');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }
    if (!formData.content.trim()) {
      setError('내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      let response;
      if (isEdit) {
        response = await postAPI.updatePost(id, formData);
      } else {
        response = await postAPI.createPost(formData);
      }

      if (response.success) {
        alert(isEdit ? '게시물이 수정되었습니다.' : '게시물이 작성되었습니다.');
        navigate(`/community/${response.post.id}`);
      }
    } catch (error) {
      setError(error.message || '저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const availableCategories = categories.filter(cat => 
    !cat.adminOnly || user?.role === 'admin'
  );

  return (
    <div className="post-write-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          돌아가기
        </button>

        <motion.div
          className="write-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>{isEdit ? '게시물 수정' : '새 게시물 작성'}</h1>

          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label>카테고리</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                {availableCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>제목</label>
              <input
                type="text"
                name="title"
                placeholder="제목을 입력하세요"
                value={formData.title}
                onChange={handleChange}
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label>내용</label>
              <textarea
                name="content"
                placeholder="내용을 입력하세요"
                value={formData.content}
                onChange={handleChange}
                rows={15}
              />
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => navigate(-1)}
              >
                취소
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading-spinner" />
                ) : (
                  <>
                    <Send size={18} />
                    {isEdit ? '수정하기' : '작성하기'}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default PostWritePage;

