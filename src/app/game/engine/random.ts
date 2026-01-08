export function mulberry32(a: number) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

export function pickRandomUniqueIndexes(count: number, rng: () => number, range: number): number[] {
  const indexes: number[] = [];
  const pool = Array.from({ length: range }, (_, i) => i);
  
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(rng() * pool.length);
    indexes.push(pool.splice(randomIndex, 1)[0]);
  }
  
  return indexes;
}
