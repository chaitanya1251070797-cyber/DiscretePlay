import React from 'react';
import { useLearningEngine } from '../../engine/LearningEngineContext';
import { GAME_LIST } from '../../games/registry';
import { GameId } from '../../types/learning';
import {
  GitFork,
  BookMarked,
  Trophy,
} from 'lucide-react';

// ─── Per-game metadata ────────────────────────────────────────────────────────

type GameMeta = {
  icon: string;
  shortName: string;
  aestheticLabel: string;
};

const GAME_META: Record<GameId, GameMeta> = {
  'tower-of-hanoi': {
    icon: '△',
    shortName: 'Hanoi',
    aestheticLabel: 'RECURSIVE TOWER',
  },
  'minesweeper-logic': {
    icon: '⚡',
    shortName: 'Mines',
    aestheticLabel: 'LOGIC FIELD',
  },
  'maze-graph': {
    icon: '⬡',
    shortName: 'Maze',
    aestheticLabel: 'GRAPH LATTICE',
  },
  'caesar-cipher': {
    icon: '◈',
    shortName: 'Cipher',
    aestheticLabel: 'CRYPT LAYER',
  },
  'nim-combinatorics': {
    icon: '⣿',
    shortName: 'Nim',
    aestheticLabel: 'GAME ARENA',
  },
};

type BrandMeta = {
  aestheticLabel: string;
};

const BRAND_META: Record<GameId, BrandMeta> = {
  'tower-of-hanoi': { aestheticLabel: 'GLASS TEMPLE' },
  'minesweeper-logic': { aestheticLabel: 'NEON GRID' },
  'maze-graph': { aestheticLabel: 'DIGITAL NOIR' },
  'caesar-cipher': { aestheticLabel: 'HOLOGRAPHIC TERMINAL' },
  'nim-combinatorics': { aestheticLabel: 'BATTLE ARENA' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export const Navbar: React.FC = () => {
  const {
    currentGameId,
    switchGame,
    allMasteredConcepts,
    setKnowledgeGraphOpen,
    setRosenModalOpen,
  } = useLearningEngine();

  const brandLabel = BRAND_META[currentGameId]?.aestheticLabel ?? 'DISCRETE ENGINE';

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-md"
      style={{ WebkitBackdropFilter: 'blur(12px)' }}
    >
      {/* ── Main nav bar ── */}
      <div className="nav-wrapper relative">
        <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between gap-3">

          {/* ── Brand (left) ── */}
          <div className="flex items-center gap-3 shrink-0">
            {/* π Logo orb */}
            <div className="nav-logo-orb w-10 h-10 rounded-xl flex items-center justify-center shadow-lg select-none">
              <span className="font-mono font-black text-xl text-white tracking-tighter leading-none">
                π
              </span>
            </div>

            {/* Text stack */}
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="nav-brand-title font-extrabold text-lg tracking-tight text-white select-none">
                DiscretePlay
              </span>
              <span className="nav-brand-label font-mono text-[9px] uppercase tracking-widest opacity-60 select-none">
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
              const meta = GAME_META[game.id];
              return (
                <button
                  key={game.id}
                  data-game-tab={game.id}
                  onClick={() => switchGame(game.id)}
                  className={`nav-tab flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl text-xs font-semibold select-none shrink-0 transition-all duration-300 ease-in-out ${
                    isActive ? 'nav-tab-active' : 'nav-tab-inactive'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                  title={game.title}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="nav-tab-icon text-sm leading-none">{meta.icon}</span>
                    <span className="nav-tab-name leading-none">{meta.shortName}</span>
                  </div>
                  {isActive && (
                    <span className="nav-tab-sub font-mono text-[8px] uppercase tracking-widest opacity-70 leading-none">
                      {meta.aestheticLabel}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* ── Game Tabs (center) — mobile scrollable row ── */}
          <div
            className="md:hidden flex items-center gap-1 overflow-x-auto max-w-[calc(100vw-180px)] snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
          >
            {GAME_LIST.map((game) => {
              const isActive = currentGameId === game.id;
              const meta = GAME_META[game.id];
              return (
                <button
                  key={game.id}
                  data-game-tab={game.id}
                  onClick={() => switchGame(game.id)}
                  className={`nav-tab flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold select-none shrink-0 snap-center transition-all duration-300 ease-in-out ${
                    isActive ? 'nav-tab-active' : 'nav-tab-inactive'
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
            {/* Curriculum Graph */}
            <button
              onClick={() => setKnowledgeGraphOpen(true)}
              className="nav-btn-graph flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200"
              title="Open Discrete Mathematics Knowledge Graph"
            >
              <GitFork className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Curriculum Graph</span>
            </button>

            {/* Rosen textbook */}
            <button
              onClick={() => setRosenModalOpen(true)}
              className="nav-btn-rosen flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200"
              title="Kenneth H. Rosen Textbook References"
            >
              <BookMarked className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Rosen 8th Ed.</span>
            </button>

            {/* Mastery badge */}
            <div className="nav-mastery-badge flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono select-none">
              <Trophy className="w-3.5 h-3.5 nav-trophy-icon shrink-0" />
              <span className="nav-mastery-label hidden sm:inline">Mastered:</span>
              <span className="nav-mastery-count font-bold">{allMasteredConcepts.length}</span>
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
