const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'ott-share-hub-secret-key-2024';

// ============== 미들웨어 ==============
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// ============== 인메모리 데이터베이스 ==============
const db = {
  // 사용자 테이블
  users: [
    {
      id: 'admin-001',
      email: 'admin@ottshare.com',
      password: '$2b$10$2Iiq23b4Dan6RuF50vsOMuUh/PLTB0tzaX48dQOPUtQ7CkpAnAmJW', // password
      name: '관리자',
      role: 'admin',
      phone: '010-1234-5678',
      status: 'active',
      subscription: null,
      createdAt: '2024-01-01T00:00:00.000Z',
      lastLoginAt: null
    }
  ],
  
  // OTT 서비스 테이블
  ottServices: [
    { id: 'netflix', name: 'Netflix', logo: '🎬', price: 17000, maxMembers: 4, category: '영화/드라마', color: '#E50914', description: '전 세계 인기 영화, 드라마, 다큐멘터리' },
    { id: 'disney', name: 'Disney+', logo: '🏰', price: 13900, maxMembers: 4, category: '영화/드라마', color: '#113CCF', description: '디즈니, 픽사, 마블, 스타워즈' },
    { id: 'watcha', name: 'Watcha', logo: '🎞️', price: 12900, maxMembers: 4, category: '영화/드라마', color: '#FF0558', description: '영화 추천 기반 스트리밍 서비스' },
    { id: 'wavve', name: 'Wavve', logo: '📺', price: 13900, maxMembers: 4, category: '영화/드라마', color: '#1A1A2E', description: 'KBS, MBC, SBS 통합 플랫폼' },
    { id: 'tving', name: 'TVING', logo: '📱', price: 13900, maxMembers: 4, category: '영화/드라마', color: '#FF0143', description: 'CJ ENM 오리지널 콘텐츠' },
    { id: 'coupangplay', name: 'Coupang Play', logo: '🛒', price: 7900, maxMembers: 1, category: '영화/드라마', color: '#ED174D', description: '쿠팡 로켓와우 회원 특별 혜택' },
    { id: 'spotify', name: 'Spotify', logo: '🎵', price: 10900, maxMembers: 6, category: '음악', color: '#1DB954', description: '전 세계 음악 스트리밍' },
    { id: 'youtube', name: 'YouTube Premium', logo: '▶️', price: 14900, maxMembers: 6, category: '영상', color: '#FF0000', description: '광고 없는 유튜브 + 뮤직' },
    { id: 'applemusic', name: 'Apple Music', logo: '🍎', price: 10900, maxMembers: 6, category: '음악', color: '#FA243C', description: '애플 뮤직 스트리밍' },
    { id: 'laftel', name: 'Laftel', logo: '🎌', price: 10900, maxMembers: 2, category: '애니메이션', color: '#8B5CF6', description: '애니메이션 전문 스트리밍' }
  ],
  
  // 구독 플랜
  plans: [
    { id: 'basic', name: 'Basic', price: 9900, features: ['OTT 1개 공유', '기본 지원', '월간 결제'], maxOtt: 1 },
    { id: 'standard', name: 'Standard', price: 19900, features: ['OTT 3개 공유', '우선 지원', '파티 매칭', '월간 결제'], maxOtt: 3, popular: true },
    { id: 'premium', name: 'Premium', price: 29900, features: ['OTT 무제한', 'VIP 지원', '파티 매칭', '프리미엄 혜택', '연간 결제 할인'], maxOtt: 999 }
  ],
  
  // 게시판
  posts: [
    {
      id: 'post-001',
      title: 'OTT Share Hub 오픈 안내',
      content: '안녕하세요! OTT Share Hub에 오신 것을 환영합니다.\n\n저희 플랫폼은 넷플릭스, 디즈니+, 왓챠 등 다양한 OTT 서비스를 저렴하게 공유할 수 있는 서비스입니다.\n\n많은 이용 부탁드립니다!',
      category: 'notice',
      authorId: 'admin-001',
      authorName: '관리자',
      views: 156,
      createdAt: '2024-12-20T09:00:00.000Z',
      updatedAt: '2024-12-20T09:00:00.000Z'
    },
    {
      id: 'post-002',
      title: '넷플릭스 파티원 모집합니다!',
      content: '넷플릭스 프리미엄 요금제 공유할 분 모집합니다.\n\n현재 2/4명\n월 4,250원으로 이용 가능합니다.\n\n관심 있으신 분 댓글 남겨주세요!',
      category: 'party',
      authorId: 'admin-001',
      authorName: '관리자',
      views: 89,
      createdAt: '2024-12-21T14:30:00.000Z',
      updatedAt: '2024-12-21T14:30:00.000Z'
    },
    {
      id: 'post-003',
      title: '왓챠 vs 웨이브 비교 리뷰',
      content: '두 서비스를 3개월간 사용해본 솔직한 후기입니다.\n\n📺 왓챠\n- 장점: 영화 추천 알고리즘이 뛰어남, UI가 깔끔\n- 단점: 국내 드라마 부족\n\n📺 웨이브\n- 장점: 지상파 실시간 시청 가능, 국내 콘텐츠 풍부\n- 단점: 외국 콘텐츠 부족\n\n결론: 영화 좋아하시면 왓챠, 드라마 좋아하시면 웨이브 추천!',
      category: 'review',
      authorId: 'admin-001',
      authorName: '관리자',
      views: 234,
      createdAt: '2024-12-22T10:15:00.000Z',
      updatedAt: '2024-12-22T10:15:00.000Z'
    }
  ],
  
  // 댓글
  comments: [
    {
      id: 'comment-001',
      postId: 'post-002',
      content: '저도 참여하고 싶습니다! 연락주세요~',
      authorId: 'admin-001',
      authorName: '관리자',
      createdAt: '2024-12-21T15:00:00.000Z',
      updatedAt: '2024-12-21T15:00:00.000Z'
    },
    {
      id: 'comment-002',
      postId: 'post-003',
      content: '좋은 리뷰 감사합니다! 왓챠 결제해봐야겠어요.',
      authorId: 'admin-001',
      authorName: '관리자',
      createdAt: '2024-12-22T11:30:00.000Z',
      updatedAt: '2024-12-22T11:30:00.000Z'
    }
  ],
  
  // 파티 (공유 그룹)
  parties: [],
  
  // 활동 로그
  activityLogs: []
};

