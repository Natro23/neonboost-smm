import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiMapPin } from 'react-icons/fi';
import { FaTelegramPlane } from 'react-icons/fa';
import { useStore } from '../store/useStore';

const Footer = () => {
  const { t } = useTranslation();
  const { isDarkMode } = useStore();

  const footerLinks = {
    services: [
      { name: t('footer.services'), path: '/' },
      { name: t('footer.apiDocs'), path: '/api-docs' },
      { name: t('footer.contact'), path: '/contact' },
    ],
    company: [
      { name: t('footer.services'), path: '/' },
      { name: t('footer.apiDocs'), path: '/api-docs' },
      { name: t('footer.contact'), path: '/contact' },
    ],
    legal: [
      { name: t('footer.legal.terms'), path: '/' },
      { name: t('footer.legal.privacy'), path: '/' },
      { name: t('footer.legal.refund'), path: '/' },
    ],
  };

  const socialLinks = [
    { icon: FaTelegramPlane, href: 'https://t.me/NeonStore22', label: 'Telegram' },
  ];

  return (
    <footer
      className={`relative pt-20 pb-10 ${
        isDarkMode
          ? 'bg-gradient-dark border-t border-white/5'
          : 'bg-gray-50 border-t border-gray-200'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          {/* Brand Section */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-blue-green flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <span className="text-xl font-bold font-montserrat">
                <span className="gradient-text">Neon</span>
                <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Boost</span>
              </span>
            </Link>
            <p
              className={`mb-6 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              {t('footer.description')}
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    isDarkMode
                      ? 'bg-white/5 text-gray-400 hover:bg-primary/20 hover:text-primary'
                      : 'bg-gray-100 text-gray-600 hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Services Links */}
          <div>
            <h4
              className={`font-semibold text-lg mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              {t('footer.services')}
            </h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className={`transition-colors duration-300 ${
                      isDarkMode
                        ? 'text-gray-400 hover:text-primary'
                        : 'text-gray-600 hover:text-primary'
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4
              className={`font-semibold text-lg mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              {t('footer.company')}
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className={`transition-colors duration-300 ${
                      isDarkMode
                        ? 'text-gray-400 hover:text-primary'
                        : 'text-gray-600 hover:text-primary'
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4
              className={`font-semibold text-lg mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              {t('footer.contact')}
            </h4>
            <ul className="space-y-4">
              <li>
                <div
                  className={`flex items-center gap-3 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  <FiMapPin size={18} />
                  {t('footer.contactLocation')}
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div
          className={`pt-8 border-t ${
            isDarkMode ? 'border-white/5' : 'border-gray-200'
          }`}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p
              className={`text-sm ${
                isDarkMode ? 'text-gray-500' : 'text-gray-500'
              }`}
            >
              &copy; {new Date().getFullYear()} NeonBoost. {t('footer.copyright')}
            </p>
            <div className="flex gap-6">
              {footerLinks.legal.map((link, index) => (
                <Link
                  key={index}
                  to={link.path}
                  className={`text-sm transition-colors duration-300 ${
                    isDarkMode
                      ? 'text-gray-500 hover:text-primary'
                      : 'text-gray-500 hover:text-primary'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
