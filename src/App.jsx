import React from 'react';
import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import GlobalStyles from './styles/GlobalStyles';
import { useTheme } from './hooks/useTheme';
import { useDatabases } from './hooks/useDatabases';
import { SYLLABUS_STRUCTURE } from './config/syllabus';
import HubPage from './pages/HubPage';
import ExplorerPage, { buildPaperPath } from './pages/ExplorerPage';
import LibraryPage from './pages/LibraryPage';
import TopicalsPage from './pages/TopicalsPage';
import IndexerPage from './pages/IndexerPage';

// ─── Route wrappers ───────────────────────────────────────────────────────────
// These adapt the existing page components (which take callback props) to the
// router. The pages themselves stay untouched — navigation is wired here.

const HubRoute = ({ dark, toggleTheme }) => {
  const navigate = useNavigate();
  return (
    <HubPage
      dark={dark} toggleTheme={toggleTheme}
      onSelectExplorer={(subj) => navigate(subj ? `/papers?subject=${subj}` : '/papers')}
      onSelectTopicals={(subj) => navigate(subj ? `/topicals/${subj}` : '/topicals')}
      onSelectLibrary={(subj) => navigate(subj ? `/library/${subj}` : '/library')}
      onOpenIndexer={() => navigate('/indexer')}
    />
  );
};

const LibraryRoute = ({ dark, toggleTheme }) => {
  const navigate = useNavigate();
  const { subject } = useParams();
  const { libraryDb } = useDatabases();
  return (
    <LibraryPage
      initialSubject={subject || ''} libraryDb={libraryDb}
      onBackToHub={() => navigate('/')} toggleTheme={toggleTheme} dark={dark}
    />
  );
};

const TopicalsRoute = ({ dark, toggleTheme }) => {
  const navigate = useNavigate();
  const { subject } = useParams();
  const { topicalDb } = useDatabases();

  const handleSelectQuestion = (paperId, pageNum) => {
    const parts = paperId.replace('.pdf', '').split('_');
    if (parts.length < 4) return;
    navigate(buildPaperPath({
      subject: parts[0],
      season: parts[1][0],
      year: '20' + parts[1].slice(1),
      type: parts[2],
      paper: parts[3][0],
      variant: parts[3][1],
      page: pageNum,
    }));
  };

  return (
    <TopicalsPage
      initialSubject={subject || ''} topicalDb={topicalDb}
      onBackToHub={() => navigate('/')} toggleTheme={toggleTheme} dark={dark}
      onSelectQuestion={handleSelectQuestion}
    />
  );
};

const IndexerRoute = () => {
  const navigate = useNavigate();
  return <IndexerPage syllabusDb={SYLLABUS_STRUCTURE} onClose={() => navigate('/')} />;
};

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const { dark, toggleTheme } = useTheme();

  return (
    <>
      <GlobalStyles dark={dark} />
      <Routes>
        <Route path="/" element={<HubRoute dark={dark} toggleTheme={toggleTheme} />} />
        <Route path="/papers" element={<ExplorerPage dark={dark} toggleTheme={toggleTheme} />} />
        <Route path="/papers/:subject/:session/:type/:paperVariant" element={<ExplorerPage dark={dark} toggleTheme={toggleTheme} />} />
        <Route path="/library/:subject?" element={<LibraryRoute dark={dark} toggleTheme={toggleTheme} />} />
        <Route path="/topicals/:subject?" element={<TopicalsRoute dark={dark} toggleTheme={toggleTheme} />} />
        <Route path="/indexer" element={<IndexerRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
