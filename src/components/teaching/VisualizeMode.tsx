import React from 'react';
import { useLearningEngine } from '../../engine/LearningEngineContext';
import { HanoiRecurrenceTree } from '../visualizers/HanoiRecurrenceTree';
import { MinesweeperBooleanMatrix } from '../visualizers/MinesweeperBooleanMatrix';
import { MazeGraphVisualizer } from '../visualizers/MazeGraphVisualizer';
import { CaesarModularRing } from '../visualizers/CaesarModularRing';
import { NimXorVisualizer } from '../visualizers/NimXorVisualizer';
import { KnightsDegreeVisualizer } from '../visualizers/KnightsDegreeVisualizer';
import { BookMarked } from 'lucide-react';

export const VisualizeMode: React.FC = () => {
  const { currentGameId, setRosenModalOpen, sharedGameState } = useLearningEngine();

  return (
    <div className="flex flex-col gap-3">
      {/* Contextual Visualizer dynamically selected based on game */}
      {currentGameId === 'tower-of-hanoi' && <HanoiRecurrenceTree />}
      {currentGameId === 'minesweeper-logic' && (
        <MinesweeperBooleanMatrix 
          equations={sharedGameState?.equations} 
          totalMines={sharedGameState?.totalMines} 
        />
      )}
      {currentGameId === 'maze-graph' && (
        <MazeGraphVisualizer 
          queue={sharedGameState?.queue} 
          stack={sharedGameState?.stack} 
        />
      )}
      {currentGameId === 'caesar-cipher' && (
        <CaesarModularRing activeShift={sharedGameState?.shift || 3} />
      )}
      {currentGameId === 'nim-combinatorics' && (
        <NimXorVisualizer piles={sharedGameState?.piles || [3, 4, 5]} />
      )}
      {currentGameId === 'knights-tour' && (
        <KnightsDegreeVisualizer 
          tourLength={sharedGameState?.tourLength} 
          maxSquares={sharedGameState?.maxSquares}
          candidateDegrees={sharedGameState?.candidateDegrees}
        />
      )}

      {/* Deep Dive Textbook Link */}
      <div className="p-3 bg-black/40 rounded-xl border border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <BookMarked className="w-4 h-4 text-amber-400" />
          <span>Curious about formal mathematical proofs?</span>
        </div>
        <button
          onClick={() => setRosenModalOpen(true)}
          className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition cursor-pointer"
        >
          Open Rosen Textbook Deep-Dive
        </button>
      </div>
    </div>
  );
};
