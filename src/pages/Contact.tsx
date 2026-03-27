import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiMapPin, FiSend } from 'react-icons/fi';
import { FaTelegramPlane } from 'react-icons/fa';
import { useStore } from '../store/useStore';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'https://neonboost-backend.onrender.com';

const Contact = () => {
  const { t } = useTranslation();
  const { isDarkMode } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error(t('contactPage.fillRequired'));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(t('contactPage.messageSent'));
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error(data.message || t('contactPage.messageError'));
      }
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error(t('contactPage.messageError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: FiMapPin,
      title: t('contactPage.locationTitle'),
      value: t('contactPage.locationValue'),
      description: t('contactPage.locationDesc'),
    },
  ];

  const socialLinks = [
    { icon: FaTelegramPlane, name: 'Telegram', link: 'https://t.me/NeonStore22' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold font-montserrat mb-4 text-center">
            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{t('contact.title')}</span>
          </h1>
          <p className={`text-center mb-12 max-w-2xl mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('contact.subtitle')}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="card-neon p-8">
              <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {t('contactPage.sendMessage')}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('contactPage.name')}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={t('contactPage.yourName')}
                      className="input-neon"
                      required
                    />
                  </div>
                  <div>
                    <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('contactPage.email')}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder={t('contactPage.yourEmail')}
                      className="input-neon"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('contactPage.subject')}
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder={t('contactPage.subjectPlaceholder')}
                    className="input-neon"
                  />
                </div>
                <div>
                  <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('contactPage.message')}
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={t('contactPage.messagePlaceholder')}
                    rows={6}
                    className="input-neon resize-none"
                    required
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-neon py-4 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t('contactPage.sending')}
                    </>
                  ) : (
                    <>
                      <FiSend />
                      {t('contactPage.sendBtn')}
                    </>
                  )}
                </motion.button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              {/* Contact Details */}
              <div className="card-neon p-8">
                <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {t('contactPage.getInTouch')}
                </h2>
                <div className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-4"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-blue-green flex items-center justify-center flex-shrink-0">
                        <info.icon className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {info.title}
                        </h3>
                        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{info.value}</p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {info.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div className="card-neon p-8">
                <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {t('contactPage.connectWithUs')}
                </h2>
                <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('contactPage.instantMessaging')}
                </p>
                <div className="flex flex-wrap gap-4">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                    >
                      <social.icon size={18} />
                      {social.name}
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* FAQ Link */}
              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-primary/10' : 'bg-primary/5'}`}>
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {t('contactPage.needQuickHelp')}
                </h3>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {t('contactPage.checkFaq')}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
