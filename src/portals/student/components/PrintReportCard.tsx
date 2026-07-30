import type { Student, SemesterResult, Level } from '../../../types';
import { calculateCurrentLevel } from '../../../types';
import { computeCGPA } from '../../../data/mockResults';

// ─── Brand colours for the printed document ───────────────────────────────────
const OG = '#2d5a27';   // olive-green primary
const OG2 = '#3d7a35';  // olive-green secondary
const OG_LIGHT = '#e8f5e3';  // tinted bg
const OG_BORDER = '#b0cca8'; // border

const LEVEL_ORDER: Array<SemesterResult['level']> = ['100L', '200L', '300L', '400L', '500L'];

// ─── Props ────────────────────────────────────────────────────────────────────

export type PrintScope =
  | { mode: 'full' }                           // all published results
  | { mode: 'level'; level: Level }            // one full level (both semesters)
  | { mode: 'semester'; level: Level; semester: 1 | 2 }; // single semester

interface PrintReportCardProps {
  student: Student;
  results: SemesterResult[];
  scope?: PrintScope;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function docTitle(scope: PrintScope): string {
  switch (scope.mode) {
    case 'full':     return 'FULL ACADEMIC TRANSCRIPT';
    case 'level':    return `${scope.level} LEVEL ACADEMIC TRANSCRIPT`;
    case 'semester': return `SEMESTER STATEMENT OF RESULTS`;
  }
}

function docRef(student: Student, scope: PrintScope): string {
  const base = `UCH/NUR/${student.matricNo.replace(/\//g, '-')}`;
  if (scope.mode === 'full')     return `${base}/TR`;
  if (scope.mode === 'level')    return `${base}/${scope.level}/TR`;
  return `${base}/${scope.level}/S${scope.semester}/SR`;
}

function filterResults(results: SemesterResult[], scope: PrintScope): SemesterResult[] {
  const pub = results.filter((r) => r.isPublished);
  if (scope.mode === 'full') return pub;
  if (scope.mode === 'level') return pub.filter((r) => r.level === scope.level);
  return pub.filter((r) => r.level === scope.level && r.semester === scope.semester);
}

// ─── Cell style helpers (inline only — no Tailwind, guaranteed print safe) ───

const th = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  padding: '6px 9px',
  textAlign: 'left' as const,
  borderBottom: `1px solid ${OG_BORDER}`,
  background: OG_LIGHT,
  color: OG,
  fontWeight: 700,
  fontSize: 10,
  ...extra,
});

const td = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  padding: '5px 9px',
  fontSize: 10.5,
  verticalAlign: 'middle' as const,
  ...extra,
});

// ─── Result Table for one semester ────────────────────────────────────────────

