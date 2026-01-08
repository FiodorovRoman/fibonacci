import { describe, it, expect } from 'vitest';
import { isFibonacci, getNextRequiredFib, FIB_SEQUENCE } from './fib';

describe('Fibonacci Logic', () => {
  describe('isFibonacci', () => {
    it('should return true for 8', () => {
      expect(isFibonacci(8)).toBe(true);
    });

    it('should return false for 9', () => {
      expect(isFibonacci(9)).toBe(false);
    });

    it('should return true for all values in FIB_SEQUENCE', () => {
      FIB_SEQUENCE.forEach(val => {
        expect(isFibonacci(val)).toBe(true);
      });
    });
  });

  describe('getNextRequiredFib', () => {
    it('should return 2 for input 1 (ignoring the second 1)', () => {
      // "next order starts at 2 (since 1 ignored)"
      expect(getNextRequiredFib(1)).toBe(2);
    });

    it('should return 3 for input 2', () => {
      expect(getNextRequiredFib(2)).toBe(3);
    });

    it('should return 5 for input 3', () => {
      expect(getNextRequiredFib(3)).toBe(5);
    });

    it('should return 1597 for input 987', () => {
      expect(getNextRequiredFib(987)).toBe(1597);
    });
  });
});
