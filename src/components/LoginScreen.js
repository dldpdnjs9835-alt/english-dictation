import { sound } from '../services/sound.js';
import { AVATARS } from '../data/words.js';
import { loginWithGoogle, loginAnonymously, isFirebaseReady } from '../services/firebase.js';

export function renderLoginScreen(container, user, onLoginSuccess) {
  let selectedAvatar = user.avatar || AVATARS[0];

  container.innerHTML = `
    <div class="game-container glass-card" style="max-width: 600px; margin: 40px auto; padding: 40px 32px; text-align: center;">
      <!-- Welcome Header -->
      <div style="font-size: 4rem; animation: bounce 2s infinite ease-in-out;">🎓</div>
      <h1 style="font-size: 2.2rem; font-weight: 900; margin: 12px 0 6px 0; background: linear-gradient(90deg, #c084fc, #f472b6, #fbbf24); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
        영어 받아쓰기 모험
      </h1>
      <p style="font-size: 1.1rem; color: var(--text-muted); margin-bottom: 24px;">
        미니게임으로 즐겁게 단어를 외우고, 가상 선생님과 받아쓰기 시험을 치러 명예의 전당에 도전하세요!
      </p>

      <!-- Primary Action: Google Login Button -->
      <div style="margin-bottom: 24px;">
        <button id="btn-main-google-login" class="btn-primary" style="font-size: 1.25rem; width: 100%; padding: 16px; border-radius: 50px; background: linear-gradient(135deg, #4285f4 0%, #34a853 50%, #f4b400 100%); box-shadow: 0 8px 25px rgba(66, 133, 244, 0.4); justify-content: center;">
          🌐 Google 계정으로 로그인하기
        </button>
      </div>

      <div style="position: relative; text-align: center; margin: 20px 0;">
        <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.15);" />
        <span style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: #1e293b; padding: 0 14px; font-weight: 700; color: var(--text-muted); font-size: 0.9rem;">
          또는 닉네임 설정 후 게스트로 시작
        </span>
      </div>

      <!-- Avatar Picker -->
      <div style="margin-top: 20px; text-align: left;">
        <label style="font-weight: 700; font-size: 0.95rem; display: block; margin-bottom: 8px; color: var(--text-muted);">
          내 아바타 선택:
        </label>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-bottom: 16px;" id="avatar-picker">
          ${AVATARS.map(av => `
            <button class="avatar-option-btn ${av === selectedAvatar ? 'active' : ''}" data-avatar="${av}" style="font-size: 1.8rem; background: ${av === selectedAvatar ? 'var(--primary)' : 'rgba(255,255,255,0.08)'}; border: 1px solid rgba(255,255,255,0.2); border-radius: 50%; width: 46px; height: 46px; cursor: pointer; transition: all 0.2s;">
              ${av}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Guest Nickname Input & Entry -->
      <div style="display: flex; gap: 10px; margin-bottom: 16px;">
        <input type="text" id="guest-nickname-input" class="dictation-input" style="font-size: 1.1rem; padding: 12px 20px; border-radius: var(--radius-md); text-align: left;" value="${user.name}" placeholder="어린이 닉네임..." />
        <button id="btn-guest-entry" class="btn-secondary" style="white-space: nowrap; font-size: 1rem; padding: 12px 24px;">
          👤 게스트 입장
        </button>
      </div>

      <div style="font-size: 0.85rem; color: var(--text-muted);">
        ${isFirebaseReady ? '🔥 Firebase 데이터베이스 실시간 연동됨' : '💾 로컬 오프라인 모드'}
      </div>
    </div>
  `;

  // Avatar Selection Listener
  container.querySelectorAll('.avatar-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sound.playPop();
      selectedAvatar = btn.getAttribute('data-avatar');
      container.querySelectorAll('.avatar-option-btn').forEach(b => {
        b.style.background = 'rgba(255,255,255,0.08)';
      });
      btn.style.background = 'var(--primary)';
    });
  });

  // Google Login Listener
  container.querySelector('#btn-main-google-login').addEventListener('click', async () => {
    sound.playPop();
    try {
      if (isFirebaseReady) {
        const fbUser = await loginWithGoogle();
        onLoginSuccess({
          ...user,
          id: fbUser.uid,
          name: fbUser.displayName || user.name,
          avatar: selectedAvatar,
          isAnonymous: false,
          isLoggedIn: true
        });
      } else {
        // Fallback in demo mode
        onLoginSuccess({
          ...user,
          name: user.name + ' (Google)',
          avatar: selectedAvatar,
          isAnonymous: false,
          isLoggedIn: true
        });
      }
    } catch (err) {
      alert(`Google 로그인 안내: ${err.message}`);
    }
  });

  // Guest Entry Listener
  container.querySelector('#btn-guest-entry').addEventListener('click', async () => {
    sound.playPop();
    const nickname = container.querySelector('#guest-nickname-input').value.trim() || user.name;
    
    if (isFirebaseReady) {
      try {
        const fbUser = await loginAnonymously();
        onLoginSuccess({
          ...user,
          id: fbUser.uid,
          name: nickname,
          avatar: selectedAvatar,
          isAnonymous: true,
          isLoggedIn: true
        });
        return;
      } catch (e) {}
    }

    onLoginSuccess({
      ...user,
      name: nickname,
      avatar: selectedAvatar,
      isAnonymous: true,
      isLoggedIn: true
    });
  });
}
