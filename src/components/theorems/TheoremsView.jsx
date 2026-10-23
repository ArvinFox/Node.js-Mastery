import React, { useState } from 'react';
import { THEOREMS } from '../../data/theorems';
import { soundFx } from '../../services/soundFx';
import { MarkdownView } from '../common/MarkdownView';
import { BookOpen, Cpu, RotateCw, Waves, Flame, Trash2, Network } from 'lucide-react';

const ICON_MAP = {
  Cpu: Cpu,
  RotateCw: RotateCw,
  Waves: Waves,
  Flame: Flame,
  Trash2: Trash2,
  Network: Network
};

export const TheoremsView = () => {
  const [selectedTheorem, setSelectedTheorem] = useState(THEOREMS[0]);

  const handleSelect = (th) => {
    setSelectedTheorem(th);
    soundFx.playClick();
  };

  const IconComponent = ICON_MAP[selectedTheorem.icon] || BookOpen;

  return (
    <div className="theorems-grid" style={{ display: 'grid', gap: '20px' }}>
      {/* Sidebar List of Theorems */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
          CORE NODE.JS THEOREMS & LAWS
        </div>
        {THEOREMS.map((th) => {
          const isSelected = selectedTheorem.id === th.id;
          const ItemIcon = ICON_MAP[th.icon] || BookOpen;
          return (
            <div
              key={th.id}
              onClick={() => handleSelect(th)}
              className="cyber-card"
              style={{
                padding: '12px 14px',
                cursor: 'pointer',
                borderColor: isSelected ? 'var(--neon-green)' : 'var(--border-color)',
                background: isSelected ? 'rgba(0, 255, 102, 0.08)' : 'var(--bg-card)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <ItemIcon size={16} style={{ color: isSelected ? 'var(--neon-green)' : 'var(--neon-cyan)' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? 'var(--neon-green)' : 'var(--text-main)' }}>
                  {th.title}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                {th.category} • Tier {th.tier}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Theorem Deep Dive Details */}
      <div className="cyber-card" style={{ borderColor: 'var(--neon-green)' }}>
        <div className="cyber-card-header">
          <div className="cyber-card-title">
            <IconComponent size={20} />
            {selectedTheorem.title}
          </div>
          <span className="cyber-badge badge-green">TIER {selectedTheorem.tier} THEOREM</span>
        </div>

        <p style={{ fontSize: '14px', color: 'var(--neon-cyan)', marginBottom: '14px', fontWeight: 500 }}>
          {selectedTheorem.subtitle}
        </p>

        {/* Mathematical & Formal Theorem Box */}
        <div style={{ background: 'rgba(0, 255, 102, 0.08)', padding: '14px', borderRadius: '4px', borderLeft: '3px solid var(--neon-green)', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--neon-green)', fontWeight: 700, marginBottom: '4px', letterSpacing: '0.5px' }}>
            FORMAL PRINCIPLE & MATHEMATICAL BASIS:
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-main)', marginBottom: '6px' }}>
            {selectedTheorem.formulation}
          </div>
          <code style={{ fontSize: '12px', color: 'var(--neon-amber)', fontFamily: 'var(--font-mono)' }}>
            {selectedTheorem.mathematicalBasis}
          </code>
        </div>

        {/* Key Architectural Insights */}
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '8px' }}>KEY ARCHITECTURAL INSIGHTS:</h4>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {selectedTheorem.keyInsights.map((insight, i) => (
              <li key={i} style={{ fontSize: '13px', color: 'var(--text-main)' }}>
                {insight}
              </li>
            ))}
          </ul>
        </div>

        {/* Deep Explanation Content */}
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '8px' }}>FIRST-PRINCIPLES DEEP DIVE:</h4>
          <MarkdownView content={selectedTheorem.deepExplanation} />
        </div>

        {/* Architectural Code Snippet */}
        <div>
          <h4 style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '6px' }}>ARCHITECTURAL PATTERN SNIPPET:</h4>
          <pre className="cyber-code-block" style={{ fontSize: '12px' }}>
            <code>{selectedTheorem.codeSnippet}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
