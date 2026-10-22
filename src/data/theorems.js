// Core Architectural Theorems & Theorems in Node.js

export const THEOREMS = [
  {
    id: 'reactor-pattern',
    title: 'The Reactor Pattern & Libuv Demultiplexing',
    subtitle: 'Why Node handles 100k connections without thread exhaustion',
    category: 'Architecture',
    tier: 3,
    icon: 'Cpu',
    formulation:
      'The Reactor Pattern multiplexes concurrent I/O operations through a single synchronous event demultiplexer, dispatching ready events to non-blocking handlers without assigning dedicated execution threads per connection.',
    mathematicalBasis: 'Threads = O(1) memory per event instead of O(N * StackSize). Avoids C10K stack exhaustion.',
    keyInsights: [
      'Operating systems provide kernel demultiplexers: epoll (Linux), kqueue (macOS/BSD), IOCP (Windows).',
      'Libuv abstracts these disparate OS APIs into a unified event loop and request handle abstraction.',
      'A single thread polls the demultiplexer for read/write readiness, executes JavaScript callbacks synchronously, and returns immediately to polling.'
    ],
    deepExplanation: `
Before Node.js, the standard web server model (e.g., Apache HTTPD) allocated a dedicated OS thread or process for every incoming client connection. If 10,000 clients connected simultaneously, the operating system had to maintain 10,000 execution stacks (often 1MB-8MB of RAM each) and execute expensive CPU context switches millions of times per second.

The Reactor Pattern solves this by inverting control:
1. Resources (sockets, file descriptors) are registered with the OS Synchronous Event Demultiplexer along with the desired operation (READ or WRITE).
2. The Demultiplexer watches all handles at kernel level with zero CPU overhead.
3. When a socket receives data, the Demultiplexer wakes up and delivers the ready handles to the Reactor.
4. The Reactor dispatches the registered JavaScript callback associated with that event.
5. Once the callback completes, control returns to the Reactor loop.
    `,
    codeSnippet: `// Synchronous Demultiplexing Concept
const demux = kernel.epoll_create();
demux.add(socketFd, EPOLL_IN, onDataAvailable);

// Reactor Loop in Libuv
while (loop.isAlive()) {
  const events = demux.wait(timeout); // Non-blocking poll
  for (const event of events) {
    event.handler(event.data); // Dispatch JS callback synchronously
  }
}`
  },
  {
    id: 'microtask-precedence',
    title: 'Event Loop Microtask Exhaustion Theorem',
    subtitle: 'The absolute precedence of nextTick and Promise microtasks',
    category: 'Event Loop',
    tier: 3,
    icon: 'RotateCw',
    formulation:
      'Microtask queues (process.nextTick, Promise.then, queueMicrotask) have strict execution priority over macrotasks and will completely drain to empty before the Event Loop advances to any subsequent macrotask phase.',
    mathematicalBasis: 'Microtask Queue Drain Priority: Q(nextTick) > Q(Promise) >> Q(Macrotask Phase).',
    keyInsights: [
      'process.nextTick is technically not part of the Libuv Event Loop; it is processed by Node immediately after the current C++ to JS tick completes.',
      'Recursive process.nextTick calls will completely starve the Event Loop, preventing I/O, timers, and HTTP requests from ever processing (I/O starvation).',
      'Promise microtasks run immediately after the nextTick queue is fully emptied.'
    ],
    deepExplanation: `
The Node.js runtime divides asynchronous work into two distinct categories: Macrotasks and Microtasks.

Macrotasks belong to the 6 Libuv event loop phases:
1. Timers (setTimeout, setInterval)
2. Pending Callbacks (deferred system errors)
3. Idle / Prepare (internal Libuv)
4. Poll (incoming I/O data and connections)
5. Check (setImmediate)
6. Close Callbacks (socket close events)

Between EVERY single macrotask callback, Node drains the Microtask Queues:
1. Node processes all queued process.nextTick callbacks until the queue is completely 0.
2. Node processes all queued Promise.then / queueMicrotask callbacks until the queue is 0.
3. Only when both queues are empty does the loop proceed to the next macrotask!
    `,
    codeSnippet: `console.log('1: Sync');

setTimeout(() => console.log('2: Macrotask Timer'), 0);
setImmediate(() => console.log('3: Macrotask Check'));

Promise.resolve().then(() => console.log('4: Promise Microtask'));
process.nextTick(() => console.log('5: nextTick Microtask'));

console.log('6: Sync End');

// Exact output order: 1, 6, 5, 4, 2, 3
// Notice nextTick (5) beats Promise (4) beats Timers (2) and Check (3)!`
  },
  {
    id: 'backpressure-little-law',
    title: 'Backpressure & Little\'s Law in Node.js Streams',
    subtitle: 'Queue stability: preventing out-of-memory crashes during fast I/O',
    category: 'Streams',
    tier: 3,
    icon: 'Waves',
    formulation:
      'In any streaming system where the producer arrival rate (λ) exceeds the consumer departure rate (μ), internal buffer size diverges to infinity unless backpressure is signaled to halt the producer.',
    mathematicalBasis: 'L = λ * W (Little\'s Law). If λ > μ, L -> ∞ (Buffer Overflow / OOM).',
    keyInsights: [
      'Node.js streams have an internal buffer with a highWaterMark (default 16KB for byte streams, 16 objects for objectMode).',
      'When writable.write(chunk) returns false, the buffer has reached or exceeded highWaterMark. The producer MUST pause.',
      'When the consumer clears the buffer, the writable stream emits the \'drain\' event, signaling the producer to resume.'
    ],
    deepExplanation: `
Imagine reading a 4GB movie file from high-speed SSD disk (reading at 500 MB/s) and writing it to a slow network client on a mobile connection (writing at 50 KB/s).

If you don't use backpressure:
- The disk reads all 4GB in 8 seconds.
- Node allocates RAM to buffer the 4GB because the mobile client hasn't acknowledged the packets yet.
- Node hits its V8 memory limit (typically 1.4GB - 4GB) and crashes with "JavaScript heap out of memory".

With Backpressure:
1. The readable stream pushes chunks into the writable stream's buffer.
2. When the buffer reaches 16KB, writable.write(chunk) returns FALSE.
3. The readable stream calls .pause().
4. The OS sends the 16KB over the network. Once delivered, the writable emits 'drain'.
5. The readable stream calls .resume() and reads the next 16KB chunk.
Memory stays capped at a tiny 16KB forever!
    `,
    codeSnippet: `function pumpData(reader, writer) {
  reader.on('data', (chunk) => {
    // If write returns false, buffer is saturated!
    const canContinue = writer.write(chunk);
    if (!canContinue) {
      reader.pause(); // Throttle producer!
      writer.once('drain', () => {
        reader.resume(); // Producer resumed once buffer flushed!
      });
    }
  });
  // Or simply: stream.pipeline(reader, writer, callback)
}`
  },
  {
    id: 'amdahl-concurrency-paradox',
    title: 'The Single-Threaded Concurrency Paradox & Amdahl\'s Law',
    subtitle: 'Why Node scales infinitely for I/O but locks up on CPU workloads',
    category: 'Performance',
    tier: 4,
    icon: 'Flame',
    formulation:
      'Node.js achieves massive concurrent throughput only when tasks are I/O bound (waiting on network/disk). Any synchronous CPU calculation consumes the single main thread, bringing throughput across all connections to zero.',
    mathematicalBasis: 'Speedup S = 1 / ((1 - P) + P / N). If P (parallelizable) = 0 on single thread, S = 1 regardless of CPU cores.',
    keyInsights: [
      'I/O bound operations (HTTP, DB queries, Redis) do not execute in Node: the OS kernel or external service does the work while Node waits.',
      'CPU bound operations (JSON parsing a 50MB string, image resizing, regex evaluation, crypto hashing) freeze the entire process.',
      'Libuv\'s internal threadpool (UV_THREADPOOL_SIZE, default 4) only handles fs, crypto, zlib, and dns.lookup. It does NOT run user JavaScript!',
      'To run heavy JavaScript concurrently, you MUST use Worker Threads (worker_threads) or Child Processes.'
    ],
    deepExplanation: `
A common misconception is that Node.js is "multi-threaded because of Libuv".

Here is the exact truth:
- Your JavaScript runs on ONE thread (the V8 main thread).
- Libuv maintains 4 background C++ worker threads for operations that operating systems cannot do non-blockingly (like standard file system reads on Linux, or bcrypt hashing).
- If your JavaScript runs an expensive while-loop or calculates Fibonacci(45), the Event Loop cannot turn. Incoming HTTP requests queue up in OS socket backlogs and time out.
- Solution: Isolate CPU-heavy tasks in Worker Threads with SharedArrayBuffer and MessagePorts.
    `,
    codeSnippet: `// BAD: Freezes every single user connected to the server!
app.get('/hash', (req, res) => {
  const hash = crypto.pbkdf2Sync('password', 'salt', 1000000, 64, 'sha512');
  res.send(hash);
});

// GOOD: Offloaded to Libuv C++ threadpool, main thread stays 100% free!
app.get('/hash', (req, res) => {
  crypto.pbkdf2('password', 'salt', 1000000, 64, 'sha512', (err, hash) => {
    res.send(hash);
  });
});`
  },
  {
    id: 'v8-generational-hypothesis',
    title: 'V8 Generational Hypothesis & Cheney\'s Scavenger GC',
    subtitle: 'How V8 cleans memory in under 2 milliseconds',
    category: 'Memory',
    tier: 4,
    icon: 'Trash2',
    formulation:
      'The Generational Hypothesis: Most allocated objects die immediately after creation (short lifespan). V8 optimizes garbage collection by segregating the heap into Young Generation (Nursery/Intermediate) and Old Generation.',
    mathematicalBasis: 'Scavenge cost = O(Live Objects), NOT O(Total Allocated). Since 95% are dead, Scavenge runs in microseconds.',
    keyInsights: [
      'New Space (Young Generation) is split into two semi-spaces: From-Space and To-Space (usually 16MB - 64MB).',
      'Scavenge GC copies only surviving live objects from From-Space to To-Space, then swaps the spaces. Dead objects require zero cleanup time.',
      'Objects that survive two Scavenger cycles are promoted to Old Space.',
      'Old Space is cleaned by Mark-Sweep-Compact GC, which is much more expensive and can cause visible event loop latency spikes.'
    ],
    deepExplanation: `
Whenever you allocate an object in JavaScript (\`const user = { id: 1 }\`), V8 places it in the Nursery of the Young Generation.

When the Nursery fills:
1. V8 runs the **Scavenge GC algorithm** (Cheney's copying collector).
2. It quickly traverses roots (Call Stack, global variables) to find live pointers.
3. Live objects are copied to the To-Space.
4. The remaining pointers in From-Space are instantly discarded (bulk reset of the allocation pointer).
5. If an object survives a second Scavenge cycle, it is promoted to the **Old Generation**.

The Old Generation is cleaned by:
- **Marking**: Tracing all reachable objects (tri-color marking).
- **Sweeping**: Adding memory of dead objects to free-lists.
- **Compacting**: Moving surviving objects together to eliminate memory fragmentation.
    `,
    codeSnippet: `// High Scavenge churn (good, cheap collection in Young Generation):
function handleRequest() {
  const tempMetadata = { timestamp: Date.now() }; // Dies young in Nursery
  return tempMetadata.timestamp;
}

// Memory leak / Old Space bloat (retained in Old Generation forever!):
const leakedGlobalArray = [];
function handleBad() {
  leakedGlobalArray.push({ data: new Array(10000).fill('leak') });
  // Never released! Promoted to Old Space, causes eventual OOM crash.
}`
  },
  {
    id: 'cluster-ipc-reuseport',
    title: 'Cluster Multi-Processing & Kernel Socket Sharing',
    subtitle: 'How 16 Node processes bind to port 8080 without conflicts',
    category: 'Architecture',
    tier: 4,
    icon: 'Network',
    formulation:
      'The cluster module enables a master process to bind to an OS socket and hand off accepted client connections across child worker processes using IPC file descriptor passing, distributing incoming connections via Round-Robin.',
    mathematicalBasis: 'Throughput ~ min(Cores, Network bandwidth) without shared memory lock contention.',
    keyInsights: [
      'In cluster mode, the Master process listens on the network port (e.g., 8080).',
      'When a TCP handshake completes, the master accepts the connection and hands the file descriptor (socket handle) to a worker via Unix Domain Socket / Named Pipe IPC.',
      'On Linux/macOS, Node uses Round-Robin scheduling to balance load evenly across worker CPU cores.',
      'Zero-downtime rolling deploys can be achieved by killing and restarting one worker at a time while others continue serving traffic.'
    ],
    deepExplanation: `
Normally in operating systems, if two independent processes attempt to call \`server.listen(8080)\`, the second process fails immediately with \`EADDRINUSE\` (Address already in use).

Node.js Cluster achieves socket sharing through two mechanisms:
1. **Round-Robin (Default on non-Windows)**:
   The Master process creates the actual TCP listening socket. When a client connects, Master calls \`accept()\` and passes the resulting socket handle to an available worker process over IPC.
2. **Shared Handle**:
   The Master creates the listening socket and sends the handle itself to each worker. The workers all call \`listen()\` on the identical underlying kernel handle. The OS kernel then distributes connections directly.
    `,
    codeSnippet: `import cluster from 'node:cluster';
import http from 'node:http';
import { availableParallelism } from 'node:os';

if (cluster.isPrimary) {
  const numCPUs = availableParallelism();
  console.log(\`Primary \${process.pid} is spawning \${numCPUs} workers...\`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(\`Worker \${worker.process.pid} died. Respawning...\`);
    cluster.fork(); // Self-healing cluster!
  });
} else {
  // Workers can share the same TCP port!
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end(\`Handled by worker PID \${process.pid}\\n\`);
  }).listen(8080);
}`
  }
];
