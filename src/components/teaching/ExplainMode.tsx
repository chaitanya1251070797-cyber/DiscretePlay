import React from 'react';
import { useLearningEngine } from '../../engine/LearningEngineContext';
import { BookOpen, CheckCircle, AlertTriangle, Sparkles, BookMarked, ArrowUpRight } from 'lucide-react';

export const ExplainMode: React.FC = () => {
  const { recentExplanations, setRosenModalOpen, currentGame } = useLearningEngine();

  const activeExplanation = recentExplanations[0];

  return (
    <div className="flex flex-col gap-3">
      {/* Latest Explanation Highlight */}
      {activeExplanation ? (
        <div className={`p-3.5 rounded-xl border flex flex-col gap-2 transition-all ${
          activeExplanation.context === 'invalid_move'
            ? 'bg-rose-950/40 border-rose-500/40'
            : activeExplanation.context === 'strategic_subgoal'
            ? 'bg-emerald-950/40 border-emerald-500/40'
            : 'bg-indigo-950/40 border-indigo-500/40'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
              activeExplanation.context === 'invalid_move'
                ? 'bg-rose-900/60 text-rose-300 border-rose-500/30'
                : activeExplanation.context === 'strategic_subgoal'
                ? 'bg-emerald-900/60 text-emerald-300 border-emerald-500/30'
                : 'bg-indigo-900/60 text-indigo-300 border-indigo-500/30'
            }`}>
              {activeExplanation.context === 'invalid_move' ? 'Constraint Violation' : 'Mathematical Reasoning'}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Live Invariant</span>
          </div>

          <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
            {activeExplanation.context === 'invalid_move' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            )}
            <span>{activeExplanation.title}</span>
          </h4>

          <p className="text-xs text-slate-200 leading-relaxed">
            {activeExplanation.shortSummary}
          </p>

          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono text-indigo-300">
            {activeExplanation.detailedMath}
          </div>

          {activeExplanation.rosenNote && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 italic">
              <BookMarked className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{activeExplanation.rosenNote}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
          <BookOpen className="w-7 h-7 text-indigo-400/60" />
          <p className="font-medium text-slate-300">Live Mathematical Observer Active</p>
          <p className="text-[11px] text-slate-500 max-w-xs">
            Interact with the board. Every move, invariant transition, and rule restriction will be analyzed here mathematically in real-time.
          </p>
        </div>
      )}

      {/* Kenneth H. Rosen Textbook Quick Link */}
      <button
        onClick={() => setRosenModalOpen(true)}
        className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between text-xs transition group"
      >
        <div className="flex items-center gap-2.5 text-left">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
            <BookMarked className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="font-semibold text-slate-200 group-hover:text-amber-300 transition">
              {currentGame.concept.rosenReference.section}
            </div>
            <div className="text-[10px] text-slate-400">
              Kenneth H. Rosen: Discrete Mathematics & Its Applications
            </div>
          </div>
        </div>
        <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition" />
      </button>

      {/* Prior Observations History */}
      {recentExplanations.length > 1 && (
        <div className="space-y-1.5 mt-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
            Prior Move Insights
          </div>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {recentExplanations.slice(1).map(exp => (
              <div 
                key={exp.id} 
                className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 text-xs flex flex-col gap-0.5"
              >
                <span className="font-medium text-slate-300 text-[11px]">{exp.title}</span>
                <span className="text-[10px] text-slate-400 line-clamp-1">{exp.shortSummary}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

