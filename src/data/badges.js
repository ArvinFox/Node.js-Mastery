// Cyber-Badges & Architect Achievements System
import { storage } from '../services/storage';

export const BADGES = [
  {
    id: 'BADGE_FIRST_BLOOD',
    title: 'First Kernel Breach',
    tierName: 'Novice Hacker',
    category: 'Milestones',
    icon: 'Terminal',
    color: '#00ff66',
    description: 'Execute and successfully verify your first hands-on Node.js code trial.',
    requirement: 'Pass at least 1 Mission Trial',
    checkUnlocked: (completed) => completed.length >= 1,
    getProgress: (completed) => ({
      current: Math.min(completed.length, 1),
      total: 1,
      percent: Math.min(100, Math.round((completed.length / 1) * 100))
    })
  },
  {
    id: 'BADGE_RELOAD',
    title: 'Script Rebooter',
    tierName: 'Tier 1 Master',
    category: 'Tier Mastery',
    icon: 'RotateCcw',
    color: '#00ff66',
    description: 'Master Ground Zero foundations: V8 runtime, process globals, CommonJS vs ESM circular traps, and error-first callbacks.',
    requirement: 'Complete all 5 Tier 1 Missions (01 to 05)',
    checkUnlocked: (completed) => {
      const tier1Ids = [
        '01-what-is-node',
        '02-global-process',
        '03-commonjs-vs-esm',
        '04-error-first-callbacks',
        '05-promises-microtasks'
      ];
      return tier1Ids.every((id) => completed.includes(id));
    },
    getProgress: (completed) => {
      const tier1Ids = [
        '01-what-is-node',
        '02-global-process',
        '03-commonjs-vs-esm',
        '04-error-first-callbacks',
        '05-promises-microtasks'
      ];
      const count = tier1Ids.filter((id) => completed.includes(id)).length;
      return { current: count, total: 5, percent: Math.round((count / 5) * 100) };
    }
  },
  {
    id: 'BADGE_DAEMON',
    title: 'Daemon Wrangler',
    tierName: 'Tier 2 Master',
    category: 'Tier Mastery',
    icon: 'Radio',
    color: '#00f0ff',
    description: 'Master async mechanics: EventEmitters, raw binary Buffers, filesystem descriptors, TCP sockets, and the Reactor pattern.',
    requirement: 'Complete all 5 Tier 2 Missions (06 to 10)',
    checkUnlocked: (completed) => {
      const tier2Ids = [
        '06-event-emitter-internals',
        '07-buffers-binary-memory',
        '08-filesystem-descriptors',
        '09-tcp-sockets-net',
        '10-reactor-pattern-deep'
      ];
      return tier2Ids.every((id) => completed.includes(id));
    },
    getProgress: (completed) => {
      const tier2Ids = [
        '06-event-emitter-internals',
        '07-buffers-binary-memory',
        '08-filesystem-descriptors',
        '09-tcp-sockets-net',
        '10-reactor-pattern-deep'
      ];
      const count = tier2Ids.filter((id) => completed.includes(id)).length;
      return { current: count, total: 5, percent: Math.round((count / 5) * 100) };
    }
  },
  {
    id: 'BADGE_STREAM_SAVIOR',
    title: 'Stream Guardian',
    tierName: 'Tier 3 Master',
    category: 'Tier Mastery',
    icon: 'ShieldCheck',
    color: '#ffb000',
    description: 'Master Libuv physics: 6 Event Loop phases, stream backpressure flow, IPC child processes, and prototype pollution defenses.',
    requirement: 'Complete all 5 Tier 3 Missions (11 to 15)',
    checkUnlocked: (completed) => {
      const tier3Ids = [
        '11-event-loop-six-phases',
        '12-streams-backpressure-deep',
        '13-child-processes-ipc',
        '14-crypto-security-threats',
        '15-worker-threads-atomics'
      ];
      return tier3Ids.every((id) => completed.includes(id));
    },
    getProgress: (completed) => {
      const tier3Ids = [
        '11-event-loop-six-phases',
        '12-streams-backpressure-deep',
        '13-child-processes-ipc',
        '14-crypto-security-threats',
        '15-worker-threads-atomics'
      ];
      const count = tier3Ids.filter((id) => completed.includes(id)).length;
      return { current: count, total: 5, percent: Math.round((count / 5) * 100) };
    }
  },
  {
    id: 'BADGE_KERNEL_MASTER',
    title: 'Matrix Kernel Master',
    tierName: 'Tier 4 Master',
    category: 'Tier Mastery',
    icon: 'Cpu',
    color: '#ff007f',
    description: 'Master hyper-scale systems: SharedArrayBuffer Atomics, zero-downtime clustering, AsyncLocalStorage, V8 GC generational heap, and N-API C++ addons.',
    requirement: 'Complete all 5 Tier 4 Missions (16 to 20)',
    checkUnlocked: (completed) => {
      const tier4Ids = [
        '16-cluster-zero-downtime',
        '17-async-local-storage',
        '18-memory-leaks-v8-gc',
        '19-performance-profiling',
        '20-napi-c-addons'
      ];
      return tier4Ids.every((id) => completed.includes(id));
    },
    getProgress: (completed) => {
      const tier4Ids = [
        '16-cluster-zero-downtime',
        '17-async-local-storage',
        '18-memory-leaks-v8-gc',
        '19-performance-profiling',
        '20-napi-c-addons'
      ];
      const count = tier4Ids.filter((id) => completed.includes(id)).length;
      return { current: count, total: 5, percent: Math.round((count / 5) * 100) };
    }
  },
  {
    id: 'BADGE_HALFWAY',
    title: 'Halfway Architect',
    tierName: 'Milestone',
    category: 'Milestones',
    icon: 'Zap',
    color: '#00f0ff',
    description: 'Surpass the 50% milestone across the 20-mission Node.js Mastery curriculum.',
    requirement: 'Complete any 10 Missions',
    checkUnlocked: (completed) => completed.length >= 10,
    getProgress: (completed) => ({
      current: Math.min(completed.length, 10),
      total: 10,
      percent: Math.min(100, Math.round((completed.length / 10) * 100))
    })
  },
  {
    id: 'BADGE_COMPLETIONIST',
    title: 'Grand Node.js Architect',
    tierName: 'Grandmaster',
    category: 'Milestones',
    icon: 'Crown',
    color: '#ffd700',
    description: 'Achieve total architectural supremacy by completing all 20 curriculum missions.',
    requirement: 'Complete all 20 Missions',
    checkUnlocked: (completed) => completed.length >= 20,
    getProgress: (completed) => ({
      current: Math.min(completed.length, 20),
      total: 20,
      percent: Math.min(100, Math.round((completed.length / 20) * 100))
    })
  },
  {
    id: 'BADGE_QUIZ_MASTER',
    title: 'Event Loop Oracle',
    tierName: 'Specialist',
    category: 'Knowledge Mastery',
    icon: 'HelpCircle',
    color: '#a855f7',
    description: 'Demonstrate infallible intuition predicting asynchronous microtask and macrotask execution orders.',
    requirement: 'Solve at least 5 Output Prediction Quizzes',
    checkUnlocked: (completed, quizzes = []) => quizzes.length >= 5,
    getProgress: (completed, quizzes = []) => ({
      current: Math.min(quizzes.length, 5),
      total: 5,
      percent: Math.min(100, Math.round((quizzes.length / 5) * 100))
    })
  },
  {
    id: 'BADGE_QUIZ_GRANDMASTER',
    title: 'Async Time Traveler',
    tierName: 'Grandmaster',
    category: 'Knowledge Mastery',
    icon: 'Sparkles',
    color: '#00f0ff',
    description: 'Achieve 100% flawless prediction mastery across all 20 Node.js timeline puzzles.',
    requirement: 'Solve all 20 Output Prediction Quizzes',
    checkUnlocked: (completed, quizzes = []) => quizzes.length >= 20,
    getProgress: (completed, quizzes = []) => ({
      current: Math.min(quizzes.length, 20),
      total: 20,
      percent: Math.min(100, Math.round((quizzes.length / 20) * 100))
    })
  }
];

// Helper to evaluate, unlock, and return newly unlocked badges
export function evaluateBadges() {
  const completed = storage.getCompletedLessons();
  const quizzes = storage.getSolvedQuizzes();
  const currentUnlocked = storage.getUnlockedBadges();
  const newlyUnlocked = [];

  for (const badge of BADGES) {
    if (badge.checkUnlocked(completed, quizzes)) {
      if (!currentUnlocked.includes(badge.id)) {
        storage.unlockBadge(badge.id);
        newlyUnlocked.push(badge);
      }
    }
  }

  return {
    allBadges: BADGES,
    unlockedIds: storage.getUnlockedBadges(),
    newlyUnlocked
  };
}
