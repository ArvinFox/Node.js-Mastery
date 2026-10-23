import React, { useEffect } from 'react';
import { Award, X, Sparkles } from 'lucide-react';
import { soundFx } from '../../services/soundFx';

export const BadgeToast = ({ badge, onDismiss, onViewBadges }) => {
  useEffect(() => {
    if (!badge) return;

    soundFx.playSuccess();

    const timer = setTimeout(() => {
      onDismiss();
    }, 6000);

    return () => clearTimeout(timer);
  }, [badge, onDismiss]);

  if (!badge) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 11000,
        maxWidth: '380px',
        width: 'calc(100% - 48px)',
        background: '#040d12',
        border: `1.5px solid ${badge.color || 'var(--neon-green)'}`,
        borderRadius: '8px',
        padding: '16px',
        boxShadow: `0 0 25px ${badge.color || 'var(--neon-green)'}44, inset 0 0 15px ${badge.color || 'var(--neon-green)'}18`,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        backdropFilter: 'blur(8px)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} style={{ color: badge.color || 'var(--neon-green)' }} />
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              color: badge.color || 'var(--neon-green)',
              fontFamily: 'var(--font-mono)'
            }}
          >
            Cyber-Badge Unlocked!
          </span>
        </div>
        <button
          onClick={onDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-dim)',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex'
          }}
        >
          <X size={15} />
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '6px',
            background: `${badge.color || 'var(--neon-green)'}22`,
            border: `1px solid ${badge.color || 'var(--neon-green)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: badge.color || 'var(--neon-green)',
            flexShrink: 0
          }}
        >
          <Award size={22} />
        </div>
        <div style={{ minWidth: 0 }}>
          <h4
            style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: 700,
              color: '#fff',
              fontFamily: 'var(--font-display)'
            }}
          >
            {badge.title}
          </h4>
          <p
            style={{
              margin: '3px 0 0 0',
              fontSize: '12px',
              color: '#aaa',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {badge.description}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
        <button
          onClick={() => {
            onDismiss();
            onViewBadges();
          }}
          className="cyber-button-primary"
          style={{
            padding: '5px 12px',
            fontSize: '11px',
            background: badge.color,
            color: '#000',
            fontWeight: 700
          }}
        >
          VIEW IN MATRIX
        </button>
      </div>
    </div>
  );
};
