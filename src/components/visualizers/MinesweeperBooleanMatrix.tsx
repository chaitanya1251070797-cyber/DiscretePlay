import React from 'react';
import { Binary, ShieldCheck, HelpCircle, CheckCircle2, AlertOctagon } from 'lucide-react';

interface EquationItem {
  id: string;
  sourceCell: string;
  variables: string[];
  targetSum: number;
  status: 'pending' | 'solved' | 'conflict';
  resolvedDeductions?: string[];
}

export const MinesweeperBooleanMatrix: React.FC<{
  equations?: EquationItem[];
  revealedCount?: number;
  totalMines?: number;
}> = ({
  equations = [
    {
      id: 'eq-1',
      sourceCell: '(0, 1)',
      variables: ['X_{0,0}', 'X_{1,0}', 'X_{1,1}'],
      targetSum: 1,
      status: 'pending',
      resolvedDeductions: ['X_{0,0} + X_{1,0} + X_{1,1} = 1']
    },
    {
      id: 'eq-2',
      sourceCell: '(0, 2)',
      variables: ['X_{0,3}', 'X_{1,2}', 'X_{1,3}'],
      targetSum: 2,
      status: 'pending',
      resolvedDeductions: ['Subsystem: X_{1,2} + X_{1,3} = 2 - X_{0,3}']
    }
  ],
  totalMines = 4
}) => {
  return (
    <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Binary className="w-5 h-5 text-cyan-400" />
          <h4 className="text-sm font-semibold text-slate-100">Boolean Constraint Solver (SAT)</h4>
        </div>
        <span className="text-xs font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
          Variables: X_{'{r,c}'} &isin; &#123;0, 1&#125;
        </span>
      </div>

      {/* Constraints Matrix View */}
      <div className="space-y-2">
        <div className="text-xs text-slate-300 font-medium flex items-center justify-between">
          <span>Active Linear Boolean Equations:</span>
          <span className="text-[11px] text-slate-500 font-mono">Total Mines = {totalMines}</span>
        </div>

        {equations.map(eq => (
          <div 
            key={eq.id}
            className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex flex-col gap-1.5 font-mono text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Clue at {eq.sourceCell}:</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Sum = {eq.targetSum}
              </span>
            </div>

            <div className="text-slate-200 text-xs py-1 px-2 rounded bg-slate-900 border border-slate-800 flex items-center flex-wrap gap-1">
              {eq.variables.map((v, i) => (
                <React.Fragment key={v}>
                  <span className="text-indigo-300 font-semibold">{v}</span>
                  {i < eq.variables.length - 1 && <span className="text-slate-500">+</span>}
                </React.Fragment>
              ))}
              <span className="text-slate-400">=</span>
              <span className="text-amber-300 font-bold">{eq.targetSum}</span>
            </div>

            {eq.resolvedDeductions && eq.resolvedDeductions.length > 0 && (
              <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 pt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{eq.resolvedDeductions[0]}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Deductive Rule Cards */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80 text-[11px]">
        <div className="p-2 rounded bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-emerald-300">Safety Rule (0)</div>
            <div className="text-slate-400 text-[10px]">Flagged = Clue &rarr; remaining neighbors are safe (X = 0).</div>
          </div>
        </div>

        <div className="p-2 rounded bg-rose-950/30 border border-rose-500/30 flex items-start gap-1.5">
          <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-rose-300">Mine Rule (1)</div>
            <div className="text-slate-400 text-[10px]">Unrevealed = Clue &rarr; all neighbors are mines (X = 1).</div>
          </div>
        </div>
      </div>
    </div>
  );
};

