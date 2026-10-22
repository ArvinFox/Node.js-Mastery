# ⬢ Node.js Mastery — Zero to Architect

[![Node.js Version](https://img.shields.io/badge/Node.js-v22%20LTS-5FA04E?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-v19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

An interactive, zero-dependency visual mastery engine and hands-on academy designed to take developers from complete beginner to **Node.js Core Systems Architect**.

Featuring real-time hardware-accelerated runtime simulators (Libuv Event Loop, Stream Backpressure, Worker Threads, and V8 Generational Garbage Collection), rigorous architectural theorems, predict-the-output timeline challenges, and a cybernetic terminal HUD.

---

## ⚡ Core Features

### 🚀 1. 20-Mission Scaffolded Curriculum
Progress through 4 rigorous mastery tiers:
* **Tier 1: Novice Hacker** (V8 + Libuv, Process & Environment, CommonJS vs ESM, Async Callbacks)
* **Tier 2: Daemon Engineer** (Microtasks & Promises, EventEmitter Internals, Binary Buffers, File Descriptors)
* **Tier 3: Core Architect** (TCP & HTTP Demux, Reactor Pattern, 6-Phase Event Loop, Stream Backpressure)
* **Tier 4: Matrix Master** (Worker Threads & Atomics, Cluster IPC, AsyncLocalStorage, V8 GC & Heap Forensics)

Each mission follows a 3-step cognitive model:
1. **Mission Blueprint & Theory** — The architectural mystery and deep mechanics.
2. **Visual Simulator Lab** — Embedded real-time interactive simulator directly in the lesson.
3. **Hands-on Code Trial & Tests** — In-browser sandboxed trial runner with automated test suites.

### 🔬 2. Real-Time Visualizer Labs
* **Libuv 6-Phase Event Loop Visualizer**: Step through Timers, Pending I/O, Idle/Prepare, Poll, Check (`setImmediate`), and Close phases alongside Call Stack and Microtask Queues (`process.nextTick` vs Promise).
* **Stream Backpressure & Buffer Tank**: Dynamic fluid tank illustrating `highWaterMark`, `write() === false`, pause/resume, and `drain` events vs naive OOM crashes.
* **Worker Threads vs Main Thread Benchmark**: Live 60 FPS animation benchmarking CPU-intensive tasks on the main thread (0 FPS freeze) vs parallel `worker_threads` (smooth 60 FPS).
* **V8 Generational Garbage Collector**: Watch New Space (Eden $\rightarrow$ Survivor) scavenges run in under 2ms and observe object promotion into Old Space.

### 📜 3. Architectural Theorems & Laws
Rigorous mathematical and systems foundations behind Node.js:
* **The Reactor Pattern**: Synchronous Demultiplexer & Non-blocking I/O Dispatcher.
* **Microtask Precedence Law**: `process.nextTick` starvation & Promise resolution ordering.
* **Little's Law & Backpressure**: Queue stability equations $L = \lambda W$.
* **Amdahl's Law**: Parallel CPU scaling speedup limits with `worker_threads`.
* **V8 Generational Hypothesis**: Infant mortality of memory allocations and semi-space scavenge.
* **Cluster IPC & Conway's Share-Nothing Law**: Zero-shared-memory shared-socket distribution via `SO_REUSEPORT`.

### 🧩 4. Output Prediction Challenges
Timeline trace challenges where engineers predict exact execution order across `nextTick`, promises, timers, and `setImmediate` with step-by-step forensic execution traces.

### 💻 5. Cybernetic HUD & Audio Synthesis
* **Floating Hacker CLI**: Press `` ` `` (tilde/backquote) anywhere to launch a command-line HUD with instant navigation, theme toggles, and memory diagnostics.
* **Procedural Sound Engine**: Zero-asset Web Audio API synthesizer generating tactile keystroke clicks, step chirps, and mission completion fanfares.
* **5 Dynamic Themes**: Matrix (Default Emerald), Cyberpunk (Neon Pink/Cyan), Amber (Phosphor CRT), Obsidian (Clean Dark), and Light.
* **Softened CRT Mode**: Authentic toggleable cathode-ray scanline and phosphor bloom effect.
* **Offline Progress Persistence**: Stores completed missions, earned badges, quiz answers, and custom code drafts locally in `localStorage` with first-boot privacy consent.

---

## 🛠️ Quick Start

### Prerequisites
* [Node.js](https://nodejs.org/) v18+ or v20+ or v22+
* npm or pnpm

### Installation

```bash
# Clone repository
git clone https://github.com/ArvinFox/Node.js-Mastery.git

# Enter project directory
cd Node.js-Mastery

# Install dependencies
npm install

# Launch development server
npm run dev
```

Visit `http://localhost:5173/` in your browser.

### Production Build

```bash
npm run build
npm run preview
```

---

## 📁 Repository Structure

```text
├── index.html                       # HTML entry point with authentic Node.js favicon
├── package.json                     # Project manifest and scripts
├── public/                          # Static assets (official SVG & PNG favicons)
└── src/
    ├── App.jsx                      # Root container & navigation orchestration
    ├── components/
    │   ├── common/                  # Markdown renderer & storage consent modal
    │   ├── curriculum/              # Mission tree, mission drawer, stepper
    │   ├── layout/                  # TerminalHeader & Floating HackerCLI
    │   ├── playground/              # 3-step code editor & test runner
    │   ├── quizzes/                 # Output prediction timeline quizzes
    │   ├── theorems/                # Deep architectural theorems & proofs
    │   └── visualizers/             # Libuv, Backpressure, Workers, and GC labs
    ├── data/
    │   ├── curriculum.js            # 20 missions database with code & solutions
    │   ├── quizzes.js               # Event loop predict-the-output challenges
    │   └── theorems.js              # Systems engineering laws & formulas
    ├── services/
    │   ├── soundFx.js               # Web Audio API procedural sound synthesizer
    │   └── storage.js               # Local storage persistence with privacy guards
    └── styles/
        └── terminal.css             # Unified cyber design system & custom scrollbars
```

---

## ⚖️ Legal & Trademark Notice

Node.js is a registered trademark of the **OpenJS Foundation**. 

This educational platform is an independent community project created for learning purposes, and is not affiliated with, endorsed by, or sponsored by the OpenJS Foundation or the Node.js project.

---

## 📜 License

Licensed under the [MIT License](LICENSE).
