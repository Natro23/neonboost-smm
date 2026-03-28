import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FiArrowRight,
  FiCheck,
  FiZap,
  FiHeadphones,
  FiRefreshCw,
  FiShield,
  FiClock,
  FiUsers,
  FiCreditCard,
  FiLock,
  FiGlobe,
  FiChevronDown,
  FiTrendingUp,
} from 'react-icons/fi';
import {
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaFacebookF,
} from 'react-icons/fa';
import { useStore, currencies } from '../store/useStore';
import { reviews, services } from '../data/services';

// Animated Background Component
const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Array<{x: number; y: number; vx: number; vy: number; size: number; color: string}> = [];

    // Detect mobile for reduced particle count
    const isMobile = window.innerWidth < 768;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles = [];
      // Much fewer particles on mobile — 30000 divisor instead of 15000
      const divisor = isMobile ? 30000 : 18000;
      const particleCount = Math.min(Math.floor((canvas.width * canvas.height) / divisor), isMobile ? 30 : 60);
      const colors = ['#a855f7', '#06b6d4', '#ec4899', '#8b5cf6', '#06b6d4'];

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: Math.random() * 2 + 1,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    };

    // Throttle to 30fps on mobile, 60fps on desktop
    let lastTime = 0;
    const targetFps = isMobile ? 30 : 60;
    const interval = 1000 / targetFps;

    const drawParticles = (timestamp: number) => {
      animationId = requestAnimationFrame(drawParticles);

      if (timestamp - lastTime < interval) return;
      lastTime = timestamp;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections — skip on mobile entirely for performance
      if (!isMobile) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 120) {
              ctx.beginPath();
              ctx.strokeStyle = `rgba(168, 85, 247, ${0.12 * (1 - distance / 120)})`;
              ctx.lineWidth = 0.5;
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }

      // Set globalAlpha once outside the loop
      ctx.globalAlpha = 0.6;
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    };

    resize();
    createParticles();
    animationId = requestAnimationFrame(drawParticles);

    const handleResize = () => {
      resize();
      createParticles();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ willChange: 'transform' }}
    />
  );
};

