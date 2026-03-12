import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { randomNames, services } from '../data/services';

const RandomNotifications = () => {
  useEffect(() => {
    // Show random buy notifications
    const showRandomNotification = () => {
      const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
      // Blur all except first 3 letters
      const blurredName = randomName.slice(0, 3) + '*'.repeat(randomName.length - 3);
      const randomService = services[Math.floor(Math.random() * services.length)];
      const quantity = Math.floor(Math.random() * 9000) + 1000;
      const platform = randomService.platform;

      const messages = [
        `User ${blurredName} just ordered ${quantity.toLocaleString()} ${platform} ${randomService.category.toLowerCase()}!`,
        `${blurredName} purchased ${quantity.toLocaleString()} ${platform} ${randomService.name.split(' - ')[0]}!`,
        `${blurredName} just boost their ${platform} with ${quantity.toLocaleString()} ${randomService.category.toLowerCase()}!`,
      ];

      const message = messages[Math.floor(Math.random() * messages.length)];

      // Get stored dark mode preference
      const isDark = localStorage.getItem('darkMode') !== 'false';

      toast.success(message, {
        position: 'bottom-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: isDark ? {
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 191, 255, 0.3)',
          borderRadius: '16px',
          boxShadow: '0 0 30px rgba(0, 191, 255, 0.2), 0 10px 40px rgba(0, 0, 0, 0.4)',
          color: '#fff',
          fontSize: '14px',
          fontWeight: '500',
        } : {
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 191, 255, 0.3)',
          borderRadius: '16px',
          boxShadow: '0 0 30px rgba(0, 191, 255, 0.15), 0 10px 40px rgba(0, 0, 0, 0.1)',
          color: '#1e293b',
          fontSize: '14px',
          fontWeight: '500',
        },
        icon: () => (
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #00BFFF 0%, #32CD32 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            boxShadow: '0 0 20px rgba(0, 191, 255, 0.4)',
          }}>
            ⚡
          </div>
        ),
        progressStyle: isDark ? {
          background: 'linear-gradient(90deg, #00BFFF 0%, #32CD32 100%)',
          borderRadius: '10px',
          height: '4px',
        } : {
          background: 'linear-gradient(90deg, #00BFFF 0%, #32CD32 100%)',
          borderRadius: '10px',
          height: '4px',
        },
      });
    };

    // Initial delay
    const initialTimeout = setTimeout(() => {
      showRandomNotification();
    }, 5000);

    // Random interval between 15-35 seconds (slower notifications)
    const scheduleNextNotification = () => {
      const delay = Math.random() * 20000 + 15000; // 15-35 seconds
      return setTimeout(() => {
        showRandomNotification();
        timeoutId = scheduleNextNotification();
      }, delay);
    };

    let timeoutId = scheduleNextNotification();

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(timeoutId);
    };
  }, []);

  return null;
};

export default RandomNotifications;
