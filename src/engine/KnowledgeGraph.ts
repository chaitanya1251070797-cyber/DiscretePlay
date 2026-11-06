import { KnowledgeNode } from '../types/learning';

export const KNOWLEDGE_GRAPH_NODES: KnowledgeNode[] = [
  // Recursion & Recurrences
  {
    id: 'recursion-base',
    title: 'Recursive Definitions & Base Cases',
    category: 'Recursion',
    gameId: 'tower-of-hanoi',
    prerequisites: [],
    rosenSection: 'Section 5.3',
    description: 'Decomposing a problem of size n into identical subproblems of size n-1 terminating at a well-defined base case.',
    status: 'available'
  },
  {
    id: 'recurrence-relations',
    title: 'Recurrence Relations T(n) = 2T(n-1) + 1',
    category: 'Recursion',
    gameId: 'tower-of-hanoi',
    prerequisites: ['recursion-base'],
    rosenSection: 'Section 8.1',
    description: 'Formulating recursive operational costs as recurrence relations and verifying boundary conditions.',
    status: 'locked'
  },
  {
    id: 'closed-form-recurrences',
    title: 'Closed Form Solutions & 2^n - 1 Growth',
    category: 'Recursion',
    gameId: 'tower-of-hanoi',
    prerequisites: ['recurrence-relations'],
    rosenSection: 'Section 8.2 & 8.3',
    description: 'Solving linear non-homogeneous recurrences by backward substitution and geometric series summation.',
    status: 'locked'
  },

  // Logic & Boolean Algebra
  {
    id: 'propositional-logic',
    title: 'Propositional Variables & Truth Values',
    category: 'Logic',
    gameId: 'minesweeper-logic',
    prerequisites: [],
    rosenSection: 'Section 1.1',
    description: 'Assigning Boolean variables (True = Mine, False = Safe) to represent statements with definite truth values.',
    status: 'available'
  },
  {
    id: 'logical-deduction',
    title: 'Logical Deduction & Linear Constraints',
    category: 'Logic',
    gameId: 'minesweeper-logic',
    prerequisites: ['propositional-logic'],
    rosenSection: 'Section 1.2 & 1.3',
    description: 'Transforming neighborhood counts into system of equations A + B + C = k and applying deductive rules.',
    status: 'locked'
  },
  {
    id: 'sat-solving',
    title: 'Constraint Satisfaction & Contradiction',
    category: 'Logic',
    gameId: 'minesweeper-logic',
    prerequisites: ['logical-deduction'],
    rosenSection: 'Section 1.3',
    description: 'Proving safe cells by reductio ad absurdum: assuming a mine at cell X leads to an impossible constraint conflict.',
    status: 'locked'
  },

  // Graph Theory
  {
    id: 'graph-models',
    title: 'Graph Models: Vertices & Edges',
    category: 'Graph Theory',
    gameId: 'maze-graph',
    prerequisites: [],
    rosenSection: 'Section 10.1',
    description: 'Abstracting physical passageways and intersections into formal mathematical graphs G = (V, E).',
    status: 'available'
  },
  {
    id: 'graph-traversal',
    title: 'Graph Traversal: BFS vs DFS',
    category: 'Graph Theory',
    gameId: 'maze-graph',
    prerequisites: ['graph-models'],
    rosenSection: 'Section 10.2',
    description: 'Comparing systematic exploration disciplines: Queue-driven FIFO (BFS) vs Stack-driven LIFO (DFS).',
    status: 'locked'
  },
  {
    id: 'shortest-path-optimality',
    title: 'Shortest Path Trees & Optimality Theorem',
    category: 'Graph Theory',
    gameId: 'maze-graph',
    prerequisites: ['graph-traversal'],
    rosenSection: 'Section 10.4',
    description: 'Rigorous proof that BFS guarantees the minimum edge distance in unweighted graphs.',
    status: 'locked'
  },
  {
    id: 'hamiltonian-paths',
    title: "Hamiltonian Paths & Warnsdorff's Heuristic",
    category: 'Graph Theory',
    gameId: 'knights-tour',
    prerequisites: ['graph-traversal'],
    rosenSection: 'Section 10.5',
    description: "Constructing simple paths visiting every vertex exactly once, contrasting Euler circuits with NP-complete Hamiltonian tours.",
    status: 'locked'
  },

  // Number Theory & Cryptography
  {
    id: 'modular-arithmetic',
    title: 'Congruence Modulo m & Cyclic Groups',
    category: 'Number Theory & Cryptography',
    gameId: 'caesar-cipher',
    prerequisites: [],
    rosenSection: 'Section 4.1',
    description: 'Arithmetic on equivalence classes modulo 26, wrap-around properties, and clock rings Z_26.',
    status: 'available'
  },
  {
    id: 'shift-ciphers',
    title: 'Shift Ciphers: E(x) = (x + k) mod 26',
    category: 'Number Theory & Cryptography',
    gameId: 'caesar-cipher',
    prerequisites: ['modular-arithmetic'],
    rosenSection: 'Section 4.6',
    description: 'Formal algebraic representation of substitution ciphers and frequency distribution analysis.',
    status: 'locked'
  },
  {
    id: 'modular-inverses',
    title: 'Modular Inverses & Decryption D(y)',
    category: 'Number Theory & Cryptography',
    gameId: 'caesar-cipher',
    prerequisites: ['shift-ciphers'],
    rosenSection: 'Section 4.4 & 4.6',
    description: 'Inverting affine and shift transformations using additive and multiplicative inverses in Z_m.',
    status: 'locked'
  },

  // Combinatorics & Game Theory
  {
    id: 'binary-representation',
    title: 'Binary Positional Numeration & Powers of 2',
    category: 'Combinatorics & Game Theory',
    gameId: 'nim-combinatorics',
    prerequisites: [],
    rosenSection: 'Section 4.2',
    description: 'Decomposing non-negative integers into sums of distinct powers of two: n = sum(b_i * 2^i).',
    status: 'available'
  },
  {
    id: 'nim-sum-xor',
    title: 'Nim-Sum & Bitwise XOR (⊕)',
    category: 'Combinatorics & Game Theory',
    gameId: 'nim-combinatorics',
    prerequisites: ['binary-representation'],
    rosenSection: 'Section 4.2',
    description: 'Addition without carry in GF(2): computing bit parity across pile sizes to identify symmetric states.',
    status: 'locked'
  },
  {
    id: 'boutons-theorem',
    title: "Bouton's Theorem & P/N Impartial Game Analysis",
    category: 'Combinatorics & Game Theory',
    gameId: 'nim-combinatorics',
    prerequisites: ['nim-sum-xor'],
    rosenSection: 'Section 4.2 & Supplementary Games',
    description: 'Characterizing kernel positions: a position is Previous-player winning (P-position) iff Nim-Sum = 0.',
    status: 'locked'
  }
];

export function getRecommendedNextNodes(masteredIds: string[]): KnowledgeNode[] {
  return KNOWLEDGE_GRAPH_NODES.filter(node => {
    if (masteredIds.includes(node.id)) return false;
    // all prerequisites must be satisfied
    const prereqsMet = node.prerequisites.every(p => masteredIds.includes(p));
    return prereqsMet;
  });
}
