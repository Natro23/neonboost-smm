import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { FaTiktok, FaTelegramPlane, FaDiscord } from 'react-icons/fa';
import { useStore } from '../store/useStore';

const Footer = () => {
  const { isDarkMode } = useStore();

  const footerLinks = {
    services: [
      { name: 'Instagram', path: '/services?platform=Instagram' },
      { name: 'TikTok', path: '/services?platform=TikTok' },
      { name: 'YouTube', path: '/services?platform=YouTube' },
      { name: 'Facebook', path: '/services?platform=Facebook' },
      { name: 'Twitter', path: '/services?platform=Twitter' },
    ],
    company: [
      { name: 'About Us', path: '/' },
      { name: 'API Docs', path: '/api-docs' },
      { name: 'Contact', path: '/contact' },
    ],
    legal: [
      { name: 'Terms of Service', path: '/' },
      { name: 'Privacy Policy', path: '/' },
      { name: 'Refund Policy', path: '/' },
    ],
  };

  const socialLinks = [
    { icon: FiInstagram, href: '#', label: 'Instagram' },
    { icon: FaTiktok, href: '#', label: 'TikTok' },
    { icon: FiTwitter, href: '#', label: 'Twitter' },
    { icon: FaTelegramPlane, href: '#', label: 'Telegram' },
    { icon: FaDiscord, href: '#', label: 'Discord' },
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
              The world's fastest SMM panel for growing your social media presence.
              Instant delivery, real quality, 24/7 support.
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
              Services
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
              Company
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
              Contact
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:support@neonboost.com"
                  className={`flex items-center gap-3 transition-colors duration-300 ${
                    isDarkMode
                      ? 'text-gray-400 hover:text-primary'
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  <FiMail size={18} />
                  support@neonboost.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+995555123456"
                  className={`flex items-center gap-3 transition-colors duration-300 ${
                    isDarkMode
                      ? 'text-gray-400 hover:text-primary'
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  <FiPhone size={18} />
                  +995 555 123 456
                </a>
              </li>
              <li>
                <div
                  className={`flex items-center gap-3 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  <FiMapPin size={18} />
                  Tbilisi, Georgia
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
              &copy; {new Date().getFullYear()} NeonBoost. All rights reserved.
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
