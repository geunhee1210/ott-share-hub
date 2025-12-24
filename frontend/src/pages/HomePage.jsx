import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Info, ChevronRight, Star, Shield, Zap, Users } from 'lucide-react';
import OTTCarousel from '../components/home/OTTCarousel';
import './HomePage.css';

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const heroSlides = [
    {
      title: 'OTT 구독료, 반값에 즐기세요',
      subtitle: '넷플릭스, 유튜브 프리미엄, ChatGPT 등 프리미엄 서비스를 합리적인 가격으로',
      gradient: 'linear-gradient(135deg, #E50914 0%, #831010 100%)',
    },
    {
      title: '안전한 계정 공유 시스템',
      subtitle: '검증된 파티원과 함께하는 안심 구독 서비스',
      gradient: 'linear-gradient(135deg, #0080FF 0%, #004C99 100%)',
    },
    {
      title: '월 최대 70% 절약',
      subtitle: '매월 아끼는 구독료로 더 많은 콘텐츠를 즐기세요',
      gradient: 'linear-gradient(135deg, #46D369 0%, #1A8F3C 100%)',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const features = [
    {
      icon: <Shield size={32} />,
      title: '안전한 결제',
      desc: '토스, 카카오페이 등 검증된 결제 시스템',
    },
    {
      icon: <Zap size={32} />,
      title: '즉시 이용',
      desc: '결제 완료 후 바로 서비스 이용 가능',
    },
    {
      icon: <Users size={32} />,
      title: '자동 매칭',
      desc: '검증된 파티원과 자동으로 매칭',
    },
    {
      icon: <Star size={32} />,
      title: '24/7 지원',
      desc: '언제든 문의 가능한 고객 지원',
    },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div 
            className="hero-gradient" 
            style={{ background: heroSlides[currentSlide].gradient }}
          />
          <div className="hero-overlay" />
        </div>
        
        <div className="hero-content container">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="hero-text"
          >
            <span className="hero-badge">🔥 HOT</span>
            <h1>{heroSlides[currentSlide].title}</h1>
            <p>{heroSlides[currentSlide].subtitle}</p>
            
            <div className="hero-buttons">
              <Link to="/catalog" className="btn btn-primary btn-lg">
                <Play size={20} />
                지금 시작하기
              </Link>
              <Link to="/pricing" className="btn btn-secondary btn-lg">
                <Info size={20} />
                요금제 보기
              </Link>
            </div>
          </motion.div>

          {/* Slide Indicators */}
          <div className="hero-indicators">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                className={`indicator ${currentSlide === idx ? 'active' : ''}`}
                onClick={() => setCurrentSlide(idx)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* OTT Services Carousel */}
      <section className="section ott-section">
        <div className="container">
          <div className="section-header">
            <h2>인기 OTT 서비스</h2>
            <Link to="/catalog" className="see-all">
              전체보기 <ChevronRight size={18} />
            </Link>
          </div>
          <OTTCarousel />
        </div>
      </section>

      {/* Features Section */}
      <section className="section features-section">
        <div className="container">
          <div className="section-header center">
            <h2>왜 OTT Share인가요?</h2>
            <p>안전하고 합리적인 구독 공유 서비스</p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                className="feature-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="section pricing-preview-section">
        <div className="container">
          <div className="pricing-preview">
            <div className="pricing-preview-content">
              <h2>합리적인 요금제</h2>
              <p>나에게 맞는 플랜을 선택하세요</p>
              <ul className="pricing-benefits">
                <li>✓ 가입비 없음</li>
                <li>✓ 언제든 해지 가능</li>
                <li>✓ 첫 달 50% 할인</li>
              </ul>
              <Link to="/pricing" className="btn btn-primary btn-lg">
                요금제 확인하기
              </Link>
            </div>
            <div className="pricing-preview-cards">
              <div className="preview-card">
                <span className="preview-service">Netflix</span>
                <div className="preview-price">
                  <span className="original">₩17,000</span>
                  <span className="sale">₩5,900</span>
                </div>
                <span className="discount-badge">-65%</span>
              </div>
              <div className="preview-card featured">
                <span className="preview-service">YouTube Premium</span>
                <div className="preview-price">
                  <span className="original">₩14,900</span>
                  <span className="sale">₩4,900</span>
                </div>
                <span className="discount-badge">-67%</span>
              </div>
              <div className="preview-card">
                <span className="preview-service">ChatGPT Plus</span>
                <div className="preview-price">
                  <span className="original">$20</span>
                  <span className="sale">₩9,900</span>
                </div>
                <span className="discount-badge">-60%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>지금 바로 시작하세요</h2>
            <p>5분만에 가입하고 바로 이용하세요</p>
            <Link to="/register" className="btn btn-primary btn-lg">
              무료로 시작하기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

