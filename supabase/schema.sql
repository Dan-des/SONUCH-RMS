-- ==============================================================================
-- UCH RESULT MANAGEMENT SYSTEM (SONUCH) — SUPABASE CLOUD POSTGRESQL SCHEMA
-- ==============================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. STUDENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.students (
    id VARCHAR(255) PRIMARY KEY,
    surname VARCHAR(255) NOT NULL,
    other_names VARCHAR(255) NOT NULL,
    matric_no VARCHAR(255) UNIQUE NOT NULL,
    entry_session VARCHAR(50) NOT NULL,
    pin VARCHAR(50) DEFAULT '12345',
    avatar_url TEXT,
    avatar_initials VARCHAR(10),
    gender VARCHAR(20),
    dob VARCHAR(50),
    state_of_origin VARCHAR(100),
    lga VARCHAR(100),
    nationality VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. COURSES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.courses (
    id VARCHAR(255) PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    credit_units INT NOT NULL CHECK (credit_units > 0),
    level VARCHAR(20) NOT NULL,
    semester INT NOT NULL CHECK (semester IN (1, 2)),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. RESULTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.results (
    id VARCHAR(255) PRIMARY KEY,
    student_id VARCHAR(255) NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    course_id VARCHAR(255) NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    academic_session VARCHAR(50) NOT NULL,
    level VARCHAR(20) NOT NULL,
    semester INT NOT NULL CHECK (semester IN (1, 2)),
    ca_score NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (ca_score >= 0),
    exam_score NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (exam_score >= 0),
    total_score NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (total_score >= 0),
    grade VARCHAR(10) NOT NULL,
    grade_point NUMERIC(3, 2) NOT NULL DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_student_course_session UNIQUE (student_id, course_id, academic_session)
);

-- ------------------------------------------------------------------------------
-- 4. ACADEMIC POLICIES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.academic_policies (
    id VARCHAR(255) PRIMARY KEY DEFAULT 'default',
    matric_prefix VARCHAR(100) DEFAULT 'UI/SONUCH/UTME/',
    max_system_level VARCHAR(20) DEFAULT '500L',
    max_ca INT DEFAULT 30,
    max_exam INT DEFAULT 70,
    grade_boundaries JSONB DEFAULT '[
        {"id": "b1", "grade": "A", "minScore": 70, "maxScore": 100, "gradePoint": 5.0, "remark": "Excellent"},
        {"id": "b2", "grade": "B", "minScore": 60, "maxScore": 69, "gradePoint": 4.0, "remark": "Very Good"},
        {"id": "b3", "grade": "C", "minScore": 50, "maxScore": 59, "gradePoint": 3.0, "remark": "Good"},
        {"id": "b4", "grade": "D", "minScore": 45, "maxScore": 49, "gradePoint": 2.0, "remark": "Fair"},
        {"id": "b5", "grade": "F", "minScore": 0, "maxScore": 44, "gradePoint": 0.0, "remark": "Fail"}
    ]'::jsonb,
    is_configured BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. SYSTEM CONFIG TABLE (KEY-VALUE MODEL)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.system_config (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Allow anonymous / public read & write access for app functions
CREATE POLICY "Public Students Access" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Courses Access" ON public.courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Results Access" ON public.results FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Academic Policies Access" ON public.academic_policies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public System Config Access" ON public.system_config FOR ALL USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 7. INITIAL SEED DATA
-- ------------------------------------------------------------------------------
INSERT INTO public.system_config (key, value)
VALUES 
    ('active_session', '2025/2026'),
    ('admin_access_key', 'UCH-ADMIN-2026-KEY')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.academic_policies (id, matric_prefix, max_system_level, max_ca, max_exam, is_configured)
VALUES ('default', 'UI/SONUCH/UTME/', '500L', 30, 70, true)
ON CONFLICT (id) DO NOTHING;
