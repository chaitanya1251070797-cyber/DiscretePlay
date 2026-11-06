import React, { useState, useEffect, useCallback } from 'react';
import { useLearningEngine } from '../../engine/LearningEngineContext';
import { RotateCcw, ArrowRight, CheckCircle2, ShieldAlert, Sparkles, Layers } from 'lucide-react';

type Peg = number[]; // disk sizes from bottom to top

export const HanoiGame: React.FC = () => {
  const { 
    currentStage, 
    recordAction, 
    addExplanation, 
    advanceStage, 
    markConceptMastered,
    updateSharedGameState,
    setInteractionMode
  } = useLearningEngine();

  // Number of disks depends on stage: 3 for Discover/Experiment/Reasoning, 4 for Independent Application!
  const diskCount = currentStage === 'INDEPENDENT_APPLICATION' ? 4 : 3;
  const optimalMoves = Math.pow(2, diskCount) - 1;

  // Pegs state: Peg 0 (A), Peg 1 (B), Peg 2 (C)
  const [pegs, setPegs] = useState<Peg[]>([
    Array.from({ length: diskCount }, (_, i) => diskCount - i),
    [],
    []
  ]);

  const [selectedPeg, setSelectedPeg] = useState<number | null>(null);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [isSolved, setIsSolved] = useState<boolean>(false);

  // Reset pegs when diskCount changes
  const resetGame = useCallback(() => {
    setPegs([
      Array.from({ length: diskCount }, (_, i) => diskCount - i),
      [],
      []
    ]);
    setSelectedPeg(null);
    setMoveCount(0);
    setIsSolved(false);
  }, [diskCount]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  // Update shared state for live recurrence tree
  useEffect(() => {
    updateSharedGameState({ diskCount, moveCount, optimalMoves });
  }, [diskCount, moveCount, optimalMoves, updateSharedGameState]);

  const handlePegClick = (pegIdx: number) => {
    if (isSolved) return;

    if (selectedPeg === null) {
      // Pick source peg
      if (pegs[pegIdx].length === 0) return;
      setSelectedPeg(pegIdx);
    } else {
      // Attempt move from selectedPeg to pegIdx
      const fromPeg = selectedPeg;
      const toPeg = pegIdx;
      setSelectedPeg(null);

      if (fromPeg === toPeg) return;

      const sourceStack = [...pegs[fromPeg]];
      const targetStack = [...pegs[toPeg]];
      const movingDisk = sourceStack[sourceStack.length - 1];
      const targetTopDisk = targetStack.length > 0 ? targetStack[targetStack.length - 1] : Infinity;

      // VALIDATION: Check invariant (larger disk cannot be placed on smaller disk)
      if (movingDisk > targetTopDisk) {
        // VIOLATION!
        recordAction(
          false, 
          'larger_on_smaller', 
          `Disk ${movingDisk} cannot be placed on smaller Disk ${targetTopDisk}. This violates the fundamental size invariant!`
        );
        addExplanation(
          'Size Invariant Violation',
          `You attempted to place Disk #${movingDisk} on top of Disk #${targetTopDisk}.`,
          `Formally, in Tower of Hanoi, a move from Peg ${String.fromCharCode(65+fromPeg)} to Peg ${String.fromCharCode(65+toPeg)} is valid iff target peg is empty or disk_{top} > disk_{moving}. This preserves the total ordering property.`,
          'invalid_move',
          'Rosen 8th Ed. Section 8.1 Example 1: Rules of Hanoi'
        );
        setInteractionMode('EXPLAIN');
        return;
      }

      // Valid move!
      sourceStack.pop();
      targetStack.push(movingDisk);

      const nextPegs = [...pegs];
      nextPegs[fromPeg] = sourceStack;
      nextPegs[toPeg] = targetStack;
      setPegs(nextPegs);
      setMoveCount(prev => prev + 1);
      recordAction(true);

      // Check subproblem milestone: e.g. disks 1 & 2 transferred to Peg B
      const pegB = nextPegs[1];
      const pegC = nextPegs[2];
      if (diskCount === 3 && pegB.length === 2 && pegB[0] === 2 && pegB[1] === 1 && nextPegs[0].length === 1) {
        addExplanation(
          'Recursive Subproblem Milestone T(2) Reached!',
          'Notice: the top 2 disks are now safely stacked on Peg B. Disk 3 is free to transfer directly to Peg C!',
          'Subproblem T(n-1) solved in 2^{n-1} - 1 = 2^2 - 1 = 3 moves.',
          'strategic_subgoal'
        );
      }

      // Check Win Condition: All disks on Peg C (Peg 2)
      if (nextPegs[2].length === diskCount) {
        setIsSolved(true);
        const nextMoves = moveCount + 1;
        const isOptimal = nextMoves === optimalMoves;

        addExplanation(
          'Tower of Hanoi Solved!',
          `You transferred all ${diskCount} disks in ${nextMoves} moves (Optimal: ${optimalMoves}).`,
          `Closed form recurrence verified: T(${diskCount}) = 2^{${diskCount}} - 1 = ${optimalMoves}.`,
          'strategic_subgoal'
        );

        if (currentStage === 'INDEPENDENT_APPLICATION') {
          if (nextMoves <= optimalMoves + 3) {
            markConceptMastered('recurrence-relations');
          }
        }
      }
    }
  };

  const diskColors = [
    'from-rose-500 to-pink-600',
    'from-amber-400 to-orange-500',
    'from-emerald-400 to-teal-500',
    'from-indigo-500 to-blue-600',
    'from-purple-500 to-violet-600'
  ];

  const pegLabels = ['Peg A (Source)', 'Peg B (Auxiliary)', 'Peg C (Target)'];

  return (
    <div className="theme-panel rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
      {/* Game Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Tower of Hanoi</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {diskCount} Disks &bull; Glass Temple
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            {currentStage === 'INDEPENDENT_APPLICATION' 
              ? 'Independent Challenge: Solve in &le; 18 moves without hints' 
              : 'Transfer the entire tower from Peg A to Peg C'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono text-xs bg-slate-950/80 px-3 py-1.5 rounded-xl border border-cyan-500/30">
            <span className="text-slate-400">Moves:</span>
            <span className={`font-bold ${moveCount <= optimalMoves ? 'text-emerald-400' : 'text-amber-400'}`}>
              {moveCount}
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">Optimal: {optimalMoves}</span>
          </div>

          <button
            onClick={resetGame}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-cyan-600/50 text-slate-300 hover:text-white transition border border-white/10"
            title="Reset Disks"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Gameplay Arena */}
      <div className="relative py-6 px-4 bg-slate-950/60 rounded-xl border border-cyan-500/20 flex items-end justify-around min-h-[260px]">
        {pegs.map((peg, pIdx) => {
          const isSelected = selectedPeg === pIdx;
          return (
            <div
              key={pIdx}
              onClick={() => handlePegClick(pIdx)}
              className={`flex-1 flex flex-col items-center cursor-pointer group transition-all py-2 rounded-xl ${
                isSelected ? 'bg-cyan-950/40 ring-2 ring-cyan-400 shadow-lg shadow-cyan-500/20' : 'hover:bg-cyan-950/20'
              }`}
            >
              {/* Rod Pole */}
              <div className="relative w-full flex justify-center items-end h-44">
                {/* Vertical Wooden Peg */}
                <div className={`absolute bottom-0 w-3.5 h-40 rounded-t-full transition-all aero-crystal-peg ${
                  isSelected ? 'brightness-125' : ''
                }`} />

                {/* Staked Disks */}
                <div className="z-10 flex flex-col-reverse items-center w-full">
                  {peg.map((diskSize) => {
                    const widthPercent = 30 + (diskSize / diskCount) * 60;
                    const colorClass = diskColors[(diskSize - 1) % diskColors.length];
                    return (
                      <div
                        key={diskSize}
                        style={{ width: `${widthPercent}%` }}
                        className={`h-7 rounded-lg bg-gradient-to-r ${colorClass} aero-gloss-disk flex items-center justify-center font-mono font-bold text-xs text-white mb-1 transition-transform group-hover:scale-[1.02]`}
                      >
                        {diskSize}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Peg Base Plate */}
              <div className="w-4/5 h-3 rounded-full bg-cyan-950/80 mt-2 border border-cyan-500/40 shadow-sm shadow-cyan-500/20" />
              <span className="text-xs font-mono font-medium text-cyan-300/80 mt-1">
                {pegLabels[pIdx]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Success Notification Bar */}
      {isSolved && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Puzzle Solved Successfully!</h4>
              <p className="text-xs text-emerald-300">
                You completed the challenge in {moveCount} moves (Minimum possible: {optimalMoves}).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetGame}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Replay
            </button>
            {currentStage !== 'INDEPENDENT_APPLICATION' && (
              <button
                onClick={() => advanceStage()}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition"
              >
                <span>Advance to Next Stage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* In-Game Interactive Hints / Contextual instructions */}
      <div className="text-xs text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
        <span>Click a peg to select the top disk, then click another peg to move it.</span>
        <span className="text-indigo-400 font-mono text-[11px]">Recurrence: T(n) = 2T(n-1) + 1</span>
      </div>
    </div>
  );
};

