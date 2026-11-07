import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLearningEngine } from '../../engine/LearningEngineContext';
import { Play, RotateCcw, Compass, CheckCircle2, Video, Eye, Award } from 'lucide-react';
import { sound } from '../../utils/sound';
import confetti from 'canvas-confetti';

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
  const [manualMoves, setManualMoves] = useState<number>(0);

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
    sound.playClick(400);
    setPlayerPos([0, 0]);
    setVisitedManual(new Set(['0,0']));
    setManualWon(false);
    setManualMoves(0);
    clearInterval(timerRef.current);
    setIsSimulating(false);
    setBfsVisited([]);
    setDfsVisited([]);
    setShortestPathCells(new Set());
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
  const movePlayer = useCallback((r: number, c: number) => {
    if (manualWon || isSimulating) return;
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;

    if (MAZE_GRID[r][c] === 1) {
      sound.playError();
      recordAction(false, 'hit_wall', 'Collided with a wall obstacle! In graph terms, this edge does not exist in E.');
      return;
    }

    const [pr, pc] = playerPos;
    const dist = Math.abs(pr - r) + Math.abs(pc - c);
    if (dist !== 1) return; // only orthogonal moves

    sound.playMove();
    setPlayerPos([r, c]);
    setManualMoves(m => m + 1);

    const key = `${r},${c}`;
    const nextVisited = new Set(visitedManual);
    nextVisited.add(key);
    setVisitedManual(nextVisited);
    recordAction(true);

    if (r === ROWS - 1 && c === COLS - 1) {
      setManualWon(true);
      sound.playSuccess();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      addExplanation(
        'Manual Navigation Path Found!',
        `You navigated through the maze to Goal (${r}, ${c}) in ${manualMoves + 1} steps.`,
        `Notice the manual exploratory trail. Can you guarantee it was the shortest possible path without BFS?`,
        'strategic_subgoal',
        'Rosen Section 10.4: Shortest Paths and Trees'
      );
      if (currentStage === 'DISCOVER') {
        advanceStage();
      }
    }
  }, [manualWon, isSimulating, playerPos, visitedManual, recordAction, manualMoves, currentStage, advanceStage, addExplanation]);

  // Keyboard navigation listener (Arrow keys + WASD)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (manualWon || isSimulating) return;
      const [r, c] = playerPos;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        movePlayer(r - 1, c);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        movePlayer(r + 1, c);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        movePlayer(r, c - 1);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        movePlayer(r, c + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerPos, manualWon, isSimulating, movePlayer]);

  // Run BFS Traversal Simulation
  const runBFSSimulation = () => {
    sound.playClick(600);
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
      sound.playClick(300 + Math.min(order.length * 15, 600), 0.03);

      if (r === ROWS - 1 && c === COLS - 1) {
        clearInterval(timerRef.current);
        setIsSimulating(false);
        sound.playSuccess();

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
    }, 110);
  };

  // Run DFS Traversal Simulation
  const runDFSSimulation = () => {
    sound.playClick(500);
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
      sound.playClick(240 + Math.min(order.length * 15, 500), 0.03);

      if (r === ROWS - 1 && c === COLS - 1) {
        clearInterval(timerRef.current);
        setIsSimulating(false);
        sound.playSuccess();
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
    }, 110);
  };

  return (
    <div className="theme-panel rounded-2xl p-5 flex flex-col gap-4 shadow-2xl relative">
      {/* CCTV Surveillance Header Frame */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="font-mono text-cyan-400">CAM_04 //</span>
              <span>Maze Graph Traversal</span>
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              <span>REC</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Use <span className="text-cyan-300 font-bold">Arrow Keys / WASD</span> or click adjacent nodes &bull; Race FIFO Queue vs LIFO Stack
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          {/* Step counter */}
          <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-xl border border-white/15">
            <span className="text-slate-400">Steps:</span>
            <span className="font-bold text-cyan-400">{manualMoves}</span>
          </div>

          <button
            onClick={runBFSSimulation}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-bold shadow-md transition disabled:opacity-50 border border-cyan-400/50 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>BFS (Queue)</span>
          </button>

          <button
            onClick={runDFSSimulation}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-bold shadow-md transition disabled:opacity-50 border border-rose-400/50 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>DFS (Stack)</span>
          </button>

          <button
            onClick={resetManual}
            className="p-2 rounded-xl bg-black/60 border border-white/20 text-slate-300 hover:text-white transition cursor-pointer"
            title="Reset Position"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid Canvas Arena with Glitchcore / Noir styling */}
      <div className="relative flex justify-center py-5 bg-black/95 rounded-2xl border border-white/15 shadow-inner">
        {/* Surveillance crosshair watermarks */}
        <div className="absolute top-3 left-4 font-mono text-[9px] text-slate-500 tracking-wider">
          LIVE_FEED: OPTIMAL_BFS_TRACK
        </div>
        <div className="absolute bottom-3 right-4 font-mono text-[9px] text-cyan-500/50 tracking-wider">
          LATTICE_DIM: 7x7
        </div>

        <div 
          className="grid gap-1.5 relative z-10"
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
              const inManualVisited = visitedManual.has(key);

              let cellStyle = 'bg-[#0e0e14] border-slate-800 text-slate-400 hover:border-cyan-500/40';
              if (isWall) {
                cellStyle = 'noir-cell-wall cursor-not-allowed opacity-80';
              } else if (isPlayer) {
                cellStyle = 'noir-cell-player text-black font-black scale-105 z-20';
              } else if (inShortestPath) {
                cellStyle = 'noir-cell-path text-black font-black animate-pulse';
              } else if (inBfs && simAlgorithm === 'BFS') {
                cellStyle = 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-sm shadow-cyan-500/30';
              } else if (inDfs && simAlgorithm === 'DFS') {
                cellStyle = 'bg-rose-950/80 border-rose-400 text-rose-200 shadow-sm shadow-rose-500/30';
              } else if (isStart) {
                cellStyle = 'bg-emerald-950/90 border-emerald-400 text-emerald-300 font-bold';
              } else if (isGoal) {
                cellStyle = 'bg-amber-950/90 border-amber-400 text-amber-300 font-bold';
              } else if (inManualVisited) {
                cellStyle = 'bg-slate-900 border-cyan-500/30 text-cyan-400/50';
              }

              return (
                <button
                  key={`${r}-${c}`}
                  disabled={isWall}
                  onClick={() => movePlayer(r, c)}
                  className={`w-11 h-11 rounded-lg border flex items-center justify-center font-mono text-[11px] font-bold transition-all transform active:scale-95 cursor-pointer ${cellStyle}`}
                >
                  {isPlayer ? (
                    <Compass className="w-5 h-5 text-black drop-shadow" />
                  ) : isStart ? (
                    'S'
                  ) : isGoal ? (
                    'G'
                  ) : inShortestPath ? (
                    '★'
                  ) : isWall ? (
                    <span className="text-[9px] opacity-20 font-mono">1</span>
                  ) : inManualVisited ? (
                    '·'
                  ) : (
                    ''
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Win Banner for Manual Play */}
      {manualWon && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-400/60 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-400/40">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Goal Reached! Path Completed</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-300">
                  {manualMoves} MOVES
                </span>
              </h4>
              <p className="text-xs text-emerald-200">
                You navigated to Goal (6,6). Now click &quot;BFS (Queue)&quot; to prove whether your trail was optimal!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetManual}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition cursor-pointer"
            >
              Replay
            </button>
            {currentStage !== 'INDEPENDENT_APPLICATION' && (
              <button
                onClick={() => {
                  sound.playSuccess();
                  advanceStage();
                }}
                className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <span>Advance Stage</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Legend & Theoretical Invariant */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-black/60 p-3 rounded-xl border border-white/10 font-mono">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" />
            <span className="text-slate-300 text-[11px]">Start (0,0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-400 inline-block" />
            <span className="text-slate-300 text-[11px]">Goal (6,6)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-cyan-400 inline-block" />
            <span className="text-slate-300 text-[11px]">BFS Wave (FIFO)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-white inline-block shadow-sm shadow-cyan-400" />
            <span className="text-slate-300 text-[11px]">Shortest Path (Minimal Dist)</span>
          </div>
        </div>

        <span className="text-cyan-400 text-[11px]">Theorem: BFS minimizes edge count</span>
      </div>
    </div>
  );
};
