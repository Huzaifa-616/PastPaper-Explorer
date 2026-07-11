import React, { useMemo } from 'react';
import { TrendingDown, ArrowRight, Target } from 'lucide-react';
import { computeTopicStats } from '../utils/performance';

// "Your weakest topics" — the diagnose→fix loop. Reads the student's own MCQ
// history (already recorded by the Solver), shows where accuracy is lowest,
// and jumps straight to that topic's questions.
const AccuracyBar = ({ pct }) => {
  const color = pct < 50 ? 'var(--rose)' : pct < 75 ? 'var(--amber)' : 'var(--green)';
  return (
    <div style={{ flex: 1, height: 6, background: 'var(--surface3)', borderRadius: 100, overflow: 'hidden' }}>
      <div style={{ width: `${Math.max(pct, 4)}%`, height: '100%', background: color, borderRadius: 100, transition: 'width 0.4s ease' }} />
    </div>
  );
};

const WeakTopics = ({ topicalDb, subjectCode, onJumpToTopic }) => {
  const stats = useMemo(
    () => computeTopicStats(topicalDb, subjectCode),
    [topicalDb, subjectCode]
  );

  const weak = stats.filter(s => s.accuracy < 80).slice(0, 3);
  const totalAnswered = stats.reduce((n, s) => n + s.attempted, 0);

  // No MCQ history yet for this subject → gentle nudge instead of empty panel
  if (totalAnswered < 5) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--surface2)', border: '1px dashed var(--line2)', borderRadius: 14, marginBottom: 16 }}>
        <Target size={18} color="var(--text3)" />
        <p style={{ fontSize: 12.5, color: 'var(--text3)', lineHeight: 1.5 }}>
          Solve MCQ papers with the Solver and your weakest topics will appear here — with questions to fix them.
        </p>
      </div>
    );
  }

  // History exists but nothing weak — earned praise, honestly
  if (weak.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--surface2)', border: '1px solid var(--line2)', borderRadius: 14, marginBottom: 16 }}>
        <Target size={18} color="var(--green)" />
        <p style={{ fontSize: 12.5, color: 'var(--text2)' }}>
          Strong across the board — every practiced topic is at 80%+ accuracy. Keep going.
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--line2)', borderRadius: 14, padding: 16, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <TrendingDown size={15} color="var(--rose)" />
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text2)' }}>
          Your weakest topics
        </span>
        <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 'auto' }}>{totalAnswered} answers analysed</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {weak.map(s => (
          <button
            key={s.topic}
            onClick={() => onJumpToTopic && onJumpToTopic(s.topic)}
            title={`Practice ${s.topic}`}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--surface)', border: '1px solid var(--line2)', borderRadius: 10, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text3)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line2)'; }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.topic}</span>
                <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 'auto', flexShrink: 0 }}>
                  {s.correct}/{s.attempted} · {s.accuracy}%
                </span>
              </div>
              <AccuracyBar pct={s.accuracy} />
            </div>
            <ArrowRight size={14} color="var(--text3)" style={{ flexShrink: 0 }} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default WeakTopics;
