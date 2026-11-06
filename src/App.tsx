import React from 'react';
import { LearningEngineProvider, useLearningEngine } from './engine/LearningEngineContext';
import { GAME_REGISTRY } from './games/registry';
import { Navbar } from './components/layout/Navbar';
import { StageStepper } from './components/layout/StageStepper';
import { TeachingPanel } from './components/teaching/TeachingPanel';
import { RosenReferenceModal } from './components/teaching/RosenReferenceModal';
import { KnowledgeGraphModal } from './components/teaching/KnowledgeGraphModal';
import { MasteryCelebrationModal } from './components/teaching/MasteryCelebrationModal';

import { HanoiGame } from './games/tower-of-hanoi/HanoiGame';
import { MinesweeperGame } from './games/minesweeper-logic/MinesweeperGame';
import { MazeGraphGame } from './games/maze-graph/MazeGraphGame';
import { CaesarGame } from './games/caesar-cipher/CaesarGame';
import { NimGame } from './games/nim-combinatorics/NimGame';

const GameViewport: React.FC = () => {
  const { currentGameId } = useLearningEngine();

  return (
    <div className="w-full">
      {currentGameId === 'tower-of-hanoi' && <HanoiGame />}
      {currentGameId === 'minesweeper-logic' && <MinesweeperGame />}
      {currentGameId === 'maze-graph' && <MazeGraphGame />}
      {currentGameId === 'caesar-cipher' && <CaesarGame />}
      {currentGameId === 'nim-combinatorics' && <NimGame />}
    </div>
  );
};

export const AppContent: React.FC = () => {
  const { currentGameId } = useLearningEngine();

  return (
    <div data-game={currentGameId} className="min-h-screen app-theme-wrapper flex flex-col transition-all duration-700">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 py-6 flex flex-col gap-5 flex-1">
        {/* Universal 5-Stage Stepper */}
        <StageStepper />

        {/* 2-Column Responsive Layout: Game Arena (Left) & Contextual Teaching Panel (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Gameplay Canvas Area (7 cols on desktop) */}
          <section className="lg:col-span-7 flex flex-col gap-4">
            <GameViewport />
          </section>

          {/* Contextual Teaching Engine Panel (5 cols on desktop) — sticky on desktop */}
          <aside className="lg:col-span-5 teaching-sticky lg:sticky lg:top-20" style={{ height: 'clamp(520px, 68vh, 680px)' }}>
            <TeachingPanel />
          </aside>
        </div>
      </main>

      {/* Curriculum Modals & Drawers */}
      <RosenReferenceModal />
      <KnowledgeGraphModal />
      <MasteryCelebrationModal />
    </div>
  );
};

export function App() {
  return (
    <LearningEngineProvider gameRegistry={GAME_REGISTRY} initialGameId="tower-of-hanoi">
      <AppContent />
    </LearningEngineProvider>
  );
}

export default App;
