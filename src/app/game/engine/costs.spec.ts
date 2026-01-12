import { describe, it, expect, beforeEach } from 'vitest';
import { applyAction } from './actions';
import { GameState, Grid } from '../models/game.models';

describe('Dynamic Costs', () => {
  let initialState: GameState;

  beforeEach(() => {
    const grid: Grid = Array.from({ length: 16 }, () => ({ blocked: true, value: 0, lastTouchedMove: 0 }));
    grid[0] = { blocked: false, value: 1, lastTouchedMove: 0 };
    grid[1] = { blocked: false, value: 1, lastTouchedMove: 0 };
    grid[2] = { blocked: false, value: 1, lastTouchedMove: 0 };
    grid[3] = { blocked: false, value: 1, lastTouchedMove: 0 };

    initialState = {
      grid,
      score: 10000,
      bestFib: 1,
      nextFib: 1000,
      achievedFibs: [1],
      counters: { inc: 0, sum: 0, mul: 0 },
      moveNumber: 0,
      gameOver: false
    };
  });

  it('raises cost of INC after 10 moves', () => {
    let state = initialState;
    const initialCost = 5; // From DEFAULT_CONFIG

    // First 10 INCs should cost initialCost
    for (let i = 0; i < 10; i++) {
      const prevScore = state.score;
      state = applyAction(state, 0, 'INC');
      expect(prevScore - state.score).toBe(initialCost);
    }

    // 11th INC should cost double
    const prevScore = state.score;
    state = applyAction(state, 0, 'INC');
    expect(prevScore - state.score).toBe(initialCost * 2);
    
    // 20th INC should still cost double
    for (let i = 0; i < 9; i++) {
        state = applyAction(state, 0, 'INC');
    }
    // 21st INC should cost triple
    const scoreBefore21 = state.score;
    state = applyAction(state, 0, 'INC');
    expect(scoreBefore21 - state.score).toBe(initialCost * 3);
  });

  it('raises costs independently', () => {
    let state = initialState;
    const incInitialCost = 5;
    const sumInitialCost = 5;

    // 10 INCs
    for (let i = 0; i < 10; i++) {
      state = applyAction(state, 0, 'INC');
    }
    
    // 11th INC should be double
    const scoreBefore11thInc = state.score;
    state = applyAction(state, 0, 'INC');
    expect(scoreBefore11thInc - state.score).toBe(incInitialCost * 2);

    // 1st SUM should still be initial cost
    const scoreBefore1stSum = state.score;
    state = applyAction(state, 0, 'SUM');
    expect(scoreBefore1stSum - state.score).toBe(sumInitialCost);
  });

  it('raises MUL cost after 10 moves', () => {
    let state = initialState;
    const initialCost = 12;

    for (let i = 0; i < 10; i++) {
      state = applyAction(state, 0, 'MUL');
    }

    const prevScore = state.score;
    state = applyAction(state, 0, 'MUL');
    expect(prevScore - state.score).toBe(initialCost * 2);
  });
});
