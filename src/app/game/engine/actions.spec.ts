import { applyAction } from './actions';
import { GameState, Grid } from '../models/game.models';
import { DEFAULT_CONFIG } from './init';

describe('Actions Engine', () => {
  let initialState: GameState;

  beforeEach(() => {
    const grid: Grid = Array.from({ length: 16 }, () => ({ blocked: true, value: 0 }));
    // Unblock a few for testing
    grid[0] = { blocked: false, value: 1 };
    grid[1] = { blocked: false, value: 1 };
    grid[4] = { blocked: false, value: 2 };
    grid[5] = { blocked: false, value: 3 };

    initialState = {
      grid,
      score: 30,
      bestFib: 1,
      nextFib: 2,
      achievedFibs: [1],
      gameOver: false
    };
  });

  it('SUM resets neighbors and keeps clicked cell as result', () => {
    // Neighbors of 0 (in 4x4) are 0, 1, 4, 5 (itself included)
    // Values: 1, 1, 2, 3. Sum = 7.
    const state = applyAction(initialState, 0, 'SUM');
    
    expect(state.grid[0].value).toBe(7);
    expect(state.grid[1].value).toBe(1);
    expect(state.grid[4].value).toBe(1);
    expect(state.grid[5].value).toBe(1);
    expect(state.score).toBe(initialState.score - DEFAULT_CONFIG.costs.sum + 7);
  });

  it('MUL works with diagonals', () => {
    // Neighbors of 0 are 0, 1, 4, 5. Values: 1, 1, 2, 3. Mul = 6.
    const state = applyAction(initialState, 0, 'MUL');
    
    expect(state.grid[0].value).toBe(6);
    expect(state.grid[1].value).toBe(1);
    expect(state.grid[4].value).toBe(1);
    expect(state.grid[5].value).toBe(1);
    expect(state.score).toBe(initialState.score - DEFAULT_CONFIG.costs.mul + 6);
  });

  it('cost deducted even if only itself participates', () => {
    // Isolate a cell
    const grid: Grid = Array.from({ length: 16 }, () => ({ blocked: true, value: 0 }));
    grid[10] = { blocked: false, value: 5 };
    const state = { ...initialState, grid };

    const nextState = applyAction(state, 10, 'SUM');
    expect(nextState.grid[10].value).toBe(5);
    expect(nextState.score).toBe(state.score - DEFAULT_CONFIG.costs.sum + 5);
  });

  it('out-of-order fib gives no +100 and does not advance', () => {
    // nextFib is 2. If we make an 8.
    // Neighbors of 0: 0, 1, 4, 5.
    initialState.grid[0].value = 2;
    initialState.grid[1].value = 2;
    initialState.grid[4].value = 2;
    initialState.grid[5].value = 2;
    // Sum = 8.
    
    const state = applyAction(initialState, 0, 'SUM');
    expect(state.grid[0].value).toBe(8);
    expect(state.bestFib).toBe(8);
    expect(state.nextFib).toBe(2); // Still 2
    expect(state.score).toBe(initialState.score - DEFAULT_CONFIG.costs.sum + 8); // No bonus
    expect(state.achievedFibs).toEqual([1]);
  });

  it('advances nextFib and adds bonus when matching', () => {
    // nextFib is 2.
    // Neighbors 0, 1, 4, 5.
    // To get 2:
    initialState.grid[0].value = 1;
    initialState.grid[1].value = 1;
    initialState.grid[4].blocked = true;
    initialState.grid[5].blocked = true;
    
    const state = applyAction(initialState, 0, 'SUM');
    expect(state.grid[0].value).toBe(2);
    expect(state.nextFib).toBe(3);
    expect(state.score).toBe(initialState.score - DEFAULT_CONFIG.costs.sum + 100 + 2);
    expect(state.achievedFibs).toEqual([1, 2]);
  });

  it('not enough score => gameOver=true and state unchanged (except gameOver flag)', () => {
    const lowScoreState = { ...initialState, score: 5 };
    const state = applyAction(lowScoreState, 0, 'SUM'); // cost is 10
    
    expect(state.gameOver).toBe(true);
    expect(state.score).toBe(5);
    expect(state.grid[0].value).toBe(1); // Unchanged
  });

  it('UNBLOCK works and deducts cost', () => {
    const highState = { ...initialState, score: 200 };
    const state = applyAction(highState, 2, 'UNBLOCK'); // 2 is blocked
    expect(state.grid[2].blocked).toBe(false);
    expect(state.grid[2].value).toBe(1);
    expect(state.score).toBe(highState.score - DEFAULT_CONFIG.costs.unblock + 1);
  });

  it('INC works and deducts cost (and adds bonus if reaches nextFib)', () => {
    // nextFib is 2.
    // grid[0] is 1. INC -> 2.
    const state = applyAction(initialState, 0, 'INC');
    expect(state.grid[0].value).toBe(2);
    // score: 30 - 10 (inc) + 100 (bonus) + 2 (result) = 122
    expect(state.score).toBe(122);
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
