import { describe, it, expect } from 'vitest';
import {
  DEFAULT_GRADING_SCALE,
  calculateGradeAndPoint,
  calculateGPA,
} from '../lib/gpa-calculator';

describe('Dynamic Academic Policy & GPA Engine Unit Tests', () => {
  it('should evaluate total scores against standard NMCN 5.0 grading rules', () => {
    const distinction = calculateGradeAndPoint(78, DEFAULT_GRADING_SCALE);
    expect(distinction.letterGrade).toBe('A');
    expect(distinction.gradePoint).toBe(5.0);

    const veryGood = calculateGradeAndPoint(63, DEFAULT_GRADING_SCALE);
    expect(veryGood.letterGrade).toBe('B');
    expect(veryGood.gradePoint).toBe(4.0);

    const creditPass = calculateGradeAndPoint(52, DEFAULT_GRADING_SCALE);
    expect(creditPass.letterGrade).toBe('C');
    expect(creditPass.gradePoint).toBe(3.0);

    const pass = calculateGradeAndPoint(46, DEFAULT_GRADING_SCALE);
    expect(pass.letterGrade).toBe('D');
    expect(pass.gradePoint).toBe(2.0);

    const fail = calculateGradeAndPoint(38, DEFAULT_GRADING_SCALE);
    expect(fail.letterGrade).toBe('F');
    expect(fail.gradePoint).toBe(0.0);
  });

  it('should evaluate custom dynamic grading scales from Academic Board policy', () => {
    const customScale = [
      { minScore: 80, maxScore: 100, letterGrade: 'A+', gradePoint: 5.0, description: 'High Distinction' },
      { minScore: 70, maxScore: 79, letterGrade: 'A', gradePoint: 4.5, description: 'Distinction' },
      { minScore: 50, maxScore: 69, letterGrade: 'P', gradePoint: 3.0, description: 'Pass' },
      { minScore: 0, maxScore: 49, letterGrade: 'F', gradePoint: 0.0, description: 'Fail' },
    ];

    const result1 = calculateGradeAndPoint(84, customScale);
    expect(result1.letterGrade).toBe('A+');
    expect(result1.gradePoint).toBe(5.0);

    const result2 = calculateGradeAndPoint(72, customScale);
    expect(result2.letterGrade).toBe('A');
    expect(result2.gradePoint).toBe(4.5);

    const result3 = calculateGradeAndPoint(55, customScale);
    expect(result3.letterGrade).toBe('P');
    expect(result3.gradePoint).toBe(3.0);
  });

  it('should calculate semester GPA and quality points accurately', () => {
    const courses = [
      { gradePoint: 5.0, unit: 3 }, // 15 QP
      { gradePoint: 4.0, unit: 4 }, // 16 QP
      { gradePoint: 3.0, unit: 2 }, // 6 QP
    ];

    const { gpa, totalQualityPoints, totalCreditUnits } = calculateGPA(courses);
    expect(totalCreditUnits).toBe(9);
    expect(totalQualityPoints).toBe(37);
    expect(gpa).toBe(4.11); // 37 / 9 = 4.1111...
  });
});
