import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Save, Eye, Image, Link as LinkIcon, 
  Bold, Italic, List, AlignLeft, AlignCenter, AlignRight
} from 'lucide-react';
import { postAPI } from '../../services/api';
import './AdminPostWrite.css';

const AdminPostWrite = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    category: 'notice',
    content: '',
  });

  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'notice', name: '공지사항' },
    { id: 'party', name: '파티모집' },
    { id: 'review', name: '이용후기' },
    { id: 'qna', name: 'Q&A' },
    { id: 'free', name: '자유게시판' },
  ];

  // 수정 모드일 때 데이터 로드
  useEffect(() => {
    if (isEdit) {
      const fetchPost = async () => {
        try {
          const response = await postAPI.getPost(id);
          if (response.success) {
            setFormData({
              title: response.post.title,
              category: response.post.category,
              content: response.post.content,
            });
          }
        } catch (error) {
          alert('게시물을 찾을 수 없습니다.');
          navigate('/admin/posts');
        }
      };
      fetchPost();
    }
  }, [isEdit, id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!formData.content.trim()) {
      alert('내용을 입력해주세요.');
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
        alert(isEdit ? '게시물이 수정되었습니다.' : '게시물이 등록되었습니다.');
        navigate('/admin/posts');
      }
    } catch (error) {
      alert(error.message || '저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const insertFormatting = (tag) => {
    const textarea = document.getElementById('content');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);
    
    let newText;
    switch (tag) {
      case 'bold':
        newText = `**${selectedText}**`;
        break;
      case 'italic':
        newText = `*${selectedText}*`;
        break;
      case 'link':
        newText = `[${selectedText}](url)`;
        break;
      case 'image':
        newText = `![이미지 설명](이미지 URL)`;
        break;
      case 'list':
        newText = `\n- ${selectedText}`;
        break;
      default:
        newText = selectedText;
    }
    
    setFormData((prev) => ({
      ...prev,
      content: prev.content.substring(0, start) + newText + prev.content.substring(end),
    }));
  };

  return (
    <motion.div
      className="admin-post-write"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/admin/posts')}>
          <ArrowLeft size={18} />
          목록으로
        </button>
        <h1>{isEdit ? '게시물 수정' : '새 글 작성'}</h1>
      </div>

      <div className="write-container">
        <div className="write-main">
          {/* Title Input */}
          <div className="input-group">
            <input
              type="text"
              name="title"
              className="title-input"
              placeholder="제목을 입력하세요"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          {/* Editor Toolbar */}
          <div className="editor-toolbar">
            <div className="toolbar-group">
              <button type="button" onClick={() => insertFormatting('bold')} title="굵게">
                <Bold size={16} />
              </button>
              <button type="button" onClick={() => insertFormatting('italic')} title="기울임">
                <Italic size={16} />
              </button>
              <button type="button" onClick={() => insertFormatting('link')} title="링크">
                <LinkIcon size={16} />
              </button>
              <button type="button" onClick={() => insertFormatting('image')} title="이미지">
                <Image size={16} />
              </button>
              <button type="button" onClick={() => insertFormatting('list')} title="목록">
                <List size={16} />
              </button>
            </div>
            <div className="toolbar-group">
              <button type="button" title="왼쪽 정렬">
                <AlignLeft size={16} />
              </button>
              <button type="button" title="가운데 정렬">
                <AlignCenter size={16} />
              </button>
              <button type="button" title="오른쪽 정렬">
                <AlignRight size={16} />
              </button>
            </div>
            <button 
              type="button" 
              className={`preview-toggle ${isPreview ? 'active' : ''}`}
              onClick={() => setIsPreview(!isPreview)}
            >
              <Eye size={16} />
              {isPreview ? '편집' : '미리보기'}
            </button>
          </div>

          {/* Content Editor / Preview */}
          {isPreview ? (
            <div className="content-preview">
              <h2>{formData.title || '제목 없음'}</h2>
              <div className="preview-content">
                {formData.content.split('\n').map((line, idx) => (
                  <p key={idx}>{line || <br />}</p>
                ))}
              </div>
            </div>
          ) : (
            <textarea
              id="content"
              name="content"
              className="content-editor"
              placeholder="내용을 입력하세요..."
              value={formData.content}
              onChange={handleChange}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="write-sidebar">
          {/* Category */}
          <div className="sidebar-section">
            <h3>카테고리</h3>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="sidebar-section actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/admin/posts')}
            >
              취소
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <span className="loading-spinner" />
              ) : (
                <>
                  <Save size={16} />
                  {isEdit ? '수정 완료' : '게시하기'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminPostWrite;
