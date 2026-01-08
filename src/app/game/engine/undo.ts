import { GameState } from '../models/game.models';

export function undo(state: GameState): GameState {
  if (!state.lastMove) {
    return state;
  }

  return {
    ...state.lastMove.prevState,
    // We might want to keep some global stats if they were meant to be persistent,
    // but the requirement says "restores the exact previous state".
  };
}
