import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

const ApiDocs = () => {
  const { isDarkMode } = useStore();

  const endpoints = [
    {
      method: 'GET',
      path: '/api/services',
      description: 'Get all available services',
      parameters: [],
      response: {
        success: true,
        data: [
          {
            id: 'ig-followers-1',
            name: 'Instagram Followers - Premium Real',
            platform: 'Instagram',
            price: 1.99,
            min: 100,
            max: 100000,
          },
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/orders',
      description: 'Create a new order',
      parameters: [
        { name: 'items', type: 'array', required: true, description: 'Array of order items' },
        { name: 'total', type: 'number', required: true, description: 'Order total' },
        { name: 'bank', type: 'string', required: true, description: 'Selected bank' },
        { name: 'paymentProof', type: 'file', required: true, description: 'Payment screenshot' },
      ],
      response: {
        success: true,
        orderId: 'ABC12345',
        message: 'Order placed successfully',
      },
    },
    {
      method: 'GET',
      path: '/api/orders/:id',
      description: 'Get order status by ID',
      parameters: [
        { name: 'id', type: 'string', required: true, description: 'Order ID' },
      ],
      response: {
        success: true,
        order: {
          id: 'ABC12345',
          status: 'processing',
          items: [],
          total: 25.99,
          createdAt: '2024-01-01T00:00:00Z',
        },
      },
    },
  ];

  const codeExamples = {
    curl: `curl -X GET https://api.neonboost.com/api/services \\
  -H "Content-Type: application/json"`,
    python: `import requests

response = requests.get('https://api.neonboost.com/api/services')
services = response.json()
print(services)`,
    javascript: `fetch('https://api.neonboost.com/api/services')
  .then(res => res.json())
  .then(data => console.log(data));`,
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold font-montserrat mb-4 text-center">
            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>API </span>
            <span className="gradient-text">Documentation</span>
          </h1>
          <p className={`text-center mb-12 max-w-2xl mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Integrate our services into your own applications using our REST API
          </p>

          {/* Introduction */}
          <div className="card-neon p-6 mb-8">
            <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Introduction
            </h2>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              Our API allows you to programmatically access our services. You can fetch available services,
              place orders, and check order status programmatically. The base URL for all API endpoints is:
            </p>
            <code className={`block mt-4 p-4 rounded-lg ${isDarkMode ? 'bg-black/50' : 'bg-gray-100'}`}>
              https://api.neonboost.com/api
            </code>
          </div>

          {/* Authentication */}
          <div className="card-neon p-6 mb-8">
            <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Authentication
            </h2>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              Our API currently supports guest access. No authentication is required for public endpoints.
              All orders are tracked by session or order ID.
            </p>
          </div>

          {/* Endpoints */}
          <div className="mb-8">
            <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              API Endpoints
            </h2>
            {endpoints.map((endpoint, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-neon p-6 mb-4"
              >
                <div className="flex items-center gap-4 mb-4">
                  <span
                    className={`px-3 py-1 rounded-md font-mono text-sm font-bold ${
                      endpoint.method === 'GET'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {endpoint.method}
                  </span>
                  <code className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {endpoint.path}
                  </code>
                </div>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{endpoint.description}</p>

                {endpoint.parameters.length > 0 && (
                  <div className="mt-4">
                    <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Parameters
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className={isDarkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'}>
                            <th className={`text-left py-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Name</th>
                            <th className={`text-left py-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Type</th>
                            <th className={`text-left py-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Required</th>
                            <th className={`text-left py-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {endpoint.parameters.map((param, i) => (
                            <tr key={i} className={isDarkMode ? 'border-b border-gray-800' : 'border-b border-gray-100'}>
                              <td className="py-2 font-mono text-primary">{param.name}</td>
                              <td className="py-2 text-gray-500">{param.type}</td>
                              <td className="py-2">
                                <span className={param.required ? 'text-red-400' : 'text-gray-500'}>
                                  {param.required ? 'Yes' : 'No'}
                                </span>
                              </td>
                              <td className="py-2 text-gray-400">{param.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Response
                  </h4>
                  <pre className={`p-4 rounded-lg overflow-x-auto text-sm ${isDarkMode ? 'bg-black/50' : 'bg-gray-100'}`}>
                    {JSON.stringify(endpoint.response, null, 2)}
                  </pre>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Code Examples */}
          <div>
            <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Code Examples
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(codeExamples).map(([lang, code]) => (
                <motion.div
                  key={lang}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card-neon p-4"
                >
                  <h3 className={`font-semibold mb-3 capitalize ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {lang}
                  </h3>
                  <pre className={`p-4 rounded-lg overflow-x-auto text-xs ${isDarkMode ? 'bg-black/50' : 'bg-gray-100'}`}>
                    {code}
                  </pre>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ApiDocs;
