import { describe, it, expect, beforeEach } from 'vitest';
import { applyAction } from './actions';
import { GameState, Grid } from '../models/game.models';
import { DEFAULT_CONFIG } from './init';

describe('Actions Engine', () => {
  let initialState: GameState;

  beforeEach(() => {
    const grid: Grid = Array.from({ length: 16 }, () => ({ blocked: true, value: 0, lastTouchedMove: 0 }));
    // Unblock a few for testing
    grid[0] = { blocked: false, value: 1, lastTouchedMove: 0 };
    grid[1] = { blocked: false, value: 1, lastTouchedMove: 0 };
    grid[4] = { blocked: false, value: 2, lastTouchedMove: 0 };
    grid[5] = { blocked: false, value: 3, lastTouchedMove: 0 };

    initialState = {
      grid,
      score: 1000,
      bestFib: 1,
      nextFib: 1000, // High so it doesn't trigger bonuses and mess up score math
      achievedFibs: [1],
      counters: { inc: 0, sum: 0, mul: 0 },
      moveNumber: 0,
      gameOver: false
    };
  });

  describe('Auto-blocking', () => {
    it('blocks a cell after 12 moves of inactivity', () => {
      // Unblock one more cell to have 5 unblocked (to satisfy safety rule)
      initialState.grid[2] = { blocked: false, value: 1, lastTouchedMove: 0 };
      // unblocked are 0, 1, 2, 4, 5. (5 cells)
      
      let state = initialState;
      // Perform 11 actions on cell 0.
      for (let i = 0; i < 11; i++) {
        state = applyAction(state, 0, 'INC');
        // resultValue will be 2, 3, 4, 5... not matching nextFib=2 except first move
      }
      // Cell 1 has lastTouchedMove = 0. Current moveNumber = 11. 11-0 = 11. Not eligible yet.
      expect(state.grid[1].blocked).toBe(false);
      
      // 12th action on cell 0.
      state = applyAction(state, 0, 'INC');
      // Current moveNumber = 12. Cell 1: 12-0 = 12. Eligible.
      // Cell 1 should be blocked now.
      expect(state.grid[1].blocked).toBe(true);
      expect(state.grid[1].value).toBe(1);
    });

    it('obeys safety rule: minimum 4 unblocked cells', () => {
      // Initially 4 unblocked: 0, 1, 4, 5.
      let state = initialState;
      // Perform 12 actions on cell 0.
      for (let i = 0; i < 12; i++) {
        state = applyAction(state, 0, 'INC');
      }
      // Cells 1, 4, 5 are eligible (12-0 = 12), but blocking one would leave only 3 unblocked.
      // So none should be blocked.
      expect(state.grid.filter(c => !c.blocked).length).toBe(4);
      expect(state.grid[1].blocked).toBe(false);
      expect(state.grid[4].blocked).toBe(false);
      expect(state.grid[5].blocked).toBe(false);
    });

    it('blocks only the oldest eligible cell', () => {
      // Unblock 2 more: 2, 3. Total unblocked: 0, 1, 2, 3, 4, 5. (6 cells)
      initialState.grid[2] = { blocked: false, value: 1, lastTouchedMove: 0 };
      initialState.grid[3] = { blocked: false, value: 1, lastTouchedMove: 0 };
      
      // Move 1: touch cell 1
      let state = applyAction(initialState, 1, 'INC'); // cell 1 lastTouchedMove = 1
      
      // Move 2 to 12: touch cell 0
      for (let i = 0; i < 11; i++) {
        state = applyAction(state, 0, 'INC');
      }
      // Current moveNumber = 12.
      // Cells 2, 3, 4, 5 have lastTouchedMove = 0.
      // Cell 1 has lastTouchedMove = 1.
      
      // At move 12, cell 2 (oldest eligible) should be blocked.
      expect(state.grid[2].blocked).toBe(true);
      expect(state.grid[3].blocked).toBe(false);
      expect(state.grid[1].blocked).toBe(false);
    });

    it('does not auto-block the cell that was just clicked', () => {
      // Setup: 5 cells unblocked. Cell 2 has not been touched for 12 moves.
      // But we click cell 2 in the 13th move.
      initialState.grid[2] = { blocked: false, value: 1, lastTouchedMove: 0 };
      
      let state = initialState;
      for (let i = 0; i < 11; i++) {
        state = applyAction(state, 0, 'INC');
      }
      // moveNumber = 11. Cell 2 lastTouchedMove = 0.
      
      // 12th move: click cell 2.
      state = applyAction(state, 2, 'INC');
      // moveNumber = 12. Cell 2 lastTouchedMove = 12.
      // Cell 1 is eligible (12-0 = 12).
      expect(state.grid[2].blocked).toBe(false);
      expect(state.grid[1].blocked).toBe(true);
    });
  });

  describe('Undo', () => {
    it('restores moveNumber and lastTouchedMove', async () => {
      const { undo } = await import('./undo');
      let state = applyAction(initialState, 0, 'INC');
      expect(state.moveNumber).toBe(1);
      expect(state.grid[0].lastTouchedMove).toBe(1);
      
      state = undo(state);
      expect(state.moveNumber).toBe(0);
      expect(state.grid[0].lastTouchedMove).toBe(0);
    });

    it('restores auto-blocked state', async () => {
      const { undo } = await import('./undo');
      initialState.grid[2] = { blocked: false, value: 1, lastTouchedMove: 0 };
      
      let state = initialState;
      for (let i = 0; i < 12; i++) {
        state = applyAction(state, 0, 'INC');
      }
      expect(state.grid[1].blocked).toBe(true);
      
      state = undo(state);
      expect(state.grid[1].blocked).toBe(false);
    });
  });

  it('increments action counters', () => {
    let state = applyAction(initialState, 0, 'INC');
    expect(state.counters.inc).toBe(1);
    
    state = applyAction(state, 0, 'SUM');
    expect(state.counters.sum).toBe(1);
    
    state = applyAction(state, 0, 'MUL');
    expect(state.counters.mul).toBe(1);
  });

  it('SUM resets neighbors and keeps clicked cell as result', () => {
    // Neighbors of 0 (in 4x4) are 0, 1, 4, 5 (itself included)
    // Values: 1, 1, 2, 3. Sum = 7.
    const state = applyAction(initialState, 0, 'SUM');
    
    expect(state.grid[0].value).toBe(7);
    expect(state.grid[1].value).toBe(1);
    expect(state.grid[4].value).toBe(1);
    expect(state.grid[5].value).toBe(1);
    expect(state.score).toBe(initialState.score - 15 + 7);
  });

  it('MUL works with diagonals', () => {
    // Neighbors of 0 are 0, 1, 4, 5. Values: 1, 1, 2, 3. Mul = 6.
    const state = applyAction(initialState, 0, 'MUL');
    
    expect(state.grid[0].value).toBe(6);
    expect(state.grid[1].value).toBe(1);
    expect(state.grid[4].value).toBe(1);
    expect(state.grid[5].value).toBe(1);
    expect(state.score).toBe(initialState.score - 30 + 6);
  });

  it('cost deducted even if only itself participates', () => {
    // Isolate a cell
    const grid: Grid = Array.from({ length: 16 }, () => ({ blocked: true, value: 0 }));
    grid[10] = { blocked: false, value: 5 };
    const state = { ...initialState, grid };

    const nextState = applyAction(state, 10, 'SUM');
    expect(nextState.grid[10].value).toBe(5);
    expect(nextState.score).toBe(state.score - 15 + 5);
  });

  it('out-of-order fib gives no bonus and does not advance', () => {
    // nextFib is 1000. If we make an 8.
    // Neighbors of 0: 0, 1, 4, 5.
    initialState.grid[0].value = 2;
    initialState.grid[1].value = 2;
    initialState.grid[4].value = 2;
    initialState.grid[5].value = 2;
    // Sum = 8.
    
    const state = applyAction(initialState, 0, 'SUM');
    expect(state.grid[0].value).toBe(8);
    expect(state.bestFib).toBe(8);
    expect(state.nextFib).toBe(1000); // Still 1000
    expect(state.score).toBe(initialState.score - 15 + 8); // No bonus
    expect(state.achievedFibs).toEqual([1]);
  });

  it('advances nextFib and adds bonus (equal to value) when matching', () => {
    // Set nextFib to 2 for this test
    const testState = { ...initialState, nextFib: 2 };
    // Neighbors 0, 1, 4, 5.
    // To get 2:
    testState.grid[0].value = 1;
    testState.grid[1].value = 1;
    testState.grid[4].blocked = true;
    testState.grid[5].blocked = true;
    
    const state = applyAction(testState, 0, 'SUM');
    expect(state.grid[0].value).toBe(2);
    expect(state.nextFib).toBe(3);
    // bonus is 2. Score: 1000 - 15 + 2 (result) + 2 (bonus) = 989
    expect(state.score).toBe(testState.score - 15 + 2 + 2);
    expect(state.achievedFibs).toEqual([1, 2]);
  });

  it('not enough score => gameOver=true and state unchanged (except gameOver flag)', () => {
    const lowScoreState = { ...initialState, score: 5 };
    const state = applyAction(lowScoreState, 0, 'SUM'); // cost is 15
    
    expect(state.gameOver).toBe(true);
    expect(state.score).toBe(5);
    expect(state.grid[0].value).toBe(1); // Unchanged
  });

  it('UNBLOCK works and deducts cost', () => {
    const highState = { ...initialState, score: 200 };
    const state = applyAction(highState, 2, 'UNBLOCK'); // 2 is blocked
    expect(state.grid[2].blocked).toBe(false);
    expect(state.grid[2].value).toBe(1);
    expect(state.score).toBe(highState.score - 120 + 1);
  });

  it('INC works and deducts cost (and adds bonus if reaches nextFib)', () => {
    // nextFib is 2.
    const testState = { ...initialState, nextFib: 2 };
    // grid[0] is 1. INC -> 2.
    const state = applyAction(testState, 0, 'INC');
    expect(state.grid[0].value).toBe(2);
    // score: 1000 - 20 (inc) + 2 (bonus) + 2 (result) = 984
    expect(state.score).toBe(testState.score - 20 + 2 + 2);
  });

  it('stores undo snapshot in lastMove', () => {
    const state = applyAction(initialState, 0, 'INC');
    expect(state.lastMove).toBeDefined();
    expect(state.lastMove?.action).toBe('INC');
    expect(state.lastMove?.clickedIndex).toBe(0);
    expect(state.lastMove?.prevState.grid[0].value).toBe(1);
    expect(state.grid[0].value).toBe(2);
  });
});
