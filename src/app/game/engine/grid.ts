import { Grid, Cell } from '../models/game.models';

export function toRowCol(index: number, size: number = 4): { r: number, c: number } {
  return {
    r: Math.floor(index / size),
    c: index % size
  };
}

export function toIndex(r: number, c: number, size: number = 4): number {
  return r * size + c;
}

export function getNeighborIndexes(index: number, grid: Grid, size: number = 4): number[] {
  const { r, c } = toRowCol(index, size);
  const neighbors: number[] = [];

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr;
      const nc = c + dc;

      if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
        const nIndex = toIndex(nr, nc, size);
        if (!grid[nIndex].blocked) {
          neighbors.push(nIndex);
        }
      }
    }
  }

  return neighbors;
}

export function cloneGrid(grid: Grid): Grid {
  return grid.map(cell => ({ ...cell }));
}
