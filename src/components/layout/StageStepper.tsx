import React from 'react';
import { useLearningEngine } from '../../engine/LearningEngineContext';
import { LearningStage } from '../../types/learning';
import { sound } from '../../utils/sound';
import {
  Compass,
  FlaskConical,
  HelpCircle,
  Sparkles,
  Award,
  Check,
  ArrowRight,
  Target,
  Zap,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   Stage metadata
───────────────────────────────────────────────────────────────────────────── */
const STAGES_META: {
  stage: LearningStage;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  shortDesc: string;
}[] = [
  {
    stage: 'DISCOVER',
    label: 'Discover',
    shortLabel: '1',
    icon: Compass,
    shortDesc: 'Intuitive exploratory play without constraints',
  },
  {
    stage: 'EXPERIMENT',
    label: 'Experiment',
    shortLabel: '2',
    icon: FlaskConical,
    shortDesc: 'Observe state patterns, invariants & transitions',
  },
  {
    stage: 'GUIDED_REASONING',
    label: 'Reasoning',
    shortLabel: '3',
    icon: HelpCircle,
    shortDesc: 'Formulate hypotheses & resolve discrete inquiries',
  },
  {
    stage: 'MATHEMATICAL_REVELATION',
    label: 'Revelation',
    shortLabel: '4',
    icon: Sparkles,
    shortDesc: 'Formalize Kenneth H. Rosen textbook theorems',
  },
  {
    stage: 'INDEPENDENT_APPLICATION',
    label: 'Mastery',
    shortLabel: '5',
    icon: Award,
    shortDesc: 'Tackle unassisted challenge & earn certificate',
  },
];

export const StageStepper: React.FC = () => {
  const { currentStage, setStage, advanceStage, currentGame, telemetry } =
    useLearningEngine();
  const currentStageInfo = currentGame.stages[currentStage];
  const currentIdx = STAGES_META.findIndex((s) => s.stage === currentStage);

  const handleStageClick = (stage: LearningStage) => {
    sound.playClick(600);
    setStage(stage);
  };

  const handleAdvance = () => {
    sound.playSuccess();
    advanceStage();
  };

  return (
    <div className="theme-panel rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-xl relative overflow-hidden transition-all duration-500">
      {/* Top Header Row with Stage Counter */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-amber-300">
            <Zap className="w-3 h-3" />
          </div>
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-300">
            Universal 5-Stage Learning Pipeline
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] bg-slate-900/80 px-2.5 py-1 rounded-full border border-white/10 text-slate-300">
          <span>PIPELINE:</span>
          <span className="font-bold text-cyan-400">STAGE {currentIdx + 1} / 5</span>
        </div>
      </div>

      {/* ── Orbital Connector Pipeline ───────────────────────────────────── */}
      <div className="relative flex items-center justify-between px-2 pt-2 pb-1">
        {/* Continuous pipeline backdrop bar */}
        <div className="absolute top-[28px] left-6 right-6 h-1.5 bg-slate-800/80 rounded-full z-0 overflow-hidden">
          <div 
            className="h-full pipeline-track transition-all duration-700 rounded-full"
            style={{ width: `${(currentIdx / (STAGES_META.length - 1)) * 100}%` }}
          />
        </div>

        {STAGES_META.map((meta, idx) => {
          const Icon = meta.icon;
          const isActive = currentStage === meta.stage;
          const isCompleted = telemetry.stageCompleted[meta.stage] || idx < currentIdx;

          return (
            <div key={meta.stage} className="flex flex-col items-center gap-2 z-10">
              {/* 3D-styled circular power node */}
              <button
                onClick={() => handleStageClick(meta.stage)}
                title={`${meta.label}: ${meta.shortDesc}`}
                className={`group relative w-11 h-11 sm:w-13 sm:h-13 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 focus:outline-none ${
                  isActive
                    ? 'scale-110 shadow-lg ring-4 ring-cyan-400/50'
                    : isCompleted
                    ? 'hover:scale-105'
                    : 'hover:scale-105 opacity-70 hover:opacity-100'
                }`}
                style={{
                  background: isCompleted
                    ? 'radial-gradient(circle at 35% 30%, #34d399 0%, #059669 60%, #064e3b 100%)'
                    : isActive
                    ? 'radial-gradient(circle at 35% 30%, #38bdf8 0%, #0284c7 60%, #0c4a6e 100%)'
                    : 'radial-gradient(circle at 35% 30%, rgba(51, 65, 85, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
                  boxShadow: isCompleted
                    ? '0 0 16px rgba(16, 185, 129, 0.6), inset 0 2px 3px rgba(255, 255, 255, 0.8)'
                    : isActive
                    ? '0 0 24px rgba(56, 189, 248, 0.8), inset 0 2px 4px rgba(255, 255, 255, 0.9)'
                    : 'inset 0 1px 2px rgba(255, 255, 255, 0.2), 0 4px 10px rgba(0, 0, 0, 0.4)',
                  border: isCompleted
                    ? '2px solid rgba(110, 231, 183, 0.8)'
                    : isActive
                    ? '2px solid rgba(255, 255, 255, 0.9)'
                    : '1px solid rgba(148, 163, 184, 0.3)'
                }}
                aria-current={isActive ? 'step' : undefined}
              >
                {/* Interior gloss reflection highlight */}
                <span className="absolute top-1 left-2 right-2 h-3.5 bg-gradient-to-b from-white/60 to-transparent rounded-full pointer-events-none" />

                {isCompleted ? (
                  <Check className="w-5 h-5 text-white drop-shadow font-bold z-10" />
                ) : (
                  <Icon className={`w-5 h-5 z-10 ${isActive ? 'text-white' : 'text-slate-300'}`} />
                )}

                {/* Pulsing ring on active */}
                {isActive && (
                  <span className="absolute -inset-1 rounded-full border border-cyan-400 animate-ping opacity-30 pointer-events-none" />
                )}
              </button>

              {/* Label */}
              <div className="flex flex-col items-center">
                <span className={`text-[10px] sm:text-xs font-bold leading-tight ${
                  isActive ? 'text-white drop-shadow' : isCompleted ? 'text-emerald-300' : 'text-slate-400'
                }`}>
                  {meta.label}
                </span>
                <span className="hidden sm:inline font-mono text-[9px] text-slate-400 opacity-80">
                  Stage 0{idx + 1}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Current stage objective banner ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/10 bg-black/20 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-3 sm:px-5">
        {/* Objective text */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0 text-cyan-300">
            <Target className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-white">
                {currentStageInfo.title}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 font-mono text-cyan-300">
                ACTIVE FOCUS
              </span>
            </div>
            <p className="text-xs text-slate-300 truncate max-w-xl">
              {currentStageInfo.learningGoal}
            </p>
          </div>
        </div>

        {/* Next Stage button */}
        {currentIdx < STAGES_META.length - 1 && (
          <button
            onClick={handleAdvance}
            className="self-end sm:self-auto shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 active:scale-95 cursor-pointer"
          >
            <span>Advance to Next Stage</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
