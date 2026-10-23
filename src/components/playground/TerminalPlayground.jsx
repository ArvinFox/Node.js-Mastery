import React, { useState, useEffect } from 'react';
import { soundFx } from '../../services/soundFx';
import { storage } from '../../services/storage';
import { missionValidators } from './missionValidators';
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
  Laptop,
  Loader2
} from 'lucide-react';

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

// Browser-safe Node.js Polyfills for Sandbox Execution
class MockBuffer {
  constructor(arg) {
    if (typeof arg === 'number') {
      this.data = new Uint8Array(arg);
    } else if (Array.isArray(arg) || arg instanceof Uint8Array) {
      this.data = new Uint8Array(arg);
    } else if (typeof arg === 'string') {
      this.data = new TextEncoder().encode(arg);
    } else {
      this.data = new Uint8Array(0);
    }
    this.length = this.data.length;
  }
  static from(data, enc) {
    if (typeof data === 'string') {
      return new MockBuffer(new TextEncoder().encode(data));
    }
    if (Array.isArray(data) || data instanceof Uint8Array) {
      return new MockBuffer(data);
    }
    return new MockBuffer(0);
  }
  static alloc(size, fill = 0) {
    const b = new MockBuffer(size);
    b.data.fill(fill);
    return b;
  }
  readUInt16BE(offset = 0) {
    return (this.data[offset] << 8) | this.data[offset + 1];
  }
  readUInt8(offset = 0) {
    return this.data[offset];
  }
  toString(encoding = 'utf8', start = 0, end) {
    const slice = this.data.subarray(start, end !== undefined ? end : this.data.length);
    return new TextDecoder().decode(slice);
  }
  subarray(start, end) {
    return new MockBuffer(this.data.subarray(start, end));
  }
  slice(start, end) {
    return this.subarray(start, end);
  }
  write(str, offset = 0) {
    const bytes = new TextEncoder().encode(str);
    this.data.set(bytes, offset);
    return bytes.length;
  }
}

class MockAsyncLocalStorage {
  constructor() {
    this.currentStore = undefined;
  }
  run(store, callback, ...args) {
    const prev = this.currentStore;
    this.currentStore = store;
    try {
      return callback(...args);
    } finally {
      this.currentStore = prev;
    }
  }
  getStore() {
    return this.currentStore;
  }
}

const mockRequire = (mod) => {
  if (mod === 'node:async_hooks' || mod === 'async_hooks') {
    return { AsyncLocalStorage: MockAsyncLocalStorage };
  }
  if (mod === 'node:buffer' || mod === 'buffer') {
    return { Buffer: MockBuffer };
  }
  if (mod === 'node:events' || mod === 'events') {
    return {
      EventEmitter: class {
        constructor() {
          this._events = {};
        }
        on(evt, fn) {
          (this._events[evt] = this._events[evt] || []).push(fn);
          return this;
        }
        emit(evt, ...args) {
          (this._events[evt] || []).forEach((fn) => fn(...args));
          return true;
        }
        once(evt, fn) {
          const wrapper = (...args) => {
            this.removeListener(evt, wrapper);
            fn(...args);
          };
          return this.on(evt, wrapper);
        }
        removeListener(evt, fn) {
          if (this._events[evt]) {
            this._events[evt] = this._events[evt].filter((f) => f !== fn);
          }
          return this;
        }
      }
    };
  }
  return {};
};

const SafeSharedArrayBuffer =
  typeof SharedArrayBuffer !== 'undefined' ? SharedArrayBuffer : ArrayBuffer;

const SafeAtomics =
  typeof Atomics !== 'undefined'
    ? Atomics
    : {
        compareExchange: (arr, idx, exp, rep) => {
          const old = arr[idx];
          if (old === exp) arr[idx] = rep;
          return old;
        },
        store: (arr, idx, val) => {
          arr[idx] = val;
          return val;
        },
        load: (arr, idx) => arr[idx]
      };