// ============== 유틸리티 함수 ==============
const logActivity = (userId, action, details) => {
  db.activityLogs.push({
    id: uuidv4(),
    userId,
    action,
    details,
    timestamp: new Date().toISOString()
  });
};

// ============== JWT 미들웨어 ==============
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: '인증이 필요합니다.' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: '토큰이 만료되었거나 유효하지 않습니다.' });
    }
    req.user = user;
    next();
  });
};

// 선택적 인증 (로그인 안해도 되지만, 로그인하면 사용자 정보 제공)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) req.user = user;
    });
  }
  next();
};

// 관리자 권한 확인
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: '관리자 권한이 필요합니다.' });
  }
  next();
};

// ============== 인증 API ==============
// 회원가입
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: '필수 정보를 입력해주세요.' });
    }
    
    // 이메일 중복 확인
    if (db.users.find(u => u.email === email)) {
      return res.status(400).json({ success: false, message: '이미 사용 중인 이메일입니다.' });
    }
    
    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      name,
      role: 'user',
      phone: phone || '',
      status: 'active',
      subscription: null,
      createdAt: new Date().toISOString(),
      lastLoginAt: null
    };
    
    db.users.push(newUser);
    logActivity(newUser.id, 'REGISTER', { email });
    
    // JWT 토큰 생성
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      token,
      user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role }
    });
  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 로그인
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: '이메일과 비밀번호를 입력해주세요.' });
    }
    
    const user = db.users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }
    
    if (user.status === 'inactive') {
      return res.status(403).json({ success: false, message: '비활성화된 계정입니다. 관리자에게 문의하세요.' });
    }
    
    // 마지막 로그인 시간 업데이트
    user.lastLoginAt = new Date().toISOString();
    logActivity(user.id, 'LOGIN', { email });
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: '로그인 성공',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        subscription: user.subscription
      }
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 현재 사용자 정보
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
  }
  
  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      subscription: user.subscription,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt
    }
  });
});

