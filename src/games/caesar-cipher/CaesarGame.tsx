import React, { useState, useEffect, useCallback } from 'react';
import { useLearningEngine } from '../../engine/LearningEngineContext';
import { Key, RotateCcw, CheckCircle2, ShieldCheck, Sparkles, Sliders, ArrowRight } from 'lucide-react';

export const CaesarGame: React.FC = () => {
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

  // Secret target plaintext
  const plaintext = isIndependent 
    ? 'EULER DISCOVERED GRAPH THEORY IN KOENIGSBERG' 
    : 'DISCRETE MATHEMATICS IS BEAUTIFUL';

  // For stage 5, the secret shift is 7! The user must guess or compute k = 7.
  const mysteryShift = 7;
  const [shiftKey, setShiftKey] = useState<number>(isIndependent ? 0 : 3);
  const [userGuessKey, setUserGuessKey] = useState<string>('');
  const [isCracked, setIsCracked] = useState<boolean>(false);

  // Modular shift helper
  const encryptChar = (char: string, k: number) => {
    const code = char.toUpperCase().charCodeAt(0);
    if (code >= 65 && code <= 90) {
      const x = code - 65;
      const encryptedX = (x + k) % 26;
      return String.fromCharCode(65 + encryptedX);
    }
    return char;
  };

  const decryptChar = (char: string, k: number) => {
    const code = char.toUpperCase().charCodeAt(0);
    if (code >= 65 && code <= 90) {
      const y = code - 65;
      const decryptedX = (y - k + 26) % 26;
      return String.fromCharCode(65 + decryptedX);
    }
    return char;
  };

  // Precomputed ciphertext for independent challenge
  const challengeCiphertext = plaintext
    .split('')
    .map(c => encryptChar(c, mysteryShift))
    .join('');

  // Current display text
  const currentRenderedText = isIndependent
    ? challengeCiphertext.split('').map(c => decryptChar(c, shiftKey)).join('')
    : plaintext.split('').map(c => encryptChar(c, shiftKey)).join('');

  // Update shared state for modular ring visualizer
  useEffect(() => {
    updateSharedGameState({
      shift: shiftKey,
      plaintext,
      ciphertext: currentRenderedText
    });
  }, [shiftKey, plaintext, currentRenderedText, updateSharedGameState]);

  const handleShiftChange = (newK: number) => {
    setShiftKey(newK);
    recordAction(true);

    if (newK > 0) {
      addExplanation(
        `Modular Shift Invariant: k = ${newK}`,
        `Every letter x is transformed via E(x) = (x + ${newK}) mod 26.`,
        `Notice the cyclic ring &Zeta;_{26}: index 25 (Z) wraps back to index ${(25 + newK) % 26}.`,
        'valid_move',
        'Rosen 8th Edition Section 4.6 Cryptography'
      );
    }

    if (isIndependent && newK === mysteryShift) {
      setIsCracked(true);
      markConceptMastered('modular-arithmetic');
      addExplanation(
        'Mystery Ciphertext Decrypted!',
        `Shift key k = ${newK} successfully restored the original transmission!`,
        `D_k(y) = (y - ${newK}) mod 26 = (y + ${26 - newK}) mod 26.`,
        'strategic_subgoal'
      );
    }
  };

  return (
    <div className="theme-panel rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-fuchsia-500/20 pb-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="chrome-text">Caesar Cipher & Modulo Ring</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded holo-badge text-fuchsia-300">
              ✦ Ring &Zeta;<sub>26</sub> &bull; Y2K Chrome ✦
            </span>
          </h2>
          <p className="text-xs text-fuchsia-200/70">
            {isIndependent 
              ? 'Independent Challenge: Crack the intercepted transmission by adjusting decryption key k' 
              : 'Slide key k to encrypt plaintext into modular equivalence classes'}
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs bg-purple-950/70 px-3 py-1.5 rounded-xl border border-fuchsia-500/40 shadow-sm shadow-fuchsia-500/20">
          <Key className="w-3.5 h-3.5 text-fuchsia-400" />
          <span className="text-slate-300">Key k:</span>
          <span className="font-bold text-fuchsia-300">{shiftKey}</span>
          <span className="text-slate-400">(&equiv; {shiftKey} mod 26)</span>
        </div>
      </div>

      {/* Main Cipher Text Display Box */}
      <div className="p-4 bg-purple-950/40 rounded-xl border border-fuchsia-500/30 flex flex-col gap-2">
        <span className="text-xs font-mono font-medium text-fuchsia-300 flex items-center gap-1.5">
          <span>◈</span> {isIndependent ? 'Decrypted Output with Active Key k:' : 'Encrypted Ciphertext Stream:'}
        </span>
        <div className="font-mono text-base font-bold text-white tracking-wider break-words py-2 px-3 bg-black/60 rounded-lg border border-fuchsia-500/30 shadow-inner">
          {currentRenderedText}
        </div>
        {isIndependent && (
          <div className="text-[11px] text-fuchsia-300/60 font-mono">
            Intercepted Raw Ciphertext: <span className="text-fuchsia-200">{challengeCiphertext}</span>
          </div>
        )}
      </div>

      {/* Interactive Key Slider */}
      <div className="p-4 bg-purple-950/30 rounded-xl border border-fuchsia-500/20 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-fuchsia-200 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            Adjust Shift Key k (0 &le; k &lt; 26):
          </span>
          <span className="font-mono text-amber-300 font-bold text-sm">k = {shiftKey}</span>
        </div>

        <input
          type="range"
          min="0"
          max="25"
          value={shiftKey}
          onChange={(e) => handleShiftChange(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
        />

        <div className="flex justify-between text-[10px] font-mono text-slate-500 px-1">
          <span>0 (Identity)</span>
          <span>13 (ROT13 Involution)</span>
          <span>25 (k &equiv; -1)</span>
        </div>
      </div>

      {/* Cracked Celebration Banner */}
      {isCracked && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Transmission Decrypted!</h4>
              <p className="text-xs text-emerald-300">
                You broke the cipher using key k = {mysteryShift} via modular congruence deduction!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom info */}
      <div className="text-xs text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
        <span>Letters map to numbers: A=0, B=1, ..., Z=25.</span>
        <span className="text-amber-400 font-mono text-[11px]">E(x) = (x + k) mod 26</span>
      </div>
    </div>
  );
};

