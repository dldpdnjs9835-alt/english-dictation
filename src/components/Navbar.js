import { sound } from '../services/sound.js';
import { GRADES, UNITS } from '../data/words.js';

export function renderNavbar(container, user, currentGrade, currentUnit, onOpenAuth, onGradeChange, onUnitChange, onNavigateMyPage, onNavigateHome) {
  const isMuted = sound.muted;
  
  container.innerHTML = `
    <nav class="navbar glass-card">
      <div class="logo-group" id="nav-logo">
        <span class="logo-icon">🎓</span>
        <span class="logo-title">영어 받아쓰기 모험</span>
      </div>

      <div class="nav-actions">
        <!-- Grade Select (1~6학년) -->
        <select id="grade-select" class="grade-select" style="min-width: 140px;">
          ${GRADES.map(g => `
            <option value="${g.key}" ${currentGrade === g.key ? 'selected' : ''}>${g.name}</option>
          `).join('')}
        </select>

        <!-- Unit Select (1~12단원) -->
        <select id="unit-select" class="grade-select" style="min-width: 100px; background: rgba(16, 185, 129, 0.2); border-color: #10b981;">
          ${UNITS.map(u => `
            <option value="${u.unit}" ${currentUnit === u.unit ? 'selected' : ''}>${u.name}</option>
          `).join('')}
        </select>

        <!-- Ticket Counter -->
        <div class="ticket-badge" title="현재 보유한 티켓 수">
          🎟️ <span id="ticket-count">${user.tickets}</span>장
        </div>

        <!-- MyPage Button -->
        <button id="btn-nav-mypage" class="btn-secondary" style="padding: 6px 14px; font-size: 0.9rem;">
          👤 마이페이지
        </button>

        <!-- Audio Toggle -->
        <button id="mute-toggle" class="btn-icon" title="${isMuted ? '음소거 해제' : '음소거'}">
          ${isMuted ? '🔇' : '🔊'}
        </button>

        <!-- User Profile Button -->
        <button id="user-profile-btn" class="user-profile-btn">
          <span class="user-avatar">${user.avatar || '👦'}</span>
          <span class="user-name">${user.name}</span>
        </button>
      </div>
    </nav>
  `;

  // Event Listeners
  container.querySelector('#nav-logo').addEventListener('click', () => {
    sound.playPop();
    onNavigateHome();
  });

  container.querySelector('#grade-select').addEventListener('change', (e) => {
    sound.playPop();
    onGradeChange(e.target.value);
  });

  container.querySelector('#unit-select').addEventListener('change', (e) => {
    sound.playPop();
    onUnitChange(parseInt(e.target.value));
  });

  container.querySelector('#btn-nav-mypage').addEventListener('click', () => {
    sound.playPop();
    onNavigateMyPage();
  });

  container.querySelector('#mute-toggle').addEventListener('click', () => {
    const muted = sound.toggleMute();
    container.querySelector('#mute-toggle').innerHTML = muted ? '🔇' : '🔊';
  });

  container.querySelector('#user-profile-btn').addEventListener('click', () => {
    sound.playPop();
    onOpenAuth();
  });
}
