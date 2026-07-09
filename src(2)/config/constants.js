// ─── The Nexus · Global Config ───
export const SUBJECTS = [
  { code: '9709', name: 'Mathematics' },
  { code: '9618', name: 'Computer Science' },
  { code: '9701', name: 'Chemistry' },
  { code: '9702', name: 'Physics' },
  { code: '9700', name: 'Biology' },
  { code: '9231', name: 'Further Mathematics' },
];                                // update this after adding more pastpapers
export const YEARS         = Array.from({ length: 7 }, (_, i) => (2026 - i).toString());
export const SEASONS       = [{ code: 'm', name: 'March' }, { code: 's', name: 'Summer' }, { code: 'w', name: 'Winter' }];
export const PAPERS        = ['1', '2', '3', '4', '5', '6'];
export const VARIANTS      = ['1', '2', '3'];
export const MCQ_SUBJECTS  = ['9700', '9701', '9702']; 
export const MCQ_PAPER     = '1';
export const MCQ_COUNT     = 40;
export const MCQ_OPTS      = ['A', 'B', 'C', 'D'];

export const GITHUB_REPO_URL = "https://github.com/Huzaifa-616/PastPaper-Explorer";

export const subjectName  = (code) => SUBJECTS.find(s => s.code === code)?.name || code;
