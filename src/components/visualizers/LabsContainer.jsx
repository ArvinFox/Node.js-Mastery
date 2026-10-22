import React, { useState } from 'react';
import { EventLoopVisualizer } from './EventLoopVisualizer';
import { StreamBackpressureVisualizer } from './StreamBackpressureVisualizer';
import { WorkerThreadsVisualizer } from './WorkerThreadsVisualizer';
import { GarbageCollectionVisualizer } from './GarbageCollectionVisualizer';
import { soundFx } from '../../services/soundFx';
import { Disc, Waves, Cpu, Trash2, FlaskConical } from 'lucide-react';

export const LabsContainer = ({ initialLab = 'loop' }) => {
  const [activeLab, setActiveLab] = useState(initialLab);

  const labs = [
    { id: 'loop', label: '1. Event Loop Phase Wheel', icon: Disc, color: 'var(--neon-green)', comp: EventLoopVisualizer },
    { id: 'stream', label: '2. Stream Backpressure Fluid Tank', icon: Waves, color: 'var(--neon-cyan)', comp: StreamBackpressureVisualizer },
    { id: 'worker', label: '3. Worker Threads Concurrency', icon: Cpu, color: 'var(--neon-pink)', comp: WorkerThreadsVisualizer },
    { id: 'gc', label: '4. V8 Generational Memory & GC', icon: Trash2, color: 'var(--neon-amber)', comp: GarbageCollectionVisualizer }
  ];

  const handleSelect = (id) => {
    setActiveLab(id);
    soundFx.playClick();
  };

  const current = labs.find((l) => l.id === activeLab) || labs[0];
  const ActiveComponent = current.comp;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Labs Header Banner */}
      <div className="guided-journey-banner">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <FlaskConical size={18} style={{ color: 'var(--neon-cyan)' }} />
            <span style={{ fontSize: '11px', color: 'var(--neon-cyan)', fontWeight: 700, letterSpacing: '1px' }}>
              INTERACTIVE RUNTIME LABS
            </span>
          </div>
          <h2 style={{ fontSize: '18px', color: '#fff', fontFamily: 'var(--font-display)' }}>
            Deep Architectural Simulators
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginTop: '4px' }}>
            Experiment with runtime physics: step through the 6 Libuv event loop phases, throttle highWaterMark stream buffers, test threadpool bottlenecks, and inspect V8 young/old space garbage collection.
          </p>
        </div>

        {/* Lab Switcher Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {labs.map((l) => {
            const Icon = l.icon;
            const isSelected = activeLab === l.id;
            return (
              <button
                key={l.id}
                onClick={() => handleSelect(l.id)}
                className={`cyber-btn-small ${isSelected ? 'active' : ''}`}
                style={{
                  borderColor: isSelected ? l.color : 'var(--border-color)',
                  color: isSelected ? l.color : 'var(--text-dim)',
                  boxShadow: isSelected ? `0 0 10px ${l.color}40` : 'none'
                }}
              >
                <Icon size={14} />
                <span>{l.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Selected Lab Simulator */}
      <ActiveComponent />
    </div>
  );
};
