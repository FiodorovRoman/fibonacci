import { GameState, GameAction, GameConfig } from '../models/game.models';
import { isFibonacci, getNextRequiredFib } from './fib';
import { getNeighborIndexes, cloneGrid } from './grid';
import { DEFAULT_CONFIG } from './init';

export function canAfford(state: GameState, cost: number): boolean {
  return state.score >= cost;
}

export function applyAction(
  state: GameState,
  index: number,
  action: GameAction,
  config: GameConfig = DEFAULT_CONFIG
): GameState {
  if (state.gameOver) {
    return state;
  }

  const cell = state.grid[index];
  let cost = 0;

  // Validate action and determine cost
  if (action === 'UNBLOCK') {
    if (!cell.blocked) return state;
    cost = config.costs.unblock;
  } else {
    if (cell.blocked) return state;
    if (action === 'INC') cost = config.costs.inc;
    else if (action === 'SUM') cost = config.costs.sum;
    else if (action === 'MUL') cost = config.costs.mul;
  }

  // Handle score and gameOver
  if (!canAfford(state, cost)) {
    return { ...state, gameOver: true };
  }

  // Prepare next state
  const nextGrid = cloneGrid(state.grid);
  const prevState = { 
    ...state, 
    grid: cloneGrid(state.grid), 
    achievedFibs: [...state.achievedFibs],
    counters: { ...state.counters }
  };
  let nextScore = state.score - cost;
  let nextBestFib = state.bestFib;
  let nextNextFib = state.nextFib;
  const nextAchievedFibs = [...state.achievedFibs];
  const nextCounters = { ...state.counters };

  let resultValue = 0;
  const participatingIndexes: number[] = [];

  if (action === 'UNBLOCK') {
    nextGrid[index].blocked = false;
    nextGrid[index].value = 1;
    resultValue = 1;
  } else if (action === 'INC') {
    resultValue = nextGrid[index].value + 1;
    nextGrid[index].value = resultValue;
    nextCounters.inc++;
  } else if (action === 'SUM' || action === 'MUL') {
    const neighbors = getNeighborIndexes(index, state.grid, config.size);
    participatingIndexes.push(...neighbors);
    
    if (action === 'SUM') {
      resultValue = neighbors.reduce((acc, idx) => acc + state.grid[idx].value, 0);
      nextCounters.sum++;
    } else {
      resultValue = neighbors.reduce((acc, idx) => acc * state.grid[idx].value, 1);
      nextCounters.mul++;
    }

    // Reset all participating neighbor cells to 1
    participatingIndexes.forEach(idx => {
      nextGrid[idx].value = 1;
    });
    // Set clicked cell value = result
    nextGrid[index].value = resultValue;
  }

  // Update Fibonacci logic
  if (isFibonacci(resultValue)) {
    if (resultValue > nextBestFib) {
      nextBestFib = resultValue;
    }

    if (resultValue === state.nextFib) {
      nextScore += config.fibBonus;
      nextAchievedFibs.push(resultValue);
      nextNextFib = getNextRequiredFib(state.nextFib);
    }
  }

  // Result is added to score
  nextScore += resultValue;

  return {
    grid: nextGrid,
    score: nextScore,
    bestFib: nextBestFib,
    nextFib: nextNextFib,
    achievedFibs: nextAchievedFibs,
    counters: nextCounters,
    lastMove: { action, clickedIndex: index, prevState },
    gameOver: false
  };
}
