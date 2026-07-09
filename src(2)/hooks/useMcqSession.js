import { useState, useEffect, useCallback } from 'react';
import { MCQ_COUNT } from '../config/constants';

const STORAGE_KEY = 'nexusMcqSessions';

const emptyState = () => ({ choices: Array(MCQ_COUNT).fill(''), revealed: false });

// MCQ attempts, persisted to localStorage.
// UPGRADE from the old in-memory version: a student's bubbled answers now
// survive refreshes and revisits. This is also the raw data source for the
// future "weakest topics" analytics — every attempt is already being recorded.
export function useMcqSession(paperKey) {
  const [sessions, setSessions] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch { return {}; }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions)); }
    catch { /* storage full or unavailable — degrade silently */ }
  }, [sessions]);

  const mcqState = sessions[paperKey] || emptyState();

  const updateMcqState = useCallback((updates) => {
    setSessions(prev => ({
      ...prev,
      [paperKey]: { ...(prev[paperKey] || emptyState()), ...updates, updatedAt: Date.now() },
    }));
  }, [paperKey]);

  return { mcqState, updateMcqState, allSessions: sessions };
}
