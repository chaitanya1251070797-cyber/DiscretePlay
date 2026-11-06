import { GameDefinition } from '../../types/learning';

export const knightsGameDefinition: GameDefinition = {
  id: 'knights-tour',
  title: "Knight's Tour & Hamiltonian Paths",
  subtitle: "Backtracking & Warnsdorff's Heuristic",
  tagline: "Navigate every square on the board exactly once without revisiting.",
  category: "Graph Theory",
  concept: {
    id: 'hamiltonian-paths',
    name: "Hamiltonian Paths & Backtracking (Warnsdorff's Rule)",
    category: "Graph Theory",
    simpleExplanation: "A Knight's Tour is a Hamiltonian path on a knight's graph: a sequence of moves visiting every vertex on the chessboard exactly once. Warnsdorff's heuristic chooses moves leading to vertices of minimum unvisited degree.",
    formalDefinition: "Let G = (V, E) be the Knight's Graph where V is the set of chessboard squares and (u, v) in E iff a knight move connects u and v. A Hamiltonian path is a simple path in G containing every vertex in V.",
    formulas: [
      {
        label: "Hamiltonian Path Condition",
        latex: "P = (v_1, v_2, ..., v_n) \\text{ where } v_i \\neq v_j \\; \\forall i \\neq j, \\; |V| = n",
        explanation: "Every vertex in the graph must be visited exactly once in sequence."
      },
      {
        label: "Warnsdorff's Degree Heuristic",
        latex: "v_{next} = \\arg\\min_{u \\in N(v), u \\notin P} \\deg_{unvisited}(u)",
        explanation: "Always move to an adjacent unvisited square with the fewest onward legal moves to avoid cornering."
      }
    ],
    rosenReference: {
      edition: "8th Edition",
      chapter: "Chapter 10: Graphs",
      section: "Section 10.5",
      topic: "Euler and Hamilton Paths",
      citation: "Rosen, K. H. (2019). Discrete Mathematics and Its Applications (8th ed.), Section 10.5, pp. 703-718.",
      excerpt: "A simple path in a graph G that passes through every vertex is called a Hamilton path... Determining whether a graph has a Hamilton path or circuit is an NP-complete problem. The knight's tour problem asks for a Hamilton path on the graph whose vertices are squares of a chessboard."
    },
    gameConnection: "By highlighting available degrees of each square, students directly visualize Warnsdorff's greedy strategy versus naive backtracking.",
    realWorldApplications: [
      "Circuit board drilling optimization",
      "Network routing and packet delivery tours",
      "DNA sequencing fragment reassembly",
      "Robotic welding tool trajectory planning"
    ]
  },
  stages: {
    DISCOVER: {
      title: "Stage 1: Discover",
      description: "Explore knight movements and notice how squares near corners have fewer onward escape routes.",
      learningGoal: "Make 5 legal L-shaped moves and observe how edge squares restrict maneuverability.",
      tasks: [
        "Select an initial starting square for the Knight",
        "Make 5 consecutive legal moves without getting trapped",
        "Observe the degree count display on adjacent candidate squares"
      ]
    },
    EXPERIMENT: {
      title: "Stage 2: Experiment",
      description: "Test moving to high-degree centers versus low-degree edges.",
      learningGoal: "Observe how saving corners for last creates impassable dead-ends.",
      tasks: [
        "Reach a tour length of 10 squares",
        "Compare squares with degree 2 vs squares with degree 6"
      ]
    },
    GUIDED_REASONING: {
      title: "Stage 3: Guided Reasoning",
      description: "Formulate Warnsdorff's heuristic: why choosing minimum degree preserves future options.",
      learningGoal: "Understand why greedy selection of the tightest constraint prevents isolation.",
      tasks: [
        "Answer reasoning prompt regarding Warnsdorff's rule",
        "Identify candidate moves with minimum onward degrees"
      ]
    },
    MATHEMATICAL_REVELATION: {
      title: "Stage 4: Mathematical Revelation",
      description: "Formalize Hamiltonian paths on Knight's Graphs G = (V, E) and contrast with Eulerian paths.",
      learningGoal: "Learn Dirac's and Ore's sufficient conditions and NP-completeness of general Hamilton paths.",
      tasks: [
        "Inspect the Hamiltonian Path formulation",
        "Contrast Euler paths (visiting all edges) vs Hamilton paths (visiting all vertices)"
      ]
    },
    INDEPENDENT_APPLICATION: {
      title: "Stage 5: Independent Application",
      description: "Complete a full 5x5 Knight's Tour (25 squares) starting from any square.",
      learningGoal: "Successfully visit all 25 squares of a 5x5 board in a single unbroken Hamiltonian path.",
      tasks: [
        "Achieve a 25/25 tour on the 5x5 matrix",
        "Utilize degree indicators to guide optimal step choice"
      ]
    }
  },
  thinkPrompts: [
    {
      id: "knights-think-1",
      question: "According to Warnsdorff's heuristic, which square should the Knight move to next?",
      contextHint: "Think about what happens if you visit high-degree centers first while leaving corners untouched.",
      options: [
        {
          text: "The square with the LOWEST number of unvisited legal exits",
          isCorrect: true,
          explanation: "Correct! If you do not visit low-degree squares early, they become isolated dead-ends that you cannot enter and exit later."
        },
        {
          text: "The square with the HIGHEST number of unvisited legal exits",
          isCorrect: false,
          explanation: "High-degree squares are easily reachable from many directions; saving them provides flexible escape routes later."
        },
        {
          text: "Any square at random",
          isCorrect: false,
          explanation: "Random selection almost always gets trapped before completing 25 squares due to exponential dead-end branching."
        }
      ]
    }
  ],
  hints: [
    {
      id: "knights-hint-1",
      tier: 1,
      title: "Watch the Corners",
      content: "Corner squares (0,0), (0,4), (4,0), (4,4) only have 2 legal knight moves total. If you leave them unvisited until late in the game, you will be unable to exit them."
    },
    {
      id: "knights-hint-2",
      tier: 2,
      title: "Prioritize Small Numbers",
      content: "Each accessible candidate square displays a degree badge (1 to 8). Always prioritize candidate squares displaying the smallest number (Warnsdorff's rule)."
    },
    {
      id: "knights-hint-3",
      tier: 3,
      title: "Hamiltonian vs Eulerian",
      content: "Eulerian paths visit every edge in E exactly once (Handshaking lemma, all vertices even degree). Hamiltonian paths visit every vertex in V exactly once. Finding Hamilton paths is NP-complete.",
      formulaSnippet: "\\text{Hamilton Path } P \\subseteq G \\text{ visits all } v \\in V"
    }
  ],
  independentChallengeGoal: "Complete an unbroken 25-square Hamiltonian path on the 5x5 chessboard."
};
