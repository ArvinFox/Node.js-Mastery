import React, { useState, useEffect, useRef } from 'react';
import { soundFx } from '../../services/soundFx';
import { Terminal, Send, X, Minimize2, Sparkles, ChevronUp, Command } from 'lucide-react';

export const HackerCLI = ({ onNavigate, onThemeChange, onCrtToggle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState([
    { type: 'system', text: 'Node.js Mastery Cybernetic Kernel v22.15 LTS Online.' },
    { type: 'system', text: 'Type "help" or click the quick command chips below to navigate.' }
  ]);

  const inputRef = useRef(null);
  const logEndRef = useRef(null);

  // Global keyboard shortcut: Press ` (backquote/tilde) to toggle CLI
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if user is typing inside another input or textarea
      const isInputActive = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
      if (e.key === '`' && !isInputActive) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        soundFx.playBeep(800, 0.05);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-scroll history and auto-focus
  useEffect(() => {
    if (isOpen) {
      if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: 'smooth' });
      if (inputRef.current) inputRef.current.focus();
    }
  }, [isOpen, history]);

  const executeCommand = (cmdText) => {
    const rawCmd = cmdText.trim();
    if (!rawCmd) return;

    soundFx.playClick();
    const cmd = rawCmd.toLowerCase();
    const parts = cmd.split(' ');
    const action = parts[0];
    const arg = parts[1];

    const newLogs = [...history, { type: 'user', text: `$ ${rawCmd}` }];

    switch (action) {
      case 'help':
        newLogs.push({
          type: 'system',
          text: 'AVAILABLE CYBER COMMANDS:\n • goto <missions|labs|theorems|quiz> — Switch main view\n • theme <matrix|cyberpunk|amber|obsidian> — Change theme\n • crt — Toggle retro scanlines\n • sound — Toggle synthesized audio\n • clear — Clear terminal screen\n • help — Show this manual'
        });
        soundFx.playBeep(600, 0.08);
        break;

      case 'goto':
        if (['missions', 'labs', 'curriculum', 'sim-loop', 'sim-stream', 'sim-worker', 'sim-gc', 'theorems', 'quiz'].includes(arg)) {
          onNavigate(arg);
          newLogs.push({ type: 'success', text: `✓ Route dispatched: Jumping to "${arg}"...` });
          soundFx.playSuccess();
        } else {
          newLogs.push({ type: 'error', text: `✕ Unknown target "${arg}". Try: missions, labs, theorems, quiz` });
          soundFx.playError();
        }
        break;

      case 'theme':
        if (['matrix', 'cyberpunk', 'amber', 'obsidian', 'light'].includes(arg)) {
          onThemeChange(arg);
          newLogs.push({ type: 'success', text: `✓ Visual core theme reconfigured to "${arg}".` });
          soundFx.playSuccess();
        } else {
          newLogs.push({ type: 'error', text: `✕ Invalid theme "${arg}". Valid options: matrix, cyberpunk, amber, obsidian, light` });
          soundFx.playError();
        }
        break;

      case 'crt':
        onCrtToggle();
        newLogs.push({ type: 'system', text: '✓ CRT phosphor scanline filter state toggled.' });
        soundFx.playBeep(700, 0.05);
        break;

      case 'sound':
        const muted = soundFx.toggleMute();
        newLogs.push({ type: 'system', text: `✓ Synthesized audio effects: ${muted ? 'MUTED' : 'ENABLED'}` });
        break;

      case 'clear':
        setHistory([]);
        setInputVal('');
        return;

      default:
        newLogs.push({
          type: 'error',
          text: `✕ Command not recognized: "${rawCmd}". Type "help" for a list of valid commands.`
        });
        soundFx.playError();
        break;
    }

    setHistory(newLogs);
    setInputVal('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    executeCommand(inputVal);
  };

  const quickChips = [
    { label: 'help', cmd: 'help' },
    { label: 'goto missions', cmd: 'goto missions' },
    { label: 'goto labs', cmd: 'goto labs' },
    { label: 'goto theorems', cmd: 'goto theorems' },
    { label: 'goto quiz', cmd: 'goto quiz' },
    { label: 'theme light', cmd: 'theme light' },
    { label: 'theme cyber', cmd: 'theme cyberpunk' },
    { label: 'theme matrix', cmd: 'theme matrix' },
    { label: 'crt scanlines', cmd: 'crt' },
    { label: 'clear', cmd: 'clear' }
  ];

  return (
    <>
      {/* 1. Floating Launcher Pill (Visible when terminal is closed) */}
      {!isOpen && (
        <div
          onClick={() => {
            setIsOpen(true);
            soundFx.playBeep(750, 0.05);
          }}
          className="floating-cli-launcher"
          title="Open Hacker Terminal Console (Shortcut: Press ~ key)"
        >
          <div className="pulsing-beacon" />
          <Terminal size={15} />
          <span style={{ fontWeight: 700 }}>HACKER CLI</span>
          <span
            style={{
              fontSize: '10px',
              padding: '1px 5px',
              borderRadius: '3px',
              background: 'rgba(0, 255, 102, 0.15)',
              border: '1px solid var(--neon-green)',
              color: 'var(--neon-green)'
            }}
          >
            Press ~
          </span>
          <ChevronUp size={14} style={{ opacity: 0.8 }} />
        </div>
      )}

      {/* 2. Floating Cyberpunk Terminal Window (Visible when opened) */}
      {isOpen && (
        <div className="floating-terminal-window">
          {/* Window Header */}
          <div className="floating-terminal-header">
            <div className="floating-terminal-title">
              <Terminal size={16} />
              <span>NODE.JS ARCHITECT CLI v22 LTS</span>
              <span
                style={{
                  fontSize: '10px',
                  padding: '1px 6px',
                  borderRadius: '3px',
                  background: 'rgba(0, 255, 102, 0.1)',
                  border: '1px solid var(--neon-green)',
                  color: 'var(--neon-green)',
                  fontWeight: 400
                }}
              >
                ACTIVE
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginRight: '4px' }}>
                Toggle: [~]
              </span>
              <button
                onClick={() => {
                  setIsOpen(false);
                  soundFx.playClick();
                }}
                className="cyber-btn-small"
                style={{ padding: '3px 8px' }}
                title="Minimize Terminal"
              >
                <Minimize2 size={13} />
              </button>
            </div>
          </div>

          {/* Clickable Quick Command Chips */}
          <div className="floating-terminal-chips">
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', marginRight: '4px' }}>
              QUICK:
            </span>
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => executeCommand(chip.cmd)}
                className="quick-chip"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Scrollable Command Log History */}
          <div className="floating-terminal-body">
            {history.map((item, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: '6px',
                  whiteSpace: 'pre-line',
                  color:
                    item.type === 'user'
                      ? 'var(--neon-green)'
                      : item.type === 'error'
                      ? 'var(--neon-pink)'
                      : item.type === 'success'
                      ? 'var(--neon-cyan)'
                      : '#94a3b8'
                }}
              >
                {item.text}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>

          {/* Interactive Command Input Form */}
          <form onSubmit={handleSubmit} className="floating-terminal-input-bar">
            <div style={{ color: 'var(--neon-green)', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>hacker@node:~$</span>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="type command (e.g., help, goto labs, theme cyber)..."
              className="floating-cli-input"
            />
            <button
              type="submit"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--neon-green)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
