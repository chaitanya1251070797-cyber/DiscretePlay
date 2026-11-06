import React from 'react';
import { Layers, ShieldCheck, AlertTriangle, Cpu } from 'lucide-react';

export const NimXorVisualizer: React.FC<{
  piles?: number[];
}> = ({ piles = [3, 4, 5] }) => {
  // Compute Nim-Sum (XOR of all piles)
  const nimSum = piles.reduce((acc, curr) => acc ^ curr, 0);
  const isPPosition = nimSum === 0;

  // Maximum bit length
  const maxVal = Math.max(...piles, 1);
  const bitLength = Math.max(3, Math.floor(Math.log2(maxVal)) + 1);
  const bitWeights = Array.from({ length: bitLength }, (_, i) => Math.pow(2, bitLength - 1 - i));

  // Determine optimal winning move if N-position
  let winningMove: { pileIndex: number; from: number; to: number } | null = null;
  if (!isPPosition) {
    for (let i = 0; i < piles.length; i++) {
      const target = piles[i] ^ nimSum;
      if (target < piles[i]) {
        winningMove = { pileIndex: i, from: piles[i], to: target };
        break;
      }
    }
  }

  return (
    <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-emerald-400" />
          <h4 className="text-sm font-semibold text-slate-100">Bitwise XOR & Nim-Sum (Bouton’s Theorem)</h4>
        </div>
        <div className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold flex items-center gap-1.5 border ${
          isPPosition 
            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50' 
            : 'bg-amber-950/80 text-amber-300 border-amber-500/50'
        }`}>
          {isPPosition ? <ShieldCheck className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
          <span>{isPPosition ? 'P-Position (Balanced: S = 0)' : `N-Position (Unbalanced: S = ${nimSum})`}</span>
        </div>
      </div>

      {/* Bit Decomposition Table */}
      <div className="overflow-x-auto bg-slate-950/70 p-3 rounded-lg border border-slate-800 font-mono text-xs">
        <table className="w-full text-center">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800 text-[11px]">
              <th className="text-left pb-1">Pile</th>
              <th className="pb-1">Size</th>
              {bitWeights.map(w => (
                <th key={w} className="pb-1 px-2 text-indigo-400 font-semibold">2^{Math.log2(w)} ({w})</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {piles.map((p, idx) => {
              const binaryStr = p.toString(2).padStart(bitLength, '0');
              return (
                <tr key={idx} className="hover:bg-slate-900/40">
                  <td className="text-left py-1 text-slate-400">Heap #{idx + 1}</td>
                  <td className="py-1 font-bold text-slate-200">{p}</td>
                  {binaryStr.split('').map((bit, bIdx) => (
                    <td key={bIdx} className="py-1 px-2">
                      <span className={`inline-block w-5 py-0.5 rounded text-[11px] font-bold ${
                        bit === '1' 
                          ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40' 
                          : 'text-slate-600'
                      }`}>
                        {bit}
                      </span>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-700 font-bold">
              <td className="text-left pt-2 text-amber-400">Nim-Sum (&oplus;)</td>
              <td className="pt-2 text-amber-400">{nimSum}</td>
              {nimSum.toString(2).padStart(bitLength, '0').split('').map((bit, bIdx) => (
                <td key={bIdx} className="pt-2 px-2">
                  <span className={`inline-block w-5 py-0.5 rounded text-[11px] font-bold ${
                    bit === '1' 
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' 
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}>
                    {bit}
                  </span>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Strategic Advice Card */}
      {winningMove ? (
        <div className="bg-amber-950/30 border border-amber-500/30 p-2.5 rounded-lg text-xs font-mono flex items-center justify-between">
          <div>
            <span className="text-amber-300 font-bold block">Winning Move Available:</span>
            <span className="text-slate-300 text-[11px]">
              Reduce Heap #{winningMove.pileIndex + 1} from {winningMove.from} &rarr; {winningMove.to} (Remove {winningMove.from - winningMove.to} sticks).
            </span>
          </div>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-1 rounded border border-amber-500/40 font-semibold">
            Forces S &rarr; 0
          </span>
        </div>
      ) : (
        <div className="bg-emerald-950/30 border border-emerald-500/30 p-2.5 rounded-lg text-xs font-mono flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-emerald-300 text-[11px]">
            Symmetric P-Position: All bit columns have even parity (sum &equiv; 0 mod 2). Any move opponent makes gives you a winning countermove!
          </span>
        </div>
      )}
    </div>
  );
};

