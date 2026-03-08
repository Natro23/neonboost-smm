import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTrash2, FiUpload, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { useStore } from '../store/useStore';
import { bankAccounts } from '../data/services';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Cart = () => {
  const navigate = useNavigate();
  const { isDarkMode, cart, removeFromCart, updateQuantity, updateLink, updateAccountNotPrivate, getCartTotal, clearCart, setOrderId } = useStore();
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file (JPG/PNG)');
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
      toast.error('Your cart is empty!');
      return;
    }

    // Check if all links are provided
    const missingLinks = cart.filter(item => !item.link.trim());
    if (missingLinks.length > 0) {
      toast.error('Please provide links for all services!');
      return;
    }

    // Check if Facebook/TikTok/Instagram/YouTube accounts are not private
    const privateAccounts = cart.filter(item => 
      ['Facebook', 'TikTok', 'Instagram', 'YouTube'].includes(item.service.platform) && !item.accountNotPrivate
    );
    if (privateAccounts.length > 0) {
      toast.error('Please confirm that your Facebook/TikTok/Instagram/YouTube accounts are not private!');
      return;
    }

    if (!selectedBank) {
      toast.error('Please select a payment method!');
      return;
    }

    if (!paymentProof) {
      toast.error('Please upload payment proof!');
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
        total: (item.service.price * item.quantity) / 1000,
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
          total: (item.service.price * item.quantity) / 1000,
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

      toast.success('Order placed successfully! We will process it shortly.');
      clearCart();
      navigate('/');
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
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
            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Your </span>
            <span className="gradient-text">Cart</span>
          </h1>

          {cart.length === 0 ? (
            <div className="text-center py-16">
              <p className={`text-xl mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Your cart is empty
              </p>
              <Link to="/services">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-neon px-8 py-3 rounded-xl"
                >
                  Browse Services
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
                          ${item.service.price} / 1000
                        </p>

                        {/* Link Input */}
                        <div className="mb-3">
                          <label className={`block text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Your Link
                          </label>
                          <input
                            type="text"
                            value={item.link}
                            onChange={(e) => updateLink(item.service.id, e.target.value)}
                            placeholder={`Enter your ${item.service.platform} link...`}
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
                              My account is NOT private
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
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.service.id, Math.min(item.service.max, Math.max(item.service.min, parseInt(e.target.value) || item.service.min)))}
                            className="w-20 text-center bg-transparent border border-gray-600 rounded px-2 py-1"
                            min={item.service.min}
                            max={item.service.max}
                          />
                          <button
                            onClick={() => updateQuantity(item.service.id, Math.min(item.service.max, item.quantity + 100))}
                            className="p-1 rounded bg-primary/20 text-primary hover:bg-primary/30"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Subtotal</p>
                          <p className="text-xl font-bold gradient-text">
                            ${((item.service.price * item.quantity) / 1000).toFixed(2)}
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
                    Order Summary
                  </h2>

                  <div className={`space-y-2 mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div className="flex justify-between">
                      <span>Items</span>
                      <span>{cart.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Quantity</span>
                      <span>{cart.reduce((sum, item) => sum + item.quantity, 0).toLocaleString()}</span>
                    </div>
                    <div className={`border-t pt-2 mt-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex justify-between text-xl font-bold">
                        <span>Total</span>
                        <span className="gradient-text">${getCartTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Section */}
                  <div className="mb-6">
                    <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Select Payment Method
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
                            onChange={(e) => setSelectedBank(e.target.value)}
                            className="hidden"
                          />
                          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                            {bank.logo ? (
                              <img src={bank.logo} alt={bank.name} className="w-8 h-8 object-contain" />
                            ) : (
                              <span className="text-xs font-bold">{bank.name.substring(0, 2)}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {bank.name}
                            </p>
                            <p className="text-xs text-gray-500">{bank.isCrypto ? 'Instant crypto payment' : bank.account}</p>
                          </div>
                          {selectedBank === bank.name && (
                            <FiCheck className="text-primary" />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* File Upload */}
                  <div className="mb-6">
                    <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Upload Payment Proof
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
                            <FiCheck /> File uploaded
                          </p>
                        </div>
                      ) : (
                        <>
                          <FiUpload className={`mx-auto mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                            Click to upload screenshot
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
                        Processing...
                      </>
                    ) : (
                      <>
                        <FiCheck />
                        Place Order
                      </>
                    )}
                  </motion.button>

                  {/* Info */}
                  <div className={`mt-4 p-3 rounded-lg flex items-start gap-2 ${isDarkMode ? 'bg-yellow-500/10' : 'bg-yellow-50'}`}>
                    <FiAlertCircle className="text-yellow-500 mt-0.5" />
                    <p className={`text-sm ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                      After payment, upload your receipt. We'll process your order within 5-15 minutes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Cart;
