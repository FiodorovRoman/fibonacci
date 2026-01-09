import { describe, it, expect } from 'vitest';
import {undo} from './undo';
import {createNewGame} from './init';
import {applyAction} from './actions';

describe('undo', () => {
  it('should return the same state if no lastMove exists', () => {
    const initialState = createNewGame(123);
    const resultState = undo(initialState);
    expect(resultState).toBe(initialState);
  });

  it('should restore the previous state after an action', () => {
    const initialState = createNewGame(123);
    // Find an unblocked cell
    const index = initialState.grid.findIndex(c => !c.blocked);
    
    const stateAfterAction = applyAction(initialState, index, 'INC');
    expect(stateAfterAction.lastMove).toBeDefined();
    // initialState.score is 100. INC cost 5. Result value is 2. Bonus is included in result.
    // 100 - 5 + 2 = 97.
    expect(stateAfterAction.score).toBe(97); 
    
    const stateAfterUndo = undo(stateAfterAction);
    
    // Check that it matches the initial state
    expect(stateAfterUndo.score).toBe(initialState.score);
    expect(stateAfterUndo.grid[index].value).toBe(initialState.grid[index].value);
    expect(stateAfterUndo.counters.inc).toBe(initialState.counters.inc);
    expect(stateAfterUndo.lastMove).toBeUndefined();
  });

  it('should only undo one step (lastMove is not a stack)', () => {
    const initialState = createNewGame(123);
    const index = initialState.grid.findIndex(c => !c.blocked);
    
    const state1 = applyAction(initialState, index, 'INC');
    const state2 = applyAction(state1, index, 'INC');
    
    const undonState = undo(state2);
    
    // Should be back to state1
    expect(undonState.score).toBe(state1.score);
    expect(undonState.grid[index].value).toBe(state1.grid[index].value);
    
    // Doing undo again on undonState should return state1 if state1 had no lastMove,
    // but state1 DID have a lastMove (pointing to initialState).
    const doubleUndonState = undo(undonState);
    expect(doubleUndonState.score).toBe(initialState.score);
  });
});
