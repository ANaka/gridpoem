/**
 * Convert log probability to probability: Math.exp(logprob)
 */
export function logProbToProb(logprob: number): number {
  return Math.exp(logprob);
}

/**
 * Combine row and column probabilities using geometric mean
 * Geometric mean = sqrt(a * b) for two values
 */
export function combineProbabilities(rowProb: number, colProb: number): number {
  // Handle edge cases
  if (rowProb <= 0 || colProb <= 0) {
    return 0;
  }

  return Math.sqrt(rowProb * colProb);
}
