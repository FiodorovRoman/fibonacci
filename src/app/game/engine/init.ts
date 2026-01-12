import { Difficulty, GameConfig, GameState, Grid } from '../models/game.models';
import { mulberry32, pickRandomUniqueIndexes } from './random';

export const DIFFICULTY_CONFIGS: Record<Difficulty, GameConfig> = {
  EASY: {
    size: 4,
    difficulty: 'EASY',
    costs: {
      inc: 2,
      sum: 3,
      mul: 5,
      unblock: 20
    },
    startScore: 100,
    startUnblocked: 4
  },
  NORMAL: {
    size: 4,
    difficulty: 'NORMAL',
    costs: {
      inc: 5,
      sum: 5,
      mul: 12,
      unblock: 50
    },
    startScore: 100,
    startUnblocked: 4
  },
  HARD: {
    size: 4,
    difficulty: 'HARD',
    costs: {
      inc: 8,
      sum: 10,
      mul: 15,
      unblock: 75
    },
    startScore: 100,
    startUnblocked: 4
  }
};

export const DEFAULT_CONFIG: GameConfig = DIFFICULTY_CONFIGS.NORMAL;

export function createNewGame(seed?: number, config: GameConfig = DEFAULT_CONFIG): GameState {
  const actualSeed = seed ?? Math.floor(Math.random() * 2147483647);
  const rng = mulberry32(actualSeed);
  
  const gridSize = config.size * config.size;
  const grid: Grid = Array.from({ length: gridSize }, () => ({
    blocked: true,
    value: 0,
    lastTouchedMove: 0
  }));
  
  const unblockedIndexes = pickRandomUniqueIndexes(config.startUnblocked, rng, gridSize);
  
  unblockedIndexes.forEach(index => {
    grid[index].blocked = false;
    grid[index].value = 1;
    grid[index].lastTouchedMove = 0;
  });
  
  return {
    grid,
    score: config.startScore,
    bestFib: 1,
    nextFib: 2,
    achievedFibs: [1],
    counters: { inc: 0, sum: 0, mul: 0 },
    moveNumber: 0,
    gameOver: false
  };
}
