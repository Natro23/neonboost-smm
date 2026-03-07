import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowRight,
  FiCheck,
  FiZap,
  FiHeadphones,
  FiRefreshCw,
  FiShield,
} from 'react-icons/fi';
import {
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaFacebookF,
} from 'react-icons/fa';
import { useStore } from '../store/useStore';
import { reviews, randomNames, services } from '../data/services';

const Home = () => {
  const { isDarkMode } = useStore();
  const [counters, setCounters] = useState({ orders: 0, customers: 0, countries: 0 });

  // Animated counters
  useEffect(() => {
    const target = { orders: 3000, customers: 1500, countries: 25 };
    const duration = 2000;
    const steps = 60;
    const increment = {
      orders: target.orders / steps,
      customers: target.customers / steps,
      countries: target.countries / steps,
    };

    let step = 0;
    const timer = setInterval(() => {
      step++;
      setCounters({
        orders: Math.min(Math.round(increment.orders * step), target.orders),
        customers: Math.min(Math.round(increment.customers * step), target.customers),
        countries: Math.min(Math.round(increment.countries * step), target.countries),
      });

      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  // Particle generation
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 10}s`,
    animationDuration: `${10 + Math.random() * 10}s`,
  }));

  const features = [
    {
      icon: FiShield,
      title: 'Real Quality',
      description: '100% authentic followers, likes, and views from real active users worldwide.',
    },
    {
      icon: FiZap,
      title: 'Instant Delivery',
      description: 'Most orders start within minutes and complete within hours, not days.',
    },
    {
      icon: FiHeadphones,
      title: '24/7 Support',
      description: 'Round-the-clock customer support via live chat and Telegram for instant help.',
    },
    {
      icon: FiRefreshCw,
      title: 'Auto Refills',
      description: '30-day auto-refill guarantee on all drop-protected services.',
    },
  ];

  const platforms = [
    { icon: FaInstagram, name: 'Instagram', color: 'from-pink-500 to-purple-500' },
    { icon: FaTiktok, name: 'TikTok', color: 'from-black to-gray-800' },
    { icon: FaYoutube, name: 'YouTube', color: 'from-red-600 to-red-700' },
    { icon: FaFacebookF, name: 'Facebook', color: 'from-blue-600 to-blue-700' },
  ];

  const steps = [
    {
      number: '01',
      title: 'Browse Services',
      description: 'Explore our 50+ services across all major social media platforms.',
    },
    {
      number: '02',
      title: 'Add to Cart',
      description: 'Select your desired quantity and add services to your cart.',
    },
    {
      number: '03',
      title: 'Make Payment',
      description: 'Upload your payment proof via bank transfer or crypto.',
    },
    {
      number: '04',
      title: 'Watch Growth',
      description: 'See your social media explode with real engagement!',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Particles Background */}
        <div className="particles">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="particle"
              style={{
                left: particle.left,
                animationDelay: particle.animationDelay,
                animationDuration: particle.animationDuration,
              }}
            />
          ))}
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium mb-6"
            >
              #1 SMM Panel Worldwide
            </motion.span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold font-montserrat mb-6"
          >
            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
              Cheapest & Fastest{' '}
            </span>
            <span className="gradient-text">SMM Services</span>
            <br />
            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Worldwide</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`text-lg md:text-xl mb-10 max-w-2xl mx-auto ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            500M+ Orders Delivered • Instant Start • Real Quality
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/services">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-neon px-8 py-4 text-lg font-semibold rounded-xl flex items-center gap-2 mx-auto"
              >
                Browse Services Now
                <FiArrowRight />
              </motion.button>
            </Link>
            <Link to="/cart">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-neon-outline px-8 py-4 text-lg font-semibold rounded-xl"
              >
                View Cart
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* Wave Background */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 150" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 150L60 140C120 130 240 110 360 93.3333C480 76.6667 600 63.3333 720 56.6667C840 50 960 50 1080 56.6667C1200 63.3333 1320 76.6667 1380 83.3333L1440 90L1440 150L1380 150C1320 150 1200 150 1080 150C960 150 840 150 720 150C600 150 480 150 360 150C240 150 120 150 60 150L0 150Z"
              className="fill-background"
            />
          </svg>
        </div>
      </section>

      {/* Counters Section */}
      <section className={`py-16 ${isDarkMode ? 'bg-neon-darker' : 'bg-gray-100'}`}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { value: counters.orders, label: 'Orders Completed', suffix: '+' },
              { value: counters.customers, label: 'Happy Customers', suffix: '+' },
              { value: counters.countries, label: 'Countries Served', suffix: '' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                  {stat.value.toLocaleString()}{stat.suffix}
                </div>
                <div className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-montserrat mb-4">
              <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                Why Choose{' '}
              </span>
              <span className="gradient-text">NeonBoost?</span>
            </h2>
            <p className={`max-w-2xl mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              We're the most reliable SMM panel with premium services and exceptional support
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card-neon p-6"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-blue-green flex items-center justify-center mb-4">
                  <feature.icon className="text-white" size={28} />
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {feature.title}
                </h3>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section className={`py-20 ${isDarkMode ? 'bg-neon-darker' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-montserrat mb-4">
              <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                Supported{' '}
              </span>
              <span className="gradient-text">Platforms</span>
            </h2>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-6">
            {platforms.map((platform, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center gap-3"
              >
                <div
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${platform.color} flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300`}
                >
                  <platform.icon className="text-white text-3xl" />
                </div>
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {platform.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-montserrat mb-4">
              <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                How{' '}
              </span>
              <span className="gradient-text">It Works</span>
            </h2>
            <p className={`max-w-2xl mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Get started in 4 simple steps and watch your social media grow
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="card-neon p-6 h-full">
                  <div className="text-6xl font-bold gradient-text mb-4 opacity-30">
                    {step.number}
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {step.title}
                  </h3>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <FiArrowRight className="text-primary" size={24} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className={`py-20 ${isDarkMode ? 'bg-neon-darker' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-montserrat mb-4">
              <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                What Our{' '}
              </span>
              <span className="gradient-text">Customers Say</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.slice(0, 6).map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card-neon p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {review.name}
                    </h4>
                    <p className="text-sm text-gray-500">{review.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <FiCheck
                      key={i}
                      className={i < Math.floor(review.rating) ? 'text-yellow-400' : 'text-gray-600'}
                      size={16}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-500">{review.rating}</span>
                </div>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{review.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-neon p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-blue-green opacity-5" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold font-montserrat mb-4">
                <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                  Ready to{' '}
                </span>
                <span className="gradient-text">Boost</span>
                <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                  {' '}Your Social Media?
                </span>
              </h2>
              <p className={`max-w-2xl mx-auto mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Join thousands of satisfied customers and take your social media presence to the next level
              </p>
              <Link to="/services">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-neon px-8 py-4 text-lg font-semibold rounded-xl"
                >
                  Get Started Now
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
