import React, { useState } from 'react';
import { TIERS, LESSONS } from '../../data/curriculum';
import { TerminalPlayground } from '../playground/TerminalPlayground';
import { MarkdownView } from '../common/MarkdownView';
import { EventLoopVisualizer } from '../visualizers/EventLoopVisualizer';
import { StreamBackpressureVisualizer } from '../visualizers/StreamBackpressureVisualizer';
import { WorkerThreadsVisualizer } from '../visualizers/WorkerThreadsVisualizer';
import { GarbageCollectionVisualizer } from '../visualizers/GarbageCollectionVisualizer';
import { soundFx } from '../../services/soundFx';
import { storage } from '../../services/storage';

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FlaskConical,
  Terminal,
  Grid,
  Sparkles,
  Zap,
  Info,
  Award
} from 'lucide-react';

export const CurriculumView = ({ onCompleteLesson }) => {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('guide'); // 'guide', 'lab', 'trial'
  const [showMissionDrawer, setShowMissionDrawer] = useState(false);
  const [completedLessons, setCompletedLessons] = useState(() => storage.getCompletedLessons());

  const currentLesson = LESSONS[currentLessonIndex] || LESSONS[0];
  const currentTier = TIERS.find((t) => t.id === currentLesson.tier) || TIERS[0];
  const isLessonComplete = completedLessons.includes(currentLesson.id);

  const tierLessons = LESSONS.filter((l) => l.tier === currentTier.id);
  const tierCompletedCount = tierLessons.filter((l) => completedLessons.includes(l.id)).length;
  const isTierBadgeUnlocked = tierCompletedCount === tierLessons.length;

  const handleLessonChange = (index) => {
    if (index >= 0 && index < LESSONS.length) {
      setCurrentLessonIndex(index);
      setActiveTab('guide');
      setShowMissionDrawer(false);
      soundFx.playClick();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCompleteCurrent = (lessonId) => {
    const updated = storage.getCompletedLessons();
    setCompletedLessons(updated);
    if (onCompleteLesson) onCompleteLesson(lessonId);
  };

  // Determine contextual lab component for the current mission
  const renderContextualLab = () => {
    if (currentLesson.id === '11-event-loop-six-phases' || currentLesson.id === '10-reactor-pattern-deep' || currentLesson.id === '01-what-is-node') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(0, 255, 102, 0.08)', borderRadius: '4px', borderLeft: '3px solid var(--neon-green)', fontSize: '13px' }}>
            <Zap size={16} style={{ color: 'var(--neon-green)', flexShrink: 0 }} />
            <span><strong>Contextual Lab:</strong> This interactive simulator models the 6 Libuv Event Loop phases discussed in this mission!</span>
          </div>
          <EventLoopVisualizer />
        </div>
      );
    }
    if (currentLesson.id === '12-streams-backpressure-deep') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(0, 240, 255, 0.08)', borderRadius: '4px', borderLeft: '3px solid var(--neon-cyan)', fontSize: '13px' }}>
            <Zap size={16} style={{ color: 'var(--neon-cyan)', flexShrink: 0 }} />
            <span><strong>Contextual Lab:</strong> Test buffer highWaterMark saturation, pause/resume flow, and simulate OOM crashes!</span>
          </div>
          <StreamBackpressureVisualizer />
        </div>
      );
    }
    if (currentLesson.id === '15-worker-threads-atomics' || currentLesson.id === '16-cluster-zero-downtime') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(255, 0, 127, 0.08)', borderRadius: '4px', borderLeft: '3px solid var(--neon-pink)', fontSize: '13px' }}>
            <Zap size={16} style={{ color: 'var(--neon-pink)', flexShrink: 0 }} />
            <span><strong>Contextual Lab:</strong> Benchmark single-thread lockup vs worker_threads parallel execution at 60 FPS!</span>
          </div>
          <WorkerThreadsVisualizer />
        </div>
      );
    }
    if (currentLesson.id === '18-v8-memory-architecture' || currentLesson.id === '19-memory-leak-forensics') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(255, 176, 0, 0.08)', borderRadius: '4px', borderLeft: '3px solid var(--neon-amber)', fontSize: '13px' }}>
            <Zap size={16} style={{ color: 'var(--neon-amber)', flexShrink: 0 }} />
            <span><strong>Contextual Lab:</strong> Inspect Young Generation Scavenge GC and diagnose intentional memory leaks in Old Space!</span>
          </div>
          <GarbageCollectionVisualizer />
        </div>
      );
    }

    // Default for lessons without a specialized visualizer: Event Loop
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(0, 255, 102, 0.08)', borderRadius: '4px', borderLeft: '3px solid var(--neon-green)', fontSize: '13px' }}>
          <Info size={16} style={{ color: 'var(--neon-green)', flexShrink: 0 }} />
          <span>Use the general <strong>Libuv Event Loop Simulator</strong> below to observe how asynchronous operations schedule tasks for this mission.</span>
        </div>
        <EventLoopVisualizer />
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* 1. Guided Journey Hero Banner */}
      <div className="guided-journey-banner">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span className="journey-badge-pill" style={{ borderColor: currentTier.color, color: currentTier.color }}>
              {currentTier.name}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
              Mission {currentLessonIndex + 1} of {LESSONS.length}
            </span>
            <span
              className={`cyber-badge ${isTierBadgeUnlocked ? 'badge-green' : 'badge-cyan'}`}
              style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}
              title={`Tier Badge: ${currentTier.badgeTitle} (${tierCompletedCount}/${tierLessons.length} missions completed)`}
            >
              <Award size={11} /> {currentTier.badgeTitle}: {isTierBadgeUnlocked ? 'UNLOCKED' : `${tierCompletedCount}/${tierLessons.length}`}
            </span>
            {isLessonComplete && (
              <span className="cyber-badge badge-green" style={{ fontSize: '10px' }}>
                <CheckCircle2 size={12} /> COMPLETED
              </span>
            )}
          </div>
          <h1 style={{ fontSize: '20px', color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '0.5px' }}>
            {currentLesson.title}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginTop: '4px' }}>
            {currentLesson.summary}
          </p>
        </div>

        {/* Quick Drawer Launcher Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setShowMissionDrawer(!showMissionDrawer)}
            className="mission-picker-btn"
          >
            <Grid size={14} /> Jump to Any Mission ({currentLessonIndex + 1}/{LESSONS.length})
          </button>
        </div>
      </div>

      {/* Quick Mission Jump Drawer Modal */}
      {showMissionDrawer && (
        <div className="cyber-card" style={{ borderColor: 'var(--neon-cyan)', marginBottom: '14px', boxShadow: '0 0 20px rgba(0, 240, 255, 0.2)' }}>
          <div className="cyber-card-header">
            <span className="cyber-card-title" style={{ fontSize: '13px' }}>
              <Grid size={16} /> QUICK JUMP: 20-MISSION CURRICULUM TREE
            </span>
            <button onClick={() => setShowMissionDrawer(false)} className="cyber-btn-small">
              ✕ Close
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px', maxHeight: '340px', overflowY: 'auto' }}>
            {LESSONS.map((les, idx) => {
              const isCurr = idx === currentLessonIndex;
              const isDone = completedLessons.includes(les.id);
              const tierInfo = TIERS.find((t) => t.id === les.tier);

              return (
                <div
                  key={les.id}
                  onClick={() => handleLessonChange(idx)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: `1px solid ${isCurr ? 'var(--neon-green)' : 'var(--border-color)'}`,
                    background: isCurr ? 'rgba(0, 255, 102, 0.12)' : 'var(--bg-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '10px', color: tierInfo?.color || 'var(--text-dim)' }}>
                      M#{idx + 1} • Tier {les.tier}
                    </div>
                    <div style={{ fontSize: '12px', color: isCurr ? 'var(--neon-green)' : 'var(--text-main)', fontWeight: isCurr ? 700 : 400 }}>
                      {les.title.replace(/^Mission \d+:\s*/, '')}
                    </div>
                  </div>
                  {isDone && <CheckCircle2 size={14} style={{ color: 'var(--neon-green)' }} />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Top Linear Stepper Controls */}
      <div className="stepper-controls">
        <button
          onClick={() => handleLessonChange(currentLessonIndex - 1)}
          disabled={currentLessonIndex === 0}
          className="stepper-btn"
        >
          <ChevronLeft size={16} /> PREVIOUS MISSION
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>STEPPER:</span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--neon-green)' }}>
            {currentLessonIndex + 1} / {LESSONS.length}
          </span>
        </div>

        <button
          onClick={() => handleLessonChange(currentLessonIndex + 1)}
          disabled={currentLessonIndex === LESSONS.length - 1}
          className="stepper-btn"
          style={{ borderColor: 'var(--neon-green)', color: 'var(--neon-green)' }}
        >
          NEXT MISSION <ChevronRight size={16} />
        </button>
      </div>

      {/* 3. Three-Way In-Mission Flow Tabs */}
      <div className="cyber-card" style={{ borderColor: 'var(--border-color)', padding: 0, overflow: 'hidden' }}>
        {/* Tab Switcher Bar */}
        <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', display: 'flex', overflowX: 'auto' }}>
          <button
            onClick={() => {
              setActiveTab('guide');
              soundFx.playClick();
            }}
            className={`terminal-nav-tab ${activeTab === 'guide' ? 'active' : ''}`}
            style={{ padding: '14px 20px' }}
          >
            <BookOpen size={16} />
            <span>1. MISSION BLUEPRINT & THEORY</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('lab');
              soundFx.playClick();
            }}
            className={`terminal-nav-tab ${activeTab === 'lab' ? 'active' : ''}`}
            style={{ padding: '14px 20px' }}
          >
            <FlaskConical size={16} />
            <span>2. VISUAL SIMULATOR LAB</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('trial');
              soundFx.playClick();
            }}
            className={`terminal-nav-tab ${activeTab === 'trial' ? 'active' : ''}`}
            style={{ padding: '14px 20px' }}
          >
            <Terminal size={16} />
            <span>3. HANDS-ON CODE TRIAL & TESTS</span>
          </button>
        </div>

        {/* Tab Body Contents */}
        <div className="curriculum-tab-body" style={{ padding: '24px' }}>
          {/* TAB 1: Mission Blueprint & Theory */}
          {activeTab === 'guide' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* The Glitch Hook */}
              <div style={{ background: 'rgba(0, 255, 102, 0.08)', padding: '14px 18px', borderRadius: '6px', borderLeft: '4px solid var(--neon-green)' }}>
                <div style={{ fontSize: '11px', color: 'var(--neon-green)', fontWeight: 700, marginBottom: '4px', letterSpacing: '0.5px' }}>
                  ⚡ THE GLITCH / REAL-WORLD MYSTERY:
                </div>
                <div style={{ fontSize: '14px', color: '#fff', fontStyle: 'italic', fontWeight: 500 }}>
                  "{currentLesson.hook}"
                </div>
              </div>

              {/* High-Clarity Blueprint Explanation */}
              <div>
                <h3 style={{ fontSize: '14px', color: 'var(--neon-cyan)', marginBottom: '10px', letterSpacing: '0.5px' }}>
                  ARCHITECTURAL BLUEPRINT & MECHANICS:
                </h3>
                <MarkdownView content={currentLesson.explanation} />
              </div>

              {/* Core Takeaways */}
              <div>
                <h3 style={{ fontSize: '14px', color: 'var(--neon-amber)', marginBottom: '10px' }}>
                  KEY TAKEAWAYS FOR YOUR TOOLBELT:
                </h3>
                <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {currentLesson.conceptKeyPoints.map((pt, i) => (
                    <li key={i} className="readable-prose" style={{ fontSize: '14px' }}>
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Live Code Demo */}
              <div>
                <h3 style={{ fontSize: '14px', color: 'var(--text-dim)', marginBottom: '6px' }}>
                  CODE DEMONSTRATION:
                </h3>
                <pre className="cyber-code-block" style={{ fontSize: '13px' }}>
                  <code>{currentLesson.codeExample}</code>
                </pre>
              </div>

              {/* Jump to Next Step Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  onClick={() => {
                    setActiveTab('lab');
                    soundFx.playClick();
                  }}
                  className="cyber-button-secondary"
                >
                  <FlaskConical size={14} /> Open Visual Lab
                </button>
                <button
                  onClick={() => {
                    setActiveTab('trial');
                    soundFx.playClick();
                  }}
                  className="cyber-button-primary"
                >
                  Ready for Code Trial <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Visual Simulator Lab */}
          {activeTab === 'lab' && renderContextualLab()}

          {/* TAB 3: Hands-on Code Trial */}
          {activeTab === 'trial' && (
            <TerminalPlayground
              lesson={currentLesson}
              onComplete={handleCompleteCurrent}
            />
          )}
        </div>
      </div>

      {/* 4. Bottom Linear Stepper Controls */}
      <div className="stepper-controls">
        <button
          onClick={() => handleLessonChange(currentLessonIndex - 1)}
          disabled={currentLessonIndex === 0}
          className="stepper-btn"
        >
          <ChevronLeft size={16} /> PREVIOUS MISSION
        </button>

        <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
          {isLessonComplete ? (
            <span style={{ color: 'var(--neon-green)', fontWeight: 600 }}>
              ✓ Mission {currentLessonIndex + 1} Mastered
            </span>
          ) : (
            <span>Mission {currentLessonIndex + 1} In Progress</span>
          )}
        </div>

        <button
          onClick={() => handleLessonChange(currentLessonIndex + 1)}
          disabled={currentLessonIndex === LESSONS.length - 1}
          className="stepper-btn"
          style={{ borderColor: 'var(--neon-green)', color: 'var(--neon-green)' }}
        >
          NEXT MISSION <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
