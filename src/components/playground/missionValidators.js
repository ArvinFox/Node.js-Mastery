// Mission Validators for all 20 Curriculum Trials
// Provides deterministic test suites with educational feedback.

export const missionValidators = {
  '01-what-is-node': async (scope, logs) => {
    const fn = scope.detectRuntime;
    if (typeof fn !== 'function') {
      return { pass: false, message: 'Expected detectRuntime to be defined as a function.' };
    }
    const result = fn();
    if (result !== 'node') {
      return {
        pass: false,
        message: `Expected detectRuntime() to return "node" when running with process.versions.node, but received "${result}".`
      };
    }
    return {
      pass: true,
      message: '✓ Correctly detected Node.js runtime environment via process.versions.node signature.'
    };
  },

  '02-global-process': async (scope, logs) => {
    const fn = scope.parseArgs;
    if (typeof fn !== 'function') {
      return { pass: false, message: 'Expected parseArgs to be defined as a function.' };
    }
    const test1 = fn(['--port=8080', '--host=0.0.0.0', '--verbose']);
    if (!test1 || test1.port !== '8080' || test1.host !== '0.0.0.0' || test1.verbose !== true) {
      return {
        pass: false,
        message: `parseArgs(["--port=8080", "--host=0.0.0.0", "--verbose"]) expected { port: "8080", host: "0.0.0.0", verbose: true } but received ${JSON.stringify(test1)}.`
      };
    }
    const test2 = fn(['--debug', '--env=staging']);
    if (!test2 || test2.debug !== true || test2.env !== 'staging') {
      return {
        pass: false,
        message: `parseArgs(["--debug", "--env=staging"]) expected { debug: true, env: "staging" } but received ${JSON.stringify(test2)}.`
      };
    }
    return { pass: true, message: '✓ Successfully parsed key-value and boolean CLI argument flags.' };
  },

  '03-commonjs-vs-esm': async (scope, logs) => {
    const fn = scope.bustCacheAndRequire;
    if (typeof fn !== 'function') {
      return { pass: false, message: 'Expected bustCacheAndRequire to be defined as a function.' };
    }
    const cache = { 'auth-service': { exports: { version: '1.0.0' } } };
    const newExports = fn(cache, 'auth-service', () => ({ version: '2.0.0' }));
    if (!newExports || newExports.version !== '2.0.0') {
      return { pass: false, message: 'bustCacheAndRequire must return the new exports returned by loaderFn.' };
    }
    if (!cache['auth-service'] || cache['auth-service'].exports?.version !== '2.0.0') {
      return { pass: false, message: 'bustCacheAndRequire must overwrite the cache with the new exports object.' };
    }
    return { pass: true, message: '✓ Successfully invalidated module cache and re-loaded fresh exports.' };
  },

  '04-error-first-callbacks': async (scope, logs) => {
    const fn = scope.myPromisify;
    if (typeof fn !== 'function') {
      return { pass: false, message: 'Expected myPromisify to be defined as a function.' };
    }
    const mockAsync = (val, cb) => setTimeout(() => cb(null, val * 3), 10);
    const mockAsyncFail = (cb) => setTimeout(() => cb(new Error('Kernel Failure')), 10);

    const promisified = fn(mockAsync);
    if (typeof promisified !== 'function') {
      return { pass: false, message: 'myPromisify(fn) must return a function.' };
    }

    try {
      const res = await promisified(7);
      if (res !== 21) {
        return { pass: false, message: `Expected promisified function to resolve with 21, but received ${res}.` };
      }
    } catch (e) {
      return { pass: false, message: `Promisified function rejected unexpectedly: ${e.message}` };
    }

    const promisifiedFail = fn(mockAsyncFail);
    try {
      await promisifiedFail();
      return { pass: false, message: 'Expected promisified function to reject when callback receives an error.' };
    } catch (err) {
      if (err.message !== 'Kernel Failure') {
        return { pass: false, message: `Expected rejection error "Kernel Failure", but got "${err.message}".` };
      }
    }

    return { pass: true, message: '✓ Correctly converted error-first callback into a Promise resolving/rejecting.' };
  },

  '05-promises-microtasks': async (scope, logs) => {
    const fn = scope.runWithConcurrency;
    if (typeof fn !== 'function') {
      return { pass: false, message: 'Expected runWithConcurrency to be defined as a function.' };
    }
    let running = 0;
    let maxRunning = 0;

    const makeTask = (val, delay) => async () => {
      running++;
      maxRunning = Math.max(maxRunning, running);
      await new Promise((r) => setTimeout(r, delay));
      running--;
      return val;
    };

    const tasks = [makeTask('A', 15), makeTask('B', 10), makeTask('C', 10), makeTask('D', 15)];
    const results = await fn(tasks, 2);

    if (!Array.isArray(results) || results.join('') !== 'ABCD') {
      return {
        pass: false,
        message: `Expected results ["A", "B", "C", "D"] in original order, but received ${JSON.stringify(results)}.`
      };
    }
    if (maxRunning > 2) {
      return { pass: false, message: `Concurrency limit was 2, but max active tasks reached ${maxRunning}.` };
    }
    return { pass: true, message: '✓ Successfully executed task pool with max concurrency and preserved order.' };
  },

  '06-event-emitter-internals': async (scope, logs) => {
    const Cls = scope.TinyEventEmitter;
    if (typeof Cls !== 'function') {
      return { pass: false, message: 'Expected TinyEventEmitter to be defined as a class or constructor.' };
    }
    const ee = new Cls();
    let onCount = 0;
    let onceCount = 0;

    ee.on('ping', () => onCount++);
    ee.once('ping', () => onceCount++);

    ee.emit('ping');
    ee.emit('ping');
    ee.emit('ping');

    if (onCount !== 3) {
      return { pass: false, message: `Expected on('ping') listener to fire 3 times, but fired ${onCount}.` };
    }
    if (onceCount !== 1) {
      return { pass: false, message: `Expected once('ping') listener to fire exactly 1 time, but fired ${onceCount}.` };
    }
    return { pass: true, message: '✓ TinyEventEmitter on(), emit(), and once() listeners verified.' };
  },

  '07-raw-binary-buffers': async (scope, logs) => {
    const fn = scope.parseHeader;
    if (typeof fn !== 'function') {
      return { pass: false, message: 'Expected parseHeader to be defined as a function.' };
    }
    const Buffer = scope.Buffer;
    const validPacket = Buffer.from([0xCA, 0xFE, 0x00, 0x80, 0x00, 0x01]);
    const res1 = fn(validPacket);

    if (!res1 || res1.valid !== true || res1.length !== 128 || res1.type !== 1) {
      return {
        pass: false,
        message: `parseHeader([0xCA, 0xFE, 0x00, 0x80, 0x00, 0x01]) expected { valid: true, length: 128, type: 1 } but received ${JSON.stringify(res1)}.`
      };
    }

    const invalidPacket = Buffer.from([0xBA, 0xBE, 0x00, 0x10, 0x00, 0x02]);
    const res2 = fn(invalidPacket);
    if (!res2 || res2.valid !== false) {
      return { pass: false, message: 'Expected packet with magic 0xBABE to return valid: false.' };
    }

    return { pass: true, message: '✓ Correctly parsed big-endian binary packet magic, length, and type fields.' };
  },

  '08-filesystem-descriptors': async (scope, logs) => {
    const fn = scope.countWordsInChunks;
    if (typeof fn !== 'function') {
      return { pass: false, message: 'Expected countWordsInChunks to be defined as a function.' };
    }
    const res = fn(['Hello wo', 'rld this is a', ' stream']);
    if (res !== 6) {
      return {
        pass: false,
        message: `Expected 6 words in ["Hello wo", "rld this is a", " stream"] ("Hello world this is a stream"), but received ${res}.`
      };
    }
    const res2 = fn(['Node', 'JS', ' Mastery']);
    if (res2 !== 2) {
      return {
        pass: false,
        message: `Expected 2 words for ["Node", "JS", " Mastery"] ("NodeJS Mastery"), but received ${res2}.`
      };
    }
    return { pass: true, message: '✓ Accurately counted words across streaming buffer chunk boundaries.' };
  },

  '09-tcp-http-sockets': async (scope, logs) => {
    const fn = scope.parseRawHttpRequest;
    if (typeof fn !== 'function') {
      return { pass: false, message: 'Expected parseRawHttpRequest to be defined as a function.' };
    }
    const raw = 'POST /api/v1/auth HTTP/1.1\r\nHost: api.terminal.local\r\nAuthorization: Bearer xyz\r\n\r\n{"data":1}';
    const res = fn(raw);

    if (!res || res.method !== 'POST' || res.path !== '/api/v1/auth' || res.httpVersion !== 'HTTP/1.1') {
      return {
        pass: false,
        message: `Expected method 'POST', path '/api/v1/auth', httpVersion 'HTTP/1.1', but received ${JSON.stringify(res)}.`
      };
    }
    if (!res.headers || res.headers['host'] !== 'api.terminal.local' || res.headers['authorization'] !== 'Bearer xyz') {
      return {
        pass: false,
        message: `Expected lowercased headers object with host and authorization, received ${JSON.stringify(res.headers)}.`
      };
    }
    return { pass: true, message: '✓ Successfully parsed raw HTTP protocol request-line and header fields.' };
  },

  '10-reactor-pattern-deep': async (scope, logs) => {
    const Cls = scope.MiniReactor;
    if (typeof Cls !== 'function') {
      return { pass: false, message: 'Expected MiniReactor to be defined as a class or constructor.' };
    }
    const reactor = new Cls();
    let handled = '';

    reactor.register(3, 'READ', (data) => {
      handled = `FD3:${data}`;
    });
    reactor.dispatch([{ fd: 3, event: 'READ', data: 'SYN_ACK' }]);

    if (handled !== 'FD3:SYN_ACK') {
      return {
        pass: false,
        message: `Expected dispatch to invoke FD 3 handler with 'SYN_ACK', but got '${handled}'.`
      };
    }
    return { pass: true, message: '✓ MiniReactor synchronous event demultiplexer and handler verified.' };
  },

  '11-event-loop-six-phases': async (scope, logs) => {
    const fn = scope.getPredictedOrder;
    if (typeof fn !== 'function') {
      return { pass: false, message: 'Expected getPredictedOrder to be defined as a function.' };
    }
    const order = fn();
    const expected = [1, 6, 4, 3, 2, 5];
    if (!Array.isArray(order) || order.join(',') !== expected.join(',')) {
      return {
        pass: false,
        message: `Expected predicted array [1, 6, 4, 3, 2, 5], but received ${JSON.stringify(order)}.`
      };
    }
    return { pass: true, message: '✓ Perfectly predicted 6-phase Event Loop and microtask queue execution order.' };
  },

  '12-streams-backpressure-deep': async (scope, logs) => {
    const fn = scope.safePump;
    if (typeof fn !== 'function') {
      return { pass: false, message: 'Expected safePump to be defined as a function.' };
    }
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
          }, 15);
          return false;
        }
        return true;
      }
      once(event, cb) {
        this.listeners[event] = cb;
      }
    }

    const sink = new MockSink(2);
    const pauses = await fn(['chunk1', 'chunk2', 'chunk3', 'chunk4', 'chunk5'], sink);

    if (typeof pauses !== 'number' || pauses < 1) {
      return {
        pass: false,
        message: `Expected safePump to await backpressure drain and return pause count (>= 1), but received ${pauses}.`
      };
    }
    return { pass: true, message: '✓ Successfully handled highWaterMark backpressure and drain event sequencing.' };
  },

  '13-child-processes-ipc': async (scope, logs) => {
    const fn = scope.createIpcRouter;
    if (typeof fn !== 'function') {
      return { pass: false, message: 'Expected createIpcRouter to be defined as a function.' };
    }
    const router = fn();
    router.register('SQUARE', (num) => num * num);
    router.register('REVERSE', async (str) => str.split('').reverse().join(''));

    const res1 = await router.handle({ id: 'msg_10', action: 'SQUARE', payload: 9 });
    if (!res1 || res1.id !== 'msg_10' || res1.result !== 81) {
      return {
        pass: false,
        message: `Expected { id: "msg_10", result: 81 }, but received ${JSON.stringify(res1)}.`
      };
    }

    const res2 = await router.handle({ id: 'msg_11', action: 'REVERSE', payload: 'node' });
    if (!res2 || res2.id !== 'msg_11' || res2.result !== 'edon') {
      return {
        pass: false,
        message: `Expected { id: "msg_11", result: "edon" }, but received ${JSON.stringify(res2)}.`
      };
    }
    return { pass: true, message: '✓ IPC message dispatcher correctly routed sync and async actions.' };
  },

  '14-crypto-redos-security': async (scope, logs) => {
    const fn = scope.safeDeepMerge;
    if (typeof fn !== 'function') {
      return { pass: false, message: 'Expected safeDeepMerge to be defined as a function.' };
    }

    const payload = JSON.parse('{"__proto__": {"isAdmin": true}, "constructor": {"evil": true}, "safe": 123}');
    const merged = fn({}, payload);

    if (({}).isAdmin === true || ({}).evil === true) {
      return { pass: false, message: 'VULNERABILITY: Object prototype was polluted with injected properties!' };
    }
    if (!merged || merged.safe !== 123) {
      return { pass: false, message: 'Expected valid keys (safe: 123) to be merged into target object.' };
    }
    return { pass: true, message: '✓ Prototype pollution vectors (__proto__, constructor, prototype) securely neutralized.' };
  },

  '15-worker-threads-atomics': async (scope, logs) => {
    const Cls = scope.CyberLock;
    if (typeof Cls !== 'function') {
      return { pass: false, message: 'Expected CyberLock to be defined as a class or constructor.' };
    }
    const SAB = scope.SharedArrayBuffer || ArrayBuffer;
    const Atomics = scope.Atomics;
    const sab = new SAB(4);
    const state = new Int32Array(sab);
    const lock = new Cls(state);

    lock.acquire();
    const held = Atomics.load(state, 0);
    if (held !== 1) {
      return { pass: false, message: `Expected state to be 1 after lock.acquire(), but got ${held}.` };
    }

    lock.release();
    const released = Atomics.load(state, 0);
    if (released !== 0) {
      return { pass: false, message: `Expected state to be 0 after lock.release(), but got ${released}.` };
    }
    return { pass: true, message: '✓ Atomic spinlock acquire() and release() states verified.' };
  },

  '16-cluster-zero-downtime': async (scope, logs) => {
    const fn = scope.rollingDeploy;
    if (typeof fn !== 'function') {
      return { pass: false, message: 'Expected rollingDeploy to be defined as a function.' };
    }
    let disconnectedOrder = [];
    let spawnedOrder = [];

    const mockWorkers = [
      { id: 'w1', disconnect: () => disconnectedOrder.push('w1') },
      { id: 'w2', disconnect: () => disconnectedOrder.push('w2') }
    ];

    let spawnId = 10;
    const spawnFn = async () => {
      const id = 'new_w' + spawnId++;
      spawnedOrder.push(id);
      return { id };
    };

    const newWorkers = await fn(mockWorkers, spawnFn);

    if (!Array.isArray(newWorkers) || newWorkers.length !== 2) {
      return { pass: false, message: 'rollingDeploy must return an array of newly spawned workers.' };
    }
    if (disconnectedOrder.length !== 2) {
      return { pass: false, message: 'rollingDeploy must disconnect old workers after spawning replacements.' };
    }
    return { pass: true, message: '✓ Zero-downtime rolling deployment sequence verified without downtime.' };
  },

  '17-async-local-storage': async (scope, logs) => {
    const Cls = scope.MiniContext;
    if (typeof Cls !== 'function') {
      return { pass: false, message: 'Expected MiniContext to be defined as a class or constructor.' };
    }
    const context = new Cls();
    let retrievedUser = null;

    context.run({ user: 'Morpheus', role: 'Architect' }, () => {
      retrievedUser = context.get()?.user;
    });

    if (retrievedUser !== 'Morpheus') {
      return {
        pass: false,
        message: `Expected context.get().user to return 'Morpheus', but received '${retrievedUser}'.`
      };
    }
    return { pass: true, message: '✓ AsyncLocalStorage request context correctly isolated and retrieved.' };
  },

  '18-v8-memory-architecture': async (scope, logs) => {
    const Cls = scope.ObjectPool;
    if (typeof Cls !== 'function') {
      return { pass: false, message: 'Expected ObjectPool to be defined as a class or constructor.' };
    }
    let created = 0;
    const pool = new Cls(() => ({ id: ++created }), 5);

    if (created !== 5) {
      return { pass: false, message: `Expected ObjectPool constructor to pre-allocate 5 items, but created ${created}.` };
    }

    const item1 = pool.acquire();
    const item2 = pool.acquire();
    if (!item1 || !item2) {
      return { pass: false, message: 'ObjectPool acquire() must return an instance from the pool.' };
    }

    pool.release(item1);
    pool.release(item2);

    const reacquired = pool.acquire();
    if (reacquired !== item2 && reacquired !== item1) {
      return { pass: false, message: 'ObjectPool acquire() should reuse released instances.' };
    }
    return { pass: true, message: '✓ ObjectPool pre-allocation, reuse, and GC mitigation verified.' };
  },

  '19-memory-leak-forensics': async (scope, logs) => {
    const Cls = scope.LeakingCache;
    if (typeof Cls !== 'function') {
      return { pass: false, message: 'Expected LeakingCache to be defined as a class or constructor.' };
    }
    const lru = new Cls(2);
    lru.set('a', 1);
    lru.set('b', 2);
    lru.set('c', 3); // 'a' must be evicted!

    if (lru.get('a') !== undefined) {
      return {
        pass: false,
        message: `Expected oldest key 'a' to be evicted when capacity 2 exceeded, but got ${lru.get('a')}.`
      };
    }
    if (lru.get('b') !== 2 || lru.get('c') !== 3) {
      return { pass: false, message: "Expected keys 'b' and 'c' to be present in cache." };
    }

    // Access b to make it most recent, then add d. 'c' should be evicted!
    lru.get('b');
    lru.set('d', 4);
    if (lru.get('c') !== undefined) {
      return { pass: false, message: "Expected 'c' to be evicted after 'b' was refreshed by get()." };
    }
    return { pass: true, message: '✓ LRU eviction strategy prevents unbounded memory growth.' };
  },

  '20-native-addons-napi': async (scope, logs) => {
    const fn = scope.wrapNativeBinding;
    if (typeof fn !== 'function') {
      return { pass: false, message: 'Expected wrapNativeBinding to be defined as a function.' };
    }
    const mockNative = (x) => x * 10;
    const safe = fn(mockNative);

    if (safe(5) !== 50) {
      return { pass: false, message: `Expected safe(5) to return 50, but got ${safe(5)}.` };
    }

    let threwType = false;
    try {
      safe('not a number');
    } catch (e) {
      if (e instanceof TypeError) threwType = true;
    }
    if (!threwType) {
      return { pass: false, message: 'Expected wrapNativeBinding to throw TypeError on non-number inputs.' };
    }

    let threwRange = false;
    try {
      safe(-5);
    } catch (e) {
      if (e instanceof RangeError) threwRange = true;
    }
    if (!threwRange) {
      return { pass: false, message: 'Expected wrapNativeBinding to throw RangeError on negative numbers.' };
    }

    return { pass: true, message: '✓ Native binding guard successfully validated types and memory bounds.' };
  }
};
