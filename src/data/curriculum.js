// Comprehensive Curriculum Database for NODE://TERMINAL
// 20 Lessons across 4 Tiers: Novice Hacker -> Daemon Engineer -> Core Architect -> Matrix Master

export const TIERS = [
  {
    id: 1,
    name: 'TIER 1: NOVICE HACKER',
    level: 'Beginner',
    badge: 'BADGE_RELOAD',
    badgeTitle: 'Script Rebooter',
    color: '#00ff66',
    description: 'Ground Zero foundations: V8 + Libuv, runtime globals, CommonJS vs ESM circular traps, and error-first callbacks.'
  },
  {
    id: 2,
    name: 'TIER 2: DAEMON ENGINEER',
    level: 'Intermediate',
    badge: 'BADGE_DAEMON',
    badgeTitle: 'Daemon Wrangler',
    color: '#00f0ff',
    description: 'Async mechanics, microtask queues, EventEmitter internals, raw binary Buffers, and TCP networking.'
  },
  {
    id: 3,
    name: 'TIER 3: CORE ARCHITECT',
    level: 'Advanced',
    badge: 'BADGE_STREAM_SAVIOR',
    badgeTitle: 'Stream Guardian',
    color: '#ffb000',
    description: 'The Reactor Pattern, 6 Event Loop phases, Stream backpressure physics, child processes, and cryptographic safety.'
  },
  {
    id: 4,
    name: 'TIER 4: MATRIX MASTER',
    level: 'Expert',
    badge: 'BADGE_KERNEL_MASTER',
    badgeTitle: 'Matrix Kernel Master',
    color: '#ff007f',
    description: 'Worker Threads with SharedArrayBuffer Atomics, Cluster IPC zero-downtime, AsyncLocalStorage, V8 Generational GC, and Heap autopsy.'
  }
];

