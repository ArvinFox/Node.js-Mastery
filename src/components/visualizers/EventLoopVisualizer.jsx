import React, { useState, useEffect } from 'react';
import { soundFx } from '../../services/soundFx';
import { Play, Pause, SkipForward, RotateCcw, Cpu, Layers, Disc, Terminal, Info } from 'lucide-react';

const PHASES = [
  { id: 'timers', name: '1. TIMERS', desc: 'setTimeout, setInterval callbacks', color: '#00ff66' },
  { id: 'pending', name: '2. PENDING', desc: 'Deferred system I/O (e.g. TCP errors)', color: '#00f0ff' },
  { id: 'idle', name: '3. IDLE / PREPARE', desc: 'Libuv internal housekeeping', color: '#798ba3' },
  { id: 'poll', name: '4. POLL', desc: 'I/O retrieval & execution, connections', color: '#ffb000' },
  { id: 'check', name: '5. CHECK', desc: 'setImmediate() callbacks run here', color: '#b537f2' },
  { id: 'close', name: '6. CLOSE', desc: 'socket.on("close") cleanup handlers', color: '#ff007f' }
];

const PRESETS = [
  {
    id: 'nexttick-vs-timeout',
    title: 'nextTick vs Promise vs Timer',
    code: `console.log('SYNC_START');
setTimeout(() => console.log('TIMER_CB'), 0);
setImmediate(() => console.log('CHECK_CB'));
process.nextTick(() => console.log('NEXT_TICK'));
Promise.resolve().then(() => console.log('PROMISE_CB'));
console.log('SYNC_END');`,
    steps: [
      {
        phaseIndex: 0,
        currentPhase: 'callstack',
        callStack: ["console.log('SYNC_START')"],
        nextTickQueue: [],
        promiseQueue: [],
        phaseQueues: { timers: [], pending: [], idle: [], poll: [], check: [], close: [] },
        threadpool: ['Idle', 'Idle', 'Idle', 'Idle'],
        log: "V8 Call Stack: Running synchronous script. 'SYNC_START' emitted to stdout.",
        output: ['SYNC_START']
      },
      {
        phaseIndex: 0,
        currentPhase: 'callstack',
        callStack: ['setTimeout(..., 0)', 'setImmediate(...)'],
        nextTickQueue: ['NEXT_TICK'],
        promiseQueue: ['PROMISE_CB'],
        phaseQueues: { timers: ['TIMER_CB'], pending: [], idle: [], poll: [], check: ['CHECK_CB'], close: [] },
        threadpool: ['Idle', 'Idle', 'Idle', 'Idle'],
        log: "V8 schedules: setTimeout -> Timers Queue, setImmediate -> Check Queue, nextTick -> nextTick Queue, Promise -> Promise Queue.",
        output: ['SYNC_START', 'SYNC_END']
      },
      {
        phaseIndex: 0,
        currentPhase: 'microtask-nexttick',
        callStack: ["console.log('NEXT_TICK')"],
        nextTickQueue: ['NEXT_TICK (Executing)'],
        promiseQueue: ['PROMISE_CB'],
        phaseQueues: { timers: ['TIMER_CB'], pending: [], idle: [], poll: [], check: ['CHECK_CB'], close: [] },
        threadpool: ['Idle', 'Idle', 'Idle', 'Idle'],
        log: "PRIORITY DRAIN: process.nextTick has top priority! It executes BEFORE promises and before the Event Loop advances.",
        output: ['SYNC_START', 'SYNC_END', 'NEXT_TICK']
      },
      {
        phaseIndex: 0,
        currentPhase: 'microtask-promise',
        callStack: ["console.log('PROMISE_CB')"],
        nextTickQueue: [],
        promiseQueue: ['PROMISE_CB (Executing)'],
        phaseQueues: { timers: ['TIMER_CB'], pending: [], idle: [], poll: [], check: ['CHECK_CB'], close: [] },
        threadpool: ['Idle', 'Idle', 'Idle', 'Idle'],
        log: "PRIORITY DRAIN: Promise Microtask queue drains directly after nextTick queue.",
        output: ['SYNC_START', 'SYNC_END', 'NEXT_TICK', 'PROMISE_CB']
      },
      {
        phaseIndex: 0,
        currentPhase: 'timers',
        callStack: ["console.log('TIMER_CB')"],
        nextTickQueue: [],
        promiseQueue: [],
        phaseQueues: { timers: ['TIMER_CB (Executing)'], pending: [], idle: [], poll: [], check: ['CHECK_CB'], close: [] },
        threadpool: ['Idle', 'Idle', 'Idle', 'Idle'],
        log: "EVENT LOOP PHASE 1 (TIMERS): Loop begins. Expired 0ms timer callback executes.",
        output: ['SYNC_START', 'SYNC_END', 'NEXT_TICK', 'PROMISE_CB', 'TIMER_CB']
      },
      {
        phaseIndex: 4,
        currentPhase: 'check',
        callStack: ["console.log('CHECK_CB')"],
        nextTickQueue: [],
        promiseQueue: [],
        phaseQueues: { timers: [], pending: [], idle: [], poll: [], check: ['CHECK_CB (Executing)'], close: [] },
        threadpool: ['Idle', 'Idle', 'Idle', 'Idle'],
        log: "EVENT LOOP PHASE 5 (CHECK): Loop enters Check phase. setImmediate callback executes.",
        output: ['SYNC_START', 'SYNC_END', 'NEXT_TICK', 'PROMISE_CB', 'TIMER_CB', 'CHECK_CB']
      }
    ]
  },
  {
    id: 'io-poll-setimmediate',
    title: 'Inside fs.readFile Callback (Poll -> Check)',
    code: `fs.readFile('data.txt', () => {
  setTimeout(() => console.log('TIMEOUT'), 0);
  setImmediate(() => console.log('IMMEDIATE'));
});`,
    steps: [
      {
        phaseIndex: 3,
        currentPhase: 'poll',
        callStack: ['fs.readFile callback'],
        nextTickQueue: [],
        promiseQueue: [],
        phaseQueues: { timers: ['TIMEOUT (Scheduled)'], pending: [], idle: [], poll: ['I/O Callback (Active)'], check: ['IMMEDIATE (Scheduled)'], close: [] },
        threadpool: ['FS Read Finished', 'Idle', 'Idle', 'Idle'],
        log: "POLL PHASE: Threadpool finished reading disk. I/O callback executes in Poll phase, scheduling both setTimeout and setImmediate.",
        output: []
      },
      {
        phaseIndex: 4,
        currentPhase: 'check',
        callStack: ["console.log('IMMEDIATE')"],
        nextTickQueue: [],
        promiseQueue: [],
        phaseQueues: { timers: ['TIMEOUT (Scheduled)'], pending: [], idle: [], poll: [], check: ['IMMEDIATE (Executing)'], close: [] },
        threadpool: ['Idle', 'Idle', 'Idle', 'Idle'],
        log: "CHECK PHASE: The loop advances directly from Poll to Check phase! Therefore setImmediate is GUARANTEED to execute before setTimeout(0)!",
        output: ['IMMEDIATE']
      },
      {
        phaseIndex: 0,
        currentPhase: 'timers',
        callStack: ["console.log('TIMEOUT')"],
        nextTickQueue: [],
        promiseQueue: [],
        phaseQueues: { timers: ['TIMEOUT (Executing)'], pending: [], idle: [], poll: [], check: [], close: [] },
        threadpool: ['Idle', 'Idle', 'Idle', 'Idle'],
        log: "TIMERS PHASE (Next Loop Turn): The loop completes full rotation and reaches Timers phase to execute setTimeout callback.",
        output: ['IMMEDIATE', 'TIMEOUT']
      }
    ]
  }
];

