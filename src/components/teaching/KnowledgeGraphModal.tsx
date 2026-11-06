import React from 'react';
import { useLearningEngine } from '../../engine/LearningEngineContext';
import { KNOWLEDGE_GRAPH_NODES, getRecommendedNextNodes } from '../../engine/KnowledgeGraph';
import { X, GitFork, CheckCircle, Lock, ArrowRight, Sparkles, BookMarked } from 'lucide-react';
import { GameId } from '../../types/learning';

export const KnowledgeGraphModal: React.FC = () => {
  const { 
    isKnowledgeGraphOpen, 
    setKnowledgeGraphOpen, 
    allMasteredConcepts,
    switchGame 
  } = useLearningEngine();

  if (!isKnowledgeGraphOpen) return null;

  const recommendedNodes = getRecommendedNextNodes(allMasteredConcepts);

  const categories = [
    'Recursion',
    'Logic',
    'Graph Theory',
    'Number Theory & Cryptography',
    'Combinatorics & Game Theory'
  ] as const;

  const handleLaunchNode = (gameId: GameId) => {
    switchGame(gameId);
    setKnowledgeGraphOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <GitFork className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Discrete Mathematics Knowledge Graph</span>
              </h3>
              <p className="text-xs text-slate-400">
                Curriculum Prerequisite Hierarchy & Mastered Competencies
              </p>
            </div>
          </div>
          <button
            onClick={() => setKnowledgeGraphOpen(false)}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Recommended Next Step Alert */}
          {recommendedNodes.length > 0 && (
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-amber-300 block">Recommended Next Concept:</span>
                  <span className="text-sm font-semibold text-white">{recommendedNodes[0].title}</span>
                  <span className="text-xs text-slate-400 ml-2 font-mono">({recommendedNodes[0].rosenSection})</span>
                </div>
              </div>
              <button
                onClick={() => handleLaunchNode(recommendedNodes[0].gameId)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition shrink-0"
              >
                <span>Launch Puzzle</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Categories Grid */}
          <div className="space-y-6">
            {categories.map(category => {
              const nodes = KNOWLEDGE_GRAPH_NODES.filter(n => n.category === category);
              if (nodes.length === 0) return null;

              return (
                <div key={category} className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span>{category}</span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {nodes.filter(n => allMasteredConcepts.includes(n.id)).length} / {nodes.length} Mastered
                    </span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {nodes.map(node => {
                      const isMastered = allMasteredConcepts.includes(node.id);
                      const prereqsMet = node.prerequisites.every(p => allMasteredConcepts.includes(p));
                      const isLocked = !prereqsMet && !isMastered;

                      return (
                        <div
                          key={node.id}
                          className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2 transition ${
                            isMastered
                              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                              : isLocked
                              ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                              : 'bg-slate-900 border-indigo-500/30 hover:border-indigo-500'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-mono text-slate-400">
                                {node.rosenSection}
                              </span>
                              {isMastered ? (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
                                  <CheckCircle className="w-3 h-3" />
                                  Mastered
                                </span>
                              ) : isLocked ? (
                                <span className="flex items-center gap-1 text-[10px] text-slate-500">
                                  <Lock className="w-3 h-3" />
                                  Locked
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/30">
                                  Available
                                </span>
                              )}
                            </div>

                            <h5 className="font-semibold text-xs text-white leading-snug">
                              {node.title}
                            </h5>
                            <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                              {node.description}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                            <span className="text-[10px] text-slate-500 font-mono">
                              Prereqs: {node.prerequisites.length === 0 ? 'None' : node.prerequisites.length}
                            </span>
                            <button
                              disabled={isLocked}
                              onClick={() => handleLaunchNode(node.gameId)}
                              className={`text-xs font-semibold flex items-center gap-1 transition ${
                                isLocked 
                                  ? 'text-slate-600 cursor-not-allowed' 
                                  : 'text-indigo-400 hover:text-indigo-300'
                              }`}
                            >
                              <span>Enter Game</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Complete Independent Challenges with zero hints to master curriculum nodes.</span>
          <button
            onClick={() => setKnowledgeGraphOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition"
          >
            Close Map
          </button>
        </div>
      </div>
    </div>
  );
};

