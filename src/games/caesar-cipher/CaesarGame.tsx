import React, { useState, useEffect } from 'react';
import { useLearningEngine } from '../../engine/LearningEngineContext';
import { Key, RotateCcw, CheckCircle2, Sliders, ArrowRight, Sparkles, Shuffle, Type } from 'lucide-react';
import { sound } from '../../utils/sound';
import confetti from 'canvas-confetti';

export const CaesarGame: React.FC = () => {
  const { 
    currentStage, 
    recordAction, 
    addExplanation, 
    advanceStage, 
    markConceptMastered,
    updateSharedGameState,
  } = useLearningEngine();

  const isIndependent = currentStage === 'INDEPENDENT_APPLICATION';

  // Secret target plaintext
  const defaultText = isIndependent 
    ? 'EULER DISCOVERED GRAPH THEORY IN KOENIGSBERG' 
    : 'DISCRETE MATHEMATICS IS BEAUTIFUL';

  const [customText, setCustomText] = useState<string>(defaultText);
  const mysteryShift = 7;
  const [shiftKey, setShiftKey] = useState<number>(isIndependent ? 0 : 3);
  const [isCracked, setIsCracked] = useState<boolean>(false);

  // Sync default text if stage changes
  useEffect(() => {
    setCustomText(defaultText);
    setShiftKey(isIndependent ? 0 : 3);
    setIsCracked(false);
  }, [defaultText, isIndependent]);

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
  const challengeCiphertext = defaultText
    .split('')
    .map(c => encryptChar(c, mysteryShift))
    .join('');

  // Current display text
  const currentRenderedText = isIndependent
    ? challengeCiphertext.split('').map(c => decryptChar(c, shiftKey)).join('')
    : customText.split('').map(c => encryptChar(c, shiftKey)).join('');

  // Update shared state for modular ring visualizer
  useEffect(() => {
    updateSharedGameState({
      shift: shiftKey,
      plaintext: isIndependent ? defaultText : customText,
      ciphertext: currentRenderedText
    });
  }, [shiftKey, defaultText, customText, currentRenderedText, isIndependent, updateSharedGameState]);

  const handleShiftChange = (newK: number) => {
    sound.playClick(350 + newK * 18, 0.04);
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
      sound.playSuccess();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      markConceptMastered('modular-arithmetic');
      addExplanation(
        'Mystery Ciphertext Decrypted!',
        `Shift key k = ${newK} successfully restored the original transmission!`,
        `D_k(y) = (y - ${newK}) mod 26 = (y + ${26 - newK}) mod 26.`,
        'strategic_subgoal'
      );
    }
  };

  const sampleAlphabet = ['A', 'E', 'M', 'R', 'Z'];

  return (
    <div className="theme-panel rounded-2xl p-5 flex flex-col gap-4 shadow-2xl relative overflow-hidden">
      {/* 4-pointed sparkle stars watermarks */}
      <span className="absolute top-3 right-8 text-fuchsia-400 text-lg pointer-events-none select-none opacity-40 animate-pulse">✦</span>
      <span className="absolute bottom-6 left-6 text-cyan-300 text-sm pointer-events-none select-none opacity-30">✧</span>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-fuchsia-500/30 pb-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="chrome-text font-black tracking-wide">Caesar Cipher & Modulo Ring</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full holo-badge text-fuchsia-200 border border-fuchsia-400/50">
              ✦ &Zeta;<sub>26</sub> HOLOGRAPHIC ✦
            </span>
          </h2>
          <p className="text-xs text-fuchsia-200/80 font-mono mt-0.5">
            {isIndependent 
              ? 'Independent Challenge: Crack the intercepted transmission by finding secret key k' 
              : 'Rotate the modular key k &equiv; shift (mod 26) to encrypt and decrypt streams'}
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-xl border border-fuchsia-500/40 text-fuchsia-300 shadow-md">
            <Key className="w-3.5 h-3.5 text-fuchsia-400" />
            <span className="text-slate-300">k:</span>
            <span className="font-bold text-amber-300 text-sm">{shiftKey}</span>
            <span className="text-fuchsia-400/60">(&equiv; {shiftKey} mod 26)</span>
          </div>

          <button
            onClick={() => handleShiftChange(0)}
            className="p-2 rounded-xl bg-black/60 border border-fuchsia-500/30 text-fuchsia-300 hover:text-white transition cursor-pointer"
            title="Reset to k=0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Cipher Text Display Box */}
      <div className="p-4 bg-black/70 rounded-2xl border border-fuchsia-500/40 flex flex-col gap-2.5 shadow-inner">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-fuchsia-300 flex items-center gap-1.5">
            <span className="text-amber-300">◈</span>
            <span>{isIndependent ? 'DECRYPTED STREAM (ACTIVE KEY k):' : 'CIPHERTEXT OUTPUT E_k(x):'}</span>
          </span>
          <span className="text-[10px] font-mono text-cyan-300">ALPHABET LENGTH: 26</span>
        </div>

        <div className="font-mono text-base font-bold text-white tracking-widest break-words py-3 px-4 bg-black/90 rounded-xl border border-fuchsia-500/40 shadow-inner">
          {currentRenderedText}
        </div>

        {isIndependent && (
          <div className="text-[11px] text-fuchsia-300/80 font-mono bg-fuchsia-950/40 px-3 py-2 rounded-lg border border-fuchsia-500/20">
            <span className="text-slate-400">RAW INTERCEPTED:</span> <span className="text-fuchsia-200 font-bold">{challengeCiphertext}</span>
          </div>
        )}
      </div>

      {/* Interactive Key Slider & Quick Shift Controls */}
      <div className="p-4 bg-purple-950/30 rounded-2xl border border-fuchsia-500/30 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-fuchsia-200 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-300" />
            <span>Shift Key k Slider (0 &le; k &lt; 26):</span>
          </span>
          <div className="flex items-center gap-2 font-mono">
            <span className="text-slate-400 text-[11px]">ROT:</span>
            <span className="font-bold text-amber-300 text-sm">+{shiftKey}</span>
          </div>
        </div>

        <input
          type="range"
          min="0"
          max="25"
          value={shiftKey}
          onChange={(e) => handleShiftChange(parseInt(e.target.value))}
          className="w-full h-3 bg-black/60 rounded-lg appearance-none cursor-pointer accent-fuchsia-400"
        />

        {/* Quick Shift Preset Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-mono text-slate-400 mr-1">PRESETS:</span>
          {[
            { label: 'k=0 (Identity)', val: 0 },
            { label: 'k=3 (Classic Caesar)', val: 3 },
            { label: 'k=13 (ROT13)', val: 13 },
            { label: 'k=25 (k ≡ -1)', val: 25 },
          ].map(p => (
            <button
              key={p.val}
              onClick={() => handleShiftChange(p.val)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold transition border cursor-pointer ${
                shiftKey === p.val
                  ? 'bg-fuchsia-500 text-white border-fuchsia-300 shadow-md shadow-fuchsia-500/30'
                  : 'bg-black/50 text-fuchsia-300 border-fuchsia-500/30 hover:bg-fuchsia-500/20'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Sample Character Equivalence Mapping */}
      <div className="p-3 bg-black/60 rounded-xl border border-fuchsia-500/20 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <span className="text-slate-400 text-[11px]">SAMPLE MAP:</span>
        <div className="flex items-center gap-3">
          {sampleAlphabet.map(char => (
            <div key={char} className="flex items-center gap-1">
              <span className="text-slate-300 font-bold">{char}</span>
              <span className="text-fuchsia-400">&rarr;</span>
              <span className="text-amber-300 font-bold">{encryptChar(char, shiftKey)}</span>
            </div>
          ))}
        </div>
        <span className="text-cyan-300 text-[11px] font-semibold">x + k (mod 26)</span>
      </div>

      {/* Cracked Celebration Banner */}
      {isCracked && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-400/60 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-400/40">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Cipher Cracked! Secret Transmission Restored</span>
              </h4>
              <p className="text-xs text-emerald-200">
                You deduced key k = {mysteryShift} via modular congruence: D_k(y) = (y - 7) mod 26!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playSuccess();
                advanceStage();
              }}
              className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>Advance Stage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom info */}
      <div className="text-xs text-fuchsia-200/70 bg-black/40 p-3 rounded-xl border border-fuchsia-500/20 flex flex-wrap items-center justify-between gap-2 font-mono">
        <span>Letters map bijectively: A &rarr; 0, B &rarr; 1, ..., Z &rarr; 25.</span>
        <span className="text-amber-300 text-[11px]">E(x) = (x + k) mod 26</span>
      </div>
    </div>
  );
};