export const EventLoopVisualizer = () => {
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1500);

  const currentStep = selectedPreset.steps[stepIndex] || selectedPreset.steps[0];

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setTimeout(() => {
        if (stepIndex < selectedPreset.steps.length - 1) {
          setStepIndex((prev) => prev + 1);
          soundFx.playStep();
        } else {
          setIsPlaying(false);
          soundFx.playSuccess();
        }
      }, speed);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, stepIndex, selectedPreset, speed]);

  const handleNextStep = () => {
    if (stepIndex < selectedPreset.steps.length - 1) {
      setStepIndex((prev) => prev + 1);
      soundFx.playStep();
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setStepIndex(0);
    soundFx.playClick();
  };

  const handleSelectPreset = (p) => {
    setSelectedPreset(p);
    setStepIndex(0);
    setIsPlaying(false);
    soundFx.playClick();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner & Preset Selector */}
      <div className="cyber-card" style={{ borderColor: 'var(--neon-green)' }}>
        <div className="cyber-card-header">
          <div className="cyber-card-title">
            <Disc className="animate-spin-slow" size={20} />
            LIBUV EVENT LOOP SIMULATOR & PHASE WHEEL
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                className={`cyber-btn-small ${selectedPreset.id === p.id ? 'active' : ''}`}
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        {/* Code Preview */}
        <pre className="cyber-code-block" style={{ margin: '0 0 16px 0', fontSize: '12px' }}>
          <code>{selectedPreset.code}</code>
        </pre>

        {/* Playback Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => {
                setIsPlaying(!isPlaying);
                soundFx.playClick();
              }}
              className="cyber-button-primary"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              {isPlaying ? 'PAUSE' : 'AUTO-PLAY'}
            </button>
            <button
              onClick={handleNextStep}
              disabled={stepIndex >= selectedPreset.steps.length - 1}
              className="cyber-button-secondary"
              style={{ opacity: stepIndex >= selectedPreset.steps.length - 1 ? 0.5 : 1 }}
            >
              <SkipForward size={16} /> STEP TICK
            </button>
            <button onClick={handleReset} className="cyber-button-secondary">
              <RotateCcw size={16} /> RESET
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-dim)' }}>
            <span>STEP: {stepIndex + 1} / {selectedPreset.steps.length}</span>
            <span>SPEED:</span>
            <input
              type="range"
              min="500"
              max="3000"
              step="250"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              style={{ accentColor: 'var(--neon-green)', width: '90px' }}
            />
          </div>
        </div>
      </div>

      {/* Main Visual Dashboard Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
        {/* Phase Wheel Column */}
        <div className="cyber-card">
          <div className="cyber-card-header">
            <span className="cyber-card-title" style={{ fontSize: '13px' }}>
              <Layers size={16} /> 6 LIBUV MACROTASK PHASES
            </span>
            <span className="cyber-badge badge-green">PHASE {currentStep.phaseIndex + 1}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {PHASES.map((phase, idx) => {
              const isActive = currentStep.phaseIndex === idx && currentStep.currentPhase === phase.id;
              const hasItems = currentStep.phaseQueues[phase.id] && currentStep.phaseQueues[phase.id].length > 0;
              return (
                <div
                  key={phase.id}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '4px',
                    background: isActive ? 'rgba(0, 255, 102, 0.15)' : 'var(--bg-secondary)',
                    border: `1px solid ${isActive ? 'var(--neon-green)' : hasItems ? 'var(--neon-cyan)' : 'var(--border-color)'}`,
                    boxShadow: isActive ? '0 0 12px rgba(0, 255, 102, 0.4)' : 'none',
                    transition: 'all 0.25s ease',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: isActive ? 'var(--neon-green)' : phase.color, fontSize: '13px' }}>
                      {phase.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{phase.desc}</div>
                  </div>
                  {hasItems && (
                    <span className="cyber-badge badge-cyan" style={{ fontSize: '10px' }}>
                      {currentStep.phaseQueues[phase.id].length} TASK
                    </span>
                  )}
                  {isActive && (
                    <span className="cyber-badge badge-green" style={{ fontSize: '10px', animation: 'pulse 1s infinite' }}>
                      ACTIVE
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Microtask Queues & Call Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Call Stack */}
          <div className="cyber-card">
            <div className="cyber-card-header">
              <span className="cyber-card-title" style={{ fontSize: '13px' }}>
                <Cpu size={16} /> V8 MAIN CALL STACK (Single Thread)
              </span>
              <span className="cyber-badge badge-cyan">SYNC STACK</span>
            </div>
            <div style={{ minHeight: '60px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {currentStep.callStack.length === 0 ? (
                <div style={{ color: 'var(--text-dim)', fontStyle: 'italic', fontSize: '12px' }}>[ Call Stack Empty — Waiting for next tick ]</div>
              ) : (
                currentStep.callStack.map((frame, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '8px 12px',
                      background: 'rgba(0, 240, 255, 0.1)',
                      borderLeft: '3px solid var(--neon-cyan)',
                      fontSize: '12px',
                      color: 'var(--neon-cyan)'
                    }}
                  >
                    ▶ {frame}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Microtask Queues */}
          <div className="cyber-card">
            <div className="cyber-card-header">
              <span className="cyber-card-title" style={{ fontSize: '13px', color: 'var(--neon-amber)' }}>
                ⚡ HIGHEST PRIORITY: MICROTASK QUEUES
              </span>
            </div>

            {/* nextTick */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--neon-green)', fontWeight: 700, marginBottom: '4px' }}>
                process.nextTick Queue (Priority #1)
              </div>
              <div style={{ minHeight: '34px', background: 'var(--bg-secondary)', padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '12px' }}>
                {currentStep.nextTickQueue.length === 0 ? (
                  <span style={{ color: 'var(--text-dim)' }}>Queue Empty</span>
                ) : (
                  currentStep.nextTickQueue.map((item, idx) => (
                    <span key={idx} className="cyber-badge badge-green" style={{ margin: '2px' }}>
                      {item}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Promise Microtasks */}
            <div>
              <div style={{ fontSize: '11px', color: 'var(--neon-cyan)', fontWeight: 700, marginBottom: '4px' }}>
                Promise.then / queueMicrotask Queue (Priority #2)
              </div>
              <div style={{ minHeight: '34px', background: 'var(--bg-secondary)', padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '12px' }}>
                {currentStep.promiseQueue.length === 0 ? (
                  <span style={{ color: 'var(--text-dim)' }}>Queue Empty</span>
                ) : (
                  currentStep.promiseQueue.map((item, idx) => (
                    <span key={idx} className="cyber-badge badge-cyan" style={{ margin: '2px' }}>
                      {item}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Libuv Threadpool */}
          <div className="cyber-card">
            <div className="cyber-card-header">
              <span className="cyber-card-title" style={{ fontSize: '13px', color: 'var(--neon-pink)' }}>
                LIBUV C++ THREADPOOL (UV_THREADPOOL_SIZE = 4)
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {currentStep.threadpool.map((status, i) => (
                <div
                  key={i}
                  style={{
                    padding: '8px',
                    textAlign: 'center',
                    background: status !== 'Idle' ? 'rgba(255, 0, 127, 0.15)' : 'var(--bg-secondary)',
                    border: `1px solid ${status !== 'Idle' ? 'var(--neon-pink)' : 'var(--border-color)'}`,
                    borderRadius: '4px'
                  }}
                >
                  <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>T#{i + 1}</div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: status !== 'Idle' ? 'var(--neon-pink)' : 'var(--text-dim)' }}>
                    {status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Live Log & Stdout */}
      <div className="cyber-card" style={{ borderColor: 'var(--border-color)' }}>
        <div className="cyber-card-header">
          <span className="cyber-card-title" style={{ fontSize: '13px' }}>
            <Terminal size={16} /> LIVE EXECUTION TRACER & STDOUT
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(0, 255, 102, 0.08)', borderRadius: '4px', borderLeft: '3px solid var(--neon-green)' }}>
            <Info size={16} style={{ color: 'var(--neon-green)', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>{currentStep.log}</span>
          </div>

          <div style={{ background: '#000', padding: '12px', borderRadius: '4px', border: '1px solid var(--code-border)', minHeight: '60px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>$ STDOUT BUFFER:</div>
            {currentStep.output.length === 0 ? (
              <div style={{ color: '#444', fontStyle: 'italic', fontSize: '12px' }}>[ No output generated yet ]</div>
            ) : (
              currentStep.output.map((out, i) => (
                <div key={i} style={{ color: 'var(--neon-green)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                  &gt; {out}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
