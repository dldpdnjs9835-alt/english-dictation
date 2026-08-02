import { sound } from '../services/sound.js';
import { 
  subscribeTopTickets, 
  subscribeTopGamesCleared, 
  subscribeTopPerfectScores, 
  isFirebaseReady 
} from '../services/firebase.js';

export function renderHallOfFame(container, currentUser, localStorageManager, onBack) {
  let activeTab = 'tickets'; // 'tickets', 'games', or 'perfect'
  let ticketList = [];
  let gameList = [];
  let perfectList = [];

  function loadLocalData() {
    const allUsers = localStorageManager.getLocalHallOfFame();
    ticketList = [...allUsers].sort((a, b) => b.tickets - a.tickets).slice(0, 10);
    gameList = [...allUsers].sort((a, b) => b.gamesCleared - a.gamesCleared).slice(0, 10);
    perfectList = [...allUsers].sort((a, b) => (b.perfectScoreCount || 0) - (a.perfectScoreCount || 0)).slice(0, 10);
  }

  loadLocalData();

  function getActiveList() {
    if (activeTab === 'games') return gameList;
    if (activeTab === 'perfect') return perfectList;
    return ticketList;
  }

  function renderView() {
    container.innerHTML = `
      <div class="game-container glass-card">
        <div class="game-header">
          <button id="btn-hof-back" class="btn-secondary">◀ 메인으로</button>
          <h2 style="font-size: 1.5rem; font-weight: 900; background: linear-gradient(90deg, #fbbf24, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            🏆 명예의 전당 (Hall of Fame Top 10)
          </h2>
          <div style="font-size: 0.9rem; color: var(--text-muted);">
            ${isFirebaseReady ? '🔥 실시간 랭킹 (Firebase Sync)' : '💾 로컬 랭킹 모드'}
          </div>
        </div>

        <!-- Leaderboard Tabs -->
        <div class="hof-tabs" style="flex-wrap: wrap;">
          <div class="hof-tab ${activeTab === 'tickets' ? 'active' : ''}" id="tab-tickets">
            🎟️ 티켓 부자 왕
          </div>
          <div class="hof-tab ${activeTab === 'games' ? 'active' : ''}" id="tab-games">
            🎮 미니게임 클리어 왕
          </div>
          <div class="hof-tab ${activeTab === 'perfect' ? 'active' : ''}" id="tab-perfect">
            ⭐ 받아쓰기 100점 마스터
          </div>
        </div>

        <!-- Leaderboard List -->
        <div class="hof-list">
          ${renderListItems(getActiveList())}
        </div>
      </div>
    `;

    container.querySelector('#btn-hof-back').addEventListener('click', () => {
      sound.playPop();
      onBack();
    });

    container.querySelector('#tab-tickets').addEventListener('click', () => {
      sound.playPop();
      activeTab = 'tickets';
      renderView();
    });

    container.querySelector('#tab-games').addEventListener('click', () => {
      sound.playPop();
      activeTab = 'games';
      renderView();
    });

    container.querySelector('#tab-perfect').addEventListener('click', () => {
      sound.playPop();
      activeTab = 'perfect';
      renderView();
    });
  }

  function renderListItems(list) {
    if (!list || list.length === 0) {
      return `<div style="text-align: center; padding: 40px; color: var(--text-muted);">등록된 랭킹 데이터가 없습니다.</div>`;
    }

    return list.map((item, index) => {
      const rank = index + 1;
      let rankBadge = rank;
      if (rank === 1) rankBadge = '🥇';
      if (rank === 2) rankBadge = '🥈';
      if (rank === 3) rankBadge = '🥉';

      const isMe = item.id === currentUser.id;
      const highlightStyle = isMe ? 'border: 2px solid var(--accent-pink); background: rgba(236,72,153,0.2);' : '';

      let scoreDisplay = `🎟️ ${item.tickets || 0}장`;
      if (activeTab === 'games') scoreDisplay = `🎮 ${item.gamesCleared || 0}회`;
      if (activeTab === 'perfect') scoreDisplay = `⭐ ${item.perfectScoreCount || 0}회 만점`;

      return `
        <div class="hof-item rank-${rank > 3 ? 'other' : rank}" style="${highlightStyle}">
          <div class="rank-badge">${rankBadge}</div>
          <div class="user-info">
            <span class="user-avatar">${item.avatar || '👦'}</span>
            <span class="user-name">${item.name} ${isMe ? '<span style="color: var(--accent-pink); font-size: 0.8rem;">(나)</span>' : ''}</span>
          </div>
          <div class="score-value">
            ${scoreDisplay}
          </div>
        </div>
      `;
    }).join('');
  }

  renderView();

  // Setup Firebase real-time listeners if available
  if (isFirebaseReady) {
    subscribeTopTickets((data) => {
      if (data && data.length > 0) {
        ticketList = data;
        if (activeTab === 'tickets') renderView();
      }
    });

    subscribeTopGamesCleared((data) => {
      if (data && data.length > 0) {
        gameList = data;
        if (activeTab === 'games') renderView();
      }
    });

    subscribeTopPerfectScores((data) => {
      if (data && data.length > 0) {
        perfectList = data;
        if (activeTab === 'perfect') renderView();
      }
    });
  }
}
