const mongoose = require('mongoose');

const RoundSchema = new mongoose.Schema({
  roundNumber: Number,
  ai1Response: String,
  ai2Response: String,
  ai1Metrics: { tokens: Number, timeMs: Number, words: Number },
  ai2Metrics: { tokens: Number, timeMs: Number, words: Number }
});

const DebateSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  category: { type: String, default: 'General' },
  difficulty: { type: String, default: 'Medium' },
  style: { type: String, default: 'Formal' },
  ai1Model: { type: String, required: true },
  ai2Model: { type: String, required: true },
  totalRounds: { type: Number, default: 4 },
  rounds: [RoundSchema],
  winner: { type: String, default: null },
  votes: {
    ai1Votes: { type: Number, default: 0 },
    ai2Votes: { type: Number, default: 0 },
    drawVotes: { type: Number, default: 0 }
  },
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Debate', DebateSchema);