// 프로필 수정
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = db.users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }
    
    const { name, phone, currentPassword, newPassword } = req.body;
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    
    // 비밀번호 변경
    if (currentPassword && newPassword) {
      const validPassword = await bcrypt.compare(currentPassword, user.password);
      if (!validPassword) {
        return res.status(400).json({ success: false, message: '현재 비밀번호가 올바르지 않습니다.' });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }
    
    logActivity(user.id, 'PROFILE_UPDATE', {});
    
    res.json({
      success: true,
      message: '프로필이 수정되었습니다.',
      user: { id: user.id, email: user.email, name: user.name, phone: user.phone }
    });
  } catch (error) {
    console.error('프로필 수정 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// ============== OTT 서비스 API ==============
// OTT 서비스 목록
app.get('/api/ott', (req, res) => {
  const { category, search } = req.query;
  let services = [...db.ottServices];
  
  if (category && category !== 'all') {
    services = services.filter(s => s.category === category);
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    services = services.filter(s => 
      s.name.toLowerCase().includes(searchLower) ||
      s.description.toLowerCase().includes(searchLower)
    );
  }
  
  res.json({ success: true, services });
});

// OTT 서비스 상세
app.get('/api/ott/:id', (req, res) => {
  const service = db.ottServices.find(s => s.id === req.params.id);
  if (!service) {
    return res.status(404).json({ success: false, message: 'OTT 서비스를 찾을 수 없습니다.' });
  }
  res.json({ success: true, service });
});

// ============== 구독 플랜 API ==============
app.get('/api/plans', (req, res) => {
  res.json({ success: true, plans: db.plans });
});

// 구독 신청
app.post('/api/subscription', authenticateToken, (req, res) => {
  const { planId } = req.body;
  const user = db.users.find(u => u.id === req.user.id);
  const plan = db.plans.find(p => p.id === planId);
  
  if (!plan) {
    return res.status(404).json({ success: false, message: '요금제를 찾을 수 없습니다.' });
  }
  
  user.subscription = {
    planId,
    planName: plan.name,
    price: plan.price,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };
  
  logActivity(user.id, 'SUBSCRIPTION', { planId });
  
  res.json({
    success: true,
    message: `${plan.name} 플랜 구독이 완료되었습니다.`,
    subscription: user.subscription
  });
});

// ============== 게시판 API ==============
// 게시물 목록
app.get('/api/posts', optionalAuth, (req, res) => {
  const { category, page = 1, limit = 10, search } = req.query;
  let posts = [...db.posts];
  
  // 카테고리 필터링
  if (category && category !== 'all') {
    posts = posts.filter(p => p.category === category);
  }
  
  // 검색
  if (search) {
    const searchLower = search.toLowerCase();
    posts = posts.filter(p => 
      p.title.toLowerCase().includes(searchLower) ||
      p.content.toLowerCase().includes(searchLower)
    );
  }
  
  // 최신순 정렬
  posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // 페이지네이션
  const total = posts.length;
  const startIndex = (page - 1) * limit;
  const paginatedPosts = posts.slice(startIndex, startIndex + parseInt(limit));
  
  // 댓글 수 추가
  const postsWithCommentCount = paginatedPosts.map(post => ({
    ...post,
    commentCount: db.comments.filter(c => c.postId === post.id).length
  }));
  
  res.json({
    success: true,
    posts: postsWithCommentCount,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    }
  });
});

// 게시물 상세
app.get('/api/posts/:id', optionalAuth, (req, res) => {
  const post = db.posts.find(p => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: '게시물을 찾을 수 없습니다.' });
  }
  
  // 조회수 증가
  post.views++;
  
  // 댓글 가져오기
  const comments = db.comments
    .filter(c => c.postId === post.id)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  
  res.json({
    success: true,
    post: { ...post, comments }
  });
});

