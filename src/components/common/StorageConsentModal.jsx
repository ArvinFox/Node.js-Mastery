import React, { useState } from 'react';
import { storage } from '../../services/storage';
import { soundFx } from '../../services/soundFx';
import { HardDrive, ShieldCheck, Zap, Monitor, CheckCircle2 } from 'lucide-react';

export const StorageConsentModal = ({ onConsentComplete }) => {
  const [choice, setChoice] = useState('local'); // 'local' or 'session'
  const [enableCrt, setEnableCrt] = useState(false); // Off by default

  const handleConfirm = () => {
    soundFx.playSuccess();
    storage.setConsent(choice);
    storage.setCRT(enableCrt);
    if (onConsentComplete) {
      onConsentComplete({ choice, enableCrt });
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(3, 6, 10, 0.85)',
        backdropFilter: 'blur(10px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        className="cyber-card"
        style={{
          maxWidth: '560px',
          width: '100%',
          borderColor: 'var(--neon-green)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 255, 102, 0.3)',
          animation: 'slide-up-fade 0.3s ease'
        }}
      >
        <div className="cyber-card-header">
          <div className="cyber-card-title" style={{ fontSize: '15px' }}>
            <HardDrive size={20} />
            LOCAL TELEMETRY & PROGRESS PERSISTENCE
          </div>
          <span className="cyber-badge badge-green">FIRST-BOOT SETUP</span>
        </div>

        <p className="readable-prose" style={{ fontSize: '14px', marginBottom: '16px' }}>
          Welcome, Engineer. <strong>Node.js Mastery</strong> tracks your completed missions, code challenge drafts, and cryptographic cyber-badges.
        </p>

        {/* Choice 1: Local Storage (Recommended) */}
        <div
          onClick={() => {
            setChoice('local');
            soundFx.playClick();
          }}
          style={{
            padding: '14px',
            borderRadius: '6px',
            border: `1.5px solid ${choice === 'local' ? 'var(--neon-green)' : 'var(--border-color)'}`,
            background: choice === 'local' ? 'rgba(0, 255, 102, 0.08)' : 'var(--bg-secondary)',
            cursor: 'pointer',
            marginBottom: '12px',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--neon-green)', fontWeight: 700, fontSize: '13px' }}>
              <ShieldCheck size={18} />
              <span>Persistent Local Storage (Recommended)</span>
            </div>
            {choice === 'local' && <CheckCircle2 size={16} style={{ color: 'var(--neon-green)' }} />}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: 0, lineHeight: 1.5 }}>
            Saves your mission progress, test assertions, and custom code solutions in your browser's private local cache (<code>localStorage</code>). 100% offline, zero external tracking, stays on this machine.
          </p>
        </div>

        {/* Choice 2: Session Only */}
        <div
          onClick={() => {
            setChoice('session');
            soundFx.playClick();
          }}
          style={{
            padding: '14px',
            borderRadius: '6px',
            border: `1.5px solid ${choice === 'session' ? 'var(--neon-cyan)' : 'var(--border-color)'}`,
            background: choice === 'session' ? 'rgba(0, 240, 255, 0.08)' : 'var(--bg-secondary)',
            cursor: 'pointer',
            marginBottom: '16px',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--neon-cyan)', fontWeight: 700, fontSize: '13px' }}>
              <Zap size={18} />
              <span>Ephemeral Session Mode</span>
            </div>
            {choice === 'session' && <CheckCircle2 size={16} style={{ color: 'var(--neon-cyan)' }} />}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: 0, lineHeight: 1.5 }}>
            Keep progress in temporary memory for this browser tab only. Progress will reset when the tab is closed.
          </p>
        </div>

        {/* CRT Scanlines Option (Off by Default) */}
        <div
          style={{
            padding: '10px 14px',
            background: 'var(--bg-secondary)',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Monitor size={16} style={{ color: 'var(--text-dim)' }} />
            <span style={{ fontSize: '12.5px', color: 'var(--text-main)' }}>
              Retro CRT Scanline Filter:
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setEnableCrt(!enableCrt);
              soundFx.playClick();
            }}
            className={`cyber-btn-small ${enableCrt ? 'active' : ''}`}
            style={{ fontSize: '11px', padding: '3px 10px' }}
          >
            {enableCrt ? 'ENABLED' : 'DISABLED (Default)'}
          </button>
        </div>

        {/* Confirmation Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleConfirm}
            className="cyber-button-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '13px' }}
          >
            CONFIRM & ENTER TERMINAL →
          </button>
        </div>
      </div>
    </div>
  );
};
