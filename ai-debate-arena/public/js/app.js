const API_BASE = 'http://localhost:5000/api';

const router = {
  navigate: (viewName) => {
    const app = document.getElementById('app');
    window.scrollTo(0, 0);
    
    switch(viewName) {
      case 'landing':
        app.innerHTML = renderLanding();
        break;
      case 'debateRoom':
        app.innerHTML = renderDebateRoom();
        break;
      case 'leaderboard':
        app.innerHTML = renderLeaderboard();
        loadLeaderboardData();
        break;
      default:
        app.innerHTML = renderLanding();
    }
  }
};

function renderLanding() {
  return `
    <section class="relative overflow-hidden py-24 px-6 flex-grow flex items-center">
      <div class="max-w-5xl mx-auto text-center relative z-10 space-y-8">
        <div class="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-card border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wide uppercase">
          <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span>Live LLM Battle Engine Active</span>
        </div>
        <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
          Pit Any Two AIs Against Each Other in <span class="bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">Real-Time Debate</span>
        </h1>
        <p class="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
          Direct API streaming of structured arguments across multiple rounds evaluated by live scoring.
        </p>
        <div class="flex justify-center gap-4 pt-4">
          <button onclick="router.navigate('debateRoom')" class="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-lg shadow-xl shadow-cyan-500/25 transition">
            Enter The Arena <i class="fa-solid fa-arrow-right ml-2"></i>
          </button>
        </div>
      </div>
    </section>
  `;
}

function renderLeaderboard() {
  return `
    <div class="max-w-4xl mx-auto py-16 px-6 w-full flex-grow">
      <h2 class="text-3xl font-bold text-white mb-8">AI Model Leaderboard</h2>
      <div class="glass-card rounded-2xl overflow-hidden border border-slate-800">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-800 text-slate-400 text-sm">
              <th class="p-4 font-semibold">Rank & Model</th>
              <th class="p-4 font-semibold">Total Matches</th>
              <th class="p-4 font-semibold">Wins</th>
              <th class="p-4 font-semibold">Win Rate</th>
            </tr>
          </thead>
          <tbody id="leaderboardBody" class="divide-y divide-slate-800/60 text-slate-300">
            <tr><td colspan="4" class="p-8 text-center text-slate-500">Loading ranking data...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function loadLeaderboardData() {
  try {
    const res = await fetch(`${API_BASE}/debate/leaderboard`);
    const data = await res.json();
    const tbody = document.getElementById('leaderboardBody');
    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-slate-500">No completed debates recorded yet.</td></tr>`;
      return;
    }
    tbody.innerHTML = data.map((item, idx) => `
      <tr class="hover:bg-slate-900/50 transition">
        <td class="p-4 flex items-center space-x-3 font-semibold text-white">
          <span class="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">${idx + 1}</span>
          <span>${item.model}</span>
        </td>
        <td class="p-4">${item.matches}</td>
        <td class="p-4 text-cyan-400 font-bold">${item.wins}</td>
        <td class="p-4 font-mono">${item.winRate}%</td>
      </tr>
    `).join('');
  } catch (err) {
    console.error(err);
  }
}

document.addEventListener('DOMContentLoaded', () => router.navigate('landing'));