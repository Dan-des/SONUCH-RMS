import { supabase, isSupabaseConfigured } from './supabase';
import { Student, Course, AcademicPolicy } from '../types';

export interface CloudResultRow {
  id: string;
  student_id: string;
  course_id: string;
  academic_session: string;
  level: string;
  semester: number;
  ca_score: number;
  exam_score: number;
  total_score: number;
  grade: string;
  grade_point: number;
  is_published: boolean;
  published_at?: string;
}

// ==============================================================================
// 1. STUDENTS SERVICE
// ==============================================================================
export const fetchStudentsFromCloud = async (): Promise<Student[] | null> => {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Supabase API Error [students.select]:", error);
      return null;
    }

    return (data || []).map((row: Record<string, any>) => {
      const surname = row.surname || '';
      const otherNames = row.other_names || '';
      const computedFullName = `${surname} ${otherNames}`.trim();
      const firstName = otherNames.split(' ')[0] || surname;
      const lastName = surname;
      const initials = `${surname[0] || ''}${otherNames[0] || ''}`.toUpperCase() || 'ST';

      return {
        id: row.id,
        matricNo: row.matric_no,
        sequenceNo: row.matric_no?.split('/')?.pop() || '',
        surname,
        otherNames,
        fullName: computedFullName,
        firstName,
        lastName,
        level: (row.level || '100L') as any,
        department: 'Nursing Science',
        email: row.email || '',
        phone: row.phone || '',
        dateOfBirth: row.dob || '',
        stateOfOrigin: row.state_of_origin || '',
        lga: row.lga || '',
        nationality: row.nationality || 'Nigerian',
        enrollmentYear: parseInt(row.entry_session?.split('/')?.[0] || '2025', 10),
        entrySession: row.entry_session || '2025/2026',
        pin: row.pin || '12345',
        avatarInitials: row.avatar_initials || initials,
        avatarUrl: row.avatar_url || undefined,
        gender: row.gender || 'Female',
      };
    });
  } catch (err) {
    console.error("Supabase API Exception [students.select]:", err);
    return null;
  }
};

export const saveStudentToCloud = async (student: Student): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload = {
      id: student.id,
      surname: student.surname,
      other_names: student.otherNames,
      matric_no: student.matricNo,
      entry_session: student.entrySession,
      pin: student.pin,
      avatar_url: student.avatarUrl || null,
      avatar_initials: student.avatarInitials || null,
      gender: student.gender || null,
      dob: student.dateOfBirth || null,
      state_of_origin: student.stateOfOrigin || null,
      lga: student.lga || null,
      nationality: student.nationality || null,
      phone: student.phone || null,
      email: student.email || null,
    };
    console.log("Supabase Request Payload [students.upsert]:", payload);

    const { error } = await supabase.from('students').upsert(payload);

    if (error) {
      console.error("Supabase API Error [students.upsert]:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Supabase API Exception [students.upsert]:", err);
    return false;
  }
};

export const updateStudentPinInCloud = async (studentId: string, newPin: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    console.log("Supabase Request Payload [students.update pin]:", { studentId, newPin });
    const { error } = await supabase
      .from('students')
      .update({ pin: newPin })
      .eq('id', studentId);

    if (error) {
      console.error("Supabase API Error [students.update pin]:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Supabase API Exception [students.update pin]:", err);
    return false;
  }
};

export const updateStudentAvatarInCloud = async (studentId: string, avatarUrl: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    console.log("Supabase Request Payload [students.update avatar_url]:", { studentId });
    const { error } = await supabase
      .from('students')
      .update({ avatar_url: avatarUrl })
      .eq('id', studentId);

    if (error) {
      console.error("Failed to update student avatar in Supabase:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Exception updating student avatar in Supabase:", err);
    return false;
  }
};

export const updateStudentProfileInCloud = async (studentId: string, profileData: Partial<Student>): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload = {
      email: profileData.email || null,
      phone: profileData.phone || null,
      dob: profileData.dateOfBirth || null,
      state_of_origin: profileData.stateOfOrigin || null,
      lga: profileData.lga || null,
      nationality: profileData.nationality || null,
      gender: profileData.gender || null,
    };
    console.log("Supabase Request Payload [students.update profile]:", { studentId, ...payload });

    const { error } = await supabase
      .from('students')
      .update(payload)
      .eq('id', studentId);

    if (error) {
      console.error("Failed to update student profile in Supabase:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Exception updating student profile in Supabase:", err);
    return false;
  }
};

// ==============================================================================
// 2. COURSES SERVICE
// ==============================================================================
export const fetchCoursesFromCloud = async (): Promise<Course[] | null> => {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Supabase API Error [courses.select]:", error);
      return null;
    }

    return (data || []).map((row: Record<string, any>) => ({
      id: row.id,
      code: row.code,
      title: row.title,
      creditUnits: row.credit_units,
      level: row.level,
      semester: row.semester,
      status: 'active',
    }));
  } catch (err) {
    console.error("Supabase API Exception [courses.select]:", err);
    return null;
  }
};

export const saveCourseToCloud = async (course: Course): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload = {
      id: course.id,
      code: course.code,
      title: course.title,
      credit_units: course.creditUnits,
      level: course.level,
      semester: course.semester,
    };
    console.log("Supabase Request Payload [courses.upsert]:", payload);

    const { error } = await supabase.from('courses').upsert(payload);

    if (error) {
      console.error("Supabase API Error [courses.upsert]:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Supabase API Exception [courses.upsert]:", err);
    return false;
  }
};

