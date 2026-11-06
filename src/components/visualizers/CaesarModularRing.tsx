import React, { useState } from 'react';
import { CircleDot, RotateCw, ArrowRightLeft, Key, Sparkles } from 'lucide-react';

export const CaesarModularRing: React.FC<{
  activeShift?: number;
}> = ({ activeShift = 3 }) => {
  const [testChar, setTestChar] = useState<string>('Y');
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const charCode = testChar.toUpperCase().charCodeAt(0);
  const isValidChar = charCode >= 65 && charCode <= 90;
  const x = isValidChar ? charCode - 65 : 0;
  const encryptedIndex = (x + activeShift) % 26;
  const encryptedChar = alphabet[encryptedIndex];
  const inverseShift = (26 - activeShift) % 26;
  const decryptedIndex = (encryptedIndex + inverseShift) % 26;
  const decryptedChar = alphabet[decryptedIndex];

  return (
    <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <CircleDot className="w-5 h-5 text-amber-400" />
          <h4 className="text-sm font-semibold text-slate-100">Cyclic Ring &Zeta;<sub>26</sub> (Clock Arithmetic)</h4>
        </div>
        <span className="text-xs font-mono text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
          Shift Key: k = {activeShift}
        </span>
      </div>

      {/* Interactive letter conversion tester */}
      <div className="grid grid-cols-3 gap-2 bg-slate-950/70 p-3 rounded-lg border border-slate-800 text-center font-mono">
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Plaintext x</span>
          <input
            type="text"
            maxLength={1}
            value={testChar}
            onChange={(e) => setTestChar(e.target.value.slice(0, 1) || 'A')}
            className="w-10 h-10 text-center font-bold text-lg bg-slate-900 border border-indigo-500 rounded text-indigo-300 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <span className="text-[10px] text-slate-500 mt-0.5">Index: {x}</span>
        </div>

        <div className="flex flex-col items-center justify-center">
          <span className="text-[10px] text-amber-400 font-semibold mb-1">
            + {activeShift} mod 26
          </span>
          <div className="flex items-center gap-1 text-slate-500">
            <RotateCw className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <span className="text-[10px] text-slate-400 mt-1">({x} + {activeShift}) % 26 = {encryptedIndex}</span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Ciphertext y</span>
          <div className="w-10 h-10 flex items-center justify-center font-bold text-lg bg-emerald-950/60 border border-emerald-500 rounded text-emerald-300 mt-1">
            {encryptedChar}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5">Index: {encryptedIndex}</span>
        </div>
      </div>

      {/* Alphabet Clock Strip with Highlight */}
      <div className="space-y-1">
        <div className="text-[11px] text-slate-400 flex items-center justify-between">
          <span>Alphabet Congruence Ring:</span>
          <span className="text-amber-400 font-mono text-[10px]">Wrap-Around (25+1 &equiv; 0)</span>
        </div>
        <div className="flex overflow-x-auto gap-1 py-1 px-1 bg-slate-950 rounded-lg border border-slate-800 scrollbar-none">
          {alphabet.map((letter, idx) => {
            const isPlain = idx === x;
            const isCipher = idx === encryptedIndex;
            return (
              <div
                key={letter}
                className={`shrink-0 w-6 h-8 rounded flex flex-col items-center justify-center text-[11px] font-mono transition-all ${
                  isPlain
                    ? 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-400'
                    : isCipher
                    ? 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-400'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                <span>{letter}</span>
                <span className="text-[8px] opacity-70">{idx}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modular Inverses and Formulas */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
        <div>
          <span className="text-[10px] text-slate-400 block">Encryption Function</span>
          <span className="text-indigo-300 font-semibold">E(x) = (x + {activeShift}) mod 26</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">Decryption via Additive Inverse</span>
          <span className="text-emerald-300 font-semibold">D(y) = (y + {inverseShift}) mod 26</span>
        </div>
      </div>
    </div>
  );
};

