export const FIB_SEQUENCE: number[] = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597];

export function isFibonacci(n: number): boolean {
  return FIB_SEQUENCE.includes(n);
}

export function getNextRequiredFib(currentNext: number): number {
  const index = FIB_SEQUENCE.lastIndexOf(currentNext);
  if (index === -1) {
    return 2;
  }
  if (index + 1 < FIB_SEQUENCE.length) {
    return FIB_SEQUENCE[index + 1];
  }
  return FIB_SEQUENCE[FIB_SEQUENCE.length - 1];
}
