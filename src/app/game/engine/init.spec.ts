import { createNewGame, DEFAULT_CONFIG } from './init';

describe('Game Initialization', () => {
  it('should create a grid of 16 cells', () => {
    const state = createNewGame();
    expect(state.grid.length).toBe(16);
  });

  it('should unblock exactly 4 cells', () => {
    const state = createNewGame();
    const unblockedCount = state.grid.filter(cell => !cell.blocked).length;
    expect(unblockedCount).toBe(4);
  });

  it('should set unblocked cells value to 1', () => {
    const state = createNewGame();
    state.grid.forEach(cell => {
      if (!cell.blocked) {
        expect(cell.value).toBe(1);
      }
    });
  });

  it('should be reproducible with the same seed', () => {
    const seed = 12345;
    const state1 = createNewGame(seed);
    const state2 = createNewGame(seed);

    expect(state1.grid).toEqual(state2.grid);
    
    const unblockedIndexes1 = state1.grid
      .map((cell, i) => cell.blocked ? -1 : i)
      .filter(i => i !== -1);
    const unblockedIndexes2 = state2.grid
      .map((cell, i) => cell.blocked ? -1 : i)
      .filter(i => i !== -1);
      
    expect(unblockedIndexes1).toEqual(unblockedIndexes2);
  });

  it('should use the provided config', () => {
    const customConfig = {
      ...DEFAULT_CONFIG,
      startScore: 500,
      startUnblocked: 6 as any // Using any to bypass literal type for test
    };
    const state = createNewGame(undefined, customConfig);
    expect(state.score).toBe(500);
    const unblockedCount = state.grid.filter(cell => !cell.blocked).length;
    expect(unblockedCount).toBe(6);
  });

  it('should initialize Fibonacci tracking', () => {
    const state = createNewGame();
    expect(state.bestFib).toBe(1);
    expect(state.nextFib).toBe(2);
    expect(state.gameOver).toBe(false);
  });
});
