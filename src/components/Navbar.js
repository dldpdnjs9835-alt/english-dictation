import { sound } from '../services/sound.js';

export function renderNavbar(container, user, currentGrade, onOpenAuth, onGradeChange, onNavigateHome) {
  const isMuted = sound.muted;
  
  container.innerHTML = `
    <nav class="navbar glass-card">
      <div class="logo-group" id="nav-logo">
        <span class="logo-icon">🎓</span>
        <span class="logo-title">영어 받아쓰기 모험</span>
      </div>

      <div class="nav-actions">
        <!-- Grade Select -->
        <select id="grade-select" class="grade-select">
          <option value="grade1_2" ${currentGrade === 'grade1_2' ? 'selected' : ''}>초등 1~2학년 (기초)</option>
          <option value="grade3_4" ${currentGrade === 'grade3_4' ? 'selected' : ''}>초등 3~4학년 (중급)</option>
          <option value="grade5_6" ${currentGrade === 'grade5_6' ? 'selected' : ''}>초등 5~6학년 (고급)</option>
        </select>

        <!-- Ticket Counter -->
        <div class="ticket-badge" title="현재 보유한 티켓 수">
          🎟️ <span id="ticket-count">${user.tickets}</span>장
        </div>

        <!-- Audio Toggle -->
        <button id="mute-toggle" class="btn-icon" title="${isMuted ? '음소거 해제' : '음소거'}">
          ${isMuted ? '🔇' : '🔊'}
        </button>

        <!-- User Profile & Login Button -->
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

  container.querySelector('#mute-toggle').addEventListener('click', () => {
    const muted = sound.toggleMute();
    container.querySelector('#mute-toggle').innerHTML = muted ? '🔇' : '🔊';
  });

  container.querySelector('#user-profile-btn').addEventListener('click', () => {
    sound.playPop();
    onOpenAuth();
  });
}