const Home = () => {
  const { t } = useTranslation();
  const { isDarkMode, currency, convertPrice } = useStore();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const counters = { orders: 15000, customers: 3000, countries: 25 };

  const formatPrice = (priceUSD: number) => {
    const converted = convertPrice(priceUSD);
    return `${currencies[currency].symbol}${converted.toFixed(2)}`;
  };

  const features = [
    {
      icon: FiShield,
      title: t('features.realQuality.title'),
      description: t('features.realQuality.description'),
    },
    {
      icon: FiZap,
      title: t('features.instantDelivery.title'),
      description: t('features.instantDelivery.description'),
    },
    {
      icon: FiHeadphones,
      title: t('features.support.title'),
      description: t('features.support.description'),
    },
    {
      icon: FiRefreshCw,
      title: t('features.autoRefills.title'),
      description: t('features.autoRefills.description'),
    },
  ];

  const platforms = [
    { icon: FaInstagram, name: t('platforms.instagram'), color: 'from-pink-500 to-purple-500', glow: 'shadow-pink-500/50' },
    { icon: FaTiktok, name: t('platforms.tiktok'), color: 'from-gray-800 to-gray-900', glow: 'shadow-gray-500/50' },
    { icon: FaYoutube, name: t('platforms.youtube'), color: 'from-red-600 to-red-700', glow: 'shadow-red-500/50' },
    { icon: FaFacebookF, name: t('platforms.facebook'), color: 'from-blue-600 to-blue-700', glow: 'shadow-blue-500/50' },
  ];

  const steps = [
    { number: '01', title: t('howItWorks.browseServices.title'), description: t('howItWorks.browseServices.description') },
    { number: '02', title: t('howItWorks.addToCart.title'), description: t('howItWorks.addToCart.description') },
    { number: '03', title: t('howItWorks.makePayment.title'), description: t('howItWorks.makePayment.description') },
    { number: '04', title: t('howItWorks.watchGrowth.title'), description: t('howItWorks.watchGrowth.description') },
  ];

  const comparisonData = [
    { feature: t('comparison.instantStart'), neonBoost: true, others: false },
    { feature: t('comparison.apiAccess'), neonBoost: true, others: false },
    { feature: t('comparison.refill'), neonBoost: true, others: false },
    { feature: t('comparison.support24'), neonBoost: true, others: false },
    { feature: t('comparison.dripFeed'), neonBoost: true, others: false },
    { feature: t('comparison.massOrder'), neonBoost: true, others: false },
  ];

  const faqs = [
    { question: t('faqPage.questions.q1.question'), answer: t('faqPage.questions.q1.answer') },
    { question: t('faqPage.questions.q2.question'), answer: t('faqPage.questions.q2.answer') },
    { question: t('faqPage.questions.q3.question'), answer: t('faqPage.questions.q3.answer') },
    { question: t('faqPage.questions.q4.question'), answer: t('faqPage.questions.q4.answer') },
    { question: t('faqPage.questions.q5.question'), answer: t('faqPage.questions.q5.answer') },
  ];

  const topServices = services.slice(0, 6);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-12 md:pt-0 md:pb-0">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <AnimatedBackground />
          {/* Gradient Orbs */}
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[100px]" style={{ willChange: 'transform' }} />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[80px]" style={{ willChange: 'transform' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-600/8 rounded-full blur-[120px]" style={{ willChange: 'transform' }} />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/60 to-background" />

        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
            {t('hero.badge')}
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-montserrat mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{t('hero.title')}</span>
          </h1>

          <p className={`text-lg md:text-xl mb-6 max-w-2xl mx-auto opacity-0 animate-fade-in-up ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-10 text-sm text-gray-500 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
            <span className="flex items-center gap-1.5"><FiZap className="text-yellow-400" /> {t('home.startsIn30')}</span>
            <span className="flex items-center gap-1.5"><FiLock className="text-green-400" /> {t('home.sslSecured')}</span>
            <span className="flex items-center gap-1.5"><FiRefreshCw className="text-purple-400" /> {t('home.day30Refill')}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-in-up" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
            <Link to="/services">
              <button className="px-8 py-4 text-lg font-bold rounded-xl flex items-center gap-2 mx-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-purple-500/25 hover:scale-105 transition-all duration-300 hover-lift">
                🚀 {t('hero.cta')} <FiArrowRight />
              </button>
            </Link>
            <Link to="/services">
              <button className="px-8 py-4 text-lg font-semibold rounded-xl mx-auto border-2 border-white/20 hover:border-purple-500/50 text-white bg-white/5 backdrop-blur-sm hover:scale-105 transition-all duration-300 flex items-center gap-2 hover-lift">
                {t('hero.viewPricing')} <FiArrowRight />
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto opacity-0 animate-fade-in-up" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{counters.orders.toLocaleString()}+</div>
              <div className="text-sm text-gray-500 mt-1">{t('stats.orders')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{counters.customers.toLocaleString()}+</div>
              <div className="text-sm text-gray-500 mt-1">{t('stats.customers')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{counters.countries}+</div>
              <div className="text-sm text-gray-500 mt-1">{t('stats.countries')}</div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 150" fill="none"><path d="M0 150L60 140C120 130 240 110 360 93.3333C480 76.6667 600 63.3333 720 56.6667C840 50 960 50 1080 56.6667C1200 63.3333 1320 76.6667 1380 83.3333L1440 90L1440 150L1380 150C1320 150 1200 150 1080 150C960 150 840 150 720 150C600 150 480 150 360 150C240 150 120 150 60 150L0 150Z" className="fill-background" /></svg>
        </div>
      </section>

      {/* Packages Section — shown prominently right after hero */}
      <section className={`py-20 px-4 ${isDarkMode ? 'bg-neon-darker' : 'bg-gray-50'}`}>
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm mb-4">
              🔥 {t('packages.title') || 'Best Value Packages'}
            </div>
            <h2 className={`text-3xl md:text-4xl font-bold font-montserrat mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('packages.subtitle') || 'Choose Your Growth Package'}
            </h2>
            <p className={`text-lg max-w-xl mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('packages.description') || 'All-in-one Instagram growth bundles — followers + likes at the best price'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter */}
            <div className={`relative rounded-2xl p-6 border transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-neon-dark border-white/10 hover:border-purple-500/50' : 'bg-white border-gray-200 hover:border-purple-400 shadow-md'}`}>
              <div className={`text-xs font-bold uppercase tracking-wider mb-4 px-3 py-1 rounded-full inline-block bg-purple-500/20 text-purple-400`}>
                {t('packages.starterBadge') || 'Starter'}
              </div>
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {convertPrice(9.99)}
                  </span>
                  <span className="text-gray-500 line-through text-sm">{convertPrice(15)}</span>
                </div>
              </div>
              <ul className={`space-y-2 mb-6 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <li className="flex items-center gap-2"><FiCheck className="text-green-400 flex-shrink-0" /> 1,250 Followers</li>
                <li className="flex items-center gap-2"><FiCheck className="text-green-400 flex-shrink-0" /> 850 Likes</li>
                <li className="flex items-center gap-2"><FiCheck className="text-green-400 flex-shrink-0" /> {t('home.day30Refill') || '30-Day Refill'}</li>
              </ul>
              <Link to="/packages">
                <button className={`w-full py-3 rounded-xl font-semibold border-2 transition-all duration-300 hover:scale-105 ${isDarkMode ? 'border-purple-500/50 text-purple-300 hover:bg-purple-500/10' : 'border-purple-400 text-purple-600 hover:bg-purple-50'}`}>
                  {t('hero.viewPricing') || 'Get Started'} <FiArrowRight className="inline ml-1" />
                </button>
              </Link>
            </div>

            {/* Growth — Popular */}
            <div className="relative rounded-2xl p-6 border-2 border-purple-500 bg-gradient-to-b from-purple-900/40 to-neon-dark transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/20">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold">
                ⭐ {t('packages.popular') || 'Most Popular'}
              </div>
              <div className="text-xs font-bold uppercase tracking-wider mb-4 px-3 py-1 rounded-full inline-block bg-pink-500/20 text-pink-400">
                {t('packages.growthBadge') || 'Growth'}
              </div>
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">{convertPrice(13.99)}</span>
                  <span className="text-gray-500 line-through text-sm">{convertPrice(22)}</span>
                </div>
              </div>
              <ul className="space-y-2 mb-6 text-sm text-gray-300">
                <li className="flex items-center gap-2"><FiCheck className="text-green-400 flex-shrink-0" /> 1,750 Followers</li>
                <li className="flex items-center gap-2"><FiCheck className="text-green-400 flex-shrink-0" /> 1,350 Likes</li>
                <li className="flex items-center gap-2"><FiCheck className="text-green-400 flex-shrink-0" /> {t('home.day30Refill') || '30-Day Refill'}</li>
              </ul>
              <Link to="/packages">
                <button className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105">
                  🚀 {t('hero.cta') || 'Order Now'} <FiArrowRight className="inline ml-1" />
                </button>
              </Link>
            </div>

            {/* Pro */}
            <div className={`relative rounded-2xl p-6 border transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-neon-dark border-white/10 hover:border-cyan-500/50' : 'bg-white border-gray-200 hover:border-cyan-400 shadow-md'}`}>
              <div className="text-xs font-bold uppercase tracking-wider mb-4 px-3 py-1 rounded-full inline-block bg-cyan-500/20 text-cyan-400">
                {t('packages.proBadge') || 'Pro'}
              </div>
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{convertPrice(16.99)}</span>
                  <span className="text-gray-500 line-through text-sm">{convertPrice(30)}</span>
                </div>
              </div>
              <ul className={`space-y-2 mb-6 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <li className="flex items-center gap-2"><FiCheck className="text-green-400 flex-shrink-0" /> 2,250 Followers</li>
                <li className="flex items-center gap-2"><FiCheck className="text-green-400 flex-shrink-0" /> 1,850 Likes</li>
                <li className="flex items-center gap-2"><FiCheck className="text-green-400 flex-shrink-0" /> {t('home.day30Refill') || '30-Day Refill'}</li>
              </ul>
              <Link to="/packages">
                <button className={`w-full py-3 rounded-xl font-semibold border-2 transition-all duration-300 hover:scale-105 ${isDarkMode ? 'border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10' : 'border-cyan-400 text-cyan-600 hover:bg-cyan-50'}`}>
                  {t('hero.viewPricing') || 'Get Started'} <FiArrowRight className="inline ml-1" />
                </button>
              </Link>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link to="/packages">
              <button className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1 mx-auto transition-colors">
                {t('packages.viewAll') || 'View full package details & order'} <FiArrowRight />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className={`py-8 ${isDarkMode ? 'bg-neon-darker' : 'bg-gray-100'}`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
            <div className="flex items-center gap-2 text-gray-500"><FiCreditCard /><span className="text-sm font-medium">{t('home.visa')}</span></div>
            <div className="flex items-center gap-2 text-gray-500"><FiCreditCard /><span className="text-sm font-medium">{t('home.mastercard')}</span></div>
            <div className="flex items-center gap-2 text-gray-500"><span className="text-lg">₿</span><span className="text-sm font-medium">{t('home.usdt')}</span></div>
            <div className="flex items-center gap-2 text-gray-500"><FiLock className="text-green-500" /><span className="text-sm font-medium">{t('home.sslSecured')}</span></div>
            <div className="flex items-center gap-2 text-gray-500"><FiHeadphones className="text-purple-500" /><span className="text-sm font-medium">{t('features.support.title')}</span></div>
            <div className="flex items-center gap-2 text-gray-500"><FiRefreshCw className="text-cyan-500" /><span className="text-sm font-medium">{t('home.day30Refill')}</span></div>
            <div className="flex items-center gap-2 text-gray-500"><FiGlobe className="text-blue-500" /><span className="text-sm font-medium">{t('apiDocs.authentication')}</span></div>
          </div>
        </div>
      </section>

      {/* Free Trial Banner */}
      <section className="py-10 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="relative rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-900/40 to-pink-900/30 p-6 md:p-8 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative flex flex-col md:flex-row items-center gap-6">
              <div className="text-5xl">🎁</div>
              <div className="flex-1 text-center md:text-left">
                <div className="text-xs text-purple-300 font-medium uppercase tracking-widest mb-1">პირველი 500 მომხმარებლისთვის</div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">მიიღე 50 Instagram ფოლოვერი სრულიად უფასოდ</h2>
                <p className="text-gray-400 text-sm">შეზღუდული შეთავაზება — ერთხელ, ერთ ანგარიშზე. გადახდა საჭირო არ არის.</p>
              </div>
              <Link to="/free-trial" className="flex-shrink-0">
                <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap">
                  🆓 უფასოდ მიღება <FiArrowRight />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-montserrat mb-4">
              <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{t('features.title')}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="card-neon p-6 opacity-0 animate-fade-in-up" style={{ animationDelay: `${0.1 * index}s`, animationFillMode: 'forwards' }}>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mb-4 hover-lift">
                  <feature.icon className="text-white" size={28} />
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{feature.title}</h3>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className={`py-20 ${isDarkMode ? 'bg-neon-darker' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-montserrat mb-4">
              <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{t('comparison.title')}</span>
            </h2>
          </div>
          <div className="max-w-3xl mx-auto overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full">
              <thead>
                <tr className={isDarkMode ? 'bg-white/5' : 'bg-gray-100'}>
                  <th className={`px-6 py-4 text-left ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('home.feature')}</th>
                  <th className="px-6 py-4 text-center text-purple-400 font-bold">{t('comparison.neonBoost')}</th>
                  <th className={`px-6 py-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('home.otherPanels')}</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <tr key={index} className={isDarkMode ? 'border-t border-white/5' : 'border-t border-gray-200'}>
                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{row.feature}</td>
                    <td className="px-6 py-4 text-center">{row.neonBoost ? <span className="text-green-400">✓</span> : <span className="text-red-400">✗</span>}</td>
                    <td className="px-6 py-4 text-center">{row.others ? <span className="text-green-400">✓</span> : <span className="text-red-400">✗</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-montserrat mb-4">
              <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{t('topServices.title')}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topServices.map((service, index) => (
              <div key={service.id} className={`relative p-6 rounded-2xl border opacity-0 animate-fade-in-up ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} hover:border-purple-500/50 transition-all hover-lift`} style={{ animationDelay: `${0.1 * index}s`, animationFillMode: 'forwards' }}>
                {service.badge && <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">{service.badge}</span>}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                    {service.platform === 'Instagram' && <FaInstagram className="text-white" />}
                    {service.platform === 'TikTok' && <FaTiktok className="text-white" />}
                    {service.platform === 'YouTube' && <FaYoutube className="text-white" />}
{service.platform === 'Facebook' && <FaFacebookF className="text-white" />}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{service.platform} {service.category}</h3>
                    <p className="text-sm text-gray-500">{service.name.split(' - ')[0]}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{formatPrice(service.price)}</span>
                    {service.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">{formatPrice(service.originalPrice)}</span>
                    )}
                    {!(service.min === 1 && service.max === 1) && <span className="text-gray-500"> / 1000</span>}
                  </div>
                  {service.originalPrice && (
                    <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-semibold rounded-md">
                      -20%
                    </div>
                  )}
                </div>
                <ul className="space-y-2 text-sm text-gray-500 mb-4">
                  <li className="flex items-center gap-2"><FiZap className="text-yellow-400" /> {service.startTime}</li>
                  <li className="flex items-center gap-2"><FiCheck className="text-green-400" /> {service.speed}</li>
                  {service.refill && <li className="flex items-center gap-2"><FiRefreshCw className="text-purple-400" /> 30-Day Refill</li>}
                </ul>
                <Link to="/services">
                  <button className={`w-full py-3 rounded-xl font-semibold ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors`}>{t('home.orderNow')}</button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className={`py-20 ${isDarkMode ? 'bg-neon-darker' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-montserrat mb-4">
              <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{t('platforms.title')}</span>
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {platforms.map((platform, index) => (
              <div key={index} className="flex flex-col items-center gap-3 group opacity-0 animate-scale-in" style={{ animationDelay: `${0.1 * index}s`, animationFillMode: 'forwards' }}>
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${platform.color} flex items-center justify-center shadow-lg ${platform.glow} group-hover:scale-110 transition-transform duration-300`}>
                  <platform.icon className="text-white text-3xl" />
                </div>
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{platform.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-montserrat mb-4">
              <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{t('howItWorks.title')}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="card-neon p-6 h-full opacity-0 animate-fade-in-up" style={{ animationDelay: `${0.15 * index}s`, animationFillMode: 'forwards' }}>
                <div className="text-6xl font-bold bg-gradient-to-r from-purple-400/30 to-cyan-400/30 bg-clip-text text-transparent mb-4">{step.number}</div>
                <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{step.title}</h3>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={`py-20 ${isDarkMode ? 'bg-neon-darker' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-montserrat mb-4">
              <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{t('faqPage.title')}</span>
            </h2>
          </div>
          <div className="max-w-2xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className={`rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} overflow-hidden`}>
                <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className={`w-full px-6 py-4 flex items-center justify-between ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <span className="font-semibold">{faq.question}</span>
                  <FiChevronDown className={`transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className={`px-6 pb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-montserrat mb-4">
              <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{t('home.whatCustomersSay')}
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.slice(0, 6).map((review, index) => (
              <div key={review.id} className="card-neon p-6 opacity-0 animate-fade-in-up" style={{ animationDelay: `${0.1 * index}s`, animationFillMode: 'forwards' }}>
                <div className="flex items-center gap-4 mb-4">
                  <img src={review.avatar} alt={review.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{review.name}</h4>
                    <p className="text-sm text-gray-500">{review.username}</p>
                  </div>
                  <div className="ml-auto flex text-yellow-400">
                    {[...Array(5)].map((_, i) => <FiCheck key={i} className={i < Math.floor(review.rating) ? 'text-yellow-400' : 'text-gray-600'} size={14} />)}
                  </div>
                </div>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative p-12 text-center rounded-3xl" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(34, 211, 238, 0.15) 100%)' }}>
            <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-0 w-[250px] h-[250px] bg-cyan-500/20 rounded-full blur-[80px]" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold font-montserrat mb-4">
                <span className={isDarkMode ? 'text-white' : 'text-gray-900'}></span>
                <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{t('home.readyToGoViral')}</span>
              </h2>
              <p className={`max-w-2xl mx-auto mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('home.joinThousands')}</p>
              <Link to="/services">
                <button className="px-8 py-4 text-lg font-bold rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:scale-105 transition-transform">🚀 {t('hero.cta')}</button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
