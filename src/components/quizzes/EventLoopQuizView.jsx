import React, { useState } from 'react';
import { QUIZZES } from '../../data/quizzes';
import { soundFx } from '../../services/soundFx';
import { storage } from '../../services/storage';
import { MarkdownView } from '../common/MarkdownView';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Award
} from 'lucide-react';

const getDifficultyClass = (diff) => {
  switch (diff) {
    case 'Beginner':
      return 'badge-green';
    case 'Intermediate':
      return 'badge-cyan';
    case 'Advanced':
      return 'badge-amber';
    case 'Expert':
      return 'badge-pink';
    default:
      return 'badge-cyan';
  }
};

export const EventLoopQuizView = ({ onQuizSolved }) => {
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [solvedList, setSolvedList] = useState(() => storage.getSolvedQuizzes());
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');

  const quiz = QUIZZES[currentQuizIndex] || QUIZZES[0];
  const isCorrect = selectedOption === quiz.correctAnswerIndex;

  const handleSelectOption = (idx) => {
    if (hasSubmitted) return;
    setSelectedOption(idx);
    soundFx.playClick();
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setHasSubmitted(true);

    if (selectedOption === quiz.correctAnswerIndex) {
      soundFx.playSuccess();
      const updated = storage.markQuizSolved(quiz.id);
      setSolvedList(updated);
      if (onQuizSolved) onQuizSolved(quiz.id);
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 }
      });
    } else {
      soundFx.playError();
    }
  };

  const handleSwitchQuiz = (idx) => {
    if (idx >= 0 && idx < QUIZZES.length) {
      setCurrentQuizIndex(idx);
      setSelectedOption(null);
      setHasSubmitted(false);
      soundFx.playClick();
    }
  };

  const handleNextQuiz = () => {
    if (currentQuizIndex < QUIZZES.length - 1) {
      handleSwitchQuiz(currentQuizIndex + 1);
    }
  };

  const handlePrevQuiz = () => {
    if (currentQuizIndex > 0) {
      handleSwitchQuiz(currentQuizIndex - 1);
    }
  };

  const filteredQuizzes = QUIZZES.filter((q) => {
    if (difficultyFilter === 'ALL') return true;
    return q.difficulty.toUpperCase() === difficultyFilter;
  });

  const solvedCount = solvedList.length;
  const totalCount = QUIZZES.length;
  const solvedPercent = Math.round((solvedCount / totalCount) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header Banner & Progress */}
      <div className="cyber-card" style={{ borderColor: 'var(--neon-green)', padding: '18px 22px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '6px',
                background: 'rgba(0, 255, 102, 0.12)',
                border: '1px solid var(--neon-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--neon-green)'
              }}
            >
              <HelpCircle size={22} />
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: '17px',
                  fontFamily: 'var(--font-display)',
                  color: '#fff',
                  letterSpacing: '0.6px'
                }}
              >
                20 ARCHITECTURAL OUTPUT PREDICTION PUZZLES
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                Test your mastery of the Libuv Event Loop, microtask ordering, V8 Buffer memory, and async primitives.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="cyber-badge badge-green" style={{ fontSize: '11px', padding: '4px 10px' }}>
              ✓ {solvedCount} / {totalCount} PUZZLES SOLVED ({solvedPercent}%)
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div
          style={{
            width: '100%',
            height: '6px',
            background: 'rgba(0, 0, 0, 0.6)',
            borderRadius: '3px',
            overflow: 'hidden',
            border: '1px solid rgba(0, 255, 102, 0.2)',
            marginBottom: '16px'
          }}
        >
          <div
            style={{
              width: `${solvedPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--neon-cyan), var(--neon-green))',
              boxShadow: '0 0 10px var(--neon-green)',
              transition: 'width 0.4s ease'
            }}
          />
        </div>

        {/* Difficulty Filter Chips */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '14px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginRight: '4px' }}>Filter:</span>
          {['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'].map((level) => (
            <button
              key={level}
              onClick={() => {
                setDifficultyFilter(level);
                soundFx.playClick();
              }}
              className={`cyber-btn-small ${difficultyFilter === level ? 'active' : ''}`}
              style={{ fontSize: '10px', padding: '3px 8px' }}
            >
              {level}
            </button>
          ))}
        </div>

        {/* 20 Puzzle Pills Grid */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {QUIZZES.map((q, idx) => {
            const isSolved = solvedList.includes(q.id);
            const isCurrent = currentQuizIndex === idx;
            const diffClass = getDifficultyClass(q.difficulty);

            return (
              <button
                key={q.id}
                onClick={() => handleSwitchQuiz(idx)}
                className={`cyber-btn-small ${isCurrent ? 'active' : ''}`}
                style={{
                  fontSize: '11px',
                  padding: '5px 9px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  borderColor: isCurrent
                    ? 'var(--neon-cyan)'
                    : isSolved
                    ? 'var(--neon-green)'
                    : undefined,
                  color: isCurrent ? 'var(--neon-cyan)' : isSolved ? '#a7f3d0' : undefined
                }}
                title={`${q.title} (${q.difficulty})`}
              >
                <span>P{String(idx + 1).padStart(2, '0')}</span>
                {isSolved && <span style={{ color: 'var(--neon-green)', fontWeight: 800 }}>✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Active Puzzle Card */}
      <div className="cyber-card" style={{ borderColor: 'var(--neon-cyan)' }}>
        <div className="cyber-card-header" style={{ flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span className="cyber-badge badge-cyan" style={{ fontSize: '11px' }}>
              PUZZLE {currentQuizIndex + 1} OF {totalCount}
            </span>
            <span className={`cyber-badge ${getDifficultyClass(quiz.difficulty)}`} style={{ fontSize: '11px' }}>
              {quiz.difficulty}
            </span>
            {solvedList.includes(quiz.id) && (
              <span className="cyber-badge badge-green" style={{ fontSize: '11px' }}>
                ✓ SOLVED
              </span>
            )}
          </div>

          {/* Stepper Buttons */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={handlePrevQuiz}
              disabled={currentQuizIndex === 0}
              className="cyber-btn-small"
              style={{ opacity: currentQuizIndex === 0 ? 0.4 : 1 }}
              title="Previous Puzzle"
            >
              <ArrowLeft size={13} /> Prev
            </button>
            <button
              onClick={handleNextQuiz}
              disabled={currentQuizIndex === QUIZZES.length - 1}
              className="cyber-btn-small"
              style={{ opacity: currentQuizIndex === QUIZZES.length - 1 ? 0.4 : 1 }}
              title="Next Puzzle"
            >
              Next <ArrowRight size={13} />
            </button>
          </div>
        </div>

        <h3 style={{ color: '#fff', fontSize: '16px', margin: '4px 0 8px 0', fontFamily: 'var(--font-display)' }}>
          {quiz.title}
        </h3>

        <p style={{ fontSize: '13.5px', color: 'var(--text-main)', marginBottom: '12px', lineHeight: 1.5 }}>
          {quiz.scenario}
        </p>

        {/* Code Snippet Box */}
        <pre className="cyber-code-block" style={{ fontSize: '13px', margin: 0, padding: '14px', background: '#020508' }}>
          <code>{quiz.code}</code>
        </pre>
      </div>

      {/* 3. Prediction Options Grid */}
      <div className="cyber-card">
        <h4 style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '12px', letterSpacing: '0.5px' }}>
          SELECT THE PREDICTED EXECUTION SEQUENCE:
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {quiz.options.map((opt, idx) => {
            let borderStyle = '1px solid var(--border-color)';
            let bg = 'var(--bg-secondary)';

            if (selectedOption === idx) {
              borderStyle = '1px solid var(--neon-cyan)';
              bg = 'rgba(0, 240, 255, 0.1)';
            }

            if (hasSubmitted) {
              if (idx === quiz.correctAnswerIndex) {
                borderStyle = '1px solid var(--neon-green)';
                bg = 'rgba(0, 255, 102, 0.15)';
              } else if (selectedOption === idx && !isCorrect) {
                borderStyle = '1px solid var(--neon-pink)';
                bg = 'rgba(255, 0, 127, 0.15)';
              }
            }

            return (
              <div
                key={idx}
                onClick={() => handleSelectOption(idx)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '4px',
                  border: borderStyle,
                  background: bg,
                  cursor: hasSubmitted ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  color: 'var(--text-main)',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>
                  <strong style={{ color: 'var(--neon-cyan)', marginRight: '8px' }}>
                    [{String.fromCharCode(65 + idx)}]
                  </strong>{' '}
                  {opt}
                </span>

                {hasSubmitted && idx === quiz.correctAnswerIndex && (
                  <CheckCircle size={18} style={{ color: 'var(--neon-green)', flexShrink: 0 }} />
                )}
                {hasSubmitted && selectedOption === idx && !isCorrect && (
                  <XCircle size={18} style={{ color: 'var(--neon-pink)', flexShrink: 0 }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Submit & Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          {!hasSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={selectedOption === null}
              className="cyber-button-primary"
              style={{ opacity: selectedOption === null ? 0.5 : 1, padding: '8px 18px', fontSize: '13px' }}
            >
              CONFIRM PREDICTION
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setSelectedOption(null);
                  setHasSubmitted(false);
                  soundFx.playClick();
                }}
                className="cyber-button-secondary"
                style={{ padding: '8px 14px', fontSize: '13px' }}
              >
                <RotateCcw size={14} /> RETRY
              </button>
              {currentQuizIndex < QUIZZES.length - 1 && (
                <button
                  onClick={handleNextQuiz}
                  className="cyber-button-primary"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  NEXT PUZZLE ({currentQuizIndex + 2}/{totalCount}) <ArrowRight size={14} />
                </button>
              )}
            </div>
          )}

          <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
            Puzzle ID: <code style={{ color: 'var(--neon-cyan)' }}>{quiz.id}</code>
          </div>
        </div>
      </div>

      {/* 4. Deep Runtime Explanation & Trace (Revealed on submission) */}
      {hasSubmitted && (
        <div
          className="cyber-card"
          style={{
            borderColor: isCorrect ? 'var(--neon-green)' : 'var(--neon-amber)',
            background: '#03080d'
          }}
        >
          <div className="cyber-card-header">
            <span
              className="cyber-card-title"
              style={{
                fontSize: '14px',
                color: isCorrect ? 'var(--neon-green)' : 'var(--neon-amber)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isCorrect ? <CheckCircle size={17} /> : <XCircle size={17} />}
              {isCorrect ? 'PREDICTION ACCURATE — FIRST-PRINCIPLES DEBRIEF' : 'PREDICTION GLITCH — FIRST-PRINCIPLES DEBRIEF'}
            </span>
          </div>

          <MarkdownView content={quiz.explanation} />

          <h5 style={{ fontSize: '12.5px', color: 'var(--neon-cyan)', margin: '14px 0 8px 0', letterSpacing: '0.5px' }}>
            STEP-BY-STEP EXECUTION TRACE:
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {quiz.steps.map((step, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: 'var(--bg-secondary)',
                  borderLeft: '3px solid var(--neon-cyan)',
                  fontSize: '12px',
                  gap: '10px'
                }}
              >
                <div>
                  <span style={{ color: 'var(--neon-amber)', fontWeight: 700, marginRight: '8px' }}>
                    [{step.phase}]
                  </span>
                  <span style={{ color: '#d1d5db' }}>{step.action}</span>
                </div>
                {step.output && (
                  <span className="cyber-badge badge-green" style={{ fontSize: '11px', flexShrink: 0 }}>
                    &gt; {step.output}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
