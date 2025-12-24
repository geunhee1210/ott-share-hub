// API 서비스 모듈
// 배포 환경에서는 같은 도메인 사용, 로컬에서는 별도 포트
const API_BASE_URL = import.meta.env.VITE_API_URL || (
  window.location.hostname === 'localhost' 
    ? 'http://localhost:3001/api' 
    : `${window.location.origin}/api`
);

// 토큰 관리
export const getToken = () => localStorage.getItem('token');
export const setToken = (token) => localStorage.setItem('token', token);
export const removeToken = () => localStorage.removeItem('token');

// 사용자 정보 관리
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
export const setUser = (user) => localStorage.setItem('user', JSON.stringify(user));
export const removeUser = () => localStorage.removeItem('user');

// 로그아웃
export const logout = () => {
  removeToken();
  removeUser();
  window.location.href = '/login';
};

// API 요청 헬퍼
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || '요청 처리 중 오류가 발생했습니다.');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ============== 인증 API ==============
export const authAPI = {
  // 로그인
  login: async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.success) {
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  },

  // 회원가입
  register: async (userData) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (data.success) {
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  },

  // 현재 사용자 정보
  getMe: async () => {
    return await apiRequest('/auth/me');
  },

  // 프로필 수정
  updateProfile: async (profileData) => {
    return await apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }
};

// ============== OTT 서비스 API ==============
export const ottAPI = {
  // OTT 서비스 목록
  getServices: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiRequest(`/ott${query ? `?${query}` : ''}`);
  },

  // OTT 서비스 상세
  getService: async (id) => {
    return await apiRequest(`/ott/${id}`);
  }
};

// ============== 구독 플랜 API ==============
export const planAPI = {
  // 플랜 목록
  getPlans: async () => {
    return await apiRequest('/plans');
  },

  // 구독 신청
  subscribe: async (planId) => {
    return await apiRequest('/subscription', {
      method: 'POST',
      body: JSON.stringify({ planId })
    });
  }
};

// ============== 게시판 API ==============
export const postAPI = {
  // 게시물 목록
  getPosts: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiRequest(`/posts${query ? `?${query}` : ''}`);
  },

  // 게시물 상세
  getPost: async (id) => {
    return await apiRequest(`/posts/${id}`);
  },

  // 게시물 작성
  createPost: async (postData) => {
    return await apiRequest('/posts', {
      method: 'POST',
      body: JSON.stringify(postData)
    });
  },

  // 게시물 수정
  updatePost: async (id, postData) => {
    return await apiRequest(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData)
    });
  },

  // 게시물 삭제
  deletePost: async (id) => {
    return await apiRequest(`/posts/${id}`, {
      method: 'DELETE'
    });
  }
};

// ============== 댓글 API ==============
export const commentAPI = {
  // 댓글 작성
  createComment: async (postId, content) => {
    return await apiRequest(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
  },

  // 댓글 수정
  updateComment: async (id, content) => {
    return await apiRequest(`/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content })
    });
  },

  // 댓글 삭제
  deleteComment: async (id) => {
    return await apiRequest(`/comments/${id}`, {
      method: 'DELETE'
    });
  }
};

// ============== 관리자 API ==============
export const adminAPI = {
  // 대시보드 통계
  getStats: async () => {
    return await apiRequest('/admin/stats');
  },

  // 사용자 관리
  getUsers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiRequest(`/admin/users${query ? `?${query}` : ''}`);
  },

  updateUser: async (id, userData) => {
    return await apiRequest(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },

  deleteUser: async (id) => {
    return await apiRequest(`/admin/users/${id}`, {
      method: 'DELETE'
    });
  },

  // 게시물 관리
  getPosts: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiRequest(`/admin/posts${query ? `?${query}` : ''}`);
  },

  // 댓글 관리
  getComments: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiRequest(`/admin/comments${query ? `?${query}` : ''}`);
  },

  // OTT 서비스 관리
  createOTT: async (ottData) => {
    return await apiRequest('/admin/ott', {
      method: 'POST',
      body: JSON.stringify(ottData)
    });
  },

  updateOTT: async (id, ottData) => {
    return await apiRequest(`/admin/ott/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ottData)
    });
  },

  deleteOTT: async (id) => {
    return await apiRequest(`/admin/ott/${id}`, {
      method: 'DELETE'
    });
  }
};

export default {
  auth: authAPI,
  ott: ottAPI,
  plan: planAPI,
  post: postAPI,
  comment: commentAPI,
  admin: adminAPI
};

