import { Link } from 'react-router-dom';
import { Mail, MessageCircle, Instagram, Youtube } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span className="logo-text">OTT</span>
              <span className="logo-highlight">Share</span>
            </Link>
            <p className="footer-desc">
              프리미엄 OTT 서비스를 더 합리적인 가격으로 즐기세요. 
              안전하고 편리한 구독 공유 플랫폼입니다.
            </p>
            <div className="footer-social">
              <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
              <a href="#" aria-label="Youtube"><Youtube size={20} /></a>
              <a href="#" aria-label="카카오톡"><MessageCircle size={20} /></a>
              <a href="#" aria-label="이메일"><Mail size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4>서비스</h4>
            <ul>
              <li><Link to="/catalog">OTT 서비스</Link></li>
              <li><Link to="/pricing">요금제</Link></li>
              <li><Link to="/board">커뮤니티</Link></li>
              <li><Link to="/board?category=faq">자주 묻는 질문</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-section">
            <h4>고객지원</h4>
            <ul>
              <li><Link to="/board?category=notice">공지사항</Link></li>
              <li><a href="#">이용가이드</a></li>
              <li><a href="#">1:1 문의</a></li>
              <li><a href="#">파트너 제휴</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="footer-section">
            <h4>정책</h4>
            <ul>
              <li><a href="#">이용약관</a></li>
              <li><a href="#">개인정보처리방침</a></li>
              <li><a href="#">환불정책</a></li>
              <li><a href="#">서비스 이용규칙</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="footer-bottom">
          <p>© {currentYear} OTT Share Hub. All rights reserved.</p>
          <p className="footer-notice">
            본 서비스는 각 OTT 플랫폼의 가족/팀 요금제를 기반으로 합니다.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

