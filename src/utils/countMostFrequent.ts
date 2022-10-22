/*
 * PMD 85 ColorAce picture editor
 * Copyright (c) 2022 Martin Bórik
 */

export const countMostFrequent = (arr: number[]) => {
  const counts = {};
  arr.forEach(v => {
    if (v > 0) {
      counts[v] = (counts[v] || 0) + 1;
    }
  });

  let result = 0, max = 0;
  for (const c in counts) {
    if (counts[c] > max) {
      max = counts[c];
      result = +c;
    }
  }

  return result;
};
