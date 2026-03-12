import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FiSearch, FiX, FiShoppingCart, FiMinus, FiPlus, FiZap, FiRefreshCw, FiShield, FiClock, FiStar, FiTrendingUp } from 'react-icons/fi';
import { FaInstagram, FaTiktok, FaYoutube, FaFacebookF, FaTwitter, FaTelegram, FaSpotify, FaSnapchat, FaDiscord, FaReddit, FaLinkedin, FaTwitch, FaVk } from 'react-icons/fa';
import { useStore, currencies } from '../store/useStore';
import { services as staticServices } from '../data/services';
import { toast } from 'react-toastify';

interface Service {
  id: string;
  name: string;
  category: string;
  platform: string;
  price: number;
  originalPrice?: number;
  min: number;
  max: number;
  description: string;
  features: string[];
  badge?: 'bestseller' | 'instant' | 'no-drop' | 'super-sale';
  speed: string;
  startTime: string;
  refill: boolean;
}

interface Platform {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  glow: string;
  activeGlow: string;
  accent: string;
}

const platforms: Platform[] = [
  { id: 'Instagram', name: 'Instagram', icon: FaInstagram, gradient: 'from-pink-500 to-purple-500', glow: 'shadow-pink-500/20', activeGlow: 'shadow-pink-500/60', accent: 'pink' },
  { id: 'TikTok', name: 'TikTok', icon: FaTiktok, gradient: 'from-cyan-400 to-pink-500', glow: 'shadow-cyan-500/20', activeGlow: 'shadow-cyan-500/60', accent: 'cyan' },
  { id: 'YouTube', name: 'YouTube', icon: FaYoutube, gradient: 'from-red-600 to-red-700', glow: 'shadow-red-500/20', activeGlow: 'shadow-red-500/60', accent: 'red' },
  { id: 'Facebook', name: 'Facebook', icon: FaFacebookF, gradient: 'from-blue-600 to-blue-700', glow: 'shadow-blue-500/20', activeGlow: 'shadow-blue-500/60', accent: 'blue' },
  { id: 'Twitter', name: 'Twitter', icon: FaTwitter, gradient: 'from-blue-400 to-blue-500', glow: 'shadow-blue-400/20', activeGlow: 'shadow-blue-400/60', accent: 'sky' },
  { id: 'Telegram', name: 'Telegram', icon: FaTelegram, gradient: 'from-blue-500 to-cyan-500', glow: 'shadow-cyan-500/20', activeGlow: 'shadow-cyan-500/60', accent: 'cyan' },
  { id: 'Spotify', name: 'Spotify', icon: FaSpotify, gradient: 'from-green-500 to-emerald-500', glow: 'shadow-green-500/20', activeGlow: 'shadow-green-500/60', accent: 'green' },
  { id: 'Discord', name: 'Discord', icon: FaDiscord, gradient: 'from-indigo-600 to-purple-600', glow: 'shadow-indigo-500/20', activeGlow: 'shadow-indigo-500/60', accent: 'indigo' },
  { id: 'LinkedIn', name: 'LinkedIn', icon: FaLinkedin, gradient: 'from-blue-700 to-blue-800', glow: 'shadow-blue-700/20', activeGlow: 'shadow-blue-700/60', accent: 'blue' },
  { id: 'Twitch', name: 'Twitch', icon: FaTwitch, gradient: 'from-purple-600 to-purple-700', glow: 'shadow-purple-500/20', activeGlow: 'shadow-purple-500/60', accent: 'purple' },
];

