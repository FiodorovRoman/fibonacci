import { GameConfig, GameState, Grid } from '../models/game.models';
import { mulberry32, pickRandomUniqueIndexes } from './random';

export const DEFAULT_CONFIG: GameConfig = {
  size: 4,
  costs: {
    inc: 20,
    sum: 15,
    mul: 30,
    unblock: 120
  },
  startScore: 40,
  startUnblocked: 4,
  fibBonus: 100
};

export function createNewGame(seed?: number, config: GameConfig = DEFAULT_CONFIG): GameState {
  const actualSeed = seed ?? Math.floor(Math.random() * 2147483647);
  const rng = mulberry32(actualSeed);
  
  const gridSize = config.size * config.size;
  const grid: Grid = Array.from({ length: gridSize }, () => ({
    blocked: true,
    value: 0
  }));
  
  const unblockedIndexes = pickRandomUniqueIndexes(config.startUnblocked, rng, gridSize);
  
  unblockedIndexes.forEach(index => {
    grid[index].blocked = false;
    grid[index].value = 1;
  });
  
  return {
    grid,
    score: config.startScore,
    bestFib: 1,
    nextFib: 2,
    achievedFibs: [1],
    counters: { inc: 0, sum: 0, mul: 0 },
    gameOver: false
  };
}
