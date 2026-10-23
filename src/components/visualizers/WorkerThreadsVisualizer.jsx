import React, { useState, useEffect } from 'react';
import { soundFx } from '../../services/soundFx';
import { Cpu, Zap, Activity, AlertOctagon, CheckCircle2 } from 'lucide-react';

export const WorkerThreadsVisualizer = () => {
  const [activeMode, setActiveMode] = useState(null); // 'main' or 'worker'
  const [fps, setFps] = useState(60);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [calculationResult, setCalculationResult] = useState(null);

  // Simulated 60 FPS counter
  useEffect(() => {
    let lastTime = performance.now();
    let frameCount = 0;
    let animId;

    const measureFps = () => {
      const now = performance.now();
      frameCount++;
      if (now - lastTime >= 500) {
        if (activeMode === 'main') {
          setFps(0); // Main thread frozen!
        } else {
          setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        }
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(measureFps);
    };

    animId = requestAnimationFrame(measureFps);
    return () => cancelAnimationFrame(animId);
  }, [activeMode]);

  const runMainThread = () => {
    soundFx.playError();
    setActiveMode('main');
    setProgress(0);
    setCalculationResult(null);
    setLogs((prev) => [
      '>> [MAIN THREAD] Heavy CPU Task started on V8 Event Loop...',
      '>> [MAIN THREAD] ⚠️ Event Loop BLOCKED! 0 FPS. Ping timeout. Incoming HTTP requests dropped!',
      ...prev
    ]);

    // Simulate freezing
    setTimeout(() => {
      setProgress(100);
      setCalculationResult('Fibonacci(43) = 433,494,437 calculated in 1,842ms');
      setActiveMode(null);
      setFps(60);
      soundFx.playBeep(400, 0.1);
      setLogs((prev) => ['>> [MAIN THREAD] Calculation finished. Event Loop unlocked.', ...prev]);
    }, 2000);
  };

  const runWorkerThread = () => {
    soundFx.playSuccess();
    setActiveMode('worker');
    setProgress(0);
    setCalculationResult(null);
    setLogs((prev) => [
      '>> [WORKER] Spawning worker_threads Isolate #1 with SharedArrayBuffer...',
      '>> [MAIN THREAD] Event Loop running at 60 FPS! Serving 10,000 req/sec concurrently in background.',
      ...prev
    ]);

    let p = 0;
    const interval = setInterval(() => {
      p += 25;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setActiveMode(null);
        setCalculationResult('Fibonacci(43) = 433,494,437 received via parentPort.postMessage()');
        soundFx.playSuccess();
        setLogs((prev) => [
          '>> [WORKER] Task complete. Result transferred back without main thread lockup.',
          ...prev
        ]);
      }
    }, 400);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="cyber-card" style={{ borderColor: 'var(--neon-pink)' }}>
        <div className="cyber-card-header">
          <div className="cyber-card-title">
            <Cpu size={20} />
            WORKER THREADS VS MAIN THREAD CONCURRENCY BENCHMARK
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={16} style={{ color: fps > 30 ? 'var(--neon-green)' : 'var(--neon-pink)' }} />
            <span
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: fps > 30 ? 'var(--neon-green)' : 'var(--neon-pink)'
              }}
            >
              EVENT LOOP RESPONSIVENESS: {fps} FPS
            </span>
          </div>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-main)', marginBottom: '16px' }}>
          Compare what happens when calculating a heavy computational workload (e.g., cryptographic key generation, image manipulation, or recursive Fibonacci) on the single V8 main thread versus offloading to a <strong>worker_threads</strong> isolate.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <button
            onClick={runMainThread}
            disabled={activeMode !== null}
            className="cyber-button-secondary"
            style={{ borderColor: 'var(--neon-pink)', color: 'var(--neon-pink)' }}
          >
            <AlertOctagon size={16} /> Run on Main Thread (Freeze Test)
          </button>
          <button
            onClick={runWorkerThread}
            disabled={activeMode !== null}
            className="cyber-button-primary"
            style={{ borderColor: 'var(--neon-green)' }}
          >
            <Zap size={16} /> Offload to Worker Thread (Parallel)
          </button>
        </div>
      </div>

      {/* Grid Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
        {/* Main Thread Architecture Panel */}
        <div
          className="cyber-card"
          style={{
            borderColor: activeMode === 'main' ? 'var(--neon-pink)' : 'var(--border-color)',
            background: activeMode === 'main' ? 'rgba(255, 0, 127, 0.08)' : 'var(--bg-card)'
          }}
        >
          <div className="cyber-card-header">
            <span className="cyber-card-title" style={{ fontSize: '13px', color: 'var(--neon-pink)' }}>
              1. SINGLE V8 MAIN THREAD
            </span>
            {activeMode === 'main' ? (
              <span className="cyber-badge badge-pink">BLOCKED (0 FPS)</span>
            ) : (
              <span className="cyber-badge">STANDBY</span>
            )}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '12px' }}>
            When CPU calculations run on the main thread, the Event Loop CANNOT tick. All incoming HTTP connections, socket events, and timer callbacks freeze.
          </div>
          <div style={{ background: '#000', padding: '10px', borderRadius: '4px', fontSize: '12px', color: '#ff79c6' }}>
            <code>// Single-threaded synchronous block<br/>const result = heavyFibonacci(43);<br/>// Entire Node server frozen during execution!</code>
          </div>
        </div>

        {/* Worker Threads Architecture Panel */}
        <div
          className="cyber-card"
          style={{
            borderColor: activeMode === 'worker' ? 'var(--neon-green)' : 'var(--border-color)',
            background: activeMode === 'worker' ? 'rgba(0, 255, 102, 0.08)' : 'var(--bg-card)'
          }}
        >
          <div className="cyber-card-header">
            <span className="cyber-card-title" style={{ fontSize: '13px', color: 'var(--neon-green)' }}>
              2. WORKER THREAD ISOLATE
            </span>
            {activeMode === 'worker' ? (
              <span className="cyber-badge badge-green">PARALLEL (60 FPS)</span>
            ) : (
              <span className="cyber-badge">STANDBY</span>
            )}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '12px' }}>
            The CPU calculation runs on a dedicated OS thread inside its own V8 isolate. The main thread continues serving requests at full 60 FPS speed!
          </div>
          <div style={{ background: '#000', padding: '10px', borderRadius: '4px', fontSize: '12px', color: '#50fa7b' }}>
            <code>// worker_threads non-blocking delegation<br/>const worker = new Worker('./task.js');<br/>worker.on('message', (res) =&gt; sendResponse(res));</code>
          </div>
        </div>
      </div>

      {/* Progress & Log Console */}
      <div className="cyber-card">
        <div className="cyber-card-header">
          <span className="cyber-card-title" style={{ fontSize: '13px' }}>
            SYSTEM METRICS & WORKER IPC CONSOLE
          </span>
          {calculationResult && (
            <span className="cyber-badge badge-cyan" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={12} /> {calculationResult}
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden', marginBottom: '14px' }}>
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: activeMode === 'main' ? 'var(--neon-pink)' : 'var(--neon-green)',
              boxShadow: activeMode === 'main' ? '0 0 10px #ff007f' : '0 0 10px #00ff66',
              transition: 'width 0.3s ease'
            }}
          />
        </div>

        {/* Terminal Logs */}
        <div style={{ background: '#04070a', padding: '12px', borderRadius: '4px', minHeight: '80px', maxHeight: '140px', overflowY: 'auto' }}>
          {logs.length === 0 ? (
            <div style={{ color: 'var(--text-dim)', fontStyle: 'italic', fontSize: '12px' }}>
              Select a benchmark test above to inspect thread concurrency behavior...
            </div>
          ) : (
            logs.map((log, i) => (
              <div key={i} style={{ color: log.includes('BLOCKED') ? 'var(--neon-pink)' : 'var(--neon-green)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