const Services = () => {
  const { t } = useTranslation();
  const { isDarkMode, addToCart, currency, convertPrice } = useStore();
  const [services] = useState(staticServices);
  const [loading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [modalQuantity, setModalQuantity] = useState(100);
  const [modalLink, setModalLink] = useState('');
  const [accountNotPrivate, setAccountNotPrivate] = useState(false);

  const formatPrice = (priceGEL: number) => {
    const converted = convertPrice(priceGEL);
    return `${currencies[currency].symbol}${converted.toFixed(2)}`;
  };

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesPlatform = !selectedPlatform || service.platform === selectedPlatform;
      const matchesSearch =
        !searchQuery ||
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesPlatform && matchesSearch;
    });
  }, [selectedPlatform, searchQuery, services]);

  const getPlatformCount = (platformId: string) => {
    return services.filter(s => s.platform === platformId).length;
  };

  const getPlatformData = (platformId: string) => {
    return platforms.find(p => p.id === platformId) || platforms[0];
  };

  const handleAddToCart = () => {
    if (!selectedService) return;
    if (!modalLink.trim()) {
      toast.error(t('servicesPage.enterLink'));
      return;
    }
    if (modalQuantity < selectedService.min || modalQuantity > selectedService.max) {
      toast.error(t('servicesPage.quantityMustBe', { min: selectedService.min, max: selectedService.max }));
      return;
    }
    const requiresCheckbox = ['Facebook', 'TikTok', 'Instagram', 'YouTube'].includes(selectedService.platform);
    if (requiresCheckbox && !accountNotPrivate) {
      toast.error(t('servicesPage.confirmNotPrivate'));
      return;
    }
    addToCart(selectedService, modalQuantity, modalLink, accountNotPrivate);
    toast.success(`${selectedService.name} ${t('servicesPage.addedToCart')}`);
    setSelectedService(null);
    setModalQuantity(100);
    setModalLink('');
    setAccountNotPrivate(false);
  };

  const openModal = (service: Service) => {
    setSelectedService(service);
    setModalQuantity(service.min);
    setModalLink('');
    setAccountNotPrivate(false);
  };

  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case 'bestseller': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'instant': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'no-drop': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'sale': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'super-sale': return 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-lg shadow-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPlatformGradient = (platform: string) => {
    const p = getPlatformData(platform);
    return p.gradient;
  };

  const getAccentColor = (platform: string) => {
    const p = getPlatformData(platform);
    switch (p.accent) {
      case 'pink': return 'text-pink-400 bg-pink-500/10 border-pink-500/30';
      case 'red': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'blue': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'sky': return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
      case 'cyan': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'green': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'indigo': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
      case 'purple': return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'gray': return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
      default: return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold font-montserrat mb-4">
            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}></span>
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">{t('servicesPage.ourServices')}</span>
          </h1>
          <p className={`max-w-2xl mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('servicesPage.selectPlatform')}
          </p>
        </div>

        {/* Platform Logo Filter */}
        <div className="mb-10">
          <h2 className={`text-center text-lg font-medium mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('servicesPage.choosePlatform')}
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {platforms.slice(0, 8).map((platform) => {
              const isActive = selectedPlatform === platform.id;
              const count = getPlatformCount(platform.id);
              
              return (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(isActive ? null : platform.id)}
                  className={`group flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? `bg-gradient-to-r ${platform.gradient} ${platform.activeGlow} scale-105`
                      : isDarkMode
                      ? 'bg-white/5 border border-white/10 hover:border-white/30 hover:scale-102'
                      : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg hover:scale-102'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    isActive 
                      ? 'bg-white/20' 
                      : `bg-gradient-to-r ${platform.gradient}`
                  }`}>
                    <platform.icon className="text-lg text-white" />
                  </div>
                  <span className={`text-xs font-medium ${isActive ? 'text-white' : isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {platform.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t('services.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-xl transition-all duration-300 outline-none ${
                isDarkMode 
                  ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500/50' 
                  : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-500'
              }`}
            />
          </div>
        </div>

        {/* Selected Platform Clear */}
        {selectedPlatform && (
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setSelectedPlatform(null)}
              className="px-4 py-2 rounded-full bg-white/10 text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2"
            >
              {t('services.clearFilter')}
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('common.loading')}</p>
          </div>
        )}

        {/* Services Grid - Premium Cards */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredServices.map((service) => {
              const platformData = getPlatformData(service.platform);
              const accentClass = getAccentColor(service.platform);
              
              return (
                <div
                  key={service.id}
                  onClick={() => openModal(service)}
                  className={`group relative overflow-hidden rounded-2xl border cursor-pointer transition-all duration-300 hover:-translate-y-2 ${
                    isDarkMode 
                      ? 'bg-gray-900/80 border-white/10 hover:border-white/30' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Gradient Top Border */}
                  <div className={`h-1 bg-gradient-to-r ${platformData.gradient}`} />
                  
                  <div className="p-5">
                    {/* Badge Row */}
                    <div className="flex items-center justify-between mb-3">
                      {service.badge && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-md border ${getBadgeColor(service.badge)}`}>
                          {service.badge === 'bestseller' && <FiStar size={10} />}
                          {service.badge === 'instant' && <FiZap size={10} />}
                          {service.badge === 'no-drop' && <FiShield size={10} />}
                          {service.badge === 'sale' && <FiTrendingUp size={10} />}
                          {service.badge === 'super-sale' && <FiTrendingUp size={10} />}
                          {service.badge === 'super-sale' ? '25% OFF' : service.badge === 'sale' ? 'SALE' : service.badge}
                        </span>
                      )}
                      <div className={`ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${accentClass}`}>
                        <platformData.icon size={10} />
                        {service.platform}
                      </div>
                    </div>

                    {/* Service Name with Logo */}
                    <div className="flex items-start gap-3 mb-1">
                      <div className={`w-8 h-8 rounded-lg flex-shrink-0 bg-gradient-to-r ${platformData.gradient} flex items-center justify-center`}>
                        <platformData.icon className="text-white text-sm" />
                      </div>
                      <h3 className={`font-bold line-clamp-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {service.name}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 ml-11 mb-4">{service.category}</p>

                    {/* Price */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                          {formatPrice(service.price)}
                        </span>
                        {service.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(service.originalPrice)}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">/ 1000</span>
                      </div>
                      {service.originalPrice && service.badge !== 'super-sale' && (
                        <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-semibold rounded-md">
                          -20%
                        </div>
                      )}
                    </div>

                    {/* Stats Grid */}
                    <div className={`grid grid-cols-2 gap-2 mb-4 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <div className={`flex items-center gap-1.5 p-2 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <FiClock size={12} className="text-purple-400" />
                        <span>{service.startTime}</span>
                      </div>
                      <div className={`flex items-center gap-1.5 p-2 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                        {service.refill ? (
                          <>
                            <FiRefreshCw size={12} className="text-green-400" />
                            <span>Refill</span>
                          </>
                        ) : (
                          <>
                            <FiShield size={12} className="text-gray-400" />
                            <span>No Refill</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Quantity Range */}
                    <div className={`text-xs mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      <FiTrendingUp size={12} className="text-cyan-400" />
                      <span>{service.min.toLocaleString()} - {service.max.toLocaleString()}</span>
                    </div>

                    {/* Action Button */}
                    <button
                      className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                        isDarkMode 
                          ? `bg-gradient-to-r ${platformData.gradient} text-white opacity-90 hover:opacity-100` 
                          : `bg-gradient-to-r ${platformData.gradient} text-white`
                      }`}
                    >
                      {t('services.viewDetails')}
                    </button>
                  </div>

                  {/* Hover Glow Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${platformData.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`} />
                </div>
              );
            })}
          </div>
        )}

        {/* Empty States */}
        {!loading && filteredServices.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <FiSearch className="text-gray-400" size={32} />
            </div>
            <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('services.noServices')}
            </p>
            <button 
              onClick={() => {setSelectedPlatform(null); setSearchQuery('');}}
              className="mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            >
              {t('servicesPage.clearFilters')}
            </button>
          </div>
        )}
      </div>

      {/* Service Modal */}
      {selectedService && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedService(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl ${
              isDarkMode ? 'bg-gray-900' : 'bg-white'
            } border ${isDarkMode ? 'border-white/10' : 'border-gray-200'} shadow-2xl`}
          >
            {/* Gradient Header */}
            <div className={`h-2 bg-gradient-to-r ${getPlatformGradient(selectedService.platform)}`} />
            
            <button
              onClick={() => setSelectedService(null)}
              className={`absolute top-6 right-4 p-2 rounded-full transition-colors ${
                isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
              }`}
            >
              <FiX size={24} />
            </button>

            <div className="p-6 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-sm px-3 py-1 rounded-full bg-gradient-to-r ${getPlatformGradient(selectedService.platform)} text-white font-medium`}>
                  {selectedService.platform}
                </span>
                {selectedService.badge && (
                  <span className={`text-xs px-2 py-1 rounded-md border ${getBadgeColor(selectedService.badge)}`}>
                    {selectedService.badge}
                  </span>
                )}
              </div>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedService.name}
              </h2>
            </div>

            <div className={`px-6 pb-4 space-y-0 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <div className="flex justify-between py-3 border-b border-gray-700/50">
                <span className="text-gray-500">{t('servicesPage.linkType')}</span>
                <span className="text-purple-400 font-medium text-sm">
                  {selectedService.platform}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-700/50">
                <span className="text-gray-500">{t('servicesPage.location')}</span>
                <span>{t('servicesPage.worldwide')}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-700/50">
                <span className="text-gray-500">{t('servicesPage.quality')}</span>
                <span>{t('servicesPage.real100')}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-700/50">
                <span className="text-gray-500">{t('servicesPage.startTime')}</span>
                <span>{selectedService.startTime}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-700/50">
                <span className="text-gray-500">{t('servicesPage.speed')}</span>
                <span>{selectedService.speed}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-gray-500">{t('servicesPage.refill')}</span>
                <span className={selectedService.refill ? 'text-green-400' : 'text-red-400'}>
                  {selectedService.refill ? `✅ ${t('servicesPage.days30')}` : `❌ ${t('servicesPage.no')}`}
                </span>
              </div>
            </div>

            <div className="px-6 pb-4">
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {selectedService.description}
              </p>
            </div>

            <div className="px-6 pb-4">
              <label className={`block mb-2 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('services.quantity')}
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setModalQuantity(Math.max(selectedService.min, modalQuantity - 100))}
                  className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90"
                >
                  <FiMinus />
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  value={modalQuantity}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setModalQuantity(value ? Math.min(selectedService.max, parseInt(value)) : 0);
                  }}
                  onBlur={() => {
                    if (!modalQuantity || modalQuantity < selectedService.min) {
                      setModalQuantity(selectedService.min);
                    }
                  }}
                  className={`flex-1 px-4 py-3 rounded-xl text-center font-bold outline-none ${
                    isDarkMode 
                      ? 'bg-white/10 border border-white/20 text-white' 
                      : 'bg-gray-100 border border-gray-200 text-gray-900'
                  }`}
                />
                <button
                  onClick={() => setModalQuantity(Math.min(selectedService.max, modalQuantity + 100))}
                  className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90"
                >
                  <FiPlus />
                </button>
              </div>
              <p className="text-sm mt-2 text-gray-500">
                {t('services.min')}: {selectedService.min.toLocaleString()} | {t('services.max')}: {selectedService.max.toLocaleString()}
              </p>
            </div>

            <div className="px-6 pb-4">
              <label className={`block mb-2 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {selectedService.platform === 'Discord'
                ? 'Enter your Gmail'
                : t('servicesPage.yourLink', { platform: selectedService.platform })}
              </label>
              <input
                type="text"
                value={modalLink}
                onChange={(e) => setModalLink(e.target.value)}
                placeholder={t('services.enterLink')}
                className={`w-full px-4 py-3 rounded-xl outline-none ${
                  isDarkMode 
                    ? 'bg-white/10 border border-white/20 text-white placeholder-gray-500' 
                    : 'bg-gray-100 border border-gray-200 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>

            {['Facebook', 'TikTok', 'Instagram', 'YouTube'].includes(selectedService.platform) && (
              <div className="px-6 pb-4">
                <label className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer ${
                  isDarkMode ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200'
                }`}>
                  <input
                    type="checkbox"
                    checked={accountNotPrivate}
                    onChange={(e) => setAccountNotPrivate(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded"
                  />
                  <div>
                    <p className={`font-medium text-sm ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                      {t('services.accountNotPrivate')}
                    </p>
                  </div>
                </label>
              </div>
            )}

            <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-gray-700/50">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  {formatPrice((selectedService.price * modalQuantity) / 1000)}
                </p>
              </div>
              <button
                onClick={handleAddToCart}
                className="px-8 py-3 rounded-xl flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:opacity-90 shadow-lg"
              >
                <FiShoppingCart />
                {t('services.addToCartButton')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
