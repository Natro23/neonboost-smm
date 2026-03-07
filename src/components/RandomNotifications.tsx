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

      toast.info(message, {
        position: 'bottom-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        icon: '🔥',
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
