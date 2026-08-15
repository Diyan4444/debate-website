const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

/* -----------------------------
   API ROUTES
----------------------------- */

app.use('/api/auth', require('./routes/auth'));
app.use('/api/debate', require('./routes/debate'));

/* -----------------------------
   HEALTH CHECK
----------------------------- */

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'AI Debate Arena API is running',
    timestamp: new Date().toISOString()
  });
});

/* -----------------------------
   SERVE FRONTEND
----------------------------- */

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* -----------------------------
   DATABASE + SERVER
----------------------------- */

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing in .env');
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log('✅ Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`🚀 AI Debate Arena running at http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('❌ Server startup failed:');
    console.error(error.message);
    process.exit(1);
  }
}

startServer();