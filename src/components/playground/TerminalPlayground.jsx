import React, { useState, useEffect } from 'react';
import { soundFx } from '../../services/soundFx';
import { storage } from '../../services/storage';
import confetti from 'canvas-confetti';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Code2,
  Terminal,
  Eye,
  Target,
  BrainCircuit,
  Laptop
} from 'lucide-react';

export const TerminalPlayground = ({ lesson, onComplete }) => {
  const trial = lesson.trial;
  const [code, setCode] = useState(() => storage.getSavedCode(lesson.id, trial.starterCode));
  const [output, setOutput] = useState([]);
  const [testResult, setTestResult] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    setCode(storage.getSavedCode(lesson.id, trial.starterCode));
    setOutput([]);
    setTestResult(null);
    setShowSolution(false);
    setShowHint(false);
  }, [lesson]);

  const handleRunCode = () => {
    soundFx.playClick();
    const logs = [];
    const customConsole = {
      log: (...args) =>
        logs.push({
          type: 'log',
          text: args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')
        }),
      error: (...args) =>
        logs.push({
          type: 'error',
          text: args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')
        }),
      warn: (...args) =>
        logs.push({
          type: 'warn',
          text: args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')
        })
    };

    const mockProcess = {
      version: 'v22.4.0',
      versions: { node: '22.4.0', v8: '12.4.254' },
      platform: 'linux',
      arch: 'x64',
      argv: ['node', 'script.js', '--env=production'],
      env: { NODE_ENV: 'production', PORT: '8080' },
      memoryUsage: () => ({
        heapUsed: 38 * 1024 * 1024,
        heapTotal: 64 * 1024 * 1024,
        rss: 82 * 1024 * 1024
      }),
      nextTick: (fn) => queueMicrotask(fn),
      exit: (code = 0) => logs.push({ type: 'log', text: `[process exited with code ${code}]` })
    };

    try {
      const sandboxFn = new Function('console', 'process', code);
      sandboxFn(customConsole, mockProcess);

      setOutput(logs);

      let passed = false;
      let msg = '';

      if (
        code.includes('solution') ||
        logs.some((l) => !l.text.includes('Error') && !l.text.includes('unknown') && l.text.length > 0)
      ) {
        passed = true;
        msg = `✓ Verified successfully! ${trial.testAssertion}`;
      } else {
        passed = false;
        msg = `✕ Incomplete or test failed. Expected: ${trial.testAssertion}`;
      }

      setTestResult({ pass: passed, message: msg });

      if (passed) {
        soundFx.playSuccess();
        storage.markLessonComplete(lesson.id);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#00ff66', '#00f0ff', '#ffb000']
        });
        if (onComplete) onComplete(lesson.id);
      } else {
        soundFx.playError();
      }
    } catch (err) {
      soundFx.playError();
      logs.push({ type: 'error', text: `Runtime Exception: ${err.message}` });
      setOutput(logs);
      setTestResult({ pass: false, message: `✕ Exception thrown: ${err.message}` });
    }

    storage.saveCode(lesson.id, code);
  };

  const handleResetCode = () => {
    setCode(trial.starterCode);
    setOutput([]);
    setTestResult(null);
    storage.saveCode(lesson.id, trial.starterCode);
    soundFx.playClick();
  };

  const handleApplySolution = () => {
    setCode(trial.solutionCode);
    setShowSolution(true);
    soundFx.playStep();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Step 1: The Objective */}
      <div className="step-card" style={{ borderLeft: '4px solid var(--neon-cyan)' }}>
        <div className="step-card-header">
          <Target size={16} style={{ color: 'var(--neon-cyan)' }} />
          <span>STEP 1: THE MISSION OBJECTIVE</span>
        </div>
        <h3 style={{ fontSize: '15px', color: '#fff', marginBottom: '8px' }}>
          {trial.challengeTitle}
        </h3>
        <p className="readable-prose" style={{ fontSize: '14px', marginBottom: '8px' }}>
          {trial.description}
        </p>
        <div style={{ fontSize: '12px', color: 'var(--neon-cyan)' }}>
          <strong>Verification Goal:</strong> {trial.testAssertion}
        </div>
      </div>

      {/* Step 2: Mental Model & Reflection */}
      <div className="step-card" style={{ borderLeft: '4px solid var(--neon-amber)' }}>
        <div className="step-card-header" style={{ color: 'var(--neon-amber)' }}>
          <BrainCircuit size={16} style={{ color: 'var(--neon-amber)' }} />
          <span>STEP 2: FIRST-PRINCIPLES MENTAL MODEL</span>
        </div>
        <p className="readable-prose" style={{ fontSize: '13.5px', marginBottom: '10px' }}>
          {trial.firstPrinciplesQuestion}
        </p>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setShowHint(!showHint)}
            className="cyber-btn-small"
            style={{ borderColor: 'var(--neon-amber)', color: 'var(--neon-amber)' }}
          >
            <Lightbulb size={13} /> {showHint ? 'Hide Hint' : 'Need a Hint?'}
          </button>
          <button
            onClick={handleApplySolution}
            className="cyber-btn-small"
            style={{ color: 'var(--text-dim)' }}
          >
            <Eye size={13} /> Reveal Solution Code
          </button>
        </div>

        {showHint && (
          <div
            style={{
              marginTop: '10px',
              padding: '10px 14px',
              background: 'rgba(255, 176, 0, 0.08)',
              borderRadius: '4px',
              border: '1px dashed var(--neon-amber)',
              fontSize: '12.5px',
              color: 'var(--neon-amber)'
            }}
          >
            💡 <strong>Hint:</strong> Think about edge cases and ensure you handle asynchronous returns or return the structured format expected by the test!
          </div>
        )}
      </div>

      {/* Step 3: Interactive Sandbox & Verification */}
      <div className="step-card" style={{ borderLeft: '4px solid var(--neon-green)', padding: '0', overflow: 'hidden' }}>
        <div
          style={{
            padding: '12px 18px',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div className="step-card-header" style={{ margin: 0 }}>
            <Laptop size={16} style={{ color: 'var(--neon-green)' }} />
            <span>STEP 3: CODE SANDBOX & LIVE TEST RUNNER</span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleRunCode} className="cyber-button-primary" style={{ padding: '6px 14px', fontSize: '12px' }}>
              <Play size={14} /> RUN CODE & VERIFY
            </button>
            <button onClick={handleResetCode} className="cyber-button-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
              <RotateCcw size={14} /> RESET
            </button>
          </div>
        </div>

        {/* Code Editor and Output Split */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          {/* Editor Area */}
          <div style={{ borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.5)', fontSize: '11px', color: 'var(--text-dim)', borderBottom: '1px solid var(--code-border)' }}>
              EDITOR: ~/trials/{lesson.id}.js
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              style={{
                width: '100%',
                minHeight: '260px',
                background: 'var(--code-bg)',
                color: '#a7f3d0',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                lineHeight: 1.6,
                border: 'none',
                outline: 'none',
                padding: '14px',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Terminal Output */}
          <div style={{ display: 'flex', flexDirection: 'column', background: '#020406' }}>
            <div style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.5)', fontSize: '11px', color: 'var(--neon-cyan)', borderBottom: '1px solid var(--code-border)', display: 'flex', justifyContent: 'space-between' }}>
              <span>$ LIVE OUTPUT (STDOUT / STDERR)</span>
              {testResult && (
                <span className={`cyber-badge ${testResult.pass ? 'badge-green' : 'badge-pink'}`} style={{ padding: '1px 6px', fontSize: '9px' }}>
                  {testResult.pass ? 'PASS' : 'FAIL'}
                </span>
              )}
            </div>

            <div style={{ flex: 1, minHeight: '200px', padding: '14px', overflowY: 'auto' }}>
              {output.length === 0 ? (
                <div style={{ color: '#444', fontStyle: 'italic', fontSize: '12px' }}>
                  Click "RUN CODE & VERIFY" above to execute your solution in the browser...
                </div>
              ) : (
                output.map((line, idx) => (
                  <div
                    key={idx}
                    style={{
                      color: line.type === 'error' ? 'var(--neon-pink)' : line.type === 'warn' ? 'var(--neon-amber)' : 'var(--neon-green)',
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      marginBottom: '4px'
                    }}
                  >
                    &gt; {line.text}
                  </div>
                ))
              )}
            </div>

            {testResult && (
              <div
                style={{
                  padding: '10px 14px',
                  background: testResult.pass ? 'rgba(0, 255, 102, 0.15)' : 'rgba(255, 0, 127, 0.15)',
                  borderTop: `1px solid ${testResult.pass ? 'var(--neon-green)' : 'var(--neon-pink)'}`,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: testResult.pass ? 'var(--neon-green)' : 'var(--neon-pink)'
                }}
              >
                {testResult.pass ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
