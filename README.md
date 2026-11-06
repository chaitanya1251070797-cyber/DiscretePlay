# DiscretePlay: Interactive Teaching Engine for Discrete Mathematics

> **DiscretePlay** is NOT simply a gaming website with mathematical explanations.  
> It is an **interactive educational platform** in which students learn Discrete Mathematics **THROUGH** playing games.  
> The educational experience is the primary driver of the entire application.

---

## 1. Core Teaching Philosophy (Learning by Discovery)

Students are not expected to know discrete mathematical formalism before entering a game. The engine behaves like an interactive mathematics professor embedded into every puzzle:
1. **Presents a concrete challenge** with clear operational rules.
2. **Allows active experimentation** and monitors student telemetry (decisions, moves, errors, timing).
3. **Intervenes at meaningful moments** when patterns or invariants emerge.
4. **Asks predictive reasoning queries** ("Why did this move fail?", "What will happen if we expand the queue?").
5. **Progressively reveals hints** without giving away solutions prematurely.
6. **Connects game mechanics directly to formal definitions and theorems** from Kenneth H. Rosen’s *Discrete Mathematics and Its Applications*.
7. **Evaluates independent understanding** under challenge conditions before granting concept mastery.

---

## 2. Universal 5-Stage Learning Engine

Every game in DiscretePlay adheres strictly to the universal 5-stage educational progression:

| Stage | Name | Pedagogical Purpose |
| :--- | :--- | :--- |
| **Stage 1** | **DISCOVER** | Introduce the problem intuitively. Conceal formal mathematics initially to promote experiential intuition. |
| **Stage 2** | **EXPERIMENT** | Encourage hands-on interaction. Track actions, decisions, and invalid moves with instant visual and conceptual feedback. |
| **Stage 3** | **GUIDED REASONING** | Present predictive challenges and multiple-choice reasoning checks based on the live board state. Progressive clues guide deductions. |
| **Stage 4** | **MATHEMATICAL REVELATION** | Unveil formal names, definitions, recurrence relations/formulas, interactive visual models, and exact Kenneth H. Rosen chapter references. |
| **Stage 5** | **INDEPENDENT APPLICATION** | Introduce harder challenge configurations (e.g. 4-disk Hanoi, 5x5 Minesweeper SAT grid, complex Nim piles) with scaffolding removed to verify true mastery. |

---

## 3. Contextual Teaching System (4 Interaction Modes)

The contextual teaching panel is mounted alongside the gameplay arena, dynamically responding to board events, errors, and student progress:

- **A. THINK**: Asks predictive questions before critical moves (e.g. *"Where must Disks 1 and 2 be before Disk 3 can move?"* or *"What can you deduce about cell C if A + B = 1 and A + B + C = 2?"*).
- **B. HINT**: Three-tiered progressive assistance:
  - *Tier 1: Subtle Nudge* (points attention to invariant).
  - *Tier 2: Structural Clue* (reveals subproblem pattern).
  - *Tier 3: Mathematical Formalism* (gives formula snippet).
- **C. EXPLAIN**: Generates real-time mathematical rationales for both valid moves and rule violations, linking actions to formal invariants.
- **D. VISUALIZE**: Real-time synchronized mathematical diagrams and state machines:
  - **Tower of Hanoi**: Recursive Call Tree & recurrence expansion $T(n) = 2T(n-1) + 1$.
  - **Minesweeper**: Boolean Constraint Matrix & SAT Truth Assignment solver ($\sum X_i = k$).
  - **Maze Graph**: Dual Traversal Engine comparing BFS Queue (FIFO) vs DFS Stack (LIFO).
  - **Caesar Cipher**: Cyclic Ring $\mathbb{Z}_{26}$ (clock arithmetic & additive inverse decryption).
  - **Nim**: Bit-Parity Matrix & Bouton’s Nim-Sum ($\bigoplus$) calculator.

---

## 4. Implemented Games & Kenneth H. Rosen Curriculum

### 1. Tower of Hanoi
- **Mathematical Concept**: Divide-and-Conquer Recursion, Invariants, and Recurrence Relations.
- **Formulas**: $T(n) = 2T(n-1) + 1$, with closed-form solution $T(n) = 2^n - 1$.
- **Textbook Reference**: Kenneth H. Rosen, *Discrete Mathematics and Its Applications* (8th Edition), **Section 8.1: Applications of Recurrence Relations** (Example 1).
- **Independent Challenge**: Solve a 4-disk tower in $\le 18$ moves (optimal: 15 moves) without assistance.

