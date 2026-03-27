import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX, FiSend, FiHeadphones } from 'react-icons/fi';

const TelegramWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  // Your Telegram username
  const TELEGRAM_USERNAME = 'NeonStore22';

  const handleSend = () => {
    if (message.trim()) {
      // Open Telegram in new tab with pre-filled message
      const telegramUrl = `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(message)}`;
      window.open(telegramUrl, '_blank');
      setMessage('');
      setIsOpen(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button - Neon Style */}
      <motion.button
        onClick={() => setIsOpen(true)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
        style={{
          background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
          boxShadow: '0 0 25px rgba(168, 85, 247, 0.5), 0 0 50px rgba(236, 72, 153, 0.3)',
        }}
      >
        <div className="relative">
          <FiMessageCircle className="text-white text-2xl" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-pink-400 rounded-full animate-pulse"></span>
        </div>
      </motion.button>

      {/* Chat Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 left-6 z-50 w-80 md:w-96 rounded-2xl shadow-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              boxShadow: '0 0 40px rgba(168, 85, 247, 0.2), 0 20px 60px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Header - Neon Gradient */}
            <div 
              className="p-4 flex items-center justify-between"
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                boxShadow: '0 0 30px rgba(168, 85, 247, 0.4)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <FiHeadphones className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-white font-bold">NeonBoost Support</h3>
                  <p className="text-white/80 text-sm">Click to chat on Telegram</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4" style={{ background: 'rgba(15, 23, 42, 0.8)' }}>
              <div 
                className="rounded-xl p-4 mb-4"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
                  border: '1px solid rgba(168, 85, 247, 0.2)',
                }}
              >
                <p className="text-gray-300 text-sm">
                  💬 Need help? Chat with us directly on Telegram for instant support!
                </p>
                <ul className="text-gray-400 text-sm mt-3 space-y-2">
                  <li className="flex items-center gap-2">
                    <span style={{ color: '#a855f7' }}>✓</span> 24/7 Live Support
                  </li>
                  <li className="flex items-center gap-2">
                    <span style={{ color: '#ec4899' }}>✓</span> Quick Responses
                  </li>
                  <li className="flex items-center gap-2">
                    <span style={{ color: '#a855f7' }}>✓</span> Order Assistance
                  </li>
                </ul>
              </div>

              {/* Message Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 rounded-xl px-4 py-2 text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(168, 85, 247, 0.2)',
                    color: '#fff',
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className="p-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: message.trim() 
                      ? 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' 
                      : 'rgba(100, 116, 139, 0.5)',
                    boxShadow: message.trim() ? '0 0 15px rgba(168, 85, 247, 0.4)' : 'none',
                  }}
                >
                  <FiSend className="text-white" />
                </button>
              </div>

              {/* Telegram Link */}
              <a
                href={`https://t.me/${TELEGRAM_USERNAME}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-sm mt-3 transition-colors"
                style={{ color: '#a855f7' }}
              >
                Open in Telegram →
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/50"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default TelegramWidget;
