import { calculateLevel, CalculatedLevel } from './level-calculator';

export { calculateLevel };
export type { CalculatedLevel };

export function formatSessionString(startYear: number): string {
  return `${startYear}/${startYear + 1}`;
}
