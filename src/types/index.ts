// ============================================================
// UCH Result Management System — Global TypeScript Interfaces
// ============================================================

export type Level = '100L' | '200L' | '300L' | '400L' | '500L';
export type Semester = 1 | 2;
export type LetterGrade = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
export type CourseStatus = 'active' | 'inactive';

export interface Student {
  id: string;
  matricNo: string;
  sequenceNo?: string;
  surname?: string;
  otherNames?: string;
  fullName: string;
  firstName: string;
  lastName: string;
  level: Level;
  department: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  stateOfOrigin: string;
  lga?: string;
  nationality?: string;
  enrollmentYear: number;
  entrySession: string;
  pin: string;
  avatarInitials: string;
  avatarUrl?: string;
  gender: 'Male' | 'Female';
}

export interface Course {
  id: string;
  code: string;
  title: string;
  creditUnits: number;
  level: Level;
  semester: Semester;
  status: CourseStatus;
}

export interface CourseResult {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  creditUnits: number;
  caScore: number | null;       // max 30
  examScore: number | null;     // max 70
  totalScore: number | null;    // max 100
  grade: LetterGrade | null;
  gradePoint: number | null;    // 0.0 – 5.0
  qualityPoint: number | null;  // gradePoint × creditUnits
}

export interface SemesterResult {
  id: string;
  studentId: string;
  level: Level;
  semester: Semester;
  academicSession: string;
  isPublished: boolean;
  publishedAt: string | null;
  courses: CourseResult[];
  totalCreditUnits: number;
  totalQualityPoints: number;
  sgpa: number;
}

export interface DraftScore {
  studentId: string;
  courseId: string;
  caScore: number | null;
  examScore: number | null;
}

export interface AdminSession {
  isAuthenticated: boolean;
  role: 'admin';
}

export interface StudentSession {
  isAuthenticated: boolean;
  studentId: string | null;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timestamp: number;
}

export interface GradeBoundary {
  id: string;
  grade: LetterGrade | string;
  minScore: number;
  maxScore: number;
  gradePoint: number;
  remark: string;
}

export interface AcademicPolicy {
  maxCA: number;      // default 0
  maxExam: number;    // default 0
  isConfigured: boolean;
  gradeBoundaries: GradeBoundary[];
  matricPrefix: string;      // default e.g. "UI/SONUCH/UTME/"
  maxSystemLevel: Level;     // default "500L"
}

export const UCH_DEFAULT_GRADE_BOUNDARIES: GradeBoundary[] = [
  { id: 'gb-1', grade: 'A', minScore: 70, maxScore: 100, gradePoint: 5.0, remark: 'Distinction' },
  { id: 'gb-2', grade: 'B', minScore: 60, maxScore: 69, gradePoint: 4.0, remark: 'Credit' },
  { id: 'gb-3', grade: 'C', minScore: 50, maxScore: 59, gradePoint: 3.0, remark: 'Pass' },
  { id: 'gb-4', grade: 'D', minScore: 45, maxScore: 49, gradePoint: 2.0, remark: 'Pass' },
  { id: 'gb-5', grade: 'E', minScore: 40, maxScore: 44, gradePoint: 1.0, remark: 'Pass' },
  { id: 'gb-6', grade: 'F', minScore: 0, maxScore: 39, gradePoint: 0.0, remark: 'Fail' },
];

// Derived helpers
export function calcGrade(total: number, policy?: AcademicPolicy): LetterGrade {
  if (policy && policy.isConfigured && policy.gradeBoundaries.length > 0) {
    const match = policy.gradeBoundaries.find(
      (b) => total >= b.minScore && total <= b.maxScore
    );
    if (match) return match.grade as LetterGrade;
  }
  if (total >= 70) return 'A';
  if (total >= 60) return 'B';
  if (total >= 50) return 'C';
  if (total >= 45) return 'D';
  if (total >= 40) return 'E';
  return 'F';
}

export function calcGradePoint(grade: LetterGrade | string, policy?: AcademicPolicy): number {
  if (policy && policy.isConfigured && policy.gradeBoundaries.length > 0) {
    const match = policy.gradeBoundaries.find((b) => b.grade === grade);
    if (match) return match.gradePoint;
  }
  const map: Record<string, number> = { A: 5.0, B: 4.0, C: 3.0, D: 2.0, E: 1.0, F: 0.0 };
  return map[grade] ?? 0.0;
}

export function gradeColor(grade: LetterGrade | string | null): string {
  if (!grade) return 'text-uch-muted';
  const map: Record<string, string> = {
    A: 'text-emerald-400',
    B: 'text-blue-400',
    C: 'text-yellow-400',
    D: 'text-orange-400',
    E: 'text-red-300',
    F: 'text-red-500',
  };
  return map[grade] || 'text-uch-muted';
}

export function parseSessionYear(session: string): number {
  const parts = session.split('/');
  return parseInt(parts[0], 10) || 2024;
}

export function calculateCurrentLevel(entrySession: string, activeSystemSession: string): Level | 'Alumni' {
  const entryYear = parseSessionYear(entrySession);
  const activeYear = parseSessionYear(activeSystemSession);
  const diff = activeYear - entryYear;

  if (diff <= 0) return '100L';
  if (diff === 1) return '200L';
  if (diff === 2) return '300L';
  if (diff === 3) return '400L';
  if (diff === 4) return '500L';
  return 'Alumni';
}

export function getDefaultActiveSession(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0 = Jan, 6 = July
  return month >= 6 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
}

export function generateDynamicSessions(extraSessions: string[] = []): string[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const sessionsSet = new Set<string>();

  // 10 years back, 3 years ahead
  for (let i = currentYear - 10; i <= currentYear + 3; i++) {
    sessionsSet.add(`${i}/${i + 1}`);
  }

  // Preserve any database sessions outside standard window
  extraSessions.forEach((s) => {
    if (s && s.trim()) {
      sessionsSet.add(s.trim());
    }
  });

  return Array.from(sessionsSet).sort((a, b) => {
    const yearA = parseInt(a.split('/')[0]) || 0;
    const yearB = parseInt(b.split('/')[0]) || 0;
    return yearA - yearB;
  });
}

export const ALL_SESSIONS = generateDynamicSessions();

export function getSessionRange(entrySession: string, currentSession: string): string[] {
  const entryYear = parseSessionYear(entrySession);
  const currentYear = parseSessionYear(currentSession);
  return ALL_SESSIONS.filter((s) => {
    const y = parseSessionYear(s);
    return y >= entryYear && y <= currentYear;
  });
}

