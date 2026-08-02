import './styles/index.css';
import { getUnitContent, GRADES } from './data/words.js';
import { storage } from './services/storage.js';
import { renderNavbar } from './components/Navbar.js';
import { renderGameSelection } from './components/GameSelection.js';
import { renderMiniGame1 } from './components/MiniGame1.js';
import { renderMiniGame2 } from './components/MiniGame2.js';
import { renderMiniGame3 } from './components/MiniGame3.js';
import { renderMiniGame4 } from './components/MiniGame4.js';
import { renderDictationExam } from './components/DictationExam.js';
import { renderHallOfFame } from './components/HallOfFame.js';
import { renderAuthModal } from './components/AuthModal.js';
import { renderLoginScreen } from './components/LoginScreen.js';
import { renderMyPage } from './components/MyPage.js';

class App {
  constructor() {
    this.currentView = 'home';
    this.currentGrade = storage.grade || 'grade5';
    this.currentUnit = parseInt(localStorage.getItem('kids_english_unit')) || 1;
    this.isAuthModalOpen = false;
    this.init();
  }

  init() {
    this.appContainer = document.querySelector('#app');
    this.render();
  }

  getUnitData() {
    return getUnitContent(this.currentGrade, this.currentUnit);
  }

  render() {
    this.appContainer.innerHTML = `
      <header id="navbar-root"></header>
      <main id="main-content" class="main-view"></main>
      <div id="modal-root"></div>
    `;

    const navRoot = this.appContainer.querySelector('#navbar-root');
    const mainContent = this.appContainer.querySelector('#main-content');
    const modalRoot = this.appContainer.querySelector('#modal-root');

    // If user has not logged in / entered yet, display Login Screen first!
    if (!storage.user.isLoggedIn) {
      renderLoginScreen(
        mainContent,
        storage.user,
        (loggedUser) => {
          storage.saveUser(loggedUser);
          this.render();
        }
      );
      return;
    }

    // Render Navbar with Grade (1-6) & Unit (1-12) selectors and MyPage button
    renderNavbar(
      navRoot,
      storage.user,
      this.currentGrade,
      this.currentUnit,
      () => { this.isAuthModalOpen = true; this.render(); },
      (newGrade) => { 
        this.currentGrade = newGrade; 
        storage.setGrade(newGrade); 
        this.render(); 
      },
      (newUnit) => { 
        this.currentUnit = newUnit; 
        localStorage.setItem('kids_english_unit', newUnit); 
        this.render(); 
      },
      () => { this.currentView = 'mypage'; this.render(); },
      () => { this.currentView = 'home'; this.render(); }
    );

    const unitContent = this.getUnitData();
    const wordList = unitContent.words || [];

    switch (this.currentView) {
      case 'game1':
        renderMiniGame1(
          mainContent,
          wordList,
          () => {
            storage.addTicket(1);
            this.currentView = 'home';
            this.render();
          },
          () => { this.currentView = 'home'; this.render(); }
        );
        break;

      case 'game2':
        renderMiniGame2(
          mainContent,
          wordList,
          () => {
            storage.addTicket(1);
            this.currentView = 'home';
            this.render();
          },
          () => { this.currentView = 'home'; this.render(); }
        );
        break;

      case 'game3':
        renderMiniGame3(
          mainContent,
          wordList,
          () => {
            storage.addTicket(1);
            this.currentView = 'home';
            this.render();
          },
          () => { this.currentView = 'home'; this.render(); }
        );
        break;

      case 'game4':
        renderMiniGame4(
          mainContent,
          unitContent,
          () => {
            storage.addTicket(1);
            this.currentView = 'home';
            this.render();
          },
          () => { this.currentView = 'home'; this.render(); }
        );
        break;

      case 'exam':
        renderDictationExam(
          mainContent,
          storage.user,
          unitContent,
          (score, wrongList) => {
            storage.useTicket();
            
            // Record exam history & wrong words
            const gradeObj = GRADES.find(g => g.key === this.currentGrade);
            const gradeName = gradeObj ? gradeObj.name : '5학년';
            const unitName = `${this.currentUnit}단원`;

            const history = storage.user.examHistory || [];
            history.unshift({
              gradeKey: this.currentGrade,
              gradeName,
              unitNum: this.currentUnit,
              unitName,
              score,
              timestamp: Date.now()
            });
            storage.user.examHistory = history;

            // Append wrong words without duplicates
            const existingWrongs = storage.user.wrongWords || [];
            if (wrongList && wrongList.length > 0) {
              wrongList.forEach(item => {
                if (!existingWrongs.some(w => w.word.toLowerCase() === item.word.toLowerCase())) {
                  existingWrongs.push(item);
                }
              });
            }
            storage.user.wrongWords = existingWrongs;

            storage.updateDictationScore(score);
            this.currentView = 'mypage';
            this.render();
          },
          () => { this.currentView = 'home'; this.render(); }
        );
        break;

      case 'hof':
        renderHallOfFame(
          mainContent,
          storage.user,
          storage,
          () => { this.currentView = 'home'; this.render(); }
        );
        break;

      case 'mypage':
        renderMyPage(
          mainContent,
          storage.user,
          (updatedUser) => {
            storage.saveUser(updatedUser);
            this.render();
          },
          () => { this.currentView = 'home'; this.render(); }
        );
        break;

      case 'home':
      default:
        renderGameSelection(
          mainContent,
          storage.user,
          (selected) => {
            this.currentView = selected;
            this.render();
          }
        );
        break;
    }

    // Render Auth Modal if open
    if (this.isAuthModalOpen) {
      renderAuthModal(
        modalRoot,
        storage.user,
        (updatedUser) => {
          storage.saveUser(updatedUser);
          this.render();
        },
        () => {
          this.isAuthModalOpen = false;
          modalRoot.innerHTML = '';
        }
      );
    }
  }
}

// Start application when DOM loaded
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
