// Firebase Auth & Firestore Integration
import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInAnonymously, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot 
} from 'firebase/firestore';

// Environment variables template for Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

let app = null;
let auth = null;
let db = null;
let isFirebaseReady = false;

// Initialize Firebase if config exists
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseReady = true;
    console.log("🔥 Firebase Auth & Firestore successfully initialized!");
  } catch (err) {
    console.warn("Firebase initialization warning (falling back to local mode):", err);
  }
} else {
  console.log("ℹ️ Firebase environment variables not set. App operating in LocalStorage mode.");
}

export { isFirebaseReady, auth, db };

// Auth Helper Functions
export const loginWithGoogle = async () => {
  if (!isFirebaseReady || !auth) {
    throw new Error("Firebase Auth가 설정되지 않았습니다. .env 환경 변수를 확인해주세요.");
  }
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

export const loginAnonymously = async () => {
  if (!isFirebaseReady || !auth) {
    throw new Error("Firebase Auth가 설정되지 않았습니다. .env 환경 변수를 확인해주세요.");
  }
  const result = await signInAnonymously(auth);
  return result.user;
};

export const logoutUser = async () => {
  if (isFirebaseReady && auth) {
    await signOut(auth);
  }
};

export const subscribeAuth = (callback) => {
  if (isFirebaseReady && auth) {
    return onAuthStateChanged(auth, callback);
  } else {
    callback(null);
    return () => {};
  }
};

// Firestore User Profile & Stats Sync
export const syncUserDataToFirestore = async (userProfile) => {
  if (!isFirebaseReady || !db || !userProfile.id) return;
  try {
    const userRef = doc(db, 'users', userProfile.id);
    await setDoc(userRef, {
      id: userProfile.id,
      name: userProfile.name,
      avatar: userProfile.avatar,
      tickets: userProfile.tickets,
      gamesCleared: userProfile.gamesCleared,
      dictationHighScore: userProfile.dictationHighScore,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error("Firestore sync error:", err);
  }
};

// Real-time Leaderboard Subscriptions for Top 10
export const subscribeTopTickets = (callback) => {
  if (!isFirebaseReady || !db) return () => {};
  try {
    const q = query(collection(db, 'users'), orderBy('tickets', 'desc'), limit(10));
    return onSnapshot(q, (snapshot) => {
      const leaderboard = [];
      snapshot.forEach((doc) => leaderboard.push(doc.data()));
      callback(leaderboard);
    }, (err) => {
      console.warn("Firestore tickets snapshot error:", err);
    });
  } catch (e) {
    return () => {};
  }
};

export const subscribeTopGamesCleared = (callback) => {
  if (!isFirebaseReady || !db) return () => {};
  try {
    const q = query(collection(db, 'users'), orderBy('gamesCleared', 'desc'), limit(10));
    return onSnapshot(q, (snapshot) => {
      const leaderboard = [];
      snapshot.forEach((doc) => leaderboard.push(doc.data()));
      callback(leaderboard);
    }, (err) => {
      console.warn("Firestore games snapshot error:", err);
    });
  } catch (e) {
    return () => {};
  }
};
