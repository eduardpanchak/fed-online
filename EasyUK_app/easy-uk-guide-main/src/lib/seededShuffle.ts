/**
 * Seeded random number generator using a simple LCG algorithm.
 * Produces deterministic "random" numbers based on the seed.
 */
export const seededRandom = (seed: number, index: number): number => {
  const x = Math.sin(seed + index) * 10000;
  return x - Math.floor(x);
};

/**
 * Shuffles an array deterministically based on the provided seed.
 * Same seed + same array = same shuffle result every time.
 */
export const seededShuffle = <T>(array: T[], seed: number): T[] => {
  const result = [...array];
  
  for (let i = result.length - 1; i > 0; i--) {
    const randomValue = seededRandom(seed, i);
    const j = Math.floor(randomValue * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  
  return result;
};
