import { create } from 'zustand';
import type {
  Student,
  Course,
  SemesterResult,
  Notification,
  Level,
  DraftScore,
  AcademicPolicy,
} from '../types';
import { calcGrade, calcGradePoint, calculateCurrentLevel, getDefaultActiveSession } from '../types';
import { mockStudents } from '../data/mockStudents';
import { mockCourses } from '../data/mockCourses';
import { mockResults } from '../data/mockResults';
import {
  fetchStudentsFromCloud,
  saveStudentToCloud,
  updateStudentPinInCloud,
  updateStudentAvatarInCloud,
  updateStudentProfileInCloud,
  fetchCoursesFromCloud,
  saveCourseToCloud,
  deleteCourseFromCloud,
  fetchRawResultsFromCloud,
  saveResultRowsToCloud,
  deleteResultFromCloud,
  fetchAcademicPolicyFromCloud,
  saveAcademicPolicyToCloud,
  fetchSystemConfigFromCloud,
  saveSystemConfigToCloud,
  fetchAdminKeyFromCloud,
  updateAdminKeyInCloud,
  CloudResultRow,
} from '../lib/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface AppState {
  // Auth state
  currentStudentId: string | null;
  isStudentAuthenticated: boolean;
  isAdminAuthenticated: boolean;

  // Data
  students: Student[];
  courses: Course[];
  results: SemesterResult[];
  draftScores: DraftScore[];

  // UI state
  studentActiveTab: 'home' | 'courses' | 'results' | 'profile';
  adminView: 'hub' | 'roster' | 'results';
  notifications: Notification[];

  // System State & Admin result entry state
  activeSystemSession: string;
  adminAccessKey: string;
  adminSelectedLevel: Level;
  adminSelectedSemester: 1 | 2;
  adminSelectedCourseId: string | null;
  adminSelectedSession: string;

  // Academic Policy
  academicPolicy: AcademicPolicy;
  updateAcademicPolicy: (policy: AcademicPolicy) => void;
  updateAdminKey: (newKey: string) => void;

  // Portal mode override (for dev toggle)
  portalOverride: 'student' | 'admin' | null;

  // Theme
  theme: 'dark' | 'light' | 'system';

  // ─── Theme Action ─────────────────────────────────────────────────────────
  setTheme: (theme: 'dark' | 'light' | 'system') => void;

  // ─── Auth Actions ────────────────────────────────────────────────────────
  rehydrateAuthSession: () => void;
  loginStudent: (matricNo: string, pin: string) => boolean;
  logoutStudent: () => void;
  loginAdmin: (key: string) => boolean;
  logoutAdmin: () => void;

  // ─── Student Actions ─────────────────────────────────────────────────────
  setStudentActiveTab: (tab: 'home' | 'courses' | 'results' | 'profile') => void;
  updateStudentPin: (studentId: string, currentPin: string, newPin: string) => boolean;
  updateStudentAvatar: (studentId: string, avatarUrl: string) => void;
  updateStudentProfile: (studentId: string, updates: Partial<Student>) => void;

  // ─── Admin Navigation ─────────────────────────────────────────────────────
  setActiveSystemSession: (session: string) => void;
  setAdminView: (view: 'hub' | 'roster' | 'results') => void;
  setAdminSelectedLevel: (level: Level) => void;
  setAdminSelectedSemester: (sem: 1 | 2) => void;
  setAdminSelectedCourseId: (id: string | null) => void;
  setAdminSelectedSession: (session: string) => void;

  // ─── Roster Actions ──────────────────────────────────────────────────────
  addStudent: (data: { sequenceNo: string; surname: string; otherNames: string; entrySession: string }) => void;
  updateStudentAdmin: (studentId: string, data: { surname: string; otherNames: string; entrySession: string }) => void;
  resetStudentPin: (studentId: string) => void;
  deleteStudent: (studentId: string) => void;

  // ─── Course Actions ──────────────────────────────────────────────────────
  addCourse: (course: Omit<Course, 'id' | 'status'>) => void;
  updateCourse: (id: string, updates: Partial<Omit<Course, 'id'>>) => void;
  deleteCourse: (id: string) => void;

  // ─── Score Entry ─────────────────────────────────────────────────────────
  setDraftScore: (studentId: string, courseId: string, field: 'caScore' | 'examScore', value: number | null) => void;
  getDraftScore: (studentId: string, courseId: string) => DraftScore | undefined;
  saveDraft: () => void;
  publishResults: (level: Level, semester: 1 | 2) => void;
  deleteStudentCourseResult: (studentId: string, courseId: string, level: Level, semester: 1 | 2, session: string) => void;

  // ─── Notifications ───────────────────────────────────────────────────────
  addNotification: (type: Notification['type'], message: string) => void;
  removeNotification: (id: string) => void;

  // Cloud Sync
  initCloudSync: () => Promise<void>;

  // Dev Portal Toggle ───────────────────────────────────────────────────
  setPortalOverride: (portal: 'student' | 'admin' | null) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  currentStudentId: null,
  isStudentAuthenticated: false,
  isAdminAuthenticated: false,
  students: mockStudents,
  courses: mockCourses,
  results: mockResults,
  draftScores: [],
  studentActiveTab: 'home',
  adminView: 'hub',
  notifications: [],
  activeSystemSession: getDefaultActiveSession(),
  adminAccessKey: 'UCH-ADMIN-2026-KEY',
  adminSelectedLevel: '100L',
  adminSelectedSemester: 1,
  adminSelectedCourseId: null,
  adminSelectedSession: getDefaultActiveSession(),
  academicPolicy: {
    maxCA: 0,
    maxExam: 0,
    isConfigured: false,
    gradeBoundaries: [],
    matricPrefix: 'UI/SONUCH/UTME/',
    maxSystemLevel: '500L',
  },
  portalOverride: null,
  theme: 'dark' as const,


  // ─── Auth ────────────────────────────────────────────────────────────────

  rehydrateAuthSession: () => {
    try {
      const stored = localStorage.getItem('sonuch_auth_session');
      if (stored) {
        const session = JSON.parse(stored);
        if (session.role === 'admin') {
          set({ isAdminAuthenticated: true, adminView: 'hub' });
        } else if (session.role === 'student' && session.studentId) {
          set({ isStudentAuthenticated: true, currentStudentId: session.studentId, studentActiveTab: 'home' });
        }
      }
    } catch (err) {
      console.warn('[Auth Session] Rehydration failed:', err);
    }
  },

  loginStudent: (matricNo, pin) => {
    const student = get().students.find(
      (s) => s.matricNo.toLowerCase() === matricNo.toLowerCase() && s.pin === pin
    );
    if (student) {
      set({ isStudentAuthenticated: true, currentStudentId: student.id, studentActiveTab: 'home' });
      try {
        localStorage.setItem('sonuch_auth_session', JSON.stringify({ role: 'student', studentId: student.id }));
      } catch { /* ignore */ }
      return true;
    }
    return false;
  },

  logoutStudent: () => {
    set({ isStudentAuthenticated: false, currentStudentId: null });
    try {
      localStorage.removeItem('sonuch_auth_session');
    } catch { /* ignore */ }
  },

  loginAdmin: (key) => {
    const dbAdminKey = get().adminAccessKey;
    if (!dbAdminKey || !dbAdminKey.trim()) {
      get().addNotification('error', 'Unable to verify admin key, please check database connection');
      return false;
    }
    const isKeyValid = key.trim() === dbAdminKey.trim();
    if (isKeyValid) {
      set({ isAdminAuthenticated: true, adminView: 'hub' });
      try {
        localStorage.setItem('sonuch_auth_session', JSON.stringify({ role: 'admin' }));
      } catch { /* ignore */ }
      return true;
    }
    return false;
  },

  logoutAdmin: () => {
    set({ isAdminAuthenticated: false, adminView: 'hub' });
    try {
      localStorage.removeItem('sonuch_auth_session');
    } catch { /* ignore */ }
  },

  // ─── Student Navigation ──────────────────────────────────────────────────

  setStudentActiveTab: (tab) => set({ studentActiveTab: tab }),

  updateStudentPin: (studentId, currentPin, newPin) => {
    const student = get().students.find((s) => s.id === studentId);
    if (!student || student.pin !== currentPin) return false;
    set((state) => ({
      students: state.students.map((s) =>
        s.id === studentId ? { ...s, pin: newPin } : s
      ),
    }));
    updateStudentPinInCloud(studentId, newPin).catch(console.error);
    return true;
  },

  updateStudentAvatar: (studentId, avatarUrl) => {
    set((state) => ({
      students: state.students.map((s) =>
        s.id === studentId ? { ...s, avatarUrl } : s
      ),
    }));
    updateStudentAvatarInCloud(studentId, avatarUrl).catch(console.error);
    get().addNotification('success', 'Profile picture updated successfully.');
  },

  updateStudentProfile: (studentId, updates) => {
    let targetStudent: Student | null = null;
    set((state) => ({
      students: state.students.map((s) => {
        if (s.id !== studentId) return s;
        const updated = { ...s, ...updates };
        targetStudent = updated;
        return updated;
      }),
    }));
    if (targetStudent) {
      updateStudentProfileInCloud(studentId, updates).catch(console.error);
    }
    get().addNotification('success', 'Student profile updated successfully.');
  },

  // ─── Cloud Hydration ────────────────────────────────---------------------

  initCloudSync: async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const [cloudStudents, cloudCourses, cloudResults, cloudPolicy, cloudSession, cloudAdminKey] = await Promise.all([
        fetchStudentsFromCloud(),
        fetchCoursesFromCloud(),
        fetchRawResultsFromCloud(),
        fetchAcademicPolicyFromCloud(),
        fetchSystemConfigFromCloud(),
        fetchAdminKeyFromCloud(),
      ]);

      const effectiveCourses = cloudCourses && cloudCourses.length > 0 ? cloudCourses : get().courses;
      let mappedResults: SemesterResult[] | null = null;

      if (cloudResults && cloudResults.length > 0) {
        const groups: Record<string, CloudResultRow[]> = {};
        cloudResults.forEach((r) => {
          const key = `${r.student_id}_${r.academic_session}_${r.level}_${r.semester}`;
          if (!groups[key]) groups[key] = [];
          groups[key].push(r);
        });

        mappedResults = [];
        Object.entries(groups).forEach(([key, rows]) => {
          if (rows.length === 0) return;
          const first = rows[0];
          const studentId = first.student_id;
          const session = first.academic_session;
          const level = first.level as Level;
          const semester = first.semester as 1 | 2;

          const courseResults = rows.map((r) => {
            const course = effectiveCourses.find((c) => c.id === r.course_id);
            const code = course?.code || 'CRS';
            const title = course?.title || 'Course';
            const creditUnits = course?.creditUnits || 3;
            const total = r.total_score;
            const grade = r.grade as any;
            const gp = r.grade_point;
            const qp = +(gp * creditUnits).toFixed(2);

            return {
              courseId: r.course_id,
              courseCode: code,
              courseTitle: title,
              creditUnits,
              caScore: r.ca_score,
              examScore: r.exam_score,
              totalScore: total,
              grade,
              gradePoint: gp,
              qualityPoint: qp,
            };
          });

          const validCourses = courseResults.filter((c) => c.totalScore !== null);
          const totalCU = validCourses.reduce((s, c) => s + c.creditUnits, 0);
          const totalQP = validCourses.reduce((s, c) => s + (c.qualityPoint ?? 0), 0);

          mappedResults!.push({
            id: `res-${key}`,
            studentId,
            level,
            semester,
            academicSession: session,
            isPublished: first.is_published,
            publishedAt: first.published_at || null,
            courses: courseResults,
            totalCreditUnits: totalCU,
            totalQualityPoints: +totalQP.toFixed(2),
            sgpa: totalCU > 0 ? +(totalQP / totalCU).toFixed(2) : 0,
          });
        });
      }

      set((state) => ({
        students: cloudStudents && cloudStudents.length > 0 ? cloudStudents : state.students,
        courses: cloudCourses && cloudCourses.length > 0 ? cloudCourses : state.courses,
        results: mappedResults && mappedResults.length > 0 ? mappedResults : state.results,
        academicPolicy: cloudPolicy ?? state.academicPolicy,
        activeSystemSession: cloudSession ?? state.activeSystemSession,
        adminSelectedSession: cloudSession ?? state.adminSelectedSession,
        adminAccessKey: cloudAdminKey ?? state.adminAccessKey,
      }));
    } catch (err) {
      console.warn('[Supabase Cloud] Initialization error:', err);
    }
  },

  // ─── Admin Navigation ────────────────────────────────────────────────────

  setActiveSystemSession: (session) => {
    set({ activeSystemSession: session, adminSelectedSession: session, adminSelectedCourseId: null });
    saveSystemConfigToCloud(session).catch(console.error);
  },
  setAdminView: (view) => set({ adminView: view }),
  setAdminSelectedLevel: (level) => set({ adminSelectedLevel: level, adminSelectedCourseId: null }),
  setAdminSelectedSemester: (sem) => set({ adminSelectedSemester: sem, adminSelectedCourseId: null }),
  setAdminSelectedCourseId: (id) => set({ adminSelectedCourseId: id }),
  setAdminSelectedSession: (session) => set({ adminSelectedSession: session, adminSelectedCourseId: null }),
  updateAcademicPolicy: (policy) => {
    set({ academicPolicy: policy });
    saveAcademicPolicyToCloud(policy).catch(console.error);
    get().addNotification('success', 'Academic Policy & Assessment Ratios saved successfully.');
  },
  updateAdminKey: (newKey) => {
    set({ adminAccessKey: newKey });
    updateAdminKeyInCloud(newKey).catch(console.error);
    get().addNotification('success', 'Admin Access Key updated successfully.');
  },

  // ─── Roster Actions ──────────────────────────────────────────────────────

  addStudent: ({ sequenceNo, surname, otherNames, entrySession }) => {
    const policy = get().academicPolicy;
    const prefix = policy.matricPrefix || 'UI/SONUCH/UTME/';
    const fullMatric = `${prefix}${sequenceNo}`;

    const cleanSurname = surname.trim();
    const cleanOtherNames = otherNames.trim();
    const computedFullName = `${cleanSurname} ${cleanOtherNames}`;
    const firstName = cleanOtherNames.split(' ')[0] || cleanSurname;
    const lastName = cleanSurname;
    const initials = `${cleanSurname[0] || ''}${cleanOtherNames[0] || ''}`.toUpperCase() || 'ST';

    const activeSys = get().activeSystemSession;
    const calcLvl = calculateCurrentLevel(entrySession, activeSys);
    const startLevel = calcLvl === 'Alumni' ? '500L' : calcLvl;
    const entryYear = parseInt(entrySession.split('/')[0], 10) || new Date().getFullYear();

    const newStudent: Student = {
      id: `stu-${Date.now()}`,
      matricNo: fullMatric,
      sequenceNo,
      surname: cleanSurname,
      otherNames: cleanOtherNames,
      fullName: computedFullName,
      firstName,
      lastName,
      level: startLevel,
      department: 'Nursing Science',
      email: '',
      phone: '',
      dateOfBirth: '',
      stateOfOrigin: '',
      lga: '',
      nationality: 'Nigerian',
      enrollmentYear: entryYear,
      entrySession,
      pin: '12345',
      avatarInitials: initials,
      gender: 'Female',
    };
    set((state) => ({ students: [...state.students, newStudent] }));
    saveStudentToCloud(newStudent).catch(console.error);
    get().addNotification('success', `Student "${computedFullName}" enrolled as ${fullMatric} (${startLevel}).`);
  },

  updateStudentAdmin: (studentId, { surname, otherNames, entrySession }) => {
    const cleanSurname = surname.trim();
    const cleanOtherNames = otherNames.trim();
    const computedFullName = `${cleanSurname} ${cleanOtherNames}`;
    const firstName = cleanOtherNames.split(' ')[0] || cleanSurname;
    const lastName = cleanSurname;

    const activeSys = get().activeSystemSession;
    const calcLvl = calculateCurrentLevel(entrySession, activeSys);
    const startLevel = calcLvl === 'Alumni' ? '500L' : calcLvl;

    let updatedTargetStudent: Student | null = null;

    set((state) => ({
      students: state.students.map((s) => {
        if (s.id !== studentId) return s;
        const updated = {
          ...s,
          surname: cleanSurname,
          otherNames: cleanOtherNames,
          fullName: computedFullName,
          firstName,
          lastName,
          entrySession,
          level: startLevel,
        };
        updatedTargetStudent = updated;
        return updated;
      }),
    }));
    if (updatedTargetStudent) {
      saveStudentToCloud(updatedTargetStudent).catch(console.error);
    }
    get().addNotification('success', `Updated record for "${computedFullName}".`);
  },

  resetStudentPin: (studentId) => {
    let updatedTargetStudent: Student | null = null;
    set((state) => ({
      students: state.students.map((s) => {
        if (s.id !== studentId) return s;
        const updated = { ...s, pin: '12345' };
        updatedTargetStudent = updated;
        return updated;
      }),
    }));
    if (updatedTargetStudent) {
      saveStudentToCloud(updatedTargetStudent).catch(console.error);
    }
    get().addNotification('info', 'Student PIN reset to default: 12345');
  },

  deleteStudent: (studentId) => {
    set((state) => ({
      students: state.students.filter((s) => s.id !== studentId),
    }));
    get().addNotification('warning', 'Student record deleted.');
  },

  // ─── Course Actions ──────────────────────────────────────────────────────

  addCourse: (course) => {
    const newCourse: Course = {
      ...course,
      id: `crs-${Date.now()}`,
      status: 'active',
    };
    set((state) => ({ courses: [...state.courses, newCourse] }));
    saveCourseToCloud(newCourse).catch(console.error);
    get().addNotification('success', `Course "${course.title}" added.`);
  },

  updateCourse: (id, updates) => {
    let updatedCourse: Course | null = null;
    set((state) => ({
      courses: state.courses.map((c) => {
        if (c.id !== id) return c;
        const updated = { ...c, ...updates };
        updatedCourse = updated;
        return updated;
      }),
    }));
    if (updatedCourse) {
      saveCourseToCloud(updatedCourse).catch(console.error);
    }
    get().addNotification('success', 'Course updated successfully.');
  },

  deleteCourse: (id) => {
    set((state) => ({ courses: state.courses.filter((c) => c.id !== id) }));
    deleteCourseFromCloud(id).catch(console.error);
    get().addNotification('warning', 'Course deleted.');
  },

  // ─── Score Entry ─────────────────────────────────────────────────────────

  setDraftScore: (studentId, courseId, field, value) => {
    set((state) => {
      const existing = state.draftScores.find(
        (d) => d.studentId === studentId && d.courseId === courseId
      );
      if (existing) {
        return {
          draftScores: state.draftScores.map((d) =>
            d.studentId === studentId && d.courseId === courseId
              ? { ...d, [field]: value }
              : d
          ),
        };
      }
      return {
        draftScores: [
          ...state.draftScores,
          { studentId, courseId, caScore: null, examScore: null, [field]: value },
        ],
      };
    });
  },

  getDraftScore: (studentId, courseId) => {
    return get().draftScores.find(
      (d) => d.studentId === studentId && d.courseId === courseId
    );
  },

  saveDraft: () => {
    get().addNotification('info', 'Draft scores saved successfully.');
  },

  publishResults: (level, semester) => {
    const { students, draftScores, courses, results, adminSelectedSession } = get();
    const session = adminSelectedSession;
    const levelCourses = courses.filter(
      (c) => c.level === level && c.semester === semester && c.status === 'active'
    );

    const newResults: SemesterResult[] = [];
    const cloudRowsToPublish: CloudResultRow[] = [];
    const nowISO = new Date().toISOString();

    students.forEach((student) => {
      // Match existing result by session + level + semester
      const existingResult = results.find(
        (r) =>
          r.studentId === student.id &&
          r.academicSession === session &&
          r.level === level &&
          r.semester === semester
      );

      const courseResults = levelCourses.map((course) => {
        const draft = draftScores.find(
          (d) => d.studentId === student.id && d.courseId === course.id
        );

        // Use draft scores if present, otherwise existing published scores for this session
        let ca: number | null = draft?.caScore ?? null;
        let exam: number | null = draft?.examScore ?? null;

        if (ca === null && existingResult) {
          const existing = existingResult.courses.find((c) => c.courseId === course.id);
          ca = existing?.caScore ?? null;
          exam = existing?.examScore ?? null;
        }

        const total = ca !== null && exam !== null ? ca + exam : null;
        const grade = total !== null ? calcGrade(total) : null;
        const gp = grade !== null ? calcGradePoint(grade) : null;

        if (ca !== null && exam !== null && total !== null && grade !== null && gp !== null) {
          const rowId = `res-${student.id}-${course.id}-${session.replace('/', '_')}`;
          cloudRowsToPublish.push({
            id: rowId,
            student_id: student.id,
            course_id: course.id,
            academic_session: session,
            level,
            semester,
            ca_score: ca,
            exam_score: exam,
            total_score: total,
            grade,
            grade_point: gp,
            is_published: true,
            published_at: nowISO,
          });
        }

        return {
          courseId: course.id,
          courseCode: course.code,
          courseTitle: course.title,
          creditUnits: course.creditUnits,
          caScore: ca,
          examScore: exam,
          totalScore: total,
          grade,
          gradePoint: gp,
          qualityPoint: gp !== null ? +(gp * course.creditUnits).toFixed(2) : null,
        };
      });

      const validCourses = courseResults.filter((c) => c.totalScore !== null);
      const totalCU = validCourses.reduce((s, c) => s + c.creditUnits, 0);
      const totalQP = validCourses.reduce((s, c) => s + (c.qualityPoint ?? 0), 0);

      const newResult: SemesterResult = {
        id: existingResult?.id ?? `res-${Date.now()}-${student.id}`,
        studentId: student.id,
        level,
        semester,
        academicSession: session,
        isPublished: true,
        publishedAt: nowISO,
        courses: courseResults,
        totalCreditUnits: totalCU,
        totalQualityPoints: +totalQP.toFixed(2),
        sgpa: totalCU > 0 ? +(totalQP / totalCU).toFixed(2) : 0,
      };

      newResults.push(newResult);
    });

    set((state) => {
      // Only replace results matching the same session + level + semester
      const filtered = state.results.filter(
        (r) => !(r.academicSession === session && r.level === level && r.semester === semester)
      );
      return { results: [...filtered, ...newResults], draftScores: [] };
    });

    if (cloudRowsToPublish.length > 0) {
      saveResultRowsToCloud(cloudRowsToPublish).catch(console.error);
    }

    get().addNotification(
      'success',
      `Results for ${session} · ${level} Semester ${semester} published to all student portals.`
    );
  },

  deleteStudentCourseResult: (studentId, courseId, level, semester, session) => {
    set((state) => {
      const updatedResults = state.results.map((r) => {
        if (
          r.studentId === studentId &&
          r.level === level &&
          r.semester === semester &&
          r.academicSession === session
        ) {
          const filteredCourses = r.courses.filter((c) => c.courseId !== courseId);
          const validCourses = filteredCourses.filter((c) => c.totalScore !== null);
          const totalCU = validCourses.reduce((s, c) => s + c.creditUnits, 0);
          const totalQP = validCourses.reduce((s, c) => s + (c.qualityPoint ?? 0), 0);

          return {
            ...r,
            courses: filteredCourses,
            totalCreditUnits: totalCU,
            totalQualityPoints: +totalQP.toFixed(2),
            sgpa: totalCU > 0 ? +(totalQP / totalCU).toFixed(2) : 0,
          };
        }
        return r;
      });

      const filteredDrafts = state.draftScores.filter(
        (d) => !(d.studentId === studentId && d.courseId === courseId)
      );

      return { results: updatedResults, draftScores: filteredDrafts };
    });

    const rowId = `res-${studentId}-${courseId}-${session.replace('/', '_')}`;
    deleteResultFromCloud(rowId).catch(console.error);

    get().addNotification('warning', 'Student course result deleted successfully.');
  },

  // ─── Notifications ───────────────────────────────────────────────────────

  addNotification: (type, message) => {
    const id = `notif-${Date.now()}`;
    set((state) => ({
      notifications: [...state.notifications, { id, type, message, timestamp: Date.now() }],
    }));
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, 4000);
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  // ─── Dev Toggle ──────────────────────────────────────────────────────────

  setPortalOverride: (portal) => set({ portalOverride: portal }),

  // ─── Theme ───────────────────────────────────────────────────────────
  setTheme: (theme) => set({ theme }),
}));
