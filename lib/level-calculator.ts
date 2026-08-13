export type CalculatedLevel = '100L' | '200L' | '300L' | '400L' | '500L' | 'Graduated';

export function calculateLevel(
  admissionYear: number,
  activeSessionStr: string = '2026/2027'
): CalculatedLevel {
  if (!admissionYear || isNaN(admissionYear)) {
    return '100L';
  }

  // Extract starting year from active session e.g. "2026/2027" -> 2026
  const startYear = parseInt(activeSessionStr.split('/')[0], 10) || new Date().getFullYear();
  const diff = startYear - admissionYear;

  if (diff <= 0) return '100L';
  if (diff === 1) return '200L';
  if (diff === 2) return '300L';
  if (diff === 3) return '400L';
  if (diff === 4) return '500L';
  return 'Graduated';
}
