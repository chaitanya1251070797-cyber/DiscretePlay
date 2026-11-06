import React from 'react';
import { useLearningEngine } from '../../engine/LearningEngineContext';
import { KNOWLEDGE_GRAPH_NODES, getRecommendedNextNodes } from '../../engine/KnowledgeGraph';
import { Trophy, Sparkles, CheckCircle2, ArrowRight, BookMarked, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export const MasteryCelebrationModal: React.FC = () => {
  const { 
    isCelebrationOpen, 
    setCelebrationOpen, 
    lastMasteredNodeId, 
    allMasteredConcepts,
    currentGame,
    switchGame 
  } = useLearningEngine();

  if (!isCelebrationOpen) return null;

  const node = KNOWLEDGE_GRAPH_NODES.find(n => n.id === lastMasteredNodeId) || {
    id: 'mastered-node',
    title: currentGame.concept.name,
    category: currentGame.concept.category,
    rosenSection: currentGame.concept.rosenReference.section,
    description: currentGame.concept.simpleExplanation,
    gameId: currentGame.id
  };

  const nextRecommendations = getRecommendedNextNodes(allMasteredConcepts);

  const handleNextGame = () => {
    setCelebrationOpen(false);
    if (nextRecommendations.length > 0) {
      switchGame(nextRecommendations[0].gameId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl w-full max-w-lg p-6 flex flex-col items-center text-center shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={() => setCelebrationOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Trophy icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30 mb-4 animate-bounce">
          <Trophy className="w-9 h-9" />
        </div>

        <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 mb-1">
          Concept Mastered!
        </span>
        <h3 className="text-xl font-extrabold text-white mb-2">
          {node.title}
        </h3>
        <p className="text-xs text-slate-300 mb-4 leading-relaxed max-w-sm">
          You successfully proved independent mastery of this discrete mathematical principle under rigorous challenge conditions!
        </p>

        {/* Rosen Badge */}
        <div className="p-3 w-full rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center gap-2 text-xs font-mono text-amber-300 mb-5">
          <BookMarked className="w-4 h-4" />
          <span>Curriculum Record: {node.rosenSection} &bull; {node.category}</span>
        </div>

        {/* Next Concept Recommendation */}
        {nextRecommendations.length > 0 && (
          <div className="w-full p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-left mb-5">
            <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider block mb-1">
              Next Unlocked Milestone:
            </span>
            <div className="text-xs font-bold text-white">
              {nextRecommendations[0].title}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {nextRecommendations[0].description}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={() => setCelebrationOpen(false)}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition"
          >
            Review Board
          </button>
          {nextRecommendations.length > 0 && (
            <button
              onClick={handleNextGame}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition"
            >
              <span>Advance Curriculum</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