// 게시물 작성
app.post('/api/posts', authenticateToken, (req, res) => {
  const { title, content, category } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ success: false, message: '제목과 내용을 입력해주세요.' });
  }
  
  const newPost = {
    id: uuidv4(),
    title,
    content,
    category: category || 'free',
    authorId: req.user.id,
    authorName: req.user.name,
    views: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  db.posts.push(newPost);
  logActivity(req.user.id, 'POST_CREATE', { postId: newPost.id });
  
  res.json({ success: true, message: '게시물이 작성되었습니다.', post: newPost });
});

// 게시물 수정
app.put('/api/posts/:id', authenticateToken, (req, res) => {
  const post = db.posts.find(p => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: '게시물을 찾을 수 없습니다.' });
  }
  
  // 작성자 또는 관리자만 수정 가능
  if (post.authorId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: '수정 권한이 없습니다.' });
  }
  
  const { title, content, category } = req.body;
  
  if (title) post.title = title;
  if (content) post.content = content;
  if (category) post.category = category;
  post.updatedAt = new Date().toISOString();
  
  logActivity(req.user.id, 'POST_UPDATE', { postId: post.id });
  
  res.json({ success: true, message: '게시물이 수정되었습니다.', post });
});

// 게시물 삭제
app.delete('/api/posts/:id', authenticateToken, (req, res) => {
  const postIndex = db.posts.findIndex(p => p.id === req.params.id);
  if (postIndex === -1) {
    return res.status(404).json({ success: false, message: '게시물을 찾을 수 없습니다.' });
  }
  
  const post = db.posts[postIndex];
  
  // 작성자 또는 관리자만 삭제 가능
  if (post.authorId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: '삭제 권한이 없습니다.' });
  }
  
  // 게시물 삭제
  db.posts.splice(postIndex, 1);
  
  // 관련 댓글도 삭제
  db.comments = db.comments.filter(c => c.postId !== req.params.id);
  
  logActivity(req.user.id, 'POST_DELETE', { postId: req.params.id });
  
  res.json({ success: true, message: '게시물이 삭제되었습니다.' });
});

// ============== 댓글 API ==============
// 댓글 작성
app.post('/api/posts/:postId/comments', authenticateToken, (req, res) => {
  const post = db.posts.find(p => p.id === req.params.postId);
  if (!post) {
    return res.status(404).json({ success: false, message: '게시물을 찾을 수 없습니다.' });
  }
  
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ success: false, message: '댓글 내용을 입력해주세요.' });
  }
  
  const newComment = {
    id: uuidv4(),
    postId: req.params.postId,
    content,
    authorId: req.user.id,
    authorName: req.user.name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  db.comments.push(newComment);
  logActivity(req.user.id, 'COMMENT_CREATE', { postId: req.params.postId, commentId: newComment.id });
  
  res.json({ success: true, message: '댓글이 작성되었습니다.', comment: newComment });
});

// 댓글 수정
app.put('/api/comments/:id', authenticateToken, (req, res) => {
  const comment = db.comments.find(c => c.id === req.params.id);
  if (!comment) {
    return res.status(404).json({ success: false, message: '댓글을 찾을 수 없습니다.' });
  }
  
  // 작성자 또는 관리자만 수정 가능
  if (comment.authorId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: '수정 권한이 없습니다.' });
  }
  
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ success: false, message: '댓글 내용을 입력해주세요.' });
  }
  
  comment.content = content;
  comment.updatedAt = new Date().toISOString();
  
  logActivity(req.user.id, 'COMMENT_UPDATE', { commentId: comment.id });
  
  res.json({ success: true, message: '댓글이 수정되었습니다.', comment });
});

