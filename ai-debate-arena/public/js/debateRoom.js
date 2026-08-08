function renderDebateRoom() {
  return `
    <div class="max-w-7xl mx-auto py-10 px-6 w-full flex flex-col gap-8 flex-grow">
      <!-- Setup Panel -->
      <div id="setupPanel" class="glass-card rounded-3xl p-8 border border-slate-800 shadow-2xl">
        <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <i class="fa-solid fa-sliders text-cyan-400"></i> Configure Debate Matchup
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div class="space-y-2 lg:col-span-2">
            <label class="text-sm font-semibold text-slate-300">Debate Topic</label>
            <input type="text" id="topicInput" placeholder="e.g., Should AGI be open-sourced?" class="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition">
          </div>
          <div class="space-y-2">
            <label class="text-sm font-semibold text-slate-300">Debate Style</label>
            <select id="styleSelect" class="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition">
              <option value="Formal">Formal & Logical</option>
              <option value="Aggressive">Aggressive & Critical</option>
              <option value="Scientific">Scientific & Empirical</option>
              <option value="Philosophical">Philosophical</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-semibold text-slate-300">Rounds</label>
            <select id="roundsSelect" class="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition">
              <option value="2">2 Rounds</option>
              <option value="4" selected>4 Rounds</option>
              <option value="6">6 Rounds</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div class="space-y-2">
            <label class="text-sm font-semibold text-cyan-400">AI Model #1 (Proponent)</label>
            <select id="ai1Select" class="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition">
              <option value="gpt-4o">GPT-4o</option>
              <option value="claude-3-5">Claude 3.5 Sonnet</option>
              <option value="llama-3.3">Llama 3.3 70B</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-semibold text-indigo-400">AI Model #2 (Opponent)</label>
            <select id="ai2Select" class="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition">
              <option value="claude-3-5">Claude 3.5 Sonnet</option>
              <option value="gpt-4o">GPT-4o</option>
              <option value="llama-3.3">Llama 3.3 70B</option>
            </select>
          </div>
        </div>

        <button onclick="startDebateSession()" class="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-lg shadow-xl shadow-cyan-500/25 transition">
          Start Live Debate Match <i class="fa-solid fa-play ml-2"></i>
        </button>
      </div>

      <!-- Live Split-Screen Arena -->
      <div id="arenaContainer" class="hidden grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow">
        <div class="glass-card rounded-3xl p-6 border border-cyan-500/30 flex flex-col h-[600px]">
          <div class="flex items-center justify-between pb-4 border-b border-slate-800">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">AI 1</div>
              <h3 id="ai1Title" class="font-bold text-lg text-white">Model 1</h3>
            </div>
            <span id="ai1Status" class="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-400">Waiting...</span>
          </div>
          <div id="ai1ChatLog" class="flex-grow overflow-y-auto py-4 space-y-4 pr-2 font-mono text-sm text-slate-300"></div>
        </div>

        <div class="glass-card rounded-3xl p-6 border border-indigo-500/30 flex flex-col h-[600px]">
          <div class="flex items-center justify-between pb-4 border-b border-slate-800">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">AI 2</div>
              <h3 id="ai2Title" class="font-bold text-lg text-white">Model 2</h3>
            </div>
            <span id="ai2Status" class="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-400">Waiting...</span>
          </div>
          <div id="ai2ChatLog" class="flex-grow overflow-y-auto py-4 space-y-4 pr-2 font-mono text-sm text-slate-300"></div>
        </div>
      </div>
    </div>
  `;
}

async function startDebateSession() {
  const topic = document.getElementById('topicInput').value.trim();
  if (!topic) {
    alert('Please enter a debate topic');
    return;
  }

  const style = document.getElementById('styleSelect').value;
  const totalRounds = parseInt(document.getElementById('roundsSelect').value);
  const ai1Model = document.getElementById('ai1Select').value;
  const ai2Model = document.getElementById('ai2Select').value;

  document.getElementById('setupPanel').classList.add('hidden');
  document.getElementById('arenaContainer').classList.remove('hidden');

  document.getElementById('ai1Title').innerText = ai1Model;
  document.getElementById('ai2Title').innerText = ai2Model;

  try {
    const initRes = await fetch(`${API_BASE}/debate/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, style, ai1Model, ai2Model, totalRounds })
    });
    const { debateId } = await initRes.json();

    for (let r = 1; r <= totalRounds; r++) {
      document.getElementById('ai1Status').innerText = `Round ${r} Speaking...`;
      document.getElementById('ai2Status').innerText = `Listening...`;

      const roundRes = await fetch(`${API_BASE}/debate/${debateId}/round`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roundNumber: r })
      });
      const roundData = await roundRes.json();

      appendStreamMessage('ai1ChatLog', `Round ${r}:`, roundData.ai1Response);
      document.getElementById('ai1Status').innerText = `Complete (${roundData.ai1Metrics.timeMs}ms)`;
      
      document.getElementById('ai2Status').innerText = `Round ${r} Speaking...`;
      appendStreamMessage('ai2ChatLog', `Round ${r}:`, roundData.ai2Response);
      document.getElementById('ai2Status').innerText = `Complete (${roundData.ai2Metrics.timeMs}ms)`;
    }

    document.getElementById('ai1Status').innerText = 'Debate Finished';
    document.getElementById('ai2Status').innerText = 'Debate Finished';
  } catch (err) {
    console.error(err);
    alert('An error occurred during debate streaming execution.');
  }
}

function appendStreamMessage(containerId, title, text) {
  const container = document.getElementById(containerId);
  const div = document.createElement('div');
  div.className = 'p-4 rounded-xl bg-slate-900/80 border border-slate-800';
  div.innerHTML = `<span class="text-cyan-400 font-bold block mb-1">${title}</span><p class="text-slate-300">${text}</p>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}