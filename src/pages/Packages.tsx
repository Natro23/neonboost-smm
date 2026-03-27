import { useState } from 'react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  FiUpload, FiCheck, FiAlertCircle, FiZap,
  FiUsers, FiHeart, FiStar, FiShield,
} from 'react-icons/fi';
import { FaInstagram, FaPaypal } from 'react-icons/fa';
import { useStore } from '../store/useStore';
import { bankAccounts } from '../data/services';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'https://neonboost-backend.onrender.com';

interface PackageData {
  id: string;
  followers: number;
  likes: number;
  price: number;
  originalPrice: number;
  saleBadge: string;
  badge?: string;
  popular?: boolean;
}

const PACKAGES: PackageData[] = [
  { id: 'pkg-starter', followers: 1250, likes: 850,  price: 9.99,  originalPrice: 15, saleBadge: 'packages.saleBadge1', badge: 'packages.starterBadge' },
  { id: 'pkg-growth',  followers: 1750, likes: 1350, price: 13.99, originalPrice: 22, saleBadge: 'packages.saleBadge2', badge: 'packages.growthBadge', popular: true },
  { id: 'pkg-pro',     followers: 2250, likes: 1850, price: 16.99, originalPrice: 30, saleBadge: 'packages.saleBadge3', badge: 'packages.proBadge' },
];