// 댓글 삭제
app.delete('/api/comments/:id', authenticateToken, (req, res) => {
  const commentIndex = db.comments.findIndex(c => c.id === req.params.id);
  if (commentIndex === -1) {
    return res.status(404).json({ success: false, message: '댓글을 찾을 수 없습니다.' });
  }
  
  const comment = db.comments[commentIndex];
  
  // 작성자 또는 관리자만 삭제 가능
  if (comment.authorId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: '삭제 권한이 없습니다.' });
  }
  
  db.comments.splice(commentIndex, 1);
  logActivity(req.user.id, 'COMMENT_DELETE', { commentId: req.params.id });
  
  res.json({ success: true, message: '댓글이 삭제되었습니다.' });
});

// ============== 관리자 API ==============
// 사용자 목록 (관리자)
app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  const { page = 1, limit = 20, search, status, role } = req.query;
  
  let users = [...db.users];
  
  // 필터링
  if (search) {
    const searchLower = search.toLowerCase();
    users = users.filter(u => 
      u.name.toLowerCase().includes(searchLower) ||
      u.email.toLowerCase().includes(searchLower)
    );
  }
  if (status) users = users.filter(u => u.status === status);
  if (role) users = users.filter(u => u.role === role);
  
  // 최신순 정렬
  users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // 페이지네이션
  const total = users.length;
  const startIndex = (page - 1) * limit;
  const paginatedUsers = users.slice(startIndex, startIndex + parseInt(limit));
  
  res.json({
    success: true,
    users: paginatedUsers.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      status: u.status,
      subscription: u.subscription,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt
    })),
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    }
  });
});

// 사용자 상태 변경 (관리자)
app.put('/api/admin/users/:id', authenticateToken, requireAdmin, (req, res) => {
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
  }
  
  const { status, role } = req.body;
  
  if (status) user.status = status;
  if (role) user.role = role;
  
  logActivity(req.user.id, 'USER_UPDATE', { targetUserId: user.id });
  
  res.json({ success: true, message: '사용자 정보가 수정되었습니다.' });
});

// 사용자 삭제 (관리자)
app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, (req, res) => {
  const userIndex = db.users.findIndex(u => u.id === req.params.id);
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
  }
  
  const user = db.users[userIndex];
  if (user.role === 'admin') {
    return res.status(400).json({ success: false, message: '관리자 계정은 삭제할 수 없습니다.' });
  }
  
  db.users.splice(userIndex, 1);
  logActivity(req.user.id, 'USER_DELETE', { targetUserId: req.params.id });
  
  res.json({ success: true, message: '사용자가 삭제되었습니다.' });
});

// 게시물 목록 (관리자)
app.get('/api/admin/posts', authenticateToken, requireAdmin, (req, res) => {
  const { page = 1, limit = 20, category, search } = req.query;
  
  let posts = [...db.posts];
  
  if (category && category !== 'all') {
    posts = posts.filter(p => p.category === category);
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    posts = posts.filter(p => 
      p.title.toLowerCase().includes(searchLower) ||
      p.authorName.toLowerCase().includes(searchLower)
    );
  }
  
  posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  const total = posts.length;
  const startIndex = (page - 1) * limit;
  const paginatedPosts = posts.slice(startIndex, startIndex + parseInt(limit));
  
  // 댓글 수 추가
  const postsWithCommentCount = paginatedPosts.map(post => ({
    ...post,
    commentCount: db.comments.filter(c => c.postId === post.id).length
  }));
  
  res.json({
    success: true,
    posts: postsWithCommentCount,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    }
  });
});

