import React from 'react';
import { useLearningEngine } from '../../engine/LearningEngineContext';
import { X, BookMarked, ExternalLink, Bookmark, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';

export const RosenReferenceModal: React.FC = () => {
  const { isRosenModalOpen, setRosenModalOpen, currentGame } = useLearningEngine();

  if (!isRosenModalOpen) return null;

  const concept = currentGame.concept;
  const rosen = concept.rosenReference;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Kenneth H. Rosen Textbook Reference</span>
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                  {rosen.edition}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Discrete Mathematics and Its Applications &bull; {rosen.chapter}
              </p>
            </div>
          </div>
          <button
            onClick={() => setRosenModalOpen(false)}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Section Banner */}
          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col gap-1.5">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
              {rosen.section}
            </span>
            <h4 className="text-lg font-bold text-slate-100">{rosen.topic}</h4>
            <p className="text-xs text-slate-400 font-serif italic">
              &ldquo;{rosen.excerpt}&rdquo;
            </p>
          </div>

          {/* Formal Mathematical Definition */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-indigo-400" />
              <span>Formal Mathematical Definition</span>
            </h5>
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-200 leading-relaxed font-mono text-xs">
              {concept.formalDefinition}
            </div>
          </div>

          {/* Mathematical Formulas & Derivations */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Formulas & Derivation</span>
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {concept.formulas.map((f, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-slate-300">{f.label}</span>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-amber-300">
                    {f.latex}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    {f.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Connection to the Game */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Game Invariant Connection</span>
            </h5>
            <p className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-200 text-xs leading-relaxed">
              {concept.gameConnection}
            </p>
          </div>

          {/* Real-World Computer Science Applications */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Real-World Engineering & Computer Science Applications</span>
            </h5>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {concept.realWorldApplications.map((app, idx) => (
                <li key={idx} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                  <span>{app}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Kenneth H. Rosen, Discrete Mathematics and Its Applications, 8th Global Edition</span>
          <button
            onClick={() => setRosenModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition"
          >
            Close Reference
          </button>
        </div>
      </div>
    </div>
  );
};

