import Policy, { IGradingRule } from '../models/Policy';
import connectToDatabase from './db';

export const DEFAULT_GRADING_SCALE: IGradingRule[] = [
  { minScore: 70, maxScore: 100, letterGrade: 'A', gradePoint: 5.0, description: 'Excellent / Distinction' },
  { minScore: 60, maxScore: 69, letterGrade: 'B', gradePoint: 4.0, description: 'Very Good' },
  { minScore: 50, maxScore: 59, letterGrade: 'C', gradePoint: 3.0, description: 'Credit / Minimum Pass' },
  { minScore: 45, maxScore: 49, letterGrade: 'D', gradePoint: 2.0, description: 'Pass' },
  { minScore: 0, maxScore: 44, letterGrade: 'F', gradePoint: 0.0, description: 'Fail' },
];

/**
 * Fetches dynamic grading policy rules configured in MongoDB by the Academic Board.
 */
export async function getDynamicGradingScale(): Promise<IGradingRule[]> {
  try {
    await connectToDatabase();
    const policy = await Policy.findOne({
      category: 'Grading & CGPA',
      isArchived: false,
    }).lean();

    if (policy?.gradingScale && policy.gradingScale.length > 0) {
      // Sort rules from highest to lowest minScore
      return [...policy.gradingScale].sort((a, b) => b.minScore - a.minScore);
    }
  } catch (err) {
    console.warn('[GPA Calculator] Could not fetch dynamic policy from DB, falling back:', err);
  }

  return DEFAULT_GRADING_SCALE;
}

/**
 * Matches a total score against dynamic grading scale ranges.
 */
export function calculateGradeAndPoint(
  totalScore: number,
  scale: IGradingRule[] = DEFAULT_GRADING_SCALE
): { letterGrade: string; gradePoint: number; description: string } {
  const rounded = Math.round(totalScore);

  for (const rule of scale) {
    if (rounded >= rule.minScore && rounded <= rule.maxScore) {
      return {
        letterGrade: rule.letterGrade,
        gradePoint: rule.gradePoint,
        description: rule.description || '',
      };
    }
  }

  // Fallback if out of explicit ranges
  if (rounded >= 70) return { letterGrade: 'A', gradePoint: 5.0, description: 'Distinction' };
  if (rounded >= 60) return { letterGrade: 'B', gradePoint: 4.0, description: 'Very Good' };
  if (rounded >= 50) return { letterGrade: 'C', gradePoint: 3.0, description: 'Pass' };
  return { letterGrade: 'F', gradePoint: 0.0, description: 'Fail' };
}

/**
 * Computes GPA or CGPA from a list of credit units and grade points.
 */
export function calculateGPA(
  courses: { gradePoint: number; unit: number }[]
): { gpa: number; totalQualityPoints: number; totalCreditUnits: number } {
  let totalQualityPoints = 0;
  let totalCreditUnits = 0;

  for (const c of courses) {
    const unit = Number(c.unit) || 0;
    const gp = Number(c.gradePoint) || 0;
    totalQualityPoints += gp * unit;
    totalCreditUnits += unit;
  }

  const gpa = totalCreditUnits > 0 ? +(totalQualityPoints / totalCreditUnits).toFixed(2) : 0;

  return {
    gpa,
    totalQualityPoints,
    totalCreditUnits,
  };
}