// 댓글 목록 (관리자)
app.get('/api/admin/comments', authenticateToken, requireAdmin, (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  
  let comments = [...db.comments];
  
  if (search) {
    const searchLower = search.toLowerCase();
    comments = comments.filter(c => 
      c.content.toLowerCase().includes(searchLower) ||
      c.authorName.toLowerCase().includes(searchLower)
    );
  }
  
  comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  const total = comments.length;
  const startIndex = (page - 1) * limit;
  const paginatedComments = comments.slice(startIndex, startIndex + parseInt(limit));
  
  // 게시물 제목 추가
  const commentsWithPostTitle = paginatedComments.map(comment => {
    const post = db.posts.find(p => p.id === comment.postId);
    return { ...comment, postTitle: post?.title || '삭제된 게시물' };
  });
  
  res.json({
    success: true,
    comments: commentsWithPostTitle,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    }
  });
});

// 관리자 대시보드 통계
app.get('/api/admin/stats', authenticateToken, requireAdmin, (req, res) => {
  const totalUsers = db.users.length;
  const activeUsers = db.users.filter(u => u.status === 'active').length;
  const totalPosts = db.posts.length;
  const totalComments = db.comments.length;
  
  // 최근 7일 가입자
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentUsers = db.users.filter(u => new Date(u.createdAt) > weekAgo).length;
  
  // 카테고리별 게시물 수
  const postsByCategory = {
    notice: db.posts.filter(p => p.category === 'notice').length,
    party: db.posts.filter(p => p.category === 'party').length,
    review: db.posts.filter(p => p.category === 'review').length,
    free: db.posts.filter(p => p.category === 'free').length,
    qna: db.posts.filter(p => p.category === 'qna').length
  };
  
  res.json({
    success: true,
    stats: {
      totalUsers,
      activeUsers,
      totalPosts,
      totalComments,
      recentUsers,
      postsByCategory
    }
  });
});

// OTT 서비스 관리 (관리자)
app.post('/api/admin/ott', authenticateToken, requireAdmin, (req, res) => {
  const { name, logo, price, maxMembers, category, color, description } = req.body;
  
  if (!name || !price) {
    return res.status(400).json({ success: false, message: '서비스 이름과 가격은 필수입니다.' });
  }
  
  const newService = {
    id: uuidv4(),
    name,
    logo: logo || '📺',
    price,
    maxMembers: maxMembers || 4,
    category: category || '영화/드라마',
    color: color || '#333',
    description: description || ''
  };
  
  db.ottServices.push(newService);
  
  res.json({ success: true, message: 'OTT 서비스가 추가되었습니다.', service: newService });
});

app.put('/api/admin/ott/:id', authenticateToken, requireAdmin, (req, res) => {
  const service = db.ottServices.find(s => s.id === req.params.id);
  if (!service) {
    return res.status(404).json({ success: false, message: 'OTT 서비스를 찾을 수 없습니다.' });
  }
  
  const { name, logo, price, maxMembers, category, color, description } = req.body;
  
  if (name) service.name = name;
  if (logo) service.logo = logo;
  if (price) service.price = price;
  if (maxMembers) service.maxMembers = maxMembers;
  if (category) service.category = category;
  if (color) service.color = color;
  if (description !== undefined) service.description = description;
  
  res.json({ success: true, message: 'OTT 서비스가 수정되었습니다.', service });
});

app.delete('/api/admin/ott/:id', authenticateToken, requireAdmin, (req, res) => {
  const serviceIndex = db.ottServices.findIndex(s => s.id === req.params.id);
  if (serviceIndex === -1) {
    return res.status(404).json({ success: false, message: 'OTT 서비스를 찾을 수 없습니다.' });
  }
  
  db.ottServices.splice(serviceIndex, 1);
  
  res.json({ success: true, message: 'OTT 서비스가 삭제되었습니다.' });
});

// ============== 헬스 체크 ==============
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    service: 'OTT Share Hub API'
  });
});

// ============== 서버 시작 ==============
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ OTT Share Hub API 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`📡 http://localhost:${PORT}`);
  console.log(`👥 등록된 사용자: ${db.users.length}명`);
  console.log(`📺 OTT 서비스: ${db.ottServices.length}개`);
  console.log(`📝 게시물: ${db.posts.length}개`);
});