### 2. Minesweeper Logic Deduction
- **Mathematical Concept**: Propositional Logic, Boolean Satisfiability (SAT), and Constraint Satisfaction.
- **Formulas**: $\sum_{(i,j) \in N(r,c)} X_{i,j} = k$, with $X_{i,j} \in \{0, 1\}$.
- **Textbook Reference**: Kenneth H. Rosen, **Section 1.1: Propositional Logic** and **Section 1.3: Propositional Equivalences and SAT Solving**.
- **Independent Challenge**: Completely clear a deterministic 5x5 board containing 4 hidden mines using pure logical deduction with zero guesses.

### 3. Maze Graph Explorer
- **Mathematical Concept**: Graph Models $G=(V, E)$, Graph Traversal, FIFO Queue Monotonicity, and Shortest-Path Optimality.
- **Formulas**: $d(s, v_1) \le d(s, v_r) \le d(s, v_1) + 1$, ensuring $d(s, \text{Goal}) = \delta(s, \text{Goal})$.
- **Textbook Reference**: Kenneth H. Rosen, **Section 10.2: Graph Terminology** and **Section 10.4: Connectivity & Shortest-Path Problems**.
- **Independent Challenge**: Trace the BFS frontier queue order and prove shortest path distance across branchy graph labyrinths.

### 4. Caesar Cipher & Modulo Ring
- **Mathematical Concept**: Modular Arithmetic, Congruence Modulo $m$, and Cyclic Group $(\mathbb{Z}_{26}, +)$.
- **Formulas**: $E_k(x) = (x + k) \pmod{26}$, $D_k(y) = (y - k) \pmod{26} = (y + (26 - k)) \pmod{26}$.
- **Textbook Reference**: Kenneth H. Rosen, **Section 4.1: Divisibility and Modular Arithmetic** and **Section 4.6: Cryptography**.
- **Independent Challenge**: Break an unknown intercepted transmission using frequency analysis and modular inverse arithmetic.

### 5. Nim & Combinatorial Game Theory
- **Mathematical Concept**: Binary Expansion, Bitwise XOR, and Bouton’s Theorem on Impartial Games.
- **Formulas**: Nim-Sum $S = n_1 \oplus n_2 \oplus \dots \oplus n_k$; P-Position iff $S = 0$; Winning transition $n_i' = n_i \oplus S < n_i$.
- **Textbook Reference**: Kenneth H. Rosen, **Section 4.2: Integer Representations and Algorithms** & Combinatorial Game Theory.
- **Independent Challenge**: Given unbalanced piles $[3, 5, 7]$, calculate the Nim-Sum ($S = 1$) and execute the single winning countermove.

---

## 5. Adaptive Learning & Telemetry Engine

The internal `AdaptiveEngine` continuously assesses student telemetry:
- **Metrics Logged**: Move count, error count, hint count, repeated mistake frequencies, and elapsed time.
- **Scaffolding Control**:
  - *Struggling Students (Repeated Invariant Violations)*: Automatically activates **Guided Mode**, delivers deeper conceptual explanations, and suggests simpler sub-puzzles.
  - *High-Performing Students*: Automatically activates **Advanced Mode**, gradually removes hints, and enforces strict error budgets for mastery badges.
- **Concept Mastery Rule**: A mathematical concept is flagged as **Mastered** ONLY when the student successfully finishes Stage 5 (Independent Application) with $\le 1$ hint and low mistakes.

---

## 6. Mathematical Knowledge Graph

Clicking **"Curriculum Graph"** in the top navigation opens the interactive prerequisite hierarchy:
- Categorized by Discrete Math disciplines:
  - *Recursion & Recurrences*
  - *Logic & Proofs*
  - *Graph Theory*
  - *Number Theory & Cryptography*
  - *Combinatorics & Game Theory*
- Displays prerequisite satisfaction, locked states, available nodes, and mastered badges.
- Features **Next Recommended Concept** alerts to guide students across the curriculum.

---

## 7. Development & Running Locally

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Execution
```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev

# Or build for production
npm run build
npm run preview
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

