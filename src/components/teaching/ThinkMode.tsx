import React, { useState } from 'react';
import { useLearningEngine } from '../../engine/LearningEngineContext';
import { HelpCircle, CheckCircle, XCircle, Lightbulb, ArrowRight } from 'lucide-react';

export const ThinkMode: React.FC = () => {
  const { currentThinkPrompt, currentGame, submitThinkAnswer, advanceStage, currentStage } = useLearningEngine();
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [result, setResult] = useState<{ isCorrect: boolean; explanation: string } | null>(null);

  // If no prompt is currently triggered, pick the default prompt for the active stage
  const prompt = currentThinkPrompt || currentGame.thinkPrompts[0];

  if (!prompt) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 gap-2">
        <HelpCircle className="w-8 h-8 text-slate-600" />
        <p className="text-sm">No active question right now.</p>
        <p className="text-xs text-slate-500">Make moves on the board to trigger guided mathematical reasoning prompts!</p>
      </div>
    );
  }

  const handleSelect = (idx: number) => {
    if (result !== null) return;
    setSelectedIdx(idx);
    const evalResult = submitThinkAnswer(idx);
    setResult(evalResult);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Question Header */}
      <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <HelpCircle className="w-4 h-4" />
          <span>Think & Predict: Guided Mathematical Reasoning</span>
        </div>
        <p className="text-sm font-medium text-slate-100 leading-snug">
          {prompt.question}
        </p>
        {prompt.contextHint && (
          <p className="text-xs text-indigo-300/80 mt-2 flex items-start gap-1.5 italic">
            <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
            <span>Hint: {prompt.contextHint}</span>
          </p>
        )}
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {prompt.options.map((opt, idx) => {
          const isSelected = selectedIdx === idx;
          const showEvaluation = result !== null;

          let btnStyle = 'bg-slate-900 hover:bg-slate-800/80 border-slate-800 text-slate-300';
          if (showEvaluation) {
            if (opt.isCorrect) {
              btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500';
            } else if (isSelected) {
              btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200 ring-1 ring-rose-500';
            } else {
              btnStyle = 'opacity-50 bg-slate-950 border-slate-900 text-slate-500';
            }
          }

          return (
            <button
              key={idx}
              disabled={showEvaluation}
              onClick={() => handleSelect(idx)}
              className={`p-3 text-left rounded-xl border text-xs font-medium transition-all flex items-start gap-3 ${btnStyle}`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px] font-mono border ${
                showEvaluation && opt.isCorrect
                  ? 'border-emerald-400 text-emerald-300 bg-emerald-900/50'
                  : showEvaluation && isSelected
                  ? 'border-rose-400 text-rose-300 bg-rose-900/50'
                  : 'border-slate-700 text-slate-400 bg-slate-950'
              }`}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="leading-relaxed flex-1">{opt.text}</span>
            </button>
          );
        })}
      </div>

      {/* Evaluation Feedback */}
      {result && (
        <div className={`p-3 rounded-xl border text-xs leading-relaxed flex flex-col gap-2 animate-in fade-in ${
          result.isCorrect 
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
            : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
        }`}>
          <div className="flex items-center gap-1.5 font-bold">
            {result.isCorrect ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Correct Insight!</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>Incorrect Deduction</span>
              </>
            )}
          </div>
          <p className="text-slate-300">{result.explanation}</p>

          {currentStage === 'GUIDED_REASONING' && result.isCorrect && (
            <button
              onClick={() => advanceStage()}
              className="mt-1 self-end px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition"
            >
              <span>Proceed to Mathematical Revelation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

