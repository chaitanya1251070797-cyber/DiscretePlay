import React from 'react';
import { useLearningEngine } from '../../engine/LearningEngineContext';
import { TeachingInteractionMode } from '../../types/learning';
import { ThinkMode } from './ThinkMode';
import { HintMode } from './HintMode';
import { ExplainMode } from './ExplainMode';
import { VisualizeMode } from './VisualizeMode';
import { 
  HelpCircle, 
  Lightbulb, 
  BookOpen, 
  Eye, 
  Activity, 
  Sliders, 
  BookMarked,
  BrainCircuit,
  GraduationCap
} from 'lucide-react';

export const TeachingPanel: React.FC = () => {
  const {
    interactionMode,
    setInteractionMode,
    currentGame,
    currentStage,
    telemetry,
    adaptiveSettings,
    setRosenModalOpen,
    revealedHints
  } = useLearningEngine();

  const tabs: { mode: TeachingInteractionMode; label: string; icon: any; countBadge?: number }[] = [
    { mode: 'EXPLAIN', label: 'Explain', icon: BookOpen },
    { mode: 'THINK', label: 'Think', icon: HelpCircle },
    { mode: 'HINT', label: 'Hint', icon: Lightbulb, countBadge: revealedHints.length },
    { mode: 'VISUALIZE', label: 'Visualize', icon: Eye }
  ];

  return (
    <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl flex flex-col h-full overflow-hidden">
      {/* Panel Header */}
      <div className="p-3.5 bg-slate-950/70 border-b border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <span>Interactive Teaching Engine</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Discrete Math Tutor &bull; <span className="text-indigo-400">{currentGame.category}</span>
              </p>
            </div>
          </div>

          {/* Adaptive Profile Indicator */}
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
              adaptiveSettings.difficulty === 'guided'
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                : adaptiveSettings.difficulty === 'advanced'
                ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
            }`}>
              Adaptive: {adaptiveSettings.difficulty.toUpperCase()}
            </span>
          </div>
        </div>

        {/* 4 Teaching Interaction Modes Tab Navigation */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800/80">
          {tabs.map(({ mode, label, icon: Icon, countBadge }) => {
            const isActive = interactionMode === mode;
            return (
              <button
                key={mode}
                onClick={() => setInteractionMode(mode)}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all relative ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{label}</span>
                {countBadge !== undefined && countBadge > 0 && (
                  <span className={`ml-0.5 px-1 rounded-full text-[9px] font-mono ${
                    isActive ? 'bg-indigo-900 text-indigo-200' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {countBadge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Mode Body */}
      <div className="flex-1 overflow-y-auto p-4">
        {interactionMode === 'EXPLAIN' && <ExplainMode />}
        {interactionMode === 'THINK' && <ThinkMode />}
        {interactionMode === 'HINT' && <HintMode />}
        {interactionMode === 'VISUALIZE' && <VisualizeMode />}
      </div>

      {/* Panel Footer Telemetry & Status */}
      <div className="p-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span>Moves: <strong className="text-slate-200">{telemetry.movesCount}</strong></span>
          <span>Hints: <strong className="text-amber-400">{telemetry.hintsUsed}</strong></span>
          <span>Errors: <strong className={telemetry.incorrectAnswers > 0 ? 'text-rose-400' : 'text-slate-200'}>{telemetry.incorrectAnswers}</strong></span>
        </div>
        <button
          onClick={() => setRosenModalOpen(true)}
          className="text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1"
        >
          <BookMarked className="w-3.5 h-3.5" />
          <span>Rosen Ref</span>
        </button>
      </div>
    </div>
  );
};

