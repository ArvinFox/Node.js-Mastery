import React, { useState } from 'react';
import { QUIZZES } from '../../data/quizzes';
import { soundFx } from '../../services/soundFx';
import { storage } from '../../services/storage';
import { MarkdownView } from '../common/MarkdownView';
import confetti from 'canvas-confetti';
import { HelpCircle, CheckCircle, XCircle, ArrowRight, Play, RotateCcw } from 'lucide-react';

export const EventLoopQuizView = ({ onQuizSolved }) => {
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [solvedList, setSolvedList] = useState(() => storage.getSolvedQuizzes());
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const quiz = QUIZZES[currentQuizIndex];
  const isCorrect = selectedOption === quiz.correctAnswerIndex;

  const handleSelectOption = (idx) => {
    if (hasSubmitted) return;
    setSelectedOption(idx);
    soundFx.playClick();
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setHasSubmitted(true);
    setActiveStepIndex(quiz.steps.length - 1); // show all steps

    if (selectedOption === quiz.correctAnswerIndex) {
      soundFx.playSuccess();
      const updated = storage.markQuizSolved(quiz.id);
      setSolvedList(updated);
      if (onQuizSolved) onQuizSolved(quiz.id);
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 }
      });
    } else {
      soundFx.playError();
    }
  };

  const handleNextQuiz = () => {
    if (currentQuizIndex < QUIZZES.length - 1) {
      setCurrentQuizIndex((prev) => prev + 1);
      setSelectedOption(null);
      setHasSubmitted(false);
      setActiveStepIndex(0);
      soundFx.playClick();
    }
  };

  const handlePrevQuiz = () => {
    if (currentQuizIndex > 0) {
      setCurrentQuizIndex((prev) => prev - 1);
      setSelectedOption(null);
      setHasSubmitted(false);
      setActiveStepIndex(0);
      soundFx.playClick();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Quiz Header & Selector */}
      <div className="cyber-card" style={{ borderColor: 'var(--neon-green)' }}>
        <div className="cyber-card-header">
          <div className="cyber-card-title">
            <HelpCircle size={20} />
            PREDICT-THE-OUTPUT TIMELINE PUZZLES
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {QUIZZES.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => {
                  setCurrentQuizIndex(idx);
                  setSelectedOption(null);
                  setHasSubmitted(false);
                  setActiveStepIndex(0);
                  soundFx.playClick();
                }}
                className={`cyber-btn-small ${currentQuizIndex === idx ? 'active' : ''}`}
              >
                P#{idx + 1} {solvedList.includes(q.id) ? '✓' : ''}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ color: 'var(--neon-cyan)', fontSize: '15px' }}>{quiz.title}</h3>
          <span className="cyber-badge badge-amber">{quiz.difficulty}</span>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-main)', marginBottom: '12px' }}>
          {quiz.scenario}
        </p>

        {/* Code Snippet Box */}
        <pre className="cyber-code-block" style={{ fontSize: '13px' }}>
          <code>{quiz.code}</code>
        </pre>
      </div>

      {/* Options Grid */}
      <div className="cyber-card">
        <h4 style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '12px' }}>
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
                  <CheckCircle size={18} style={{ color: 'var(--neon-green)' }} />
                )}
                {hasSubmitted && selectedOption === idx && !isCorrect && (
                  <XCircle size={18} style={{ color: 'var(--neon-pink)' }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Submit & Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {!hasSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={selectedOption === null}
              className="cyber-button-primary"
              style={{ opacity: selectedOption === null ? 0.5 : 1 }}
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
              >
                <RotateCcw size={14} /> RETRY
              </button>
              {currentQuizIndex < QUIZZES.length - 1 && (
                <button onClick={handleNextQuiz} className="cyber-button-primary">
                  NEXT PUZZLE <ArrowRight size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Explanation & Step-by-Step Replay (Revealed on submission) */}
      {hasSubmitted && (
        <div className="cyber-card" style={{ borderColor: isCorrect ? 'var(--neon-green)' : 'var(--neon-amber)' }}>
          <div className="cyber-card-header">
            <span className="cyber-card-title" style={{ fontSize: '13px', color: isCorrect ? 'var(--neon-green)' : 'var(--neon-amber)' }}>
              {isCorrect ? '✓ PREDICTION ACCURATE' : '⚠️ PREDICTION GLITCH'} — RUNTIME EXPLANATION
            </span>
          </div>

          <MarkdownView content={quiz.explanation} />

          <h5 style={{ fontSize: '12px', color: 'var(--neon-cyan)', marginBottom: '8px' }}>
            STEP-BY-STEP EXECUTION TRACE:
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {quiz.steps.map((step, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: 'var(--bg-secondary)',
                  borderLeft: '3px solid var(--neon-cyan)',
                  fontSize: '12px'
                }}
              >
                <div>
                  <span style={{ color: 'var(--neon-amber)', fontWeight: 700, marginRight: '8px' }}>
                    [{step.phase}]
                  </span>
                  <span>{step.action}</span>
                </div>
                {step.output && (
                  <span className="cyber-badge badge-green">&gt; {step.output}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
