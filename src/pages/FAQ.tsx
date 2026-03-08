import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiMessageCircle } from 'react-icons/fi';
import { useStore } from '../store/useStore';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "How do I place an order?",
    answer: "Simply browse our services, select the one you need, enter your link and quantity, then proceed to checkout. After making the payment, upload your payment proof and we'll start processing your order immediately."
  },
  {
    question: "How long does delivery take?",
    answer: "Delivery time varies by service. Most services start within 1-24 hours. You can check the estimated delivery time on each service page. Instant services deliver immediately after order confirmation."
  },
  {
    question: "What is the refill policy?",
    answer: "We offer automatic refill for 30 days on most services. If your order drops below the purchased quantity within 30 days, we'll automatically refill it free of charge. Look for the 'Refill' badge on eligible services."
  },
  {
    question: "How do I get my order started?",
    answer: "After payment confirmation, our system starts processing your order automatically. You can track the progress through the order ID provided in your confirmation. Most orders begin within minutes to hours."
  },
  {
    question: "Is my information secure?",
    answer: "Yes! We take data security seriously. All your personal information and order details are encrypted and stored securely. We never share your data with third parties."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept bank transfers (Bog & TBC Bank Georgia) and Cryptocurrency (USDT via CryptoMus). After checkout, you'll receive our payment details. Make sure to upload your payment proof for faster processing."
  },
  {
    question: "Can I cancel an order?",
    answer: "Orders can only be cancelled before they start processing. Once delivery has begun, cancellations are not possible. Contact support immediately if you need to cancel."
  },
  {
    question: "Why is my order not starting?",
    answer: "Several factors can affect delivery: high demand, service maintenance, or incorrect link. Check your link is public and correct. If issues persist, contact our support team."
  },
  {
    question: "Do you offer API access?",
    answer: "Yes! We provide API access for resellers. Visit our API Docs page for technical documentation and integration instructions."
  },
  {
    question: "How can I contact support?",
    answer: "You can reach us through the Contact page, use the live chat widget, or message us directly on Telegram. We're available 24/7 to assist you."
  }
];

const FAQ = () => {
  const { isDarkMode } = useStore();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
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
            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Frequently </span>
            <span className="gradient-text">Asked Questions</span>
          </h1>
          <p className={`max-w-2xl mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Find answers to common questions about our services
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqData.map((item, index) => (
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
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-primary"
                >
                  <FiChevronDown size={20} />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={`px-5 pb-5 ${
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
          transition={{ delay: 0.3 }}
          className={`mt-12 text-center p-8 rounded-2xl ${
            isDarkMode ? 'bg-gray-800/50' : 'bg-white shadow-lg'
          }`}
        >
          <FiMessageCircle className="mx-auto text-4xl text-primary mb-4" />
          <h3 className={`text-xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Still have questions?
          </h3>
          <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Can't find the answer you're looking for? Chat with us on Telegram!
          </p>
          <a
            href="https://t.me/NeonStore22"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-neon inline-flex items-center gap-2"
          >
            <FiMessageCircle />
            Chat on Telegram
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQ;
