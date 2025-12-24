import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import './OTTCarousel.css';

const OTTCarousel = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const carouselRef = useRef(null);

  const ottServices = [
    {
      id: 1,
      name: 'Netflix',
      logo: '🎬',
      color: '#E50914',
      originalPrice: 17000,
      sharePrice: 5900,
      discount: 65,
      features: ['4K UHD', '동시 4화면', '광고 없음'],
    },
    {
      id: 2,
      name: 'YouTube Premium',
      logo: '▶️',
      color: '#FF0000',
      originalPrice: 14900,
      sharePrice: 4900,
      discount: 67,
      features: ['광고 제거', '백그라운드 재생', 'YouTube Music'],
    },
    {
      id: 3,
      name: 'Spotify',
      logo: '🎵',
      color: '#1DB954',
      originalPrice: 10900,
      sharePrice: 3900,
      discount: 64,
      features: ['무제한 음악', '오프라인 저장', '고음질'],
    },
    {
      id: 4,
      name: 'ChatGPT Plus',
      logo: '🤖',
      color: '#10A37F',
      originalPrice: 28000,
      sharePrice: 9900,
      discount: 65,
      features: ['GPT-4 무제한', '빠른 응답', '최신 기능'],
    },
    {
      id: 5,
      name: 'Disney+',
      logo: '🏰',
      color: '#113CCF',
      originalPrice: 9900,
      sharePrice: 3500,
      discount: 65,
      features: ['마블', '픽사', '스타워즈'],
    },
    {
      id: 6,
      name: 'Apple TV+',
      logo: '🍎',
      color: '#000000',
      originalPrice: 6500,
      sharePrice: 2500,
      discount: 62,
      features: ['오리지널 콘텐츠', '4K HDR', '가족 공유'],
    },
    {
      id: 7,
      name: 'Wavve',
      logo: '📺',
      color: '#1A0DAB',
      originalPrice: 13900,
      sharePrice: 4900,
      discount: 65,
      features: ['실시간 TV', 'KBS/MBC/SBS', '4K 지원'],
    },
    {
      id: 8,
      name: 'Watcha',
      logo: '🎞️',
      color: '#FF0558',
      originalPrice: 12900,
      sharePrice: 4500,
      discount: 65,
      features: ['영화 특화', '독립 영화', '4화면 동시'],
    },
  ];

  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="ott-carousel-wrapper">
      <button className="carousel-btn left" onClick={() => scroll('left')}>
        <ChevronLeft size={24} />
      </button>
      
      <div className="ott-carousel" ref={carouselRef}>
        {ottServices.map((service, idx) => (
          <motion.div
            key={service.id}
            className={`ott-card ${hoveredCard === service.id ? 'hovered' : ''}`}
            onMouseEnter={() => setHoveredCard(service.id)}
            onMouseLeave={() => setHoveredCard(null)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <div 
              className="ott-card-bg"
              style={{ background: `linear-gradient(135deg, ${service.color} 0%, ${service.color}99 100%)` }}
            />
            
            <div className="ott-card-content">
              <span className="ott-logo">{service.logo}</span>
              <h3 className="ott-name">{service.name}</h3>
              
              <div className="ott-pricing">
                <span className="original-price">₩{service.originalPrice.toLocaleString()}</span>
                <span className="share-price">₩{service.sharePrice.toLocaleString()}</span>
                <span className="discount">-{service.discount}%</span>
              </div>
              
              <ul className="ott-features">
                {service.features.map((feature, fidx) => (
                  <li key={fidx}>{feature}</li>
                ))}
              </ul>
              
              <Link to={`/catalog?service=${service.id}`} className="ott-card-btn">
                <Play size={16} />
                자세히 보기
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
      
      <button className="carousel-btn right" onClick={() => scroll('right')}>
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

export default OTTCarousel;

