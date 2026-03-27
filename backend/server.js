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


async function seedPromoCodes() {
  try {
    const defaults = [
      { code: 'NEON10', discount: 10, description: '10% off your order!' },
      { code: 'NINUCA1', discount: 5, description: '5% off your order!' },
    ];
    for (const promo of defaults) {
      // upsert: if exists update to ensure active:true, if not insert fresh
      await db.collection('promoCodes').updateOne(
        { code: promo.code },
        {
          $set: { discount: promo.discount, description: promo.description, active: true },
          $setOnInsert: { usageLimit: null, usedCount: 0 },
        },
        { upsert: true }
      );
      console.log('Ensured promo code:', promo.code);
    }
  } catch (e) {
    console.error('Seed error:', e.message);
  }
}

async function connectDB() {
  try {
    await mongoClient.connect();
    db = mongoClient.db('neonboost');
    await seedPromoCodes();
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

// Admin Auth - defined early so all routes can use it
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

// GET /api/promo/validate?code=XXX
app.get('/api/promo/validate', async (req, res) => {
  try {
    const code = (req.query.code || '').toString().toUpperCase().trim();
    if (!code) return res.status(400).json({ success: false, message: 'No code provided' });

    const promo = await db.collection('promoCodes').findOne({ code, active: true });
    if (!promo) return res.status(404).json({ success: false, message: 'invalid_code' });

    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      return res.status(410).json({ success: false, message: 'code_expired' });
    }

    return res.json({
      success: true,
      code: promo.code,
      discount: promo.discount,
      description: promo.description || `${promo.discount}% off`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/admin/promo - create promo code (admin only)
app.post('/api/admin/promo', authenticateAdmin, async (req, res) => {
  try {
    const { code, discount, description, usageLimit } = req.body;
    if (!code || !discount) return res.status(400).json({ success: false, message: 'code and discount required' });
    const upper = code.toUpperCase().trim();
    await db.collection('promoCodes').updateOne(
      { code: upper },
      { $set: { code: upper, discount: Number(discount), description: description || '', usageLimit: usageLimit || null, active: true, usedCount: 0 } },
      { upsert: true }
    );
    res.json({ success: true, message: 'Promo code saved' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/admin/promo - list all promo codes (admin only)
app.get('/api/admin/promo', authenticateAdmin, async (req, res) => {
  try {
    const promos = await db.collection('promoCodes').find({}).toArray();
    res.json({ success: true, promos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/admin/promo/:code - delete promo code (admin only)
app.delete('/api/admin/promo/:code', authenticateAdmin, async (req, res) => {
  try {
    await db.collection('promoCodes').deleteOne({ code: req.params.code.toUpperCase() });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/orders
app.post('/api/orders', upload.single('paymentProof'), async (req, res) => {
  try {
    const {
      orderId, items, total, bank, promoCode, discountAmount, originalTotal,
      isPackageOrder, packageId, packageName, packageFollowers, packageLikes,
      profileLink, postLink,
    } = req.body;

    if (!orderId || !items || !total || !bank) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const parsedItems = JSON.parse(items);
    const paymentProofPath = req.file ? `/uploads/${req.file.filename}` : null;

    // If promo code provided, increment its usage count
    if (promoCode) {
      await db.collection('promoCodes').updateOne(
        { code: promoCode.toUpperCase().trim(), active: true },
        { $inc: { usedCount: 1 } }
      );
    }

    const order = {
      orderId,
      items: parsedItems,
      total: parseFloat(total),
      originalTotal: originalTotal ? parseFloat(originalTotal) : parseFloat(total),
      discountAmount: discountAmount ? parseFloat(discountAmount) : 0,
      promoCode: promoCode || null,
      bank,
      paymentProof: paymentProofPath,
      status: 'pending',
      createdAt: new Date().toISOString(),
      // Package-specific fields
      isPackageOrder: isPackageOrder === 'true',
      packageId: packageId || null,
      packageName: packageName || null,
      packageFollowers: packageFollowers ? parseInt(packageFollowers) : null,
      packageLikes: packageLikes ? parseInt(packageLikes) : null,
      profileLink: profileLink || null,
      postLink: postLink || null,
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

  // If order used NINUCA1 promo, send to dedicated chat if configured
const isNinuca1 = order.promoCode && order.promoCode.toUpperCase() === 'NINUCA1';
console.log('isNinuca1:', isNinuca1);
const chatId = isNinuca1 && process.env.TELEGRAM_DISCORD5_CHAT_ID
  ? process.env.TELEGRAM_DISCORD5_CHAT_ID
  : process.env.TELEGRAM_CHAT_ID;

console.log('Telegram Bot Token configured:', botToken ? 'YES' : 'NO');
console.log('Telegram Chat ID configured:', chatId ? 'YES' : 'NO');
if (isNinuca1) console.log('NINUCA1 order - using dedicated chat:', !!process.env.TELEGRAM_DISCORD5_CHAT_ID);


  if (!botToken || !chatId) {
    console.error('Telegram bot token or chat ID is not set!');
    return;
  }

  const escape = (str) => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const itemsList = order.items
    .map(item => `• ${escape(item.serviceName)}\n  📊 Qty: ${item.quantity.toLocaleString()} (₾${item.total.toFixed(2)})\n  🔗 Link: ${escape(item.link)}`)
    .join('\n\n');

  const promoLine = order.promoCode
    ? `🏷️ <b>Promo:</b> ${escape(order.promoCode)} (-₾${(order.discountAmount || 0).toFixed(2)})\n`
    : '';

  // Package bundle section
  const packageSection = order.isPackageOrder
    ? `\n📦 <b>BUNDLE PACKAGE ORDER</b>\n` +
      `🎁 <b>Package:</b> ${escape(order.packageName || '')}\n` +
      `👥 <b>Followers:</b> ${(order.packageFollowers || 0).toLocaleString()}\n` +
      `❤️ <b>Likes:</b> ${(order.packageLikes || 0).toLocaleString()}\n` +
      `👤 <b>Profile Link:</b> ${escape(order.profileLink || '')}\n` +
      `🖼️ <b>Post Link:</b> ${escape(order.postLink || '')}\n`
    : '';

  const message = `🎉 <b>New Order Received!</b>\n\n` +
    `📋 <b>Order ID:</b> <code>${order.orderId}</code>\n` +
    (order.originalTotal && order.discountAmount > 0 ? `💸 <b>Original:</b> ₾${order.originalTotal.toFixed(2)}\n` : '') +
    promoLine +
    `💰 <b>Total:</b> ₾${order.total.toFixed(2)}\n` +
    `🏦 <b>Bank:</b> ${order.bank}\n` +
    packageSection +
    `\n📦 <b>Items:</b>\n${itemsList || 'No items'}\n\n` +
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
      const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      const contactMessage = `📬 <b>New Contact Form Submission!</b>\n\n` +
        `👤 <b>Name:</b> ${esc(name)}\n` +
        `📧 <b>Email:</b> ${esc(email)}\n` +
        `📝 <b>Subject:</b> ${esc(subject) || 'No subject'}\n\n` +
        `💬 <b>Message:</b>\n${esc(message)}\n\n` +
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


const FREE_TRIAL_LIMIT = 500;

// GET /api/free-trial/status
app.get("/api/free-trial/status", async (req, res) => {
  try {
    const count = await db.collection("free_trials").countDocuments();
    const remaining = Math.max(0, FREE_TRIAL_LIMIT - count);
    res.json({ success: true, remaining, limit: FREE_TRIAL_LIMIT, ended: remaining === 0 });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// POST /api/free-trial
app.post("/api/free-trial", async (req, res) => {
  try {
    const { instagramUsername, instagramLink } = req.body;
    if (!instagramUsername || instagramUsername.trim().length < 1) {
      return res.status(400).json({ success: false, message: "Instagram username is required." });
    }
    if (!instagramLink || instagramLink.trim().length < 1) {
      return res.status(400).json({ success: false, message: "Instagram profile link is required." });
    }

    const username = instagramUsername.trim().toLowerCase().replace(/^@/, "");
    const link = instagramLink.trim().toLowerCase().replace(/\/$/, "");
    const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket.remoteAddress;
    const collection = db.collection("free_trials");

    // Check 500 limit FIRST
    const totalClaims = await collection.countDocuments();
    if (totalClaims >= FREE_TRIAL_LIMIT) {
      return res.status(410).json({ success: false, message: "promotion_ended" });
    }

    // Check IP
    const ipClaim = await collection.findOne({ ip });
    if (ipClaim) return res.status(409).json({ success: false, message: "already_claimed_ip" });

    // Check username
    const usernameClaim = await collection.findOne({ username });
    if (usernameClaim) return res.status(409).json({ success: false, message: "already_claimed_username" });

    // Check profile link
    const linkClaim = await collection.findOne({ link });
    if (linkClaim) return res.status(409).json({ success: false, message: "already_claimed_link" });

    // Save
    await collection.insertOne({ ip, username, link, claimedAt: new Date() });
    const remaining = Math.max(0, FREE_TRIAL_LIMIT - (totalClaims + 1));

    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      const safeUsername = username.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const safeLink = link.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const msg =
        "🎁 <b>უფასო ფოლოვერი — ახალი მოთხოვნა!</b>\n\n" +
        "━━━━━━━━━━━━━━━━━━\n" +
        "👤 <b>პროფილის სახელი:</b> @" + safeUsername + "\n" +
        "🔗 <b>პროფილის ბმული:</b> " + safeLink + "\n" +
        "━━━━━━━━━━━━━━━━━━\n" +
        "📊 დარჩენილია: <b>" + remaining + " / " + FREE_TRIAL_LIMIT + "</b>\n" +
        "🕐 დრო: " + new Date().toLocaleString('ka-GE') + "\n\n" +
        "⚡️ <b>გაუგზავნე 50 ფოლოვერი ზემოთ მოცემულ ბმულზე!</b>";
      const freeChatId = process.env.TELEGRAM_FREE_TRIAL_CHAT_ID || process.env.TELEGRAM_CHAT_ID;
      await fetch("https://api.telegram.org/bot" + process.env.TELEGRAM_BOT_TOKEN + "/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: freeChatId, text: msg, parse_mode: "HTML" })
      }).catch(() => {});
    }
    res.status(201).json({ success: true, message: "claimed", remaining });
  } catch (error) {
    console.error("Free trial error:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
});

// ─── CryptoMus Integration ───────────────────────────────────────────────────

const crypto = require('crypto');

function cryptomusSign(body, apiKey) {
  const data = { ...body };
  const json = JSON.stringify(data);
  const base64 = Buffer.from(json).toString('base64');
  return crypto.createHash('md5').update(base64 + apiKey).digest('hex');
}

// POST /api/crypto/create-payment
app.post('/api/crypto/create-payment', async (req, res) => {
  try {
    const { orderId, amount, items, promoCode, discountAmount, originalTotal } = req.body;
    if (!orderId || !amount) {
      return res.status(400).json({ success: false, message: 'Missing orderId or amount' });
    }
    const merchantId = process.env.CRYPTOMUS_MERCHANT_ID;
    const apiKey = process.env.CRYPTOMUS_API_KEY;
    if (!merchantId || !apiKey) {
      return res.status(500).json({ success: false, message: 'CryptoMus is not configured on the server.' });
    }
    const appUrl = process.env.APP_URL || 'https://neonboost-backend.onrender.com';
    const frontendUrl = process.env.FRONTEND_URL || 'https://neonboost.ge';
    const body = {
      amount: String(parseFloat(amount).toFixed(2)),
      currency: 'USD',
      order_id: orderId,
      url_return: `${frontendUrl}/cart?crypto_return=1&orderId=${orderId}`,
      url_success: `${frontendUrl}/cart?crypto_success=1&orderId=${orderId}`,
      url_callback: `${appUrl}/api/crypto/webhook`,
      is_payment_multiple: false,
      lifetime: 3600,
    };
    const sign = cryptomusSign(body, apiKey);
    const response = await fetch('https://api.cryptomus.com/v1/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'merchant': merchantId, 'sign': sign },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!data.result || !data.result.url) {
      console.error('CryptoMus error:', data);
      return res.status(500).json({ success: false, message: data.message || 'Failed to create payment' });
    }
    const parsedItems = Array.isArray(items) ? items : JSON.parse(items || '[]');
    const order = {
      orderId,
      items: parsedItems,
      total: parseFloat(amount),
      originalTotal: originalTotal ? parseFloat(originalTotal) : parseFloat(amount),
      discountAmount: discountAmount ? parseFloat(discountAmount) : 0,
      promoCode: promoCode || null,
      bank: 'CryptoMus (USDT)',
      paymentProof: null,
      status: 'awaiting_crypto',
      cryptoPaymentId: data.result.uuid,
      createdAt: new Date().toISOString(),
    };
    await db.collection('orders').updateOne({ orderId }, { $set: order }, { upsert: true });
    res.json({ success: true, paymentUrl: data.result.url, paymentId: data.result.uuid });
  } catch (error) {
    console.error('CryptoMus create-payment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/crypto/webhook
app.post('/api/crypto/webhook', async (req, res) => {
  try {
    const apiKey = process.env.CRYPTOMUS_API_KEY;
    const payload = { ...req.body };
    const receivedSign = payload.sign;
    delete payload.sign;
    const expectedSign = cryptomusSign(payload, apiKey);
    if (receivedSign !== expectedSign) {
      console.error('CryptoMus webhook: invalid signature');
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }
    const { order_id, status } = payload;
    console.log(`CryptoMus webhook: order ${order_id} => ${status}`);
    if (status === 'paid' || status === 'paid_over') {
      const order = await db.collection('orders').findOne({ orderId: order_id });
      if (order && order.status !== 'paid') {
        await db.collection('orders').updateOne(
          { orderId: order_id },
          { $set: { status: 'paid', paidAt: new Date().toISOString() } }
        );
        if (order.promoCode) {
          await db.collection('promoCodes').updateOne(
            { code: order.promoCode.toUpperCase().trim(), active: true },
            { $inc: { usedCount: 1 } }
          );
        }
        if (process.env.TELEGRAM_BOT_TOKEN) {
          await sendTelegramMessage({ ...order, bank: 'CryptoMus (USDT) PAID' });
        }
      }
    }
    res.json({ success: true });
  } catch (error) {
    console.error('CryptoMus webhook error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/crypto/check/:orderId
app.get('/api/crypto/check/:orderId', async (req, res) => {
  try {
    const order = await db.collection('orders').findOne({ orderId: req.params.orderId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, status: order.status });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'NeonBoost API is running', timestamp: new Date().toISOString() });
});

// Test Telegram — main chat
app.get('/api/test-telegram', async (req, res) => {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    return res.status(500).json({ success: false, message: 'Telegram not configured' });
  }
  try {
    const msg = '✅ <b>NeonBoost Test</b>\n\nMain chat notification is working!\n🕐 ' + new Date().toLocaleString('ka-GE');
    const response = await fetch('https://api.telegram.org/bot' + process.env.TELEGRAM_BOT_TOKEN + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: msg, parse_mode: 'HTML' }),
    });
    const data = await response.json();
    if (data.ok) {
      res.json({ success: true, message: 'Test message sent to main chat!' });
    } else {
      res.status(500).json({ success: false, message: data.description });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Test Telegram — free trial chat
app.get('/api/test-telegram-freetrial', async (req, res) => {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return res.status(500).json({ success: false, message: 'Telegram not configured' });
  }
  const chatId = process.env.TELEGRAM_FREE_TRIAL_CHAT_ID || process.env.TELEGRAM_CHAT_ID;
  if (!chatId) {
    return res.status(500).json({ success: false, message: 'No chat ID configured' });
  }
  try {
    const msg =
      '🎁 <b>NeonBoost Free Trial Test</b>\n\n' +
      '━━━━━━━━━━━━━━━━━━\n' +
      '👤 <b>პროფილის სახელი:</b> @test_user\n' +
      '🔗 <b>პროფილის ბმული:</b> https://instagram.com/test_user\n' +
      '━━━━━━━━━━━━━━━━━━\n' +
      '📊 დარჩენილია: <b>499 / 500</b>\n' +
      '🕐 დრო: ' + new Date().toLocaleString('ka-GE') + '\n\n' +
      '⚡️ <b>გაუგზავნე 50 ფოლოვერი ზემოთ მოცემულ ბმულზე!</b>\n\n' +
      '<i>(ეს არის სატესტო შეტყობინება)</i>';
    const response = await fetch('https://api.telegram.org/bot' + process.env.TELEGRAM_BOT_TOKEN + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'HTML' }),
    });
    const data = await response.json();
    if (data.ok) {
      res.json({ success: true, message: 'Test message sent to free trial chat!', chatId });
    } else {
      res.status(500).json({ success: false, message: data.description, chatId });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
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
