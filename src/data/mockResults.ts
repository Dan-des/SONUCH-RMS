import type { SemesterResult } from '../types';

export const mockResults: SemesterResult[] = [];

/** Compute CGPA across all published results for a student */
export function computeCGPA(results: SemesterResult[]): number {
  const published = results.filter((r) => r.isPublished);
  const totalCU = published.reduce((s, r) => s + r.totalCreditUnits, 0);
  const totalQP = published.reduce((s, r) => s + r.totalQualityPoints, 0);
  return totalCU > 0 ? +(totalQP / totalCU).toFixed(2) : 0;
}
