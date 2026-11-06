import React, { useState, useEffect, useCallback } from 'react';
import { useLearningEngine } from '../../engine/LearningEngineContext';
import { Layers, RotateCcw, CheckCircle2, ShieldCheck, AlertCircle, Sparkles, Bot, User } from 'lucide-react';

export const NimGame: React.FC = () => {
  const { 
    currentStage, 
    recordAction, 
    addExplanation, 
    advanceStage, 
    markConceptMastered,
    updateSharedGameState,
    setInteractionMode
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
        `You reduced Pile #${selectedPile + 1} and forced the Bitwise XOR Sum to 0!`,
        `By Bouton's Theorem, this is a P-position (Kernel). Every move your opponent makes will leave Nim-Sum > 0, granting you an unlosable countermove.`,
        'strategic_subgoal',
        'Rosen Section 4.2: Bit Operations and Bouton’s Theorem'
      );
    } else {
      recordAction(false, 'unbalanced_nim_sum', `You left Nim-Sum = ${newNimSum} > 0. This is an N-position, giving the opponent a chance to balance it.`);
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
      addExplanation(
        'Victory in Nim!',
        'You took the final stick and won the match!',
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

      const nextNimSum = nextPiles.reduce((acc, curr) => acc ^ curr, 0);

      if (nextNimSum === 0) {
        addExplanation(
          'AI Countermove Forced Nim-Sum = 0',
          `AI removed ${removeCount} sticks from Pile #${movePile + 1}.`,
          `AI balanced the XOR sum to 0 using n_i' = n_i XOR S.`,
          'invalid_move'
        );
      }

      // Check if AI won
      if (nextPiles.every(p => p === 0)) {
        setWinner('ai');
      } else {
        setCurrentTurn('player');
      }
    }, 800);

    return () => clearTimeout(aiTimer);
  }, [currentTurn, piles, nimSum, winner, addExplanation]);

  return (
    <div className="theme-panel rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-500/20 pb-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Nim & Combinatorial Game Theory</span>
            <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
              nimSum === 0 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}>
              Nim-Sum &oplus; = {nimSum} ({nimSum === 0 ? 'P-Kernel' : 'N-Kernel'}) &bull; Y2K Arcade
            </span>
          </h2>
          <p className="text-xs text-purple-200/70">
            {isIndependent 
              ? 'Independent Challenge: Compute the XOR sum of [3, 5, 7] and make the invincible countermove' 
              : 'Remove any number of sticks from a single pile. Whoever takes the last stick wins!'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-500/30 text-xs font-medium">
            {currentTurn === 'player' ? (
              <>
                <User className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-purple-300 font-mono">Your Turn</span>
              </>
            ) : (
              <>
                <Bot className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span className="text-amber-300 font-mono">AI Calculating...</span>
              </>
            )}
          </div>

          <button
            onClick={resetGame}
            className="p-2 rounded-xl bg-purple-950 border border-purple-500/30 hover:bg-purple-800 text-purple-300 hover:text-white transition"
            title="Reset Piles"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Matchstick Heaps Arena */}
      <div className="p-6 bg-purple-950/30 rounded-xl border border-purple-500/20 flex justify-around items-end min-h-[220px]">
        {piles.map((count, idx) => {
          const isSelected = selectedPile === idx;
          return (
            <div
              key={idx}
              onClick={() => {
                if (count > 0 && currentTurn === 'player') {
                  setSelectedPile(idx);
                  setSticksToRemove(1);
                }
              }}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl cursor-pointer transition-all ${
                isSelected 
                  ? 'bg-purple-900/60 ring-2 ring-purple-400 shadow-lg shadow-purple-500/30' 
                  : count > 0 
                  ? 'hover:bg-purple-950/50' 
                  : 'opacity-30 cursor-not-allowed'
              }`}
            >
              {/* Vertical sticks */}
              <div className="flex flex-col-reverse gap-1.5 items-center min-h-[140px] justify-end">
                {Array.from({ length: count }, (_, sIdx) => (
                  <div
                    key={sIdx}
                    className="w-4 h-5 arcade-stick shadow-md"
                  />
                ))}
              </div>

              <div className="text-center font-mono">
                <span className="text-xs text-purple-300/70 block">Heap #{idx + 1}</span>
                <span className="text-sm font-bold text-white">{count} sticks</span>
                <span className="text-[10px] text-fuchsia-400 block font-mono">({count.toString(2).padStart(3, '0')}<sub>2</sub>)</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Player Action Controls */}
      {selectedPile !== null && currentTurn === 'player' && (
        <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-300 font-medium">
              Remove sticks from Heap #{selectedPile + 1} (Max: {piles[selectedPile]}):
            </span>
            <div className="flex items-center gap-1 font-mono">
              {Array.from({ length: piles[selectedPile] }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  onClick={() => setSticksToRemove(num)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    sticksToRemove === num 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handlePlayerMove}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition"
          >
            Confirm Move (Remove {sticksToRemove})
          </button>
        </div>
      )}

      {/* Winner Banner */}
      {winner && (
        <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 animate-in fade-in ${
          winner === 'player' 
            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200' 
            : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
        }`}>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5" />
            <div>
              <h4 className="text-sm font-bold">{winner === 'player' ? 'You Won!' : 'AI Won This Round!'}</h4>
              <p className="text-xs opacity-90">
                {winner === 'player' 
                  ? 'Your strategic maintenance of P-positions left the AI with zero counter-options.' 
                  : 'The AI maintained Nim-Sum = 0 to secure the win.'}
              </p>
            </div>
          </div>

          <button
            onClick={resetGame}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-medium hover:bg-slate-700 transition"
          >
            Play Again
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="text-xs text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
        <span>Bouton's Theorem: State is balanced & winning for previous player iff Nim-Sum = 0.</span>
        <span className="text-emerald-400 font-mono text-[11px]">S = n_1 &oplus; n_2 &oplus; n_3</span>
      </div>
    </div>
  );
};

