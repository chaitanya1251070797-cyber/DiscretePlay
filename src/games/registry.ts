import { GameDefinition, GameId } from '../types/learning';
import { hanoiGameDefinition } from './tower-of-hanoi/hanoiConfig';
import { minesweeperGameDefinition } from './minesweeper-logic/minesweeperConfig';
import { mazeGameDefinition } from './maze-graph/mazeConfig';
import { caesarGameDefinition } from './caesar-cipher/caesarConfig';
import { nimGameDefinition } from './nim-combinatorics/nimConfig';
import { knightsGameDefinition } from './knights-tour/knightsConfig';

export const GAME_REGISTRY: Record<GameId, GameDefinition> = {
  'tower-of-hanoi': hanoiGameDefinition,
  'minesweeper-logic': minesweeperGameDefinition,
  'maze-graph': mazeGameDefinition,
  'caesar-cipher': caesarGameDefinition,
  'nim-combinatorics': nimGameDefinition,
  'knights-tour': knightsGameDefinition
};

export const GAME_LIST: GameDefinition[] = Object.values(GAME_REGISTRY);
