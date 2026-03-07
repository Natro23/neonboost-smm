import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiSave, FiLogOut, FiPackage, FiDollarSign, FiShoppingCart, FiCheck, FiClock, FiXCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAdminStore } from '../store/useAdminStore';
import { useStore } from '../store/useStore';

// Default services data - ALL 29 services with updated ranges
const defaultServices = [
  { id: 'ig-followers-1', name: 'Instagram Followers - Premium Real', category: 'Followers', platform: 'Instagram', price: 1.99, min: 1000, max: 15000, description: 'Get high-quality Instagram followers from real accounts.', features: ['100% Real Accounts', 'High Retention'], badge: 'bestseller', speed: 'Day 5K-10K', startTime: '0-1 Hour', refill: true },
  { id: 'ig-followers-2', name: 'Instagram Followers - Ultra Fast', category: 'Followers', platform: 'Instagram', price: 2.49, min: 1000, max: 15000, description: 'Super fast Instagram followers delivery.', features: ['Instant Delivery'], badge: 'instant', speed: 'Day 50K+', startTime: '0-5 Minutes', refill: false },
  { id: 'ig-likes-1', name: 'Instagram Likes - Real Quality', category: 'Likes', platform: 'Instagram', price: 0.85, min: 1000, max: 15000, description: 'Genuine Instagram likes from real users.', features: ['Real Users'], badge: 'instant', speed: 'Day 20K', startTime: '0-10 Minutes', refill: true },
  { id: 'ig-likes-2', name: 'Instagram Likes - Premium', category: 'Likes', platform: 'Instagram', price: 1.25, min: 1000, max: 15000, description: 'Premium quality likes with better engagement rates.', features: ['Premium Accounts'], speed: 'Day 10K', startTime: '0-30 Minutes', refill: true },
  { id: 'ig-views-1', name: 'Instagram Video Views', category: 'Views', platform: 'Instagram', price: 0.45, min: 1000, max: 15000, description: 'Boost your Instagram video views instantly.', features: ['Instant Start'], badge: 'instant', speed: 'Day 1M+', startTime: '0-5 Minutes', refill: false },
  { id: 'ig-views-2', name: 'Instagram Reels Views', category: 'Views', platform: 'Instagram', price: 0.65, min: 1000, max: 15000, description: 'Specialized views for Instagram Reels.', features: ['Reels Specific'], badge: 'no-drop', speed: 'Day 500K', startTime: '0-15 Minutes', refill: true },
  { id: 'ig-story-1', name: 'Instagram Story Views', category: 'Story', platform: 'Instagram', price: 0.35, min: 1000, max: 15000, description: 'Increase your story views.', features: ['All Stories'], speed: 'Day 100K', startTime: '0-10 Minutes', refill: false },
  { id: 'ig-comments-1', name: 'Instagram Comments - Custom', category: 'Comments', platform: 'Instagram', price: 4.99, min: 1000, max: 15000, description: 'Custom comments from real users.', features: ['Custom Comments'], speed: 'Day 500', startTime: '0-2 Hours', refill: false },
  { id: 'tt-followers-1', name: 'TikTok Followers - Real', category: 'Followers', platform: 'TikTok', price: 1.49, min: 1000, max: 15000, description: 'Genuine TikTok followers.', features: ['Real Users'], badge: 'bestseller', speed: 'Day 5K-15K', startTime: '0-1 Hour', refill: true },
  { id: 'tt-followers-2', name: 'TikTok Followers - Instant', category: 'Followers', platform: 'TikTok', price: 1.99, min: 1000, max: 15000, description: 'Fast TikTok followers delivery.', features: ['Instant Start'], badge: 'instant', speed: 'Day 30K+', startTime: '0-5 Minutes', refill: false },
  { id: 'tt-likes-1', name: 'TikTok Likes - Real Quality', category: 'Likes', platform: 'TikTok', price: 0.79, min: 1000, max: 15000, description: 'Real TikTok likes.', features: ['Real Users'], badge: 'instant', speed: 'Day 20K', startTime: '0-10 Minutes', refill: true },
  { id: 'tt-likes-2', name: 'TikTok Video Likes', category: 'Likes', platform: 'TikTok', price: 0.99, min: 1000, max: 15000, description: 'Fast likes delivery.', features: ['Instant Delivery'], speed: 'Day 50K', startTime: '0-5 Minutes', refill: false },
  { id: 'tt-views-1', name: 'TikTok Views - Viral', category: 'Views', platform: 'TikTok', price: 0.35, min: 1000, max: 15000, description: 'Massive TikTok views.', features: ['Ultra Fast'], badge: 'bestseller', speed: 'Day 1M+', startTime: '0-5 Minutes', refill: false },
  { id: 'tt-views-2', name: 'TikTok Views - Real', category: 'Views', platform: 'TikTok', price: 0.55, min: 1000, max: 15000, description: 'Real TikTok views.', features: ['Real Views'], badge: 'no-drop', speed: 'Day 500K', startTime: '0-10 Minutes', refill: true },
  { id: 'tt-shares-1', name: 'TikTok Shares', category: 'Shares', platform: 'TikTok', price: 1.99, min: 1000, max: 15000, description: 'Get more TikTok shares.', features: ['Real Shares'], speed: 'Day 10K', startTime: '0-2 Hours', refill: false },
  { id: 'tt-comments-1', name: 'TikTok Comments', category: 'Comments', platform: 'TikTok', price: 3.99, min: 1000, max: 15000, description: 'Custom comments.', features: ['Custom Comments'], speed: 'Day 1K', startTime: '0-4 Hours', refill: false },
  { id: 'yt-subscribers-1', name: 'YouTube Subscribers - Real', category: 'Subscribers', platform: 'YouTube', price: 8.99, min: 1000, max: 15000, description: 'Real YouTube subscribers.', features: ['Real Users'], badge: 'bestseller', speed: 'Day 200-500', startTime: '0-12 Hours', refill: true },
  { id: 'yt-subscribers-2', name: 'YouTube Subscribers - Fast', category: 'Subscribers', platform: 'YouTube', price: 12.99, min: 1000, max: 15000, description: 'Fast YouTube subscribers.', features: ['Fast Delivery'], speed: 'Day 1K-3K', startTime: '0-6 Hours', refill: false },
  { id: 'yt-views-1', name: 'YouTube Views - High Retention', category: 'Views', platform: 'YouTube', price: 2.99, min: 1000, max: 15000, description: 'High retention YouTube views.', features: ['4-8 Min Retention'], badge: 'no-drop', speed: 'Day 5K-10K', startTime: '0-2 Hours', refill: true },
  { id: 'yt-views-2', name: 'YouTube Views - Monetizable', category: 'Views', platform: 'YouTube', price: 3.99, min: 1000, max: 15000, description: 'Monetizable views.', features: ['AdSense Safe'], speed: 'Day 3K-5K', startTime: '0-4 Hours', refill: true },
  { id: 'yt-likes-1', name: 'YouTube Likes - Real', category: 'Likes', platform: 'YouTube', price: 1.99, min: 1000, max: 15000, description: 'Genuine YouTube likes.', features: ['Real Users'], badge: 'instant', speed: 'Day 10K', startTime: '0-30 Minutes', refill: true },
  { id: 'yt-comments-1', name: 'YouTube Comments - Custom', category: 'Comments', platform: 'YouTube', price: 9.99, min: 1000, max: 15000, description: 'Custom YouTube comments.', features: ['Custom Comments'], speed: 'Day 500', startTime: '0-6 Hours', refill: false },
  { id: 'yt-watchtime-1', name: 'YouTube Watch Hours', category: 'Watch Time', platform: 'YouTube', price: 4.99, min: 1000, max: 15000, description: 'Get 4000 watch hours.', features: ['Monetization Ready'], badge: 'bestseller', speed: 'Day 500-1000 Hours', startTime: '0-24 Hours', refill: true },
  { id: 'fb-followers-1', name: 'Facebook Page Followers', category: 'Followers', platform: 'Facebook', price: 1.79, min: 1000, max: 15000, description: 'Grow your Facebook page.', features: ['Real Users'], badge: 'bestseller', speed: 'Day 5K-10K', startTime: '0-2 Hours', refill: true },
  { id: 'fb-likes-1', name: 'Facebook Page Likes', category: 'Likes', platform: 'Facebook', price: 1.49, min: 1000, max: 15000, description: 'Get more Facebook likes.', features: ['Real Likes'], badge: 'instant', speed: 'Day 10K', startTime: '0-1 Hour', refill: true },
  { id: 'fb-likes-2', name: 'Facebook Post Likes', category: 'Likes', platform: 'Facebook', price: 0.79, min: 1000, max: 15000, description: 'Boost your posts.', features: ['Post Specific'], speed: 'Day 5K', startTime: '0-30 Minutes', refill: false },
  { id: 'fb-views-1', name: 'Facebook Video Views', category: 'Views', platform: 'Facebook', price: 0.65, min: 1000, max: 15000, description: 'Facebook video views.', features: ['Instant Start'], badge: 'instant', speed: 'Day 100K+', startTime: '0-10 Minutes', refill: false },
  { id: 'fb-story-1', name: 'Facebook Story Views', category: 'Story', platform: 'Facebook', price: 0.45, min: 1000, max: 15000, description: 'Facebook story views.', features: ['All Stories'], speed: 'Day 50K', startTime: '0-15 Minutes', refill: false },
  { id: 'fb-group-1', name: 'Facebook Group Members', category: 'Group', platform: 'Facebook', price: 2.49, min: 1000, max: 15000, description: 'Grow your Facebook group.', features: ['Real Members'], speed: 'Day 3K', startTime: '0-4 Hours', refill: true },
];

