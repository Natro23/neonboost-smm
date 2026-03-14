import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './components/Header';
import Footer from './components/Footer';
import TelegramWidget from './components/TelegramWidget';
import Home from './pages/Home';
import Services from './pages/Services';
import Cart from './pages/Cart';
import ApiDocs from './pages/ApiDocs';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import AdminPanel from './pages/AdminPanel';
import FreeTrial from './pages/FreeTrial';
import { useStore } from './store/useStore';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const { isDarkMode } = useStore();

  useEffect(() => {
    // Apply dark mode class
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <Router>
      <ScrollToTop />
      <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-background' : 'bg-gray-50'}`}>
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/api-docs" element={<ApiDocs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/free-trial" element={<FreeTrial />} />
          </Routes>
        </main>
        <Footer />
        <TelegramWidget />
        <ToastContainer
          position="bottom-left"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={isDarkMode ? 'dark' : 'light'}
          style={{ zIndex: 9999 }}
          aria-label="Notification container"
          limit={3}
        />
      </div>
    </Router>
  );
}

export default App;
