/**
 * NeonBoost Panel Backend
 * Node.js + Express + MongoDB + Telegram Bot
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection
let db;
const mongoClient = new MongoClient(process.env.MONGODB_URI);

async function connectDB() {
  try {
    await mongoClient.connect();
    db = mongoClient.db('neonboost');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

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
  limits: { fileSize: 5 * 1024 * 1024 },
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

// Services still loaded from JSON file
let services = require('./services.json');

// GET /api/services
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
    res.json({ success: true, data: servicesData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch services', error: error.message });
  }
});

// POST /api/orders
app.post('/api/orders', upload.single('paymentProof'), async (req, res) => {
  try {
    const { orderId, items, total, bank } = req.body;

    if (!orderId || !items || !total || !bank) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
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

    await db.collection('orders').insertOne(order);

    console.log('=== ORDER RECEIVED ===');
    console.log('Order ID:', orderId);
    console.log('Telegram Bot configured:', !!process.env.TELEGRAM_BOT_TOKEN);

    if (process.env.TELEGRAM_BOT_TOKEN) {
      console.log('Calling sendTelegramMessage...');
      await sendTelegramMessage(order);
      console.log('sendTelegramMessage completed');
    } else {
      console.log('No Telegram bot token, skipping notification');
    }

    res.status(201).json({ success: true, orderId: order.orderId, message: 'Order placed successfully' });
  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({ success: false, message: 'Failed to place order', error: error.message });
  }
});

// GET /api/orders/:id
app.get('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await db.collection('orders').findOne({ orderId: id });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
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
    res.status(500).json({ success: false, message: 'Failed to fetch order', error: error.message });
  }
});

// Telegram message
async function sendTelegramMessage(order, retries = 10, delay = 5000) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  console.log('Telegram Bot Token configured:', botToken ? 'YES' : 'NO');
  console.log('Telegram Chat ID configured:', chatId ? 'YES' : 'NO');

  if (!botToken || !chatId) {
    console.error('Telegram bot token or chat ID is not set!');
    return;
  }

  const itemsList = order.items
    .map(item => `• ${item.serviceName}\n  📊 Qty: ${item.quantity.toLocaleString()} (₾${item.total.toFixed(2)})\n  🔗 Link: ${item.link}`)
    .join('\n\n');

  const message = `🎉 <b>New Order Received!</b>\n\n` +
    `📋 <b>Order ID:</b> <code>${order.orderId}</code>\n` +
    `💰 <b>Total:</b> ₾${order.total.toFixed(2)}\n` +
    `🏦 <b>Bank:</b> ${order.bank}\n\n` +
    `📦 <b>Items:</b>\n${itemsList || 'No items'}\n\n` +
    `🕐 <b>Time:</b> ${new Date(order.createdAt).toLocaleString()}\n\n` +
    `<i>NeonBoost Panel</i>`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Sending Telegram message... Attempt ${attempt}/${retries}`);
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
      });

      const data = await response.json();

      if (data.ok) {
        console.log('Telegram message sent successfully');
        if (order.paymentProof) {
          await sendTelegramPhoto(order, botToken, chatId, retries, delay);
        }
        return;
      } else if (data.error_code === 429) {
        const retryAfter = data.parameters?.retry_after || 5;
        console.log(`Rate limited! Waiting ${retryAfter}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        delay *= 2;
      } else {
        console.error('Telegram message failed:', data.description);
        return;
      }
    } catch (error) {
      console.error('Failed to send Telegram message:', error.message);
      if (attempt === retries) return;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  console.log('All Telegram retry attempts exhausted');
}

// Telegram photo
async function sendTelegramPhoto(order, botToken, chatId, retries = 10, delay = 5000) {
  if (!order.paymentProof) {
    console.log('No payment proof to send');
    return;
  }

  const baseUrl = process.env.APP_URL || 'https://neonboost-backend.onrender.com';
  const photoUrl = `${baseUrl}${order.paymentProof}`;
  console.log('Sending payment proof photo:', photoUrl);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Sending Telegram photo... Attempt ${attempt}/${retries}`);
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          photo: photoUrl,
          caption: `📎 Payment Proof for Order: ${order.orderId}`,
          parse_mode: 'HTML',
        }),
      });

      const data = await response.json();

      if (data.ok) {
        console.log('Telegram photo sent successfully');
        return;
      } else if (data.error_code === 429) {
        const retryAfter = data.parameters?.retry_after || 5;
        console.log(`Rate limited! Waiting ${retryAfter}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        delay *= 2;
      } else {
        console.error('Telegram photo failed:', data.description);
        return;
      }
    } catch (error) {
      console.error('Failed to send Telegram photo:', error.message);
      if (attempt === retries) return;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  console.log('All Telegram photo retry attempts exhausted');
}

// Contact form
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    console.log('=== CONTACT FORM SUBMISSION ===');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Subject:', subject || 'No subject');
    console.log('Message:', message);

    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;

      const contactMessage = `📬 <b>New Contact Form Submission!</b>\n\n` +
        `👤 <b>Name:</b> ${name}\n` +
        `📧 <b>Email:</b> ${email}\n` +
        `📝 <b>Subject:</b> ${subject || 'No subject'}\n\n` +
        `💬 <b>Message:</b>\n${message}\n\n` +
        `<i>NeonBoost Panel</i>`;

      try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: contactMessage, parse_mode: 'HTML' }),
        });
        const data = await response.json();
        if (data.ok) {
          console.log('Telegram contact notification sent successfully');
        } else {
          console.log('Telegram error:', data.description);
        }
      } catch (telegramError) {
        console.error('Failed to send Telegram notification:', telegramError);
      }
    }

    res.status(201).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'NeonBoost API is running', timestamp: new Date().toISOString() });
});

// Debug
app.get('/api/debug', (req, res) => {
  res.json({
    telegramBotConfigured: !!process.env.TELEGRAM_BOT_TOKEN,
    telegramChatIdConfigured: !!process.env.TELEGRAM_CHAT_ID,
    mongodbConfigured: !!process.env.MONGODB_URI,
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
  });
});

// Admin Auth
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'No authorization header provided' });
  }
  const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString();
  const [username, password] = credentials.split(':');
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Invalid credentials' });
  }
};

// POST /api/admin/login
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

// GET /api/admin/orders
app.get('/api/admin/orders', authenticateAdmin, async (req, res) => {
  try {
    const allOrders = await db.collection('orders').find({}).sort({ createdAt: -1 }).toArray();
    res.json({ success: true, data: allOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error: error.message });
  }
});

// GET /api/admin/services
app.get('/api/admin/services', authenticateAdmin, (req, res) => {
  try {
    res.json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch services', error: error.message });
  }
});

// POST /api/admin/services
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
    fs.writeFileSync(path.join(__dirname, 'services.json'), JSON.stringify(services, null, 2));
    res.status(201).json({ success: true, message: 'Service added successfully', service: newService });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add service', error: error.message });
  }
});

// PUT /api/admin/services/:id
app.put('/api/admin/services/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const serviceIndex = services.findIndex(s => s.id === id);
    if (serviceIndex === -1) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    services[serviceIndex] = { ...services[serviceIndex], ...updates, id };
    fs.writeFileSync(path.join(__dirname, 'services.json'), JSON.stringify(services, null, 2));
    res.json({ success: true, message: 'Service updated successfully', service: services[serviceIndex] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update service', error: error.message });
  }
});

// DELETE /api/admin/services/:id
app.delete('/api/admin/services/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const serviceIndex = services.findIndex(s => s.id === id);
    if (serviceIndex === -1) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    const deletedService = services.splice(serviceIndex, 1)[0];
    fs.writeFileSync(path.join(__dirname, 'services.json'), JSON.stringify(services, null, 2));
    res.json({ success: true, message: 'Service deleted successfully', service: deletedService });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete service', error: error.message });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server after connecting to MongoDB
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 NeonBoost API server running on port ${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  });
});

module.exports = app;
