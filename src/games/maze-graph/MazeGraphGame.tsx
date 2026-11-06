import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLearningEngine } from '../../engine/LearningEngineContext';
import { Play, RotateCcw, Compass, GitBranch, FastForward, CheckCircle2 } from 'lucide-react';

const MAZE_GRID = [
  [0, 0, 1, 0, 0, 0, 0],
  [0, 1, 1, 0, 1, 1, 0],
  [0, 0, 0, 0, 0, 1, 0],
  [1, 1, 0, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 0],
  [0, 1, 0, 0, 0, 1, 0],
  [0, 0, 0, 1, 0, 0, 0] // (6, 6) is goal
];

const ROWS = MAZE_GRID.length;
const COLS = MAZE_GRID[0].length;

export const MazeGraphGame: React.FC = () => {
  const { 
    currentStage, 
    recordAction, 
    addExplanation, 
    advanceStage, 
    markConceptMastered,
    updateSharedGameState,
    setInteractionMode
  } = useLearningEngine();

  // Manual player position
  const [playerPos, setPlayerPos] = useState<[number, number]>([0, 0]);
  const [visitedManual, setVisitedManual] = useState<Set<string>>(new Set(['0,0']));
  const [manualWon, setManualWon] = useState<boolean>(false);

  // Traversal animation states
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simAlgorithm, setSimAlgorithm] = useState<'BFS' | 'DFS'>('BFS');
  const [bfsVisited, setBfsVisited] = useState<string[]>([]);
  const [dfsVisited, setDfsVisited] = useState<string[]>([]);
  const [activeQueue, setActiveQueue] = useState<{ node: string; dist: number }[]>([]);
  const [activeStack, setActiveStack] = useState<{ node: string; depth: number }[]>([]);
  const [shortestPathCells, setShortestPathCells] = useState<Set<string>>(new Set());

  const timerRef = useRef<any>(null);

  // Reset positions
  const resetManual = useCallback(() => {
    setPlayerPos([0, 0]);
    setVisitedManual(new Set(['0,0']));
    setManualWon(false);
  }, []);

  // Update shared state for the dual visualizer
  useEffect(() => {
    updateSharedGameState({
      queue: activeQueue.slice(0, 5),
      stack: activeStack.slice(0, 5),
      algorithm: simAlgorithm
    });
  }, [activeQueue, activeStack, simAlgorithm, updateSharedGameState]);

  // Handle manual movement
  const movePlayer = (r: number, c: number) => {
    if (manualWon || isSimulating) return;
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
    if (MAZE_GRID[r][c] === 1) {
      recordAction(false, 'hit_wall', 'Collided with a wall obstacle! In graph terms, this edge does not exist in E.');
      return;
    }

    const [pr, pc] = playerPos;
    const dist = Math.abs(pr - r) + Math.abs(pc - c);
    if (dist !== 1) return; // only orthogonal moves

    setPlayerPos([r, c]);
    const key = `${r},${c}`;
    const nextVisited = new Set(visitedManual);
    nextVisited.add(key);
    setVisitedManual(nextVisited);
    recordAction(true);

    if (r === ROWS - 1 && c === COLS - 1) {
      setManualWon(true);
      addExplanation(
        'Manual Navigation Path Found!',
        `You navigated through the maze to Goal (${r}, ${c}).`,
        `Notice the manual exploratory trail. Can you guarantee it was the shortest possible path without BFS?`,
        'strategic_subgoal',
        'Rosen Section 10.4: Shortest Paths and Trees'
      );
      if (currentStage === 'DISCOVER') {
        advanceStage();
      }
    }
  };

  // Run BFS Traversal Simulation
  const runBFSSimulation = () => {
    clearInterval(timerRef.current);
    setIsSimulating(true);
    setSimAlgorithm('BFS');
    setBfsVisited([]);
    setShortestPathCells(new Set());

    const queue: [number, number, number][] = [[0, 0, 0]]; // r, c, dist
    const visited = new Set<string>(['0,0']);
    const parent = new Map<string, string>();
    const order: string[] = [];

    const liveQueueState: { node: string; dist: number }[] = [{ node: '(0,0)', dist: 0 }];
    setActiveQueue(liveQueueState);

    timerRef.current = setInterval(() => {
      if (queue.length === 0) {
        clearInterval(timerRef.current);
        setIsSimulating(false);
        return;
      }

      const [r, c, dist] = queue.shift()!;
      order.push(`${r},${c}`);
      setBfsVisited([...order]);

      if (r === ROWS - 1 && c === COLS - 1) {
        clearInterval(timerRef.current);
        setIsSimulating(false);

        // Reconstruct shortest path
        let curr = `${ROWS - 1},${COLS - 1}`;
        const path = new Set<string>();
        while (curr) {
          path.add(curr);
          curr = parent.get(curr)!;
        }
        setShortestPathCells(path);

        addExplanation(
          'BFS Shortest Path Invariant Proven!',
          `BFS reached the goal at minimal distance = ${dist} steps!`,
          `FIFO Queue invariant ensures all vertices at distance d are visited before distance d+1. Hence d(s, Goal) is guaranteed minimal.`,
          'strategic_subgoal',
          'Rosen 8th Edition Theorem: BFS Shortest Path Optimality'
        );

        if (currentStage === 'INDEPENDENT_APPLICATION') {
          markConceptMastered('graph-traversal');
        }
        return;
      }

      // Explore 4 neighbors
      const neighbors = [
        [r - 1, c],
        [r + 1, c],
        [r, c - 1],
        [r, c + 1]
      ];

      for (const [nr, nc] of neighbors) {
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && MAZE_GRID[nr][nc] === 0) {
          const key = `${nr},${nc}`;
          if (!visited.has(key)) {
            visited.add(key);
            parent.set(key, `${r},${c}`);
            queue.push([nr, nc, dist + 1]);
            liveQueueState.push({ node: `(${nr},${nc})`, dist: dist + 1 });
          }
        }
      }
      setActiveQueue([...queue.map(([qr, qc, qd]) => ({ node: `(${qr},${qc})`, dist: qd }))]);
    }, 120);
  };

  // Run DFS Traversal Simulation
  const runDFSSimulation = () => {
    clearInterval(timerRef.current);
    setIsSimulating(true);
    setSimAlgorithm('DFS');
    setDfsVisited([]);
    setShortestPathCells(new Set());

    const stack: [number, number, number][] = [[0, 0, 0]]; // r, c, depth
    const visited = new Set<string>(['0,0']);
    const order: string[] = [];

    timerRef.current = setInterval(() => {
      if (stack.length === 0) {
        clearInterval(timerRef.current);
        setIsSimulating(false);
        return;
      }

      const [r, c, depth] = stack.pop()!;
      order.push(`${r},${c}`);
      setDfsVisited([...order]);

      if (r === ROWS - 1 && c === COLS - 1) {
        clearInterval(timerRef.current);
        setIsSimulating(false);
        addExplanation(
          'DFS Reached Goal via Deep Exploration',
          `DFS reached goal, but had to backtrack through deep dead ends.`,
          `LIFO Stack explores arbitrary branches deeply, lacking shortest-path guarantees.`,
          'strategic_subgoal'
        );
        return;
      }

      const neighbors = [
        [r + 1, c],
        [r, c + 1],
        [r - 1, c],
        [r, c - 1]
      ];

      for (const [nr, nc] of neighbors) {
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && MAZE_GRID[nr][nc] === 0) {
          const key = `${nr},${nc}`;
          if (!visited.has(key)) {
            visited.add(key);
            stack.push([nr, nc, depth + 1]);
          }
        }
      }
      setActiveStack([...stack.map(([sr, sc, sd]) => ({ node: `(${sr},${sc})`, depth: sd }))]);
    }, 120);
  };

  return (
    <div className="theme-panel rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="glitch-text-fx">Maze Graph Traversal (BFS vs DFS)</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              G = (V, E) &bull; Glitchcore Noir
            </span>
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            {currentStage === 'DISCOVER' 
              ? 'Stage 1: Move manually (click adjacent cell) to explore intersections and dead-ends'
              : 'Stage 2-5: Race Breadth-First Search (Queue) vs Depth-First Search (Stack)'}
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={runBFSSimulation}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-700/80 hover:bg-cyan-600 text-white text-xs font-semibold shadow-md transition disabled:opacity-50 border border-cyan-400/50"
          >
            <Play className="w-3.5 h-3.5" />
            <span>BFS (FIFO Queue)</span>
          </button>

          <button
            onClick={runDFSSimulation}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-700/80 hover:bg-rose-600 text-white text-xs font-semibold shadow-md transition disabled:opacity-50 border border-rose-400/50"
          >
            <Play className="w-3.5 h-3.5" />
            <span>DFS (LIFO Stack)</span>
          </button>

          <button
            onClick={resetManual}
            className="p-2 rounded-xl bg-slate-900 border border-white/20 text-slate-300 hover:text-white transition"
            title="Reset Manual Position"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid Canvas Arena */}
      <div className="flex justify-center py-4 bg-black/90 rounded-xl border border-white/10">
        <div 
          className="grid gap-1.5"
          style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
        >
          {MAZE_GRID.map((row, r) =>
            row.map((val, c) => {
              const isWall = val === 1;
              const isStart = r === 0 && c === 0;
              const isGoal = r === ROWS - 1 && c === COLS - 1;
              const isPlayer = playerPos[0] === r && playerPos[1] === c;
              const key = `${r},${c}`;
              const inShortestPath = shortestPathCells.has(key);
              const inBfs = bfsVisited.includes(key);
              const inDfs = dfsVisited.includes(key);

              let cellStyle = 'bg-slate-900 border-slate-800 text-slate-400';
              if (isWall) {
                cellStyle = 'noir-cell-wall cursor-not-allowed';
              } else if (isPlayer) {
                cellStyle = 'noir-cell-player text-black font-bold';
              } else if (inShortestPath) {
                cellStyle = 'noir-cell-path text-black font-bold';
              } else if (inBfs && simAlgorithm === 'BFS') {
                cellStyle = 'bg-cyan-950/80 border-cyan-400/80 text-cyan-200';
              } else if (inDfs && simAlgorithm === 'DFS') {
                cellStyle = 'bg-rose-950/80 border-rose-400/80 text-rose-200';
              } else if (isStart) {
                cellStyle = 'bg-emerald-950 border-emerald-400 text-emerald-300 font-bold';
              } else if (isGoal) {
                cellStyle = 'bg-amber-950 border-amber-400 text-amber-300 font-bold';
              }

              return (
                <button
                  key={`${r}-${c}`}
                  disabled={isWall}
                  onClick={() => movePlayer(r, c)}
                  className={`w-11 h-11 rounded-lg border flex items-center justify-center font-mono text-[11px] font-semibold transition-all ${cellStyle}`}
                >
                  {isPlayer ? (
                    <Compass className="w-5 h-5 text-white" />
                  ) : isStart ? (
                    'S'
                  ) : isGoal ? (
                    'G'
                  ) : inShortestPath ? (
                    '&bull;'
                  ) : isWall ? (
                    ''
                  ) : (
                    ''
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Live Graph Status Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-600 inline-block" />
            <span className="text-slate-300 text-[11px]">Start (0,0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-yellow-500 inline-block" />
            <span className="text-slate-300 text-[11px]">Goal (6,6)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-cyan-500 inline-block" />
            <span className="text-slate-300 text-[11px]">BFS Wave</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-400 inline-block" />
            <span className="text-slate-300 text-[11px]">Shortest Path</span>
          </div>
        </div>

        <span className="text-indigo-400 font-mono text-[11px]">BFS Optimality: d(s,v) = &delta;(s,v)</span>
      </div>
    </div>
  );
};

