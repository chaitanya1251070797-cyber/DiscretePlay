import React from 'react';
import { useLearningEngine } from '../../engine/LearningEngineContext';
import { Lightbulb, PlusCircle, Lock, AlertCircle, Sparkles } from 'lucide-react';

export const HintMode: React.FC = () => {
  const { 
    availableHints, 
    revealedHints, 
    revealNextHint, 
    adaptiveSettings,
    currentStage 
  } = useLearningEngine();

  const isIndependentStage = currentStage === 'INDEPENDENT_APPLICATION';
  const hasMoreHints = revealedHints.length < availableHints.length;

  return (
    <div className="flex flex-col gap-3">
      {/* Tiered Hints Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <h4 className="text-sm font-semibold text-slate-100">Progressive Tiered Hints</h4>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Revealed: {revealedHints.length} / {availableHints.length}
        </span>
      </div>

      {isIndependentStage && (
        <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            Independent Application Mode: Try solving without hints! Concepts are marked <strong>Mastered</strong> only when solved with minimal assistance.
          </span>
        </div>
      )}

      {/* List of Revealed Hints */}
      <div className="flex flex-col gap-2.5">
        {revealedHints.length === 0 ? (
          <div className="text-center p-6 bg-slate-900/50 rounded-xl border border-dashed border-slate-800 text-slate-400 text-xs flex flex-col items-center gap-2">
            <Lightbulb className="w-6 h-6 text-slate-600" />
            <p>No hints revealed yet.</p>
            <p className="text-slate-500 text-[11px]">Click "Reveal Next Hint" below if you encounter an obstacle.</p>
          </div>
        ) : (
          revealedHints.map((hint, idx) => {
            const tierColors = {
              1: 'border-blue-500/40 bg-blue-950/30 text-blue-300',
              2: 'border-purple-500/40 bg-purple-950/30 text-purple-300',
              3: 'border-amber-500/40 bg-amber-950/30 text-amber-300'
            };

            const tierLabels = {
              1: 'Tier 1: Subtle Nudge',
              2: 'Tier 2: Structural Clue',
              3: 'Tier 3: Mathematical Formalism'
            };

            return (
              <div 
                key={hint.id} 
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-1.5 animate-in fade-in"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${tierColors[hint.tier]}`}>
                    {tierLabels[hint.tier]}
                  </span>
                  <span className="text-xs font-semibold text-slate-200">{hint.title}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  {hint.content}
                </p>
                {hint.formulaSnippet && (
                  <div className="mt-1.5 p-2 rounded bg-slate-950 border border-slate-800 text-center font-mono text-xs text-amber-300">
                    {hint.formulaSnippet}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Reveal Next Hint Button */}
      {hasMoreHints ? (
        <button
          onClick={() => revealNextHint()}
          className="mt-1 w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Reveal Next Hint (Tier {revealedHints.length + 1})</span>
        </button>
      ) : (
        <div className="text-center text-xs text-slate-500 p-2 italic">
          All available progressive hints have been unlocked.
        </div>
      )}
    </div>
  );
};

