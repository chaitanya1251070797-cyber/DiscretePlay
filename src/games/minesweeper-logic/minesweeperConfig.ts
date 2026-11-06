import { GameDefinition } from '../../types/learning';

export const minesweeperGameDefinition: GameDefinition = {
  id: 'minesweeper-logic',
  title: 'Minesweeper Logic Deduction',
  subtitle: 'Boolean Variables, Propositional Logic & Constraint Satisfaction',
  tagline: 'Replace guesswork with mathematical proof: formulate neighborhood clues as Boolean systems.',
  category: 'Logic',
  concept: {
    id: 'propositional-logic',
    name: 'Propositional Logic & Constraint Satisfaction (SAT)',
    category: 'Logic',
    simpleExplanation: 'Each unrevealed square is a Boolean variable: True (1) if it holds a mine, False (0) if it is safe. Every revealed number forms a linear constraint equation on its neighboring variables. We deduce safety without ever guessing!',
    formalDefinition: 'Let X_{i,j} in {0, 1} be a Boolean indicator variable for cell (i, j), where X_{i,j} = 1 represents a mine. For a revealed cell (r, c) with numerical clue k and neighborhood N(r, c), the constraint is: sum_{(i,j) in N(r,c)} X_{i,j} = k. A cell is proven safe iff assigning X_{u,v} = 1 creates an unsatisfiable clause set (proof by contradiction).',
    formulas: [
      {
        label: 'Neighborhood Linear Boolean Constraint',
        latex: '\\sum_{(i,j) \\in N(r, c)} X_{i,j} = k, \\quad X_{i,j} \\in \\{0, 1\\}',
        explanation: 'The sum of mine indicator variables in the 8-neighborhood must exactly equal the revealed integer clue.'
      },
      {
        label: 'Modus Ponens Deduction',
        latex: '(\\text{Flagged}(N) = k) \\implies (\\forall u \\in N \\setminus \\text{Flagged}: X_u = 0)',
        explanation: 'If the number of confirmed mines equals the clue, all remaining unrevealed neighbors are mathematically guaranteed safe.'
      }
    ],
    rosenReference: {
      edition: '8th Edition',
      chapter: 'Chapter 1: The Foundations: Logic and Proofs',
      section: 'Section 1.1: Propositional Logic & Section 1.3: Propositional Equivalences (SAT Solving)',
      topic: 'Applications of Satisfiability: Puzzle Solving and Constraint Networks',
      citation: 'Kenneth H. Rosen, Discrete Mathematics and Its Applications',
      excerpt: 'A compound proposition is satisfiable if there is an assignment of truth values to its variables that makes it true. Many mathematical problems and grid puzzles can be translated into satisfiability problems. We assign propositional variables to cells and express rules as conjunctions of clauses.'
    },
    gameConnection: 'When a cell reveals "1" with only one hidden neighbor, the proposition "Neighbor = Mine" is tautological. Overlapping regions yield systems like A + B = 1 and B + C = 1, proving A = C.',
    realWorldApplications: [
      'Automated Theorem Proving (Z3, SAT/SMT Solvers)',
      'Hardware verification and microchip circuit validation',
      'Artificial Intelligence constraint satisfaction (CSP) & scheduling',
      'Software dependency resolution (e.g. npm, apt package dependency trees)'
    ]
  },
  stages: {
    DISCOVER: {
      title: 'Discover: Clues as Truth Conditions',
      description: 'Interact with the 4x4 logic grid. Click safe cells to reveal clues and flag suspected mines.',
      learningGoal: 'Recognize that revealed numbers reflect exact counts of neighboring mines.',
      tasks: [
        'Click cell (0, 0) to reveal an initial starting clue',
        'Observe how the number corresponds to the 8 adjacent cells',
        'Flag a cell that MUST contain a mine'
      ]
    },
    EXPERIMENT: {
      title: 'Experiment: Simple Deductive Rules',
      description: 'Complete the beginner puzzle using direct single-cell deduction without guessing.',
      learningGoal: 'Apply the boundary condition: if unrevealed count equals clue, all are mines.',
      tasks: [
        'Identify a cell where unrevealed neighbors equal the number',
        'Flag those mines',
        'Reveal adjacent cells whose constraints are now fully satisfied'
      ]
    },
    GUIDED_REASONING: {
      title: 'Guided Reasoning: Systems of Equations',
      description: 'Examine overlapping clues: Clue 1 with cells {A, B} and Clue 2 with cells {A, B, C}.',
      learningGoal: 'Perform variable substitution: if A + B = 1 and (A + B) + C = 2, then C = 1.',
      tasks: [
        'Answer the deductive equation prompt',
        'Use subtraction of equations to isolate the guaranteed mine',
        'Verify with truth table evaluation'
      ]
    },
    MATHEMATICAL_REVELATION: {
      title: 'Mathematical Revelation: SAT & Proof by Contradiction',
      description: 'Explore Boolean satisfiability (SAT), truth vectors, and Kenneth H. Rosen Chapter 1.',
      learningGoal: 'Understand how propositional logic eliminates uncertainty in discrete systems.',
      tasks: [
        'Inspect the interactive Boolean Matrix and Truth Assignment solver',
        'Review the formal proof by contradiction for cell safety',
        'Read Rosen 8th Edition Section 1.3 SAT solving notes'
      ]
    },
    INDEPENDENT_APPLICATION: {
      title: 'Independent Application: 5x5 Deterministic Board',
      description: 'Solve a 5x5 board containing 4 hidden mines using pure logical deduction with zero guesses.',
      learningGoal: 'Prove complete board validity under zero-error tolerance.',
      tasks: [
        'Deduce all 4 mine coordinates',
        'Reveal all safe cells without triggering any mine',
        'Attain Logic & Proofs Concept Mastery badge'
      ]
    }
  },
  thinkPrompts: [
    {
      id: 'minesweeper-overlap-think',
      question: 'Cell 1 touches hidden neighbors {A, B} and says "1" (A + B = 1). Neighboring Cell 2 touches {A, B, C} and says "2" (A + B + C = 2). What can you deduce about C?',
      contextHint: 'Substitute (A + B = 1) directly into the second equation: 1 + C = 2.',
      options: [
        {
          text: 'C is GUARANTEED to be a Mine (C = 1).',
          isCorrect: true,
          explanation: 'Brilliant deduction! Since (A + B) provides exactly 1 mine towards Cell 2\'s count of 2, the remaining cell C MUST be a mine.'
        },
        {
          text: 'C is guaranteed to be Safe (C = 0).',
          isCorrect: false,
          explanation: 'If C were 0, then A + B would need to equal 2, which contradicts Cell 1\'s clue that A + B = 1!'
        },
        {
          text: 'It is a 50/50 probability guess between A, B, and C.',
          isCorrect: false,
          explanation: 'No guessing required! The algebraic substitution (A + B = 1) proves C = 1 with 100% mathematical certainty.'
        }
      ]
    }
  ],
  hints: [
    {
      id: 'mine-hint-1',
      tier: 1,
      title: 'Look for Saturated Clues',
      content: 'Find any clue where the count of already flagged mines equals the clue number. All remaining hidden neighbors around that clue are 100% SAFE!'
    },
    {
      id: 'mine-hint-2',
      tier: 2,
      title: '1-1 Pattern at Boundaries',
      content: 'When two adjacent "1"s share overlapping cells, the non-overlapping neighbor of the second "1" cannot contain a mine if the first "1" forces the mine into the shared intersection.'
    },
    {
      id: 'mine-hint-3',
      tier: 3,
      title: 'Boolean Reduction',
      content: 'Translate the board into linear equations: sum(X_i) = k. Whenever two subsets overlap, subtract equations to isolate single variable assignments.',
      formulaSnippet: 'A + B + C = 2 \\land A + B = 1 \\implies C = 1'
    }
  ],
  independentChallengeGoal: 'Clear all safe cells on the 5x5 board without making a single exploratory guess.'
};

