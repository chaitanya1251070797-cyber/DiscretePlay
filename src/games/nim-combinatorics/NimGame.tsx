import React, { useState, useEffect, useCallback } from 'react';
import { useLearningEngine } from '../../engine/LearningEngineContext';
import { RotateCcw, CheckCircle2, Bot, User, Zap, Sparkles } from 'lucide-react';
import { sound } from '../../utils/sound';
import confetti from 'canvas-confetti';

export const NimGame: React.FC = () => {
  const { 
    currentStage, 
    recordAction, 
    addExplanation, 
    advanceStage, 
    markConceptMastered,
    updateSharedGameState,
  } = useLearningEngine();

  const isIndependent = currentStage === 'INDEPENDENT_APPLICATION';

  // Initial piles: [3, 4, 5] for beginner/guided, [3, 5, 7] for independent challenge!
  const initialPiles = isIndependent ? [3, 5, 7] : [3, 4, 5];

  const [piles, setPiles] = useState<number[]>(initialPiles);
  const [selectedPile, setSelectedPile] = useState<number | null>(null);
  const [sticksToRemove, setSticksToRemove] = useState<number>(1);
  const [currentTurn, setCurrentTurn] = useState<'player' | 'ai'>('player');
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null);

  const resetGame = useCallback(() => {
    sound.playClick(400);
    setPiles(initialPiles);
    setSelectedPile(null);
    setSticksToRemove(1);
    setCurrentTurn('player');
    setWinner(null);
  }, [initialPiles]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  // Compute live Nim-Sum
  const nimSum = piles.reduce((acc, curr) => acc ^ curr, 0);

  // Update shared state for the XOR visualizer
  useEffect(() => {
    updateSharedGameState({
      piles,
      nimSum
    });
  }, [piles, nimSum, updateSharedGameState]);

  // Handle Player Move
  const handlePlayerMove = () => {
    if (selectedPile === null || winner !== null || currentTurn !== 'player') return;

    const pileSize = piles[selectedPile];
    if (sticksToRemove < 1 || sticksToRemove > pileSize) return;

    sound.playMove();
    const newPiles = [...piles];
    newPiles[selectedPile] -= sticksToRemove;
    setPiles(newPiles);
    setSelectedPile(null);
    setSticksToRemove(1);

    const newNimSum = newPiles.reduce((acc, curr) => acc ^ curr, 0);

    // Evaluate Move Quality
    if (newNimSum === 0) {
      recordAction(true);
      addExplanation(
        'Invincible P-Position Created! (Nim-Sum = 0)',
        `You reduced Heap #${selectedPile + 1} and balanced the Bitwise XOR Sum to 0!`,
        `By Bouton's Theorem, this is a P-position (Kernel). Every move your opponent makes will leave Nim-Sum > 0, granting you an unlosable countermove.`,
        'strategic_subgoal',
        'Rosen Section 4.2: Bit Operations and Bouton’s Theorem'
      );
    } else {
      recordAction(false, 'unbalanced_nim_sum', `You left Nim-Sum = ${newNimSum} > 0. This gives the opponent an opportunity to balance it.`);
      addExplanation(
        'Vulnerable State Left (Nim-Sum > 0)',
        `Current Nim-Sum is ${newNimSum}.`,
        `In impartial games, leaving an unbalanced bit-column parity allows the opponent to secure the P-position.`,
        'invalid_move'
      );
    }

    // Check if player took last stick (Win)
    if (newPiles.every(p => p === 0)) {
      setWinner('player');
      sound.playSuccess();
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 }
      });

      addExplanation(
        'Victory in Nim!',
        'You took the final laser rod and won the match!',
        'Normal play convention: the player who makes the last legal move wins.',
        'strategic_subgoal'
      );

      if (isIndependent) {
        markConceptMastered('nim-sum-xor');
      }
      return;
    }

    // Pass turn to AI
    setCurrentTurn('ai');
  };

  // AI Turn Logic
  useEffect(() => {
    if (currentTurn !== 'ai' || winner !== null) return;

    const aiTimer = setTimeout(() => {
      // Find optimal winning move if possible: find pile where pile ^ nimSum < pile
      let movePile = -1;
      let targetSize = -1;

      for (let i = 0; i < piles.length; i++) {
        const target = piles[i] ^ nimSum;
        if (target < piles[i]) {
          movePile = i;
          targetSize = target;
          break;
        }
      }

      // If already at nim-sum 0, AI makes random legal move
      if (movePile === -1) {
        const nonZeroIdxs = piles.map((p, idx) => p > 0 ? idx : -1).filter(idx => idx !== -1);
        movePile = nonZeroIdxs[Math.floor(Math.random() * nonZeroIdxs.length)];
        targetSize = piles[movePile] - 1;
      }

      const removeCount = piles[movePile] - targetSize;
      const nextPiles = [...piles];
      nextPiles[movePile] = targetSize;
      setPiles(nextPiles);
      sound.playPlace();

      const nextNimSum = nextPiles.reduce((acc, curr) => acc ^ curr, 0);

      if (nextNimSum === 0) {
        addExplanation(
          'AI Countermove Forced Nim-Sum = 0',
          `AI removed ${removeCount} rods from Heap #${movePile + 1}.`,
          `AI balanced the XOR sum to 0 using n_i' = n_i XOR S.`,
          'invalid_move'
        );
      }

      // Check if AI won
      if (nextPiles.every(p => p === 0)) {
        setWinner('ai');
        sound.playError();
      } else {
        setCurrentTurn('player');
      }
    }, 700);

    return () => clearTimeout(aiTimer);
  }, [currentTurn, piles, nimSum, winner, addExplanation]);

  // AI expression state
  const getAiMood = () => {
    if (winner === 'player') return { text: 'DEFEATED...', color: 'text-rose-400', emoji: '💥' };
    if (winner === 'ai') return { text: 'VICTORIOUS!', color: 'text-amber-400', emoji: '👑' };
    if (nimSum === 0) return { text: 'NERVOUS (P-POSITION)', color: 'text-cyan-400', emoji: '😰' };
    return { text: 'CONFIDENT (N-POSITION)', color: 'text-purple-300', emoji: '🤖' };
  };

  const aiMood = getAiMood();

  return (
    <div className="theme-panel rounded-2xl p-5 flex flex-col gap-4 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-500/30 pb-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Nim & Combinatorial Game Theory</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/40">
              Y2K ARCADE ARENA
            </span>
          </h2>
          <p className="text-xs text-purple-200/80 font-mono mt-0.5">
            {isIndependent 
              ? 'Independent Challenge: Balance XOR sum for [3, 5, 7] to force unlosable P-position' 
              : 'Take any number of laser rods from one heap. Maintain Nim-Sum = 0 to win!'}
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          {/* AI Avatar Mood indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 border border-purple-500/40 shadow-inner">
            <span className="text-base">{aiMood.emoji}</span>
            <span className={`font-bold text-[10px] ${aiMood.color}`}>{aiMood.text}</span>
          </div>

          <button
            onClick={resetGame}
            className="p-2 rounded-xl bg-black/60 border border-purple-500/40 text-purple-300 hover:text-white transition cursor-pointer"
            title="Reset Piles"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Large Arcade 7-Segment / LED Matrix Display */}
      <div className={`p-3 rounded-xl border font-mono text-center flex flex-col sm:flex-row items-center justify-between gap-2 shadow-inner ${
        nimSum === 0
          ? 'bg-emerald-950/70 border-emerald-400/60 text-emerald-300'
          : 'bg-amber-950/70 border-amber-400/60 text-amber-300'
      }`}>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4" />
          <span className="font-black tracking-wider text-xs sm:text-sm">
            {nimSum === 0 
              ? '[ P-POSITION: SAFE (S=0) — WINNING KERNEL ]' 
              : `[ N-POSITION: VULNERABLE (S=${nimSum}) — UNBALANCED ]`}
          </span>
        </div>
        <div className="text-[11px] font-bold px-2 py-0.5 rounded bg-black/40 border border-current">
          XOR SUM: &oplus; = {nimSum} ({nimSum.toString(2).padStart(3, '0')}₂)
        </div>
      </div>

      {/* Matchstick Heaps Arena — Perspective 3D Wireframe */}
      <div className="relative p-6 bg-black/90 rounded-2xl border border-purple-500/40 flex justify-around items-end min-h-[240px] shadow-inner overflow-hidden">
        {piles.map((count, idx) => {
          const isSelected = selectedPile === idx;
          return (
            <div
              key={idx}
              onClick={() => {
                if (count > 0 && currentTurn === 'player' && !winner) {
                  sound.playClick(440);
                  setSelectedPile(idx);
                  setSticksToRemove(1);
                }
              }}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl cursor-pointer transition-all ${
                isSelected 
                  ? 'bg-purple-900/60 ring-2 ring-purple-400 shadow-xl shadow-purple-500/50 scale-105' 
                  : count > 0 
                  ? 'hover:bg-purple-950/50 hover:scale-[1.02]' 
                  : 'opacity-25 cursor-not-allowed'
              }`}
            >
              {/* Vertical glowing laser rods */}
              <div className="flex flex-col-reverse gap-2 items-center min-h-[140px] justify-end">
                {Array.from({ length: count }, (_, sIdx) => (
                  <div
                    key={sIdx}
                    className="w-5 h-5 arcade-stick shadow-lg shadow-amber-500/30 transition-transform hover:scale-110"
                  />
                ))}
              </div>

              {/* Heap label and binary representation */}
              <div className="text-center font-mono mt-1">
                <span className="text-[11px] text-purple-300 font-bold block">Heap #{idx + 1}</span>
                <span className="text-sm font-black text-white">{count} rods</span>
                <span className="text-[10px] text-amber-300 block font-mono">({count.toString(2).padStart(3, '0')}₂)</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Player Action Controls with Chunky Arcade Buttons */}
      {selectedPile !== null && currentTurn === 'player' && !winner && (
        <div className="p-4 bg-black/80 rounded-2xl border border-purple-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in shadow-xl">
          <div className="flex items-center gap-3">
            <span className="text-xs text-purple-200 font-bold">
              Remove from Heap #{selectedPile + 1}:
            </span>
            <div className="flex items-center gap-1.5 font-mono">
              {Array.from({ length: piles[selectedPile] }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  onClick={() => {
                    sound.playClick(500);
                    setSticksToRemove(num);
                  }}
                  className={`w-8 h-8 rounded-xl text-xs font-black transition cursor-pointer shadow-md ${
                    sticksToRemove === num 
                      ? 'bg-amber-400 text-slate-950 scale-110 ring-2 ring-white' 
                      : 'bg-purple-950/90 text-purple-200 border border-purple-500/40 hover:bg-purple-800'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handlePlayerMove}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-purple-500/40 transition active:scale-95 cursor-pointer"
          >
            CONFIRM MOVE: TAKE {sticksToRemove} RODS
          </button>
        </div>
      )}

      {/* Turn indicator banner if no selection */}
      {selectedPile === null && !winner && (
        <div className="py-2 px-4 rounded-xl bg-black/40 border border-purple-500/20 text-xs font-mono flex items-center justify-between">
          <span className="text-purple-300">
            {currentTurn === 'player' ? '👉 Click any Heap above to select how many laser rods to remove' : '🤖 AI calculating optimal countermove...'}
          </span>
          <span className="text-amber-300 font-bold">{currentTurn === 'player' ? 'YOUR MOVE' : 'AI TURN'}</span>
        </div>
      )}

      {/* Winner Banner */}
      {winner && (
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in shadow-2xl ${
          winner === 'player' 
            ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200' 
            : 'bg-rose-950/90 border-rose-400 text-rose-200'
        }`}>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <div>
              <h4 className="text-sm font-black">{winner === 'player' ? 'Victory! You Won the Nim Match!' : 'AI Secured Victory'}</h4>
              <p className="text-xs opacity-90">
                {winner === 'player' 
                  ? 'Your strategic maintenance of P-positions left the AI with zero counter-options.' 
                  : 'The AI forced Nim-Sum = 0 to secure the win.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetGame}
              className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
            >
              Play Again
            </button>
            {winner === 'player' && currentStage !== 'INDEPENDENT_APPLICATION' && (
              <button
                onClick={() => {
                  sound.playSuccess();
                  advanceStage();
                }}
                className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition cursor-pointer"
              >
                Advance Stage
              </button>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-xs text-purple-200/70 bg-black/40 p-3 rounded-xl border border-purple-500/20 flex flex-wrap items-center justify-between gap-2 font-mono">
        <span>Bouton&apos;s Theorem: P-position (Kernel) &hArr; Nim-Sum &oplus; = 0.</span>
        <span className="text-emerald-400 font-bold text-[11px]">S = n_1 &oplus; n_2 &oplus; n_3</span>
      </div>
    </div>
  );
};
