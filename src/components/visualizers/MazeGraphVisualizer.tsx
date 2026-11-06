import React, { useState } from 'react';
import { GitBranch, ListFilter, Play, RotateCcw, Compass, CheckCircle2 } from 'lucide-react';

export const MazeGraphVisualizer: React.FC<{
  queue?: { node: string; dist: number }[];
  stack?: { node: string; depth: number }[];
  currentAlgorithm?: 'BFS' | 'DFS';
}> = ({
  queue = [
    { node: '(1, 1)', dist: 2 },
    { node: '(2, 0)', dist: 2 },
    { node: '(0, 2)', dist: 2 },
    { node: '(1, 2)', dist: 3 }
  ],
  stack = [
    { node: '(0, 4)', depth: 4 },
    { node: '(0, 3)', depth: 3 },
    { node: '(0, 2)', depth: 2 },
    { node: '(0, 1)', depth: 1 }
  ]
}) => {
  const [selectedAlgo, setSelectedAlgo] = useState<'BFS' | 'DFS'>('BFS');

  return (
    <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-indigo-400" />
          <h4 className="text-sm font-semibold text-slate-100">Graph Traversal Dual-Engine</h4>
        </div>
        <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setSelectedAlgo('BFS')}
            className={`px-2.5 py-1 rounded-md transition ${
              selectedAlgo === 'BFS'
                ? 'bg-cyan-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            BFS (Queue)
          </button>
          <button
            onClick={() => setSelectedAlgo('DFS')}
            className={`px-2.5 py-1 rounded-md transition ${
              selectedAlgo === 'DFS'
                ? 'bg-purple-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            DFS (Stack)
          </button>
        </div>
      </div>

      {/* Traversal State Comparison */}
      <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <ListFilter className="w-3.5 h-3.5 text-indigo-400" />
            {selectedAlgo === 'BFS' ? 'Frontier Queue (FIFO - First-In-First-Out)' : 'Active Call Stack (LIFO - Last-In-First-Out)'}
          </span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
            selectedAlgo === 'BFS' 
              ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' 
              : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
          }`}>
            {selectedAlgo === 'BFS' ? 'Optimal Shortest Path: YES' : 'Optimal Shortest Path: NO (Can take detours)'}
          </span>
        </div>

        {/* Queue or Stack items */}
        <div className="flex gap-2 overflow-x-auto py-2">
          {selectedAlgo === 'BFS' ? (
            queue.map((item, idx) => (
              <div 
                key={idx}
                className={`shrink-0 px-2.5 py-1.5 rounded-md border text-xs font-mono flex flex-col items-center ${
                  idx === 0 
                    ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 ring-2 ring-cyan-500/30' 
                    : 'bg-slate-900 border-slate-700 text-slate-300'
                }`}
              >
                <span className="text-[10px] text-slate-400">Head [{idx}]</span>
                <span className="font-bold">{item.node}</span>
                <span className="text-[10px] text-cyan-400">d = {item.dist}</span>
              </div>
            ))
          ) : (
            stack.map((item, idx) => (
              <div 
                key={idx}
                className={`shrink-0 px-2.5 py-1.5 rounded-md border text-xs font-mono flex flex-col items-center ${
                  idx === 0 
                    ? 'bg-purple-950/80 border-purple-400 text-purple-200 ring-2 ring-purple-500/30' 
                    : 'bg-slate-900 border-slate-700 text-slate-300'
                }`}
              >
                <span className="text-[10px] text-slate-400">Top [{idx}]</span>
                <span className="font-bold">{item.node}</span>
                <span className="text-[10px] text-purple-400">depth = {item.depth}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mathematical Optimality Comparison */}
      <div className="text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80 space-y-1.5 font-mono">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Graph Theory Invariant:</span>
          <span className="text-indigo-400 font-semibold">Kenneth H. Rosen Sec 10.4</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-300">
          {selectedAlgo === 'BFS' ? (
            <span className="text-cyan-300">
              BFS Queue Monotonicity: Any node placed in the queue satisfies d(s, u) &le; d(s, v) &le; d(s, u) + 1. Hence, the target node is visited at the absolute earliest possible moment!
            </span>
          ) : (
            <span className="text-purple-300">
              DFS Depth Invariant: DFS pursues unvisited successors down single branches to arbitrary depths before backtracking. It guarantees connectivity, but not minimal path length!
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

