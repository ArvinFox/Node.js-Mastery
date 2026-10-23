// Interactive Quizzes & Predict-the-Output Challenges
// 20 Comprehensive Architectural Puzzles covering Core Node.js Mechanics

export const QUIZZES = [
  // --- PUZZLE 1: The Triple Threat (Microtasks vs Timers) ---
  {
    id: 'quiz-nexttick-promise-timer',
    title: 'Puzzle 01: The Triple Threat (nextTick vs Promise vs Timer)',
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
1. **Synchronous Stack**: 'START' logs immediately. \`setTimeout\` registers in the Timers phase. \`Promise.resolve().then()\` enqueues in the Promise microtask queue. \`process.nextTick()\` enqueues in the nextTick queue. 'END' logs immediately.
2. **Microtask Phase**: Before entering the Event Loop, Node drains microtasks. Node ALWAYS drains \`process.nextTick\` before Promise microtasks! Thus, 'NEXT_TICK' logs, followed by 'PROMISE'.
3. **Event Loop Phase 1 (Timers)**: Node advances to Timers and executes the expired 0ms callback: 'TIMEOUT'.
    `,
    steps: [
      { phase: 'Call Stack (Sync)', action: "console.log('START') executes immediately", output: 'START' },
      { phase: 'Call Stack (Sync)', action: "setTimeout(0) registered with Libuv Timers phase" },
      { phase: 'Call Stack (Sync)', action: "Promise.then() queued in Promise Microtask Queue" },
      { phase: 'Call Stack (Sync)', action: "process.nextTick() queued in nextTick Microtask Queue" },
      { phase: 'Call Stack (Sync)', action: "console.log('END') executes immediately", output: 'END' },
      { phase: 'Microtask Drain (nextTick)', action: "nextTick queue drains with top priority", output: 'NEXT_TICK' },
      { phase: 'Microtask Drain (Promise)', action: "Promise microtask queue drains next", output: 'PROMISE' },
      { phase: 'Event Loop (Phase 1: Timers)', action: "Timers phase executes expired 0ms callback", output: 'TIMEOUT' }
    ]
  },

  // --- PUZZLE 2: setImmediate in I/O Callback ---
  {
    id: 'quiz-setimmediate-in-io',
    title: 'Puzzle 02: setImmediate vs setTimeout inside an I/O Callback',
    difficulty: 'Advanced',
    scenario: 'What is the guaranteed output order inside an fs.readFile I/O callback?',
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
Inside an I/O callback (like \`fs.readFile\`), the Event Loop is currently running inside the **Poll Phase**.
The Libuv Event Loop sequence is:
**Poll Phase -> Check Phase (setImmediate) -> Close Callbacks -> Timers Phase (setTimeout)**.

Because the Check phase immediately follows the Poll phase, \`setImmediate\` is GUARANTEED to execute first. The Timers phase won't execute until the event loop completes a full revolution.
*(Note: In the main top-level script, the order is non-deterministic depending on process CPU jitter; but inside I/O, it is 100% deterministic!)*
    `,
    steps: [
      { phase: 'Event Loop (Phase 4: Poll)', action: "fs.readFile callback executes in Poll phase" },
      { phase: 'Event Loop (Phase 4: Poll)', action: "setTimeout(0) registered in Timers queue for next turn" },
      { phase: 'Event Loop (Phase 4: Poll)', action: "setImmediate registered in Check queue" },
      { phase: 'Event Loop (Phase 5: Check)', action: "Loop advances directly to Check phase: executes setImmediate", output: 'IMMEDIATE' },
      { phase: 'Event Loop (Phase 1: Timers)', action: "Loop rotates back to Timers phase: executes setTimeout", output: 'TIMEOUT' }
    ]
  },

  // --- PUZZLE 3: Recursive Microtask Starvation ---
  {
    id: 'quiz-recursive-microtask',
    title: 'Puzzle 03: The Recursive Microtask Starvation Glitch',
    difficulty: 'Expert',
    scenario: 'What happens when this recursive nextTick script executes?',
    code: `let count = 0;

function loop() {
  if (count++ < 3) {
    process.nextTick(loop);
  }
}

setTimeout(() => {
  console.log('TIMER_DONE');
}, 0);

loop();
console.log('LOOP_QUEUED');`,
    options: [
      'TIMER_DONE, LOOP_QUEUED',
      'LOOP_QUEUED, TIMER_DONE',
      'TIMER_DONE (LOOP_QUEUED is blocked)',
      'Infinite freeze with no output'
    ],
    correctAnswerIndex: 1,
    correctSequence: ['LOOP_QUEUED', 'TIMER_DONE'],
    explanation: `
1. \`setTimeout(0)\` registers with the Timers queue.
2. \`loop()\` executes synchronously and enqueues the first \`process.nextTick\`.
3. Synchronous \`console.log('LOOP_QUEUED')\` logs first.
4. The synchronous Call Stack finishes. Node drains the nextTick queue.
5. Because each \`nextTick\` enqueues another \`nextTick\`, Node will not enter the Event Loop until all 3 recursive ticks have fully drained.
6. Once the microtask queue is empty, Node advances to Phase 1 (Timers) and prints 'TIMER_DONE'.
*(Caution: If count was infinite, Node would starve I/O and Timers forever!)*
    `,
    steps: [
      { phase: 'Call Stack (Sync)', action: "setTimeout(0) queued in Timers phase" },
      { phase: 'Call Stack (Sync)', action: "loop() enqueues nextTick #1" },
      { phase: 'Call Stack (Sync)', action: "console.log('LOOP_QUEUED') executes", output: 'LOOP_QUEUED' },
      { phase: 'Microtask Drain', action: "nextTicks 1 through 3 drain consecutively" },
      { phase: 'Event Loop (Phase 1: Timers)', action: "Event loop finally reaches Timers phase", output: 'TIMER_DONE' }
    ]
  },

  // --- PUZZLE 4: Async/Await Microtask Resolution ---
  {
    id: 'quiz-async-await-order',
    title: 'Puzzle 04: Async/Await Microtask Resolution',
    difficulty: 'Intermediate',
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
1. \`console.log(4)\` executes synchronously -> logs 4.
2. \`async1()\` is called -> logs 1.
3. \`await async2()\` calls \`async2()\` synchronously -> logs 3.
4. The \`await\` keyword pauses \`async1()\` and schedules the remainder as a Promise microtask.
5. Execution yields back to top-level caller -> logs 5.
6. The synchronous Call Stack is empty. Node drains microtasks -> resumed \`async1()\` logs 2.
    `,
    steps: [
      { phase: 'Sync Stack', action: "console.log(4) executes", output: '4' },
      { phase: 'Sync Stack', action: "async1() enters, console.log(1) executes", output: '1' },
      { phase: 'Sync Stack', action: "async2() enters, console.log(3) executes", output: '3' },
      { phase: 'Sync Stack', action: "await yields async1, schedules remainder as Promise microtask" },
      { phase: 'Sync Stack', action: "console.log(5) executes", output: '5' },
      { phase: 'Microtask Drain', action: "Resumed async1 microtask executes console.log(2)", output: '2' }
    ]
  },

  // --- PUZZLE 5: EventEmitter Synchronous Dispatch ---
  {
    id: 'quiz-eventemitter-sync-dispatch',
    title: 'Puzzle 05: EventEmitter Synchronous Dispatch',
    difficulty: 'Beginner',
    scenario: 'Many developers mistakenly think EventEmitter is asynchronous. What does this output?',
    code: `const EventEmitter = require('events');
const ee = new EventEmitter();

console.log('A');

ee.on('ping', () => {
  console.log('B');
});

ee.emit('ping');

console.log('C');`,
    options: [
      'A, C, B',
      'A, B, C',
      'B, A, C',
      'C, B, A'
    ],
    correctAnswerIndex: 1,
    correctSequence: ['A', 'B', 'C'],
    explanation: `
\`EventEmitter.prototype.emit()\` is **100% SYNCHRONOUS**!
When you call \`ee.emit('ping')\`, Node immediately iterates over the array of registered listener functions and invokes them on the current Call Stack one by one before returning.
There is NO event loop or microtask delay involved unless you explicitly wrap the listener in \`setImmediate\` or \`process.nextTick\`.
    `,
    steps: [
      { phase: 'Sync Stack', action: "console.log('A') executes", output: 'A' },
      { phase: 'Sync Stack', action: "ee.emit('ping') immediately executes registered listener", output: 'B' },
      { phase: 'Sync Stack', action: "ee.emit() returns; console.log('C') executes", output: 'C' }
    ]
  },

  // --- PUZZLE 6: EventEmitter Listener Removal & once() ---
  {
    id: 'quiz-eventemitter-listener-removal',
    title: 'Puzzle 06: once() vs on() Multiple Emission Order',
    difficulty: 'Intermediate',
    scenario: 'What is printed after two consecutive emit calls?',
    code: `const EventEmitter = require('events');
const ee = new EventEmitter();

ee.once('data', () => {
  console.log('FIRST');
});

ee.on('data', () => {
  console.log('SECOND');
});

ee.emit('data');
ee.emit('data');`,
    options: [
      'FIRST, SECOND',
      'FIRST, SECOND, FIRST, SECOND',
      'FIRST, SECOND, SECOND',
      'SECOND, SECOND, FIRST'
    ],
    correctAnswerIndex: 2,
    correctSequence: ['FIRST', 'SECOND', 'SECOND'],
    explanation: `
1. On the first \`emit('data')\`, both listeners fire in registration order: 'FIRST' then 'SECOND'.
2. The \`once()\` wrapper automatically deregisters itself during or immediately before invocation.
3. On the second \`emit('data')\`, only the persistent \`on()\` listener remains registered: 'SECOND'.
Final output: FIRST, SECOND, SECOND.
    `,
    steps: [
      { phase: 'First Emit', action: "once listener fires", output: 'FIRST' },
      { phase: 'First Emit', action: "persistent listener fires", output: 'SECOND' },
      { phase: 'Second Emit', action: "only persistent listener remains", output: 'SECOND' }
    ]
  },

  // --- PUZZLE 7: Buffer Slice Memory Mutation ---
  {
    id: 'quiz-buffer-slice-mutation',
    title: 'Puzzle 07: Buffer Subarray Memory Mutation',
    difficulty: 'Intermediate',
    scenario: 'What is printed when a sliced buffer is modified?',
    code: `const buf1 = Buffer.from('NODE');
const buf2 = buf1.subarray(0, 2);

buf2[0] = 67; // ASCII 67 is 'C'

console.log(buf1.toString());`,
    options: [
      'NODE',
      'CODE',
      'CD',
      'COEE'
    ],
    correctAnswerIndex: 1,
    correctSequence: ['CODE'],
    explanation: `
In Node.js, \`Buffer.prototype.subarray()\` (and the legacy \`.slice()\`) returns a **view** over the EXACT SAME memory pool as the parent Buffer—it does NOT allocate a new copy!
Modifying byte 0 of \`buf2\` modifies byte 0 of \`buf1\` directly in memory.
Therefore, ASCII 67 ('C') replaces 'N', transforming 'NODE' into 'CODE'.
*(To create a true independent copy, you must use \`Buffer.from(buf2)\` or \`buf.copy()\`).*
    `,
    steps: [
      { phase: 'Allocation', action: "buf1 allocates 4 bytes: [0x4E, 0x4F, 0x44, 0x45] ('NODE')" },
      { phase: 'Subarray View', action: "buf2 points to same ArrayBuffer memory starting at offset 0" },
      { phase: 'Mutation', action: "buf2[0] = 67 writes 'C' into shared byte 0" },
      { phase: 'Inspection', action: "buf1.toString() reflects memory mutation", output: 'CODE' }
    ]
  },

  // --- PUZZLE 8: Promise Constructor Synchronous Executor ---
  {
    id: 'quiz-promise-constructor-sync',
    title: 'Puzzle 08: Synchronous Promise Constructor Execution',
    difficulty: 'Advanced',
    scenario: 'What is the exact stdout sequence of this Promise snippet?',
    code: `console.log('1');

new Promise((resolve) => {
  console.log('2');
  resolve('3');
  console.log('4');
}).then((res) => {
  console.log(res);
});

console.log('5');`,
    options: [
      '1, 5, 2, 4, 3',
      '1, 2, 4, 5, 3',
      '1, 2, 3, 4, 5',
      '1, 2, 5, 4, 3'
    ],
    correctAnswerIndex: 1,
    correctSequence: ['1', '2', '4', '5', '3'],
    explanation: `
1. \`console.log('1')\` prints 1.
2. The executor function passed into \`new Promise(executor)\` executes **immediately and synchronously**!
3. Inside the executor, \`console.log('2')\` prints 2.
4. \`resolve('3')\` resolves the Promise and queues the \`.then()\` handler into the microtask queue, but does NOT stop execution of the executor function.
5. \`console.log('4')\` prints 4.
6. The Promise constructor finishes. Synchronous \`console.log('5')\` prints 5.
7. The synchronous stack is empty. Node drains microtasks -> \`.then()\` prints 3.
    `,
    steps: [
      { phase: 'Sync Stack', action: "console.log('1')", output: '1' },
      { phase: 'Sync Stack', action: "Promise executor entered: console.log('2')", output: '2' },
      { phase: 'Sync Stack', action: "resolve('3') enqueues .then() microtask" },
      { phase: 'Sync Stack', action: "console.log('4') finishes executor", output: '4' },
      { phase: 'Sync Stack', action: "console.log('5')", output: '5' },
      { phase: 'Microtask Drain', action: "Promise.then handler logs resolution value", output: '3' }
    ]
  },

  // --- PUZZLE 9: Chained Promises Interleaving ---
  {
    id: 'quiz-chained-promises-interleaving',
    title: 'Puzzle 09: Chained Microtask Interleaving',
    difficulty: 'Advanced',
    scenario: 'When two concurrent Promise chains resolve, in what order do their steps execute?',
    code: `Promise.resolve()
  .then(() => console.log('P1-A'))
  .then(() => console.log('P1-B'));

Promise.resolve()
  .then(() => console.log('P2-A'))
  .then(() => console.log('P2-B'));`,
    options: [
      'P1-A, P1-B, P2-A, P2-B',
      'P1-A, P2-A, P1-B, P2-B',
      'P2-A, P2-B, P1-A, P1-B',
      'P1-A, P2-A, P2-B, P1-B'
    ],
    correctAnswerIndex: 1,
    correctSequence: ['P1-A', 'P2-A', 'P1-B', 'P2-B'],
    explanation: `
The V8 microtask queue is a strict First-In, First-Out (FIFO) queue:
1. Initially, \`P1-A\` and \`P2-A\` are enqueued in order.
2. \`P1-A\` executes and returns, scheduling its chained handler \`P1-B\` onto the end of the microtask queue.
3. Next in queue is \`P2-A\`, which executes and schedules \`P2-B\` onto the end of the queue.
4. Next in queue is \`P1-B\`, which executes.
5. Finally, \`P2-B\` executes.
Result: P1-A, P2-A, P1-B, P2-B.
    `,
    steps: [
      { phase: 'Microtask Queue', action: "Queue initially holds [P1-A, P2-A]" },
      { phase: 'Drain Step 1', action: "P1-A runs -> enqueues P1-B (Queue: [P2-A, P1-B])", output: 'P1-A' },
      { phase: 'Drain Step 2', action: "P2-A runs -> enqueues P2-B (Queue: [P1-B, P2-B])", output: 'P2-A' },
      { phase: 'Drain Step 3', action: "P1-B runs (Queue: [P2-B])", output: 'P1-B' },
      { phase: 'Drain Step 4', action: "P2-B runs (Queue: [])", output: 'P2-B' }
    ]
  },

  // --- PUZZLE 10: Try/Catch with Asynchronous Callback ---
  {
    id: 'quiz-try-catch-async-callback',
    title: 'Puzzle 10: The Try/Catch Asynchronous Trap',
    difficulty: 'Beginner',
    scenario: 'What is logged when an exception is thrown inside an asynchronous callback wrapped in try/catch?',
    code: `try {
  setTimeout(() => {
    throw new Error('KERNEL_PANIC');
  }, 10);
} catch (err) {
  console.log('CAUGHT_IN_TRY_CATCH');
}

console.log('SCRIPT_END');`,
    options: [
      'CAUGHT_IN_TRY_CATCH, SCRIPT_END',
      'SCRIPT_END, then CAUGHT_IN_TRY_CATCH',
      'SCRIPT_END, followed by an Uncaught Exception Crash',
      'KERNEL_PANIC, SCRIPT_END'
    ],
    correctAnswerIndex: 2,
    correctSequence: ['SCRIPT_END', 'Crash'],
    explanation: `
\`try/catch\` ONLY catches exceptions that occur synchronously on the **current Call Stack**!
When \`setTimeout\` callback executes 10ms later, the original Call Stack (and the \`try/catch\` block) has already completed and exited long ago.
The callback executes in a completely fresh stack initiated by the Libuv Event Loop.
Because there is no active \`try/catch\` frame wrapping that tick, it becomes an **uncaughtException**, crashing the Node process unless handled by \`process.on('uncaughtException')\`.
'CAUGHT_IN_TRY_CATCH' is NEVER printed!
    `,
    steps: [
      { phase: 'Sync Stack', action: "setTimeout(10) scheduled; try/catch exits immediately" },
      { phase: 'Sync Stack', action: "console.log('SCRIPT_END') executes", output: 'SCRIPT_END' },
      { phase: 'Timers Phase (10ms later)', action: "Callback throws outside of try/catch context -> Process Crash" }
    ]
  },

  // --- PUZZLE 11: CommonJS Circular Dependency Evaluation ---
  {
    id: 'quiz-commonjs-circular-cache',
    title: 'Puzzle 11: CommonJS Circular Module Mutation',
    difficulty: 'Advanced',
    scenario: 'What values are observed when circular modules load each other before finishing?',
    code: `// Module A:
// exports.done = false;
// const b = require('./b');
// console.log('In A, b.done =', b.done);
// exports.done = true;

// Module B:
// exports.done = false;
// const a = require('./a');
// console.log('In B, a.done =', a.done);
// exports.done = true;

// In main.js: require('./a');`,
    options: [
      'In B, a.done = false -> In A, b.done = true',
      'In B, a.done = true -> In A, b.done = true',
      'In A, b.done = false -> In B, a.done = true',
      'RangeError: Maximum call stack size exceeded'
    ],
    correctAnswerIndex: 0,
    correctSequence: ['In B, a.done = false', 'In A, b.done = true'],
    explanation: `
CommonJS handles circular dependencies by caching the incomplete \`module.exports\` object immediately when loading starts.
1. \`require('./a')\` starts: \`a.exports\` is cached with \`{ done: false }\`.
2. Module A calls \`require('./b')\`: Module B starts executing.
3. Module B calls \`require('./a')\`: Node detects the circular dependency and returns the currently cached, incomplete copy of \`a.exports\` (\`{ done: false }\`).
4. Module B logs: \`In B, a.done = false\`.
5. Module B sets \`b.exports.done = true\` and finishes.
6. Control returns to Module A: it logs \`In A, b.done = true\`.
    `,
    steps: [
      { phase: 'Require A', action: "module A cached with { done: false }" },
      { phase: 'Require B', action: "module B cached with { done: false }" },
      { phase: 'Circular Hit', action: "B requires A -> receives unfinished { done: false }", output: 'In B, a.done = false' },
      { phase: 'B Finishes', action: "B sets b.done = true and returns" },
      { phase: 'A Resumes', action: "A inspects completed B object", output: 'In A, b.done = true' }
    ]
  },

  // --- PUZZLE 12: queueMicrotask vs process.nextTick ---
  {
    id: 'quiz-queuemicrotask-vs-nexttick',
    title: 'Puzzle 12: process.nextTick vs queueMicrotask Priority',
    difficulty: 'Advanced',
    scenario: 'Which microtask queue has strict scheduling precedence in Node.js?',
    code: `queueMicrotask(() => {
  console.log('QUEUE_MICROTASK');
});

process.nextTick(() => {
  console.log('NEXT_TICK');
});

Promise.resolve().then(() => {
  console.log('PROMISE');
});`,
    options: [
      'QUEUE_MICROTASK, NEXT_TICK, PROMISE',
      'NEXT_TICK, QUEUE_MICROTASK, PROMISE',
      'PROMISE, NEXT_TICK, QUEUE_MICROTASK',
      'NEXT_TICK, PROMISE, QUEUE_MICROTASK'
    ],
    correctAnswerIndex: 1,
    correctSequence: ['NEXT_TICK', 'QUEUE_MICROTASK', 'PROMISE'],
    explanation: `
In Node.js, there are two distinct microtask queues:
1. **The \`process.nextTick\` Queue**: Maintained natively by Node.js.
2. **The ECMAScript Microtask Queue**: Maintained by V8 (shared by \`queueMicrotask\` and \`Promise.then\`).

Node ALWAYS drains the entire \`nextTick\` queue first before touching the V8 microtask queue!
Between \`queueMicrotask\` and \`Promise.then\`, they share the standard V8 microtask queue in FIFO order. Since \`queueMicrotask\` was enqueued first, it runs before \`PROMISE\`.
Order: NEXT_TICK -> QUEUE_MICROTASK -> PROMISE.
    `,
    steps: [
      { phase: 'Queueing', action: "queueMicrotask enqueued into V8 Microtask queue" },
      { phase: 'Queueing', action: "process.nextTick enqueued into Node nextTick queue" },
      { phase: 'Queueing', action: "Promise.then enqueued into V8 Microtask queue" },
      { phase: 'Drain Phase 1', action: "Node nextTick queue drained first", output: 'NEXT_TICK' },
      { phase: 'Drain Phase 2', action: "V8 microtask queue drained in FIFO order", output: 'QUEUE_MICROTASK' },
      { phase: 'Drain Phase 2', action: "V8 microtask queue finishes", output: 'PROMISE' }
    ]
  },

  // --- PUZZLE 13: Close Callbacks Phase (Phase 6) ---
  {
    id: 'quiz-close-callbacks-phase',
    title: 'Puzzle 13: Close Callbacks Phase Mechanics',
    difficulty: 'Expert',
    scenario: 'What is the output when a close handler is emitted synchronously vs event loop phases?',
    code: `const EventEmitter = require('events');
const socket = new EventEmitter();

socket.on('close', () => {
  console.log('CLOSE_HANDLER');
});

setImmediate(() => {
  console.log('CHECK_IMMEDIATE');
});

setTimeout(() => {
  console.log('TIMER_EXPIRED');
}, 0);

process.nextTick(() => {
  socket.emit('close');
});

console.log('MAIN_END');`,
    options: [
      'MAIN_END, CLOSE_HANDLER, TIMER_EXPIRED, CHECK_IMMEDIATE',
      'MAIN_END, TIMER_EXPIRED, CHECK_IMMEDIATE, CLOSE_HANDLER',
      'MAIN_END, CHECK_IMMEDIATE, TIMER_EXPIRED, CLOSE_HANDLER',
      'CLOSE_HANDLER, MAIN_END, TIMER_EXPIRED, CHECK_IMMEDIATE'
    ],
    correctAnswerIndex: 0,
    correctSequence: ['MAIN_END', 'CLOSE_HANDLER', 'TIMER_EXPIRED', 'CHECK_IMMEDIATE'],
    explanation: `
1. Synchronous \`console.log('MAIN_END')\` prints first.
2. Before the Event Loop starts, Node drains the nextTick queue.
3. The nextTick callback runs \`socket.emit('close')\`. Since EventEmitter is synchronous, 'CLOSE_HANDLER' logs immediately during the microtask drain!
4. The Event Loop enters Phase 1 (Timers): 'TIMER_EXPIRED' logs.
5. The Event Loop rotates to Phase 5 (Check): 'CHECK_IMMEDIATE' logs.
    `,
    steps: [
      { phase: 'Sync Stack', action: "console.log('MAIN_END')", output: 'MAIN_END' },
      { phase: 'Microtask Drain', action: "nextTick invokes socket.emit('close')", output: 'CLOSE_HANDLER' },
      { phase: 'Event Loop (Timers)', action: "setTimeout(0) expires", output: 'TIMER_EXPIRED' },
      { phase: 'Event Loop (Check)', action: "setImmediate executes", output: 'CHECK_IMMEDIATE' }
    ]
  },

  // --- PUZZLE 14: Readable Stream Event Order ---
  {
    id: 'quiz-stream-event-flow',
    title: 'Puzzle 14: Readable Stream Data Flow & End Events',
    difficulty: 'Intermediate',
    scenario: 'What sequence of events is emitted by this readable stream?',
    code: `const { Readable } = require('stream');

const stream = new Readable({ read() {} });

stream.on('data', (chunk) => {
  console.log('DATA:', chunk.toString());
});

stream.on('end', () => {
  console.log('STREAM_END');
});

console.log('STEP_1');
stream.push('BUFFER_CHUNK');
stream.push(null); // Signals EOF
console.log('STEP_2');`,
    options: [
      'STEP_1, STEP_2, DATA: BUFFER_CHUNK, STREAM_END',
      'STEP_1, DATA: BUFFER_CHUNK, STREAM_END, STEP_2',
      'DATA: BUFFER_CHUNK, STEP_1, STEP_2, STREAM_END',
      'STEP_1, DATA: BUFFER_CHUNK, STEP_2, STREAM_END'
    ],
    correctAnswerIndex: 1,
    correctSequence: ['STEP_1', 'DATA: BUFFER_CHUNK', 'STREAM_END', 'STEP_2'],
    explanation: `
When a stream has a \`'data'\` event listener attached, it operates in **flowing mode**.
Calling \`stream.push('BUFFER_CHUNK')\` immediately and synchronously triggers the \`'data'\` event listener!
Then \`stream.push(null)\` pushes EOF, which synchronously triggers the \`'end'\` event.
Only after both have fired does the top-level script proceed to \`console.log('STEP_2')\`.
Output: STEP_1, DATA: BUFFER_CHUNK, STREAM_END, STEP_2.
    `,
    steps: [
      { phase: 'Sync Stack', action: "console.log('STEP_1')", output: 'STEP_1' },
      { phase: 'Stream Flowing', action: "stream.push('BUFFER_CHUNK') emits 'data' synchronously", output: 'DATA: BUFFER_CHUNK' },
      { phase: 'Stream Flowing', action: "stream.push(null) emits 'end' synchronously", output: 'STREAM_END' },
      { phase: 'Sync Stack', action: "console.log('STEP_2')", output: 'STEP_2' }
    ]
  },

  // --- PUZZLE 15: AsyncLocalStorage Context Propagation ---
  {
    id: 'quiz-async-local-storage-hops',
    title: 'Puzzle 15: AsyncLocalStorage Context Across Async Hops',
    difficulty: 'Advanced',
    scenario: 'What is logged inside and outside the AsyncLocalStorage context?',
    code: `const { AsyncLocalStorage } = require('node:async_hooks');
const als = new AsyncLocalStorage();

als.run({ reqId: 'REQ_101' }, () => {
  setTimeout(() => {
    console.log('Timer:', als.getStore()?.reqId);
  }, 10);

  process.nextTick(() => {
    console.log('Tick:', als.getStore()?.reqId);
  });
});

console.log('Outside:', als.getStore()?.reqId);`,
    options: [
      'Outside: REQ_101, Tick: REQ_101, Timer: REQ_101',
      'Outside: undefined, Tick: REQ_101, Timer: REQ_101',
      'Outside: undefined, Tick: undefined, Timer: undefined',
      'Tick: REQ_101, Outside: undefined, Timer: undefined'
    ],
    correctAnswerIndex: 1,
    correctSequence: ['Outside: undefined', 'Tick: REQ_101', 'Timer: REQ_101'],
    explanation: `
\`AsyncLocalStorage.prototype.run(store, callback)\` establishes an execution context for the duration of the callback and across **any asynchronous hops** created within it (via \`async_hooks\`).
1. \`console.log('Outside')\` executes synchronously after \`als.run()\` returns -> its store is \`undefined\`.
2. The nextTick callback was created within the \`run()\` scope -> retains store \`{ reqId: 'REQ_101' }\`.
3. The setTimeout callback was created within the \`run()\` scope -> retains store \`{ reqId: 'REQ_101' }\`.
    `,
    steps: [
      { phase: 'Sync Stack', action: "als.run schedules nextTick and timer with captured context" },
      { phase: 'Sync Stack', action: "Top-level code outside of callback has no store", output: 'Outside: undefined' },
      { phase: 'Microtask Drain', action: "nextTick preserves captured store", output: 'Tick: REQ_101' },
      { phase: 'Timers Phase', action: "Timer preserves captured store", output: 'Timer: REQ_101' }
    ]
  },

  // --- PUZZLE 16: Main Thread Blocking (CPU Bound) ---
  {
    id: 'quiz-main-thread-cpu-block',
    title: 'Puzzle 16: CPU Starvation vs 0ms Timers',
    difficulty: 'Beginner',
    scenario: 'What happens when synchronous code blocks the thread for 50ms?',
    code: `const start = Date.now();

setTimeout(() => {
  console.log('TIMER_TRIGGERED');
}, 0);

while (Date.now() - start < 50) {
  // Heavy synchronous calculation blocking thread
}

console.log('LOOP_FINISHED');`,
    options: [
      'TIMER_TRIGGERED, LOOP_FINISHED',
      'LOOP_FINISHED, TIMER_TRIGGERED',
      'TIMER_TRIGGERED interrupts the while loop at 0ms',
      'Both run concurrently on separate OS threads'
    ],
    correctAnswerIndex: 1,
    correctSequence: ['LOOP_FINISHED', 'TIMER_TRIGGERED'],
    explanation: `
Node.js JavaScript execution is **single-threaded**!
Even though the timer was set for 0ms (which Libuv normalizes to 1ms), Node cannot interrupt the running synchronous \`while\` loop.
The event loop is completely frozen until the synchronous Call Stack becomes entirely idle.
Only after the 50ms busy-wait loop completes and \`LOOP_FINISHED\` is printed can the Event Loop cycle and execute the overdue timer callback.
    `,
    steps: [
      { phase: 'Sync Stack', action: "setTimeout(0) queued in Timers phase" },
      { phase: 'Sync Stack', action: "while loop monopolizes CPU for 50ms (Event loop frozen)" },
      { phase: 'Sync Stack', action: "console.log('LOOP_FINISHED') executes", output: 'LOOP_FINISHED' },
      { phase: 'Event Loop (Timers)', action: "Thread finally free: overdue timer fires", output: 'TIMER_TRIGGERED' }
    ]
  },

  // --- PUZZLE 17: Unhandled Promise Rejection Event ---
  {
    id: 'quiz-unhandled-rejection-event',
    title: 'Puzzle 17: unhandledRejection vs Synchronous Stack',
    difficulty: 'Intermediate',
    scenario: 'When does the process unhandledRejection event fire?',
    code: `process.on('unhandledRejection', (reason) => {
  console.log('GLOBAL_CATCH:', reason);
});

Promise.reject('CRITICAL_FAIL');

console.log('SYNCHRONOUS_END');`,
    options: [
      'GLOBAL_CATCH: CRITICAL_FAIL, SYNCHRONOUS_END',
      'SYNCHRONOUS_END, GLOBAL_CATCH: CRITICAL_FAIL',
      'UnhandledPromiseRejection crash before SYNCHRONOUS_END',
      'Only SYNCHRONOUS_END is printed (event is ignored)'
    ],
    correctAnswerIndex: 1,
    correctSequence: ['SYNCHRONOUS_END', 'GLOBAL_CATCH: CRITICAL_FAIL'],
    explanation: `
When \`Promise.reject()\` is called without a \`.catch()\` handler attached in the same tick:
1. Node does not immediately panic—it schedules the rejection check onto the microtask queue.
2. Synchronous \`console.log('SYNCHRONOUS_END')\` runs to completion.
3. During the microtask drain, Node sees the unhandled rejected Promise and emits the \`unhandledRejection\` event on the \`process\` global.
4. The registered event listener prints \`GLOBAL_CATCH: CRITICAL_FAIL\`.
    `,
    steps: [
      { phase: 'Sync Stack', action: "Promise.reject() flags unhandled rejection" },
      { phase: 'Sync Stack', action: "console.log('SYNCHRONOUS_END') executes", output: 'SYNCHRONOUS_END' },
      { phase: 'Microtask Drain', action: "Node detects unhandled rejection and emits process event", output: 'GLOBAL_CATCH: CRITICAL_FAIL' }
    ]
  },

  // --- PUZZLE 18: SharedArrayBuffer Atomics CompareExchange ---
  {
    id: 'quiz-atomics-compare-exchange',
    title: 'Puzzle 18: SharedArrayBuffer & Atomics Mutex Race',
    difficulty: 'Expert',
    scenario: 'What is printed by these two atomic operations on shared memory?',
    code: `const sab = new SharedArrayBuffer(4);
const view = new Int32Array(sab);

// Initial state: view[0] === 0
const r1 = Atomics.compareExchange(view, 0, 0, 42);
const r2 = Atomics.compareExchange(view, 0, 0, 99);

console.log(r1, view[0], r2);`,
    options: [
      '0 42 42',
      '0 99 0',
      '42 42 99',
      '0 42 0'
    ],
    correctAnswerIndex: 0,
    correctSequence: ['0', '42', '42'],
    explanation: `
\`Atomics.compareExchange(typedArray, index, expectedValue, replacementValue)\`:
1. Compares \`typedArray[index]\` with \`expectedValue\`. If they match, it replaces the value with \`replacementValue\`.
2. **Crucially, it ALWAYS returns the OLD value that was at that index!**
- In \`r1\`: \`view[0]\` was 0, matching expected 0. It sets \`view[0] = 42\` and returns old value \`0\`.
- In \`r2\`: \`view[0]\` is now 42, which does NOT match expected 0! The replacement is rejected, \`view[0]\` remains 42, and it returns the existing value \`42\`.
Output: \`0 42 42\`.
    `,
    steps: [
      { phase: 'Memory Init', action: "Int32Array initialized with value 0" },
      { phase: 'Atomics #1', action: "Expected 0 === actual 0 -> replaced with 42, returns old 0" },
      { phase: 'Atomics #2', action: "Expected 0 !== actual 42 -> update rejected, returns current 42" },
      { phase: 'Stdout Output', action: "console.log(0, 42, 42)", output: '0 42 42' }
    ]
  },

  // --- PUZZLE 19: JSON Circular Reference Mutation ---
  {
    id: 'quiz-json-circular-ref',
    title: 'Puzzle 19: V8 Heap Traversal & Circular Serialization',
    difficulty: 'Intermediate',
    scenario: 'What error name is thrown when stringifying a self-referential graph?',
    code: `const nodeA = { name: 'Alpha' };
const nodeB = { name: 'Beta', parent: nodeA };
nodeA.child = nodeB;

try {
  JSON.stringify(nodeA);
  console.log('SUCCESS');
} catch (err) {
  console.log(err.name);
}`,
    options: [
      'RangeError',
      'TypeError',
      'ReferenceError',
      'SUCCESS'
    ],
    correctAnswerIndex: 1,
    correctSequence: ['TypeError'],
    explanation: `
In JavaScript / V8, passing an object graph containing circular references to \`JSON.stringify()\` throws a **\`TypeError\`** with message: *"TypeError: Converting circular structure to JSON"*.
*(Developers often mistakenly guess RangeError due to stack overflow, but the ECMAScript specification explicitly defines this as a TypeError!)*
    `,
    steps: [
      { phase: 'Graph Linking', action: "nodeA.child references nodeB; nodeB.parent references nodeA" },
      { phase: 'Serialization', action: "JSON.stringify detects cycle in property path" },
      { phase: 'Exception Handling', action: "TypeError caught and name printed", output: 'TypeError' }
    ]
  },

  // --- PUZZLE 20: Node v11+ Microtask Drain Per Timer ---
  {
    id: 'quiz-nested-timer-microtask',
    title: 'Puzzle 20: Microtask Drainage Between Consecutive Timers',
    difficulty: 'Expert',
    scenario: 'In modern Node.js, what is the exact execution order of these timers and microtasks?',
    code: `setTimeout(() => {
  console.log('TIMER_1');
  process.nextTick(() => {
    console.log('TICK_IN_TIMER_1');
  });
}, 0);

setTimeout(() => {
  console.log('TIMER_2');
}, 0);

setImmediate(() => {
  console.log('IMMEDIATE');
});`,
    options: [
      'TIMER_1, TIMER_2, TICK_IN_TIMER_1, IMMEDIATE',
      'TIMER_1, TICK_IN_TIMER_1, TIMER_2, IMMEDIATE',
      'IMMEDIATE, TIMER_1, TICK_IN_TIMER_1, TIMER_2',
      'TIMER_1, TIMER_2, IMMEDIATE, TICK_IN_TIMER_1'
    ],
    correctAnswerIndex: 1,
    correctSequence: ['TIMER_1', 'TICK_IN_TIMER_1', 'TIMER_2', 'IMMEDIATE'],
    explanation: `
In Node.js v11 and newer, Node aligned its Event Loop behavior with standard browser HTML5 specifications:
**Microtasks (nextTick and Promises) are drained IMMEDIATELY after each individual timer or check callback**, rather than after the entire phase has completed!
1. \`TIMER_1\` fires. It enqueues \`TICK_IN_TIMER_1\`.
2. As soon as \`TIMER_1\` callback exits, Node immediately drains microtasks -> \`TICK_IN_TIMER_1\` prints before \`TIMER_2\`!
3. Then Node proceeds to the next timer: \`TIMER_2\` prints.
4. Then the Event Loop advances to Check phase: \`IMMEDIATE\` prints.
    `,
    steps: [
      { phase: 'Timers Phase', action: "First expired 0ms timer executes", output: 'TIMER_1' },
      { phase: 'Inter-Callback Microtask Drain', action: "nextTick scheduled inside timer 1 executes immediately", output: 'TICK_IN_TIMER_1' },
      { phase: 'Timers Phase', action: "Second expired 0ms timer executes", output: 'TIMER_2' },
      { phase: 'Check Phase', action: "setImmediate callback executes", output: 'IMMEDIATE' }
    ]
  }
];
