const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
  debateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Debate', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  votedFor: { type: String, enum: ['ai1', 'ai2', 'draw'], required: true },
  createdAt: { type: Date, default: Date.now }
});

VoteSchema.index({ debateId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Vote', VoteSchema);