export const deleteCourseFromCloud = async (courseId: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    console.log("Supabase Request Delete [courses.delete]:", courseId);
    const { error } = await supabase.from('courses').delete().eq('id', courseId);
    if (error) {
      console.error("Supabase API Error [courses.delete]:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Supabase API Exception [courses.delete]:", err);
    return false;
  }
};

// ==============================================================================
// 3. RESULTS SERVICE
// ==============================================================================
export const fetchRawResultsFromCloud = async (): Promise<CloudResultRow[] | null> => {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Supabase API Error [results.select]:", error);
      return null;
    }

    return (data || []).map((row: Record<string, any>) => ({
      id: row.id,
      student_id: row.student_id,
      course_id: row.course_id,
      academic_session: row.academic_session,
      level: row.level,
      semester: row.semester,
      ca_score: Number(row.ca_score),
      exam_score: Number(row.exam_score),
      total_score: Number(row.total_score),
      grade: row.grade,
      grade_point: Number(row.grade_point),
      is_published: row.is_published,
      published_at: row.published_at || undefined,
    }));
  } catch (err) {
    console.error("Supabase API Exception [results.select]:", err);
    return null;
  }
};

export const saveResultRowsToCloud = async (rows: CloudResultRow[]): Promise<boolean> => {
  if (!isSupabaseConfigured() || rows.length === 0) return false;
  try {
    const resultPayload = rows.map((r) => ({
      id: r.id,
      student_id: r.student_id,
      course_id: r.course_id,
      academic_session: r.academic_session,
      level: r.level,
      semester: r.semester,
      ca_score: r.ca_score,
      exam_score: r.exam_score,
      total_score: r.total_score,
      grade: r.grade,
      grade_point: r.grade_point,
      is_published: r.is_published,
      published_at: r.published_at || new Date().toISOString(),
    }));

    console.log("Publish Result Payload:", resultPayload);

    const { data, error } = await supabase.from('results').upsert(resultPayload);

    if (error) {
      console.error("Result DB Error:", error);
      return false;
    }
    console.log("Publish Result Success [results.upsert]:", data);
    return true;
  } catch (err) {
    console.error("Supabase API Exception [results.upsert]:", err);
    return false;
  }
};

export const deleteResultFromCloud = async (resultId: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    console.log("Supabase Request Delete [results.delete]:", resultId);
    const { error } = await supabase.from('results').delete().eq('id', resultId);

    if (error) {
      console.error("Result DB Delete Error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Supabase API Exception [results.delete]:", err);
    return false;
  }
};

// ==============================================================================
// 4. ACADEMIC POLICY SERVICE
// ==============================================================================
export const fetchAcademicPolicyFromCloud = async (): Promise<AcademicPolicy | null> => {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('academic_policies')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    if (error || !data) return null;

    return {
      matricPrefix: data.matric_prefix,
      maxSystemLevel: data.max_system_level,
      maxCA: data.max_ca,
      maxExam: data.max_exam,
      gradeBoundaries: typeof data.grade_boundaries === 'string' ? JSON.parse(data.grade_boundaries) : data.grade_boundaries,
      isConfigured: data.is_configured,
    };
  } catch (err) {
    console.error("Supabase API Exception [academic_policies.select]:", err);
    return null;
  }
};

export const saveAcademicPolicyToCloud = async (policy: AcademicPolicy): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload = {
      id: 'default',
      matric_prefix: policy.matricPrefix,
      max_system_level: policy.maxSystemLevel,
      max_ca: policy.maxCA,
      max_exam: policy.maxExam,
      grade_boundaries: policy.gradeBoundaries,
      is_configured: policy.isConfigured,
      updated_at: new Date().toISOString(),
    };
    console.log("Supabase Request Payload [academic_policies.upsert]:", payload);

    const { error } = await supabase.from('academic_policies').upsert(payload);

    if (error) {
      console.error("Supabase API Error [academic_policies.upsert]:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Supabase API Exception [academic_policies.upsert]:", err);
    return false;
  }
};

// ==============================================================================
// 5. SYSTEM CONFIG SERVICE
// ==============================================================================
export const fetchSystemConfigFromCloud = async (): Promise<string | null> => {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'active_session')
      .maybeSingle();

    if (error || !data) return null;
    return data.value;
  } catch (err) {
    console.error("Supabase API Exception [system_config.select active_session]:", err);
    return null;
  }
};

export const saveSystemConfigToCloud = async (activeSession: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload = {
      key: 'active_session',
      value: activeSession,
      updated_at: new Date().toISOString(),
    };
    console.log("Supabase Request Payload [system_config.upsert active_session]:", payload);

    const { error } = await supabase.from('system_config').upsert(payload);

    if (error) {
      console.error("Supabase API Error [system_config.upsert active_session]:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Supabase API Exception [system_config.upsert active_session]:", err);
    return false;
  }
};

export const fetchAdminKeyFromCloud = async (): Promise<string | null> => {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'admin_access_key')
      .maybeSingle();

    if (error || !data) return null;
    return data.value;
  } catch (err) {
    console.error("Supabase API Exception [system_config.select admin_access_key]:", err);
    return null;
  }
};

export const updateAdminKeyInCloud = async (newKey: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload = {
      key: 'admin_access_key',
      value: newKey,
      updated_at: new Date().toISOString(),
    };
    console.log("Supabase Request Payload [system_config.upsert admin_access_key]:", payload);

    const { error } = await supabase.from('system_config').upsert(payload);

    if (error) {
      console.error("Supabase API Error [system_config.upsert admin_access_key]:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Supabase API Exception [system_config.upsert admin_access_key]:", err);
    return false;
  }
};
