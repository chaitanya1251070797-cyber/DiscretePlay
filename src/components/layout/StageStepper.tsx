import React from 'react';
import { useLearningEngine } from '../../engine/LearningEngineContext';
import { LearningStage } from '../../types/learning';
import {
  Compass,
  FlaskConical,
  HelpCircle,
  Sparkles,
  Award,
  Check,
  ArrowRight,
  Target,
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
    shortDesc: 'Explore the problem without prior assumptions',
  },
  {
    stage: 'EXPERIMENT',
    label: 'Experiment',
    shortLabel: '2',
    icon: FlaskConical,
    shortDesc: 'Interact, observe patterns and feedback',
  },
  {
    stage: 'GUIDED_REASONING',
    label: 'Guided Reasoning',
    shortLabel: '3',
    icon: HelpCircle,
    shortDesc: 'Identify invariants and answer state queries',
  },
  {
    stage: 'MATHEMATICAL_REVELATION',
    label: 'Math Revelation',
    shortLabel: '4',
    icon: Sparkles,
    shortDesc: 'Formalise formulae and textbook theorems',
  },
  {
    stage: 'INDEPENDENT_APPLICATION',
    label: 'Independent Apply',
    shortLabel: '5',
    icon: Award,
    shortDesc: 'Solve new challenges with reduced scaffolding',
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Inline keyframe injection (runs once, harmless if already present)
───────────────────────────────────────────────────────────────────────────── */
function ensureStepperStyles() {
  if (document.getElementById('stepper-keyframes')) return;
  const style = document.createElement('style');
  style.id = 'stepper-keyframes';
  style.textContent = `
    @keyframes step-pulse {
      0%, 100% { box-shadow: 0 0 0 0 var(--step-glow, rgba(99,102,241,0.6)); }
      50%       { box-shadow: 0 0 0 8px transparent; }
    }
    .step-node { transition: all 0.4s ease; }
    .step-node.active  { animation: step-pulse 2s ease-in-out infinite; }
    .stepper-line      { transition: background 0.4s ease; }
  `;
  document.head.appendChild(style);
}

/* ─────────────────────────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────────────────────────── */
export const StageStepper: React.FC = () => {
  ensureStepperStyles();

  const { currentStage, setStage, advanceStage, currentGame, telemetry } =
    useLearningEngine();
  const currentStageInfo = currentGame.stages[currentStage];
  const currentIdx = STAGES_META.findIndex((s) => s.stage === currentStage);

  return (
    <div className="theme-panel rounded-2xl p-4 sm:p-5 flex flex-col gap-4">

      {/* ── Horizontal connected stepper ───────────────────────────────────── */}
      <div className="relative flex items-start justify-between">
        {STAGES_META.map((meta, idx) => {
          const Icon = meta.icon;
          const isActive    = currentStage === meta.stage;
          const isCompleted = telemetry.stageCompleted[meta.stage] || idx < currentIdx;
          const isLast      = idx === STAGES_META.length - 1;

          /* ── State-based class string for the circle node ── */
          const nodeClass = [
            'step-node',
            isActive    ? 'active'   : '',
            isCompleted ? 'complete' : '',
            !isActive && !isCompleted ? 'inactive' : '',
          ]
            .filter(Boolean)
            .join(' ');

          /* ── Inline styles per state so CSS vars are honoured ── */
          const nodeInlineStyle: React.CSSProperties = isActive
            ? {
                background: 'var(--step-active, #4f46e5)',
                borderColor: 'var(--step-active, #4f46e5)',
                boxShadow: '0 0 0 0 var(--step-glow, rgba(99,102,241,0.6))',
              }
            : isCompleted
            ? {
                background: 'rgba(16,185,129,0.15)',
                borderColor: '#10b981',
              }
            : {
                background: 'rgba(15,23,42,0.6)',
                borderColor: 'rgba(100,116,139,0.3)',
                opacity: 0.65,
              };

          return (
            <React.Fragment key={meta.stage}>
              {/* ── Step column ── */}
              <div className="flex flex-col items-center gap-2 z-10" style={{ flex: '0 0 auto' }}>

                {/* Circle node */}
                <button
                  onClick={() => setStage(meta.stage)}
                  title={meta.label}
                  className={`${nodeClass} relative w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center cursor-pointer focus:outline-none`}
                  style={nodeInlineStyle}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <Check
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      style={{ color: '#10b981' }}
                    />
                  ) : (
                    <Icon
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      style={{
                        color: isActive
                          ? '#fff'
                          : 'rgba(148,163,184,0.7)',
                      }}
                    />
                  )}

                  {/* Pulse ring (active only) — rendered as a sibling pseudo via inline span */}
                  {isActive && (
                    <span
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{
                        border: '2px solid var(--step-active, #4f46e5)',
                        animation: 'step-pulse 2s ease-in-out infinite',
                        opacity: 0.5,
                      }}
                    />
                  )}
                </button>

                {/* Label — hidden on xs, abbreviated on sm, full on md+ */}
                <span
                  className={[
                    'hidden sm:block text-center leading-tight',
                    'text-[10px] sm:text-xs font-medium max-w-[64px] sm:max-w-[80px]',
                    isActive
                      ? 'text-white'
                      : 'theme-text-muted',
                  ].join(' ')}
                >
                  {/* Show step number on sm, full label on md+ */}
                  <span className="sm:hidden md:inline">{meta.label}</span>
                  <span className="hidden sm:inline md:hidden">
                    {meta.shortLabel}. {meta.label.split(' ')[0]}
                  </span>
                </span>
              </div>

              {/* ── Connecting line (not after last item) ── */}
              {!isLast && (
                <div
                  className="flex-1 self-start mt-5 sm:mt-6 mx-1 h-0.5 stepper-line"
                  style={{
                    background: isCompleted
                      ? 'linear-gradient(90deg, #10b981, rgba(16,185,129,0.4))'
                      : 'rgba(100,116,139,0.2)',
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Current stage objective banner ─────────────────────────────────── */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t"
        style={{ borderColor: 'rgba(100,116,139,0.15)' }}
      >
        {/* Objective text */}
        <div className="flex items-start sm:items-center gap-2.5 min-w-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: 'var(--step-active-soft, rgba(99,102,241,0.12))',
              border: '1px solid var(--step-active-border, rgba(99,102,241,0.3))',
            }}
          >
            <Target
              className="w-3.5 h-3.5"
              style={{ color: 'var(--step-active, #818cf8)' }}
            />
          </div>

          <p className="text-xs leading-relaxed min-w-0">
            <span className="font-semibold text-white mr-1.5">
              {currentStageInfo.title}:
            </span>
            <span className="theme-text-muted">
              {currentStageInfo.learningGoal}
            </span>
          </p>
        </div>

        {/* Next Stage button — hidden on last stage */}
        {currentIdx < STAGES_META.length - 1 && (
          <button
            onClick={() => advanceStage()}
            className="theme-btn-primary self-end sm:self-auto shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all"
          >
            <span>Next Stage</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