function SemesterTable({ result }: { result: SemesterResult }) {
  return (
    <div style={{ marginBottom: 20, pageBreakInside: 'avoid' }}>
      {/* Section heading bar */}
      <div
        style={{
          background: OG,
          color: 'white',
          padding: '6px 12px',
          borderRadius: '6px 6px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 11,
          fontWeight: 700,
        }}
      >
        <span>
          {result.level} — Semester {result.semester} &nbsp;({result.academicSession})
        </span>
        <span>SGPA: {result.sgpa.toFixed(2)}</span>
      </div>

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: `1px solid ${OG_BORDER}`,
          fontSize: 10.5,
        }}
      >
        <thead>
          <tr>
            <th style={th()}>Course Code</th>
            <th style={th({ textAlign: 'left' })}>Course Title</th>
            <th style={th({ textAlign: 'center', width: 36 })}>C.U.</th>
            <th style={th({ textAlign: 'center', width: 44 })}>CA/30</th>
            <th style={th({ textAlign: 'center', width: 50 })}>Exam/70</th>
            <th style={th({ textAlign: 'center', width: 44 })}>Total</th>
            <th style={th({ textAlign: 'center', width: 36 })}>Grade</th>
            <th style={th({ textAlign: 'center', width: 36 })}>G.P.</th>
            <th style={th({ textAlign: 'center', width: 42 })}>Q.P.</th>
          </tr>
        </thead>
        <tbody>
          {result.courses.map((c, i) => (
            <tr key={c.courseId} style={{ background: i % 2 === 0 ? 'white' : '#f3f9f0' }}>
              <td style={td({ fontFamily: 'monospace', fontWeight: 700, color: OG2 })}>{c.courseCode}</td>
              <td style={td()}>{c.courseTitle}</td>
              <td style={td({ textAlign: 'center' })}>{c.creditUnits}</td>
              <td style={td({ textAlign: 'center' })}>{c.caScore ?? '—'}</td>
              <td style={td({ textAlign: 'center' })}>{c.examScore ?? '—'}</td>
              <td style={td({ textAlign: 'center', fontWeight: 700 })}>{c.totalScore ?? '—'}</td>
              <td
                style={td({
                  textAlign: 'center',
                  fontWeight: 700,
                  color: c.grade === 'A' ? '#15803d' : c.grade === 'F' ? '#dc2626' : OG,
                })}
              >
                {c.grade ?? '—'}
              </td>
              <td style={td({ textAlign: 'center' })}>{c.gradePoint?.toFixed(1) ?? '—'}</td>
              <td style={td({ textAlign: 'center' })}>{c.qualityPoint?.toFixed(2) ?? '—'}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ background: OG_LIGHT, fontWeight: 700, borderTop: `2px solid ${OG}` }}>
            <td colSpan={2} style={td({ color: OG })}>Semester Summary</td>
            <td style={td({ textAlign: 'center' })}>{result.totalCreditUnits}</td>
            <td colSpan={4} />
            <td colSpan={2} style={td({ textAlign: 'center' })}>
              {result.totalQualityPoints.toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PrintReportCard({
  student,
  results,
  scope = { mode: 'full' },
}: PrintReportCardProps) {
  const cgpa = computeCGPA(results);

  const filteredResults = filterResults(results, scope)
    .sort((a, b) => {
      const la = LEVEL_ORDER.indexOf(a.level);
      const lb = LEVEL_ORDER.indexOf(b.level);
      if (la !== lb) return la - lb;
      return a.semester - b.semester;
    });

  const printDate = new Date().toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Scope label for sub-heading
  const scopeLabel =
    scope.mode === 'semester'
      ? `${scope.level} — Semester ${scope.semester}`
      : scope.mode === 'level'
      ? `${scope.level} — Full Level Record`
      : 'Full Cumulative Academic Record';

  // SGPA for single-semester scope
  const singleSemResult =
    scope.mode === 'semester' ? filteredResults[0] : undefined;

  return (
    <div
      id="print-report-card"
      style={{
        fontFamily: 'Georgia, "Times New Roman", serif',
        background: 'white',
        color: '#111',
        padding: '28px 36px',
        maxWidth: '860px',
        margin: '0 auto',
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      } as React.CSSProperties}
    >
      {/* ── Official Header ────────────────────────────────────────────────── */}
      <div
        style={{
          borderBottom: `3px solid ${OG}`,
          paddingBottom: 14,
          marginBottom: 18,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        {/* Crest */}
        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${OG}, ${OG2})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: 17,
            flexShrink: 0,
            border: `2px solid ${OG_BORDER}`,
          }}
        >
          UCH
        </div>

        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: OG, lineHeight: 1.2 }}>
            School of Nursing, UCH Ibadan
          </h1>
          <p style={{ margin: '2px 0 0', fontSize: 10, color: OG2, fontWeight: 600 }}>
            In affiliation with University of Ibadan, Oyo
          </p>
          <h2
            style={{
              margin: '5px 0 0',
              fontSize: 12,
              fontWeight: 700,
              color: OG2,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {docTitle(scope)}
          </h2>
          {scope.mode !== 'full' && (
            <p style={{ margin: '2px 0 0', fontSize: 10.5, color: '#555', fontWeight: 600 }}>
              {scopeLabel}
            </p>
          )}
          <p style={{ margin: '5px 0 0', fontSize: 9.5, color: '#777' }}>
            PMB 5116, Queen Elizabeth Road, Ibadan, Oyo State, Nigeria
          </p>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ fontSize: 9, color: '#888', margin: 0 }}>Print Date:</p>
          <p style={{ fontSize: 11, color: '#333', margin: '2px 0 0', fontWeight: 700 }}>{printDate}</p>
          <p style={{ fontSize: 9, color: '#888', margin: '6px 0 0' }}>Document Ref:</p>
          <p style={{ fontSize: 9, color: '#333', margin: '2px 0 0', fontFamily: 'monospace' }}>
            {docRef(student, scope)}
          </p>
        </div>
      </div>

      {/* ── Student Bio ────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '7px 22px',
          background: OG_LIGHT,
          border: `1px solid ${OG_BORDER}`,
          borderRadius: 7,
          padding: '12px 16px',
          marginBottom: 18,
          fontSize: 11,
        }}
      >
        {[
          ['Student Name', student.fullName.toUpperCase()],
          ['Matriculation No.', student.matricNo],
          ['Academic Level', scope.mode !== 'full' ? scope.level : calculateCurrentLevel(student.entrySession, '2025/2026')],
          ['Department', student.department],
          ['Academic Year', `${student.enrollmentYear}/${student.enrollmentYear + 1}`],
          singleSemResult
            ? ['Semester GPA (SGPA)', `${singleSemResult.sgpa.toFixed(2)} / 5.00`]
            : ['Cumulative GPA (CGPA)', `${cgpa.toFixed(2)} / 5.00`],
        ].map(([label, value]) => (
          <div key={label}>
            <strong style={{ color: OG }}>{label}:</strong>{' '}
            <span style={{ fontFamily: label?.includes('No') || label?.includes('GPA') ? 'monospace' : 'inherit', fontWeight: label?.includes('GPA') ? 700 : 400 }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* ── Result Tables ──────────────────────────────────────────────────── */}
      {filteredResults.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#888', fontSize: 12, padding: '20px 0' }}>
          No published results available for this selection.
        </p>
      ) : (
        filteredResults.map((result) => (
          <SemesterTable key={result.id} result={result} />
        ))
      )}

      {/* ── CGPA Summary (only on multi-semester documents) ───────────────── */}
      {scope.mode !== 'semester' && filteredResults.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8, marginBottom: 24 }}>
          <div
            style={{
              border: `2px solid ${OG}`,
              borderRadius: 8,
              padding: '10px 24px',
              textAlign: 'center',
              background: OG_LIGHT,
            }}
          >
            <p style={{ margin: 0, fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Cumulative Grade Point Average
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 26, fontWeight: 700, color: OG }}>{cgpa.toFixed(2)}</p>
            <p style={{ margin: 0, fontSize: 10, color: '#888' }}>/ 5.00 Scale</p>
          </div>
        </div>
      )}

      {/* ── Grading Key ───────────────────────────────────────────────────── */}
      <div
        style={{
          border: `1px solid ${OG_BORDER}`,
          borderRadius: 6,
          padding: '9px 13px',
          marginBottom: 18,
          fontSize: 10,
          pageBreakInside: 'avoid',
        }}
      >
        <p style={{ margin: '0 0 5px', fontWeight: 700, color: OG }}>Grading Scale:</p>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
          {[
            ['A', '70–100', '5.0'],
            ['B', '60–69', '4.0'],
            ['C', '50–59', '3.0'],
            ['D', '45–49', '2.0'],
            ['E', '40–44', '1.0'],
            ['F', '0–39', '0.0'],
          ].map(([g, r, p]) => (
            <span key={g}>
              <strong style={{ color: g === 'F' ? '#dc2626' : g === 'A' ? '#15803d' : OG }}>{g}</strong>:{' '}
              {r} (G.P.={p})
            </span>
          ))}
        </div>
      </div>

      {/* ── Signature Block ───────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 28,
          pageBreakInside: 'avoid',
        }}
      >
        {['Student Signature', 'Head of Department', 'School Registrar'].map((label) => (
          <div key={label} style={{ textAlign: 'center', width: '28%' }}>
            <div style={{ borderBottom: '1px solid #444', height: 38, marginBottom: 6 }} />
            <p style={{ margin: 0, fontSize: 10, color: '#444' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* ── Footer Watermark ──────────────────────────────────────────────── */}
      <p
        style={{
          textAlign: 'center',
          marginTop: 22,
          fontSize: 8.5,
          color: '#bbb',
          borderTop: '1px solid #eee',
          paddingTop: 9,
        }}
      >
        This is a computer-generated official document. Any alteration renders it invalid.
        &nbsp;·&nbsp; UCH School of Nursing Result Management System v2.0
      </p>
    </div>
  );
}
