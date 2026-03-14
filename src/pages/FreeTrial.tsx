import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiGift, FiCheck, FiAlertCircle, FiArrowRight, FiShield, FiZap, FiLink, FiUsers, FiXCircle } from 'react-icons/fi';

const API_BASE = import.meta.env.VITE_API_URL || 'https://neonboost-backend.onrender.com';
const LIMIT = 500;

type Status = 'idle' | 'loading' | 'success' | 'claimed' | 'ended' | 'error';

function Alert({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex gap-2 items-start p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mt-3">
      {icon || <FiAlertCircle className="mt-0.5 flex-shrink-0" />}
      <span>{children}</span>
    </div>
  );
}

export default function FreeTrial() {
  const [username, setUsername] = useState('');
  const [link, setLink] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [remaining, setRemaining] = useState<number | null>(null);

  // Fetch remaining count on load
  useEffect(() => {
    fetch(`${API_BASE}/api/free-trial/status`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setRemaining(data.remaining);
          if (data.ended) setStatus('ended');
        }
      })
      .catch(() => {});
  }, []);

  const isValid = username.trim().length > 0 && link.trim().length > 5;
  const claimed = LIMIT - (remaining ?? LIMIT);
  const progressPct = remaining !== null ? Math.round((claimed / LIMIT) * 100) : 0;

  const handleSubmit = async () => {
    if (!isValid || status === 'ended') return;
    setStatus('loading');
    try {
      const res = await fetch(`${API_BASE}/api/free-trial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instagramUsername: username.trim().replace(/^@/, ''),
          instagramLink: link.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRemaining(data.remaining);
        setStatus('success');
      } else if (data.message === 'promotion_ended') {
        setRemaining(0);
        setStatus('ended');
      } else if (['already_claimed_ip', 'already_claimed_username', 'already_claimed_link'].includes(data.message)) {
        setStatus('claimed');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  // Promotion ended screen
  if (status === 'ended') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-24">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <FiXCircle className="text-red-400 text-3xl" />
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/20 bg-red-500/10 text-red-400 text-sm mb-5">
            აქცია დასრულდა
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">სამწუხაროდ, დასრულდა</h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-2">
            500 უფასო ფოლოვერის აქცია სრულად ამოიწურა.
          </p>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            მადლობა ყველა მონაწილეს! სხვა სერვისები კვლავ ხელმისაწვდომია.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/services">
              <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto">
                სერვისების ნახვა <FiArrowRight />
              </button>
            </Link>
            <Link to="/">
              <button className="px-6 py-3 rounded-xl border border-white/10 text-gray-400 text-sm hover:text-white hover:border-white/20 transition-colors flex items-center gap-2 mx-auto">
                მთავარი გვერდი
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-24">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm mb-5">
            🎁 შეზღუდული შეთავაზება
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            50 უფასო ფოლოვერი
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
            პირველი 500 მომხმარებლისთვის — სრულიად უფასოდ, არანაირი გადახდა.
          </p>
        </div>

        {/* Progress bar */}
        {remaining !== null && (
          <div className="mb-6 bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-400">გამოყენებული ადგილები</span>
              <span className="text-xs font-medium text-white">{claimed} / {LIMIT}</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">დარჩენილია</span>
              <span className={`text-xs font-semibold ${remaining < 50 ? 'text-red-400' : remaining < 100 ? 'text-yellow-400' : 'text-green-400'}`}>
                {remaining} ადგილი
              </span>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: '🚀', label: '0–5 წუთში' },
            { icon: '👥', label: '50 ფოლოვერი' },
            { icon: '🆓', label: '100% უფასო' },
          ].map((s, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          {status === 'success' ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                <FiCheck className="text-green-400 text-2xl" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">მოთხოვნა მიღებულია! 🎉</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-2">
                შენი <span className="text-white font-medium">50 ფოლოვერი</span> გაიგზავნება
              </p>
              <p className="text-purple-300 font-medium text-sm mb-4 break-all">{link}</p>
              <p className="text-gray-500 text-xs mb-6">
                დარწმუნდი რომ პროფილი <span className="text-white">საჯაროა</span> მიწოდების დროს.
              </p>
              {remaining !== null && remaining < 100 && (
                <p className="text-yellow-400 text-xs mb-4">⚠️ მხოლოდ {remaining} ადგილი დარჩა!</p>
              )}
              <Link to="/services">
                <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto">
                  სხვა სერვისების ნახვა <FiArrowRight />
                </button>
              </Link>
            </div>
          ) : (
            <>
              {/* Username */}
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">
                  <FiInstagram className="inline mr-1.5 text-pink-400" />
                  Instagram მომხმარებლის სახელი
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm select-none">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value.replace(/^@/, ''))}
                    placeholder="your_username"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-7 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                    disabled={status === 'loading'}
                  />
                </div>
              </div>

              {/* Link */}
              <div className="mb-5">
                <label className="block text-sm text-gray-400 mb-2">
                  <FiLink className="inline mr-1.5 text-cyan-400" />
                  პროფილის ბმული
                </label>
                <input
                  type="text"
                  value={link}
                  onChange={e => setLink(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="https://www.instagram.com/your_username"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                  disabled={status === 'loading'}
                />
                <p className="text-xs text-gray-600 mt-1.5 ml-1">მაგ: https://www.instagram.com/neonboost.ge</p>
              </div>

              {/* Errors */}
              {status === 'claimed' && (
                <Alert>თქვენ უკვე გამოიყენეთ უფასო შეთავაზება</Alert>
              )}
              {status === 'error' && (
                <Alert>შეცდომა მოხდა. სცადე თავიდან.</Alert>
              )}

              {/* Urgency warning if spots running low */}
              {remaining !== null && remaining <= 50 && remaining > 0 && (
                <div className="flex gap-2 items-center p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm mt-3">
                  <span>⚠️</span>
                  <span>მხოლოდ <strong>{remaining}</strong> ადგილი დარჩა! იჩქარე.</span>
                </div>
              )}

              {/* Button */}
              <button
                onClick={handleSubmit}
                disabled={status === 'loading' || !isValid}
                className="w-full mt-4 px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                {status === 'loading'
                  ? <><span className="animate-spin inline-block">⏳</span> შემოწმება...</>
                  : <><FiGift /> 50 უფასო ფოლოვერის მიღება <FiArrowRight /></>
                }
              </button>

              {/* Fine print */}
              <div className="mt-5 space-y-2 border-t border-white/5 pt-4">
                <div className="flex items-center gap-2 text-gray-500 text-xs"><FiShield className="text-green-500 flex-shrink-0" />პროფილი საჯარო (public) უნდა იყოს მიწოდების დროს</div>
                <div className="flex items-center gap-2 text-gray-500 text-xs"><FiZap className="text-yellow-500 flex-shrink-0" />მიწოდება 0–5 წუთში</div>
                <div className="flex items-center gap-2 text-gray-500 text-xs"><FiUsers className="text-purple-400 flex-shrink-0" />ერთხელ — ერთ IP-ზე, ერთ სახელზე, ერთ ბმულზე</div>
              </div>
            </>
          )}
        </div>

        <div className="text-center mt-6">
          <Link to="/services" className="text-gray-500 text-sm hover:text-gray-300 transition-colors">
            ← სრული სერვისების ნახვა
          </Link>
        </div>
      </div>
    </div>
  );
}
