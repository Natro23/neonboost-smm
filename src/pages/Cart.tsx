import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiTrash2, FiUpload, FiCheck, FiAlertCircle, FiTag, FiX } from 'react-icons/fi';
import { useStore, currencies, Currency, promoCodes } from '../store/useStore';
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
    if (pendingNitroService) {
      updateNitroConfirmed(pendingNitroService, true);
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
  const handleApplyPromo = () => {
    if (!promoInput.trim()) return;
    const success = applyPromo(promoInput);
    if (success) {
      toast.success(t('cartPage.promoApplied', { discount: promoDiscount }));
      setPromoInput('');
      setShowPromoError(false);
    } else {
      setShowPromoError(true);
      toast.error(t('cartPage.invalidPromo'));
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

    // Only require payment proof for bank transfers, not for crypto
    const selectedBankData = bankAccounts.find(b => b.name === selectedBank);
    if (!selectedBankData?.isCrypto && !paymentProof) {
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
      formData.append('total', getCartTotal().toString());
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
                            <p className="text-xs text-gray-500">{bank.isCrypto ? t('cart.instantCryptoPayment') : bank.account}</p>
                          </div>
                          {selectedBank === bank.name && (
                            <FiCheck className="text-primary" />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Bank Transfer Instructions */}
                  {selectedBank && !bankAccounts.find(b => b.name === selectedBank)?.isCrypto && (
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

                  {/* File Upload - Only for Bank Transfer */}
                  {selectedBank && !bankAccounts.find(b => b.name === selectedBank)?.isCrypto && (
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
                  {selectedBank && bankAccounts.find(b => b.name === selectedBank)?.isCrypto ? (
                    <div className={`mt-4 p-3 rounded-lg flex items-start gap-2 ${isDarkMode ? 'bg-green-500/10' : 'bg-green-50'}`}>
                      <FiCheck className="text-green-500 mt-0.5" />
                      <p className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                        {t('cart.cryptoInfo')}
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
