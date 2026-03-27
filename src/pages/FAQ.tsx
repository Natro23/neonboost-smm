import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiMessageCircle } from 'react-icons/fi';
import { useStore } from '../store/useStore';

const FAQ = () => {
  const { t } = useTranslation();
  const { isDarkMode } = useStore();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Generate FAQ data from translations
  const faqItems = [
    { question: t('faqPage.questions.q1.question'), answer: t('faqPage.questions.q1.answer') },
    { question: t('faqPage.questions.q2.question'), answer: t('faqPage.questions.q2.answer') },
    { question: t('faqPage.questions.q3.question'), answer: t('faqPage.questions.q3.answer') },
    { question: t('faqPage.questions.q4.question'), answer: t('faqPage.questions.q4.answer') },
    { question: t('faqPage.questions.q5.question'), answer: t('faqPage.questions.q5.answer') },
    { question: t('faqPage.questions.q6.question'), answer: t('faqPage.questions.q6.answer') },
    { question: t('faqPage.questions.q7.question'), answer: t('faqPage.questions.q7.answer') },
    { question: t('faqPage.questions.q8.question'), answer: t('faqPage.questions.q8.answer') },
    { question: t('faqPage.questions.q9.question'), answer: t('faqPage.questions.q9.answer') },
    { question: t('faqPage.questions.q10.question'), answer: t('faqPage.questions.q10.answer') },
  ];

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
            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{t('faqPage.title')}</span>
          </h1>
          <p className={`max-w-2xl mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('faqPage.subtitle')}
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-xl overflow-hidden ${
                isDarkMode ? 'bg-gray-800/50' : 'bg-white shadow-lg'
              }`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className={`w-full p-5 flex items-center justify-between text-left transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                }`}
              >
                <span className={`font-semibold text-lg ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {item.question}
                </span>
                <FiChevronDown 
                  className={`flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  } ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} 
                  size={20} 
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className={`px-5 pb-5 pt-0 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`max-w-3xl mx-auto mt-12 p-8 rounded-2xl ${
            isDarkMode ? 'bg-gradient-to-r from-purple-900/50 to-pink-900/50' : 'bg-gradient-to-r from-purple-50 to-pink-50'
          }`}
        >
          <div className="text-center">
            <FiMessageCircle className={`mx-auto mb-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} size={32} />
            <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('contact.title')}
            </h3>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('contact.subtitle')}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQ;
