export type Cell = { blocked: boolean; value: number }

export type Grid = Cell[] // length 16

export type GameAction = 'INC' | 'SUM' | 'MUL' | 'UNBLOCK'

export type GameConfig = { size: 4; costs: { inc: 10; sum: 10; mul: 20; unblock: 100 }; startScore: number; startUnblocked: 4 }

export type GameState = { grid: Grid; score: number; bestFib: number; nextFib: number; achievedFibs: number[]; lastMove?: MoveRecord; gameOver: boolean }

export type MoveRecord = { action: GameAction; clickedIndex: number; prevState: GameState } // store minimal snapshot for undo; can optimize later

export type FloatingScore = {
  id: number;
  value: string;
  index: number;
  isBonus: boolean;
  isPenalty: boolean;
}
