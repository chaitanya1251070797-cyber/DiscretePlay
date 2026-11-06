import React from 'react';
import { Eye, ShieldAlert, Award } from 'lucide-react';

interface KnightsDegreeVisualizerProps {
  tourLength?: number;
  maxSquares?: number;
  candidateDegrees?: string[];
}

export const KnightsDegreeVisualizer: React.FC<KnightsDegreeVisualizerProps> = ({
  tourLength = 1,
  maxSquares = 25,
  candidateDegrees = []
}) => {
  const percentComplete = Math.round((tourLength / maxSquares) * 100);

  return (
    <div className="p-4 bg-black/60 rounded-xl border border-white/10 flex flex-col gap-3 font-mono">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Warnsdorff Degree Lattice Visualizer
          </h4>
        </div>
        <span className="text-[10px] text-cyan-300 font-bold">
          {percentComplete}% HAMILTONIAN TOUR
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-300"
          style={{ width: `${percentComplete}%` }}
        />
      </div>

      {/* Degree List */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] text-slate-300">
          Legal Onward Exits &amp; Degrees (Warnsdorff Candidates):
        </span>
        {candidateDegrees.length > 0 ? (
          <div className="grid grid-cols-2 gap-1.5">
            {candidateDegrees.map((cand, idx) => (
              <div 
                key={idx}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-cyan-500/30 text-xs flex items-center justify-between"
              >
                <span className="text-slate-300">{cand.split(':')[0]}</span>
                <span className="text-cyan-400 font-bold">{cand.split(':')[1]}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-2 rounded-lg bg-slate-900/80 text-[11px] text-slate-400 border border-slate-800">
            {tourLength === maxSquares 
              ? '★ Full 25-square Hamiltonian Path Achieved!' 
              : 'No candidate degrees or knight trapped.'}
          </div>
        )}
      </div>

      {/* Theorem Box */}
      <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-200">
        <span className="font-bold text-white block mb-0.5">Warnsdorff&apos;s Heuristic:</span>
        Always branch towards v = argmin deg(u). Visiting low-degree vertices first guarantees that tight corners are resolved before the search tree runs out of free degrees.
      </div>
    </div>
  );
};
