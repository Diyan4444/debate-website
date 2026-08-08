const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Explicitly load .env from current directory
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/debate', require('./routes/debate'));

// SPA Catch-All Route: Serve index.html for any frontend routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Server Configuration & Database Connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-debate';

console.log('Connecting to database host:', MONGODB_URI.includes('@') ? MONGODB_URI.split('@').pop() : MONGODB_URI);

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully!');
    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });