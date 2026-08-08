const express = require('express');
const router = express.Router();
const Debate = require('../models/Debate');
const Vote = require('../models/Vote');
const { executeDebateRound } = require('../services/aiOrchestrator');

// Start a new debate
router.post('/start', async (req, res) => {
  try {
    const { topic, category, difficulty, style, ai1Model, ai2Model, totalRounds } = req.body;
    const debate = await Debate.create({
      topic, category, difficulty, style, ai1Model, ai2Model, totalRounds,
      status: 'in-progress', rounds: []
    });
    res.json({ debateId: debate._id, status: 'started' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Run a debate round
router.post('/:id/round', async (req, res) => {
  try {
    const { roundNumber } = req.body;
    const debate = await Debate.findById(req.params.id);
    if (!debate) return res.status(404).json({ error: 'Debate not found' });

    const roundData = await executeDebateRound({
      topic: debate.topic,
      style: debate.style,
      roundNumber,
      ai1Model: debate.ai1Model,
      ai2Model: debate.ai2Model,
      history: debate.rounds
    });

    debate.rounds.push(roundData);
    if (roundNumber >= debate.totalRounds) {
      debate.status = 'completed';
    }
    await debate.save();

    res.json(roundData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get leaderboard stats
router.get('/leaderboard', async (req, res) => {
  try {
    const debates = await Debate.find({ status: 'completed' });
    const stats = {};

    debates.forEach(d => {
      [d.ai1Model, d.ai2Model].forEach(m => {
        if (!stats[m]) stats[m] = { wins: 0, matches: 0 };
        stats[m].matches += 1;
      });
      if (d.winner && d.winner !== 'Draw' && stats[d.winner]) {
        stats[d.winner].wins += 1;
      }
    });

    const leaderboard = Object.keys(stats).map(model => ({
      model,
      wins: stats[model].wins,
      matches: stats[model].matches,
      winRate: stats[model].matches ? Math.round((stats[model].wins / stats[model].matches) * 100) : 0
    })).sort((a, b) => b.winRate - a.winRate);

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;