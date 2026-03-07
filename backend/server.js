/**
 * NeonBoost SMM Panel Backend
 * Node.js + Express + MongoDB + Discord Webhook
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  },
});

// In-memory storage (replace with MongoDB in production)
let orders = [];
let services = require('./services.json');

// Routes

// GET /api/services - Get all services
app.get('/api/services', (req, res) => {
  try {
    const servicesData = services.map(service => ({
      id: service.id,
      name: service.name,
      category: service.category,
      platform: service.platform,
      price: service.price,
      min: service.min,
      max: service.max,
      description: service.description,
      features: service.features,
      badge: service.badge,
      speed: service.speed,
      startTime: service.startTime,
      refill: service.refill,
    }));

    res.json({
      success: true,
      data: servicesData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
      error: error.message,
    });
  }
});

// POST /api/orders - Create new order
app.post('/api/orders', upload.single('paymentProof'), async (req, res) => {
  try {
    const { orderId, items, total, bank } = req.body;

    if (!orderId || !items || !total || !bank) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const parsedItems = JSON.parse(items);
    const paymentProofPath = req.file ? `/uploads/${req.file.filename}` : null;

    const order = {
      orderId,
      items: parsedItems,
      total: parseFloat(total),
      bank,
      paymentProof: paymentProofPath,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Save order
    orders.push(order);

    // Send Discord webhook notification
    if (process.env.DISCORD_WEBHOOK_URL) {
      await sendDiscordWebhook(order);
    }

    res.status(201).json({
      success: true,
      orderId: order.orderId,
      message: 'Order placed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to place order',
      error: error.message,
    });
  }
});

// GET /api/orders/:id - Get order status
app.get('/api/orders/:id', (req, res) => {
  try {
    const { id } = req.params;
    const order = orders.find(o => o.orderId === id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.json({
      success: true,
      order: {
        orderId: order.orderId,
        status: order.status,
        items: order.items,
        total: order.total,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message,
    });
  }
});

// Function to send Discord webhook
async function sendDiscordWebhook(order) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL || process.env.VITE_DISCORD_WEBHOOK_URL;
  
  console.log('Discord Webhook URL configured:', webhookUrl ? 'YES' : 'NO');
  
  if (!webhookUrl) {
    console.error('Discord webhook URL is not set!');
    return;
  }

  const itemsList = order.items
    .map(item => `• ${item.serviceName}: ${item.quantity.toLocaleString()} ($${item.total.toFixed(2)})`)
    .join('\n');

  const embed = {
    title: '🎉 New Order Received!',
    color: 0x00bfff,
    fields: [
      {
        name: '📋 Order ID',
        value: order.orderId,
        inline: true,
      },
      {
        name: '💰 Total',
        value: `$${order.total.toFixed(2)}`,
        inline: true,
      },
      {
        name: '🏦 Bank',
        value: order.bank,
        inline: true,
      },
      {
        name: '📦 Items',
        value: itemsList || 'No items',
      },
      {
        name: '🕐 Time',
        value: new Date(order.createdAt).toLocaleString(),
      },
    ],
    footer: {
      text: 'NeonBoost SMM Panel',
    },
    timestamp: new Date().toISOString(),
  };

  // Send JSON payload directly
  try {
    console.log('Sending Discord webhook...');
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ embeds: [embed] }),
    });
    
    if (response.ok) {
      console.log('Discord webhook sent successfully');
    } else {
      console.error('Discord webhook failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Failed to send Discord webhook:', error.message);
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'NeonBoost API is running',
    timestamp: new Date().toISOString(),
  });
});

// Admin Authentication Middleware
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'No authorization header provided',
    });
  }
  
  const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString();
  const [username, password] = credentials.split(':');
  
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Invalid credentials',
    });
  }
};

// Admin Routes

// POST /api/admin/login - Admin login check
app.post('/api/admin/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.status(403).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
});

// GET /api/admin/services - Get all services (protected)
app.get('/api/admin/services', authenticateAdmin, (req, res) => {
  try {
    res.json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch services', error: error.message });
  }
});

// POST /api/admin/services - Add new service (protected)
app.post('/api/admin/services', authenticateAdmin, (req, res) => {
  try {
    const newService = req.body;
    
    if (!newService.id) {
      newService.id = `${newService.platform.toLowerCase()}-${newService.category.toLowerCase()}-${Date.now()}`;
    }
    
    const requiredFields = ['name', 'category', 'platform', 'price', 'min', 'max', 'description'];
    for (const field of requiredFields) {
      if (!newService[field]) {
        return res.status(400).json({ success: false, message: `Missing required field: ${field}` });
      }
    }
    
    newService.features = newService.features || [];
    newService.speed = newService.speed || 'Day 1K';
    newService.startTime = newService.startTime || '0-1 Hour';
    newService.refill = newService.refill || false;
    
    services.push(newService);
    
    // Save to file
    fs.writeFileSync(path.join(__dirname, 'services.json'), JSON.stringify(services, null, 2));
    
    res.status(201).json({ success: true, message: 'Service added successfully', service: newService });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add service', error: error.message });
  }
});

// PUT /api/admin/services/:id - Update service (protected)
app.put('/api/admin/services/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const serviceIndex = services.findIndex(s => s.id === id);
    
    if (serviceIndex === -1) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    
    services[serviceIndex] = { ...services[serviceIndex], ...updates, id };
    
    // Save to file
    fs.writeFileSync(path.join(__dirname, 'services.json'), JSON.stringify(services, null, 2));
    
    res.json({ success: true, message: 'Service updated successfully', service: services[serviceIndex] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update service', error: error.message });
  }
});

// DELETE /api/admin/services/:id - Delete service (protected)
app.delete('/api/admin/services/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    
    const serviceIndex = services.findIndex(s => s.id === id);
    
    if (serviceIndex === -1) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    
    const deletedService = services.splice(serviceIndex, 1)[0];
    
    // Save to file
    fs.writeFileSync(path.join(__dirname, 'services.json'), JSON.stringify(services, null, 2));
    
    res.json({ success: true, message: 'Service deleted successfully', service: deletedService });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete service', error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 NeonBoost API server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
