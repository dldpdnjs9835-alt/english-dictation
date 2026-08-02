// Local & Firebase Unified Storage Manager
import { AVATARS } from '../data/words.js';
import { syncUserDataToFirestore, isFirebaseReady } from './firebase.js';

const STORAGE_KEY = 'kids_english_user_v1';
const LEADERBOARD_KEY = 'kids_english_hof_v1';

// Initial Mock Hall of Fame for vibrant initial experience
const MOCK_HALL_OF_FAME = [
  { id: 'bot-1', name: '영재미노', avatar: '👑', tickets: 18, gamesCleared: 24, dictationHighScore: 100 },
  { id: 'bot-2', name: '스펠링마스터', avatar: '🦊', tickets: 15, gamesCleared: 20, dictationHighScore: 100 },
  { id: 'bot-3', name: '영단어왕자', avatar: '🦄', tickets: 12, gamesCleared: 16, dictationHighScore: 90 },
  { id: 'bot-4', name: '초등영어짱', avatar: '🐶', tickets: 10, gamesCleared: 14, dictationHighScore: 90 },
  { id: 'bot-5', name: '귀염포포', avatar: '🐱', tickets: 8, gamesCleared: 11, dictationHighScore: 80 },
  { id: 'bot-6', name: '단어탐험가', avatar: '🐻', tickets: 7, gamesCleared: 9, dictationHighScore: 80 },
  { id: 'bot-7', name: '파닉스천재', avatar: '🐼', tickets: 6, gamesCleared: 8, dictationHighScore: 70 },
  { id: 'bot-8', name: '해피스마일', avatar: '🦁', tickets: 5, gamesCleared: 7, dictationHighScore: 70 },
  { id: 'bot-9', name: '영문법소녀', avatar: '🐯', tickets: 4, gamesCleared: 5, dictationHighScore: 60 },
  { id: 'bot-10', name: '코딩어린이', avatar: '🤖', tickets: 3, gamesCleared: 4, dictationHighScore: 60 }
];

export class StorageManager {
  constructor() {
    this.user = this.loadUser();
    this.grade = localStorage.getItem('kids_english_grade') || 'grade1_2';
  }

  loadUser() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {}
    }
    // Default guest profile
    const defaultUser = {
      id: 'user_' + Math.random().toString(36).substring(2, 9),
      name: '어린이' + Math.floor(Math.random() * 899 + 100),
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
      tickets: 2, // Start with 2 bonus tickets
      gamesCleared: 0,
      dictationHighScore: 0,
      isAnonymous: true
    };
    this.saveUser(defaultUser);
    return defaultUser;
  }

  saveUser(user) {
    this.user = { ...user };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.user));
    this.updateLocalHallOfFame();
    if (isFirebaseReady) {
      syncUserDataToFirestore(this.user);
    }
  }

  setGrade(gradeKey) {
    this.grade = gradeKey;
    localStorage.setItem('kids_english_grade', gradeKey);
  }

  addTicket(amount = 1) {
    this.user.tickets += amount;
    this.user.gamesCleared += 1;
    this.saveUser(this.user);
  }

  useTicket() {
    if (this.user.tickets > 0) {
      this.user.tickets -= 1;
      this.saveUser(this.user);
      return true;
    }
    return false;
  }

  updateDictationScore(score) {
    if (score > this.user.dictationHighScore) {
      this.user.dictationHighScore = score;
    }
    this.saveUser(this.user);
  }

  // Manage Local Leaderboard list
  getLocalHallOfFame() {
    const data = localStorage.getItem(LEADERBOARD_KEY);
    let list = MOCK_HALL_OF_FAME;
    if (data) {
      try {
        list = JSON.parse(data);
      } catch (e) {}
    }
    
    // Ensure current user is in list
    const existingIndex = list.findIndex(u => u.id === this.user.id);
    if (existingIndex >= 0) {
      list[existingIndex] = { ...this.user };
    } else {
      list.push({ ...this.user });
    }

    return list;
  }

  updateLocalHallOfFame() {
    const list = this.getLocalHallOfFame();
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(list));
  }
}

export const storage = new StorageManager();