export const LESSONS = [
  // --- TIER 1: NOVICE HACKER ---
  {
    id: '01-what-is-node',
    tier: 1,
    tierName: 'TIER 1: NOVICE HACKER',
    title: 'Mission 01: What Node.js Really Is (V8 + Libuv)',
    hook: 'If JavaScript is single-threaded, how does Node read 1,000 files simultaneously without freezing?',
    summary: 'Discover the dual-engine architecture: V8 compiles your JS to machine code while Libuv coordinates OS non-blocking I/O.',
    explanation: `
Many developers think Node.js is a framework like Django or a language like Python.
In reality, **Node.js is a C++ runtime program** that embeds two technological marvels:
1. **Google V8**: The ultra-fast open-source JavaScript and WebAssembly engine written in C++. It parses, compiles (JIT), and executes your JS code on a single main thread.
2. **Libuv**: A multi-platform C library originally built specifically for Node. It provides the Event Loop, asynchronous non-blocking I/O abstractions (epoll on Linux, kqueue on macOS, IOCP on Windows), and a 4-thread background threadpool.

When you run an asynchronous function like \`fs.readFile('data.txt', callback)\`:
- V8 starts executing the JS call.
- Node passes the request down to **Libuv**.
- Libuv tells the OS kernel or threadpool to read the file in the background.
- V8 immediately continues executing your next lines of JavaScript without waiting!
- When the file is read, Libuv pushes your callback into the Event Loop for V8 to execute.
    `,
    conceptKeyPoints: [
      'Node.js = V8 (JS Engine) + Libuv (Asynchronous I/O Engine) + C++ Core Bindings.',
      'Your JS runs on 1 thread; Libuv coordinates background work across the OS.',
      'Non-blocking I/O means Node never waits for the disk or network to reply before doing other work.'
    ],
    codeExample: `// Demonstration: Synchronous vs Asynchronous Non-blocking
console.log('1: Rocket Launch Sequence Initiated');

// Non-blocking asynchronous timer (Libuv handle)
setTimeout(() => {
  console.log('3: Thrusters Ignited (from Event Loop)');
}, 100);

console.log('2: Checking Navigation Telemetry (Sync)');
// Output order: 1, 2, 3! Notice line 2 runs before line 3 even though line 3 was scheduled first.`,
    trial: {
      challengeTitle: 'Trial 01: Environment Detective',
      description: 'Write a function `detectRuntime()` that inspects runtime characteristics and returns "node", "browser", or "unknown" based on runtime signatures without crashing.',
      starterCode: `function detectRuntime() {
  // TODO: Detect if running inside Node.js or a Browser
  // Hint: Check for process and process.versions.node!
  return "unknown";
}

// Test call
console.log("Detected runtime:", detectRuntime());`,
      solutionCode: `function detectRuntime() {
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    return "node";
  }
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    return "browser";
  }
  return "unknown";
}

console.log("Detected runtime:", detectRuntime());`,
      testAssertion: 'detectRuntime() should return "node" in Node.js environment.',
      firstPrinciplesQuestion: 'Why does accessing window in Node throw a ReferenceError, but typeof window safely returns "undefined"?'
    }
  },
  {
    id: '02-global-process',
    tier: 1,
    tierName: 'TIER 1: NOVICE HACKER',
    title: 'Mission 02: The Global Matrix & The process Object',
    hook: 'Why is there no window in Node, but process holds the keys to the operating system?',
    summary: 'Master the process object: CLI arguments, environment secrets, exit codes, and memory metrics.',
    explanation: `
In browser JavaScript, the top-level global is \`window\`. In Node.js, it is \`global\` (and universally \`globalThis\`).

Before Node runs any file, it secretly wraps your entire file in an invisible C++ function:
\`\`\`js
(function (exports, require, module, __filename, __dirname) {
  // YOUR CODE LIVES HERE
});
\`\`\`
This is why \`__dirname\` and \`__filename\` feel like globals, but are actually local function parameters!

The **\`process\`** object is your gateway to the host machine:
- \`process.env\`: Access system environment variables (API keys, ports).
- \`process.argv\`: Array containing CLI flags passed by the user.
- \`process.exit(code)\`: Terminate execution (0 = success, 1+ = failure).
- \`process.memoryUsage()\`: Inspect heap used, heap total, and RSS (Resident Set Size).
    `,
    conceptKeyPoints: [
      'Every Node file is secretly wrapped in a module wrapper function.',
      'process.argv[0] is the node executable path; process.argv[1] is the script path; argv[2+] are user flags.',
      'process.memoryUsage() provides real-time byte counts of V8 heap and native memory.'
    ],
    codeExample: `// Inspecting the Process Bridge
console.log('Node Version:', process.version);
console.log('Platform OS:', process.platform);
console.log('Current File:', __filename);

// Memory in Megabytes
const mem = process.memoryUsage();
console.log('Heap Used (MB):', (mem.heapUsed / 1024 / 1024).toFixed(2));`,
    trial: {
      challengeTitle: 'Trial 02: Zero-Dependency CLI Flag Parser',
      description: 'Implement `parseArgs(argv)` that converts arguments like `["--port=3000", "--host=localhost", "--debug"]` into an object `{ port: "3000", host: "localhost", debug: true }`.',
      starterCode: `function parseArgs(args) {
  const result = {};
  // TODO: Parse flags starting with '--'
  // Handle key=value as string, and standalone flags as boolean true
  return result;
}

const mockArgs = ["--port=8080", "--host=0.0.0.0", "--verbose"];
console.log(parseArgs(mockArgs));`,
      solutionCode: `function parseArgs(args) {
  const result = {};
  for (const arg of args) {
    if (arg.startsWith('--')) {
      const stripped = arg.slice(2);
      if (stripped.includes('=')) {
        const [key, val] = stripped.split('=');
        result[key] = val;
      } else {
        result[stripped] = true;
      }
    }
  }
  return result;
}

const mockArgs = ["--port=8080", "--host=0.0.0.0", "--verbose"];
console.log(parseArgs(mockArgs));`,
      testAssertion: 'parseArgs(["--port=8080", "--verbose"]) must return { port: "8080", verbose: true }',
      firstPrinciplesQuestion: 'Why does process.argv include 2 default arguments before any user-typed flags?'
    }
  },
  {
    id: '03-commonjs-vs-esm',
    tier: 1,
    tierName: 'TIER 1: NOVICE HACKER',
    title: 'Mission 03: CommonJS vs ESM & The Circular Trap',
    hook: 'File A requires File B, and File B requires File A. Does Node crash into an infinite loop or return an empty object?',
    summary: 'Understand module resolution, require.cache, and how CommonJS copies values while ESM maintains live bindings.',
    explanation: `
Node.js historically used **CommonJS (CJS)** (\`require\` and \`module.exports\`). Modern Node also supports **ECMAScript Modules (ESM)** (\`import\` and \`export\`).

Key differences:
1. **Loading Mechanics**:
   - CJS is **synchronous**: \`require()\` pauses execution, executes the file, and caches the result in \`require.cache\`.
   - ESM is **asynchronous & static**: The entire dependency graph is parsed and resolved *before* any code runs.
2. **Values vs Live Bindings**:
   - CJS exports a **copy** of primitive values.
   - ESM exports a **live binding (reference)**: If module A changes its exported variable, module B sees the updated value immediately!
3. **Circular Dependencies**:
   - In CJS, if module A requires B while A is still executing, B gets an **incomplete, partially loaded exports object** of A!
    `,
    conceptKeyPoints: [
      'CommonJS require() evaluates synchronously and caches in require.cache.',
      'ESM import is parsed statically with live references.',
      'Circular dependencies in CommonJS return incomplete exports without crashing.'
    ],
    codeExample: `// How require caching works under the hood
const fakeCache = {};

function fakeRequire(modulePath) {
  if (fakeCache[modulePath]) {
    return fakeCache[modulePath].exports; // Return cached!
  }
  const module = { exports: {} };
  fakeCache[modulePath] = module;
  // Module code populates module.exports here
  return module.exports;
}`,
    trial: {
      challengeTitle: 'Trial 03: The Cache Buster',
      description: 'Implement a function `bustCacheAndRequire(cache, moduleName, loaderFn)` that deletes the cached module before loading, ensuring fresh execution every time.',
      starterCode: `function bustCacheAndRequire(cache, moduleName, loaderFn) {
  // TODO: If moduleName is in cache, delete it first
  // Then execute loaderFn(), store in cache, and return the result
}

const mockCache = { 'config': { exports: { version: '1.0.0' } } };
console.log('Old cache:', mockCache['config'].exports.version);`,
      solutionCode: `function bustCacheAndRequire(cache, moduleName, loaderFn) {
  if (cache[moduleName]) {
    delete cache[moduleName];
  }
  const newExports = loaderFn();
  cache[moduleName] = { exports: newExports };
  return newExports;
}

const mockCache = { 'config': { exports: { version: '1.0.0' } } };
const updated = bustCacheAndRequire(mockCache, 'config', () => ({ version: '2.0.0' }));
console.log('Updated cache exports:', updated.version);`,
      testAssertion: 'bustCacheAndRequire should clear old cache entry and return new exports.',
      firstPrinciplesQuestion: 'Why can you use require() inside an if-statement in CommonJS, but cannot use static import inside an if-statement in ESM?'
    }
  },
  {
    id: '04-error-first-callbacks',
    tier: 1,
    tierName: 'TIER 1: NOVICE HACKER',
    title: 'Mission 04: Asynchronous Roots & Error-First Callbacks',
    hook: 'Why does a try/catch block completely fail to catch an error thrown inside a setTimeout or fs.readFile?',
    summary: 'Understand the Call Stack boundary: why asynchronous errors cannot be caught with synchronous try/catch, and the error-first convention.',
    explanation: `
When JavaScript runs, it places functions onto the **Call Stack**.
When you do:
\`\`\`js
try {
  setTimeout(() => {
    throw new Error('Explosion!');
  }, 100);
} catch (err) {
  console.log('Caught!'); // NEVER REACHED!
}
\`\`\`
Why did it fail? Because 100 milliseconds later, when the callback runs, the \`try/catch\` block has **already finished and vanished from the Call Stack**!

To solve this before Promises existed, Node established the **Error-First Callback Convention**:
- Signature: \`function callback(err, data) { ... }\`
- Rule 1: Always check \`if (err) return handle(err);\` before touching data.
- Rule 2: Never throw errors inside async callbacks unless you want to crash the whole process.
    `,
    conceptKeyPoints: [
      'Async callbacks run on a fresh Call Stack tick after the originating function returns.',
      'Synchronous try/catch cannot catch errors from deferred ticks.',
      'Node error-first pattern mandates error as argument #1.'
    ],
    codeExample: `// Classic Error-First Callback Pattern
function readSecretFile(filename, callback) {
  setTimeout(() => {
    if (filename === 'forbidden.key') {
      return callback(new Error('EACCES: Permission denied'));
    }
    callback(null, 'AUTHENTICATION_TOKEN_99823');
  }, 50);
}

readSecretFile('forbidden.key', (err, data) => {
  if (err) {
    console.error('Handled safely:', err.message);
    return;
  }
  console.log('Data:', data);
});`,
    trial: {
      challengeTitle: 'Trial 04: Build util.promisify From Scratch',
      description: 'Implement a function `myPromisify(fn)` that converts any error-first callback function into a Promise-returning function.',
      starterCode: `function myPromisify(fn) {
  // TODO: Return a function that returns a new Promise
  // Call fn with args and an (err, result) callback
  return function (...args) {
    // ...
  };
}

// Test function
function fetchUser(id, cb) {
  if (id <= 0) cb(new Error("Invalid ID"));
  else cb(null, { id, name: "Neo" });
}`,
      solutionCode: `function myPromisify(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  };
}

function fetchUser(id, cb) {
  if (id <= 0) cb(new Error("Invalid ID"));
  else cb(null, { id, name: "Neo" });
}

const fetchUserPromise = myPromisify(fetchUser);
fetchUserPromise(1).then(u => console.log('Promisified user:', u.name));`,
      testAssertion: 'myPromisify(fn) should resolve with data when err is null, and reject when err is truthy.',
      firstPrinciplesQuestion: 'What would happen if an async callback forgot to return after calling callback(err)?'
    }
  },

  // --- TIER 2: DAEMON ENGINEER ---
  {
    id: '05-promises-microtasks',
    tier: 2,
    tierName: 'TIER 2: DAEMON ENGINEER',
    title: 'Mission 05: Promises, Microtasks & Unhandled Rejections',
    hook: 'Why did an unhandled Promise rejection crash a billion-dollar production server?',
    summary: 'Dive into the Microtask Queue, Promise resolution state machines, and fail-safe async patterns.',
    explanation: `
A Promise is a state machine with three states: **Pending**, **Fulfilled**, or **Rejected**.

When a Promise resolves or rejects:
- Its \`.then()\` or \`.catch()\` callback is placed onto the **Promise Microtask Queue**.
- In modern Node (Node 15+), an unhandled rejected promise triggers an \`unhandledRejection\` event. If no listener intercepts it, Node **terminates the entire process** with exit code 1 to prevent corrupt state!

Handling multiple Promises:
- \`Promise.all()\`: Fail-fast. If 1 fails, all fail immediately.
- \`Promise.allSettled()\`: Bulletproof. Waits for all promises to either fulfill or reject, returning an array of status objects.
    `,
    conceptKeyPoints: [
      'Promise callbacks execute in the Microtask Queue, before any subsequent macrotask.',
      'Unhandled rejections crash modern Node.js processes by default.',
      'Promise.allSettled avoids fail-fast cascading crashes in batch workflows.'
    ],
    codeExample: `// Promise.all vs Promise.allSettled
const p1 = Promise.resolve('DB Connect OK');
const p2 = Promise.reject(new Error('Cache Offline'));

Promise.allSettled([p1, p2]).then((results) => {
  results.forEach((res, i) => {
    if (res.status === 'fulfilled') console.log(\`Task \${i}: \${res.value}\`);
    else console.error(\`Task \${i} Failed: \${res.reason.message}\`);
  });
});`,
    trial: {
      challengeTitle: 'Trial 05: Resilient Concurrent Task Pool',
      description: 'Implement `runWithConcurrency(tasks, limit)` where `tasks` is an array of zero-arg async functions, running at most `limit` tasks in parallel, returning all results.',
      starterCode: `async function runWithConcurrency(tasks, limit) {
  const results = [];
  // TODO: Execute tasks with a maximum concurrency of 'limit'
  // Collect all outputs into results array in index order
  return results;
}`,
      solutionCode: `async function runWithConcurrency(tasks, limit) {
  const results = new Array(tasks.length);
  let currentIndex = 0;

  async function worker() {
    while (currentIndex < tasks.length) {
      const idx = currentIndex++;
      try {
        results[idx] = await tasks[idx]();
      } catch (err) {
        results[idx] = err;
      }
    }
  }

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

const mockTasks = [
  () => Promise.resolve('A'),
  () => Promise.resolve('B'),
  () => Promise.resolve('C')
];
runWithConcurrency(mockTasks, 2).then(res => console.log('Pooled results:', res));`,
      testAssertion: 'runWithConcurrency must run tasks concurrently up to limit and return all results in original order.',
      firstPrinciplesQuestion: 'Why does Promise.all([p1, p2]) not stop p2 from executing if p1 rejects first?'
    }
  },
  {
    id: '06-event-emitter-internals',
    tier: 2,
    tierName: 'TIER 2: DAEMON ENGINEER',
    title: 'Mission 06: EventEmitter Internals & Memory Alarms',
    hook: 'MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 listeners added. What triggered this?',
    summary: 'Inspect the pub/sub backbone of Node.js: synchronous handler dispatch, once() wrappers, and memory leak tracking.',
    explanation: `
Nearly all core Node modules (HTTP servers, TCP sockets, Streams, Child Processes) inherit from **\`EventEmitter\`**.

Crucial facts developers miss:
1. **\`emit()\` is 100% SYNCHRONOUS!**:
   When you call \`emitter.emit('event')\`, all registered listener functions are executed **immediately, one by one, on the current Call Stack tick**.
2. **The 10-Listener Alarm**:
   By default, EventEmitter warns if more than 10 listeners are attached to a single event (\`setMaxListeners(n)\`). Why? Because in long-running servers, forgetting to unsubscribe listeners from a singleton is the #1 cause of Node memory leaks!
3. **Special 'error' Event**:
   If an EventEmitter emits an \`'error'\` event and no listener is registered for \`'error'\`, Node **throws an uncaught exception** and crashes the process!
    `,
    conceptKeyPoints: [
      'EventEmitter.emit() executes handlers synchronously in registration order.',
      'An unhandled \'error\' event causes a fatal process crash.',
      'MaxListeners warning guards against dangling listener memory leaks.'
    ],
    codeExample: `import { EventEmitter } from 'node:events';

const server = new EventEmitter();
// Register listener
server.on('request', (ip) => console.log('Request from:', ip));

// Must ALWAYS handle 'error' events
server.on('error', (err) => console.error('Caught server error:', err.message));

server.emit('request', '192.168.1.1');
server.emit('error', new Error('Port collision'));`,
    trial: {
      challengeTitle: 'Trial 06: TinyEventEmitter from Scratch',
      description: 'Build a class `TinyEventEmitter` with `on(event, fn)`, `emit(event, ...args)`, and `once(event, fn)` methods from scratch without importing node:events.',
      starterCode: `class TinyEventEmitter {
  constructor() {
    this.events = {};
  }
  on(event, fn) {
    // TODO: Register listener
  }
  emit(event, ...args) {
    // TODO: Execute listeners synchronously
  }
  once(event, fn) {
    // TODO: Execute once and self-remove
  }
}`,
      solutionCode: `class TinyEventEmitter {
  constructor() {
    this.events = {};
  }
  on(event, fn) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(fn);
  }
  emit(event, ...args) {
    if (!this.events[event]) return false;
    // Slice copy so once() mutations during emit don't skip elements
    const listeners = [...this.events[event]];
    for (const fn of listeners) {
      fn(...args);
    }
    return true;
  }
  once(event, fn) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      fn(...args);
    };
    this.on(event, wrapper);
  }
  off(event, fn) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== fn);
  }
}

const emitter = new TinyEventEmitter();
emitter.once('greet', (name) => console.log('Hello', name));
emitter.emit('greet', 'Alice');
emitter.emit('greet', 'Bob'); // Should not log`,
      testAssertion: 'TinyEventEmitter once() listener must fire on first emit and be removed for subsequent emits.',
      firstPrinciplesQuestion: 'Why must emit() copy the listeners array before looping over it?'
    }
  },
  {
    id: '07-raw-binary-buffers',
    tier: 2,
    tierName: 'TIER 2: DAEMON ENGINEER',
    title: 'Mission 07: Raw Binary Buffers & Unsafe Memory Leaks',
    hook: 'Why did Buffer.allocUnsafe(1024) accidentally reveal a plaintext database password in RAM?',
    summary: 'Master raw memory outside the V8 heap: byte offsets, encoding conversions, and buffer security.',
    explanation: `
JavaScript in the browser historically only dealt with strings. But servers must handle raw binary data: TCP packets, PNG images, encrypted TLS streams, and file bytes.

Node introduced **\`Buffer\`**: a chunk of raw memory allocated outside the V8 heap in C++.

Allocation methods:
- \`Buffer.alloc(size)\`: Allocates \`size\` bytes and **zeros out** all bits. Safe, but slightly slower.
- \`Buffer.allocUnsafe(size)\`: Allocates \`size\` bytes from Node\'s pre-allocated memory pool **WITHOUT zeroing it out**. It contains whatever stale bytes were previously in that physical RAM location! If sent to a client, it can leak passwords, tokens, or encryption keys!
- \`Buffer.from(data, encoding)\`: Creates a buffer from a string, array, or ArrayBuffer.
    `,
    conceptKeyPoints: [
      'Buffers represent raw fixed-length binary memory outside V8\'s JS heap.',
      'Buffer.allocUnsafe does NOT clear memory: security hazard if exposed.',
      'Buffer.byteLength("hello", "utf8") is NOT equal to string.length for multi-byte Unicode.'
    ],
    codeExample: `// Unicode length vs Byte length
const emoji = '⚡';
console.log('String length:', emoji.length); // 1 character
const buf = Buffer.from(emoji, 'utf8');
console.log('Byte length:', buf.byteLength); // 3 bytes! (0xE2, 0x9A, 0xA1)
console.log('Hex representation:', buf.toString('hex'));`,
    trial: {
      challengeTitle: 'Trial 07: Binary Packet Header Parser',
      description: 'Write `parseHeader(buffer)` to decode a 6-byte binary header: 2 bytes magic number (must equal 0xCAFE), 2 bytes payload length, 2 bytes packet type (all big-endian). Return `{ valid: boolean, length: number, type: number }`.',
      starterCode: `function parseHeader(buf) {
  // TODO: Use buffer.readUInt16BE at offsets 0, 2, and 4
  return { valid: false, length: 0, type: 0 };
}

// 0xCAFE (51966), length 128 (0x0080), type 1 (0x0001)
const packet = Buffer.from([0xCA, 0xFE, 0x00, 0x80, 0x00, 0x01]);
console.log(parseHeader(packet));`,
      solutionCode: `function parseHeader(buf) {
  if (buf.length < 6) return { valid: false, length: 0, type: 0 };
  const magic = buf.readUInt16BE(0);
  const length = buf.readUInt16BE(2);
  const type = buf.readUInt16BE(4);
  return {
    valid: magic === 0xCAFE,
    length,
    type
  };
}

const packet = Buffer.from([0xCA, 0xFE, 0x00, 0x80, 0x00, 0x01]);
console.log(parseHeader(packet));`,
      testAssertion: 'parseHeader on [0xCA, 0xFE, 0x00, 0x80, 0x00, 0x01] must return { valid: true, length: 128, type: 1 }.',
      firstPrinciplesQuestion: 'What is the difference between Big-Endian (BE) and Little-Endian (LE) byte ordering in raw buffers?'
    }
  },
  {
    id: '08-filesystem-descriptors',
    tier: 2,
    tierName: 'TIER 2: DAEMON ENGINEER',
    title: 'Mission 08: File System & File Descriptors',
    hook: 'What causes the dreaded "EMFILE: too many open files" error, and how do you prevent file corruption?',
    summary: 'Understand File Descriptors (FD), streaming vs buffering files, and atomic file replacement patterns.',
    explanation: `
When an operating system opens a file or network socket, it assigns an integer identifier called a **File Descriptor (FD)** to the process\'s file table.
OS kernels enforce strict limits on how many FDs a process can hold simultaneously (often 1024 or 4096 by default).

Best practices for file handling:
1. **Never use \`fs.readFile\` for large files**: It buffers the entire file into V8 memory at once. If the file is 1GB, Node consumes 1GB+ of RAM. Use \`fs.createReadStream\` instead!
2. **Always close FDs**: If you use low-level \`fs.open\`, you must call \`fs.close(fd)\` in a \`finally\` block, or your server will leak FDs until it crashes with \`EMFILE\`.
3. **Atomic File Writes**: Writing directly to a file can corrupt it if the process crashes mid-write. Standard pattern: write to \`file.tmp\`, then atomically swap with \`fs.rename\`.
    `,
    conceptKeyPoints: [
      'File Descriptors are OS kernel integer handles.',
      'fs.promises provides clean async/await file operations.',
      'Atomic writes via write-to-temp + rename protect against partial corruption.'
    ],
    codeExample: `// Modern fs/promises pattern
import fs from 'node:fs/promises';

async function safeWriteConfig(filepath, data) {
  const tempPath = \`\${filepath}.\${Date.now()}.tmp\`;
  // Step 1: Write to temporary file
  await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf8');
  // Step 2: Atomic rename (instantaneous pointer swap in OS file system)
  await fs.rename(tempPath, filepath);
  console.log('Atomic write completed safely.');
}`,
    trial: {
      challengeTitle: 'Trial 08: File Content Stream Word Counter',
      description: 'Implement `countWordsInChunks(chunks)` where chunks is an array of strings representing stream chunks, returning the total word count even if words are split across chunk boundaries.',
      starterCode: `function countWordsInChunks(chunks) {
  // TODO: Count words in streaming chunks
  // Beware: A word like "cat" might be split as "ca" in chunk 1 and "t" in chunk 2!
  return 0;
}

const mockChunks = ["Hello wo", "rld this is a", " stream"];
console.log('Words:', countWordsInChunks(mockChunks));`,
      solutionCode: `function countWordsInChunks(chunks) {
  let leftover = '';
  let count = 0;

  for (let i = 0; i < chunks.length; i++) {
    const text = leftover + chunks[i];
    const isLast = i === chunks.length - 1;

    if (isLast) {
      const words = text.trim().split(/\\s+/).filter(Boolean);
      count += words.length;
    } else {
      const lastSpaceIndex = text.lastIndexOf(' ');
      if (lastSpaceIndex !== -1) {
        const completeText = text.slice(0, lastSpaceIndex);
        leftover = text.slice(lastSpaceIndex + 1);
        const words = completeText.trim().split(/\\s+/).filter(Boolean);
        count += words.length;
      } else {
        leftover = text;
      }
    }
  }
  return count;
}

const mockChunks = ["Hello wo", "rld this is a", " stream"];
console.log('Words:', countWordsInChunks(mockChunks));`,
      testAssertion: 'countWordsInChunks(["Hello wo", "rld this is a", " stream"]) must return 5.',
      firstPrinciplesQuestion: 'Why is fs.rename considered atomic on the same filesystem volume, but not across different mounted hard drives?'
    }
  },
  {
    id: '09-tcp-http-sockets',
    tier: 2,
    tierName: 'TIER 2: DAEMON ENGINEER',
    title: 'Mission 09: Networking: TCP Sockets & HTTP Plumbing',
    hook: 'What does an HTTP request actually look like when stripped of all framework abstractions?',
    summary: 'Build from the raw metal: TCP sockets with the net module, HTTP headers, chunked transfer encoding, and Keep-Alive.',
    explanation: `
All web traffic travels over TCP connections.
In Node.js, the **\`net\`** module gives you direct access to raw TCP streams. The **\`http\`** module is simply a layer on top of \`net\` that uses the high-performance C parser (\`llhttp\`) to turn raw text bytes into \`IncomingMessage\` and \`ServerResponse\` objects.

An HTTP/1.1 request is pure ASCII text:
\`\`\`http
GET /api/status HTTP/1.1\\r\\n
Host: localhost:8080\\r\\n
Connection: keep-alive\\r\\n
\\r\\n
\`\`\`
Notice the double carriage-return newline (\`\\r\\n\\r\\n\`). That is the universal delimiter signaling the end of HTTP headers!
    `,
    conceptKeyPoints: [
      'The net module provides raw TCP client/server streams.',
      'HTTP/1.1 headers are terminated by \\r\\n\\r\\n.',
      'Keep-Alive reuses the underlying TCP socket for multiple HTTP requests, saving SSL/TLS handshake latency.'
    ],
    codeExample: `import net from 'node:net';

// A minimal raw TCP Echo Server
const server = net.createServer((socket) => {
  console.log('Client connected:', socket.remoteAddress);
  socket.write('CYBER_TERMINAL_V1 ONLINE\\r\\n');

  socket.on('data', (data) => {
    // Echo back the received bytes
    socket.write('ACK: ' + data);
  });
});

// server.listen(4000);`,
    trial: {
      challengeTitle: 'Trial 09: Raw HTTP Request Parser',
      description: 'Implement `parseRawHttpRequest(rawString)` that parses raw HTTP text and returns `{ method, path, httpVersion, headers }`.',
      starterCode: `function parseRawHttpRequest(raw) {
  // TODO: Split on \\r\\n\\r\\n to separate headers from body
  // Parse request line: METHOD PATH VERSION
  // Parse header lines into an object
  return null;
}

const rawHttp = "GET /v1/status HTTP/1.1\\r\\nHost: api.cyber.local\\r\\nUser-Agent: Terminal\\r\\n\\r\\n";
console.log(parseRawHttpRequest(rawHttp));`,
      solutionCode: `function parseRawHttpRequest(raw) {
  const [headerSection] = raw.split('\\r\\n\\r\\n');
  const lines = headerSection.split('\\r\\n');
  const [method, path, httpVersion] = lines[0].split(' ');

  const headers = {};
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i]) continue;
    const colonIdx = lines[i].indexOf(':');
    if (colonIdx !== -1) {
      const key = lines[i].slice(0, colonIdx).trim().toLowerCase();
      const val = lines[i].slice(colonIdx + 1).trim();
      headers[key] = val;
    }
  }

  return { method, path, httpVersion, headers };
}

const rawHttp = "GET /v1/status HTTP/1.1\\r\\nHost: api.cyber.local\\r\\nUser-Agent: Terminal\\r\\n\\r\\n";
console.log(parseRawHttpRequest(rawHttp));`,
      testAssertion: 'parseRawHttpRequest must return { method: "GET", path: "/v1/status", httpVersion: "HTTP/1.1", headers: { host: "api.cyber.local", "user-agent": "Terminal" } }.',
      firstPrinciplesQuestion: 'Why does HTTP/1.1 specify headers are case-insensitive?'
    }
  },

  // --- TIER 3: CORE ARCHITECT ---
  {
    id: '10-reactor-pattern-deep',
    tier: 3,
    tierName: 'TIER 3: CORE ARCHITECT',
    title: 'Mission 10: The Reactor Pattern & Libuv Demultiplexing',
    hook: 'How can an OS notify a single process that 50,000 different connections have new data without polling each one in a loop?',
    summary: 'Master the architectural foundation of Node.js: synchronous event demultiplexing via epoll, kqueue, and IOCP.',
    explanation: `
Before asynchronous event loops existed, servers used either:
1. **Thread-per-connection**: 10,000 threads = 10GB+ of RAM and catastrophic CPU thrashing.
2. **Busy Polling**: Looping over 10,000 sockets checking \`hasData()\` = 100% CPU usage doing useless checks.

The **Reactor Pattern** delegates polling to the OS Kernel:
- Modern OS kernels have event notification systems: **\`epoll\`** on Linux, **\`kqueue\`** on macOS/BSD, and **\`IOCP\`** on Windows.
- The kernel suspends the Node process until at least one registered socket is ready.
- The kernel wakes up Node and hands it an array of ONLY the sockets that are active.
- Libuv dispatches the registered JavaScript callbacks in sequence.
    `,
    conceptKeyPoints: [
      'The Reactor Pattern eliminates thread-per-request and busy-waiting.',
      'Libuv provides a unified C abstraction over epoll, kqueue, and IOCP.',
      'I/O readiness checking occurs in the kernel with zero userland CPU cost.'
    ],
    codeExample: `// Conceptual Reactor Loop in Libuv
/*
while (loop_is_alive) {
  // Step 1: Update timer deadlines
  uv__update_time(loop);
  
  // Step 2: Run expired timers
  uv__run_timers(loop);
  
  // Step 3: Run pending I/O callbacks
  uv__run_pending(loop);
  
  // Step 4: Poll OS demultiplexer (epoll_wait)
  uv__io_poll(loop, timeout);
  
  // Step 5: Run setImmediate (check phase)
  uv__run_check(loop);
}
*/`,
    trial: {
      challengeTitle: 'Trial 10: Event Reactor Simulation',
      description: 'Implement a miniature synchronous event reactor `MiniReactor` with `register(fd, event, handler)` and `dispatch(readyFds)`.',
      starterCode: `class MiniReactor {
  constructor() {
    this.handlers = new Map();
  }
  register(fd, event, handler) {
    // TODO: Register handler for a file descriptor & event
  }
  dispatch(activeEvents) {
    // TODO: For each { fd, event, data } in activeEvents, call handler
  }
}`,
      solutionCode: `class MiniReactor {
  constructor() {
    this.handlers = new Map();
  }
  register(fd, event, handler) {
    const key = \`\${fd}:\${event}\`;
    this.handlers.set(key, handler);
  }
  dispatch(activeEvents) {
    const dispatched = [];
    for (const { fd, event, data } of activeEvents) {
      const key = \`\${fd}:\${event}\`;
      const handler = this.handlers.get(key);
      if (handler) {
        handler(data);
        dispatched.push(key);
      }
    }
    return dispatched;
  }
}

const reactor = new MiniReactor();
reactor.register(3, 'READ', (data) => console.log('Read on FD 3:', data));
reactor.dispatch([{ fd: 3, event: 'READ', data: 'HELLO_PACKET' }]);`,
      testAssertion: 'MiniReactor dispatch must invoke correct handler for registered fd & event.',
      firstPrinciplesQuestion: 'Why is epoll O(1) in Linux while the older select() system call was O(N)?'
    }
  },
  {
    id: '11-event-loop-six-phases',
    tier: 3,
    tierName: 'TIER 3: CORE ARCHITECT',
    title: 'Mission 11: The 6 Event Loop Phases & Microtasks',
    hook: 'Why does setImmediate execute before setTimeout(fn, 0) inside an I/O callback, but the order is reversed or random in the main file?',
    summary: 'Master the 6 Macrotask phases and the microtask drain hierarchy. Predict exact execution order with 100% precision.',
    explanation: `
The Libuv Event Loop executes in 6 distinct phases in strict sequential order:
1. **Timers**: Executes callbacks scheduled by \`setTimeout\` and \`setInterval\`.
2. **Pending Callbacks**: Executes I/O callbacks deferred to the next loop iteration (e.g., TCP socket connection failures).
3. **Idle, Prepare**: Used internally by Libuv.
4. **Poll**: Retrieves new I/O events from the OS; executes almost all I/O callbacks (files, HTTP, network); calculates how long to sleep if queues are empty.
5. **Check**: Executes callbacks scheduled by \`setImmediate()\`.
6. **Close Callbacks**: Executes cleanup callbacks (e.g., \`socket.on('close')\`).

**The Microtask Rule**:
Between EVERY callback in ANY phase, Node drains:
1. The **\`process.nextTick\` Queue**
2. The **Promise Microtask Queue**
    `,
    conceptKeyPoints: [
      'The 6 phases: Timers -> Pending -> Idle -> Poll -> Check -> Close.',
      'setImmediate runs in the Check phase, directly after the Poll phase.',
      'Inside an fs or network callback (Poll phase), setImmediate ALWAYS runs before setTimeout(0).'
    ],
    codeExample: `// Inside I/O callback: setImmediate ALWAYS beats setTimeout!
import fs from 'node:fs';

fs.readFile(__filename, () => {
  setTimeout(() => console.log('Timer (Phase 1)'), 0);
  setImmediate(() => console.log('Check setImmediate (Phase 5)'));
  // Output guaranteed:
  // 1: Check setImmediate
  // 2: Timer
});`,
    trial: {
      challengeTitle: 'Trial 11: Execution Order Prediction Matrix',
      description: 'Given the code snippet below, calculate the exact array of numbers logged to console in order.',
      starterCode: `function getPredictedOrder() {
  // Code being analyzed:
  // console.log(1);
  // setTimeout(() => console.log(2), 0);
  // Promise.resolve().then(() => console.log(3));
  // process.nextTick(() => console.log(4));
  // setImmediate(() => console.log(5));
  // console.log(6);
  
  // Return the predicted array of numbers in execution order:
  return [];
}`,
      solutionCode: `function getPredictedOrder() {
  // Explanation:
  // 1 & 6: Synchronous main script runs first.
  // 4: process.nextTick runs immediately after sync code.
  // 3: Promise microtask runs after nextTick queue is empty.
  // 2: Timers phase runs expired setTimeout(0).
  // 5: Check phase runs setImmediate.
  return [1, 6, 4, 3, 2, 5];
}

console.log('Predicted order:', getPredictedOrder());`,
      testAssertion: 'getPredictedOrder must return [1, 6, 4, 3, 2, 5].',
      firstPrinciplesQuestion: 'Why does recursive process.nextTick cause an infinite loop that starves I/O, while recursive setTimeout(0) does not?'
    }
  },
  {
    id: '12-streams-backpressure-deep',
    tier: 3,
    tierName: 'TIER 3: CORE ARCHITECT',
    title: 'Mission 12: Stream Mechanics & The Backpressure Theorem',
    hook: 'A developer piped a 2GB video file to a slow mobile user. Why did the server consume 2GB of RAM and crash?',
    summary: 'Master the 4 stream types (Readable, Writable, Duplex, Transform), highWaterMark, and the drain event.',
    explanation: `
When you read data faster than you can write it, chunks accumulate in RAM.
The **Backpressure Theorem** states that without an upstream throttle, queue size approaches infinity.

In Node.js:
- Every writable stream has a buffer limit: \`highWaterMark\` (default 16KB for bytes, 16 objects for objectMode).
- \`writable.write(chunk)\` returns **\`false\`** when the buffer exceeds \`highWaterMark\`.
- This is the **Backpressure Signal**: the reader MUST stop reading (\`readable.pause()\`).
- Once the writable flushes the buffer to the OS socket or disk, it emits the **\`'drain'\`** event.
- Upon receiving \`'drain'\`, the reader calls \`readable.resume()\`.
    `,
    conceptKeyPoints: [
      'Streams process data incrementally in chunks, keeping memory footprint constant.',
      'write() returning false is the fundamental backpressure alarm.',
      'stream.pipeline() automatically handles backpressure and cleans up on error.'
    ],
    codeExample: `import { Transform } from 'node:stream';

// Custom Transform Stream: UpperCase with backpressure support
const upperCaseStream = new Transform({
  transform(chunk, encoding, callback) {
    const uppercased = chunk.toString().toUpperCase();
    this.push(uppercased);
    callback(); // Ready for next chunk
  }
});`,
    trial: {
      challengeTitle: 'Trial 12: Backpressure-Aware Data Pump',
      description: 'Implement `safePump(chunks, destinationSink)` where chunks is an array of strings. Call `destinationSink.write(chunk)`. If write returns false, wait for `destinationSink.once("drain")` before continuing.',
      starterCode: `async function safePump(chunks, destinationSink) {
  let writesPaused = 0;
  // TODO: Loop through chunks
  // If destinationSink.write(chunk) === false, increment writesPaused and await drain event!
  return writesPaused;
}`,
      solutionCode: `async function safePump(chunks, destinationSink) {
  let writesPaused = 0;
  for (const chunk of chunks) {
    const canContinue = destinationSink.write(chunk);
    if (!canContinue) {
      writesPaused++;
      await new Promise((resolve) => destinationSink.once('drain', resolve));
    }
  }
  return writesPaused;
}

// Mock sink for test
class MockSink {
  constructor(limit) {
    this.limit = limit;
    this.buffer = [];
    this.listeners = {};
  }
  write(chunk) {
    this.buffer.push(chunk);
    if (this.buffer.length >= this.limit) {
      setTimeout(() => {
        this.buffer = [];
        if (this.listeners['drain']) this.listeners['drain']();
      }, 20);
      return false; // Backpressure triggered!
    }
    return true;
  }
  once(event, fn) {
    this.listeners[event] = fn;
  }
}

const sink = new MockSink(2);
safePump(['a', 'b', 'c', 'd'], sink).then(pauses => console.log('Times paused:', pauses));`,
      testAssertion: 'safePump must pause and await drain when write returns false.',
      firstPrinciplesQuestion: 'Why should you almost never use stream.pipe() in modern production code, and use stream.pipeline() instead?'
    }
  },
  {
    id: '13-child-processes-ipc',
    tier: 3,
    tierName: 'TIER 3: CORE ARCHITECT',
    title: 'Mission 13: Child Processes & IPC Plumbing',
    hook: 'Why did child_process.exec crash with "maxBuffer exceeded" on a 2MB command output, while spawn handled 50GB effortlessly?',
    summary: 'Learn the differences between spawn, exec, execFile, and fork, and exchange messages over IPC channels.',
    explanation: `
Node provides 4 ways to launch external OS processes via the \`child_process\` module:
1. **\`spawn()\`**: Streams data via \`stdout\` and \`stderr\`. Ideal for long-running processes or massive output.
2. **\`exec()\`**: Spawns a shell, buffers the ENTIRE output into RAM, and passes it to a callback. Fails with \`ERR_CHILD_PROCESS_STDIO_MAXBUFFER\` if output exceeds 1MB! Vulnerable to shell injection.
3. **\`execFile()\`**: Runs an executable directly without invoking a shell (safer than \`exec\`).
4. **\`fork()\`**: Specialized \`spawn\` for creating **child Node.js processes** with an Inter-Process Communication (IPC) channel built in (\`process.send\` / \`process.on('message')\`).
    `,
    conceptKeyPoints: [
      'spawn streams stdio; exec buffers into memory (vulnerable to buffer overflows).',
      'fork creates child Node processes with built-in IPC channels.',
      'child_process.fork is distinct from the OS fork() system call.'
    ],
    codeExample: `// Parent process using fork to offload work
import { fork } from 'node:child_process';

const child = fork('./worker.js');

// Send message to child
child.send({ task: 'CALCULATE_HASH', payload: 'CYBER_PAYLOAD' });

// Receive result from child
child.on('message', (result) => {
  console.log('Result from child process:', result);
});`,
    trial: {
      challengeTitle: 'Trial 13: IPC Message Dispatcher',
      description: 'Implement a message router `createIpcRouter()` that registers action handlers and routes incoming `{ id, action, payload }` messages, returning a response `{ id, result }`.',
      starterCode: `function createIpcRouter() {
  const actions = {};
  return {
    register(action, fn) {
      actions[action] = fn;
    },
    async handle(msg) {
      // TODO: Call actions[msg.action](msg.payload)
      // Return { id: msg.id, result }
      return null;
    }
  };
}`,
      solutionCode: `function createIpcRouter() {
  const actions = {};
  return {
    register(action, fn) {
      actions[action] = fn;
    },
    async handle(msg) {
      if (!actions[msg.action]) {
        throw new Error(\`Unknown action: \${msg.action}\`);
      }
      const result = await actions[msg.action](msg.payload);
      return { id: msg.id, result };
    }
  };
}

const router = createIpcRouter();
router.register('PING', (payload) => \`PONG:\${payload}\`);
router.handle({ id: 'req_1', action: 'PING', payload: 'NEO' }).then(res => console.log(res));`,
      testAssertion: 'createIpcRouter must route action and return { id, result } correctly.',
      firstPrinciplesQuestion: 'Why does passing objects over IPC incur serialization/deserialization overhead?'
    }
  },
  {
    id: '14-crypto-redos-security',
    tier: 3,
    tierName: 'TIER 3: CORE ARCHITECT',
    title: 'Mission 14: Crypto, Timing Attacks & ReDoS Defense',
    hook: 'How can an attacker guess your secret auth token simply by measuring HTTP response latency in milliseconds?',
    summary: 'Prevent timing attacks with timingSafeEqual, defeat ReDoS catastrophic backtracking, and protect against prototype pollution.',
    explanation: `
Backend security requires understanding runtime execution characteristics:
1. **Timing Attacks**:
   Standard string comparison (\`a === b\`) exits at the first mismatched character. Comparing "pass" against "paaa" takes less CPU time than comparing against "pass". Attackers measure microseconds to deduce secrets character-by-character!
   Fix: Always use **\`crypto.timingSafeEqual(bufA, bufB)\`**.
2. **ReDoS (Regular Expression Denial of Service)**:
   Poorly written regex with nested quantifiers (e.g., \`/(a+)+$/\`) causes V8's regex engine to execute $O(2^n)$ backtracking steps. A 30-character string can lock the Node event loop for 10 minutes!
3. **Prototype Pollution**:
   Unsanitized recursive object merging can overwrite \`Object.prototype\`, injecting properties across all objects in the runtime.
    `,
    conceptKeyPoints: [
      'Standard string equality leaks character match information through execution time.',
      'crypto.timingSafeEqual runs in constant time regardless of where mismatches occur.',
      'Catastrophic backtracking in regex locks the single main thread indefinitely.'
    ],
    codeExample: `import crypto from 'node:crypto';

// Constant-Time Secret Verification
function verifyApiKey(userKey, actualKey) {
  const bufUser = Buffer.from(userKey);
  const bufActual = Buffer.from(actualKey);

  if (bufUser.length !== bufActual.length) return false;
  return crypto.timingSafeEqual(bufUser, bufActual);
}`,
    trial: {
      challengeTitle: 'Trial 14: Prototype Pollution Guard',
      description: 'Implement `safeDeepMerge(target, source)` that recursively merges objects while strictly blocking keys `__proto__`, `constructor`, and `prototype`.',
      starterCode: `function safeDeepMerge(target, source) {
  // TODO: Recursively merge source into target
  // CRITICAL: Throw an error or skip if key is "__proto__", "constructor", or "prototype"
  return target;
}`,
      solutionCode: `function safeDeepMerge(target, source) {
  const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

  for (const key of Object.keys(source)) {
    if (FORBIDDEN_KEYS.has(key)) {
      continue; // Block prototype pollution!
    }

    const sourceVal = source[key];
    if (sourceVal && typeof sourceVal === 'object' && !Array.isArray(sourceVal)) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
      }
      safeDeepMerge(target[key], sourceVal);
    } else {
      target[key] = sourceVal;
    }
  }
  return target;
}

const payload = JSON.parse('{"__proto__": {"admin": true}, "validKey": "ok"}');
const result = safeDeepMerge({}, payload);
console.log('Polluted:', ({}).admin); // Must be undefined!
console.log('Result:', result);`,
      testAssertion: 'safeDeepMerge must not mutate Object.prototype when encountering __proto__.',
      firstPrinciplesQuestion: 'Why does timingSafeEqual require both buffers to be of identical length?'
    }
  },

  // --- TIER 4: MATRIX MASTER ---
  {
    id: '15-worker-threads-atomics',
    tier: 4,
    tierName: 'TIER 4: MATRIX MASTER',
    title: 'Mission 15: Worker Threads, SharedArrayBuffer & Atomics',
    hook: 'How do you run heavy machine learning or cryptography in Node without dropping a single HTTP connection?',
    summary: 'True multi-threading in Node: V8 isolates, SharedArrayBuffer zero-copy memory, and lock-free concurrency with Atomics.',
    explanation: `
The **\`worker_threads\`** module allows you to run multiple JavaScript threads in parallel within the same process.
Unlike \`child_process\`, which spawns new OS processes with high memory overhead:
- Each Worker runs in its own **V8 Isolate** (independent V8 heap and event loop).
- Workers share the same process memory address space.
- You can share memory between threads **with zero serialization overhead** using **\`SharedArrayBuffer\`**!
- To prevent race conditions when multiple threads write to the same byte simultaneously, JavaScript provides the **\`Atomics\`** API (\`Atomics.add\`, \`Atomics.wait\`, \`Atomics.notify\`).
    `,
    conceptKeyPoints: [
      'Worker Threads provide true CPU parallelism with separate V8 isolates.',
      'SharedArrayBuffer allows zero-copy shared memory across threads.',
      'Atomics primitives prevent race conditions and torn reads/writes.'
    ],
    codeExample: `// Shared memory between main thread and worker
const sharedBuffer = new SharedArrayBuffer(4); // 4 bytes (32-bit int)
const sharedArray = new Int32Array(sharedBuffer);

// Thread-safe atomic increment across threads
Atomics.add(sharedArray, 0, 1);
console.log('Value atomically updated:', Atomics.load(sharedArray, 0));`,
    trial: {
      challengeTitle: 'Trial 15: Lock-Free Atomic Spinlock',
      description: 'Implement a miniature spinlock `CyberLock` using `Int32Array(new SharedArrayBuffer(4))` with methods `acquire()` and `release()` utilizing `Atomics.compareExchange`.',
      starterCode: `class CyberLock {
  constructor(sharedInt32Array) {
    this.state = sharedInt32Array; // 0 = unlocked, 1 = locked
  }
  acquire() {
    // TODO: Loop using Atomics.compareExchange(this.state, 0, 0, 1) until acquired!
  }
  release() {
    // TODO: Reset state to 0 using Atomics.store
  }
}`,
      solutionCode: `class CyberLock {
  constructor(sharedInt32Array) {
    this.state = sharedInt32Array;
  }
  acquire() {
    // Spin until compareExchange changes state from 0 to 1
    while (Atomics.compareExchange(this.state, 0, 0, 1) !== 0) {
      // In web workers you can use Atomics.wait; in spinlock we yield/spin
    }
    return true;
  }
  release() {
    Atomics.store(this.state, 0, 0);
    return true;
  }
}

const sab = new SharedArrayBuffer(4);
const state = new Int32Array(sab);
const lock = new CyberLock(state);

lock.acquire();
console.log('Lock held:', Atomics.load(state, 0)); // 1
lock.release();
console.log('Lock released:', Atomics.load(state, 0)); // 0`,
      testAssertion: 'CyberLock acquire sets state to 1 and release sets state to 0.',
      firstPrinciplesQuestion: 'Why does SharedArrayBuffer require Cross-Origin Isolation headers (COOP/COEP) in web browsers, but works natively in Node.js?'
    }
  },
  {
    id: '16-cluster-zero-downtime',
    tier: 4,
    tierName: 'TIER 4: MATRIX MASTER',
    title: 'Mission 16: Cluster Multi-Processing & Zero-Downtime',
    hook: 'How do production apps deploy new code without dropping a single active customer connection?',
    summary: 'Master the cluster module, master-worker process communication, OS socket sharing, and rolling updates.',
    explanation: `
A single Node.js process cannot utilize more than 1 CPU core. If you run a server on a 64-core machine, 63 cores remain idle!
The **\`cluster\`** module allows you to spawn $N$ worker processes (typically 1 per CPU core) that all listen on the identical network port.

**Zero-Downtime Rolling Deploy Algorithm**:
1. When a reload signal (\`SIGHUP\`) is received:
2. Master forks a new replacement worker with updated code.
3. Master waits for the new worker to emit the \`'listening'\` event.
4. Master sends \`worker.disconnect()\` to the oldest worker.
5. The old worker stops accepting *new* connections, finishes in-flight requests, and exits cleanly.
6. Repeat for all workers!
    `,
    conceptKeyPoints: [
      'Cluster scales Node across all available CPU cores.',
      'The primary process distributes incoming TCP connections via Round-Robin.',
      'Graceful disconnect enables zero-downtime rolling deployments.'
    ],
    codeExample: `import cluster from 'node:cluster';
import { availableParallelism } from 'node:os';

if (cluster.isPrimary) {
  const cores = availableParallelism();
  for (let i = 0; i < cores; i++) cluster.fork();

  cluster.on('exit', (worker, code) => {
    console.log(\`Worker \${worker.process.pid} died. Spawning replacement.\`);
    cluster.fork();
  });
}`,
    trial: {
      challengeTitle: 'Trial 16: Rolling Deploy Sequencer',
      description: 'Implement `rollingDeploy(workers, forkFn)` that iterates through worker IDs, spawns a new worker via `forkFn()`, and disconnects the old worker only after the new one is ready.',
      starterCode: `async function rollingDeploy(oldWorkers, spawnNewWorkerFn) {
  const newWorkers = [];
  // TODO: Sequentially replace each old worker:
  // 1. const newW = await spawnNewWorkerFn();
  // 2. oldWorker.disconnect();
  return newWorkers;
}`,
      solutionCode: `async function rollingDeploy(oldWorkers, spawnNewWorkerFn) {
  const newWorkers = [];
  for (const oldWorker of oldWorkers) {
    const newWorker = await spawnNewWorkerFn();
    newWorkers.push(newWorker);
    if (oldWorker && typeof oldWorker.disconnect === 'function') {
      oldWorker.disconnect();
    }
  }
  return newWorkers;
}

const mockOld = [{ id: 1, disconnect: () => console.log('Old 1 disconnected') }];
let idCounter = 10;
rollingDeploy(mockOld, async () => ({ id: ++idCounter, ready: true }))
  .then(res => console.log('Replaced workers:', res));`,
      testAssertion: 'rollingDeploy must spawn new worker before disconnecting old worker.',
      firstPrinciplesQuestion: 'Why does cluster.fork() use IPC handle passing instead of letting every worker independently bind to port 8080 on Linux?'
    }
  },
  {
    id: '17-async-local-storage',
    tier: 4,
    tierName: 'TIER 4: MATRIX MASTER',
    title: 'Mission 17: AsyncLocalStorage & Distributed Tracing',
    hook: 'How do you trace a request ID through 30 nested async functions and DB calls without passing it as an argument everywhere?',
    summary: 'Master AsyncLocalStorage and the async_hooks subsystem for transparent context propagation and distributed tracing.',
    explanation: `
In threaded languages like Java or C#, developers use **Thread-Local Storage (TLS)** to associate data with the current execution thread.
In Node.js, there is only one thread handling thousands of interleaved requests! A global variable would be overwritten by the next incoming request immediately.

Node introduced **\`AsyncLocalStorage\`** (built on top of \`async_hooks\`):
- It creates an asynchronous execution context that follows the execution chain across Promise resolutions, \`await\` keywords, \`setTimeout\`, and callbacks.
- \`asyncLocalStorage.run(store, callback)\`: Runs the callback inside a scoped context.
- Any function called anywhere inside that async tree can call \`asyncLocalStorage.getStore()\` to retrieve the exact context!
    `,
    conceptKeyPoints: [
      'AsyncLocalStorage provides continuation-local storage for Node async chains.',
      'Context propagates across promises, timers, and I/O callbacks automatically.',
      'Essential for distributed tracing, multi-tenant DB schemas, and APM logging.'
    ],
    codeExample: `import { AsyncLocalStorage } from 'node:async_hooks';

const als = new AsyncLocalStorage();

function logWithTrace(msg) {
  const traceId = als.getStore()?.traceId || 'NO_TRACE';
  console.log(\`[\${traceId}] \${msg}\`);
}

// Simulated incoming requests
als.run({ traceId: 'REQ_101' }, async () => {
  logWithTrace('Handling user auth');
  await new Promise(r => setTimeout(r, 50));
  logWithTrace('Database query completed'); // Still REQ_101!
});`,
    trial: {
      challengeTitle: 'Trial 17: Custom Context Propagator',
      description: 'Implement a miniature context runner `MiniContext` with `run(context, fn)` and `getContext()` using native AsyncLocalStorage.',
      starterCode: `import { AsyncLocalStorage } from 'node:async_hooks';

class MiniContext {
  constructor() {
    this.storage = new AsyncLocalStorage();
  }
  run(ctx, fn) {
    // TODO: Execute fn inside this.storage context
  }
  get() {
    // TODO: Return current store
  }
}`,
      solutionCode: `import { AsyncLocalStorage } from 'node:async_hooks';

class MiniContext {
  constructor() {
    this.storage = new AsyncLocalStorage();
  }
  run(ctx, fn) {
    return this.storage.run(ctx, fn);
  }
  get() {
    return this.storage.getStore();
  }
}

const context = new MiniContext();
context.run({ user: 'Neo' }, () => {
  console.log('Current user in context:', context.get().user);
});`,
      testAssertion: 'MiniContext must return correct store within run() callback.',
      firstPrinciplesQuestion: 'Why does AsyncLocalStorage introduce a slight CPU performance overhead compared to regular function parameter passing?'
    }
  },
  {
    id: '18-v8-memory-architecture',
    tier: 4,
    tierName: 'TIER 4: MATRIX MASTER',
    title: 'Mission 18: V8 Memory Architecture & Generational GC',
    hook: 'Why did an app allocating 1,000,000 short-lived objects run at 60 FPS, but allocating 10,000 long-lived objects caused 200ms latency spikes?',
    summary: 'Inspect the V8 heap: Young Generation (Nursery/Intermediate) Scavenge GC vs Old Generation Mark-Sweep-Compact.',
    explanation: `
V8 manages memory using the **Generational Hypothesis**: most objects die shortly after creation.

The Heap Structure:
1. **Young Generation (New Space)**:
   - Split into two semi-spaces: **From-Space** and **To-Space**.
   - Allocation is a fast pointer increment in the Nursery.
   - When full, **Scavenger GC** (Cheney's copying algorithm) runs: live objects are copied to To-Space, dead objects are ignored. Runs in 1-2 milliseconds!
   - Objects that survive 2 Scavenge cycles are promoted to **Old Space**.
2. **Old Generation (Old Space)**:
   - Holds long-lived objects.
   - Cleaned by **Major GC (Mark-Sweep-Compact)**: Tracing reachable object graphs, sweeping dead memory, and compacting fragmented pages. This causes the infamous "Stop-The-World" pauses.
    `,
    conceptKeyPoints: [
      'New Space uses Cheney\'s Scavenger algorithm: ultra-fast O(Live Objects) collection.',
      'Surviving objects promote to Old Space.',
      'Old Space Mark-Sweep-Compact GC causes visible Event Loop latency spikes.'
    ],
    codeExample: `// Allocation Churn Analysis
function analyzeAllocations() {
  const before = process.memoryUsage().heapUsed;
  
  // Allocate 100,000 short-lived objects (Young Gen Scavenge handles easily)
  for (let i = 0; i < 100000; i++) {
    const temp = { id: i, time: Date.now() };
  }
  
  const after = process.memoryUsage().heapUsed;
  console.log('Heap delta (bytes):', after - before);
}`,
    trial: {
      challengeTitle: 'Trial 18: Object Pool Allocation Optimizer',
      description: 'Implement an `ObjectPool` class that pre-allocates reusable objects to prevent garbage collection thrashing in high-frequency loops.',
      starterCode: `class ObjectPool {
  constructor(factoryFn, size) {
    this.factory = factoryFn;
    this.pool = [];
    // TODO: Pre-fill pool with 'size' instances
  }
  acquire() {
    // TODO: Return an object from pool or create if empty
  }
  release(obj) {
    // TODO: Put object back in pool
  }
}`,
      solutionCode: `class ObjectPool {
  constructor(factoryFn, size) {
    this.factory = factoryFn;
    this.pool = [];
    for (let i = 0; i < size; i++) {
      this.pool.push(factoryFn());
    }
  }
  acquire() {
    return this.pool.length > 0 ? this.pool.pop() : this.factory();
  }
  release(obj) {
    this.pool.push(obj);
  }
}

const pool = new ObjectPool(() => ({ x: 0, y: 0 }), 10);
const p1 = pool.acquire();
p1.x = 100;
pool.release(p1);
console.log('Pool size:', pool.pool.length);`,
      testAssertion: 'ObjectPool acquire decreases pool size and release restores it.',
      firstPrinciplesQuestion: 'Why does pointer compression in 64-bit V8 cap the default max heap size at 4GB?'
    }
  },
  {
    id: '19-memory-leak-forensics',
    tier: 4,
    tierName: 'TIER 4: MATRIX MASTER',
    title: 'Mission 19: Memory Leak Forensics & Heap Snapshots',
    hook: 'A production server restarts every 8 hours because memory climbs monotonically like a staircase. Where is the bug?',
    summary: 'Perform a forensic autopsy on leaking Node processes: closure traps, unbounded caches, retainer trees, and shallow vs retained size.',
    explanation: `
In JavaScript, memory leaks happen when code maintains an accidental reference to an object that is no longer needed, preventing the Garbage Collector from freeing it.

The 4 Classic Leak Archetypes:
1. **Accidental Global Variables**: \`global.cache = {}\` without eviction.
2. **Forgotten Timers / Callbacks**: \`setInterval\` referencing outer scope objects.
3. **Dangling Event Listeners**: Listening to an event on a singleton emitter without calling \`removeListener\`.
4. **The "Meter Leaking Closure" Trap**:
   \`\`\`js
   let theThing = null;
   function replaceThing() {
     let originalThing = theThing;
     let unused = function () { if (originalThing) console.log("hi"); };
     theThing = { longStr: new Array(1000000).join('*'), someMethod: function () {} };
   }
   setInterval(replaceThing, 1000);
   \`\`\`
   Because closures in the same scope share the lexical context object, \`originalThing\` is never garbage collected, leaking megabytes every second!
    `,
    conceptKeyPoints: [
      'Shallow Size: Memory held by the object itself.',
      'Retained Size: Memory freed if this object and its children are deleted.',
      'Closures sharing lexical environments retain unused variables unintentionally.'
    ],
    codeExample: `// Leaking closure vs Cleaned closure
// BAD:
let cache = [];
function badHandler(req) {
  cache.push(() => req.headers); // Retains entire req object in RAM!
}

// GOOD:
function goodHandler(req) {
  const host = req.headers.host; // Copy only primitive value
  cache.push(() => host);
}`,
    trial: {
      challengeTitle: 'Trial 19: The Memory Leak Detective',
      description: 'Inspect the broken cache implementation below and refactor it with a Least-Recently-Used (LRU) eviction strategy with maximum capacity `maxSize` to guarantee memory stability.',
      starterCode: `class LeakingCache {
  constructor(maxSize) {
    this.maxSize = maxSize;
    this.map = new Map();
  }
  set(key, val) {
    // TODO: If size exceeds maxSize, evict the oldest entry
    this.map.set(key, val);
  }
  get(key) {
    // TODO: Refresh key order on get!
    return this.map.get(key);
  }
}`,
      solutionCode: `class LeakingCache {
  constructor(maxSize) {
    this.maxSize = maxSize;
    this.map = new Map();
  }
  set(key, val) {
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.maxSize) {
      // Evict oldest (first key in Map iterator)
      const oldestKey = this.map.keys().next().value;
      this.map.delete(oldestKey);
    }
    this.map.set(key, val);
  }
  get(key) {
    if (!this.map.has(key)) return undefined;
    const val = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, val); // Move to most recent
    return val;
  }
}

const lru = new LeakingCache(2);
lru.set('a', 1);
lru.set('b', 2);
lru.set('c', 3); // 'a' must be evicted!
console.log('Has a:', lru.get('a')); // undefined
console.log('Has b:', lru.get('b')); // 2`,
      testAssertion: 'LeakingCache set must evict oldest item when capacity is exceeded.',
      firstPrinciplesQuestion: 'Why does JavaScript Map preserve insertion order, making it an ideal O(1) LRU cache structure?'
    }
  },
  {
    id: '20-native-addons-napi',
    tier: 4,
    tierName: 'TIER 4: MATRIX MASTER',
    title: 'Mission 20: C++ Native Addons & Node-API (N-API)',
    hook: 'When JavaScript simply isn\'t fast enough: How do database drivers, image processing, and cryptography engines run at raw native C++ speed in Node?',
    summary: 'Cross the boundary between JavaScript and compiled C/C++: ABI stability, Node-API, and WebAssembly alternatives.',
    explanation: `
When you need maximum hardware performance or need to bind to existing OS libraries (like SQLite, sharp/libvips, or bcrypt), you write a **Native C++ Addon**.

Historically, addons accessed V8 C++ classes directly. But every time V8 released a new version, internal C++ APIs changed, breaking all compiled addons!

Node introduced **Node-API (N-API)**:
- An **Application Binary Interface (ABI) stable C API**.
- A native addon compiled against Node-API for Node 14 will run on Node 18, 20, and 22 **without recompilation**!
- It handles type conversions between C types and V8 JS types, exceptions, and thread-safe callbacks.
    `,
    conceptKeyPoints: [
      'Node-API (N-API) provides ABI stability across V8 and Node upgrades.',
      'C++ addons eliminate JS interpretation overhead for heavy mathematical computations.',
      'WebAssembly provides a portable zero-recompilation alternative for native computation.'
    ],
    codeExample: `// Conceptual C++ Node-API Addon
/*
#include <node_api.h>

napi_value FastFibonacci(napi_env env, napi_callback_info info) {
  size_t argc = 1;
  napi_value args[1];
  napi_get_cb_info(env, info, &argc, args, NULL, NULL);
  
  int32_t n;
  napi_get_value_int32(env, args[0], &n);
  
  int32_t result = calculate_fib(n);
  
  napi_value output;
  napi_create_int32(env, result, &output);
  return output;
}
*/`,
    trial: {
      challengeTitle: 'Trial 20: Native Addon Mock Binding',
      description: 'Implement a JS adapter `wrapNativeBinding(rawBinding)` that validates input types before calling raw native C functions, preventing segfaults in native code.',
      starterCode: `function wrapNativeBinding(nativeFn) {
  return function (num) {
    // TODO: Validate that num is a finite integer between 0 and 1000
    // Throw TypeError if invalid, otherwise return nativeFn(num)
  };
}`,
      solutionCode: `function wrapNativeBinding(nativeFn) {
  return function (num) {
    if (typeof num !== 'number' || !Number.isFinite(num) || !Number.isInteger(num)) {
      throw new TypeError('Expected an integer argument');
    }
    if (num < 0 || num > 1000) {
      throw new RangeError('Argument must be between 0 and 1000');
    }
    return nativeFn(num);
  };
}

const mockNative = (n) => n * n;
const safeAddon = wrapNativeBinding(mockNative);
console.log('Result:', safeAddon(42));`,
      testAssertion: 'wrapNativeBinding must reject non-numbers and out-of-range inputs before calling nativeFn.',
      firstPrinciplesQuestion: 'What is the difference between an API (Application Programming Interface) and an ABI (Application Binary Interface)?'
    }
  }
];
