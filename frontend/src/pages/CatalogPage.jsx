import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Play, Star, Users, Clock } from 'lucide-react';
import { ottAPI } from '../services/api';
import './CatalogPage.css';

const CatalogPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedService, setSelectedService] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', name: '전체' },
    { id: '영화/드라마', name: '영화/드라마' },
    { id: '음악', name: '음악' },
    { id: '영상', name: '영상' },
    { id: '애니메이션', name: '애니메이션' },
  ];

  // OTT 서비스 불러오기
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const params = {
          ...(selectedCategory !== 'all' && { category: selectedCategory }),
          ...(searchTerm && { search: searchTerm })
        };
        const response = await ottAPI.getServices(params);
        if (response.success) {
          // 프론트엔드에서 추가 정보 계산
          const enhancedServices = response.services.map(service => ({
            ...service,
            sharePrice: Math.floor(service.price / service.maxMembers),
            discount: Math.floor(((service.price - (service.price / service.maxMembers)) / service.price) * 100),
            rating: (Math.random() * 0.5 + 4.5).toFixed(1),
            members: Math.floor(Math.random() * 2000 + 500),
            features: getFeatures(service.id)
          }));
          setServices(enhancedServices);
        }
      } catch (error) {
        console.error('OTT 서비스 불러오기 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [selectedCategory, searchTerm]);

  const getFeatures = (serviceId) => {
    const featuresMap = {
      netflix: ['4K UHD 화질', '동시 4화면', '광고 없음', '다운로드 지원'],
      disney: ['마블 전작품', '픽사 애니메이션', '스타워즈', '4K 지원'],
      watcha: ['영화 추천 AI', '큐레이션', '독점 콘텐츠', 'HD 화질'],
      wavve: ['지상파 실시간', 'KBS/MBC/SBS', '스포츠 중계', '4K 지원'],
      tving: ['tvN 드라마', 'OCN 영화', '스포츠', '오리지널'],
      coupangplay: ['스포츠 중계', '독점 콘텐츠', '빠른 업데이트', '로켓와우'],
      spotify: ['1억곡 이상', '오프라인 저장', '고음질', '팟캐스트'],
      youtube: ['광고 제거', '백그라운드 재생', 'YouTube Music', '오프라인'],
      applemusic: ['무손실 오디오', '공간 음향', '1억곡+', 'Apple 연동'],
      laftel: ['애니 전문', '자막/더빙', 'HD 화질', '신작 업데이트']
    };
    return featuresMap[serviceId] || ['프리미엄 콘텐츠', '고화질 스트리밍', '다중 기기 지원'];
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="catalog-page">
      {/* Header */}
      <section className="catalog-header">
        <div className="container">
          <h1>OTT 서비스</h1>
          <p>프리미엄 서비스를 합리적인 가격으로 이용하세요</p>

          {/* Search & Filter */}
          <div className="catalog-controls">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="서비스 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="category-filter">
              <Filter size={18} />
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="catalog-grid-section">
        <div className="container">
          {loading ? (
            <div className="loading-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="service-card skeleton">
                  <div className="skeleton-header" />
                  <div className="skeleton-body">
                    <div className="skeleton-line" />
                    <div className="skeleton-line short" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="catalog-grid">
              {filteredServices.map((service, idx) => (
                <motion.div
                  key={service.id}
                  className="service-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedService(service)}
                >
                  <div 
                    className="service-card-header"
                    style={{ background: `linear-gradient(135deg, ${service.color} 0%, ${service.color}99 100%)` }}
                  >
                    <span className="service-logo">{service.logo}</span>
                    <span className="discount-badge">-{service.discount}%</span>
                  </div>
                  
                  <div className="service-card-body">
                    <h3>{service.name}</h3>
                    
                    <div className="service-meta">
                      <span className="meta-item">
                        <Star size={14} /> {service.rating}
                      </span>
                      <span className="meta-item">
                        <Users size={14} /> {service.members.toLocaleString()}명
                      </span>
                    </div>
                    
                    <div className="service-pricing">
                      <span className="original">₩{service.price.toLocaleString()}</span>
                      <span className="share">₩{service.sharePrice.toLocaleString()}</span>
                      <span className="period">/월</span>
                    </div>
                    
                    <button className="btn btn-primary service-btn">
                      <Play size={16} />
                      구독하기
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && filteredServices.length === 0 && (
            <div className="no-results">
              <p>검색 결과가 없습니다.</p>
            </div>
          )}
        </div>
      </section>

      {/* Service Detail Modal */}
      {selectedService && (
        <div className="modal-overlay" onClick={() => setSelectedService(null)}>
          <motion.div
            className="service-modal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="modal-header"
              style={{ background: `linear-gradient(135deg, ${selectedService.color} 0%, ${selectedService.color}99 100%)` }}
            >
              <span className="modal-logo">{selectedService.logo}</span>
              <div>
                <h2>{selectedService.name}</h2>
                <span className="modal-discount">-{selectedService.discount}% 할인</span>
              </div>
              <button className="modal-close" onClick={() => setSelectedService(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <p className="modal-desc">{selectedService.description}</p>
              
              <div className="modal-stats">
                <div className="stat">
                  <Star size={20} />
                  <span>{selectedService.rating}</span>
                  <label>평점</label>
                </div>
                <div className="stat">
                  <Users size={20} />
                  <span>{selectedService.members.toLocaleString()}</span>
                  <label>이용자</label>
                </div>
                <div className="stat">
                  <Clock size={20} />
                  <span>최대 {selectedService.maxMembers}명</span>
                  <label>공유 가능</label>
                </div>
              </div>
              
              <div className="modal-features">
                <h4>주요 기능</h4>
                <ul>
                  {selectedService.features.map((feature, idx) => (
                    <li key={idx}>✓ {feature}</li>
                  ))}
                </ul>
              </div>
              
              <div className="modal-pricing">
                <div className="price-info">
                  <span className="original">정가 ₩{selectedService.price.toLocaleString()}</span>
                  <span className="share">₩{selectedService.sharePrice.toLocaleString()}<span>/월</span></span>
                </div>
                <button className="btn btn-primary btn-lg">지금 구독하기</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CatalogPage;
