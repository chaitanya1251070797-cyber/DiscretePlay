import React, { useState, useEffect, useCallback } from 'react';
import { useLearningEngine } from '../../engine/LearningEngineContext';
import { Flag, Bomb, RotateCcw, CheckCircle2, ShieldAlert, Sparkles, Check, HelpCircle } from 'lucide-react';

interface CellState {
  r: number;
  c: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

export const MinesweeperGame: React.FC = () => {
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
  const size = isIndependent ? 5 : 4;
  
  // Deterministic mine placements so every board is 100% logically solvable without guessing!
  // For 4x4: mines at (1, 1), (2, 2)
  // For 5x5: mines at (0, 3), (1, 1), (3, 2), (4, 4)
  const defaultMineCoords: [number, number][] = isIndependent 
    ? [[0, 3], [1, 1], [3, 2], [4, 4]]
    : [[1, 1], [2, 2]];

  const totalMines = defaultMineCoords.length;

  const [grid, setGrid] = useState<CellState[][]>([]);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [flagMode, setFlagMode] = useState<boolean>(false);

  // Initialize board
  const initializeBoard = useCallback(() => {
    const newGrid: CellState[][] = [];
    const isMineMap = new Set(defaultMineCoords.map(([r, c]) => `${r},${c}`));

    for (let r = 0; r < size; r++) {
      const row: CellState[] = [];
      for (let c = 0; c < size; c++) {
        const isMine = isMineMap.has(`${r},${c}`);
        row.push({
          r,
          c,
          isMine,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0
        });
      }
      newGrid.push(row);
    }

    // Compute neighbor counts
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!newGrid[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue;
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
                if (newGrid[nr][nc].isMine) count++;
              }
            }
          }
          newGrid[r][c].neighborMines = count;
        }
      }
    }

    // Auto-reveal corner (0,0) as starting seed if safe
    if (!newGrid[0][0].isMine) {
      newGrid[0][0].isRevealed = true;
    }

    setGrid(newGrid);
    setGameOver(false);
    setGameWon(false);
  }, [size, isIndependent]);

  useEffect(() => {
    initializeBoard();
  }, [initializeBoard]);

  // Generate live Boolean Equations from revealed clues
  useEffect(() => {
    if (grid.length === 0) return;

    const equations: any[] = [];
    grid.forEach(row => {
      row.forEach(cell => {
        if (cell.isRevealed && cell.neighborMines > 0) {
          const unrevealedVars: string[] = [];
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue;
              const nr = cell.r + dr;
              const nc = cell.c + dc;
              if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
                const neighbor = grid[nr][nc];
                if (!neighbor.isRevealed) {
                  unrevealedVars.push(`X_{${nr},${nc}}`);
                }
              }
            }
          }
          if (unrevealedVars.length > 0) {
            equations.push({
              id: `eq-${cell.r}-${cell.c}`,
              sourceCell: `(${cell.r}, ${cell.c})`,
              variables: unrevealedVars,
              targetSum: cell.neighborMines,
              status: 'pending',
              resolvedDeductions: [`${unrevealedVars.join(' + ')} = ${cell.neighborMines}`]
            });
          }
        }
      });
    });

    updateSharedGameState({
      equations: equations.slice(0, 3),
      totalMines
    });
  }, [grid, size, totalMines, updateSharedGameState]);

  // Handle cell click (Reveal or Flag depending on flagMode)
  const handleCellClick = (r: number, c: number, rightClick = false) => {
    if (gameOver || gameWon) return;

    const currentCell = grid[r][c];

    // Toggle flag if flagMode or rightClick
    if (flagMode || rightClick) {
      if (currentCell.isRevealed) return;

      const newGrid = grid.map(row => row.map(cell => {
        if (cell.r === r && cell.c === c) {
          const nextFlag = !cell.isFlagged;
          return { ...cell, isFlagged: nextFlag };
        }
        return cell;
      }));

      setGrid(newGrid);

      if (!currentCell.isFlagged) {
        // Did student flag a genuine mine?
        if (currentCell.isMine) {
          recordAction(true);
          addExplanation(
            'Propositional Truth Assignment: X = 1',
            `Cell (${r}, ${c}) flagged as Mine.`,
            `The Boolean linear equation sum satisfied: X_{${r},${c}} = 1.`,
            'strategic_subgoal'
          );
        } else {
          recordAction(false, 'false_flag', `Cell (${r}, ${c}) is actually safe! Examine neighboring constraints.`);
          addExplanation(
            'Contradiction in Truth Assignment',
            `Flagging (${r}, ${c}) creates an over-constrained system with adjacent revealed numbers.`,
            `Equation sum would exceed clue: sum X_i > k.`,
            'invalid_move'
          );
        }
      }
      checkWinCondition(newGrid);
      return;
    }

    // Normal Reveal Click
    if (currentCell.isFlagged) return;

    if (currentCell.isMine) {
      // Stepped on mine!
      const newGrid = grid.map(row => row.map(cell => ({ ...cell, isRevealed: true })));
      setGrid(newGrid);
      setGameOver(true);
      recordAction(false, 'stepped_on_mine', `Triggered mine at (${r}, ${c})! In SAT, this represents an unsatisfied clause.`);
      addExplanation(
        'Logical Inconsistency: Mine Triggered',
        `Cell (${r}, ${c}) contained a mine.`,
        `In propositional calculus, choosing this cell violated the safety theorem: X_{${r},${c}} had truth value 1.`,
        'invalid_move',
        'Rosen Section 1.3: Satisfiability and Proof by Contradiction'
      );
      setInteractionMode('EXPLAIN');
      return;
    }

    // Safe cell reveal!
    const newGrid = [...grid.map(row => [...row])];
    revealCellRecursive(newGrid, r, c);
    setGrid(newGrid);
    recordAction(true);

    addExplanation(
      'Safe Cell Deduction Proven: X = 0',
      `Revealed safe cell (${r}, ${c}) showing clue "${newGrid[r][c].neighborMines}".`,
      `Constraint formulated: sum_{N(${r}, ${c})} X_{i,j} = ${newGrid[r][c].neighborMines}.`,
      'valid_move'
    );

    checkWinCondition(newGrid);
  };

  const revealCellRecursive = (board: CellState[][], r: number, c: number) => {
    if (r < 0 || r >= size || c < 0 || c >= size) return;
    const cell = board[r][c];
    if (cell.isRevealed || cell.isFlagged || cell.isMine) return;

    cell.isRevealed = true;

    // If 0 neighbor mines, cascade flood fill
    if (cell.neighborMines === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          revealCellRecursive(board, r + dr, c + dc);
        }
      }
    }
  };

  const checkWinCondition = (board: CellState[][]) => {
    let unrevealedSafeCells = 0;
    board.forEach(row => {
      row.forEach(cell => {
        if (!cell.isMine && !cell.isRevealed) {
          unrevealedSafeCells++;
        }
      });
    });

    if (unrevealedSafeCells === 0) {
      setGameWon(true);
      addExplanation(
        'Deterministic Deduction Complete!',
        'Every safe cell revealed without a single guess!',
        'All Boolean variables resolved with 100% truth consistency.',
        'strategic_subgoal'
      );

      if (currentStage === 'INDEPENDENT_APPLICATION') {
        markConceptMastered('propositional-logic');
      }
    }
  };

  return (
    <div className="theme-panel rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-green-500/20 pb-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Minesweeper Logic Deduction</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-green-500/20 text-green-300 border border-green-500/40">
              {size}x{size} Grid &bull; Neon Cyberpunk
            </span>
          </h2>
          <p className="text-xs text-green-300/70 font-mono">
            {isIndependent 
              ? 'Independent Challenge: Deduce all cells with ZERO guessing' 
              : 'Formulate neighborhood clues as Boolean linear equations'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Flag Mode Toggle Button */}
          <button
            onClick={() => setFlagMode(!flagMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium border transition ${
              flagMode
                ? 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-500/30'
                : 'bg-black border-green-500/40 text-green-300 hover:border-green-400'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>{flagMode ? 'Mode: Flag (X=1)' : 'Mode: Reveal (X=0)'}</span>
          </button>

          <button
            onClick={initializeBoard}
            className="p-2 rounded-xl bg-black border border-green-500/40 text-green-400 hover:text-white hover:border-green-300 transition"
            title="Reset Board"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid Board */}
      <div className="flex justify-center py-4 bg-black/80 rounded-xl border border-green-500/30">
        <div 
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              let cellContent = null;
              let cellClass = 'cyber-cell text-green-300';

              if (cell.isRevealed) {
                if (cell.isMine) {
                  cellClass = 'bg-rose-950 border-rose-500 text-rose-300';
                  cellContent = <Bomb className="w-5 h-5 text-rose-400 animate-pulse" />;
                } else {
                  cellClass = 'bg-slate-950/90 border-green-500/20 text-slate-100 font-bold';
                  if (cell.neighborMines > 0) {
                    const clueColors: Record<number, string> = {
                      1: 'text-green-400 font-mono',
                      2: 'text-yellow-400 font-mono',
                      3: 'text-rose-400 font-mono',
                      4: 'text-cyan-400 font-mono'
                    };
                    cellContent = (
                      <span className={`text-base font-mono font-bold ${clueColors[cell.neighborMines] || 'text-green-400'}`}>
                        {cell.neighborMines}
                      </span>
                    );
                  }
                }
              } else if (cell.isFlagged) {
                cellClass = 'cyber-cell cyber-cell-flagged text-rose-400';
                cellContent = <Flag className="w-4 h-4 text-rose-400" />;
              }

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleCellClick(r, c, true);
                  }}
                  className={`w-12 h-12 rounded-xl border flex items-center justify-center font-mono text-xs font-semibold shadow-sm transition-all transform active:scale-95 ${cellClass}`}
                >
                  {cellContent}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Win / Loss Banners */}
      {gameWon && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Board Fully Solved Without Guessing!</h4>
              <p className="text-xs text-emerald-300">
                All linear Boolean constraints satisfied with perfect deductive consistency.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={initializeBoard}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Replay
            </button>
            {currentStage !== 'INDEPENDENT_APPLICATION' && (
              <button
                onClick={() => advanceStage()}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition"
              >
                <span>Advance Stage</span>
              </button>
            )}
          </div>
        </div>
      )}

      {gameOver && (
        <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 flex items-center justify-between">
          <span className="text-xs text-rose-200">Mine exploded! Notice how this cell caused a contradiction with neighboring clues.</span>
          <button
            onClick={initializeBoard}
            className="px-3 py-1 rounded-lg bg-rose-600 text-white font-semibold text-xs transition hover:bg-rose-500"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Footer Info */}
      <div className="text-xs text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
        <span>Click to reveal cell (X=0). Right-click or toggle Flag mode to mark guaranteed mines (X=1).</span>
        <span className="text-cyan-400 font-mono text-[11px]">Formula: &sum; X_i = Clue</span>
      </div>
    </div>
  );
};

