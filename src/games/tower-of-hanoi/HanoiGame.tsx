import React, { useState, useEffect, useCallback } from 'react';
import { useLearningEngine } from '../../engine/LearningEngineContext';
import { RotateCcw, ArrowRight, CheckCircle2, Undo2, Award, Zap } from 'lucide-react';
import { sound } from '../../utils/sound';
import confetti from 'canvas-confetti';

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

  // 3 for earlier stages, 4 for Independent Application challenge
  const diskCount = currentStage === 'INDEPENDENT_APPLICATION' ? 4 : 3;
  const optimalMoves = Math.pow(2, diskCount) - 1;

  // Pegs state: Peg 0 (A), Peg 1 (B), Peg 2 (C)
  const [pegs, setPegs] = useState<Peg[]>([
    Array.from({ length: diskCount }, (_, i) => diskCount - i),
    [],
    []
  ]);

  const [history, setHistory] = useState<Peg[][]>([]);
  const [selectedPeg, setSelectedPeg] = useState<number | null>(null);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [errorPeg, setErrorPeg] = useState<number | null>(null);

  // Reset pegs when diskCount changes
  const resetGame = useCallback(() => {
    sound.playClick(440);
    setPegs([
      Array.from({ length: diskCount }, (_, i) => diskCount - i),
      [],
      []
    ]);
    setHistory([]);
    setSelectedPeg(null);
    setMoveCount(0);
    setIsSolved(false);
    setErrorPeg(null);
  }, [diskCount]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  // Update shared state for live recurrence tree
  useEffect(() => {
    updateSharedGameState({ diskCount, moveCount, optimalMoves });
  }, [diskCount, moveCount, optimalMoves, updateSharedGameState]);

  const undoMove = () => {
    if (history.length === 0 || isSolved) return;
    sound.playClick(380);
    const prev = history[history.length - 1];
    setPegs(prev);
    setHistory(history.slice(0, -1));
    setMoveCount(c => Math.max(0, c - 1));
    setSelectedPeg(null);
  };

  const handlePegClick = (pegIdx: number) => {
    if (isSolved) return;

    if (selectedPeg === null) {
      // Pick source peg
      if (pegs[pegIdx].length === 0) return;
      sound.playMove();
      setSelectedPeg(pegIdx);
    } else {
      // Attempt move from selectedPeg to pegIdx
      const fromPeg = selectedPeg;
      const toPeg = pegIdx;
      setSelectedPeg(null);

      if (fromPeg === toPeg) {
        sound.playClick(350);
        return;
      }

      const sourceStack = [...pegs[fromPeg]];
      const targetStack = [...pegs[toPeg]];
      const movingDisk = sourceStack[sourceStack.length - 1];
      const targetTopDisk = targetStack.length > 0 ? targetStack[targetStack.length - 1] : Infinity;

      // VALIDATION: Check invariant (larger disk cannot be placed on smaller disk)
      if (movingDisk > targetTopDisk) {
        sound.playError();
        setErrorPeg(toPeg);
        setTimeout(() => setErrorPeg(null), 600);

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
      sound.playPlace();
      setHistory(h => [...h, pegs]);

      sourceStack.pop();
      targetStack.push(movingDisk);

      const nextPegs = [...pegs];
      nextPegs[fromPeg] = sourceStack;
      nextPegs[toPeg] = targetStack;
      setPegs(nextPegs);

      const nextMoves = moveCount + 1;
      setMoveCount(nextMoves);
      recordAction(true);

      // Check win condition: all disks successfully on Peg 2 (C)
      if (nextPegs[2].length === diskCount) {
        setIsSolved(true);
        sound.playSuccess();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        markConceptMastered('recursion-base');
        if (nextMoves <= optimalMoves) {
          markConceptMastered('recurrence-relations');
        }
        if (currentStage === 'INDEPENDENT_APPLICATION') {
          markConceptMastered('closed-form-recurrences');
        }

        addExplanation(
          'Tower of Hanoi Solved!',
          `Transferred ${diskCount} disks in ${nextMoves} moves (Optimal minimum: ${optimalMoves}).`,
          `By solving the recurrence T(n) = 2T(n-1) + 1 with base case T(1) = 1, we get T(n) = 2^n - 1. For n=${diskCount}, T(${diskCount}) = 2^${diskCount} - 1 = ${optimalMoves} moves.`,
          'strategic_subgoal',
          'Rosen 8th Ed. Section 8.1 Example 1 & Theorem 1'
        );
      }
    }
  };

  const pegLabels = ['Peg A (Source)', 'Peg B (Auxiliary)', 'Peg C (Destination)'];
  const diskGradients = [
    'from-cyan-400 via-sky-300 to-blue-500',
    'from-emerald-400 via-teal-300 to-green-600',
    'from-amber-400 via-yellow-200 to-orange-500',
    'from-fuchsia-400 via-pink-300 to-purple-600',
    'from-rose-400 via-red-300 to-rose-700'
  ];

  // Rank calculator
  const getRank = () => {
    if (moveCount === 0) return null;
    if (moveCount <= optimalMoves) return { label: 'S-RANK OPTIMAL', color: 'text-amber-300 border-amber-400/40 bg-amber-400/10' };
    if (moveCount <= optimalMoves + 4) return { label: 'A-RANK GREAT', color: 'text-emerald-300 border-emerald-400/40 bg-emerald-400/10' };
    return { label: 'B-RANK PASSING', color: 'text-blue-300 border-blue-400/40 bg-blue-400/10' };
  };

  const currentRank = getRank();

  return (
    <div className="theme-panel rounded-2xl p-5 flex flex-col gap-4 shadow-2xl relative overflow-hidden">
      {/* Specular gloss top highlight */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-t-2xl" />

      {/* Game Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/20 pb-3 relative z-10">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Tower of Hanoi</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>{diskCount} Disks &bull; Glass Temple</span>
            </span>
          </h2>
          <p className="text-xs text-slate-300">
            {currentStage === 'INDEPENDENT_APPLICATION' 
              ? `Mastery Challenge: Transfer all 4 disks to Peg C in optimal 15 moves` 
              : 'Transfer the liquid crystal stack from Peg A to Peg C using recursive sub-goals'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentRank && (
            <div className={`hidden sm:flex items-center gap-1 font-mono text-[11px] px-2.5 py-1 rounded-xl border ${currentRank.color}`}>
              <Award className="w-3.5 h-3.5" />
              <span>{currentRank.label}</span>
            </div>
          )}

          <div className="flex items-center gap-2 font-mono text-xs bg-black/40 px-3 py-1.5 rounded-xl border border-cyan-500/30">
            <span className="text-slate-400">Moves:</span>
            <span className={`font-bold ${moveCount <= optimalMoves ? 'text-emerald-400' : 'text-amber-400'}`}>
              {moveCount}
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-cyan-300">Min: {optimalMoves}</span>
          </div>

          <button
            onClick={undoMove}
            disabled={history.length === 0 || isSolved}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition border border-white/10 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            title="Undo Last Move"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            onClick={resetGame}
            className="p-2 rounded-xl bg-white/10 hover:bg-cyan-500/30 text-slate-300 hover:text-white transition border border-white/10 cursor-pointer"
            title="Reset Disks"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Selected Indicator */}
      {selectedPeg !== null && (
        <div className="py-1 px-3 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-mono flex items-center justify-between animate-pulse">
          <span>HOLDING TOP DISK OF {pegLabels[selectedPeg].split(' ')[0]}</span>
          <span className="text-cyan-400 font-bold">Select destination peg &rarr;</span>
        </div>
      )}

      {/* Gameplay Arena — Frutiger Aero Translucent Glass Platform */}
      <div className="relative py-6 px-4 bg-gradient-to-b from-cyan-950/40 via-sky-950/20 to-black/60 rounded-2xl border border-cyan-500/30 flex items-end justify-around min-h-[280px] shadow-inner">
        {pegs.map((peg, pIdx) => {
          const isSelected = selectedPeg === pIdx;
          const isError = errorPeg === pIdx;
          return (
            <div
              key={pIdx}
              onClick={() => handlePegClick(pIdx)}
              className={`flex-1 flex flex-col items-center cursor-pointer group transition-all py-3 rounded-2xl relative ${
                isSelected 
                  ? 'bg-cyan-500/15 ring-2 ring-cyan-400 shadow-xl shadow-cyan-500/30 scale-[1.02]' 
                  : isError
                  ? 'bg-rose-500/20 ring-2 ring-rose-500 screen-shake'
                  : 'hover:bg-cyan-500/10'
              }`}
            >
              {/* Rod Pole with crystal gradient */}
              <div className="relative w-full flex justify-center items-end h-48">
                {/* Vertical crystal peg */}
                <div className={`absolute bottom-0 w-3.5 h-44 rounded-t-full transition-all aero-crystal-peg ${
                  isSelected ? 'brightness-125 shadow-lg shadow-cyan-400' : ''
                }`} />

                {/* Ambient light beam behind peg */}
                <div className="absolute bottom-0 w-8 h-44 bg-cyan-400/10 blur-md pointer-events-none" />

                {/* Stacked Disks */}
                <div className="z-10 flex flex-col-reverse items-center w-full">
                  {peg.map((diskSize, dIdx) => {
                    const widthPercent = 28 + (diskSize / diskCount) * 64;
                    const gradient = diskGradients[(diskSize - 1) % diskGradients.length];
                    const isTopDisk = dIdx === peg.length - 1;
                    const isFloating = isSelected && isTopDisk;

                    return (
                      <div
                        key={diskSize}
                        style={{ width: `${widthPercent}%` }}
                        className={`h-7 rounded-xl bg-gradient-to-r ${gradient} aero-gloss-disk flex items-center justify-center font-mono font-black text-xs text-slate-900 mb-1.5 transition-all select-none shadow-md ${
                          isFloating ? '-translate-y-4 ring-2 ring-white scale-105 shadow-cyan-400/50' : ''
                        }`}
                      >
                        <span className="drop-shadow-sm font-extrabold">{diskSize}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Peg Base Plate */}
              <div className="w-5/6 h-3.5 rounded-full bg-cyan-900/60 mt-3 border border-cyan-400/50 shadow-md shadow-cyan-500/30" />
              <span className="text-[11px] font-mono font-semibold text-cyan-200 mt-1.5">
                {pegLabels[pIdx]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Success Notification Bar */}
      {isSolved && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-400/60 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-400/40">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Tower of Hanoi Solved!</span>
                {moveCount <= optimalMoves && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-mono">
                    OPTIMAL SOLUTION
                  </span>
                )}
              </h4>
              <p className="text-xs text-emerald-200">
                You transferred all {diskCount} disks in {moveCount} moves (Optimal minimum: {optimalMoves}).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetGame}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition cursor-pointer"
            >
              Replay
            </button>
            {currentStage !== 'INDEPENDENT_APPLICATION' && (
              <button
                onClick={() => {
                  sound.playSuccess();
                  advanceStage();
                }}
                className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/30 transition cursor-pointer"
              >
                <span>Next Stage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* In-Game Interactive Hints / Contextual instructions */}
      <div className="text-xs text-cyan-200/80 bg-black/40 p-3 rounded-xl border border-cyan-500/20 flex flex-wrap items-center justify-between gap-2">
        <span>Click a peg to lift the top disk, then click a target peg to lower it.</span>
        <span className="text-cyan-400 font-mono text-[11px] font-semibold">T(n) = 2T(n-1) + 1 &rArr; 2^n - 1</span>
      </div>
    </div>
  );
};
