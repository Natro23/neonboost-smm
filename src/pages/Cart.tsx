import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiTrash2, FiUpload, FiCheck, FiAlertCircle, FiTag, FiX } from 'react-icons/fi';
import { useStore, currencies, Currency } from '../store/useStore';
import { bankAccounts } from '../data/services';
import { toast } from 'react-toastify';
import NitroConfirmationModal from '../components/NitroConfirmationModal';
import bogLogo from '../assets/banks/bog.png'
import tbcLogo from '../assets/banks/tbc.png'

const API_URL = import.meta.env.VITE_API_URL || 'https://neonboost-backend.onrender.com';


const Cart = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { 
    isDarkMode, cart, removeFromCart, updateQuantity, updateLink, updateAccountNotPrivate, 
    updateNitroConfirmed, getCartTotal, clearCart, setOrderId, 
    currency, setCurrency, convertPrice,
    appliedPromo, promoDiscount, applyPromo, removePromo
  } = useStore();
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [showPromoError, setShowPromoError] = useState(false);
  const [showNitroModal, setShowNitroModal] = useState(false);
  const [showMinOrderModal, setShowMinOrderModal] = useState(false);
  const [pendingNitroService, setPendingNitroService] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if cart has Discord Nitro that needs confirmation
  const hasUnconfirmedNitro = cart.some(item => 
    item.service.id === 'discord-nitro-3m' && !item.nitroConfirmed
  );

  // Show modal when Nitro is added but not confirmed
  useEffect(() => {
    if (hasUnconfirmedNitro && !showNitroModal) {
      setShowNitroModal(true);
    }
  }, [cart, hasUnconfirmedNitro]);

  // Handle nitro confirmation
  const handleNitroConfirm = () => {
    const nitroItem = cart.find(item => item.service.id === 'discord-nitro-3m');
    if (nitroItem) {
      updateNitroConfirmed(nitroItem.service.id, true);
    }
    setShowNitroModal(false);
    setPendingNitroService(null);
  };

  // Handle nitro cancellation
  const handleNitroCancel = () => {
    // Remove the unconfirmed nitro from cart
    const nitroItem = cart.find(item => item.service.id === 'discord-nitro-3m');
    if (nitroItem) {
      removeFromCart(nitroItem.service.id);
    }
    setShowNitroModal(false);
    setPendingNitroService(null);
  };

  // Handle promo code submission
  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    const result = await applyPromo(promoInput);
    if (result.success) {
      toast.success(t('cartPage.promoApplied', { discount: result.discount ?? promoDiscount }));
      setPromoInput('');
      setShowPromoError(false);
    } else {
      setShowPromoError(true);
      if (result.message === 'code_expired') {
        toast.error(t('cartPage.promoExpired') || 'Promo code has expired');
      } else if (result.message === 'network_error') {
        toast.error(t('cartPage.promoNetworkError') || 'Could not validate code. Try again.');
      } else {
        toast.error(t('cartPage.invalidPromo'));
      }
    }
  };

  // Calculate totals with currency and discount
  const subtotal = getCartTotal();
  const discountAmount = subtotal * (promoDiscount / 100);
  const total = subtotal - discountAmount;
  
  const formatPrice = (priceUSD: number) => {
    const converted = convertPrice(priceUSD);
    return `${currencies[currency].symbol}${converted.toFixed(2)}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('cartPage.fileSizeError'));
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(t('cartPage.imageError'));
        return;
      }
      setPaymentProof(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitOrder = async () => {
    // Validation
    if (cart.length === 0) {
      toast.error(t('cartPage.cartEmpty'));
      return;
    }

    // Check minimum order amount (3 GEL)
    const MIN_ORDER_GEL = 3;
    if (subtotal < MIN_ORDER_GEL) {
      setShowMinOrderModal(true);
      return;
    }

    // Check if all links are provided
    const missingLinks = cart.filter(item => !item.link.trim());
    if (missingLinks.length > 0) {
      toast.error(t('cartPage.provideLinks'));
      return;
    }

    // Check if Facebook/TikTok/Instagram/YouTube accounts are not private
    const privateAccounts = cart.filter(item => 
      ['Facebook', 'TikTok', 'Instagram', 'YouTube'].includes(item.service.platform) && !item.accountNotPrivate
    );
    if (privateAccounts.length > 0) {
      toast.error(t('cartPage.confirmNotPrivate'));
      return;
    }

    // Check if Discord Nitro has been confirmed
    const unconfirmedNitro = cart.filter(item => 
      item.service.id === 'discord-nitro-3m' && !item.nitroConfirmed
    );
    if (unconfirmedNitro.length > 0) {
      toast.error(t('cartPage.confirmNitro') || 'Please confirm the Discord Nitro requirements');
      setShowNitroModal(true);
      return;
    }

    if (!selectedBank) {
      toast.error(t('cartPage.selectPayment'));
      return;
    }

    // Require payment proof for all payment methods
    if (!paymentProof) {
      toast.error(t('cartPage.uploadScreenshot'));
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate order ID
      const orderId = Math.random().toString(36).substring(2, 10).toUpperCase();
      setOrderId(orderId);

      // Prepare form data
      const formData = new FormData();
      formData.append('orderId', orderId);
      formData.append('items', JSON.stringify(cart.map(item => ({
        serviceId: item.service.id,
        serviceName: item.service.name,
        quantity: item.quantity,
        link: item.link,
        price: item.service.price,
        total: item.service.min === 1 && item.service.max === 1 ? item.service.price * item.quantity : (item.service.price * item.quantity) / 1000,
      }))));
      const originalTotal = getCartTotal();
      const finalTotal = originalTotal - discountAmount;
      formData.append('total', finalTotal.toString());
      formData.append('originalTotal', originalTotal.toString());
      formData.append('discountAmount', discountAmount.toString());
      if (appliedPromo) formData.append('promoCode', appliedPromo);
      formData.append('bank', selectedBank);
      formData.append('paymentProof', paymentProof);

      // Submit order to backend API
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit order');
      }

      const result = await response.json();

      // Also save to localStorage as backup
      const orderData = {
        orderId,
        items: cart.map(item => ({
          serviceId: item.service.id,
          serviceName: item.service.name,
          quantity: item.quantity,
          link: item.link,
          price: item.service.price,
          total: item.service.min === 1 && item.service.max === 1 ? item.service.price * item.quantity : (item.service.price * item.quantity) / 1000,
        })),
        total: getCartTotal(),
        bank: selectedBank,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      
      // Save to localStorage
      const existingOrders = JSON.parse(localStorage.getItem('neonboost-orders') || '[]');
      existingOrders.push(orderData);
      localStorage.setItem('neonboost-orders', JSON.stringify(existingOrders));

      toast.success(t('cartPage.orderSuccess'));
      clearCart();
      navigate('/');
    } catch (error) {
      toast.error(t('cartPage.orderFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold font-montserrat mb-8 text-center">
            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{t('cart.yourCart')}</span>
          </h1>

          {cart.length === 0 ? (
            <div className="text-center py-16">
              <p className={`text-xl mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('cart.empty')}
              </p>
              <Link to="/services">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-neon px-8 py-3 rounded-xl"
                >
                  {t('cart.browseServices')}
                </motion.button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item) => (
                  <motion.div
                    key={item.service.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="card-neon p-4"
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Service Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                            {item.service.platform}
                          </span>
                        </div>
                        <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {item.service.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">
                        {formatPrice(item.service.price)}{!(item.service.min === 1 && item.service.max === 1) && ' / 1000'}
                        </p>

                        {/* Link Input */}
                        <div className="mb-3">
                          <label className={`block text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('cart.link')}
                          </label>
                          <input
                            type="text"
                            value={item.link}
                            onChange={(e) => updateLink(item.service.id, e.target.value)}
                            placeholder={t('cartPage.enterLink', { platform: item.service.platform })}
                            className="input-neon text-sm"
                          />
                        </div>

                        {/* Account Not Private Checkbox for Facebook/TikTok/Instagram/YouTube */}
                        {['Facebook', 'TikTok', 'Instagram', 'YouTube'].includes(item.service.platform) && (
                          <div className="mb-3">
                            <label className={`flex items-center gap-2 cursor-pointer text-sm ${
                              item.accountNotPrivate 
                                ? (isDarkMode ? 'text-green-400' : 'text-green-600')
                                : (isDarkMode ? 'text-yellow-400' : 'text-yellow-600')
                            }`}>
                              <input
                                type="checkbox"
                                checked={item.accountNotPrivate}
                                onChange={(e) => updateAccountNotPrivate(item.service.id, e.target.checked)}
                                className="w-4 h-4 rounded"
                              />
                              {t('cart.accountNotPrivate')}
                            </label>
                          </div>
                        )}
                      </div>

                      {/* Quantity & Price */}
                      <div className="flex md:flex-col items-center justify-between md:justify-start gap-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.service.id, Math.max(item.service.min, item.quantity - 100))}
                            className="p-1 rounded bg-primary/20 text-primary hover:bg-primary/30"
                          >
                            -
                          </button>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={item.quantity}
                            onChange={(e) => {
                              // Allow typing but enforce max limit
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              if (value === '') {
                                updateQuantity(item.service.id, 0);
                              } else {
                                const numValue = parseInt(value, 10);
                                if (!isNaN(numValue)) {
                                  // Cap at max while typing
                                  updateQuantity(item.service.id, Math.min(item.service.max, numValue));
                                }
                              }
                            }}
                            onBlur={() => {
                              // Validate on blur - if empty or invalid, set to min
                              const currentItem = cart.find(i => i.service.id === item.service.id);
                              const qty = currentItem?.quantity || 0;
                              if (qty === 0 || isNaN(qty)) {
                                updateQuantity(item.service.id, item.service.min);
                              } else if (qty < item.service.min) {
                                updateQuantity(item.service.id, item.service.min);
                              }
                            }}
                            className="w-20 text-center bg-transparent border border-gray-600 rounded px-2 py-1"
                          />
                          <button
                            onClick={() => updateQuantity(item.service.id, Math.min(item.service.max, item.quantity + 100))}
                            className="p-1 rounded bg-primary/20 text-primary hover:bg-primary/30"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{t('cart.subtotal')}</p>
                          <p className="text-xl font-bold gradient-text">
                          {formatPrice(item.service.min === 1 && item.service.max === 1 ? item.service.price * item.quantity : (item.service.price * item.quantity) / 1000)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.service.id)}
                          className="p-2 rounded-lg text-red-400 hover:bg-red-400/10"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="-mt-12">
                <div className="card-neon p-6 sticky top-12">
                  <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {t('cart.orderSummary')}
                  </h2>

                  {/* Currency Selector */}
                  <div className="mb-4">
                    <label className={`block text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('currency.usd')}
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as Currency)}
                      className="input-neon w-full"
                    >
                      {Object.entries(currencies).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value.symbol} {key} - {value.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Promo Code Input */}
                  <div className="mb-4">
                    <label className={`block text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('cart.promoCode')}
                    </label>
                    {appliedPromo ? (
                      <div className={`flex items-center justify-between p-3 rounded-lg ${
                        isDarkMode ? 'bg-green-500/20' : 'bg-green-50'
                      }`}>
                        <div>
                          <span className={`font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                            {appliedPromo}
                          </span>
                          <span className={`text-sm ml-2 ${isDarkMode ? 'text-green-400/70' : 'text-green-500'}`}>
                            {promoDiscount}% off
                          </span>
                        </div>
                        <button
                          onClick={removePromo}
                          className="p-1 hover:bg-green-500/30 rounded"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          placeholder={t('cart.enterPromoCode')}
                          className="input-neon flex-1 text-sm"
                        />
                        <button
                          onClick={handleApplyPromo}
                          className="px-3 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30"
                        >
                          <FiTag />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className={`space-y-2 mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div className="flex justify-between">
                      <span>{t('cart.items')}</span>
                      <span>{cart.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('cart.quantity')}</span>
                      <span>{cart.reduce((sum, item) => sum + item.quantity, 0).toLocaleString()}</span>
                    </div>
                    {promoDiscount > 0 && (
                      <div className="flex justify-between text-green-400">
                        <span>{t('cart.discount')} ({appliedPromo})</span>
                        <span>-{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    <div className={`border-t pt-2 mt-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex justify-between text-xl font-bold">
                        <span>{t('cart.grandTotal')}</span>
                        <span className="gradient-text">{formatPrice(total)}</span>
                      </div>
                      {subtotal < 3 && (
                        <div className={`mt-2 p-2 rounded-lg flex items-center gap-2 text-xs ${isDarkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'}`}>
                          <FiAlertCircle className="shrink-0" />
                          <span>{t('cartPage.minimumOrder')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Section */}
                  <div className="mb-6">
                    <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {t('cart.selectPaymentMethod')}
                    </h3>
                    <div className="space-y-2">
                      {bankAccounts.map((bank) => (
                        <label
                          key={bank.name}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                            selectedBank === bank.name
                              ? 'bg-primary/20 border border-primary'
                              : isDarkMode
                              ? 'bg-white/5 border border-transparent hover:border-primary/30'
                              : 'bg-gray-50 border border-transparent hover:border-primary/30'
                          }`}
                        >
                          <input
                            type="radio"
                            name="bank"
                            value={bank.name}
                            checked={selectedBank === bank.name}
                            onChange={(e) => {
                              setSelectedBank(e.target.value);
                              setPaymentProof(null);
                              setProofPreview(null);
                              const bank = bankAccounts.find(b => b.name === e.target.value);
                              if (bank?.account) {
                                navigator.clipboard.writeText(bank.account).then(() => {
                                  toast.success(`📋 ${bank.account} copied!`);
                                });
                              }
                            }}
                            className="hidden"
                          />
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                            style={{ backgroundColor: bank.color || '#6b7280' }}
                          >
                            {bank.logo ? (
                              <img src={bank.logo} alt={bank.name} className="w-8 h-8 object-contain" />
                            ) : (
                              bank.name.substring(0, 2)
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {bank.name}
                            </p>
                            <p className="text-xs text-gray-500">{bank.account}</p>
                          </div>
                          {selectedBank === bank.name && (
                            <FiCheck className="text-primary" />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Bank Transfer Instructions */}
                  {selectedBank && !bankAccounts.find(b => b.name === selectedBank)?.isPaypal && (
                    <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'}`}>
                      <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                        {t('cart.bankTransferInstructions')}
                      </h4>
                      <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('cart.sendPaymentTo')}: <span className="font-mono font-bold">{bankAccounts.find(b => b.name === selectedBank)?.account}</span>
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                        ⚠️ {t('cart.uploadScreenshotWarning')}
                      </p>
                    </div>
                  )}

                  {/* PayPal Friends & Family Instructions */}
                  {selectedBank && bankAccounts.find(b => b.name === selectedBank)?.isPaypal && (() => {
                    const paypalEmail = bankAccounts.find(b => b.name === selectedBank)?.account || '';
                    // Always convert to USD for PayPal regardless of display currency
                    const totalInUSD = (total / (currencies[currency].rate));
                    const paypalAmount = totalInUSD.toFixed(2);
                    return (
                      <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/30 border border-blue-500/40' : 'bg-blue-50 border border-blue-200'}`}>
                        <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                          PayPal Friends &amp; Family
                        </h4>
                        <p className={`text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Send <span className="font-bold">${paypalAmount} USD</span> as <span className="font-bold">Friends &amp; Family</span> to:
                        </p>
                        <p className={`text-sm font-mono font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {paypalEmail}
                        </p>
                        <a
                          href={`https://www.paypal.me/lekonat1/${paypalAmount}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white text-sm"
                          style={{ backgroundColor: '#009cde' }}
                        >
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.59 3.025-2.566 6.082-8.558 6.082H9.828l-1.175 7.444h3.767c.46 0 .85-.334.922-.788l.038-.196.733-4.648.047-.255c.073-.454.462-.788.922-.788h.58c3.76 0 6.703-1.528 7.561-5.948.36-1.847.174-3.39-.001-4.666z"/></svg>
                          Send via PayPal
                        </a>
                        <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          ⚠️ On PayPal, make sure to select <strong>Friends &amp; Family</strong>
                        </p>
                        <p className={`text-xs mt-3 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                          ⚠️ Make sure to choose <strong>Friends &amp; Family</strong> — NOT "Goods &amp; Services".
                        </p>
                      </div>
                    );
                  })()}

                  {/* File Upload */}
                  {selectedBank && (
                  <div className="mb-6">
                    <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {t('cart.uploadPaymentScreenshot')}
                    </h3>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                        isDarkMode
                          ? 'border-gray-600 hover:border-primary'
                          : 'border-gray-300 hover:border-primary'
                      }`}
                    >
                      {proofPreview ? (
                        <div className="relative">
                          <img
                            src={proofPreview}
                            alt="Payment proof preview"
                            className="max-h-40 mx-auto rounded-lg"
                          />
                          <p className="mt-2 text-sm text-green-400 flex items-center justify-center gap-1">
                            <FiCheck /> {t('cart.fileUploaded')}
                          </p>
                        </div>
                      ) : (
                        <>
                          <FiUpload className={`mx-auto mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                            {t('cart.clickToUpload')}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">JPG/PNG, max 5MB</p>
                        </>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                  )}

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmitOrder}
                    disabled={isSubmitting}
                    className="w-full btn-neon py-4 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {t('cart.processing')}
                      </>
                    ) : (
                      <>
                        <FiCheck />
                        {t('cart.placeOrder')}
                      </>
                    )}
                  </motion.button>

                  {/* Info */}
                  {selectedBank && bankAccounts.find(b => b.name === selectedBank)?.isPaypal ? (
                    <div className={`mt-4 p-3 rounded-lg flex items-start gap-2 ${isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                      <FiCheck className="text-blue-400 mt-0.5" />
                      <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                        After sending payment via PayPal Friends &amp; Family, click Place Order to submit your order.
                      </p>
                    </div>
                  ) : (
                    <div className={`mt-4 p-3 rounded-lg flex items-start gap-2 ${isDarkMode ? 'bg-yellow-500/10' : 'bg-yellow-50'}`}>
                      <FiAlertCircle className="text-yellow-500 mt-0.5" />
                      <p className={`text-sm ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                        {t('cart.bankInfo')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Minimum Order Modal */}
      {showMinOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowMinOrderModal(false)} />
          <div className={`relative max-w-sm w-full rounded-2xl p-6 shadow-2xl border ${isDarkMode ? 'bg-gray-900 border-red-500/30' : 'bg-white border-red-200'}`}>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                <FiAlertCircle className="text-red-400 text-3xl" />
              </div>
              <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {t('cartPage.minimumOrder')}
              </h3>
              <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('cartPage.minimumOrderHint')}
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowMinOrderModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-400 text-sm hover:border-gray-400 hover:text-white transition-colors"
                >
                  {t('common.close') || 'Close'}
                </button>
                <button
                  onClick={() => { setShowMinOrderModal(false); navigate('/services'); }}
                  className="flex-1 py-3 rounded-xl btn-neon text-sm font-semibold"
                >
                  {t('cart.browseServices')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nitro Confirmation Modal */}
      <NitroConfirmationModal
        isOpen={showNitroModal}
        onConfirm={handleNitroConfirm}
        onCancel={handleNitroCancel}
      />
    </div>
  );
};

export default Cart;