interface Service {
  id: string;
  name: string;
  category: string;
  platform: string;
  price: number;
  min: number;
  max: number;
  description: string;
  features: string[];
  badge?: string;
  speed: string;
  startTime: string;
  refill: boolean;
}

const ADMIN_PASSWORD = 'neonboost2024';

const AdminPanel = () => {
  const { isDarkMode } = useStore();
  const { isAuthenticated, login: storeLogin, logout: storeLogout, services: storeServices, setServices } = useAdminStore();

  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'services' | 'orders'>('services');
  const [orders, setOrders] = useState<any[]>([]);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [services, setLocalServices] = useState<Service[]>(defaultServices);
  const [newService, setNewService] = useState<Partial<Service>>({
    name: '', category: 'Followers', platform: 'Instagram', price: 1.99, min: 100, max: 10000, description: '', features: [], speed: 'Day 1K', startTime: '0-1 Hour', refill: false,
  });

  // Load services from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('neonboost-services');
    if (saved) {
      setLocalServices(JSON.parse(saved));
      setServices(JSON.parse(saved));
    } else {
      setLocalServices(defaultServices);
      setServices(defaultServices);
    }

    // Load orders from localStorage
    const savedOrders = localStorage.getItem('neonboost-orders');
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch (e) {
        console.error('Failed to parse orders:', e);
      }
    }
  }, []);

  // Save services to localStorage whenever they change
  const saveServices = (newServices: Service[]) => {
    setLocalServices(newServices);
    setServices(newServices);
    localStorage.setItem('neonboost-services', JSON.stringify(newServices));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        storeLogin('admin');
        toast.success('Login successful!');
      } else {
        toast.error('Invalid password');
      }
      setIsLoading(false);
    }, 500);
  };

  const handleLogout = () => {
    storeLogout();
    toast.info('Logged out');
  };

  const handleUpdateService = (service: Service) => {
    const updated = services.map(s => s.id === service.id ? service : s);
    saveServices(updated);
    setEditingService(null);
    toast.success('Service updated!');
  };

  const handleAddService = () => {
    const service: Service = {
      ...newService as Service,
      id: `${newService.platform?.toLowerCase()}-${newService.category?.toLowerCase()}-${Date.now()}`,
      features: newService.features || [],
    };
    saveServices([...services, service]);
    setIsAddingNew(false);
    setNewService({ name: '', category: 'Followers', platform: 'Instagram', price: 1.99, min: 100, max: 10000, description: '', features: [], speed: 'Day 1K', startTime: '0-1 Hour', refill: false });
    toast.success('Service added!');
  };

  const handleDeleteService = (id: string) => {
    if (!confirm('Delete this service?')) return;
    saveServices(services.filter(s => s.id !== id));
    toast.success('Service deleted!');
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    const updatedOrders = orders.map(order => 
      order.orderId === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem('neonboost-orders', JSON.stringify(updatedOrders));
    toast.success('Order status updated!');
  };

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen pt-20 pb-12 ${isDarkMode ? 'bg-background' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-8`}>
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                  <FiPackage className="w-8 h-8 text-white" />
                </div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Admin Panel</h1>
                <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Enter password to access</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-primary outline-none`} placeholder="Enter password" required />
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isLoading} className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-primary to-accent text-white font-semibold hover:opacity-90 disabled:opacity-50">
                  {isLoading ? 'Logging in...' : 'Login'}
                </motion.button>
              </form>
              <div className="mt-6 text-center">
                <Link to="/" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-primary' : 'text-gray-600 hover:text-primary'}`}>Back to Home</Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const totalServices = services.length;
  const avgPrice = services.length > 0 ? (services.reduce((sum, s) => sum + s.price, 0) / services.length).toFixed(2) : '0';

  return (
    <div className={`min-h-screen pt-20 pb-12 ${isDarkMode ? 'bg-background' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Admin Panel</h1>
            <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage your services (stored in browser)</p>
          </div>
          <div className="flex gap-3">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setActiveTab('services')} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${activeTab === 'services' ? 'bg-primary text-white' : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
              <FiPackage /> Services
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setActiveTab('orders')} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${activeTab === 'orders' ? 'bg-primary text-white' : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
              <FiShoppingCart /> Orders ({orders.length})
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsAddingNew(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
              <FiPlus /> Add Service
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleLogout} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
              <FiLogOut /> Logout
            </motion.button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
            <div className="flex items-center justify-between">
              <div><p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Services</p><p className={`text-3xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{totalServices}</p></div>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center"><FiPackage className="w-6 h-6 text-primary" /></div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
            <div className="flex items-center justify-between">
              <div><p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Average Price</p><p className={`text-3xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${avgPrice}</p></div>
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center"><FiDollarSign className="w-6 h-6 text-accent" /></div>
            </div>
          </motion.div>
        </div>

        {activeTab === 'services' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Service</th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Platform</th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Price</th>
                  <th className={`px-6 py-4 text-right text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                {services.map((service) => (
                  <tr key={service.id} className={`${isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-4"><div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{service.name}</div></td>
                    <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${service.platform === 'Instagram' ? 'bg-pink-500/20 text-pink-400' : service.platform === 'TikTok' ? 'bg-black/20 text-gray-300' : service.platform === 'YouTube' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>{service.platform}</span></td>
                    <td className="px-6 py-4"><span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${service.price.toFixed(2)}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setEditingService(service)} className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30"><FiEdit2 size={16} /></motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDeleteService(service.id)} className="p-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30"><FiTrash2 size={16} /></motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
        )}

        {activeTab === 'orders' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
          <div className="overflow-x-auto">
            {orders.length === 0 ? (
              <div className={`p-12 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <FiShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No orders yet</p>
                <p className="text-sm mt-2">Orders will appear here when customers make purchases</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Order ID</th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Items</th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total</th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Bank</th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Date</th>
                    <th className={`px-6 py-4 text-right text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                  {orders.map((order) => (
                    <tr key={order.orderId} className={`${isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}>
                      <td className="px-6 py-4">
                        <span className={`font-mono text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{order.orderId?.slice(0, 8)}...</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {order.items?.map((item: any, idx: number) => (
                            <div key={idx} className="text-sm">
                              {item.name} x{item.quantity}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${order.total?.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{order.bank || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          order.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {order.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={order.status || 'pending'}
                            onChange={(e) => handleUpdateOrderStatus(order.orderId, e.target.value)}
                            className={`px-3 py-1 rounded-lg text-sm border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-primary outline-none`}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
        )}
      </div>

      <AnimatePresence>
        {editingService && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditingService(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Edit Service</h2>
                <button onClick={() => setEditingService(null)} className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><FiX size={20} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Service Name</label>
                  <input type="text" value={editingService.name} onChange={(e) => setEditingService({ ...editingService, name: e.target.value })} className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-primary outline-none`} />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Platform</label>
                  <select value={editingService.platform} onChange={(e) => setEditingService({ ...editingService, platform: e.target.value })} className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-primary outline-none`}>
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Facebook">Facebook</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category</label>
                  <select value={editingService.category} onChange={(e) => setEditingService({ ...editingService, category: e.target.value })} className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-primary outline-none`}>
                    <option value="Followers">Followers</option>
                    <option value="Likes">Likes</option>
                    <option value="Views">Views</option>
                    <option value="Comments">Comments</option>
                    <option value="Subscribers">Subscribers</option>
                    <option value="Watch Time">Watch Time</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Price ($)</label>
                  <input type="number" step="0.01" min="0" value={editingService.price} onChange={(e) => setEditingService({ ...editingService, price: parseFloat(e.target.value) || 0 })} className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-primary outline-none`} />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Min Order</label>
                  <input type="number" min="1" value={editingService.min} onChange={(e) => setEditingService({ ...editingService, min: parseInt(e.target.value) || 1 })} className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-primary outline-none`} />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Max Order</label>
                  <input type="number" min="1" value={editingService.max} onChange={(e) => setEditingService({ ...editingService, max: parseInt(e.target.value) || 1 })} className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-primary outline-none`} />
                </div>
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
                  <textarea value={editingService.description} onChange={(e) => setEditingService({ ...editingService, description: e.target.value })} rows={3} className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-primary outline-none`} />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleUpdateService(editingService)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"><FiSave /> Save Changes</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setEditingService(null)} className={`flex-1 py-3 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Cancel</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddingNew && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsAddingNew(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Add New Service</h2>
                <button onClick={() => setIsAddingNew(false)} className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><FiX size={20} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Service Name *</label>
                  <input type="text" value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-primary outline-none`} placeholder="e.g., Instagram Followers - Premium" />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Platform *</label>
                  <select value={newService.platform} onChange={(e) => setNewService({ ...newService, platform: e.target.value })} className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-primary outline-none`}>
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Facebook">Facebook</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category *</label>
                  <select value={newService.category} onChange={(e) => setNewService({ ...newService, category: e.target.value })} className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-primary outline-none`}>
                    <option value="Followers">Followers</option>
                    <option value="Likes">Likes</option>
                    <option value="Views">Views</option>
                    <option value="Comments">Comments</option>
                    <option value="Subscribers">Subscribers</option>
                    <option value="Watch Time">Watch Time</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Price ($) *</label>
                  <input type="number" step="0.01" min="0" value={newService.price} onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) || 0 })} className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-primary outline-none`} />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Min Order *</label>
                  <input type="number" min="1" value={newService.min} onChange={(e) => setNewService({ ...newService, min: parseInt(e.target.value) || 1 })} className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-primary outline-none`} />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Max Order *</label>
                  <input type="number" min="1" value={newService.max} onChange={(e) => setNewService({ ...newService, max: parseInt(e.target.value) || 1 })} className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-primary outline-none`} />
                </div>
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description *</label>
                  <textarea value={newService.description} onChange={(e) => setNewService({ ...newService, description: e.target.value })} rows={3} className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-primary outline-none`} placeholder="Describe your service..." />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAddService} disabled={!newService.name || !newService.description} className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"><FiPlus /> Add Service</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setIsAddingNew(false)} className={`flex-1 py-3 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Cancel</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPanel;