const Packages = () => {
  const { t } = useTranslation();
  const { isDarkMode } = useStore();

  const [selectedPkg,     setSelectedPkg]     = useState<string | null>(null);
  const [profileLink,     setProfileLink]     = useState('');
  const [postLink,        setPostLink]        = useState('');
  const [selectedBank,    setSelectedBank]    = useState<string | null>(null);
  const [paymentProof,    setPaymentProof]    = useState<File | null>(null);
  const [proofPreview,    setProofPreview]    = useState<string | null>(null);
  const [isSubmitting,    setIsSubmitting]    = useState(false);
  const [accountIsPublic, setAccountIsPublic] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getSelectedPackage = () => PACKAGES.find(p => p.id === selectedPkg);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error(t('cartPage.fileSizeError')); return; }
    if (!file.type.startsWith('image/')) { toast.error(t('cartPage.imageError')); return; }
    setPaymentProof(file);
    const reader = new FileReader();
    reader.onloadend = () => setProofPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleBankSelect = (bankName: string) => {
    setSelectedBank(bankName);
    setPaymentProof(null);
    setProofPreview(null);
    const bank = bankAccounts.find(b => b.name === bankName);
    if (bank?.account && !bank.isPaypal) {
      navigator.clipboard.writeText(bank.account).then(() => {
        toast.success(`📋 ${bank.account} copied!`);
      });
    }
  };

  const handleSubmit = async () => {
    const pkg = getSelectedPackage();
    if (!pkg)                { toast.error(t('packages.selectPackageFirst')); return; }
    if (!profileLink.trim()) { toast.error(t('packages.enterProfileLink'));   return; }
    if (!postLink.trim())    { toast.error(t('packages.enterPostLink'));       return; }
    if (!accountIsPublic)    { toast.error(t('packages.confirmPublic'));       return; }
    if (!selectedBank)       { toast.error(t('cartPage.selectPayment'));       return; }
    if (!paymentProof)       { toast.error(t('cartPage.uploadScreenshot'));    return; }

    setIsSubmitting(true);
    try {
      const orderId     = Math.random().toString(36).substring(2, 10).toUpperCase();
      const packageName = t(`packages.pkg_${pkg.id.replace('pkg-', '')}_title`);

      const items = JSON.stringify([
        {
          serviceId:    pkg.id + '-followers',
          serviceName:  `${packageName} — ${pkg.followers.toLocaleString()} ${t('packages.followers')}`,
          quantity:     pkg.followers,
          link:         profileLink,
          price:        0,
          total:        +(pkg.price * 0.6).toFixed(2),
          packageOrder: true,
        },
        {
          serviceId:    pkg.id + '-likes',
          serviceName:  `${packageName} — ${pkg.likes.toLocaleString()} ${t('packages.likes')}`,
          quantity:     pkg.likes,
          link:         postLink,
          price:        0,
          total:        +(pkg.price * 0.4).toFixed(2),
          packageOrder: true,
          profileLink,
          postLink,
        },
      ]);

      const formData = new FormData();
      formData.append('orderId',           orderId);
      formData.append('items',             items);
      formData.append('total',             pkg.price.toString());
      formData.append('originalTotal',     pkg.price.toString());
      formData.append('discountAmount',    '0');
      formData.append('bank',             selectedBank);
      formData.append('paymentProof',     paymentProof);
      formData.append('isPackageOrder',   'true');
      formData.append('packageId',        pkg.id);
      formData.append('packageName',      packageName);
      formData.append('packageFollowers', pkg.followers.toString());
      formData.append('packageLikes',     pkg.likes.toString());
      formData.append('profileLink',      profileLink);
      formData.append('postLink',         postLink);

      const response = await fetch(`${API_URL}/api/orders`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Failed to submit order');

      toast.success(t('cartPage.orderSuccess'));
      setSelectedPkg(null);
      setProfileLink('');
      setPostLink('');
      setSelectedBank(null);
      setPaymentProof(null);
      setProofPreview(null);
      setAccountIsPublic(false);
    } catch {
      toast.error(t('cartPage.orderFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const dark = isDarkMode;
  const section = dark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm';
  const inputCls = dark
    ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-primary'
    : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-primary';
  const labelCls = `block text-sm font-semibold mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`;
  const hintCls  = `text-xs mt-1.5 ${dark ? 'text-gray-500' : 'text-gray-400'}`;
  const selectedBankObj = bankAccounts.find(b => b.name === selectedBank);

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">

        {/* Flash Sale Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 rounded-2xl overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg,#7c3aed 0%,#db2777 45%,#0891b2 100%)' }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'repeating-linear-gradient(45deg,white 0,white 1px,transparent 0,transparent 8px)', backgroundSize: '10px 10px' }}
          />
          <div className="relative px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚡</span>
              <div>
                <div className="text-white font-black text-base sm:text-lg tracking-wide uppercase leading-tight">
                  {t('packages.flashSaleTitle')}
                </div>
                <div className="text-purple-200 text-xs sm:text-sm font-medium mt-0.5">
                  {t('packages.flashSaleSubtitle')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2 shrink-0">
              <span className="text-white text-lg">⏰</span>
              <span className="text-white font-bold text-xs sm:text-sm uppercase tracking-wide">
                {t('packages.flashSaleUrgency')}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold mb-4 animate-pulse">
            <FiZap size={13} />
            {t('packages.badge')}
          </div>
          <h1 className={`text-3xl sm:text-4xl font-bold font-montserrat mb-3 ${dark ? 'text-white' : 'text-gray-900'}`}>
            {t('packages.title')}
          </h1>
          <p className={`text-sm sm:text-base max-w-md mx-auto ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('packages.subtitle')}
          </p>
        </motion.div>

        {/* Package Cards — equal height via items-stretch */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 items-stretch">
          {PACKAGES.map((pkg, i) => {
            const isSelected = selectedPkg === pkg.id;
            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setSelectedPkg(isSelected ? null : pkg.id)}
                className={`relative flex flex-col rounded-2xl p-5 cursor-pointer transition-all duration-200
                  ${dark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}
                  ${pkg.popular ? 'ring-2 ring-purple-500/50' : ''}
                `}
                style={isSelected ? { border: '2px solid var(--tw-color-primary, #a855f7)', boxShadow: '0 8px 30px rgba(168,85,247,0.15)', transform: 'scale(1.02)' } : {}}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-bold whitespace-nowrap flex items-center gap-1 z-10">
                    <FiStar size={10} />
                    {t('packages.mostPopular')}
                  </div>
                )}

                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                    <FaInstagram className="text-white" size={18} />
                  </div>
                  {pkg.badge && (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${dark ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'}`}>
                      {t(pkg.badge)}
                    </span>
                  )}
                </div>

                <h3 className={`text-base font-bold font-montserrat mb-1 ${dark ? 'text-white' : 'text-gray-900'}`}>
                  {t(`packages.pkg_${pkg.id.replace('pkg-', '')}_title`)}
                </h3>

                {/* flex-grow pushes price row to bottom */}
                <p className={`text-xs leading-relaxed mb-4 flex-grow ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t(`packages.pkg_${pkg.id.replace('pkg-', '')}_desc`)}
                </p>

                <div className="space-y-1.5 mb-4">
                  <div className={`flex items-center gap-2 text-sm ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <FiUsers className="text-blue-400 shrink-0" size={14} />
                    <span><strong>{pkg.followers.toLocaleString()}</strong> {t('packages.followers')}</span>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <FiHeart className="text-pink-400 shrink-0" size={14} />
                    <span><strong>{pkg.likes.toLocaleString()}</strong> {t('packages.likes')}</span>
                  </div>
                </div>

                {/* Price always at bottom */}
                <div className={`flex items-end justify-between mt-auto pt-3 border-t ${dark ? 'border-white/10' : 'border-gray-100'}`}>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-xs font-medium line-through ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                        ₾{pkg.originalPrice.toFixed(2)}
                      </span>
                      <span className="text-xs font-black text-red-400 bg-red-500/20 border border-red-500/30 px-2 py-0.5 rounded-full uppercase tracking-wide">
                        {t(pkg.saleBadge)}
                      </span>
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                      ₾{pkg.price.toFixed(2)}
                    </span>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                    isSelected ? 'border-primary bg-primary' : dark ? 'border-white/20' : 'border-gray-300'
                  }`}>
                    {isSelected && <FiCheck size={12} className="text-white" />}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Order Form */}
        {selectedPkg && (
          <motion.div
            key={selectedPkg}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-5 sm:p-7 ${section}`}
          >
            <h2 className={`text-xl font-bold font-montserrat mb-5 ${dark ? 'text-white' : 'text-gray-900'}`}>
              {t('packages.orderDetails')}
            </h2>

            {/* Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className={labelCls}>
                  <span className="flex items-center gap-2"><FiUsers size={13} />{t('packages.profileLinkLabel')}</span>
                </label>
                <input
                  type="url"
                  value={profileLink}
                  onChange={e => setProfileLink(e.target.value)}
                  placeholder={t('packages.profileLinkPlaceholder')}
                  className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors ${inputCls}`}
                />
                <p className={hintCls}>{t('packages.profileLinkHint')}</p>
              </div>
              <div>
                <label className={labelCls}>
                  <span className="flex items-center gap-2"><FiHeart size={13} />{t('packages.postLinkLabel')}</span>
                </label>
                <input
                  type="url"
                  value={postLink}
                  onChange={e => setPostLink(e.target.value)}
                  placeholder={t('packages.postLinkPlaceholder')}
                  className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors ${inputCls}`}
                />
                <p className={hintCls}>{t('packages.postLinkHint')}</p>
              </div>
            </div>

            {/* Warning */}
            <div className={`flex items-start gap-3 p-4 rounded-xl mb-4 ${dark ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200'}`}>
              <FiAlertCircle className="text-yellow-500 mt-0.5 shrink-0" size={17} />
              <div>
                <p className={`text-sm font-semibold mb-1 ${dark ? 'text-yellow-400' : 'text-yellow-700'}`}>
                  {t('packages.warningTitle')}
                </p>
                <p className={`text-xs leading-relaxed ${dark ? 'text-yellow-500/80' : 'text-yellow-600'}`}>
                  {t('packages.warningText')}
                </p>
              </div>
            </div>

            {/* Public checkbox */}
            <label className="flex items-start gap-3 cursor-pointer mb-6 select-none">
              <div
                onClick={() => setAccountIsPublic(!accountIsPublic)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  accountIsPublic ? 'border-primary bg-primary' : dark ? 'border-white/20' : 'border-gray-300'
                }`}
              >
                {accountIsPublic && <FiCheck size={11} className="text-white" />}
              </div>
              <span className={`text-sm leading-relaxed ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('packages.confirmPublicCheck')}
              </span>
            </label>

            {/* Payment Method */}
            <h3 className={`text-base font-bold mb-3 ${dark ? 'text-white' : 'text-gray-900'}`}>
              {t('cartPage.paymentMethod')}
            </h3>
            <div className="space-y-2 mb-5">
              {bankAccounts.map((bank) => (
                <label
                  key={bank.name}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    selectedBank === bank.name
                      ? 'bg-primary/20 border border-primary'
                      : dark
                      ? 'bg-white/5 border border-transparent hover:border-primary/30'
                      : 'bg-gray-50 border border-transparent hover:border-primary/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="pkg-bank"
                    value={bank.name}
                    checked={selectedBank === bank.name}
                    onChange={() => handleBankSelect(bank.name)}
                    className="hidden"
                  />
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden"
                    style={{ backgroundColor: bank.color || '#6b7280' }}
                  >
                    {bank.logo ? (
                      <img src={bank.logo} alt={bank.name} className="w-8 h-8 object-contain" />
                    ) : bank.isPaypal ? (
                      <FaPaypal className="text-white" size={20} />
                    ) : (
                      <span className="text-white font-bold text-xs">{bank.name.substring(0, 2)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm truncate ${dark ? 'text-white' : 'text-gray-900'}`}>
                      {bank.name}
                    </p>
                    <p className="text-xs text-gray-500 font-mono truncate">{bank.account}</p>
                  </div>
                  {selectedBank === bank.name && (
                    <FiCheck className="text-primary shrink-0" size={16} />
                  )}
                </label>
              ))}
            </div>

            {/* Bank transfer instructions */}
            {selectedBank && selectedBankObj && !selectedBankObj.isPaypal && (
              <div className={`mb-5 p-4 rounded-xl ${dark ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'}`}>
                <h4 className={`font-semibold text-sm mb-2 ${dark ? 'text-blue-400' : 'text-blue-700'}`}>
                  {t('cart.bankTransferInstructions')}
                </h4>
                <p className={`text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('cart.sendPaymentTo')}: <span className="font-mono font-bold">{selectedBankObj.account}</span>
                </p>
                <p className={`text-xs ${dark ? 'text-yellow-400' : 'text-yellow-700'}`}>
                  ⚠️ {t('cart.uploadScreenshotWarning')}
                </p>
              </div>
            )}

            {/* PayPal instructions */}
            {selectedBank && selectedBankObj?.isPaypal && (
              <div className={`mb-5 p-4 rounded-xl ${dark ? 'bg-blue-900/30 border border-blue-500/40' : 'bg-blue-50 border border-blue-200'}`}>
                <h4 className={`font-semibold text-sm mb-2 ${dark ? 'text-blue-300' : 'text-blue-700'}`}>
                  PayPal Friends &amp; Family
                </h4>
                <p className={`text-sm mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('cart.sendPaymentTo')}:
                </p>
                <p className={`text-sm font-mono font-bold mb-2 ${dark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedBankObj.account}
                </p>
                <p className={`text-xs ${dark ? 'text-yellow-400' : 'text-yellow-700'}`}>
                  ⚠️ Make sure to select <strong>Friends &amp; Family</strong> — NOT "Goods &amp; Services".
                </p>
              </div>
            )}

            {/* Upload proof — only shown after bank is selected */}
            {selectedBank && (
              <div className="mb-6">
                <h3 className={`text-base font-bold mb-3 ${dark ? 'text-white' : 'text-gray-900'}`}>
                  {t('cartPage.uploadProof')}
                </h3>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                    proofPreview
                      ? 'border-primary/50'
                      : dark
                      ? 'border-white/10 hover:border-white/25'
                      : 'border-gray-300 hover:border-primary'
                  }`}
                >
                  {proofPreview ? (
                    <div className="flex flex-col items-center gap-2">
                      <img src={proofPreview} alt="proof" className="max-h-36 rounded-lg object-contain mx-auto" />
                      <span className="text-sm text-green-400 flex items-center gap-1">
                        <FiCheck size={14} /> {t('cart.fileUploaded')}
                      </span>
                      <span className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {t('cartPage.changeFile')}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${dark ? 'bg-white/10' : 'bg-gray-100'}`}>
                        <FiUpload className={dark ? 'text-gray-400' : 'text-gray-500'} size={22} />
                      </div>
                      <div>
                        <p className={`font-medium text-sm ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('cart.clickToUpload')}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">JPG/PNG, max 5MB</p>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className={`rounded-xl p-4 mb-5 ${dark ? 'bg-primary/10 border border-primary/20' : 'bg-primary/5 border border-primary/10'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{t('packages.summaryPackage')}</span>
                <span className={`font-semibold text-sm ${dark ? 'text-white' : 'text-gray-900'}`}>
                  {t(`packages.pkg_${selectedPkg.replace('pkg-', '')}_title`)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{t('packages.summaryTotal')}</span>
                <span className="text-xl font-bold text-primary">₾{getSelectedPackage()?.price.toFixed(2)}</span>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-base"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t('packages.submitting')}
                </>
              ) : (
                <>
                  <FiShield size={18} />
                  {t('packages.submitOrder')}
                </>
              )}
            </motion.button>
          </motion.div>
        )}

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="flex flex-wrap justify-center gap-5 mt-10"
        >
          {[
            { icon: FiZap,    label: t('packages.trust1') },
            { icon: FiShield, label: t('packages.trust2') },
            { icon: FiCheck,  label: t('packages.trust3') },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className={`flex items-center gap-2 text-xs sm:text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
              <Icon className="text-primary" size={15} />
              {label}
            </div>
          ))}
        </motion.div>

      </div>
    </div>
  );
};

export default Packages;
