import { GameDefinition } from '../../types/learning';

export const mazeGameDefinition: GameDefinition = {
  id: 'maze-graph',
  title: 'Maze Graph Explorer',
  subtitle: 'Graph Models, Traversal & Shortest-Path Optimality',
  tagline: 'Transform corridors and walls into graphs G=(V,E) and race BFS vs DFS across the frontier.',
  category: 'Graph Theory',
  concept: {
    id: 'graph-traversal',
    name: 'Graph Models, BFS Traversal & Shortest Path Optimality',
    category: 'Graph Theory',
    simpleExplanation: 'Every open cell in a maze is a Vertex (Node), and every open passage between neighboring cells is an Edge. Navigating the maze is identical to traversing a Graph G=(V, E). Breadth-First Search (BFS) uses a Queue to explore radially outward in concentric waves, guaranteeing the shortest route.',
    formalDefinition: 'Let G = (V, E) be an unweighted, connected graph where V represents passable cells and E represents orthogonal transitions. Breadth-First Search (BFS) systematically discovers all vertices at distance k from root s before any vertices at distance k+1 using a First-In-First-Out (FIFO) queue. By the BFS Shortest-Path Theorem, d(s, v) = delta(s, v) for all v in V.',
    formulas: [
      {
        label: 'Graph Representation',
        latex: 'G = (V, E), \\quad V \\subseteq \\mathbb{Z} \\times \\mathbb{Z}, \\quad E = \\{(u, v) \\mid \\|u - v\\|_1 = 1\\}',
        explanation: 'Vertices are valid grid coordinates; edges exist between adjacent open cells.'
      },
      {
        label: 'BFS Queue Invariant & Distance Monotonicity',
        latex: 'Q = \\langle v_1, v_2, \\dots, v_r \\rangle \\implies d(s, v_1) \\le d(s, v_r) \\le d(s, v_1) + 1',
        explanation: 'Vertices in the BFS queue differ in distance from source by at most 1, guaranteeing shortest path optimality.'
      }
    ],
    rosenReference: {
      edition: '8th Edition',
      chapter: 'Chapter 10: Graphs',
      section: 'Section 10.2: Graph Terminology & Section 10.4: Connectivity (Breadth-First Search)',
      topic: 'Algorithm 1: Breadth-First Search and Shortest Paths',
      citation: 'Kenneth H. Rosen, Discrete Mathematics and Its Applications',
      excerpt: 'Breadth-first search begins by selecting an arbitrary vertex and visiting all its neighbors before moving to vertices at the next distance level. BFS produces a spanning tree and can find the shortest path between any two vertices in an unweighted graph because it explores all vertices reachable in k steps before considering any that require k+1 steps.'
    },
    gameConnection: 'When you manually navigate the maze, your mind acts like Depth-First Search (going down a path until hitting a wall). BFS, conversely, searches all parallel corridors simultaneously, ensuring no detour is taken.',
    realWorldApplications: [
      'GPS navigation and shortest routing protocols (OSPF, RIP)',
      'Social network degrees of separation (LinkedIn 1st/2nd/3rd connections)',
      'Web crawlers indexing the World Wide Web',
      'Peer-to-peer network routing and distributed packet forwarding'
    ]
  },
  stages: {
    DISCOVER: {
      title: 'Discover: Manual Navigation',
      description: 'Navigate the maze from Start (green) to Goal (gold) using arrow controls or clicking adjacent cells.',
      learningGoal: 'Experience the frustration of dead ends and observe how intersections present branching decisions.',
      tasks: [
        'Move from Start (0,0) toward the Goal (6,6)',
        'Encounter at least one dead end and backtrack',
        'Successfully reach the Goal'
      ]
    },
    EXPERIMENT: {
      title: 'Experiment: BFS vs DFS Race',
      description: 'Watch BFS (Queue, cyan) and DFS (Stack, violet) traverse the maze simultaneously.',
      learningGoal: 'Observe how DFS plunges deeply down single branches while BFS spreads in uniform concentric ripples.',
      tasks: [
        'Run the side-by-side traversal animation',
        'Compare total visited nodes between BFS and DFS',
        'Notice the difference in path length found by both algorithms'
      ]
    },
    GUIDED_REASONING: {
      title: 'Guided Reasoning: Queue vs Stack',
      description: 'Investigate why data structure choice dictates algorithmic traversal behavior.',
      learningGoal: 'Understand why a FIFO queue yields shortest path optimality while a LIFO stack does not.',
      tasks: [
        'Answer the data structure question comparing Queue and Stack',
        'Analyze the frontier order in the animated queue widget',
        'Verify the distance monotonicity invariant'
      ]
    },
    MATHEMATICAL_REVELATION: {
      title: 'Mathematical Revelation: Graph G=(V,E) & Optimality Theorem',
      description: 'Formalize vertices, edges, adjacency matrices, and Rosen Section 10.4 shortest path proof.',
      learningGoal: 'Formulate the mathematical proof of why BFS guarantees minimal edge path.',
      tasks: [
        'Inspect the dual-representation (Maze Grid <-> Graph Node Network)',
        'Review the BFS Spanning Tree construction',
        'Examine Kenneth H. Rosen 8th Edition Chapter 10'
      ]
    },
    INDEPENDENT_APPLICATION: {
      title: 'Independent Application: Shortest Frontier Challenge',
      description: 'Given a complex branching graph maze, manually guide BFS by picking the next frontier node from the Queue to preserve minimum distance.',
      learningGoal: 'Demonstrate algorithmic precision in executing the BFS step function.',
      tasks: [
        'Select the optimal next expansion vertex from the active queue',
        'Find the exact shortest path length',
        'Earn the Graph Theory Master badge'
      ]
    }
  },
  thinkPrompts: [
    {
      id: 'maze-bfs-dfs-think',
      question: 'Why does Breadth-First Search (BFS) guarantee finding the SHORTEST route to the target in an unweighted maze, whereas Depth-First Search (DFS) does not?',
      contextHint: 'Consider how a FIFO (First-In, First-Out) queue processes nodes in strictly non-decreasing order of distance from Start.',
      options: [
        {
          text: 'BFS explores all nodes at distance k before ANY node at distance k+1, so the first time the goal is reached, it MUST be via minimal steps.',
          isCorrect: true,
          explanation: 'Precisely! Because distances in the BFS queue are monotonically non-decreasing, the first encounter with the goal vertex is mathematically guaranteed to be the shortest path.'
        },
        {
          text: 'BFS visits fewer total vertices than DFS on every possible maze.',
          isCorrect: false,
          explanation: 'Not necessarily! If the goal is near the end of a deep corridor, DFS might stumble upon it immediately, while BFS explores all directions first.'
        },
        {
          text: 'BFS uses a LIFO stack which reverses dead-end paths automatically.',
          isCorrect: false,
          explanation: 'DFS uses a LIFO stack, not BFS! BFS uses a FIFO queue.'
        }
      ]
    }
  ],
  hints: [
    {
      id: 'maze-hint-1',
      tier: 1,
      title: 'View Cells as Nodes',
      content: 'Ignore the walls for a moment. Picture each intersection as a circle (vertex) connected by lines (edges) to accessible adjacent intersections.'
    },
    {
      id: 'maze-hint-2',
      tier: 2,
      title: 'Queue Discipline',
      content: 'In BFS, when you stand at distance d, all your new unvisited neighbors are pushed to the back of the queue with label d+1. They wait their turn until all distance d nodes are processed.'
    },
    {
      id: 'maze-hint-3',
      tier: 3,
      title: 'Parent Pointers for Reconstruction',
      content: 'To extract the shortest path once the target is reached, backtrack using parent pointers: target -> parent(target) -> parent(parent(target)) -> ... -> start.',
      formulaSnippet: 'P = \\langle s = v_0, v_1, \\dots, v_k = g \\rangle, \\quad (v_i, v_{i+1}) \\in E'
    }
  ],
  independentChallengeGoal: 'Identify the shortest path length and trace the BFS parent tree on the complex graph maze.'
};

