# 🎓 초등학교 영어 받아쓰기 모험 (Kids English Dictation Adventure)

초등학교 학생들이 재미있게 단어를 외우고, 획득한 티켓 🎟️으로 가상 AI 선생님과 받아쓰기 시험을 치른 후 명예의 전당에 이름을 올리는 게이밍 융합형 영어 받아쓰기 웹앱입니다.

---

## 🌟 주요 기능

1. **학습 미니게임 3종** (클리어 시 티켓 🎟️ 획득):
   - 🎈 **글자 풍선 터뜨리기 (Spelling Bubble Pop)**: 떠오르는 풍선을 철자 순서대로 터뜨려 단어 완성
   - 🃏 **단어 카드 짝맞추기 (Word Memory Match)**: 영단어 카드와 한국어 뜻 카드를 뒤집어 짝맞추기
   - 🎧 **소리듣고 알파벳 맞추기 (Audio Spelling Quiz)**: 가상 선생님 발음을 듣고 빠진 알파벳 완성
2. **가상 선생님 받아쓰기 시험**:
   - 티켓 1장 소모 후 시험 입장
   - Web Speech API (TTS) 발음 낭독 & 예문 들려주기 & 힌트 시스템
   - 100점 만점 자동 채점, 별점 리포트 및 축하 폭죽 이펙트
3. **명예의 전당 (Hall of Fame Top 10)**:
   - 🎟️ **티켓 부자 왕 Top 10**
   - 🎮 **미니게임 클리어 왕 Top 10**
   - Firebase Firestore 실시간 연동 및 1등 🥇, 2등 🥈, 3등 🥉 트로피 표시
4. **사용자 인증 & 프로필**:
   - Firebase Google 로그인 & 익명 로그인 지원
   - 10종 아바타 및 닉네임 수정 기능

---

## 🚀 시작하기 & 로컬 개발

```bash
# 1. 패키지 설치
npm install

# 2. 로컬 개발 서버 실행
npm run dev

# 3. 빌드 테스트
npm run build
```

---

## 🌐 GitHub & Vercel 배포 방법

### 1. GitHub에 업로드하기
```bash
git init
git add .
git commit -m "Initial commit: Kids English Dictation Adventure"
git branch -M main
git remote add origin https://github.com/사용자계정/영어-받아쓰기-게임.git
git push -u origin main
```

### 2. Vercel 배포하기
1. [Vercel](https://vercel.com) 로그인 후 **"Add New Project"** 클릭
2. GitHub 리포지토리 (`영어-받아쓰기-게임`) 선택
3. **Environment Variables**에 `.env.example`의 Firebase 설정 키 입력:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
4. **Deploy** 버튼 클릭! 🚀
