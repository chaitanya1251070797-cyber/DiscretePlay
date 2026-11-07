import React, { useState, useEffect, useCallback } from 'react';
import { useLearningEngine } from '../../engine/LearningEngineContext';
import { RotateCcw, Undo2, CheckCircle2, Award, Zap, Compass } from 'lucide-react';
import { sound } from '../../utils/sound';
import confetti from 'canvas-confetti';

const BOARD_SIZE = 5;
const TOTAL_SQUARES = BOARD_SIZE * BOARD_SIZE;

// Knight's 8 legal relative moves
const KNIGHT_MOVES = [
  [-2, -1], [-2, 1],
  [-1, -2], [-1, 2],
  [1, -2],  [1, 2],
  [2, -1],  [2, 1]
];

export const KnightsTourGame: React.FC = () => {
  const { 
    currentStage, 
    recordAction, 
    addExplanation, 
    advanceStage, 
    markConceptMastered,
    updateSharedGameState,
  } = useLearningEngine();

  // Board state: null for unvisited, number for step order (1 to 25)
  const [board, setBoard] = useState<(number | null)[][]>(() => 
    Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null))
  );

  const [currentPos, setCurrentPos] = useState<[number, number] | null>([0, 0]);
  const [moveHistory, setMoveHistory] = useState<[number, number][]>([[0, 0]]);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isTrapped, setIsTrapped] = useState<boolean>(false);

  // Initialize board with knight at (0, 0)
  const resetGame = useCallback(() => {
    sound.playClick(400);
    const initialBoard = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
    initialBoard[0][0] = 1;
    setBoard(initialBoard);
    setCurrentPos([0, 0]);
    setMoveHistory([[0, 0]]);
    setIsWon(false);
    setIsTrapped(false);
  }, []);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  // Compute unvisited degree for any given square (Warnsdorff's heuristic)
  const computeUnvisitedDegree = useCallback((r: number, c: number, currentBoard: (number | null)[][]): number => {
    let degree = 0;
    for (const [dr, dc] of KNIGHT_MOVES) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
        if (currentBoard[nr][nc] === null) {
          degree++;
        }
      }
    }
    return degree;
  }, []);

  // Compute available legal candidate squares from current position
  const getLegalCandidates = useCallback(() => {
    if (!currentPos) return [];
    const [r, c] = currentPos;
    const candidates: { r: number; c: number; degree: number }[] = [];

    for (const [dr, dc] of KNIGHT_MOVES) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
        if (board[nr][nc] === null) {
          candidates.push({
            r: nr,
            c: nc,
            degree: computeUnvisitedDegree(nr, nc, board)
          });
        }
      }
    }
    return candidates;
  }, [currentPos, board, computeUnvisitedDegree]);

  const candidates = getLegalCandidates();

  // Update shared state for teaching panel
  useEffect(() => {
    updateSharedGameState({
      tourLength: moveHistory.length,
      maxSquares: TOTAL_SQUARES,
      candidateDegrees: candidates.map(c => `(${c.r},${c.c}): deg=${c.degree}`)
    });
  }, [moveHistory.length, candidates, updateSharedGameState]);

  // Check if player is trapped with no legal moves remaining before reaching 25
  useEffect(() => {
    if (moveHistory.length > 0 && moveHistory.length < TOTAL_SQUARES && candidates.length === 0) {
      setIsTrapped(true);
      sound.playError();
      recordAction(false, 'knight_trapped', `Trapped at step ${moveHistory.length}! No unvisited legal knight moves remain.`);
      addExplanation(
        'Knight Trapped (Dead End)',
        `At step ${moveHistory.length}, all adjacent knight moves have already been visited.`,
        `Warnsdorff's rule suggests moving to vertices with minimum unvisited onward exits to prevent premature corner isolation.`,
        'invalid_move',
        'Rosen Section 10.5: Hamiltonian Paths'
      );
    } else {
      setIsTrapped(false);
    }
  }, [candidates.length, moveHistory.length, recordAction, addExplanation]);

  // Handle cell click
  const handleCellClick = (r: number, c: number) => {
    if (isWon) return;

    // First placement if no start
    if (!currentPos) {
      const newBoard = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
      newBoard[r][c] = 1;
      setBoard(newBoard);
      setCurrentPos([r, c]);
      setMoveHistory([[r, c]]);
      sound.playMove();
      return;
    }

    // Check if (r, c) is a legal candidate
    const isCandidate = candidates.some(cand => cand.r === r && cand.c === c);
    if (!isCandidate) {
      sound.playError();
      return;
    }

    sound.playMove();
    const nextStep = moveHistory.length + 1;
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = nextStep;
    setBoard(newBoard);
    setCurrentPos([r, c]);
    const nextHistory: [number, number][] = [...moveHistory, [r, c]];
    setMoveHistory(nextHistory);
    recordAction(true);

    // Win condition: completed all 25 squares!
    if (nextStep === TOTAL_SQUARES) {
      setIsWon(true);
      sound.playSuccess();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });

      markConceptMastered('hamiltonian-paths');
      addExplanation(
        "Complete Knight's Tour (Hamiltonian Path) Solved!",
        `You visited all 25 squares in a single unbroken sequence!`,
        `In graph theory, this sequence of vertices forms a Hamiltonian Path in the Knight's Graph G=(V,E).`,
        'strategic_subgoal',
        'Rosen Section 10.5 Theorem: Hamiltonian Cycles and Paths'
      );
    } else if (nextStep === 5 && currentStage === 'DISCOVER') {
      advanceStage();
    }
  };

  const undoMove = () => {
    if (moveHistory.length <= 1 || isWon) return;
    sound.playClick(350);
    const lastPos = moveHistory[moveHistory.length - 1];
    const prevPos = moveHistory[moveHistory.length - 2];

    const newBoard = board.map(row => [...row]);
    newBoard[lastPos[0]][lastPos[1]] = null;
    setBoard(newBoard);
    setCurrentPos(prevPos);
    setMoveHistory(h => h.slice(0, -1));
    setIsTrapped(false);
  };

  return (
    <div className="theme-panel rounded-2xl p-5 flex flex-col gap-4 shadow-2xl relative">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="font-mono text-cyan-400">♘</span>
              <span>Knight&apos;s Tour & Hamiltonian Paths</span>
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              5x5 CHESS MATRIX
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Visit all 25 squares without revisiting &bull; Candidate badges show <span className="text-cyan-300 font-bold">Warnsdorff degree</span>
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          {/* Progress badge */}
          <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-xl border border-white/15">
            <span className="text-slate-400">Tour:</span>
            <span className="font-bold text-cyan-400 text-sm">{moveHistory.length}</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-300">25</span>
          </div>

          <button
            onClick={undoMove}
            disabled={moveHistory.length <= 1 || isWon}
            className="p-2 rounded-xl bg-black/60 border border-white/20 text-slate-300 hover:text-white transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            title="Undo Last Move"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            onClick={resetGame}
            className="p-2 rounded-xl bg-black/60 border border-white/20 text-slate-300 hover:text-white transition cursor-pointer"
            title="Reset Board"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Trapped Alert Banner */}
      {isTrapped && (
        <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/60 flex items-center justify-between text-xs text-rose-200">
          <span>Knight trapped at step {moveHistory.length}! No unvisited legal moves remain. Click Undo or Reset.</span>
          <button
            onClick={undoMove}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg cursor-pointer ml-2"
          >
            Undo Step
          </button>
        </div>
      )}

      {/* 5x5 Monochromatic Chess Matrix */}
      <div className="relative flex justify-center py-5 bg-black/95 rounded-2xl border border-white/15 shadow-inner">
        <div 
          className="grid gap-2 relative z-10"
          style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))` }}
        >
          {board.map((row, r) =>
            row.map((step, c) => {
              const isCurrent = currentPos && currentPos[0] === r && currentPos[1] === c;
              const isVisited = step !== null;
              const candidate = candidates.find(cand => cand.r === r && cand.c === c);
              const isLegal = Boolean(candidate);

              // Standard alternating chessboard pattern
              const isDarkSquare = (r + c) % 2 === 1;

              let cellStyle = isDarkSquare 
                ? 'bg-[#121218] border-slate-800 text-slate-400' 
                : 'bg-[#1a1a24] border-slate-700/60 text-slate-300';

              if (isCurrent) {
                cellStyle = 'bg-cyan-500 border-white text-slate-950 font-black shadow-lg shadow-cyan-400/50 scale-105 z-20';
              } else if (isLegal) {
                cellStyle = 'bg-cyan-950/70 border-cyan-400 text-cyan-200 ring-2 ring-cyan-400/50 hover:bg-cyan-900/80 cursor-pointer animate-pulse';
              } else if (isVisited) {
                cellStyle = 'bg-[#0a1512] border-cyan-800/40 text-cyan-400/70 font-mono';
              }

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  disabled={isVisited && !isCurrent}
                  className={`w-13 h-13 sm:w-14 sm:h-14 rounded-xl border flex flex-col items-center justify-center font-mono text-xs font-bold transition-all relative transform active:scale-95 ${cellStyle}`}
                >
                  {isCurrent ? (
                    <span className="text-xl leading-none">♘</span>
                  ) : isLegal ? (
                    <>
                      <span className="text-cyan-300 text-xs font-black">deg:</span>
                      <span className="text-white text-sm font-black drop-shadow">{candidate?.degree}</span>
                    </>
                  ) : isVisited ? (
                    <span className="text-xs font-bold opacity-80">#{step}</span>
                  ) : (
                    <span className="text-[9px] opacity-20">{r},{c}</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Win Banner */}
      {isWon && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-400/60 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-400/40">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Hamiltonian Path Complete (25/25)!</span>
              </h4>
              <p className="text-xs text-emerald-200">
                You successfully completed the 5x5 Knight&apos;s Tour using Warnsdorff&apos;s minimum-degree rule!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetGame}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition cursor-pointer"
            >
              Replay
            </button>
            {currentStage !== 'INDEPENDENT_APPLICATION' && (
              <button
                onClick={() => {
                  sound.playSuccess();
                  advanceStage();
                }}
                className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <span>Advance Stage</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Footnote */}
      <div className="text-xs text-slate-400 bg-black/60 p-3 rounded-xl border border-white/10 flex flex-wrap items-center justify-between gap-2 font-mono">
        <span>Warnsdorff Rule: Always choose the candidate square with the smallest number of onward exits.</span>
        <span className="text-cyan-400 text-[11px] font-semibold">G = (V, E) &bull; Hamiltonian Tour</span>
      </div>
    </div>
  );
};
