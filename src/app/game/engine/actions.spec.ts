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
    // 7 is not Fibonacci, so no reward. 1000 - 5 = 995.
    expect(state.score).toBe(initialState.score - 5);
  });

  it('MUL works with diagonals', () => {
    // Neighbors of 0 are 0, 1, 4, 5. Values: 1, 1, 2, 3. Mul = 6.
    const state = applyAction(initialState, 0, 'MUL');
    
    expect(state.grid[0].value).toBe(6);
    expect(state.grid[1].value).toBe(1);
    expect(state.grid[4].value).toBe(1);
    expect(state.grid[5].value).toBe(1);
    // 6 is not Fibonacci, so no reward. 1000 - 12 = 988.
    expect(state.score).toBe(initialState.score - 12);
  });

  it('cost deducted even if only itself participates', () => {
    // Isolate a cell
    const grid: Grid = Array.from({ length: 16 }, () => ({ blocked: true, value: 0, lastTouchedMove: 0 }));
    grid[10] = { blocked: false, value: 5, lastTouchedMove: 0 };
    const state = { ...initialState, grid, nextFib: 5 };

    const nextState = applyAction(state, 10, 'SUM');
    expect(nextState.grid[10].value).toBe(5);
    // 5 is Fibonacci, so it grants reward. 1000 - 5 + 5 = 1000.
    expect(nextState.score).toBe(state.score - 5 + 5);
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
    expect(state.score).toBe(initialState.score - 5); // No bonus/reward for out-of-order
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
    // Score: 1000 - 5 + 2 (result/bonus) = 997
    expect(state.score).toBe(testState.score - 5 + 2);
    expect(state.achievedFibs).toEqual([1, 2]);
  });

  it('not enough score => gameOver=true and state unchanged (except gameOver flag)', () => {
    const lowScoreState = { ...initialState, score: 2 };
    const state = applyAction(lowScoreState, 0, 'SUM'); // cost is 5
    
    expect(state.gameOver).toBe(true);
    expect(state.score).toBe(2);
    expect(state.grid[0].value).toBe(1); // Unchanged
  });

  it('UNBLOCK works and deducts cost', () => {
    const highState = { ...initialState, score: 200 };
    const state = applyAction(highState, 2, 'UNBLOCK'); // 2 is blocked
    expect(state.grid[2].blocked).toBe(false);
    expect(state.grid[2].value).toBe(1);
    // Unblock gives no reward. 200 - 50 = 150.
    expect(state.score).toBe(highState.score - 50);
  });

  it('INC works and deducts cost (and adds bonus if reaches nextFib)', () => {
    // nextFib is 2.
    const testState = { ...initialState, score: 60, nextFib: 2 };
    // grid[0] is 1. INC -> 2.
    // Cost of INC is 5.
    // Result is 2.
    // Bonus is 2 (since it matches nextFib).
    // User expects score to be 60 - 5 + 2 = 57.
    const state = applyAction(testState, 0, 'INC');
    expect(state.grid[0].value).toBe(2);
    expect(state.score).toBe(57);
  });

  it('stores undo snapshot in lastMove', () => {
    const state = applyAction(initialState, 0, 'INC');
    expect(state.lastMove).toBeDefined();
    expect(state.lastMove?.action).toBe('INC');
    expect(state.lastMove?.clickedIndex).toBe(0);
    expect(state.lastMove?.prevState.grid[0].value).toBe(1);
    expect(state.grid[0].value).toBe(2);
  });

  describe('Bug: Unintended points for non-Fibonacci or UNBLOCK', () => {
    it('UNBLOCK should not grant any points (resultValue for score should be 0)', () => {
      const state = { ...initialState, score: 100 };
      const nextState = applyAction(state, 2, 'UNBLOCK'); // cost 50
      // 100 - 50 = 50. Should NOT be 51.
      expect(nextState.score).toBe(50);
    });

    it('SUM with non-Fibonacci result should not grant any points', () => {
      // Neighbors of 0 are 0, 1, 4, 5. Values: 1, 1, 2, 3. Sum = 7 (not Fib)
      const state = { ...initialState, score: 100 };
      const nextState = applyAction(state, 0, 'SUM'); // cost 5
      // 100 - 5 = 95. Should NOT be 102.
      expect(nextState.score).toBe(95);
    });

    it('MUL with non-Fibonacci result should not grant any points', () => {
      // Neighbors of 0: 1, 1, 2, 3. Let's change one to make it non-Fib.
      initialState.grid[1].value = 7;
      // 1 * 7 * 2 * 3 = 42 (not Fib)
      const state = { ...initialState, score: 100 };
      const nextState = applyAction(state, 0, 'MUL'); // cost 12
      // 100 - 12 = 88. Should NOT be 130.
      expect(nextState.score).toBe(88);
    });

    it('Fibonacci results should still grant points', () => {
      // Sum = 5 (Fib). Neighbors 0, 1, 4 are 1, 1, 3.
      initialState.grid[4].value = 3;
      initialState.grid[5].blocked = true;
      const state = { ...initialState, score: 100, nextFib: 5 };
      const nextState = applyAction(state, 0, 'SUM'); // cost 5
      // 100 - 5 + 5 = 100.
      expect(nextState.score).toBe(100);
    });

    it('should only grant Fibonacci bonus once', () => {
      // Initial state: nextFib is 2.
      let state = { ...initialState, score: 100, nextFib: 2 };
      
      // 1. Discover 2 for the first time
      state = applyAction(state, 0, 'INC'); // cell 0: 1 -> 2. Cost 5. Bonus 2.
      // Score: 100 - 5 + 2 = 97. nextFib becomes 3.
      expect(state.grid[0].value).toBe(2);
      expect(state.score).toBe(97);
      expect(state.nextFib).toBe(3);

      // 2. Discover 2 again (on another cell)
      state = applyAction(state, 1, 'INC'); // cell 1: 1 -> 2. Cost 5.
      // If the bug exists, it will give +2 points again.
      // Expected: 97 - 5 = 92.
      // Buggy: 97 - 5 + 2 = 94.
      expect(state.grid[1].value).toBe(2);
      expect(state.score).toBe(92);
    });

    it('should not grant bonus for out-of-order Fibonacci', () => {
      // nextFib is 2.
      // Discover 3 (out of order).
      initialState.grid[0].value = 2;
      let state = { ...initialState, score: 100, nextFib: 2 };
      
      state = applyAction(state, 0, 'INC'); // cell 0: 2 -> 3. Cost 5.
      // Expected: 100 - 5 = 95.
      // Buggy: 100 - 5 + 3 = 98.
      expect(state.grid[0].value).toBe(3);
      expect(state.score).toBe(95);
      expect(state.nextFib).toBe(2); // Should not advance
    });
  });
});
