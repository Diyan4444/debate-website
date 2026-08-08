async function callAIProvider(model, systemPrompt, userPrompt) {
  const startTime = Date.now();
  let text = '';

  if (model.startsWith('gpt') || model === 'gpt-4o') {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });
    const data = await response.json();
    text = data.choices?.[0]?.message?.content || '[OpenAI API Error]';
  } else if (model.includes('claude')) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
        max_tokens: 800
      })
    });
    const data = await response.json();
    text = data.content?.[0]?.text || '[Anthropic API Error]';
  } else {
    // Fallback using Groq for Llama/DeepSeek open weights
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });
    const data = await response.json();
    text = data.choices?.[0]?.message?.content || '[Groq API Error]';
  }

  const timeMs = Date.now() - startTime;
  const words = text.split(/\s+/).length;
  const tokens = Math.round(words * 1.3);

  return { text, metrics: { tokens, timeMs, words } };
}

async function executeDebateRound(debateContext) {
  const { topic, style, roundNumber, ai1Model, ai2Model, history } = debateContext;

  const ai1System = `You are in an elite AI Debate Arena. Style: ${style}. Defend your stance logically and persuasively. Max 150 words.`;
  const ai2System = `You are in an elite AI Debate Arena. Style: ${style}. Counter your opponent directly with solid logic. Max 150 words.`;

  let ai1Prompt = `Topic: "${topic}". Round ${roundNumber}. Give your opening argument or rebuttal.`;
  let ai2Prompt = `Topic: "${topic}". Round ${roundNumber}. Counter this argument:\n\n"${history[history.length - 1]?.ai1Response || 'Opening round'}"`;

  if (roundNumber > 1) {
    ai1Prompt = `Topic: "${topic}". Round ${roundNumber}. Respond to your opponent's statement:\n\n"${history[history.length - 1]?.ai2Response || ''}"`;
  }

  const ai1Res = await callAIProvider(ai1Model, ai1System, ai1Prompt);
  const ai2Res = await callAIProvider(ai2Model, ai2System, ai2Prompt);

  return {
    roundNumber,
    ai1Response: ai1Res.text,
    ai2Response: ai2Res.text,
    ai1Metrics: ai1Res.metrics,
    ai2Metrics: ai2Res.metrics
  };
}

module.exports = { executeDebateRound };