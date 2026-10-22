import React, { useState, useEffect, useRef } from 'react';
import { soundFx } from '../../services/soundFx';
import { Waves, Play, Pause, AlertTriangle, ShieldCheck, RefreshCw, ArrowRight } from 'lucide-react';

export const StreamBackpressureVisualizer = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('backpressure'); // 'backpressure' or 'naive'
  const [readSpeed, setReadSpeed] = useState(4); // Chunks generated per cycle
  const [writeSpeed, setWriteSpeed] = useState(1); // Chunks consumed per cycle
  const [bufferLevel, setBufferLevel] = useState(0); // Current chunks in buffer
  const [highWaterMark] = useState(16); // 16 chunks = 16KB
  const [isPaused, setIsPaused] = useState(false);
  const [totalProduced, setTotalProduced] = useState(0);
  const [totalConsumed, setTotalConsumed] = useState(0);
  const [isCrashed, setIsCrashed] = useState(false);

  // Simulation tick loop
  useEffect(() => {
    let interval;
    if (isRunning && !isCrashed) {
      interval = setInterval(() => {
        setBufferLevel((currentBuffer) => {
          let producedThisTick = 0;

          if (mode === 'backpressure') {
            // BACKPRESSURE PROTOCOL
            if (!isPaused) {
              producedThisTick = readSpeed;
            }
          } else {
            // NAIVE UNHANDLED: Ignores backpressure, pumps constantly!
            producedThisTick = readSpeed;
          }

          const consumedThisTick = Math.min(writeSpeed, currentBuffer);
          const newLevel = Math.max(0, currentBuffer + producedThisTick - consumedThisTick);

          setTotalProduced((p) => p + producedThisTick);
          setTotalConsumed((c) => c + consumedThisTick);

          // Check Backpressure condition
          if (mode === 'backpressure') {
            if (newLevel >= highWaterMark && !isPaused) {
              setIsPaused(true);
              soundFx.playError();
            } else if (newLevel <= 2 && isPaused) {
              // 'drain' event emitted!
              setIsPaused(false);
              soundFx.playStep();
            }
          } else {
            // Naive mode check for OOM Crash!
            if (newLevel > 60) {
              setIsCrashed(true);
              setIsRunning(false);
              soundFx.playError();
            }
          }

          return newLevel;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused, mode, readSpeed, writeSpeed, highWaterMark, isCrashed]);

  const handleReset = () => {
    setIsRunning(false);
    setIsCrashed(false);
    setBufferLevel(0);
    setIsPaused(false);
    setTotalProduced(0);
    setTotalConsumed(0);
    soundFx.playClick();
  };

  const bufferPercentage = Math.min(100, (bufferLevel / highWaterMark) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header and Mode Toggle */}
      <div className="cyber-card" style={{ borderColor: isCrashed ? 'var(--neon-pink)' : 'var(--neon-cyan)' }}>
        <div className="cyber-card-header">
          <div className="cyber-card-title">
            <Waves size={20} />
            STREAM FLUID DYNAMICS & BACKPRESSURE SIMULATOR
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                setMode('backpressure');
                handleReset();
              }}
              className={`cyber-btn-small ${mode === 'backpressure' ? 'active' : ''}`}
            >
              <ShieldCheck size={14} /> Backpressure Protocol (Safe)
            </button>
            <button
              onClick={() => {
                setMode('naive');
                handleReset();
              }}
              className={`cyber-btn-small ${mode === 'naive' ? 'active' : ''}`}
              style={{ color: mode === 'naive' ? 'var(--neon-pink)' : 'var(--text-dim)' }}
            >
              <AlertTriangle size={14} /> Naive Pipe (Crash Demo)
            </button>
          </div>
        </div>

        {/* Status Explanation */}
        <div style={{ fontSize: '13px', color: 'var(--text-main)', marginBottom: '16px' }}>
          {mode === 'backpressure' ? (
            <span>
              <strong style={{ color: 'var(--neon-green)' }}>Backpressure Active:</strong> When internal buffer reaches highWaterMark (16KB), <code>writable.write()</code> returns <code>false</code>. Readable stream pauses until <code>'drain'</code> event fires.
            </span>
          ) : (
            <span>
              <strong style={{ color: 'var(--neon-pink)' }}>Naive Unchecked Mode:</strong> The producer pumps data without checking return values. Watch RAM diverge to infinity until V8 crashes with Out of Memory!
            </span>
          )}
        </div>

        {/* Controls Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => {
                setIsRunning(!isRunning);
                soundFx.playClick();
              }}
              className="cyber-button-primary"
              disabled={isCrashed}
            >
              {isRunning ? <Pause size={16} /> : <Play size={16} />}
              {isRunning ? 'PAUSE PIPELINE' : 'START STREAM PUMP'}
            </button>
            <button onClick={handleReset} className="cyber-button-secondary">
              <RefreshCw size={16} /> RESET
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '12px', flexWrap: 'wrap' }}>
            <div>
              <span style={{ color: 'var(--neon-cyan)', marginRight: '6px' }}>Producer Speed (Read):</span>
              <input
                type="range"
                min="1"
                max="8"
                value={readSpeed}
                onChange={(e) => setReadSpeed(Number(e.target.value))}
                style={{ accentColor: 'var(--neon-cyan)', width: '80px' }}
              />
              <span style={{ marginLeft: '4px' }}>{readSpeed}x</span>
            </div>
            <div>
              <span style={{ color: 'var(--neon-amber)', marginRight: '6px' }}>Consumer Sink (Write):</span>
              <input
                type="range"
                min="1"
                max="8"
                value={writeSpeed}
                onChange={(e) => setWriteSpeed(Number(e.target.value))}
                style={{ accentColor: 'var(--neon-amber)', width: '80px' }}
              />
              <span style={{ marginLeft: '4px' }}>{writeSpeed}x</span>
            </div>
          </div>
        </div>
      </div>

      {/* Crash Alert Modal */}
      {isCrashed && (
        <div
          className="cyber-card"
          style={{
            borderColor: 'var(--neon-pink)',
            background: 'rgba(255, 0, 127, 0.1)',
            boxShadow: '0 0 20px rgba(255, 0, 127, 0.4)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={32} style={{ color: 'var(--neon-pink)' }} />
            <div>
              <h3 style={{ color: 'var(--neon-pink)', fontSize: '16px' }}>FATAL ERROR: JavaScript heap out of memory</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-main)' }}>
                The unhandled stream flooded RAM because the consumer was too slow. This is why <strong>stream.pipeline</strong> and backpressure handling are critical in production!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Visual Pipeline Architecture (Source -> Buffer Chamber -> Sink) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1.5fr auto 1fr', gap: '12px', alignItems: 'center' }}>
        {/* Readable Stream Box */}
        <div className="cyber-card" style={{ textAlign: 'center', borderColor: isPaused ? 'var(--neon-pink)' : 'var(--neon-cyan)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>SOURCE</div>
          <h4 style={{ color: 'var(--neon-cyan)', fontSize: '14px', marginBottom: '8px' }}>Readable Stream</h4>
          <div style={{ fontSize: '12px', color: 'var(--text-main)', marginBottom: '10px' }}>
            {isPaused ? (
              <span className="cyber-badge badge-pink">STREAM PAUSED (write() === false)</span>
            ) : isRunning ? (
              <span className="cyber-badge badge-cyan">STREAMING DATA...</span>
            ) : (
              <span className="cyber-badge">IDLE</span>
            )}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
            Produced: <strong>{totalProduced} KB</strong>
          </div>
        </div>

        <ArrowRight size={24} style={{ color: 'var(--neon-cyan)' }} />

        {/* Buffer Liquid Chamber */}
        <div className="cyber-card" style={{ borderColor: bufferLevel >= highWaterMark ? 'var(--neon-pink)' : 'var(--neon-green)' }}>
          <div className="cyber-card-header" style={{ marginBottom: '8px', paddingBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
              INTERNAL BUFFER CHAMBER
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
              highWaterMark: {highWaterMark} KB
            </span>
          </div>

          {/* Liquid Tank Display */}
          <div
            style={{
              height: '80px',
              background: '#04070a',
              border: '2px solid var(--border-color)',
              borderRadius: '4px',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'flex-end'
            }}
          >
            {/* Watermark threshold line */}
            <div
              style={{
                position: 'absolute',
                top: '0%',
                left: 0,
                right: 0,
                borderTop: '2px dashed var(--neon-pink)',
                zIndex: 5
              }}
            >
              <span style={{ position: 'absolute', right: '4px', top: '-14px', fontSize: '10px', color: 'var(--neon-pink)' }}>
                WATERMARK (16KB)
              </span>
            </div>

            {/* Fluid fill level */}
            <div
              style={{
                width: '100%',
                height: `${bufferPercentage}%`,
                background:
                  bufferLevel >= highWaterMark
                    ? 'linear-gradient(180deg, #ff007f 0%, rgba(255, 0, 127, 0.4) 100%)'
                    : 'linear-gradient(180deg, #00ff66 0%, rgba(0, 255, 102, 0.3) 100%)',
                boxShadow: bufferLevel >= highWaterMark ? '0 0 20px #ff007f' : '0 0 15px #00ff66',
                transition: 'height 0.25s ease'
              }}
            />

            {/* Centered Volume Text */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '14px',
                fontWeight: 700,
                color: '#fff',
                textShadow: '0 0 8px #000',
                zIndex: 6
              }}
            >
              {bufferLevel} KB IN BUFFER {bufferLevel >= highWaterMark ? '⚠️ [BACKPRESSURE]' : ''}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: 'var(--text-dim)' }}>
            <span>0 KB</span>
            <span>Drain Trigger: ≤ 2 KB</span>
            <span>Limit: {highWaterMark} KB</span>
          </div>
        </div>

        <ArrowRight size={24} style={{ color: 'var(--neon-amber)' }} />

        {/* Writable Stream Box */}
        <div className="cyber-card" style={{ textAlign: 'center', borderColor: 'var(--neon-amber)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>SINK</div>
          <h4 style={{ color: 'var(--neon-amber)', fontSize: '14px', marginBottom: '8px' }}>Writable Stream</h4>
          <div style={{ fontSize: '12px', color: 'var(--text-main)', marginBottom: '10px' }}>
            {isRunning && bufferLevel > 0 ? (
              <span className="cyber-badge badge-amber">FLUSHING TO SINK</span>
            ) : (
              <span className="cyber-badge">DRAINED</span>
            )}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
            Consumed: <strong>{totalConsumed} KB</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
