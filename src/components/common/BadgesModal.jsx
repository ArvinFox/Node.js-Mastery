import React, { useState, useEffect } from 'react';
import { BADGES } from '../../data/badges';
import { storage } from '../../services/storage';
import { soundFx } from '../../services/soundFx';
import {
  Award,
  X,
  CheckCircle2,
  Lock,
  Terminal,
  RotateCcw,
  Radio,
  ShieldCheck,
  Cpu,
  Zap,
  Crown,
  HelpCircle,
  Sparkles
} from 'lucide-react';

const ICON_MAP = {
  Terminal,
  RotateCcw,
  Radio,
  ShieldCheck,
  Cpu,
  Zap,
  Crown,
  HelpCircle,
  Award
};

export const BadgesModal = ({ isOpen, onClose }) => {
  const [filter, setFilter] = useState('all'); // 'all' | 'unlocked' | 'locked'
  const [unlockedIds, setUnlockedIds] = useState(() => storage.getUnlockedBadges());
  const [completedLessons, setCompletedLessons] = useState(() => storage.getCompletedLessons());
  const [solvedQuizzes, setSolvedQuizzes] = useState(() => storage.getSolvedQuizzes());

  useEffect(() => {
    if (isOpen) {
      setUnlockedIds(storage.getUnlockedBadges());
      setCompletedLessons(storage.getCompletedLessons());
      setSolvedQuizzes(storage.getSolvedQuizzes());
      soundFx.playStep();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unlockedCount = unlockedIds.length;
  const totalBadges = BADGES.length;
  const progressPercent = Math.round((unlockedCount / totalBadges) * 100);

  const filteredBadges = BADGES.filter((badge) => {
    const isUnlocked = unlockedIds.includes(badge.id);
    if (filter === 'unlocked') return isUnlocked;
    if (filter === 'locked') return !isUnlocked;
    return true;
  });

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(3, 6, 10, 0.88)',
        backdropFilter: 'blur(12px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="storage-modal-card"
        style={{
          maxWidth: '850px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#04090d',
          border: '1px solid var(--neon-cyan)',
          boxShadow: '0 0 35px rgba(0, 240, 255, 0.25), inset 0 0 20px rgba(0, 240, 255, 0.05)',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 22px',
            background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.12), rgba(0, 0, 0, 0.6))',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '6px',
                background: 'rgba(0, 240, 255, 0.15)',
                border: '1px solid var(--neon-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--neon-cyan)'
              }}
            >
              <Award size={20} />
            </div>
            <div>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '0.8px',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                CYBER-BADGES & ACHIEVEMENTS
                <span
                  className="cyber-badge badge-cyan"
                  style={{ fontSize: '10px', padding: '2px 8px' }}
                >
                  {unlockedCount} / {totalBadges} UNLOCKED
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                Earn cryptographic proof-of-mastery badges by completing mission code trials and architect labs.
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            title="Close (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress Overview Bar */}
        <div
          style={{
            padding: '14px 22px',
            background: 'rgba(0, 0, 0, 0.5)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '12.5px'
            }}
          >
            <span style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} style={{ color: 'var(--neon-amber)' }} />
              <strong>Architect Mastery Progress:</strong>
            </span>
            <span style={{ color: 'var(--neon-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              {progressPercent}% Complete ({unlockedCount} of {totalBadges})
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '7px',
              background: '#09151e',
              borderRadius: '4px',
              overflow: 'hidden',
              border: '1px solid rgba(0, 240, 255, 0.2)'
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--neon-cyan), var(--neon-green))',
                boxShadow: '0 0 10px var(--neon-cyan)',
                transition: 'width 0.4s ease'
              }}
            />
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
            <button
              onClick={() => {
                setFilter('all');
                soundFx.playClick();
              }}
              className={`cyber-btn-small ${filter === 'all' ? 'active' : ''}`}
              style={{ fontSize: '11px', padding: '3px 10px' }}
            >
              All Badges ({totalBadges})
            </button>
            <button
              onClick={() => {
                setFilter('unlocked');
                soundFx.playClick();
              }}
              className={`cyber-btn-small ${filter === 'unlocked' ? 'active' : ''}`}
              style={{
                fontSize: '11px',
                padding: '3px 10px',
                borderColor: filter === 'unlocked' ? 'var(--neon-green)' : undefined,
                color: filter === 'unlocked' ? 'var(--neon-green)' : undefined
              }}
            >
              ✓ Unlocked ({unlockedCount})
            </button>
            <button
              onClick={() => {
                setFilter('locked');
                soundFx.playClick();
              }}
              className={`cyber-btn-small ${filter === 'locked' ? 'active' : ''}`}
              style={{ fontSize: '11px', padding: '3px 10px' }}
            >
              🔒 Locked ({totalBadges - unlockedCount})
            </button>
          </div>
        </div>

        {/* Badges Grid */}
        <div
          style={{
            padding: '20px 22px',
            overflowY: 'auto',
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '14px'
          }}
        >
          {filteredBadges.map((badge) => {
            const isUnlocked = unlockedIds.includes(badge.id);
            const IconComponent = ICON_MAP[badge.icon] || Award;
            const progress = badge.getProgress(completedLessons, solvedQuizzes);

            return (
              <div
                key={badge.id}
                style={{
                  background: isUnlocked
                    ? 'linear-gradient(135deg, rgba(0, 255, 102, 0.05), rgba(0, 0, 0, 0.75))'
                    : 'rgba(5, 10, 14, 0.65)',
                  border: `1px solid ${isUnlocked ? badge.color : 'rgba(255, 255, 255, 0.08)'}`,
                  borderRadius: '6px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: isUnlocked
                    ? `0 0 16px ${badge.color}22, inset 0 0 12px ${badge.color}11`
                    : 'none',
                  opacity: isUnlocked ? 1 : 0.75,
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Top Row: Icon + Title + Status */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '8px',
                      background: isUnlocked ? `${badge.color}18` : 'rgba(255, 255, 255, 0.03)',
                      border: `1.5px solid ${isUnlocked ? badge.color : 'rgba(255, 255, 255, 0.12)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isUnlocked ? badge.color : 'var(--text-dim)',
                      boxShadow: isUnlocked ? `0 0 14px ${badge.color}44` : 'none',
                      flexShrink: 0
                    }}
                  >
                    <IconComponent size={24} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.6px',
                          color: badge.color,
                          fontWeight: 600
                        }}
                      >
                        {badge.tierName}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>•</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{badge.category}</span>
                    </div>

                    <h4
                      style={{
                        margin: '2px 0 0 0',
                        fontSize: '15px',
                        color: isUnlocked ? '#fff' : '#aaa',
                        fontWeight: 700,
                        fontFamily: 'var(--font-display)'
                      }}
                    >
                      {badge.title}
                    </h4>
                  </div>

                  {/* Status Pill */}
                  <div>
                    {isUnlocked ? (
                      <span
                        className="cyber-badge badge-green"
                        style={{
                          fontSize: '9.5px',
                          padding: '3px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <CheckCircle2 size={11} /> UNLOCKED
                      </span>
                    ) : (
                      <span
                        className="cyber-badge"
                        style={{
                          fontSize: '9.5px',
                          padding: '3px 8px',
                          color: 'var(--text-dim)',
                          borderColor: 'rgba(255,255,255,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Lock size={11} /> LOCKED
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p
                  style={{
                    margin: 0,
                    fontSize: '12.5px',
                    color: isUnlocked ? '#d1d5db' : '#777',
                    lineHeight: 1.45
                  }}
                >
                  {badge.description}
                </p>

                {/* Requirement & Progress Footer */}
                <div
                  style={{
                    marginTop: 'auto',
                    paddingTop: '10px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '11px'
                    }}
                  >
                    <span style={{ color: 'var(--text-dim)' }}>
                      <strong>Requirement:</strong> {badge.requirement}
                    </span>
                    <span
                      style={{
                        color: isUnlocked ? badge.color : 'var(--text-dim)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px'
                      }}
                    >
                      {progress.current} / {progress.total}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div
                    style={{
                      width: '100%',
                      height: '4px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        width: `${progress.percent}%`,
                        height: '100%',
                        background: isUnlocked ? badge.color : 'rgba(255, 255, 255, 0.25)',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '12px 22px',
            background: 'rgba(0, 0, 0, 0.6)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
            color: 'var(--text-dim)'
          }}
        >
          <span>
            💡 Complete mission trials in the <strong>Guided Missions</strong> tab to unlock remaining badges.
          </span>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="cyber-button-secondary"
            style={{ padding: '6px 16px', fontSize: '12px' }}
          >
            RETURN TO ACADEMY
          </button>
        </div>
      </div>
    </div>
  );
};
