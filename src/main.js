import './styles/index.css';
import { WORD_DATABASE } from './data/words.js';
import { storage } from './services/storage.js';
import { renderNavbar } from './components/Navbar.js';
import { renderGameSelection } from './components/GameSelection.js';
import { renderMiniGame1 } from './components/MiniGame1.js';
import { renderMiniGame2 } from './components/MiniGame2.js';
import { renderMiniGame3 } from './components/MiniGame3.js';
import { renderDictationExam } from './components/DictationExam.js';
import { renderHallOfFame } from './components/HallOfFame.js';
import { renderAuthModal } from './components/AuthModal.js';

class App {
  constructor() {
    this.currentView = 'home';
    this.isAuthModalOpen = false;
    this.init();
  }

  init() {
    this.appContainer = document.querySelector('#app');
    this.render();
  }

  getWordList() {
    return WORD_DATABASE[storage.grade] || WORD_DATABASE.grade1_2;
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

    // Render Navbar
    renderNavbar(
      navRoot,
      storage.user,
      storage.grade,
      () => { this.isAuthModalOpen = true; this.render(); },
      (newGrade) => { storage.setGrade(newGrade); this.render(); },
      () => { this.currentView = 'home'; this.render(); }
    );

    // Render Main Content View
    const wordList = this.getWordList();

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

      case 'exam':
        renderDictationExam(
          mainContent,
          storage.user,
          wordList,
          (score) => {
            storage.useTicket();
            storage.updateDictationScore(score);
            this.currentView = 'hof';
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
