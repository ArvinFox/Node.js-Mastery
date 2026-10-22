// Interactive Quizzes & Predict-the-Output Challenges

export const QUIZZES = [
  {
    id: 'quiz-nexttick-promise-timer',
    title: 'Puzzle 1: The Triple Threat (nextTick vs Promise vs Timer)',
    difficulty: 'Intermediate',
    scenario: 'What is the exact stdout sequence of this script?',
    code: `console.log('START');

setTimeout(() => {
  console.log('TIMEOUT');
}, 0);

Promise.resolve().then(() => {
  console.log('PROMISE');
});

process.nextTick(() => {
  console.log('NEXT_TICK');
});

console.log('END');`,
    options: [
      'START, END, TIMEOUT, PROMISE, NEXT_TICK',
      'START, END, NEXT_TICK, PROMISE, TIMEOUT',
      'START, NEXT_TICK, PROMISE, TIMEOUT, END',
      'START, END, PROMISE, NEXT_TICK, TIMEOUT'
    ],
    correctAnswerIndex: 1,
    correctSequence: ['START', 'END', 'NEXT_TICK', 'PROMISE', 'TIMEOUT'],
    explanation: `
1. Synchronous execution: 'START' is printed, then setTimeout is registered with the Timers phase, Promise is resolved putting callback into Promise Microtask Queue, process.nextTick puts callback into nextTick Microtask Queue, then synchronous 'END' is printed.
2. The current Call Stack tick finishes. Node now drains microtask queues before entering the Event Loop.
3. Node ALWAYS drains the process.nextTick queue first: 'NEXT_TICK' is printed.
4. Next, Node drains the Promise Microtask queue: 'PROMISE' is printed.
5. Finally, the Event Loop enters Phase 1 (Timers) and executes the expired 0ms timer callback: 'TIMEOUT' is printed.
    `,
    steps: [
      { phase: 'Call Stack (Sync)', action: "console.log('START') executes immediately", output: 'START' },
      { phase: 'Call Stack (Sync)', action: "setTimeout(..., 0) registered with Libuv Timers phase" },
      { phase: 'Call Stack (Sync)', action: "Promise.then() enqueued in Promise Microtask Queue" },
      { phase: 'Call Stack (Sync)', action: "process.nextTick() enqueued in nextTick Microtask Queue" },
      { phase: 'Call Stack (Sync)', action: "console.log('END') executes immediately", output: 'END' },
      { phase: 'Microtask Drain (nextTick)', action: "nextTick queue drains with top priority", output: 'NEXT_TICK' },
      { phase: 'Microtask Drain (Promise)', action: "Promise microtask queue drains next", output: 'PROMISE' },
      { phase: 'Event Loop (Phase 1: Timers)', action: "Timers phase executes expired 0ms callback", output: 'TIMEOUT' }
    ]
  },
  {
    id: 'quiz-setimmediate-in-io',
    title: 'Puzzle 2: setImmediate vs setTimeout inside an I/O Callback',
    difficulty: 'Advanced',
    scenario: 'What is the guaranteed output order inside a file read callback?',
    code: `const fs = require('fs');

fs.readFile(__filename, () => {
  setTimeout(() => {
    console.log('TIMEOUT');
  }, 0);

  setImmediate(() => {
    console.log('IMMEDIATE');
  });
});`,
    options: [
      'Non-deterministic (random each run)',
      'TIMEOUT then IMMEDIATE',
      'IMMEDIATE then TIMEOUT',
      'Both run in parallel'
    ],
    correctAnswerIndex: 2,
    correctSequence: ['IMMEDIATE', 'TIMEOUT'],
    explanation: `
When this runs inside an I/O callback (like fs.readFile), execution is currently inside the POLL PHASE of the Event Loop.
According to the Libuv Event Loop sequence:
Poll Phase -> Check Phase (setImmediate) -> Close Callbacks -> Timers Phase (setTimeout).

Because the Check Phase immediately follows the Poll Phase, setImmediate is GUARANTEED to execute first! The Timers phase won't run until the next full loop rotation.
(Note: In the main top-level script, the order is non-deterministic depending on process start timing; but inside an I/O callback, it is 100% deterministic!).
    `,
    steps: [
      { phase: 'Event Loop (Phase 4: Poll)', action: "fs.readFile callback executes in Poll phase" },
      { phase: 'Event Loop (Phase 4: Poll)', action: "setTimeout(0) registered in Timers queue for next turn" },
      { phase: 'Event Loop (Phase 4: Poll)', action: "setImmediate registered in Check queue" },
      { phase: 'Event Loop (Phase 5: Check)', action: "Loop advances directly to Check phase: executes setImmediate", output: 'IMMEDIATE' },
      { phase: 'Event Loop (Phase 1: Timers - Next Turn)', action: "Loop rotates back to Timers phase: executes setTimeout", output: 'TIMEOUT' }
    ]
  },
  {
    id: 'quiz-recursive-microtask',
    title: 'Puzzle 3: The Infinite Microtask Starvation Glitch',
    difficulty: 'Expert',
    scenario: 'What happens when this script executes?',
    code: `let count = 0;

function loop() {
  if (count++ < 5) {
    process.nextTick(loop);
  }
}

setTimeout(() => {
  console.log('TIMER_DONE');
}, 0);

loop();
console.log('LOOP_QUEUED');`,
    options: [
      'TIMER_DONE is printed before loop finishes',
      'LOOP_QUEUED is printed, all 5 nextTicks drain, then TIMER_DONE',
      'TIMER_DONE is never printed and the process crashes',
      'LOOP_QUEUED is printed, then TIMER_DONE, then the nextTicks'
    ],
    correctAnswerIndex: 1,
    correctSequence: ['LOOP_QUEUED', 'TIMER_DONE'],
    explanation: `
1. Synchronous code runs: setTimeout(..., 0) is queued in Timers phase.
2. loop() queues a process.nextTick and logs 'LOOP_QUEUED'.
3. The sync Call Stack finishes. Node drains the nextTick queue.
4. Each nextTick enqueues another nextTick. Node continues draining until the queue is empty (all 5 iterations).
5. Only after all recursive microtasks have finished can the Event Loop advance to Phase 1 (Timers) to print 'TIMER_DONE'.
(If count was infinite, Node would freeze forever and TIMER_DONE would never execute—this is called I/O Starvation!).
    `,
    steps: [
      { phase: 'Call Stack (Sync)', action: "setTimeout(0) queued in Timers phase" },
      { phase: 'Call Stack (Sync)', action: "loop() enqueues nextTick #1" },
      { phase: 'Call Stack (Sync)', action: "console.log('LOOP_QUEUED') executes", output: 'LOOP_QUEUED' },
      { phase: 'Microtask Drain', action: "nextTicks 1 through 5 drain consecutively" },
      { phase: 'Event Loop (Phase 1: Timers)', action: "Event loop finally reaches Timers phase", output: 'TIMER_DONE' }
    ]
  },
  {
    id: 'quiz-async-await-order',
    title: 'Puzzle 4: Async/Await Microtask Resolution',
    difficulty: 'Advanced',
    scenario: 'What order of numbers is printed by this async sequence?',
    code: `async function async1() {
  console.log(1);
  await async2();
  console.log(2);
}

async function async2() {
  console.log(3);
}

console.log(4);
async1();
console.log(5);`,
    options: [
      '4, 1, 3, 2, 5',
      '4, 1, 3, 5, 2',
      '1, 3, 4, 5, 2',
      '4, 5, 1, 3, 2'
    ],
    correctAnswerIndex: 1,
    correctSequence: ['4', '1', '3', '5', '2'],
    explanation: `
1. console.log(4) runs synchronously -> logs 4.
2. async1() is called synchronously -> console.log(1) logs 1.
3. await async2() calls async2() synchronously -> console.log(3) logs 3.
4. The 'await' keyword pauses async1() and schedules the remainder of async1 (console.log(2)) onto the Promise Microtask Queue.
5. Control immediately returns to the caller -> console.log(5) logs 5.
6. The synchronous Call Stack is now empty! Node drains the microtask queue -> console.log(2) logs 2.
Final order: 4, 1, 3, 5, 2.
    `,
    steps: [
      { phase: 'Sync Stack', action: "console.log(4) executes", output: '4' },
      { phase: 'Sync Stack', action: "async1() enters, console.log(1) executes", output: '1' },
      { phase: 'Sync Stack', action: "async2() enters, console.log(3) executes", output: '3' },
      { phase: 'Sync Stack', action: "await yields async1, schedules remainder as Promise microtask" },
      { phase: 'Sync Stack', action: "console.log(5) executes", output: '5' },
      { phase: 'Microtask Drain', action: "Resumed async1 microtask executes console.log(2)", output: '2' }
    ]
  }
];
