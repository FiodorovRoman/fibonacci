export type Cell = { blocked: boolean; value: number }

export type Grid = Cell[] // length 16

export type GameAction = 'INC' | 'SUM' | 'MUL' | 'UNBLOCK'

export type GameConfig = {
  size: 4;
  costs: { inc: number; sum: number; mul: number; unblock: number };
  startScore: number;
  startUnblocked: 4;
  fibBonus: number;
}

export type ActionCounters = { inc: number; sum: number; mul: number };

export type GameState = { 
  grid: Grid; 
  score: number; 
  bestFib: number; 
  nextFib: number; 
  achievedFibs: number[]; 
  counters: ActionCounters;
  lastMove?: MoveRecord; 
  gameOver: boolean 
}

export type MoveRecord = { action: GameAction; clickedIndex: number; prevState: GameState } // store minimal snapshot for undo; can optimize later

export type FloatingScore = {
  id: number;
  value: string;
  index: number;
  isBonus: boolean;
  isPenalty: boolean;
}
