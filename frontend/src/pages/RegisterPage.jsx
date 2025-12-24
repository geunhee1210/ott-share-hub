import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, UserPlus, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import './AuthPage.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const passwordRequirements = [
    { id: 'length', label: '8자 이상', test: (p) => p.length >= 8 },
    { id: 'letter', label: '영문 포함', test: (p) => /[a-zA-Z]/.test(p) },
    { id: 'number', label: '숫자 포함', test: (p) => /\d/.test(p) },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    }
    
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }
    
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }
    
    if (!agreeTerms) {
      newErrors.terms = '이용약관에 동의해주세요.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);

    try {
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      if (response.success) {
        login(response.user, response.token);
        navigate('/');
      }
    } catch (err) {
      setErrors({ submit: err.message || '회원가입에 실패했습니다.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background" />
      
      <motion.div
        className="auth-card register"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="auth-header">
          <h1>회원가입</h1>
          <p>지금 가입하고 OTT 구독료를 절약하세요</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {errors.submit && (
            <div className="auth-error">{errors.submit}</div>
          )}

          <div className="input-group">
            <label>이름</label>
            <div className={`input-with-icon ${errors.name ? 'error' : ''}`}>
              <User size={18} />
              <input
                type="text"
                name="name"
                placeholder="이름을 입력하세요"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="input-group">
            <label>이메일</label>
            <div className={`input-with-icon ${errors.email ? 'error' : ''}`}>
              <Mail size={18} />
              <input
                type="email"
                name="email"
                placeholder="이메일을 입력하세요"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="input-group">
            <label>비밀번호</label>
            <div className={`input-with-icon ${errors.password ? 'error' : ''}`}>
              <Lock size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="비밀번호를 입력하세요"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
            
            <div className="password-requirements">
              {passwordRequirements.map((req) => (
                <span 
                  key={req.id} 
                  className={`requirement ${req.test(formData.password) ? 'met' : ''}`}
                >
                  <Check size={12} />
                  {req.label}
                </span>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label>비밀번호 확인</label>
            <div className={`input-with-icon ${errors.confirmPassword ? 'error' : ''}`}>
              <Lock size={18} />
              <input
                type="password"
                name="confirmPassword"
                placeholder="비밀번호를 다시 입력하세요"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <div className="terms-checkbox">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <span>
                <Link to="/terms">이용약관</Link> 및{' '}
                <Link to="/privacy">개인정보처리방침</Link>에 동의합니다.
              </span>
            </label>
            {errors.terms && <span className="error-text">{errors.terms}</span>}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-lg auth-submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading-spinner" />
            ) : (
              <>
                <UserPlus size={18} />
                가입하기
              </>
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>또는</span>
        </div>

        <div className="social-login">
          <button className="social-btn kakao">
            <span>💬</span>
            카카오로 시작하기
          </button>
          <button className="social-btn google">
            <span>G</span>
            Google로 시작하기
          </button>
        </div>

        <div className="auth-footer">
          <p>
            이미 계정이 있으신가요?{' '}
            <Link to="/login">로그인</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
