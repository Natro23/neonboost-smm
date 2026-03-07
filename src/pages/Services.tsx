import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiShoppingCart, FiMinus, FiPlus } from 'react-icons/fi';
import { useStore } from '../store/useStore';
import { services as allServices, categories, Service } from '../data/services';
import { toast } from 'react-toastify';

const Services = () => {
  const { isDarkMode, addToCart } = useStore();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [modalQuantity, setModalQuantity] = useState(100);
  const [modalLink, setModalLink] = useState('');

  // Filter services
  const filteredServices = useMemo(() => {
    return allServices.filter((service) => {
      const matchesCategory =
        selectedCategory === 'All' || service.platform === selectedCategory;
      const matchesSearch =
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Handle add to cart
  const handleAddToCart = () => {
    if (!selectedService) return;

    if (!modalLink.trim()) {
      toast.error('Please enter your link!');
      return;
    }

    if (modalQuantity < selectedService.min || modalQuantity > selectedService.max) {
      toast.error(`Quantity must be between ${selectedService.min} and ${selectedService.max}!`);
      return;
    }

    addToCart(selectedService, modalQuantity, modalLink);
    toast.success(`${selectedService.name} added to cart!`);
    setSelectedService(null);
    setModalQuantity(100);
    setModalLink('');
  };

  // Open modal with service
  const openModal = (service: Service) => {
    setSelectedService(service);
    setModalQuantity(service.min);
    setModalLink('');
  };

  // Get badge color
  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case 'bestseller':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'instant':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'no-drop':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold font-montserrat mb-4">
            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Our </span>
            <span className="gradient-text">Services</span>
          </h1>
          <p className={`max-w-2xl mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Browse our 50+ high-quality SMM services across all major platforms
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-primary text-white shadow-neon-blue'
                    : isDarkMode
                    ? 'bg-white/5 text-gray-300 hover:bg-white/10'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-neon pl-12"
              />
            </div>
          </div>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card-neon p-5 cursor-pointer"
              onClick={() => openModal(service)}
            >
              {/* Badge */}
              {service.badge && (
                <span
                  className={`inline-block px-2 py-1 text-xs font-semibold rounded-md border ${getBadgeColor(service.badge)} mb-3`}
                >
                  {service.badge === 'bestseller' && '⭐ Bestseller'}
                  {service.badge === 'instant' && '⚡ Instant'}
                  {service.badge === 'no-drop' && '🛡️ No Drop'}
                </span>
              )}

              {/* Service Name */}
              <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {service.name}
              </h3>

              {/* Platform & Category */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                  {service.platform}
                </span>
                <span className="text-xs text-gray-500">{service.category}</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-2xl font-bold gradient-text">${service.price}</span>
                <span className="text-sm text-gray-500">/ 1000</span>
              </div>

              {/* Min/Max */}
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Min: {service.min.toLocaleString()} | Max: {service.max.toLocaleString()}
              </div>

              {/* Quick Add Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-4 py-2 bg-primary/20 text-primary rounded-lg font-medium hover:bg-primary/30 transition-colors"
              >
                View Details
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredServices.length === 0 && (
          <div className="text-center py-16">
            <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No services found matching your criteria
            </p>
          </div>
        )}
      </div>

      {/* Service Modal */}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedService(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg rounded-2xl p-6 ${
                isDarkMode ? 'bg-neon-darker' : 'bg-white'
              } border ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedService(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10"
              >
                <FiX size={24} />
              </button>

              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm px-2 py-1 rounded-full bg-primary/20 text-primary">
                    {selectedService.platform}
                  </span>
                  {selectedService.badge && (
                    <span
                      className={`text-xs px-2 py-1 rounded-md border ${getBadgeColor(selectedService.badge)}`}
                    >
                      {selectedService.badge === 'bestseller' && '⭐ Bestseller'}
                      {selectedService.badge === 'instant' && '⚡ Instant'}
                      {selectedService.badge === 'no-drop' && '🛡️ No Drop'}
                    </span>
                  )}
                </div>
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedService.name}
                </h2>
              </div>

              {/* Details */}
              <div className={`space-y-3 mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span>Link</span>
                  <span className="text-primary">
                    {selectedService.platform === 'TikTok' && 'Tiktok Username/Video Link'}
                    {selectedService.platform === 'Instagram' && 'Instagram Username/Post Link'}
                    {selectedService.platform === 'YouTube' && 'YouTube Video/Channel Link'}
                    {selectedService.platform === 'Facebook' && 'Facebook Page/Post Link'}
                    {selectedService.platform === 'Twitter' && 'Twitter Username/Tweet Link'}
                    {selectedService.platform === 'Telegram' && 'Telegram Channel/Group Link'}
                    {selectedService.platform === 'Spotify' && 'Spotify Track/Artist Link'}
                    {['LinkedIn', 'Snapchat', 'Discord', 'Twitch', 'Reddit', 'Kwai', 'VK', 'Quora'].includes(selectedService.platform) && `${selectedService.platform} Link`}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span>Location</span>
                  <span>Worldwide 🌍</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span>Quality</span>
                  <span>100% Real Accounts</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span>Start Time</span>
                  <span>{selectedService.startTime}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span>Speed</span>
                  <span>{selectedService.speed}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Refill</span>
                  <span className={selectedService.refill ? 'text-green-400' : 'text-red-400'}>
                    {selectedService.refill ? '✅ Available (30 Days)' : '❌ No Refill'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {selectedService.description}
              </p>

              {/* Quantity Input */}
              <div className="mb-4">
                <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setModalQuantity(Math.max(selectedService.min, modalQuantity - 100))}
                    className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30"
                  >
                    <FiMinus />
                  </button>
                  <input
                    type="number"
                    value={modalQuantity}
                    onChange={(e) => setModalQuantity(Math.min(selectedService.max, Math.max(selectedService.min, parseInt(e.target.value) || selectedService.min)))}
                    className="input-neon text-center flex-1"
                    min={selectedService.min}
                    max={selectedService.max}
                  />
                  <button
                    onClick={() => setModalQuantity(Math.min(selectedService.max, modalQuantity + 100))}
                    className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30"
                  >
                    <FiPlus />
                  </button>
                </div>
                <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Min: {selectedService.min.toLocaleString()} | Max: {selectedService.max.toLocaleString()}
                </p>
              </div>

              {/* Link Input */}
              <div className="mb-6">
                <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Your {selectedService.platform} Link
                </label>
                <input
                  type="text"
                  value={modalLink}
                  onChange={(e) => setModalLink(e.target.value)}
                  placeholder={`Enter your ${selectedService.platform} link...`}
                  className="input-neon"
                />
              </div>

              {/* Price & Add to Cart */}
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total</p>
                  <p className="text-3xl font-bold gradient-text">
                    ${((selectedService.price * modalQuantity) / 1000).toFixed(2)}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddToCart}
                  className="btn-neon px-8 py-3 rounded-xl flex items-center gap-2"
                >
                  <FiShoppingCart />
                  Add to Cart
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Services;
