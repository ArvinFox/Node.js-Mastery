// Persistent LocalStorage state manager

const STORAGE_KEYS = {
  COMPLETED_LESSONS: 'node_term_completed_lessons',
  UNLOCKED_BADGES: 'node_term_badges',
  SOLVED_QUIZZES: 'node_term_solved_quizzes',
  SAVED_CODE: 'node_term_saved_code_',
  THEME: 'node_term_theme',
  CRT: 'node_term_crt',
  LAST_LESSON: 'node_term_last_lesson',
  CONSENT: 'node_term_storage_consent'
};

export const storage = {
  getCompletedLessons() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPLETED_LESSONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  markLessonComplete(lessonId) {
    try {
      const current = this.getCompletedLessons();
      if (!current.includes(lessonId)) {
        current.push(lessonId);
        localStorage.setItem(STORAGE_KEYS.COMPLETED_LESSONS, JSON.stringify(current));
      }
      return current;
    } catch {
      return [];
    }
  },

  getUnlockedBadges() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.UNLOCKED_BADGES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  unlockBadge(badgeId) {
    try {
      const current = this.getUnlockedBadges();
      if (!current.includes(badgeId)) {
        current.push(badgeId);
        localStorage.setItem(STORAGE_KEYS.UNLOCKED_BADGES, JSON.stringify(current));
        return true; // Newly unlocked
      }
      return false;
    } catch {
      return false;
    }
  },

  getSolvedQuizzes() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SOLVED_QUIZZES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  markQuizSolved(quizId) {
    try {
      const current = this.getSolvedQuizzes();
      if (!current.includes(quizId)) {
        current.push(quizId);
        localStorage.setItem(STORAGE_KEYS.SOLVED_QUIZZES, JSON.stringify(current));
      }
      return current;
    } catch {
      return [];
    }
  },

  getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'matrix';
  },

  setTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  getCRT() {
    const val = localStorage.getItem(STORAGE_KEYS.CRT);
    return val === 'true'; // Disabled by default on initial visit
  },

  setCRT(enabled) {
    localStorage.setItem(STORAGE_KEYS.CRT, enabled ? 'true' : 'false');
  },

  hasConsentPrompted() {
    try {
      return localStorage.getItem(STORAGE_KEYS.CONSENT) !== null;
    } catch {
      return true;
    }
  },

  getConsent() {
    try {
      return localStorage.getItem(STORAGE_KEYS.CONSENT);
    } catch {
      return 'local';
    }
  },

  setConsent(choice) {
    try {
      localStorage.setItem(STORAGE_KEYS.CONSENT, choice);
    } catch {
      // Ignore
    }
  },

  getSavedCode(challengeId, defaultCode) {
    try {
      return localStorage.getItem(STORAGE_KEYS.SAVED_CODE + challengeId) || defaultCode;
    } catch {
      return defaultCode;
    }
  },

  saveCode(challengeId, code) {
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_CODE + challengeId, code);
    } catch {
      // Ignore quota errors
    }
  },

  resetAll() {
    Object.values(STORAGE_KEYS).forEach((k) => {
      if (k.endsWith('_')) {
        // Clear all saved code items
        Object.keys(localStorage).forEach((itemKey) => {
          if (itemKey.startsWith(k)) localStorage.removeItem(itemKey);
        });
      } else {
        localStorage.removeItem(k);
      }
    });
  }
};
