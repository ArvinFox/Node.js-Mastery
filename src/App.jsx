import React, { useState, useEffect } from 'react';
import { TerminalHeader } from './components/layout/TerminalHeader';
import { HackerCLI } from './components/layout/HackerCLI';
import { MatrixBackground } from './components/layout/MatrixBackground';
import { CurriculumView } from './components/curriculum/CurriculumView';
import { LabsContainer } from './components/visualizers/LabsContainer';
import { TheoremsView } from './components/theorems/TheoremsView';
import { EventLoopQuizView } from './components/quizzes/EventLoopQuizView';

import { LESSONS } from './data/curriculum';
import { storage } from './services/storage';
import { soundFx } from './services/soundFx';

import { StorageConsentModal } from './components/common/StorageConsentModal';

import {
  BookOpen,
  FlaskConical,
  FileCode2,
  HelpCircle
} from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState('missions');
  const [theme, setTheme] = useState(() => storage.getTheme());
  const [isCrtEnabled, setIsCrtEnabled] = useState(() => storage.getCRT());
  const [completedCount, setCompletedCount] = useState(() => storage.getCompletedLessons().length);
  const [badgesCount, setBadgesCount] = useState(() => storage.getUnlockedBadges().length);
  const [showConsentModal, setShowConsentModal] = useState(() => !storage.hasConsentPrompted());

  // Sync theme and CRT with body class
  useEffect(() => {
    document.body.className = `${isCrtEnabled ? 'crt-enabled' : ''} theme-${theme}`;
  }, [theme, isCrtEnabled]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    storage.setTheme(newTheme);
    soundFx.playBeep(650, 0.05);
  };

  const handleCrtToggle = () => {
    const nextVal = !isCrtEnabled;
    setIsCrtEnabled(nextVal);
    storage.setCRT(nextVal);
    soundFx.playBeep(500, 0.05);
  };

  const handleTabChange = (tabId) => {
    // Map legacy CLI commands to streamlined tabs
    if (tabId === 'curriculum') tabId = 'missions';
    if (tabId.startsWith('sim-')) tabId = 'labs';
    setActiveTab(tabId);
    soundFx.playClick();
  };

  const handleLessonCompleted = () => {
    const completed = storage.getCompletedLessons().length;
    setCompletedCount(completed);
    setBadgesCount(storage.getUnlockedBadges().length);
  };

  const tabs = [
    { id: 'missions', label: '🚀 1. Guided Missions', icon: BookOpen },
    { id: 'labs', label: '🔬 2. Visualizer Labs', icon: FlaskConical },
    { id: 'theorems', label: '📜 3. Theorems & Laws', icon: FileCode2 },
    { id: 'quiz', label: '🧩 4. Output Quizzes', icon: HelpCircle }
  ];

  return (
    <div className="terminal-app-container">
      {/* Background Falling Matrix Digital Rain */}
      <MatrixBackground />

      {/* Top Cyber Status Header */}
      <TerminalHeader
        activeTheme={theme}
        onThemeChange={handleThemeChange}
        isCrtEnabled={isCrtEnabled}
        onCrtToggle={handleCrtToggle}
        completedCount={completedCount}
        totalCount={LESSONS.length}
        badgesCount={badgesCount}
      />

      {/* Streamlined 4-Mode Navigation Tab Strip */}
      <nav className="terminal-nav-strip">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`terminal-nav-tab ${isActive ? 'active' : ''}`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Active Workspace View */}
      <main className="terminal-workspace">
        {activeTab === 'missions' && (
          <CurriculumView onCompleteLesson={handleLessonCompleted} />
        )}
        {activeTab === 'labs' && <LabsContainer />}
        {activeTab === 'theorems' && <TheoremsView />}
        {activeTab === 'quiz' && <EventLoopQuizView />}
      </main>

      {/* Platform Footer & Trademark Attribution */}
      <footer className="terminal-footer">
        <div className="terminal-footer-content">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-main)', letterSpacing: '1px' }}>
              NODE.JS MASTERY
            </span>
            <span style={{ color: 'var(--text-dim)' }}>•</span>
            <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>
              Zero to Architect • Interactive Kernel Academy
            </span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-dim)', margin: '0 auto', lineHeight: '1.6' }}>
            Node.js is a registered trademark of the OpenJS Foundation. This educational website is an independent community project created for learning purposes, and is not affiliated with, endorsed by, or sponsored by the OpenJS Foundation.
          </p>
        </div>
      </footer>

      {/* Bottom Hacker Command Line Prompt */}
      <HackerCLI
        onNavigate={handleTabChange}
        onThemeChange={handleThemeChange}
        onCrtToggle={handleCrtToggle}
      />

      {/* First-Boot Privacy & Local Storage Initialization Prompt */}
      {showConsentModal && (
        <StorageConsentModal
          onConsentComplete={({ enableCrt }) => {
            setIsCrtEnabled(enableCrt);
            setShowConsentModal(false);
          }}
        />
      )}
    </div>
  );
}

export default App;
