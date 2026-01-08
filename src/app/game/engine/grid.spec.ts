import { Grid } from '../models/game.models';
import { describe, it, expect } from 'vitest';
import { toRowCol, toIndex, getNeighborIndexes, cloneGrid } from './grid';

describe('Grid Utilities', () => {
  const size = 4;
  const createEmptyGrid = (s: number = 4): Grid => 
    Array.from({ length: s * s }, () => ({ blocked: false, value: 0 }));

  describe('toRowCol and toIndex', () => {
    it('should convert index to row/col correctly', () => {
      expect(toRowCol(0, size)).toEqual({ r: 0, c: 0 });
      expect(toRowCol(5, size)).toEqual({ r: 1, c: 1 });
      expect(toRowCol(15, size)).toEqual({ r: 3, c: 3 });
    });

    it('should convert row/col to index correctly', () => {
      expect(toIndex(0, 0, size)).toBe(0);
      expect(toIndex(1, 1, size)).toBe(5);
      expect(toIndex(3, 3, size)).toBe(15);
    });

    it('should be bidirectional', () => {
      for (let i = 0; i < size * size; i++) {
        const { r, c } = toRowCol(i, size);
        expect(toIndex(r, c, size)).toBe(i);
      }
    });
  });

  describe('getNeighborIndexes', () => {
    it('corner index has up to 4 cells including itself (if all unblocked)', () => {
      const grid = createEmptyGrid(size);
      // Top-left corner (0,0) index 0
      // Neighbors: (0,0), (0,1), (1,0), (1,1) -> 4 cells
      const neighbors = getNeighborIndexes(0, grid, size);
      expect(neighbors.length).toBe(4);
      expect(neighbors).toContain(0);
      expect(neighbors).toContain(1);
      expect(neighbors).toContain(4);
      expect(neighbors).toContain(5);
    });

    it('center has up to 9 including itself (8 neighbors + itself)', () => {
      const grid = createEmptyGrid(size);
      // Center (1,1) index 5
      // Neighbors: (0,0),(0,1),(0,2), (1,0),(1,1),(1,2), (2,0),(2,1),(2,2) -> 9 cells
      const neighbors = getNeighborIndexes(5, grid, size);
      expect(neighbors.length).toBe(9);
      for (let r = 0; r <= 2; r++) {
        for (let c = 0; c <= 2; c++) {
          expect(neighbors).toContain(toIndex(r, c, size));
        }
      }
    });

    it('blocked cells are excluded', () => {
      const grid = createEmptyGrid(size);
      grid[1].blocked = true; // (0,1)
      grid[4].blocked = true; // (1,0)
      
      // Index 0 (0,0) neighbors: (0,0), (0,1), (1,0), (1,1)
      // Blocked: (0,1), (1,0)
      // Remaining: (0,0), (1,1) -> indices 0, 5
      const neighbors = getNeighborIndexes(0, grid, size);
      expect(neighbors.length).toBe(2);
      expect(neighbors).toContain(0);
      expect(neighbors).toContain(5);
      expect(neighbors).not.toContain(1);
      expect(neighbors).not.toContain(4);
    });

    it('excludes target cell if it is blocked', () => {
      const grid = createEmptyGrid(size);
      grid[0].blocked = true;
      const neighbors = getNeighborIndexes(0, grid, size);
      expect(neighbors).not.toContain(0);
    });
  });

  describe('cloneGrid', () => {
    it('should create a deep copy of the grid', () => {
      const grid: Grid = [
        { blocked: false, value: 1 },
        { blocked: true, value: 0 }
      ];
      const cloned = cloneGrid(grid);
      
      expect(cloned).toEqual(grid);
      expect(cloned).not.toBe(grid);
      expect(cloned[0]).not.toBe(grid[0]);
      
      cloned[0].value = 2;
      expect(grid[0].value).toBe(1);
    });
  });
});
