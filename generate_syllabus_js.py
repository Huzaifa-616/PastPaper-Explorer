"""
The Nexus - Generate the frontend syllabus.js from the Python taxonomy.
======================================================================
Run this whenever you change syllabus_taxonomy.py. It rewrites
src/config/syllabus.js so the UI's topic names ALWAYS match the keys the
slicer files questions under — eliminating the "No data yet" drift bug for good.

Usage:  python generate_syllabus_js.py
"""
from syllabus_taxonomy import SYLLABUS
import json, os

TITLES = {
    '9618': {'1':'AS Level Theory','2':'AS Problem Solving','3':'A Level Advanced Theory','4':'A Level Practical'},
    '9702': {'1':'AS Level Theory (MCQ)','2':'AS Level Structured','4':'A Level Structured','5':'A Level Practical'},
    '9701': {'1':'AS Level Theory (MCQ)','2':'AS Level Structured','4':'A Level Structured','5':'A Level Practical'},
    '9700': {'1':'AS Level Theory (MCQ)','2':'AS Level Structured','4':'A Level Structured','5':'A Level Practical'},
    '9709': {'1':'Pure Mathematics 1','2':'Pure Mathematics 2','3':'Pure Mathematics 3','4':'Mechanics','5':'Probability & Statistics 1','6':'Probability & Statistics 2'},
    '9231': {'1':'Further Pure 1','2':'Further Pure 2','3':'Further Mechanics','4':'Further Probability & Statistics'},
}
ORDER = ['9618','9702','9701','9700','9709','9231']

def main():
    lines = ['// ─── Topical Taxonomy (AUTO-GENERATED — do not hand-edit) ───',
             '// Generated from syllabus_taxonomy.py by generate_syllabus_js.py.',
             '// Topic names MUST match the Python taxonomy keys exactly, or the UI',
             '// shows "No data yet". To change topics, edit the Python file and re-run',
             '//   python generate_syllabus_js.py',
             'export const SYLLABUS_STRUCTURE = {']
    for s in ORDER:
        if s not in SYLLABUS: continue
        lines.append(f"  '{s}': {{")
        for p in sorted(SYLLABUS[s]):
            topics = list(SYLLABUS[s][p]['topics'].keys())
            title = TITLES.get(s,{}).get(p, SYLLABUS[s][p].get('title','Paper '+p))
            topics_js = ', '.join(json.dumps(t) for t in topics)
            lines.append(f"    '{p}': {{ title: {json.dumps(title)}, topics: [{topics_js}] }},")
        lines.append('  },')
    lines.append('};')
    out = os.path.join('src','config','syllabus.js')
    open(out,'w').write('\n'.join(lines)+'\n')
    n = sum(len(SYLLABUS[s][p]['topics']) for s in SYLLABUS for p in SYLLABUS[s])
    print(f"Wrote {out}: {len(SYLLABUS)} subjects, {n} topics — all names now match the DB.")

if __name__ == '__main__':
    main()
