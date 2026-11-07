import React, { useState } from 'react';
import { useLearningEngine } from '../../engine/LearningEngineContext';
import { GAME_LIST } from '../../games/registry';
import { GameId } from '../../types/learning';
import { sound } from '../../utils/sound';
import {
  GitFork,
  BookMarked,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react';

// ─── Per-game metadata ────────────────────────────────────────────────────────

type GameMeta = {
  icon: string;
  shortName: string;
  aestheticLabel: string;
};

const GAME_META: Record<GameId | string, GameMeta> = {
  'tower-of-hanoi': {
    icon: '△',
    shortName: 'Hanoi',
    aestheticLabel: 'AERO GLASS',
  },
  'minesweeper-logic': {
    icon: '⚡',
    shortName: 'Mines',
    aestheticLabel: 'CYBER GRID',
  },
  'maze-graph': {
    icon: '⬡',
    shortName: 'Maze',
    aestheticLabel: 'NOIR MATRIX',
  },
  'caesar-cipher': {
    icon: '◈',
    shortName: 'Cipher',
    aestheticLabel: 'Y2K CHROME',
  },
  'nim-combinatorics': {
    icon: '⣿',
    shortName: 'Nim',
    aestheticLabel: 'ARCADE ARENA',
  },
  'knights-tour': {
    icon: '♘',
    shortName: 'Knight',
    aestheticLabel: 'WARNSDORFF',
  },
};

type BrandMeta = {
  aestheticLabel: string;
};

const BRAND_META: Record<GameId | string, BrandMeta> = {
  'tower-of-hanoi': { aestheticLabel: 'FRUTIGER AERO // GLASS TEMPLE' },
  'minesweeper-logic': { aestheticLabel: 'CYBERPUNK // 推論端末' },
  'maze-graph': { aestheticLabel: 'DIGITAL NOIR // CAM_04' },
  'caesar-cipher': { aestheticLabel: 'Y2K CHROME // HOLOGRAPHIC DISC' },
  'nim-combinatorics': { aestheticLabel: 'ARCADE ARENA // 7-SEGMENT' },
  'knights-tour': { aestheticLabel: 'GLITCH MATRIX // HAMILTONIAN' },
};

export const Navbar: React.FC = () => {
  const {
    currentGameId,
    switchGame,
    allMasteredConcepts,
    setKnowledgeGraphOpen,
    setRosenModalOpen,
  } = useLearningEngine();

  const [isMuted, setIsMuted] = useState(sound.isMuted());

  const handleToggleSound = () => {
    const nextState = sound.toggleMute();
    setIsMuted(nextState);
  };

  const handleSwitchGame = (gameId: any) => {
    sound.playClick(680);
    switchGame(gameId);
  };

  const handleOpenGraph = () => {
    sound.playClick(500);
    setKnowledgeGraphOpen(true);
  };

  const handleOpenRosen = () => {
    sound.playClick(520);
    setRosenModalOpen(true);
  };

  const brandLabel = BRAND_META[currentGameId]?.aestheticLabel ?? 'DISCRETE ENGINE';

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md">
      {/* ── Main nav bar ── */}
      <div className="nav-wrapper relative transition-all duration-500">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">

          {/* ── Brand (left) ── */}
          <div className="flex items-center gap-3 shrink-0">
            {/* π Logo orb with interactive shine */}
            <div 
              className="nav-logo-orb w-10 h-10 rounded-xl flex items-center justify-center shadow-lg select-none cursor-pointer transition-transform duration-300 hover:rotate-12 hover:scale-105 active:scale-95"
              onClick={() => sound.playBlip()}
              title="DiscretePlay Engine"
            >
              <span className="font-mono font-black text-xl tracking-tighter leading-none">
                π
              </span>
            </div>

            {/* Text stack */}
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="nav-brand-title font-extrabold text-base tracking-tight text-white select-none flex items-center gap-1.5">
                <span>DiscretePlay</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                  GAME ED.
                </span>
              </span>
              <span className="nav-brand-label font-mono text-[9px] uppercase tracking-widest opacity-70 select-none">
                {brandLabel}
              </span>
            </div>
          </div>

          {/* ── Game Tabs (center) — desktop ── */}
          <nav
            className="hidden md:flex items-center gap-1 p-1 rounded-2xl nav-tabs-container flex-1 max-w-xl mx-auto"
            aria-label="Game switcher"
          >
            {GAME_LIST.map((game) => {
              const isActive = currentGameId === game.id;
              const meta = GAME_META[game.id] || { icon: '★', shortName: game.title, aestheticLabel: 'GAME' };
              return (
                <button
                  key={game.id}
                  data-game-tab={game.id}
                  onClick={() => handleSwitchGame(game.id)}
                  className={`nav-tab flex-1 flex flex-col items-center justify-center gap-0.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold select-none shrink-0 transition-all duration-300 ease-in-out cursor-pointer ${
                    isActive ? 'nav-tab-active font-bold scale-[1.02]' : 'nav-tab-inactive opacity-80 hover:opacity-100'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                  title={game.title}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="nav-tab-icon text-sm leading-none">{meta.icon}</span>
                    <span className="nav-tab-name leading-none">{meta.shortName}</span>
                  </div>
                  <span className="nav-tab-sub font-mono text-[7.5px] uppercase tracking-wider opacity-75 leading-none">
                    {meta.aestheticLabel}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* ── Game Tabs (center) — mobile scrollable row ── */}
          <div
            className="md:hidden flex items-center gap-1 overflow-x-auto max-w-[calc(100vw-200px)] snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
          >
            {GAME_LIST.map((game) => {
              const isActive = currentGameId === game.id;
              const meta = GAME_META[game.id] || { icon: '★', shortName: game.title, aestheticLabel: 'GAME' };
              return (
                <button
                  key={game.id}
                  data-game-tab={game.id}
                  onClick={() => handleSwitchGame(game.id)}
                  className={`nav-tab flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold select-none shrink-0 snap-center transition-all duration-300 ease-in-out ${
                    isActive ? 'nav-tab-active font-bold' : 'nav-tab-inactive'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                  title={game.title}
                >
                  <span className="nav-tab-icon text-sm leading-none">{meta.icon}</span>
                  <span className="nav-tab-name leading-none">{meta.shortName}</span>
                </button>
              );
            })}
          </div>

          {/* ── Right actions ── */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Audio SFX Toggle */}
            <button
              onClick={handleToggleSound}
              className={`p-2 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-1 border ${
                isMuted
                  ? 'bg-slate-900/60 text-slate-500 border-slate-800'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-500/20'
              }`}
              title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse" />}
            </button>

            {/* Curriculum Graph */}
            <button
              onClick={handleOpenGraph}
              className="nav-btn-graph flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer"
              title="Open Discrete Mathematics Knowledge Graph"
            >
              <GitFork className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Graph</span>
            </button>

            {/* Rosen textbook */}
            <button
              onClick={handleOpenRosen}
              className="nav-btn-rosen flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer"
              title="Kenneth H. Rosen Textbook References"
            >
              <BookMarked className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Rosen</span>
            </button>

            {/* Mastery badge */}
            <div className="nav-mastery-badge flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono select-none">
              <Trophy className="w-3.5 h-3.5 nav-trophy-icon shrink-0 text-amber-400" />
              <span className="nav-mastery-label hidden sm:inline text-slate-300">Mastered:</span>
              <span className="nav-mastery-count font-bold text-amber-300">{allMasteredConcepts.length}</span>
            </div>
          </div>
        </div>

        {/* ── Animated glowing bottom border ── */}
        <div
          className="nav-glow-bar absolute bottom-0 left-0 right-0 h-[2px] pointer-events-none"
          aria-hidden="true"
        />
      </div>
    </header>
  );
};
