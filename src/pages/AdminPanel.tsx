import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPackage, FiDollarSign, FiShoppingCart, FiLogOut } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAdminStore } from '../store/useAdminStore';
import { useStore } from '../store/useStore';
import { services as staticServices, Service } from '../data/services';

const ADMIN_PASSWORD = 'neonboost2024';

const AdminPanel = () => {
  const { isDarkMode } = useStore();
  const { isAuthenticated, login: storeLogin, logout: storeLogout, orders: storeOrders, setOrders } = useAdminStore();

  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'services' | 'orders'>('services');
  const [orders, setLocalOrders] = useState<any[]>([]);

  // Use static prices from services.ts - NO localStorage, NO editing, NO fetching
  const services: Service[] = staticServices;

  // Load orders from localStorage on mount only
  useEffect(() => {
    const savedOrders = localStorage.getItem('neonboost-orders');
    if (savedOrders) {
      try {
        const parsedOrders = JSON.parse(savedOrders);
        setLocalOrders(parsedOrders);
        setOrders(parsedOrders);
      } catch (e) {
        console.error('Failed to parse orders:', e);
      }
    }
  }, [setOrders]);

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

  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    const updatedOrders = orders.map(order => 
      order.orderId === orderId ? { ...order, status: newStatus } : order
    );
    setLocalOrders(updatedOrders);
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
            <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>View services and manage orders (Prices are static - edit in code)</p>
          </div>
          <div className="flex gap-3">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setActiveTab('services')} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${activeTab === 'services' ? 'bg-primary text-white' : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
              <FiPackage /> Services
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setActiveTab('orders')} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${activeTab === 'orders' ? 'bg-primary text-white' : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
              <FiShoppingCart /> Orders ({orders.length})
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
              <div><p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Average Price (GEL)</p><p className={`text-3xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₾{avgPrice}</p></div>
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center"><FiDollarSign className="w-6 h-6 text-accent" /></div>
            </div>
          </motion.div>
        </div>

        {activeTab === 'services' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
          <div className="p-6 mb-4">
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <strong>Note:</strong> Prices are static in GEL and stored in the code. To change prices, edit <code className={`px-2 py-1 rounded ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>src/data/services.ts</code> and rebuild.
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Service</th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Platform</th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category</th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Price (GEL)</th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Min</th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Max</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                {services.map((service) => (
                  <tr key={service.id} className={`${isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-4"><div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{service.name}</div></td>
                    <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${service.platform === 'Instagram' ? 'bg-pink-500/20 text-pink-400' : service.platform === 'TikTok' ? 'bg-black/20 text-gray-300' : 'bg-blue-500/20 text-blue-400'}`}>{service.platform}</span></td>
                    <td className="px-6 py-4"><span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{service.category}</span></td>
                    <td className="px-6 py-4"><span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₾{service.price.toFixed(2)}</span></td>
                    <td className="px-6 py-4"><span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{service.min.toLocaleString()}</span></td>
                    <td className="px-6 py-4"><span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{service.max.toLocaleString()}</span></td>
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
                        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₾{order.total?.toFixed(2)}</span>
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
    </div>
  );
};

export default AdminPanel;