export const TerminalPlayground = ({ lesson, onComplete }) => {
  const trial = lesson.trial;
  const [code, setCode] = useState(() => storage.getSavedCode(lesson.id, trial.starterCode));
  const [output, setOutput] = useState([]);
  const [testResult, setTestResult] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setCode(storage.getSavedCode(lesson.id, trial.starterCode));
    setOutput([]);
    setTestResult(null);
    setShowSolution(false);
    setShowHint(false);
    setIsRunning(false);
  }, [lesson]);

  const handleRunCode = async () => {
    if (isRunning) return;
    setIsRunning(true);
    soundFx.playClick();

    const logs = [];
    const customConsole = {
      log: (...args) =>
        logs.push({
          type: 'log',
          text: args
            .map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a)))
            .join(' ')
        }),
      error: (...args) =>
        logs.push({
          type: 'error',
          text: args
            .map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a)))
            .join(' ')
        }),
      warn: (...args) =>
        logs.push({
          type: 'warn',
          text: args
            .map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a)))
            .join(' ')
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
      const wrappedCode = `
        ${code};
        return {
          detectRuntime: typeof detectRuntime !== 'undefined' ? detectRuntime : undefined,
          parseArgs: typeof parseArgs !== 'undefined' ? parseArgs : undefined,
          bustCacheAndRequire: typeof bustCacheAndRequire !== 'undefined' ? bustCacheAndRequire : undefined,
          myPromisify: typeof myPromisify !== 'undefined' ? myPromisify : undefined,
          runWithConcurrency: typeof runWithConcurrency !== 'undefined' ? runWithConcurrency : undefined,
          TinyEventEmitter: typeof TinyEventEmitter !== 'undefined' ? TinyEventEmitter : undefined,
          parseHeader: typeof parseHeader !== 'undefined' ? parseHeader : undefined,
          countWordsInChunks: typeof countWordsInChunks !== 'undefined' ? countWordsInChunks : undefined,
          parseRawHttpRequest: typeof parseRawHttpRequest !== 'undefined' ? parseRawHttpRequest : undefined,
          MiniReactor: typeof MiniReactor !== 'undefined' ? MiniReactor : undefined,
          getPredictedOrder: typeof getPredictedOrder !== 'undefined' ? getPredictedOrder : undefined,
          safePump: typeof safePump !== 'undefined' ? safePump : undefined,
          createIpcRouter: typeof createIpcRouter !== 'undefined' ? createIpcRouter : undefined,
          safeDeepMerge: typeof safeDeepMerge !== 'undefined' ? safeDeepMerge : undefined,
          CyberLock: typeof CyberLock !== 'undefined' ? CyberLock : undefined,
          rollingDeploy: typeof rollingDeploy !== 'undefined' ? rollingDeploy : undefined,
          MiniContext: typeof MiniContext !== 'undefined' ? MiniContext : undefined,
          ObjectPool: typeof ObjectPool !== 'undefined' ? ObjectPool : undefined,
          LeakingCache: typeof LeakingCache !== 'undefined' ? LeakingCache : undefined,
          wrapNativeBinding: typeof wrapNativeBinding !== 'undefined' ? wrapNativeBinding : undefined,
        };
      `;

      const runner = new AsyncFunction(
        'console',
        'process',
        'require',
        'Buffer',
        'SharedArrayBuffer',
        'Atomics',
        wrappedCode
      );

      const execPromise = runner(
        customConsole,
        mockProcess,
        mockRequire,
        MockBuffer,
        SafeSharedArrayBuffer,
        SafeAtomics
      );

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                'Execution timed out (5000ms limit). Check for infinite loops or unhandled promises.'
              )
            ),
          5000
        )
      );

      const scope = await Promise.race([execPromise, timeoutPromise]);
      scope.Buffer = MockBuffer;
      scope.SharedArrayBuffer = SafeSharedArrayBuffer;
      scope.Atomics = SafeAtomics;

      // Yield for any microtasks/timers
      await new Promise((r) => setTimeout(r, 60));

      setOutput([...logs]);

      const validator = missionValidators[lesson.id];
      let testOutcome;
      if (typeof validator === 'function') {
        testOutcome = await validator(scope, logs);
      } else {
        testOutcome = {
          pass: false,
          message: 'No automated validator configured for this mission.'
        };
      }

      setTestResult(testOutcome);

      if (testOutcome.pass) {
        soundFx.playSuccess();
        storage.markLessonComplete(lesson.id);
        confetti({
          particleCount: 60,
          spread: 70,
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
      setOutput([...logs]);
      setTestResult({ pass: false, message: `✕ Exception thrown: ${err.message}` });
    } finally {
      setIsRunning(false);
      storage.saveCode(lesson.id, code);
    }
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
            💡 <strong>Hint:</strong> Make sure to implement the required logic without leaving placeholder TODOs. The test runner validates real functional execution and edge cases!
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
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="cyber-button-primary"
              style={{
                padding: '6px 14px',
                fontSize: '12px',
                opacity: isRunning ? 0.7 : 1,
                cursor: isRunning ? 'wait' : 'pointer'
              }}
            >
              {isRunning ? (
                <>
                  <Loader2 size={14} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} /> VERIFYING...
                </>
              ) : (
                <>
                  <Play size={14} /> RUN CODE & VERIFY
                </>
              )}
            </button>
            <button
              onClick={handleResetCode}
              disabled={isRunning}
              className="cyber-button-secondary"
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
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
                minHeight: '280px',
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

            <div style={{ flex: 1, minHeight: '220px', padding: '14px', overflowY: 'auto' }}>
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
                  padding: '12px 14px',
                  background: testResult.pass ? 'rgba(0, 255, 102, 0.12)' : 'rgba(255, 0, 127, 0.12)',
                  borderTop: `1px solid ${testResult.pass ? 'var(--neon-green)' : 'var(--neon-pink)'}`,
                  fontSize: '12.5px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  color: testResult.pass ? 'var(--neon-green)' : 'var(--neon-pink)'
                }}
              >
                {testResult.pass ? (
                  <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                ) : (
                  <XCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                )}
                <span style={{ lineHeight: 1.4 }}>{testResult.message}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
