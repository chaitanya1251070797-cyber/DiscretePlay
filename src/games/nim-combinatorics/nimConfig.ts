import { GameDefinition } from '../../types/learning';

export const nimGameDefinition: GameDefinition = {
  id: 'nim-combinatorics',
  title: 'Nim & Combinatorial Game Theory',
  subtitle: 'Binary Representation, Bitwise XOR & Nim-Sum (Bouton’s Theorem)',
  tagline: 'Uncover the secret binary mathematics that turns an ancient game of matchsticks into an invincible victory algorithm.',
  category: 'Combinatorics & Game Theory',
  concept: {
    id: 'nim-sum-xor',
    name: 'Binary Representations, Nim-Sum (XOR) & Bouton’s Theorem',
    category: 'Combinatorics & Game Theory',
    simpleExplanation: 'In Nim, players take any number of objects from a single pile. It seems like intuition, but Charles Bouton proved in 1901 that the game is completely determined by writing each pile size in Binary and calculating their Bitwise XOR sum (Nim-Sum). If the XOR sum is 0, you are safe; if it is non-zero, you can win in one move!',
    formalDefinition: 'Let the game state consist of k heaps with sizes (n_1, n_2, \\dots, n_k). The Nim-Sum is the bitwise XOR sum: S = n_1 \\oplus n_2 \\oplus \\dots \\oplus n_k. By Bouton\'s Theorem, a position is a P-position (zero-sum, winning for the previous player) iff S = 0. A position is an N-position iff S > 0, from which there always exists a legal move to a P-position.',
    formulas: [
      {
        label: 'Nim-Sum Definition',
        latex: 'S = n_1 \\oplus n_2 \\oplus \\dots \\oplus n_k = 0',
        explanation: 'Each bit column of the binary expansion of pile sizes must have an even parity (even number of 1s).'
      },
      {
        label: 'Winning Move Transition',
        latex: 'n_i\' = n_i \\oplus S < n_i',
        explanation: 'Find any pile whose binary expansion contains a 1 in the most significant bit of S; reduce that pile to n_i XOR S.'
      }
    ],
    rosenReference: {
      edition: '8th Edition',
      chapter: 'Chapter 4: Number Theory and Cryptography',
      section: 'Section 4.2: Integer Representations and Algorithms',
      topic: 'Binary Expansions, Bit Operations & Combinatorial Games',
      citation: 'Kenneth H. Rosen, Discrete Mathematics and Its Applications',
      excerpt: 'Integers can be expressed using base 2 expansions as sums of powers of two. The exclusive-or operation (XOR) corresponds to addition modulo 2 without carries. In combinatorial game theory, the Nim-sum of integers is computed using XOR. A player who maintains a Nim-sum of 0 at the end of every turn can force a win in the game of Nim.'
    },
    gameConnection: 'Whenever you leave the matchstick piles with a Nim-Sum of 0, your opponent has no choice but to break the symmetry and leave an unbalanced state ($S \\ne 0$), allowing you to restore it back to 0 on your next turn.',
    realWorldApplications: [
      'Error-detecting and error-correcting codes (Hamming codes, Parity bits, RAID-5 disk parity)',
      'Cryptography (Stream ciphers, One-Time Pad OTP security, Feistel cipher XOR permutations)',
      'Game AI and Minimax evaluation functions with alpha-beta pruning',
      'Quantum computing parity checks and stabilizer codes'
    ]
  },
  stages: {
    DISCOVER: {
      title: 'Discover: Taking Matchsticks',
      description: 'Play a round of Nim with piles of sizes [3, 4, 5]. Click a pile and remove between 1 and all sticks.',
      learningGoal: 'Discover that taking the last stick wins the game under normal play convention.',
      tasks: [
        'Select a pile and remove sticks',
        'Observe the computer teacher respond with its countermove',
        'Notice how symmetric states like [2, 2] or [1, 1, 0] guarantee victory'
      ]
    },
    EXPERIMENT: {
      title: 'Experiment: Hunting Winning Positions',
      description: 'Experiment with various pile combinations to see which positions feel "unlosable".',
      learningGoal: 'Identify that equal pairs (like [3, 3] or [4, 4]) allow a player to mirror every move.',
      tasks: [
        'Form a state with two equal piles [3, 3, 0]',
        'Observe how whatever the opponent takes, you can take from the other pile',
        'Notice that symmetry can be generalized to 3 or more piles'
      ]
    },
    GUIDED_REASONING: {
      title: 'Guided Reasoning: The Binary Revelation',
      description: 'Convert pile sizes 3, 4, 5 into binary numbers: 011, 100, 101. Sum each column modulo 2.',
      learningGoal: 'Compute the Nim-Sum (XOR sum) and correlate non-zero sums with winning leverage.',
      tasks: [
        'Examine the binary bit columns for piles [3, 4, 5]',
        'Calculate 3 XOR 4 XOR 5 = (011) XOR (100) XOR (101)',
        'Answer the prediction check on which pile must be altered to reach 0'
      ]
    },
    MATHEMATICAL_REVELATION: {
      title: 'Mathematical Revelation: Bouton’s Theorem & Parity',
      description: 'Explore Bouton’s Theorem (1901), Sprague-Grundy theory, and binary arithmetic from Rosen Chapter 4.',
      learningGoal: 'Master the algorithm n_i\' = n_i XOR S to immediately identify the winning move.',
      tasks: [
        'Inspect the interactive Bit-Parity Matrix visualizer',
        'Review the mathematical proof of P-positions and N-positions',
        'Read Kenneth H. Rosen Section 4.2 application notes'
      ]
    },
    INDEPENDENT_APPLICATION: {
      title: 'Independent Application: Invincible Countermove Challenge',
      description: 'You are handed piles of sizes [3, 5, 7]. Calculate the Nim-sum and execute the single winning move that forces the Nim-Sum to 0.',
      learningGoal: 'Execute Bouton’s XOR transformation independently under time and error constraints.',
      tasks: [
        'Compute S = 3 XOR 5 XOR 7 = 011 XOR 101 XOR 111 = 001 = 1',
        'Find the pile that must be reduced',
        'Reduce pile 7 to 7 XOR 1 = 6 (or pile 3 to 2, or pile 5 to 4)',
        'Win the endgame flawlessly to earn Combinatorics Master badge'
      ]
    }
  },
  thinkPrompts: [
    {
      id: 'nim-xor-think',
      question: 'Consider pile sizes [1, 2, 3]. In binary: 1 = 01_2, 2 = 10_2, 3 = 11_2. What is their Nim-Sum (Bitwise XOR: 1 ⊕ 2 ⊕ 3)? Is this position winning for the player whose turn it is?',
      contextHint: 'Column 1 (2^0): 1 + 0 + 1 = 2 (even -> 0). Column 2 (2^1): 0 + 1 + 1 = 2 (even -> 0).',
      options: [
        {
          text: 'Nim-Sum is 0 (00_2). It is a P-position (losing for the next player to move if opponent plays optimally).',
          isCorrect: true,
          explanation: 'Superb! Because the Nim-sum is 0, every bit column has even parity. Any move you make will disrupt this balance and give your opponent the advantage.'
        },
        {
          text: 'Nim-Sum is 6 (110_2). It is an N-position (winning for whoever moves next).',
          isCorrect: false,
          explanation: 'That is standard addition (1 + 2 + 3 = 6), not bitwise XOR! In XOR addition without carry, 1 ⊕ 2 ⊕ 3 = 0.'
        },
        {
          text: 'Nim-Sum is 1. The player can take 1 stick from pile 1 to win.',
          isCorrect: false,
          explanation: 'Compute column by column: right column has two 1s (sum 0 mod 2), left column has two 1s (sum 0 mod 2). Total is 0!'
        }
      ]
    }
  ],
  hints: [
    {
      id: 'nim-hint-1',
      tier: 1,
      title: 'Write in Powers of 2',
      content: 'Break each pile into powers of 2 (4, 2, 1). For example, 5 = 4 + 1; 3 = 2 + 1; 7 = 4 + 2 + 1.'
    },
    {
      id: 'nim-hint-2',
      tier: 2,
      title: 'Check the Parity of Each Power',
      content: 'Count how many times each power of 2 appears across all piles. If every power of 2 appears an EVEN number of times, the Nim-Sum is 0.'
    },
    {
      id: 'nim-hint-3',
      tier: 3,
      title: 'Bouton\'s Winning Formula',
      content: 'Calculate S = n_1 XOR n_2 XOR ... XOR n_k. Find the highest power of 2 in S (say 2^b). Pick ANY pile that has a 1 in bit position b, and change that pile to (n_i XOR S).',
      formulaSnippet: 'n_i^{\\text{new}} = n_i \\oplus S'
    }
  ],
  independentChallengeGoal: 'Calculate the Nim-sum of [3, 5, 7] and reduce one pile to balance the XOR sum to exactly 0.'
};

