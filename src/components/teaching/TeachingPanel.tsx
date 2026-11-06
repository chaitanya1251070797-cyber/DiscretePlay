import React from 'react';
import { useLearningEngine } from '../../engine/LearningEngineContext';
import { TeachingInteractionMode } from '../../types/learning';
import { ThinkMode } from './ThinkMode';
import { HintMode } from './HintMode';
import { ExplainMode } from './ExplainMode';
import { VisualizeMode } from './VisualizeMode';
import { sound } from '../../utils/sound';
import { 
  HelpCircle, 
  Lightbulb, 
  BookOpen, 
  Eye, 
  GraduationCap
} from 'lucide-react';

export const TeachingPanel: React.FC = () => {
  const {
    interactionMode,
    setInteractionMode,
    currentGame,
    adaptiveSettings,
    revealedHints
  } = useLearningEngine();

  const tabs: { mode: TeachingInteractionMode; label: string; icon: any; countBadge?: number }[] = [
    { mode: 'EXPLAIN', label: 'Explain', icon: BookOpen },
    { mode: 'THINK', label: 'Think', icon: HelpCircle },
    { mode: 'HINT', label: 'Hint', icon: Lightbulb, countBadge: revealedHints.length },
    { mode: 'VISUALIZE', label: 'Visualize', icon: Eye }
  ];

  const handleTabClick = (mode: TeachingInteractionMode) => {
    sound.playClick(580);
    setInteractionMode(mode);
  };

  return (
    <div className="theme-panel rounded-2xl flex flex-col h-full overflow-hidden shadow-2xl transition-all duration-500">
      {/* Panel Header */}
      <div className="p-3.5 bg-black/40 border-b border-white/10 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-md">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Interactive Teaching Engine</span>
              </h3>
              <p className="text-[11px] text-slate-300">
                Discrete Math Tutor &bull; <span className="text-cyan-300 font-semibold">{currentGame.category}</span>
              </p>
            </div>
          </div>

          {/* Adaptive Profile Indicator */}
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
              adaptiveSettings.difficulty === 'guided'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : adaptiveSettings.difficulty === 'advanced'
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}>
              {adaptiveSettings.difficulty.toUpperCase()}
            </span>
          </div>
        </div>

        {/* 4 Teaching Interaction Modes Tab Navigation */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-black/30 rounded-xl border border-white/10">
          {tabs.map(({ mode, label, icon: Icon, countBadge }) => {
            const isActive = interactionMode === mode;
            return (
              <button
                key={mode}
                onClick={() => handleTabClick(mode)}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all relative cursor-pointer ${
                  isActive
                    ? 'bg-white/20 text-white shadow-md ring-1 ring-white/40'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{label}</span>
                {countBadge !== undefined && countBadge > 0 && (
                  <span className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-mono ${
                    isActive ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {countBadge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-4 custom-scroll">
        {interactionMode === 'THINK' && <ThinkMode />}
        {interactionMode === 'HINT' && <HintMode />}
        {interactionMode === 'EXPLAIN' && <ExplainMode />}
        {interactionMode === 'VISUALIZE' && <VisualizeMode />}
      </div>
    </div>
  );
};
