import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUser, getToken, setUser, setToken, removeUser, removeToken } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 초기 로드 시 저장된 사용자 정보 확인
    const savedUser = getUser();
    const token = getToken();
    
    if (savedUser && token) {
      setUserState(savedUser);
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    setToken(token);
    setUser(userData);
    setUserState(userData);
  };

  const logout = () => {
    removeToken();
    removeUser();
    setUserState(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    setUserState(userData);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAuthenticated, 
      isAdmin,
      login, 
      logout,
      updateUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

