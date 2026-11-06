import React, { useState } from 'react';
import { Network, ArrowRight, Layers, Sparkles } from 'lucide-react';

interface NodeProps {
  n: number;
  from: string;
  to: string;
  aux: string;
  depth: number;
  maxDepth: number;
}

const TreeNode: React.FC<NodeProps> = ({ n, from, to, aux, depth, maxDepth }) => {
  if (n < 1 || depth > maxDepth) return null;

  const isBase = n === 1;

  return (
    <div className="flex flex-col items-center">
      {/* Node Badge */}
      <div 
        className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium shadow-sm transition-all duration-300 ${
          isBase 
            ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300' 
            : 'bg-slate-900 border-indigo-500/50 text-indigo-200'
        }`}
      >
        <span className="font-semibold text-white">T({n})</span>: {from} &rarr; {to}
        <span className="text-[10px] text-slate-400 block">
          {isBase ? 'Base Case: 1 move' : `Needs 2*T(${n-1}) + 1`}
        </span>
      </div>

      {/* Children branches */}
      {!isBase && depth < maxDepth && (
        <div className="relative mt-2 pt-2 border-t border-slate-700 flex gap-4 justify-center">
          {/* Subproblem 1: move n-1 from -> aux */}
          <TreeNode n={n - 1} from={from} to={aux} aux={to} depth={depth + 1} maxDepth={maxDepth} />
          
          {/* Base move for disk n */}
          <div className="flex flex-col items-center justify-center px-2">
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Move #{n}
            </span>
          </div>

          {/* Subproblem 2: move n-1 aux -> to */}
          <TreeNode n={n - 1} from={aux} to={to} aux={from} depth={depth + 1} maxDepth={maxDepth} />
        </div>
      )}
    </div>
  );
};

export const HanoiRecurrenceTree: React.FC = () => {
  const [treeN, setTreeN] = useState<number>(3);

  const totalMoves = Math.pow(2, treeN) - 1;

  return (
    <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-indigo-400" />
          <h4 className="text-sm font-semibold text-slate-100">Animated Recursive Call Tree</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Disks (n):</span>
          {[1, 2, 3, 4].map(num => (
            <button
              key={num}
              onClick={() => setTreeN(num)}
              className={`px-2 py-0.5 rounded text-xs font-mono font-medium transition ${
                treeN === num 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Live math formula stats */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 bg-slate-950/60 rounded-lg border border-slate-800/80 font-mono">
        <div>
          <span className="text-slate-400 block text-[11px]">Recurrence</span>
          <span className="text-indigo-400 font-semibold">T(n) = 2T(n-1) + 1</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Closed Form</span>
          <span className="text-emerald-400 font-semibold">2^{treeN} - 1</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Minimum Moves</span>
          <span className="text-amber-400 font-bold text-sm">{totalMoves}</span>
        </div>
      </div>

      {/* Tree Visualization */}
      <div className="overflow-x-auto py-4 px-2 flex justify-center items-center min-h-[170px] bg-slate-950/40 rounded-lg">
        <TreeNode n={treeN} from="A" to="C" aux="B" depth={1} maxDepth={3} />
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed italic border-t border-slate-800/60 pt-2 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        Notice how every level strictly doubles the subproblems. By induction, the binary tree of operations has 2^n - 1 total nodes!
      </p>
    </div>
  );
};

