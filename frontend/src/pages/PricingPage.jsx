import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Crown, HelpCircle } from 'lucide-react';
import './PricingPage.css';

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [openFaq, setOpenFaq] = useState(null);

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      icon: <Star size={24} />,
      description: '가볍게 시작하기',
      monthlyPrice: 9900,
      yearlyPrice: 99000,
      color: '#6D6D6D',
      features: [
        'OTT 1개 서비스',
        '기본 고객 지원',
        '이메일 지원',
        '커뮤니티 접근',
      ],
      notIncluded: [
        '프리미엄 매칭',
        '우선 지원',
        'VIP 전용 혜택',
      ],
    },
    {
      id: 'standard',
      name: 'Standard',
      icon: <Zap size={24} />,
      description: '가장 인기있는 플랜',
      monthlyPrice: 19900,
      yearlyPrice: 199000,
      color: '#E50914',
      popular: true,
      features: [
        'OTT 3개 서비스',
        '우선 고객 지원',
        '24시간 채팅 지원',
        '커뮤니티 접근',
        '프리미엄 매칭',
        '월간 혜택 쿠폰',
      ],
      notIncluded: [
        'VIP 전용 혜택',
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      icon: <Crown size={24} />,
      description: '모든 것을 누리세요',
      monthlyPrice: 39900,
      yearlyPrice: 399000,
      color: '#E5A00D',
      features: [
        'OTT 무제한 서비스',
        'VIP 전용 지원',
        '24시간 전화 지원',
        '커뮤니티 접근',
        '프리미엄 매칭',
        '월간 혜택 쿠폰',
        'VIP 전용 혜택',
        '신규 서비스 우선 접근',
      ],
      notIncluded: [],
    },
  ];

  const faqs = [
    {
      q: '구독은 어떻게 시작하나요?',
      a: '원하는 플랜을 선택하고 결제를 완료하면 즉시 서비스를 이용할 수 있습니다. 결제 후 자동으로 파티에 매칭되며, 계정 정보가 이메일로 발송됩니다.',
    },
    {
      q: '언제든 해지할 수 있나요?',
      a: '네, 언제든지 해지 가능합니다. 해지 시 남은 기간은 환불 정책에 따라 처리됩니다. 마이페이지에서 간편하게 해지할 수 있습니다.',
    },
    {
      q: '계정 공유는 안전한가요?',
      a: '모든 파티원은 신원 인증을 거치며, 플랫폼에서 제공하는 공식 가족/팀 요금제를 활용합니다. 계정 정보는 암호화되어 안전하게 관리됩니다.',
    },
    {
      q: '결제 방법은 어떤 것이 있나요?',
      a: '신용카드, 체크카드, 카카오페이, 토스페이, 네이버페이 등 다양한 결제 방법을 지원합니다.',
    },
    {
      q: '플랜을 변경할 수 있나요?',
      a: '언제든지 상위 플랜으로 업그레이드하거나 하위 플랜으로 변경할 수 있습니다. 변경 시 차액은 일할 계산됩니다.',
    },
  ];

  const getPrice = (plan) => {
    const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
    return price.toLocaleString();
  };

  const getSavings = (plan) => {
    const yearly = plan.yearlyPrice;
    const monthly12 = plan.monthlyPrice * 12;
    return Math.round(((monthly12 - yearly) / monthly12) * 100);
  };

  return (
    <div className="pricing-page">
      {/* Header */}
      <section className="pricing-header">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1>합리적인 요금제</h1>
            <p>나에게 맞는 플랜을 선택하세요</p>
            
            {/* Billing Toggle */}
            <div className="billing-toggle">
              <button
                className={billingCycle === 'monthly' ? 'active' : ''}
                onClick={() => setBillingCycle('monthly')}
              >
                월간 결제
              </button>
              <button
                className={billingCycle === 'yearly' ? 'active' : ''}
                onClick={() => setBillingCycle('yearly')}
              >
                연간 결제
                <span className="save-badge">2개월 무료</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pricing-cards-section">
        <div className="container">
          <div className="pricing-cards">
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.id}
                className={`pricing-card ${plan.popular ? 'popular' : ''}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                {plan.popular && <span className="popular-badge">MOST POPULAR</span>}
                
                <div className="plan-icon" style={{ background: plan.color }}>
                  {plan.icon}
                </div>
                
                <h3>{plan.name}</h3>
                <p className="plan-desc">{plan.description}</p>
                
                <div className="plan-price">
                  <span className="currency">₩</span>
                  <span className="amount">{getPrice(plan)}</span>
                  <span className="period">/{billingCycle === 'monthly' ? '월' : '년'}</span>
                </div>
                
                {billingCycle === 'yearly' && (
                  <span className="yearly-savings">연 {getSavings(plan)}% 절약</span>
                )}
                
                <button 
                  className={`btn ${plan.popular ? 'btn-primary' : 'btn-outline'} plan-btn`}
                >
                  시작하기
                </button>
                
                <ul className="plan-features">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="included">
                      <Check size={16} />
                      {feature}
                    </li>
                  ))}
                  {plan.notIncluded.map((feature, fidx) => (
                    <li key={fidx} className="not-included">
                      <Check size={16} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section section">
        <div className="container">
          <div className="section-header center">
            <h2>자주 묻는 질문</h2>
            <p>궁금한 점이 있으신가요?</p>
          </div>
          
          <div className="faq-list">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                className={`faq-item ${openFaq === idx ? 'open' : ''}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <button
                  className="faq-question"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <HelpCircle size={20} />
                  <span>{faq.q}</span>
                  <span className="faq-toggle">{openFaq === idx ? '−' : '+'}</span>
                </button>
                {openFaq === idx && (
                  <motion.div
                    className="faq-answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                  >
                    <p>{faq.a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;

