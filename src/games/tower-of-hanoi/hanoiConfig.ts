import { GameDefinition } from '../../types/learning';

export const hanoiGameDefinition: GameDefinition = {
  id: 'tower-of-hanoi',
  title: 'Tower of Hanoi',
  subtitle: 'Recursion, Divide-and-Conquer & Recurrence Relations',
  tagline: 'Master how complex exponential challenges collapse into elegant recursive subproblems.',
  category: 'Recursion',
  concept: {
    id: 'recurrence-relations',
    name: 'Recurrence Relations & Divide-and-Conquer Recursion',
    category: 'Recursion',
    simpleExplanation: 'To move a tower of n disks, you must first move the top n-1 disks out of the way, move the largest disk, and then move the n-1 disks on top of it. This naturally splits the problem in two identical subproblems plus one single move.',
    formalDefinition: 'A recurrence relation for a sequence {a_n} is an equation that expresses a_n in terms of one or more of the previous terms of the sequence. For the Tower of Hanoi, T(n) represents the minimum number of moves to transfer n disks between pegs subject to the condition that no larger disk is placed on a smaller disk.',
    formulas: [
      {
        label: 'Recurrence Relation',
        latex: 'T(n) = 2T(n-1) + 1, \\quad T(1) = 1',
        explanation: 'Transfer n-1 disks to auxiliary peg (T(n-1)), move largest disk to target (1 move), transfer n-1 disks to target (T(n-1)).'
      },
      {
        label: 'Closed Form Solution',
        latex: 'T(n) = 2^n - 1',
        explanation: 'Derived by backward substitution: T(n) = 2(2T(n-2)+1)+1 = ... = 2^{n-1} + 2^{n-2} + ... + 1 = 2^n - 1.'
      }
    ],
    rosenReference: {
      edition: '8th Edition',
      chapter: 'Chapter 8: Advanced Counting Techniques',
      section: 'Section 8.1: Applications of Recurrence Relations',
      topic: 'Example 1: The Tower of Hanoi',
      citation: 'Kenneth H. Rosen, Discrete Mathematics and Its Applications (McGraw-Hill)',
      excerpt: 'The Tower of Hanoi was invented by the French mathematician Édouard Lucas in 1883. We can use recurrence relations to analyze the number of moves required to solve the puzzle. Let H_n denote the number of moves needed to solve the puzzle with n disks. We can solve it in H_n = 2H_{n-1} + 1 moves. Using iteration, H_n = 2^n - 1.'
    },
    gameConnection: 'Every move you make either shifts the top sub-pyramid (T(n-1)) or the base disk. Any move that violates the size order breaks the inductive invariant.',
    realWorldApplications: [
      'Call-stack execution in recursion and compiler design',
      'Divide-and-Conquer algorithms (MergeSort, Fast Fourier Transform)',
      'Backup rotation schemes (Grandfather-Father-Son tape archiving)',
      'Gray code generation in telecommunications and hardware rotary encoders'
    ]
  },
  stages: {
    DISCOVER: {
      title: 'Discover: The Size Invariant',
      description: 'Interact with the 3 disks. Experiment moving disks between Peg A, Peg B, and Peg C.',
      learningGoal: 'Observe the essential rule: a larger disk can NEVER rest on a smaller disk.',
      tasks: [
        'Move disk 1 to an adjacent peg',
        'Attempt to place a larger disk on top of disk 1 to observe the violation',
        'Notice how disks must be shuffled to free the bottom disk'
      ]
    },
    EXPERIMENT: {
      title: 'Experiment: Counting Transitions',
      description: 'Solve the 3-disk puzzle while tracking your total moves.',
      learningGoal: 'Identify that moving the bottom disk requires all other disks to be stacked neatly on the auxiliary peg.',
      tasks: [
        'Transfer the full 3-disk tower from Peg A to Peg C',
        'Observe how many moves you used (optimal is 7)',
        'Notice the midway state where disk 3 is on Peg A and disks 1 & 2 are on Peg B'
      ]
    },
    GUIDED_REASONING: {
      title: 'Guided Reasoning: Identifying Subproblems',
      description: 'Analyze the structural symmetry: solving for n disks requires solving for n-1 disks twice.',
      learningGoal: 'Express the operation count as a recursive formula T(n) = 2T(n-1) + 1.',
      tasks: [
        'Answer the prediction question on intermediate peg states',
        'Confirm that transferring 2 disks takes 3 moves',
        'Confirm that transferring 3 disks takes 2*(3) + 1 = 7 moves'
      ]
    },
    MATHEMATICAL_REVELATION: {
      title: 'Mathematical Revelation: Induction & Recurrences',
      description: 'Unpack the formal recurrence relation, mathematical induction proof, and call tree.',
      learningGoal: 'Derive closed-form T(n) = 2^n - 1 and explore Kenneth H. Rosen Section 8.1.',
      tasks: [
        'Inspect the animated recursive call tree',
        'Review the backward substitution proof',
        'Read Rosen 8th Edition Section 8.1 commentary'
      ]
    },
    INDEPENDENT_APPLICATION: {
      title: 'Independent Application: 4-Disk Mastery Challenge',
      description: 'Transfer a 4-disk tower with minimal moves (optimal budget: 15 moves) without relying on hints.',
      learningGoal: 'Demonstrate independent mastery of the recursive invariant under strict move constraints.',
      tasks: [
        'Solve the 4-disk puzzle in <= 18 moves',
        'Maintain zero rule violations',
        'Achieve concept mastery badge'
      ]
    }
  },
  thinkPrompts: [
    {
      id: 'hanoi-subproblem-think',
      question: 'Before you can move Disk 3 (the largest) from Peg A to Peg C, where MUST Disks 1 and 2 be located?',
      contextHint: 'Remember: Disk 3 cannot be placed on top of any disk, and Peg C must be empty to receive it.',
      options: [
        {
          text: 'Disks 1 and 2 must be stacked in order on Peg B (the auxiliary peg).',
          isCorrect: true,
          explanation: 'Exactly! Peg C must be vacant to receive Disk 3, so all n-1 smaller disks must temporarily reside on Peg B.'
        },
        {
          text: 'Disks 1 and 2 can be spread across Peg B and Peg C.',
          isCorrect: false,
          explanation: 'If any disk is on Peg C, Disk 3 cannot be placed there because Disk 3 is larger than both!'
        },
        {
          text: 'It does not matter as long as Disk 3 is moved first.',
          isCorrect: false,
          explanation: 'Disk 3 is at the very bottom of Peg A and cannot move until Disks 1 and 2 are removed!'
        }
      ]
    },
    {
      id: 'hanoi-recurrence-predict',
      question: 'If solving a 3-disk tower takes 7 moves, how many moves will a 4-disk tower take?',
      contextHint: 'Apply T(n) = 2T(n-1) + 1 with n=4 and T(3)=7.',
      options: [
        {
          text: '15 moves (2 * 7 + 1 = 15)',
          isCorrect: true,
          explanation: 'Spot on! You must move 3 disks to the middle (7 moves), move disk 4 (1 move), and move 3 disks to the target (7 moves).'
        },
        {
          text: '10 moves (7 + 3 = 10)',
          isCorrect: false,
          explanation: 'The growth is not linear! You have to move the whole 3-disk stack twice.'
        },
        {
          text: '14 moves (2 * 7 = 14)',
          isCorrect: false,
          explanation: 'Do not forget the 1 move needed for the largest disk itself: 2 * 7 + 1 = 15.'
        }
      ]
    }
  ],
  hints: [
    {
      id: 'hanoi-hint-1',
      tier: 1,
      title: 'Think in Subproblems',
      content: 'Do not focus on all disks at once. Imagine the top 2 disks as a single unified sub-tower that must go to Peg B first.'
    },
    {
      id: 'hanoi-hint-2',
      tier: 2,
      title: 'The Parity Rule',
      content: 'For an odd number of disks (n=3), your very first move with Disk 1 should be to the destination peg (Peg C). For an even number (n=4), move Disk 1 to the auxiliary peg (Peg B).'
    },
    {
      id: 'hanoi-hint-3',
      tier: 3,
      title: 'The Recurrence Formula',
      content: 'The total moves is always 2^n - 1. For 3 disks: 2^3 - 1 = 7. For 4 disks: 2^4 - 1 = 16 - 1 = 15.',
      formulaSnippet: 'T(n) = 2^n - 1'
    }
  ],
  independentChallengeGoal: 'Transfer all 4 disks to Peg C in 15 moves to prove mastery of recursive decomposition.'
};

