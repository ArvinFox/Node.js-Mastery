import React, { useState } from 'react';
import { soundFx } from '../../services/soundFx';
import { Trash2, AlertTriangle, ArrowRight, ShieldAlert, Cpu } from 'lucide-react';

export const GarbageCollectionVisualizer = () => {
  const [newSpaceObjects, setNewSpaceObjects] = useState([
    { id: 'req_1', age: 0, type: 'short', name: 'HTTP_JSON_CHUNK' },
    { id: 'req_2', age: 0, type: 'short', name: 'TEMP_BUFFER_SLICE' }
  ]);
  const [toSpaceObjects, setToSpaceObjects] = useState([]);
  const [oldSpaceObjects, setOldSpaceObjects] = useState([
    { id: 'singleton_1', name: 'DB_CONNECTION_POOL' }
  ]);
  const [lastGcType, setLastGcType] = useState('Standby');
  const [gcDuration, setGcDuration] = useState('0.0ms');
  const [isLeaking, setIsLeaking] = useState(false);

  // Allocate short-lived
  const handleAllocateShortLived = () => {
    soundFx.playStep();
    const id = `obj_${Date.now().toString().slice(-4)}`;
    setNewSpaceObjects((prev) => [
      ...prev,
      { id, age: 0, type: 'short', name: `REQ_OBJ_${id}` }
    ]);
  };

  // Run Scavenger GC (Cheney's Copying Algorithm)
  const handleScavengeGC = () => {
    soundFx.playBeep(700, 0.08);
    setLastGcType('Minor GC (Scavenge - Cheney Algorithm)');
    setGcDuration('1.2ms (Ultra Fast)');

    // In Scavenge: dead objects are dropped; surviving objects age
    const surviving = [];
    const promoted = [];

    newSpaceObjects.forEach((obj) => {
      // Leaked objects or surviving objects
      if (obj.type === 'leaked' || obj.age >= 1) {
        promoted.push({ ...obj, name: `PROMOTED_${obj.name}` });
      } else if (Math.random() > 0.4) {
        surviving.push({ ...obj, age: obj.age + 1 });
      }
      // Otherwise discarded with zero overhead!
    });

    setToSpaceObjects(surviving);
    setNewSpaceObjects(surviving); // Semi-space swap
    if (promoted.length > 0) {
      setOldSpaceObjects((prev) => [...prev, ...promoted]);
    }
  };

  // Simulate Memory Leak
  const handleInjectLeak = () => {
    soundFx.playError();
    setIsLeaking(true);
    const leakId = `leak_${Date.now().toString().slice(-4)}`;
    setNewSpaceObjects((prev) => [
      ...prev,
      { id: leakId, age: 1, type: 'leaked', name: `DANGLING_CLOSURE_${leakId}` }
    ]);
  };

  // Run Major GC (Mark-Sweep-Compact)
  const handleMajorGC = () => {
    soundFx.playBeep(250, 0.2);
    setLastGcType('Major GC (Mark-Sweep-Compact)');
    setGcDuration('42.8ms (High Latency Spike!)');

    // Clean only non-leaked objects
    setOldSpaceObjects((prev) => prev.filter((o) => o.type === 'leaked' || o.id === 'singleton_1'));
  };

  const handleReset = () => {
    soundFx.playClick();
    setNewSpaceObjects([
      { id: 'req_1', age: 0, type: 'short', name: 'HTTP_JSON_CHUNK' },
      { id: 'req_2', age: 0, type: 'short', name: 'TEMP_BUFFER_SLICE' }
    ]);
    setToSpaceObjects([]);
    setOldSpaceObjects([{ id: 'singleton_1', name: 'DB_CONNECTION_POOL' }]);
    setLastGcType('Standby');
    setGcDuration('0.0ms');
    setIsLeaking(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="cyber-card" style={{ borderColor: 'var(--neon-green)' }}>
        <div className="cyber-card-header">
          <div className="cyber-card-title">
            <Trash2 size={20} />
            V8 GENERATIONAL MEMORY HEAP & GC SIMULATOR
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span className="cyber-badge badge-green">Last GC: {lastGcType}</span>
            <span className="cyber-badge badge-cyan">Pause Time: {gcDuration}</span>
          </div>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-main)', marginBottom: '16px' }}>
          Explore the Generational Hypothesis: 95% of objects die in the <strong>Young Generation</strong> (Nursery) and are reclaimed in &lt;2ms via Cheney's Scavenger algorithm. Objects that survive promote to the <strong>Old Generation</strong>, where expensive Mark-Sweep GC runs.
        </p>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={handleAllocateShortLived} className="cyber-button-secondary">
            + Allocate Temp Object
          </button>
          <button onClick={handleScavengeGC} className="cyber-button-primary">
            ⚡ Run Minor GC (Scavenge)
          </button>
          <button
            onClick={handleInjectLeak}
            className="cyber-button-secondary"
            style={{ borderColor: 'var(--neon-pink)', color: 'var(--neon-pink)' }}
          >
            <ShieldAlert size={14} /> Inject Memory Leak
          </button>
          <button
            onClick={handleMajorGC}
            className="cyber-button-secondary"
            style={{ borderColor: 'var(--neon-amber)', color: 'var(--neon-amber)' }}
          >
            🧹 Run Major GC (Mark-Sweep)
          </button>
          <button onClick={handleReset} className="cyber-button-secondary">
            Reset Heap
          </button>
        </div>
      </div>

      {/* Heap Memory Spaces Visual Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
        {/* Young Generation (New Space) */}
        <div className="cyber-card" style={{ borderColor: 'var(--neon-cyan)' }}>
          <div className="cyber-card-header">
            <span className="cyber-card-title" style={{ fontSize: '13px', color: 'var(--neon-cyan)' }}>
              YOUNG GENERATION (NEW SPACE: 16-64MB)
            </span>
            <span className="cyber-badge badge-cyan">{newSpaceObjects.length} OBJECTS</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '12px' }}>
            Cheney's Copying Algorithm (From-Space & To-Space). Fast pointer allocations.
          </div>

          <div style={{ minHeight: '140px', background: '#04070a', padding: '10px', borderRadius: '4px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {newSpaceObjects.length === 0 ? (
              <span style={{ color: 'var(--text-dim)', fontSize: '12px', fontStyle: 'italic' }}>New Space Empty</span>
            ) : (
              newSpaceObjects.map((obj) => (
                <div
                  key={obj.id}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '4px',
                    background: obj.type === 'leaked' ? 'rgba(255, 0, 127, 0.2)' : 'rgba(0, 240, 255, 0.15)',
                    border: `1px solid ${obj.type === 'leaked' ? 'var(--neon-pink)' : 'var(--neon-cyan)'}`,
                    fontSize: '11px',
                    color: obj.type === 'leaked' ? 'var(--neon-pink)' : 'var(--neon-cyan)'
                  }}
                >
                  {obj.name} (Age: {obj.age})
                </div>
              ))
            )}
          </div>
        </div>

        {/* Promotion Arrow */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>SURVIVES 2 SCAVENGES</div>
          <ArrowRight size={28} style={{ color: 'var(--neon-amber)' }} />
          <div style={{ fontSize: '11px', color: 'var(--neon-amber)', marginTop: '4px' }}>PROMOTION</div>
        </div>

        {/* Old Generation (Old Space) */}
        <div className="cyber-card" style={{ borderColor: 'var(--neon-amber)' }}>
          <div className="cyber-card-header">
            <span className="cyber-card-title" style={{ fontSize: '13px', color: 'var(--neon-amber)' }}>
              OLD GENERATION (OLD SPACE: UP TO 1.4GB+)
            </span>
            <span className="cyber-badge badge-amber">{oldSpaceObjects.length} OBJECTS</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '12px' }}>
            Mark-Sweep-Compact collection. Objects that survive promotion stay here permanently unless garbage collected.
          </div>

          <div style={{ minHeight: '140px', background: '#04070a', padding: '10px', borderRadius: '4px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {oldSpaceObjects.map((obj, i) => (
              <div
                key={i}
                style={{
                  padding: '6px 10px',
                  borderRadius: '4px',
                  background: obj.type === 'leaked' ? 'rgba(255, 0, 127, 0.25)' : 'rgba(255, 176, 0, 0.15)',
                  border: `1px solid ${obj.type === 'leaked' ? 'var(--neon-pink)' : 'var(--neon-amber)'}`,
                  fontSize: '11px',
                  color: obj.type === 'leaked' ? 'var(--neon-pink)' : 'var(--neon-amber)'
                }}
              >
                {obj.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {isLeaking && (
        <div className="cyber-card" style={{ borderColor: 'var(--neon-pink)', background: 'rgba(255,0,127,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={24} style={{ color: 'var(--neon-pink)' }} />
            <div style={{ fontSize: '13px', color: 'var(--text-main)' }}>
              <strong>Memory Leak Detected:</strong> A dangling closure is retaining references across Scavenge cycles! Notice how it promoted directly to Old Space and cannot be freed by Minor GC.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
