import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiCheck, FiX } from 'react-icons/fi';
import { useStore } from '../store/useStore';

interface NitroConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const NitroConfirmationModal = ({ isOpen, onConfirm, onCancel }: NitroConfirmationModalProps) => {
  const { isDarkMode, language } = useStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`relative w-full max-w-lg p-6 rounded-2xl shadow-2xl ${
              isDarkMode 
                ? 'bg-gray-900 border border-yellow-500/30' 
                : 'bg-white border border-yellow-300'
            }`}
          >
            {/* Close button */}
            <button
              onClick={onCancel}
              className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-800 text-gray-400' 
                  : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <FiX size={20} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-full bg-yellow-500/20">
                <FiAlertTriangle className="w-6 h-6 text-yellow-500" />
              </div>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {language === 'ka' ? 'მნიშვნელოვანი ინფორმაცია' : 'Important Notice'}
              </h2>
            </div>

            {/* Content */}
            <div className="space-y-4 mb-6">
              {/* English */}
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-100'}`}>
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  This code can only be used on accounts that are at least one month old and have never had an active Discord Nitro subscription. An active payment method is required to redeem the code. Each code can be activated only once per IP address or payment method. Codes must be used within one week of issuance.
                </p>
              </div>

              {/* Georgian */}
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-purple-50 border border-purple-100'}`}>
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  კოდი შესაძლებელი იქნება მხოლოდ რომ იქნეს გამოყენებული ექაუნთებზე რომლებიც მინიმუმ 30 დღისაა და არასოდეს არქონია ნიტრო. მოგიწევთ ბანკის ბარათის მიბმა რომ გააქტიუროთ კოდი. თითო კოდის გააქტიურება შესაძლებელია ერთ აიპი მისამართზე ან ერთ საკრედიტო ბარათზე. კოდი მოსვლიდან ერთიკვირის მანძილზე უნდა იქნას გამოყენებული.
                </p>
              </div>
            </div>

            {/* Warning note */}
            <div className={`p-3 rounded-lg mb-6 ${isDarkMode ? 'bg-red-500/10' : 'bg-red-50'}`}>
<p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                ⚠️ {language === 'ka' 
                  ? 'თუ თქვენ არ გაიყენეთ კოდი სწორად, თანხა არ დაბრუნდება.' 
                  : 'If you do not use the code correctly, the amount will not be refunded.'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {language === 'ka' ? 'გაუქმება' : 'Cancel'}
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-3 px-4 rounded-xl font-medium bg-green-500 text-white hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <FiCheck />
                {language === 'ka' ? 'გავაგრძელებ' : 'I Understand'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NitroConfirmationModal;
