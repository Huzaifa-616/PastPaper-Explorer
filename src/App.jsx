import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  BookOpen, ChevronDown, ChevronUp, Mail, X, Copy, Check,
  Play, Github, Terminal, ArrowLeft, Layers, Sun, Moon,
  NotebookPen, Lock, Plus, Trash2, FileText, Eye, EyeOff,
  Paperclip, ExternalLink, ListChecks, AlertCircle
} from 'lucide-react';

// ─── Config ───────────────────────────────────────────────────────────────────
const SUBJECTS = [
  { code: '9709', name: 'Mathematics' },
  { code: '9618', name: 'Computer Science' },
  { code: '9701', name: 'Chemistry' },
  { code: '9702', name: 'Physics' },
  { code: '9700', name: 'Biology' },
  { code: '9231', name: 'Further Mathematics' },
];
const YEARS         = Array.from({ length: 16 }, (_, i) => (2026 - i).toString());
const SEASONS       = [{ code: 'm', name: 'March' }, { code: 's', name: 'Summer' }, { code: 'w', name: 'Winter' }];
const PAPERS        = ['1', '2', '3', '4', '5', '6'];
const VARIANTS      = ['1', '2', '3'];
const MCQ_SUBJECTS  = ['9700', '9701', '9702']; // Bio, Chem, Physics
const MCQ_PAPER     = '1';
const MCQ_COUNT     = 40;
const MCQ_OPTS      = ['A', 'B', 'C', 'D'];

// ─── Hardcoded Answer Keys (from official CIE mark schemes 2021–2025) ─────────
const MCQ_ANSWER_KEYS = {
  '9700_m23_1_2': ['A','C','C','B','D','C','A','B','A','D','C','D','B','A','B','B','D','B','A','C','C','B','D','C','A','D','D','D','C','A','A','B','C','C','B','C','B','A','D','C'],
  '9700_m24_1_2': ['A','C','D','A','C','B','C','A','B','D','C','D','B','C','B','D','B','A','C','C','D','C','A','D','B','A','A','D','B','D','B','D','D','A','B','C','D','C','C','A'],
  '9700_m25_1_2': ['D','A','B','B','B','D','C','B','D','C','C','D','B','D','A','B','A','C','C','D','D','A','C','B','D','D','C','B','B','A','A','B','C','D','C','B','A','A','D','A'],
  '9700_s21_1_1': ['C','D','A','D','D','B','C','B','A','B','D','C','D','D','A','D','C','C','B','D','B','B','A','D','B','B','D','B','B','A','D','C','A','A','B','B','A','A','B','C'],
  '9700_s21_1_2': ['D','B','C','D','B','B','D','C','C','A','B','A','B','A','A','D','C','C','A','A','D','C','A','B','C','C','B','C','B','D','B','C','C','D','C','B','D','A','D','B'],
  '9700_s21_1_3': ['A','C','C','B','C','A','B','D','C','D','C','B','D','D','C','A','D','D','A','B','D','C','B','A','A','D','A','C','B','B','A','A','C','C','A','D','B','D','A','C'],
  '9700_s23_1_1': ['B','A','A','D','B','D','C','C','C','C','B','B','D','B','B','C','D','B','C','B','D','C','A','B','A','A','A','C','B','A','D','C','D','D','B','C','D','A','D','C'],
  '9700_s23_1_2': ['B','B','B','B','C','B','D','B','B','D','B','A','A','C','C','D','C','A','A','D','B','A','B','B','C','B','B','C','A','C','A','B','B','A','D','C','C','D','D','B'],
  '9700_s23_1_3': ['B','D','C','A','B','A','B','C','A','C','D','D','B','A','C','A','D','B','B','A','B','C','C','B','D','C','C','B','D','D','D','C','A','C','B','A','C','C','D','C'],
  '9700_s24_1_1': ['A','B','A','C','D','C','D','B','D','A','C','D','B','C','B','B','D','D','C','C','C','B','D','C','B','C','A','C','B','A','D','A','A','A','B','D','D','B','A','D'],
  '9700_s24_1_2': ['C','A','C','C','C','D','D','A','C','A','B','B','A','D','D','C','C','B','D','D','B','D','B','A','A','A','B','B','A','A','B','D','D','C','D','C','B','B','D','B'],
  '9700_s25_1_1': ['C','B','A','C','A','B','C','A','A','C','A','D','C','B','B','C','D','B','A','B','A','D','B','A','C','A','C','C','C','A','C','A','D','D','D','A','A','D','A','B'],
  '9700_s25_1_2': ['B','B','B','B','A','C','A','D','D','A','C','A','A','C','C','B','A','D','A','D','D','D','D','B','C','D','D','A','C','C','B','A','B','C','A','A','B','B','C','B'],
  '9700_s25_1_3': ['C','A','C','A','C','B','A','B','C','B','B','A','B','B','D','A','A','D','C','D','A','B','C','D','C','C','D','B','B','C','C','B','C','D','C','C','B','A','D','C'],
  '9700_w22_1_1': ['D','A','C','A','D','A','A','D','C','C','D','A','C','B','D','C','D','D','B','C','D','C','B','B','B','C','A','C','A','B','C','C','D','B','B','B','A','B','D','D'],
  '9700_w22_1_2': ['D','A','C','B','D','A','D','C','B','C','B','C','A','C','C','C','C','A','B','B','C','A','D','B','D','D','C','D','D','C','A','A','A','D','A','B','A','D','A','B'],
  '9700_w22_1_3': ['D','B','B','C','A','A','A','A','B','A','D','A','D','A','C','B','A','A','C','B','A','D','C','C','D','C','D','B','C','A','D','D','C','C','B','B','B','D','A','C'],
  '9700_w23_1_1': ['B','C','B','B','C','C','D','C','A','D','B','B','A','C','C','C','B','B','D','A','C','D','B','D','A','B','','C','D','A','A','B','A','B','','D','B','A','C','B'],
  '9700_w23_1_2': ['D','D','B','A','D','A','A','D','B','C','D','D','A','B','C','C','C','B','A','A','C','C','C','D','B','A','B','B','C','C','B','D','A','D','B','D','B','C','B','B'],
  '9700_w23_1_3': ['C','B','C','D','A','B','C','C','B','A','C','B','D','A','D','C','B','D','D','B','B','D','B','D','B','D','A','A','B','D','C','D','B','C','D','D','C','B','D','C'],
  '9700_w24_1_1': ['D','D','D','C','B','B','A','B','A','C','B','A','C','C','D','C','C','A','B','A','D','D','D','C','C','B','A','C','B','D','D','A','D','B','A','B','A','A','B','D'],
  '9700_w24_1_2': ['C','D','A','C','B','A','A','A','C','B','A','D','A','B','D','D','D','D','B','A','B','B','D','C','C','B','B','A','C','C','B','C','B','A','A','B','A','A','C','B'],
  '9700_w24_1_3': ['D','A','C','B','C','B','D','A','C','B','A','C','B','C','C','D','C','B','D','A','D','A','D','B','D','D','A','B','A','B','B','B','C','C','D','C','C','B','A','A'],
  '9700_w25_1_1': ['D','B','A','A','D','C','D','D','C','B','A','C','B','A','B','B','B','D','A','C','A','C','B','A','D','B','C','A','C','A','B','D','B','D','C','A','C','C','C','C'],
  '9700_w25_1_2': ['C','A','A','C','B','B','B','D','B','C','D','C','B','B','C','D','A','A','D','A','B','D','A','D','B','D','C','B','C','B','C','D','A','A','D','A','C','C','D','C'],
  '9700_w25_1_3': ['B','B','C','C','B','B','B','C','A','B','A','A','A','B','C','D','A','D','A','C','D','D','C','D','B','B','A','C','D','A','C','C','C','D','A','B','A','B','A','B'],
  '9701_m22_1_2': ['A','A','C','D','B','B','C','D','A','A','C','A','B','D','A','B','A','C','D','B','D','D','B','C','D','C','C','A','B','A','C','A','D','C','A','A','B','C','C','B'],
  '9701_m23_1_2': ['D','D','B','A','D','A','B','C','B','D','C','C','C','D','C','A','A','B','A','B','B','C','D','D','D','B','A','B','D','A','D','B','A','D','C','A','B','C','B','B'],
  '9701_m24_1_2': ['D','C','D','D','C','B','D','C','B','C','A','C','A','D','A','A','C','C','D','B','C','C','D','C','B','D','B','D','D','D','D','A','D','A','C','A','D','B','C','C'],
  '9701_m25_1_2': ['D','D','C','B','A','C','A','C','D','A','B','A','B','B','C','A','D','C','B','A','B','A','B','C','A','D','C','B','C','D','B','C','C','C','B','D','B','A','D','D'],
  '9701_s21_1_1': ['C','C','B','D','B','B','C','A','D','D','C','B','B','A','A','C','D','C','D','A','B','B','C','D','A','A','C','B','C','D','A','A','D','B','D','A','A','B','D','C'],
  '9701_s21_1_2': ['C','D','B','C','A','D','D','A','A','B','C','B','C','C','D','D','D','B','C','B','D','A','B','C','A','A','C','D','B','D','B','A','C','B','D','A','A','A','C','B'],
  '9701_s21_1_3': ['A','D','C','A','C','B','A','D','D','A','D','B','B','C','C','D','C','B','C','B','B','B','A','D','A','A','D','C','B','D','B','B','C','A','D','A','D','C','A','C'],
  '9701_s22_1_1': ['B','B','A','D','D','C','A','A','D','C','B','C','D','B','B','C','A','C','A','C','B','D','D','D','C','C','A','C','B','A','C','C','A','D','B','D','B','B','D','A'],
  '9701_s22_1_2': ['C','A','D','B','C','B','D','B','A','D','D','C','B','C','A','A','B','C','A','B','D','D','D','B','C','C','A','A','B','B','A','D','C','A','D','B','C','A','C','D'],
  '9701_s22_1_3': ['D','C','A','A','D','B','C','C','B','A','B','D','B','D','D','C','A','A','C','B','B','A','C','A','C','D','A','B','C','C','D','A','B','D','C','D','B','A','B','C'],
  '9701_s23_1_2': ['C','B','D','C','B','D','B','B','B','D','C','B','B','B','C','C','D','D','C','A','B','A','A','C','A','B','B','D','C','D','C','D','C','B','D','A','D','C','C','B'],
  '9701_s23_1_3': ['B','D','B','A','D','C','D','B','A','B','B','A','C','D','C','A','C','B','B','D','B','A','C','C','D','A','C','B','C','D','B','C','D','D','A','B','A','A','B','D'],
  '9701_s24_1_1': ['C','C','C','D','A','B','B','B','C','B','A','B','D','D','C','D','C','D','B','C','B','C','A','C','B','C','A','B','A','B','D','D','D','B','C','D','D','A','B','B'],
  '9701_s24_1_2': ['C','C','A','A','C','A','B','B','C','C','B','D','D','A','B','D','B','C','A','A','D','D','D','A','C','D','B','A','A','D','D','D','D','C','A','C','C','B','D','A'],
  '9701_s24_1_3': ['A','C','A','D','B','D','C','C','C','C','A','A','B','B','C','D','C','B','C','D','A','B','A','C','B','A','C','A','C','C','D','C','D','B','B','C','B','A','B','D'],
  '9701_s25_1_1': ['C','B','B','C','A','D','A','B','B','C','B','C','A','D','A','C','C','D','D','B','A','D','D','A','B','D','B','A','B','C','C','A','B','D','C','A','C','D','A','C'],
  '9701_s25_1_2': ['A','C','D','D','C','A','A','B','C','D','C','B','D','C','A','D','C','A','D','B','A','D','B','C','C','A','D','B','B','A','D','D','A','B','C','D','B','B','C','B'],
  '9701_s25_1_3': ['A','C','B','A','C','C','C','B','A','A','B','B','B','D','C','B','A','D','C','D','D','A','D','C','D','B','A','B','C','A','D','C','D','B','A','D','D','B','C','A'],
  '9701_w21_1_1': ['A','C','A','B','C','D','B','C','C','B','D','D','C','C','A','D','D','A','B','A','B','D','B','C','A','D','A','C','B','B','A','D','A','B','D','C','B','D','C','A'],
  '9701_w21_1_2': ['A','C','C','B','B','B','D','A','B','D','D','C','B','D','A','C','D','A','D','C','A','C','A','C','D','D','A','C','B','B','A','C','D','C','C','B','A','A','B','D'],
  '9701_w21_1_3': ['A','C','A','B','C','D','B','C','C','B','D','D','C','C','A','D','D','A','B','A','B','D','B','C','A','D','A','C','B','B','A','D','A','B','D','C','B','D','C','A'],
  '9701_w22_1_1': ['A','C','D','D','C','B','A','D','C','B','C','B','B','A','A','A','C','B','A','D','C','B','C','D','D','B','B','A','D','A','C','A','A','B','C','D','D','B','C','D'],
  '9701_w22_1_2': ['A','C','D','B','C','A','B','C','A','B','B','D','C','C','D','A','D','D','B','A','B','C','B','C','A','D','A','D','A','B','D','D','B','C','A','C','B','D','C','A'],
  '9701_w22_1_3': ['A','C','D','D','C','B','A','D','C','B','C','B','B','A','A','A','C','B','A','D','C','B','C','D','D','B','B','A','D','A','C','A','A','B','C','D','D','B','C','D'],
  '9701_w23_1_1': ['B','D','A','C','A','A','A','A','D','D','A','B','C','D','D','A','D','A','D','A','B','A','B','C','B','B','D','D','D','B','D','D','D','B','D','D','C','C','C','A'],
  '9701_w23_1_2': ['D','C','B','A','C','C','D','B','A','C','B','B','C','C','D','C','D','D','D','B','B','A','C','D','B','B','C','B','C','A','D','D','A','C','A','C','C','C','C','B'],
  '9701_w23_1_3': ['B','D','A','C','A','A','A','A','D','D','A','B','C','D','D','A','D','A','D','A','B','A','B','C','B','B','D','D','D','B','D','D','D','B','D','D','C','C','C','A'],
  '9701_w24_1_1': ['A','C','C','D','A','D','B','D','B','A','A','A','C','A','A','B','D','C','C','B','C','C','C','C','B','D','B','C','D','B','B','D','D','D','B','A','B','C','A','A'],
  '9701_w24_1_2': ['D','C','D','C','D','B','C','C','B','D','C','C','A','D','D','D','A','C','A','B','C','A','A','C','B','D','A','B','A','C','A','B','C','B','B','D','A','D','B','A'],
  '9701_w24_1_3': ['A','C','C','D','A','D','B','D','B','A','A','A','C','A','A','B','D','C','C','B','C','C','C','C','B','D','B','C','D','B','B','D','D','D','B','A','B','C','A','A'],
  '9701_w25_1_1': ['B','C','B','B','A','B','D','B','B','A','C','A','C','A','A','C','A','D','D','B','B','D','B','C','B','D','A','C','C','D','A','D','A','D','A','D','C','C','B','D'],
  '9701_w25_1_2': ['D','A','B','C','B','C','B','D','C','D','D','B','D','B','C','A','D','D','C','B','A','A','B','A','A','A','B','A','D','A','C','C','C','B','B','C','C','D','A','D'],
  '9701_w25_1_3': ['B','C','B','B','A','B','D','B','B','A','C','A','C','A','A','C','A','D','D','B','B','D','B','C','B','D','A','C','C','D','A','D','A','D','A','D','C','C','B','D'],
  '9702_m22_1_2': ['B','B','D','B','D','D','C','A','C','D','A','C','D','D','A','B','C','D','C','D','B','C','A','D','C','C','D','B','D','B','A','C','C','A','A','B','C','C','B','D'],
  '9702_m23_1_2': ['C','B','A','B','B','D','D','C','D','C','C','B','D','D','B','C','B','C','B','D','A','A','D','B','C','D','B','C','A','D','A','B','B','A','B','A','C','C','A','A'],
  '9702_m24_1_2': ['A','A','D','B','B','B','A','D','B','C','C','D','D','C','C','B','D','A','C','D','D','B','D','D','A','C','B','B','D','C','C','A','C','B','B','C','C','A','B','B'],
  '9702_m25_1_2': ['D','D','C','A','A','C','B','B','A','A','C','D','D','A','B','A','B','A','D','D','B','A','D','C','B','A','C','C','C','D','C','A','C','B','C','B','B','B','D','D'],
  '9702_s21_1_1': ['A','D','C','B','D','C','C','D','A','C','A','D','C','D','A','D','A','B','B','C','D','B','A','A','A','B','A','B','B','D','C','A','C','B','D','C','B','B','B','A'],
  '9702_s21_1_2': ['D','B','D','D','D','D','B','C','B','D','A','C','B','C','A','A','D','D','A','D','B','A','B','A','B','C','B','B','C','A','D','A','A','B','A','C','A','C','C','A'],
  '9702_s21_1_3': ['C','C','A','B','B','D','C','C','D','B','A','B','A','A','B','D','C','B','D','D','C','B','A','A','D','B','C','B','A','B','D','A','C','A','A','C','B','C','C','D'],
  '9702_s22_1_1': ['D','B','A','C','C','C','D','D','B','D','C','B','A','B','A','A','C','A','A','D','A','D','C','D','A','B','B','A','B','D','C','B','D','D','D','A','D','D','C','C'],
  '9702_s22_1_2': ['C','B','C','B','A','D','C','A','B','B','C','D','C','B','C','B','A','C','B','A','D','C','D','A','A','B','B','D','D','C','B','A','D','A','B','A','D','C','C','B'],
  '9702_s22_1_3': ['D','D','B','C','A','C','D','C','D','B','A','C','D','B','A','A','C','C','B','C','B','B','B','D','A','A','B','C','B','B','D','D','D','B','D','A','A','B','B','A'],
  '9702_s23_1_1': ['C','B','D','B','C','C','C','A','A','D','D','A','C','A','C','B','B','A','A','D','A','C','C','C','B','A','C','D','A','C','B','D','B','C','A','B','D','D','D','A'],
  '9702_s23_1_2': ['B','D','D','C','B','A','C','B','D','A','B','C','A','A','D','A','B','D','B','B','B','C','D','B','A','A','B','D','C','C','A','D','C','D','A','B','C','C','D','A'],
  '9702_s23_1_3': ['C','A','D','A','C','D','B','B','D','C','B','C','D','A','C','C','D','B','B','A','D','D','B','C','B','A','C','B','D','A','D','B','B','A','A','C','A','D','A','A'],
  '9702_s24_1_1': ['A','A','C','B','B','D','C','C','B','D','A','B','D','A','A','B','B','A','B','B','D','C','C','A','C','A','B','D','B','B','D','D','C','C','C','D','D','B','C','A'],
  '9702_s24_1_2': ['C','D','A','D','B','B','C','A','C','A','B','C','D','C','D','A','B','C','C','D','C','D','B','B','C','A','D','D','A','C','D','C','B','A','D','A','B','D','C','C'],
  '9702_s24_1_3': ['C','D','B','A','C','A','D','A','A','C','B','B','C','B','A','D','C','A','B','B','C','C','C','A','D','A','B','D','A','B','D','D','C','A','C','C','D','A','D','B'],
  '9702_s25_1_1': ['C','D','B','B','D','D','C','A','B','C','C','D','B','A','B','C','D','A','A','B','D','C','D','C','C','A','C','B','B','D','A','C','D','D','A','B','C','D','C','B'],
  '9702_s25_1_2': ['D','D','B','C','A','C','A','B','B','C','B','D','C','D','A','A','B','C','B','C','A','B','D','C','B','D','B','D','C','D','C','A','D','C','D','D','A','B','A','B'],
  '9702_s25_1_3': ['A','C','C','B','B','A','A','B','B','B','C','D','D','C','D','B','B','D','C','D','D','A','D','D','C','B','C','B','A','D','A','C','C','D','C','C','A','D','A','A'],
  '9702_w21_1_1': ['B','B','A','A','B','B','D','C','B','D','C','A','D','D','D','C','B','A','C','A','D','B','D','A','D','A','D','C','C','B','A','C','D','A','D','C','A','A','C','B'],
  '9702_w21_1_2': ['C','A','D','A','D','C','B','A','B','D','B','C','C','D','C','B','C','A','A','B','A','D','D','D','C','A','C','B','A','A','A','C','B','B','B','C','A','A','C','B'],
  '9702_w21_1_3': ['C','D','C','B','D','B','D','A','A','A','B','A','A','C','C','B','C','C','B','C','D','B','D','A','C','B','A','C','D','B','B','D','D','D','B','A','A','B','D','B'],
  '9702_w22_1_1': ['C','D','C','A','D','B','C','A','A','D','B','A','C','D','C','D','C','C','C','D','A','B','B','D','A','A','A','B','D','C','B','C','A','B','C','D','C','B','A','D'],
  '9702_w22_1_2': ['D','C','D','C','A','A','D','C','B','C','D','D','B','A','C','A','C','B','C','B','A','D','B','A','B','D','B','C','C','D','B','B','D','D','A','B','A','C','B','B'],
  '9702_w22_1_3': ['B','B','C','D','A','B','D','D','A','B','D','D','B','C','B','B','C','B','C','A','A','C','B','A','C','B','C','C','D','D','D','A','C','B','C','C','B','A','D','D'],
  '9702_w23_1_1': ['C','A','D','C','B','A','D','B','B','B','C','A','D','D','D','A','A','C','D','B','B','C','C','D','A','B','C','D','A','C','D','A','B','B','A','A','B','D','C','B'],
  '9702_w23_1_2': ['B','D','D','A','D','B','A','C','B','C','A','C','B','C','A','C','D','B','D','D','C','A','C','C','C','B','B','A','D','B','B','D','A','D','A','B','D','A','B','C'],
  '9702_w23_1_3': ['B','A','C','A','D','C','B','D','A','C','C','B','B','A','D','B','B','C','A','D','D','A','B','C','A','B','A','A','C','C','A','D','A','C','C','D','D','B','A','D'],
  '9702_w24_1_1': ['D','D','C','C','D','D','C','B','B','B','B','D','A','C','A','C','B','A','D','B','D','A','B','A','D','A','C','C','B','C','B','B','C','D','C','A','A','D','D','C'],
  '9702_w24_1_2': ['C','A','D','A','B','C','C','B','D','C','D','A','C','D','D','B','C','C','A','C','B','A','C','C','C','B','D','B','B','B','A','B','A','B','B','A','D','B','D','C'],
  '9702_w24_1_3': ['D','C','B','C','A','C','A','B','B','C','B','A','D','D','D','A','D','C','C','A','A','D','B','D','C','C','C','A','C','B','A','A','A','B','B','D','C','B','A','D'],
  '9702_w25_1_1': ['D','D','B','C','D','D','B','C','C','D','A','A','B','C','C','B','B','C','A','A','D','B','C','A','B','B','D','C','D','A','D','C','A','A','D','D','C','A','A','B'],
  '9702_w25_1_2': ['B','D','C','C','B','B','A','C','D','B','A','D','A','C','C','A','C','A','B','B','A','A','C','D','B','D','C','D','A','C','C','D','B','D','B','D','A','C','D','A'],
  '9702_w25_1_3': ['D','D','B','C','D','D','B','C','C','D','A','A','B','C','C','B','B','C','A','A','D','B','C','A','B','B','D','C','D','A','D','C','A','A','D','D','C','A','A','B'],
};

const GITHUB_REPO_URL = "https://github.com/Huzaifa-616/PastPaper-Explorer";
const NOTES_PASSWORD  = "bravo07";
const NOTES_KEY       = "nexus_notes_v1";
const MAX_FILE_BYTES  = 1.5 * 1024 * 1024; // 1.5 MB

// ─── Helpers ──────────────────────────────────────────────────────────────────
const loadNotes    = () => { try { return JSON.parse(localStorage.getItem(NOTES_KEY) || '{}'); } catch { return {}; } };
const saveNotes    = (n) => localStorage.setItem(NOTES_KEY, JSON.stringify(n));

// Adjusted Format for Notes Key (Matches file convention: {Subject}_{Season}{Year}_{Paper}{Variant})
const noteKey      = (code, season, year, paper, variant) => 
  (year && season) ? `${code}_${season}${year.slice(2)}_${paper}${variant}` : `${code}_${paper}`;

const subjectName  = (code) => SUBJECTS.find(s => s.code === code)?.name || code;
const fmtBytes     = (b) => b < 1024 ? `${b}B` : b < 1048576 ? `${(b/1024).toFixed(1)}KB` : `${(b/1048576).toFixed(1)}MB`;

const openBlob = (att) => {
  try {
    const parts  = att.data.split(',');
    const binary = atob(parts[1]);
    const bytes  = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob   = new Blob([bytes], { type: att.type });
    window.open(URL.createObjectURL(blob), '_blank');
  } catch { alert('Could not open file.'); }
};

// ─── GlobalStyles ─────────────────────────────────────────────────────────────
const GlobalStyles = ({ dark }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; }
    :root {
      --bg:        ${dark ? '#06060f' : '#f4f6fb'};
      --bg2:       ${dark ? '#0c0c1c' : '#ffffff'};
      --surface:   ${dark ? '#10101f' : '#ffffff'};
      --surface2:  ${dark ? '#181828' : '#eef1f8'};
      --surface3:  ${dark ? '#1f1f35' : '#e4e9f4'};
      --line:      ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'};
      --line2:     ${dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'};
      --accent:    ${dark ? '#4f8ef7' : '#2563eb'};
      --accent-d:  ${dark ? 'rgba(79,142,247,0.15)' : 'rgba(37,99,235,0.1)'};
      --accent-g:  ${dark ? 'rgba(79,142,247,0.28)' : 'rgba(37,99,235,0.2)'};
      --blue:      ${dark ? '#818cf8' : '#6366f1'};
      --blue-d:    ${dark ? 'rgba(129,140,248,0.12)' : 'rgba(99,102,241,0.08)'};
      --green:     ${dark ? '#34d399' : '#059669'};
      --green-d:   ${dark ? 'rgba(52,211,153,0.12)' : 'rgba(5,150,105,0.08)'};
      --red:       ${dark ? '#f87171' : '#dc2626'};
      --red-d:     ${dark ? 'rgba(248,113,113,0.14)' : 'rgba(220,38,38,0.08)'};
      --orange:    ${dark ? '#fb923c' : '#ea580c'};
      --orange-d:  ${dark ? 'rgba(251,146,60,0.14)' : 'rgba(234,88,12,0.08)'};
      --text:      ${dark ? '#e2e8f0' : '#0f172a'};
      --text2:     ${dark ? '#8a8aaa' : '#64748b'};
      --text3:     ${dark ? '#4a4a66' : '#94a3b8'};
    }
    html, body, #root { height: 100%; background: var(--bg); }
    body { font-family: 'Roboto', sans-serif; color: var(--text); }
    ::selection { background: var(--accent-d); color: var(--text); }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--line2); border-radius: 2px; }

    .grid-bg {
      background-image: linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px);
      background-size: 52px 52px;
    }
    @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
    @keyframes slideInLeft  { from{transform:translateX(-100%)} to{transform:translateX(0)} }
    @keyframes slideInRight { from{transform:translateX(100%)}  to{transform:translateX(0)} }
    @keyframes slideUp      { from{transform:translateY(100%)}  to{transform:translateY(0)} }
    @keyframes pulse-ring { 0%{transform:scale(0.95);opacity:0.6} 50%{transform:scale(1.05);opacity:0.2} 100%{transform:scale(0.95);opacity:0.6} }

    .anim-0 { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both; }
    .anim-1 { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.12s both; }
    .anim-2 { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.24s both; }
    .anim-3 { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.36s both; }
    .anim-fade { animation: fadeIn 0.4s ease both; }

    .tool-card {
      background:var(--surface); border:1px solid var(--line2); border-radius:16px;
      padding:36px 32px; cursor:pointer;
      transition:transform 0.4s cubic-bezier(0.22,1,0.36,1),border-color 0.3s,box-shadow 0.4s;
      position:relative; overflow:hidden; text-align:left;
    }
    .tool-card::before { content:''; position:absolute; top:0;left:0;right:0;height:2px; background:linear-gradient(90deg,transparent,var(--accent),transparent); opacity:0; transition:opacity 0.3s; }
    .tool-card:hover { transform:translateY(-8px); border-color:var(--accent); }
    .tool-card:hover::before { opacity:1; }
    .tool-card.blue:hover { border-color:var(--blue); }
    .tool-card.blue::before { background:linear-gradient(90deg,transparent,var(--blue),transparent); }
    .tool-card:hover .cg-a { box-shadow:0 0 60px var(--accent-g); opacity:1; }
    .tool-card:hover .cg-b { box-shadow:0 0 60px rgba(91,141,245,0.3); opacity:1; }
    .cg-a,.cg-b { position:absolute;inset:0;opacity:0;transition:opacity 0.4s;pointer-events:none;border-radius:16px; }
    .icon-badge { width:56px;height:56px;border-radius:14px;display:flex;align-items:center;justify-content:center;margin-bottom:24px;border:1px solid var(--line2);background:var(--surface2);transition:transform 0.4s cubic-bezier(0.22,1,0.36,1); }
    .tool-card:hover .icon-badge { transform:scale(1.1) rotate(-3deg); }

    .nexus-select { appearance:none;background:var(--surface2);border:1px solid var(--line2);border-radius:8px;color:var(--text);font-family:'Roboto',sans-serif;font-size:11px;padding:7px 28px 7px 10px;cursor:pointer;transition:border-color 0.2s,box-shadow 0.2s;outline:none; }
    .nexus-select:hover { border-color:rgba(79,142,247,0.5); }
    .nexus-select:focus { border-color:var(--accent); box-shadow:0 0 0 2px var(--accent-d); }
    .nexus-select option { background:var(--bg2);color:var(--text); }

    .tag { display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:99px;border:1px solid var(--line2);background:var(--surface2);font-size:10px;color:var(--text2); }

    .shimmer-text { background:linear-gradient(90deg,var(--accent) 0%,#93c5fd 50%,var(--accent) 100%); background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s linear infinite; }

    .nav-bar { background:${dark ? 'rgba(6,6,15,0.92)' : 'rgba(244,246,251,0.92)'}; backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid var(--line2); }

    .seg-btn { padding:5px 14px;border-radius:6px;font-size:11px;font-family:'Roboto',sans-serif;font-weight:500;cursor:pointer;transition:all 0.2s;border:none;background:none; }
    .seg-btn.a-accent { background:var(--accent);color:#fff; }
    .seg-btn.a-blue   { background:var(--blue);color:#fff; }
    .seg-btn.a-orange { background:var(--orange);color:#fff; }
    .seg-btn.inactive { color:var(--text2); }
    .seg-btn.inactive:hover { color:var(--text); }

    .btn-load { display:inline-flex;align-items:center;gap:6px;padding:8px 20px;border-radius:8px;font-size:12px;font-weight:600;font-family:'Roboto',sans-serif;border:none;cursor:pointer;transition:all 0.25s; }
    .btn-load.ready { background:var(--accent);color:#fff;box-shadow:0 0 20px var(--accent-g); }
    .btn-load.ready:hover { filter:brightness(1.1);transform:translateY(-1px); }
    .btn-load.ready:active { transform:scale(0.97); }
    .btn-load.disabled { background:var(--surface2);color:var(--text3);cursor:not-allowed; }

    .icon-btn { display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:8px;border:1px solid var(--line2);background:var(--surface2);color:var(--text2);cursor:pointer;transition:all 0.2s; }
    .icon-btn:hover { color:var(--text);background:var(--surface); }

    .pull-tab { display:flex;align-items:center;justify-content:center;width:100%;height:28px;border-bottom:1px solid var(--line2);background:var(--bg);cursor:pointer;gap:8px;font-size:9px;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);transition:color 0.2s,background 0.2s;border:none; }
    .pull-tab:hover { color:var(--accent);background:var(--surface2); }

    .modal-overlay { position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.65);backdrop-filter:blur(8px);animation:fadeIn 0.2s ease both;padding:12px; }
    .modal-box { background:var(--surface);border:1px solid var(--line2);border-radius:20px;width:100%;max-width:420px;position:relative;overflow:hidden;animation:fadeUp 0.3s cubic-bezier(0.22,1,0.36,1) both; }
    .modal-strip { height:2px;background:linear-gradient(90deg,var(--accent),var(--blue)); }

    /* Notes sidebar */
    .notes-sidebar { position:absolute;left:0;top:0;bottom:0;width:340px;z-index:50;background:var(--surface);border-right:1px solid var(--line2);display:flex;flex-direction:column;box-shadow:4px 0 30px rgba(0,0,0,0.3);animation:slideInLeft 0.3s cubic-bezier(0.22,1,0.36,1) both; }
    .notes-backdrop { position:absolute;inset:0;z-index:49;background:rgba(0,0,0,0.3); }
    
    /* MCQ sidebar - Desktop Standard (Inline) */
    .mcq-sidebar { 
      position: relative; 
      width: 320px; 
      flex-shrink: 0;
      background: var(--surface); 
      border-left: 1px solid var(--line2); 
      display: flex; 
      flex-direction: column; 
      box-shadow: -4px 0 30px rgba(0,0,0,0.05); 
      animation: slideInRight 0.3s cubic-bezier(0.22,1,0.36,1) both; 
    }

    .note-card { background:var(--surface2);border:1px solid var(--line2);border-radius:10px;padding:14px 16px;transition:border-color 0.2s; }
    .note-card:hover { border-color:var(--accent); }

    .n-input { width:100%;background:var(--surface2);border:1px solid var(--line2);border-radius:8px;color:var(--text);font-family:'Roboto',sans-serif;font-size:13px;padding:10px 12px;outline:none;resize:vertical;transition:border-color 0.2s,box-shadow 0.2s; }
    .n-input:focus { border-color:var(--accent);box-shadow:0 0 0 2px var(--accent-d); }
    .n-input::placeholder { color:var(--text3); }

    .attach-pill { display:inline-flex;align-items:center;gap:5px;padding:4px 10px 4px 8px;border-radius:6px;border:1px solid var(--line2);background:var(--surface3);font-size:10px;color:var(--text2);cursor:pointer;transition:all 0.2s;text-decoration:none; }
    .attach-pill:hover { border-color:var(--accent);color:var(--accent); }

    .mcq-bubble { width:30px;height:30px;border-radius:50%;border:1.5px solid var(--line2);background:transparent;font-size:11px;font-weight:700;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;justify-content:center;font-family:'Roboto',sans-serif; }
    .mcq-bubble:hover { border-color:var(--text2);color:var(--text); }
    .mcq-bubble.sel-mine { background:var(--accent);border-color:var(--accent);color:#fff; }
    .mcq-bubble.sel-key  { background:var(--orange);border-color:var(--orange);color:#fff; }
    .mcq-bubble.correct  { background:var(--green);border-color:var(--green);color:#fff; }
    .mcq-bubble.wrong    { background:var(--red);border-color:var(--red);color:#fff; }

    .logo-mark { width:34px;height:34px;border-radius:9px;background:linear-gradient(135deg,var(--accent) 0%,#93c5fd 100%);display:flex;align-items:center;justify-content:center; }
    .empty-icon-ring { width:110px;height:110px;border-radius:50%;border:1px solid var(--line2);display:flex;align-items:center;justify-content:center;position:relative; }
    .empty-icon-ring::before { content:'';position:absolute;inset:-10px;border-radius:50%;border:1px dashed var(--line2);animation:pulse-ring 3s ease-in-out infinite; }
    .deco-line { position:absolute;background:linear-gradient(90deg,transparent,var(--line2),transparent);height:1px;width:60%; }
    .no-sb { scrollbar-width:none; }
    .no-sb::-webkit-scrollbar { display:none; }

    @media (max-width: 640px) {
      .nav-inner { flex-direction:column !important;align-items:stretch !important;gap:10px !important; }
      .nav-divider { display:none !important; }
      .nav-brand-text { display:none !important; }
      .nav-filters { display:grid !important;grid-template-columns:1fr 1fr 1fr !important;gap:8px 10px !important;overflow:visible !important;flex:unset !important;padding-bottom:0 !important; }
      .nav-filters > div { width:100%; }
      .nav-filters .nexus-select { width:100%;font-size:10px !important;padding:6px 22px 6px 8px !important; }
      .seg-btn { padding:5px 8px !important;font-size:10px !important; }
      .nav-actions { display:flex !important;width:100% !important;margin-left:0 !important;justify-content:space-between !important; }
      .nav-actions .btn-load { flex:1 !important;justify-content:center !important; }
      
      .notes-sidebar { width:100% !important; }
      
      /* MCQ sidebar - Mobile Bottom Sheet */
      .mcq-sidebar { 
        position: absolute !important;
        bottom: 0; left: 0; right: 0; top: auto;
        width: 100% !important; 
        height: 50vh; 
        border-left: none !important; 
        border-top: 1px solid var(--line2);
        box-shadow: 0 -10px 40px rgba(0,0,0,0.4);
        animation: slideUp 0.3s cubic-bezier(0.22,1,0.36,1) both;
        z-index: 50; 
      }
      .mcq-bubble { width:26px;height:26px;font-size:10px; }
    }
  `}</style>
);

// ─── NexusSelect ──────────────────────────────────────────────────────────────
const NexusSelect = ({ label, value, onChange, options }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
    <span style={{ fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text3)', paddingLeft:2 }}>{label}</span>
    <div style={{ position:'relative' }}>
      <select value={value} onChange={e => onChange(e.target.value)} className="nexus-select">
        <option value="" disabled>—</option>
        {options.map((opt, i) => { const v = typeof opt==='object'?opt.value:opt; const l = typeof opt==='object'?opt.label:opt; return <option key={i} value={v}>{l}</option>; })}
      </select>
      <ChevronDown size={11} style={{ position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',color:'var(--text3)',pointerEvents:'none' }} />
    </div>
  </div>
);

// ─── ContactModal ─────────────────────────────────────────────────────────────
const ContactModal = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const email = "huzaifa.bravo@gmail.com";
  useEffect(() => { if (copied) { const t = setTimeout(()=>setCopied(false),2000); return ()=>clearTimeout(t); } }, [copied]);
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e=>e.stopPropagation()}>
        <div className="modal-strip" />
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 22px',borderBottom:'1px solid var(--line)' }}>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <div style={{ width:32,height:32,borderRadius:8,background:'var(--accent-d)',display:'flex',alignItems:'center',justifyContent:'center' }}><Mail size={15} color="var(--accent)" /></div>
            <span style={{ fontSize:18,fontWeight:700,color:'var(--text)' }}>Contact</span>
          </div>
          <button className="icon-btn" onClick={onClose} style={{ borderRadius:'50%',width:28,height:28 }}><X size={14} /></button>
        </div>
        <div style={{ padding:'28px 22px 24px',textAlign:'center' }}>
          <p style={{ color:'var(--text2)',fontSize:14,lineHeight:1.6,marginBottom:22 }}>Questions, feedback, or just want to say hi?<br />Drop a line below.</p>
          <div style={{ display:'flex',alignItems:'center',gap:8,background:'var(--surface2)',border:'1px solid var(--line2)',borderRadius:10,padding:'6px 6px 6px 14px',marginBottom:8 }}>
            <span style={{ flex:1,fontSize:12,color:'var(--text)',textAlign:'left',fontFamily:'monospace' }}>{email}</span>
            <button onClick={()=>{navigator.clipboard.writeText(email);setCopied(true);}}
              style={{ display:'flex',alignItems:'center',gap:5,padding:'7px 12px',borderRadius:7,border:'none',cursor:'pointer',background:copied?'var(--accent)':'var(--surface)',color:copied?'#fff':'var(--text2)',fontSize:11,fontWeight:600,transition:'all 0.2s',boxShadow:copied?'0 0 14px var(--accent-g)':'none' }}>
              {copied?<><Check size={12}/> Copied</>:<><Copy size={12}/> Copy</>}
            </button>
          </div>
          <p style={{ fontSize:9,color:'var(--text3)',letterSpacing:'0.08em' }}>{copied?'✦ COPIED TO CLIPBOARD':'CLICK TO COPY ADDRESS'}</p>
        </div>
      </div>
    </div>
  );
};

// ─── PasswordModal ────────────────────────────────────────────────────────────
const PasswordModal = ({ isOpen, onClose, onSuccess }) => {
  const [pw, setPw] = useState(''); const [show, setShow] = useState(false); const [err, setErr] = useState(false);
  const ref = useRef(null);
  useEffect(() => { if (isOpen) { setPw(''); setErr(false); setTimeout(()=>ref.current?.focus(),100); } }, [isOpen]);
  const submit = () => { if (pw===NOTES_PASSWORD) { onSuccess(); onClose(); setPw(''); setErr(false); } else { setErr(true); setPw(''); } };
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth:340 }} onClick={e=>e.stopPropagation()}>
        <div className="modal-strip" />
        <div style={{ padding:'22px 24px 26px' }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20 }}>
            <div style={{ display:'flex',alignItems:'center',gap:10 }}>
              <div style={{ width:34,height:34,borderRadius:9,background:'var(--accent-d)',display:'flex',alignItems:'center',justifyContent:'center' }}><Lock size={16} color="var(--accent)" /></div>
              <div><div style={{ fontSize:15,fontWeight:700,color:'var(--text)' }}>Admin Access</div><div style={{ fontSize:10,color:'var(--text3)' }}>Enter password to add notes</div></div>
            </div>
            <button className="icon-btn" onClick={onClose} style={{ width:28,height:28,borderRadius:'50%' }}><X size={13} /></button>
          </div>
          <div style={{ position:'relative',marginBottom:err?8:16 }}>
            <input ref={ref} type={show?'text':'password'} className="n-input" placeholder="Password" value={pw}
              onChange={e=>{setPw(e.target.value);setErr(false);}} onKeyDown={e=>e.key==='Enter'&&submit()}
              style={{ paddingRight:38,borderColor:err?'var(--red)':undefined }} />
            <button onClick={()=>setShow(s=>!s)} style={{ position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--text3)',padding:4 }}>
              {show?<EyeOff size={14}/>:<Eye size={14}/>}
            </button>
          </div>
          {err && <p style={{ fontSize:11,color:'var(--red)',marginBottom:12 }}>Incorrect password. Try again.</p>}
          <button onClick={submit} style={{ width:'100%',padding:'10px',borderRadius:8,border:'none',cursor:'pointer',background:'var(--accent)',color:'#fff',fontSize:13,fontWeight:600,transition:'all 0.2s' }}>Unlock</button>
        </div>
      </div>
    </div>
  );
};

// ─── NotesSidebar ─────────────────────────────────────────────────────────────
const NotesSidebar = ({ subjectCode, paperNum, variant, year, season, onClose, isAdmin, onRequestAuth }) => {
  const key      = noteKey(subjectCode, season, year, paperNum, variant);
  const subjName = subjectName(subjectCode);
  const [notes, setNotes]         = useState(() => loadNotes()[key] || []);
  const [showAdd, setShowAdd]     = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody,  setNoteBody]  = useState('');
  const [delConfirm, setDelConfirm] = useState(null);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [fileErr, setFileErr]     = useState('');
  const fileRef = useRef(null);

  const persist = (updated) => { setNotes(updated); const all=loadNotes(); all[key]=updated; saveNotes(all); };

  const handleAdd = () => {
    if (!noteBody.trim() && pendingFiles.length === 0) return;
    const newNote = {
      id: Date.now().toString(),
      title: noteTitle.trim() || `Note ${notes.length + 1}`,
      content: noteBody.trim(),
      timestamp: new Date().toLocaleDateString('en-GB', { day:'numeric',month:'short',year:'numeric' }),
      attachments: pendingFiles,
    };
    persist([newNote, ...notes]);
    setNoteTitle(''); setNoteBody(''); setPendingFiles([]); setShowAdd(false); setFileErr('');
  };

  const handleFileChange = (e) => {
    setFileErr('');
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (!['application/pdf','text/html'].includes(file.type)) { setFileErr('Only PDF and HTML files are supported.'); return; }
      if (file.size > MAX_FILE_BYTES) { setFileErr(`"${file.name}" exceeds 1.5 MB limit.`); return; }
      const reader = new FileReader();
      reader.onload = () => {
        setPendingFiles(pf => [...pf, { id: Date.now().toString() + Math.random(), name:file.name, type:file.type, data:reader.result, size:file.size }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeFile = (id) => setPendingFiles(pf => pf.filter(f => f.id !== id));
  const handleDelete = (id) => { persist(notes.filter(n=>n.id!==id)); setDelConfirm(null); };

  return (
    <>
      <div className="notes-backdrop" onClick={onClose} />
      <div className="notes-sidebar">
        {/* Header */}
        <div style={{ padding:'16px 18px',borderBottom:'1px solid var(--line2)',flexShrink:0 }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6 }}>
            <div style={{ display:'flex',alignItems:'center',gap:9 }}>
              <div style={{ width:30,height:30,borderRadius:8,background:'var(--accent-d)',display:'flex',alignItems:'center',justifyContent:'center' }}><NotebookPen size={14} color="var(--accent)"/></div>
              <div>
                <div style={{ fontSize:13,fontWeight:700,color:'var(--text)' }}>Notes</div>
                <div style={{ fontSize:10,color:'var(--text3)' }}>{subjName} · Paper {paperNum}</div>
              </div>
            </div>
            <button className="icon-btn" onClick={onClose} style={{ width:28,height:28,borderRadius:'50%' }}><X size={13}/></button>
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:6,marginTop:10 }}>
            <span style={{ fontSize:10,color:'var(--text3)' }}>{notes.length} note{notes.length!==1?'s':''}</span>
            <span style={{ flex:1 }}/>
            {isAdmin ? (
              <button onClick={()=>setShowAdd(s=>!s)}
                style={{ display:'flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:7,border:'none',cursor:'pointer',background:'var(--accent)',color:'#fff',fontSize:11,fontWeight:600,transition:'all 0.2s' }}>
                <Plus size={12}/> Add Note
              </button>
            ) : (
              <button onClick={onRequestAuth}
                style={{ display:'flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:7,border:'1px solid var(--line2)',cursor:'pointer',background:'var(--surface2)',color:'var(--text2)',fontSize:11,transition:'all 0.2s' }}>
                <Lock size={11}/> Unlock to add
              </button>
            )}
          </div>
        </div>

        {/* Add form */}
        {showAdd && isAdmin && (
          <div style={{ padding:'14px 18px',borderBottom:'1px solid var(--line2)',background:'var(--surface2)',flexShrink:0 }}>
            <input className="n-input" placeholder="Title (optional)" value={noteTitle} onChange={e=>setNoteTitle(e.target.value)} style={{ marginBottom:8,height:36,resize:'none' }}/>
            <textarea className="n-input" placeholder="Write your note here…" value={noteBody} onChange={e=>setNoteBody(e.target.value)} rows={3} style={{ marginBottom:8 }}/>

            {/* File attach */}
            <input ref={fileRef} type="file" accept=".pdf,.html,application/pdf,text/html" multiple style={{ display:'none' }} onChange={handleFileChange}/>
            <button onClick={()=>fileRef.current?.click()}
              style={{ display:'flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:7,border:'1px dashed var(--line2)',cursor:'pointer',background:'transparent',color:'var(--text2)',fontSize:11,width:'100%',justifyContent:'center',marginBottom:6,transition:'all 0.2s' }}>
              <Paperclip size={12}/> Attach PDF or HTML file
            </button>
            {fileErr && <p style={{ fontSize:11,color:'var(--red)',marginBottom:6,display:'flex',alignItems:'center',gap:4 }}><AlertCircle size={11}/>{fileErr}</p>}
            {pendingFiles.length > 0 && (
              <div style={{ display:'flex',flexWrap:'wrap',gap:5,marginBottom:8 }}>
                {pendingFiles.map(f => (
                  <div key={f.id} style={{ display:'flex',alignItems:'center',gap:4,padding:'3px 8px 3px 6px',borderRadius:6,background:'var(--surface3)',border:'1px solid var(--line2)',fontSize:10,color:'var(--text2)' }}>
                    <FileText size={10} color="var(--accent)"/>
                    <span>{f.name}</span>
                    <span style={{ color:'var(--text3)' }}>({fmtBytes(f.size)})</span>
                    <button onClick={()=>removeFile(f.id)} style={{ background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',alignItems:'center',color:'var(--text3)' }}><X size={10}/></button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display:'flex',gap:8 }}>
              <button onClick={handleAdd} disabled={!noteBody.trim()&&pendingFiles.length===0}
                style={{ flex:1,padding:'8px',borderRadius:7,border:'none',cursor:(noteBody.trim()||pendingFiles.length>0)?'pointer':'not-allowed',background:(noteBody.trim()||pendingFiles.length>0)?'var(--accent)':'var(--surface)',color:(noteBody.trim()||pendingFiles.length>0)?'#fff':'var(--text3)',fontSize:12,fontWeight:600,transition:'all 0.2s' }}>
                Save Note
              </button>
              <button onClick={()=>{setShowAdd(false);setNoteTitle('');setNoteBody('');setPendingFiles([]);setFileErr('');}}
                style={{ padding:'8px 14px',borderRadius:7,border:'1px solid var(--line2)',cursor:'pointer',background:'transparent',color:'var(--text2)',fontSize:12,transition:'all 0.2s' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* List */}
        <div style={{ flex:1,overflowY:'auto',padding:'14px 18px',display:'flex',flexDirection:'column',gap:10 }}>
          {notes.length === 0 ? (
            <div style={{ textAlign:'center',padding:'48px 0',color:'var(--text3)' }}>
              <FileText size={36} style={{ opacity:0.3,marginBottom:12 }}/>
              <p style={{ fontSize:13,marginBottom:6 }}>No local notes yet</p>
              <p style={{ fontSize:11, marginBottom: 12 }}>{isAdmin?'Click "Add Note" to get started.':'Unlock to start adding local notes.'}</p>
              <p style={{ fontSize:9, color:'var(--text3)', borderTop:'1px solid var(--line)', paddingTop:12, marginTop:12 }}>
                Static Repo Notes expected format:<br/>
                <span style={{fontFamily:'monospace'}}>/notes/{key}.pdf</span>
              </p>
            </div>
          ) : notes.map(note => (
            <div key={note.id} className="note-card">
              <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:8,marginBottom:note.content?6:0 }}>
                <span style={{ fontSize:12,fontWeight:600,color:'var(--text)',lineHeight:1.3 }}>{note.title}</span>
                {isAdmin && (delConfirm===note.id ? (
                  <div style={{ display:'flex',gap:5,flexShrink:0 }}>
                    <button onClick={()=>handleDelete(note.id)} style={{ padding:'3px 8px',borderRadius:5,border:'none',cursor:'pointer',background:'var(--red)',color:'#fff',fontSize:10,fontWeight:600 }}>Delete</button>
                    <button onClick={()=>setDelConfirm(null)} style={{ padding:'3px 8px',borderRadius:5,border:'1px solid var(--line2)',cursor:'pointer',background:'transparent',color:'var(--text2)',fontSize:10 }}>Cancel</button>
                  </div>
                ) : (
                  <button onClick={()=>setDelConfirm(note.id)} className="icon-btn" style={{ width:24,height:24,borderRadius:6,flexShrink:0,border:'none' }}><Trash2 size={11} color="var(--text3)"/></button>
                ))}
              </div>
              {note.content && <p style={{ fontSize:12,color:'var(--text2)',lineHeight:1.6,whiteSpace:'pre-wrap' }}>{note.content}</p>}
              {note.attachments?.length > 0 && (
                <div style={{ display:'flex',flexWrap:'wrap',gap:5,marginTop:8 }}>
                  {note.attachments.map(att => (
                    <button key={att.id} className="attach-pill" onClick={()=>openBlob(att)}>
                      <FileText size={11} color={att.type==='application/pdf'?'var(--red)':'var(--blue)'}/>
                      <span style={{ maxWidth:140,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{att.name}</span>
                      <ExternalLink size={9} style={{ flexShrink:0 }}/>
                    </button>
                  ))}
                </div>
              )}
              <p style={{ fontSize:10,color:'var(--text3)',marginTop:8 }}>{note.timestamp}</p>
            </div>
          ))}
        </div>

        <div style={{ padding:'10px 18px',borderTop:'1px solid var(--line2)',flexShrink:0 }}>
          <p style={{ fontSize:10,color:'var(--text3)',textAlign:'center' }}>{isAdmin?'🔓 Admin mode · auto-saved locally':'🔒 Read-only — unlock to add notes'}</p>
        </div>
      </div>
    </>
  );
};

// ─── MCQ Solver ───────────────────────────────────────────────────────────────
const MCQSolver = ({ subjectCode, paperNum, variant, year, season, onClose, mcqState, updateMcqState }) => {
  const N = MCQ_COUNT;
  const empty = () => Array(N).fill('');

  const msKey       = year && season ? `${subjectCode}_${season}${year.slice(2)}_1_${variant}` : null;
  const hardcodedKey = msKey ? (MCQ_ANSWER_KEYS[msKey] || null) : null;

  // Controlled purely via parent's props
  const mine        = mcqState.choices || empty();
  const keyRevealed = mcqState.revealed || false;

  const key = hardcodedKey || empty();

  const subjName   = subjectName(subjectCode);
  const paperLabel = `Paper 1${variant}`;

  const answered = mine.filter(Boolean).length;
  const correct  = useMemo(() => mine.filter((a,i) => a && key[i] && a===key[i]).length, [mine, key]);
  const keyCount = key.filter(Boolean).length;
  const pct      = keyRevealed && keyCount > 0 && answered > 0 ? Math.round(correct / keyCount * 100) : null;

  const toggle = useCallback((qi, opt) => {
    if (keyRevealed) return; // lock bubbles once key is shown
    const newChoices = [...mine];
    newChoices[qi] = mine[qi] === opt ? '' : opt;
    updateMcqState({ choices: newChoices });
  }, [keyRevealed, mine, updateMcqState]);

  const clearAll = () => updateMcqState({ choices: empty(), revealed: false });
  const toggleReveal = () => updateMcqState({ revealed: !keyRevealed });

  const getBubbleCls = (qi, opt) => {
    const userPicked = mine[qi] === opt;
    const isCorrectAnswer = key[qi] === opt;
    if (!keyRevealed) {
      return 'mcq-bubble' + (userPicked ? ' sel-mine' : '');
    }
    if (userPicked && isCorrectAnswer) return 'mcq-bubble correct';
    if (userPicked && !isCorrectAnswer) return 'mcq-bubble wrong';
    if (!userPicked && isCorrectAnswer && mine[qi]) return 'mcq-bubble sel-key';
    return 'mcq-bubble';
  };

  return (
    <div className="mcq-sidebar">
      {/* ── Header ── */}
      <div style={{ padding:'14px 16px',borderBottom:'1px solid var(--line2)',flexShrink:0 }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8 }}>
          <div style={{ display:'flex',alignItems:'center',gap:9 }}>
            <div style={{ width:30,height:30,borderRadius:8,background:'var(--orange-d)',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <ListChecks size={14} color="var(--orange)"/>
            </div>
            <div>
              <div style={{ fontSize:13,fontWeight:700,color:'var(--text)' }}>MCQ Solver</div>
              <div style={{ fontSize:10,color:'var(--text3)' }}>{subjName} · {paperLabel}</div>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} style={{ width:28,height:28,borderRadius:'50%',flexShrink:0 }}><X size={13}/></button>
        </div>

        {/* Action row */}
        <div style={{ display:'flex',gap:6 }}>
          {hardcodedKey && (
            <button onClick={toggleReveal}
              style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:5,padding:'6px 10px',borderRadius:7,
                border:`1px solid ${keyRevealed?'var(--line2)':'var(--orange)'}`,cursor:'pointer',transition:'all 0.2s',
                background: keyRevealed ? 'var(--surface2)' : 'var(--orange-d)',
                color:      keyRevealed ? 'var(--text2)'   : 'var(--orange)',
                fontSize:11,fontWeight:600 }}>
              {keyRevealed ? <><EyeOff size={11}/> Hide Key</> : <><Eye size={11}/> Answer Key</>}
            </button>
          )}
          <button onClick={clearAll}
            style={{ padding:'6px 10px',borderRadius:7,border:'1px solid var(--line2)',cursor:'pointer',background:'var(--surface2)',color:'var(--text2)',fontSize:11,transition:'all 0.2s' }}>
            Reset
          </button>
        </div>

        {/* Score bar */}
        {keyRevealed && keyCount > 0 && (
          <div style={{ display:'flex',alignItems:'center',gap:10,padding:'7px 10px',borderRadius:9,background:'var(--surface2)',border:'1px solid var(--line2)',marginTop:8 }}>
            <span style={{ fontSize:20,fontWeight:700,color:pct>=70?'var(--green)':pct>=50?'var(--orange)':'var(--red)' }}>{correct}</span>
            <span style={{ fontSize:12,color:'var(--text2)' }}>/ {keyCount}</span>
            <div style={{ flex:1,height:5,borderRadius:3,background:'var(--surface3)',overflow:'hidden' }}>
              <div style={{ height:'100%',width:`${pct??0}%`,background:pct>=70?'var(--green)':pct>=50?'var(--orange)':'var(--red)',borderRadius:3,transition:'width 0.5s ease' }}/>
            </div>
            <span style={{ fontSize:12,fontWeight:600,color:'var(--text2)' }}>{pct??'—'}%</span>
          </div>
        )}
      </div>

      {/* ── Question grid ── */}
      <div className="no-sb" style={{ flex:1,overflowY:'auto',padding:'4px 14px 10px' }}>
        <div style={{ display:'grid',gridTemplateColumns:'24px 1fr',gap:6,padding:'5px 0',borderBottom:'2px solid var(--line2)',marginBottom:2 }}>
          <span style={{ fontSize:9,color:'var(--text3)',textAlign:'center' }}>Q</span>
          <span style={{ fontSize:9,letterSpacing:'0.08em',color:keyRevealed?'var(--orange)':'var(--accent)',textAlign:'center' }}>
            {keyRevealed ? 'KEY REVEALED' : 'MY ANSWERS'}
          </span>
        </div>

        {Array.from({ length: N }, (_, qi) => (
          <div key={qi} style={{ display:'grid',gridTemplateColumns:'24px 1fr',gap:6,alignItems:'center',padding:'2px 0',borderBottom:'1px solid var(--line)',minHeight:36 }}>
            <span style={{ fontSize:10,color:'var(--text3)',fontWeight:500,textAlign:'center' }}>{qi+1}</span>
            <div style={{ display:'flex',gap:3,justifyContent:'center' }}>
              {MCQ_OPTS.map(opt => {
                const cls = getBubbleCls(qi, opt);
                const isSel = mine[qi]===opt || (keyRevealed && mine[qi] && key[qi]===opt);
                return (
                  <button key={opt} className={cls} onClick={() => toggle(qi, opt)}
                    style={{ color: isSel ? undefined : 'var(--text3)', cursor: keyRevealed ? 'default' : 'pointer' }}>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── Footer ── */}
      <div style={{ padding:'8px 14px',borderTop:'1px solid var(--line2)',flexShrink:0 }}>
        <p style={{ fontSize:10,color:'var(--text3)',textAlign:'center' }}>
          {keyRevealed
            ? <><span style={{color:'var(--green)'}}>■</span> Correct &nbsp;·&nbsp; <span style={{color:'var(--red)'}}>■</span> Wrong &nbsp;·&nbsp; <span style={{color:'var(--orange)'}}>■</span> Answer</>
            : <>{hardcodedKey ? <>Click <span style={{color:'var(--orange)',fontWeight:600}}>Answer Key</span> to check</> : 'No key available for this paper'}</>
          }
        </p>
      </div>
    </div>
  );
};

// ─── StartupScreen ────────────────────────────────────────────────────────────
const StartupScreen = ({ onSelectExplorer, toggleTheme, dark }) => (
  <div className="grid-bg" style={{ minHeight:'100vh',background:'var(--bg)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px 20px',position:'relative',overflow:'hidden' }}>
    <div style={{ position:'absolute',top:'-15%',left:'-10%',width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(79,142,247,0.07) 0%,transparent 70%)',pointerEvents:'none' }}/>
    <div style={{ position:'absolute',bottom:'-15%',right:'-10%',width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(129,140,248,0.06) 0%,transparent 70%)',pointerEvents:'none' }}/>
    <div className="deco-line" style={{ top:'15%',left:'20%' }}/>
    <div className="deco-line" style={{ bottom:'15%',right:'20%' }}/>
    <button className="icon-btn" onClick={toggleTheme} style={{ position:'absolute',top:24,right:24,zIndex:10 }}>{dark?<Sun size={15}/>:<Moon size={15}/>}</button>

    <div className="anim-0" style={{ display:'flex',alignItems:'center',gap:8,marginBottom:56 }}>
      <div style={{ width:1,height:20,background:'var(--accent)' }}/>
      <span style={{ fontSize:10,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--text2)' }}>Study Tools Hub — A Level</span>
      <div style={{ width:1,height:20,background:'var(--accent)' }}/>
    </div>

    <div className="anim-1" style={{ textAlign:'center',marginBottom:64 }}>
      <h1 className="shimmer-text" style={{ fontFamily:'Roboto',fontWeight:700,fontSize:'clamp(64px,10vw,120px)',lineHeight:0.9,letterSpacing:'-0.02em',marginBottom:20 }}>The Nexus</h1>
      <p style={{ color:'var(--text2)',fontSize:16,fontWeight:300,letterSpacing:'0.06em' }}>Connect &nbsp;·&nbsp; Compile &nbsp;·&nbsp; Conquer</p>
    </div>

    <div className="anim-2" style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:20,width:'100%',maxWidth:640 }}>
      <button className="tool-card" onClick={onSelectExplorer}>
        <div className="cg-a"/>
        <div className="icon-badge" style={{ background:'var(--accent-d)',borderColor:'rgba(79,142,247,0.25)' }}><Layers size={24} color="var(--accent)"/></div>
        <h2 style={{ fontSize:22,fontWeight:700,color:'var(--text)',marginBottom:10 }}>PastPaper Explorer</h2>
        <p style={{ color:'var(--text2)',fontSize:13,lineHeight:1.6,marginBottom:20 }}>Access, view, and navigate A-Level past papers with a built-in fast PDF engine.</p>
        <div style={{ display:'flex',flexWrap:'wrap',gap:6 }}>{['Math','Physics','CS','Chemistry'].map(t=><span className="tag" key={t}>{t}</span>)}</div>
      </button>
      <button className="tool-card blue" onClick={()=>window.open('https://programming-ide.netlify.app/','_blank')}>
        <div className="cg-b"/>
        <div className="icon-badge" style={{ background:'var(--blue-d)',borderColor:'rgba(129,140,248,0.25)' }}><Terminal size={24} color="var(--blue)"/></div>
        <h2 style={{ fontSize:22,fontWeight:700,color:'var(--text)',marginBottom:10 }}>Programming IDE</h2>
        <p style={{ color:'var(--text2)',fontSize:13,lineHeight:1.6,marginBottom:20 }}>Write, compile, and run code directly in the browser. Tailored for CS 9618.</p>
        <div style={{ display:'flex',flexWrap:'wrap',gap:6 }}>{['Python','C++','Java','Browser'].map(t=><span className="tag" key={t}>{t}</span>)}</div>
      </button>
    </div>

    <div className="anim-3" style={{ marginTop:56,display:'flex',alignItems:'center',gap:16,flexWrap:'wrap',justifyContent:'center' }}>
      <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer"
        className="icon-btn" style={{ width:'auto',height:'auto',padding:'7px 14px',gap:7,display:'flex',alignItems:'center',borderRadius:8,textDecoration:'none',fontSize:11 }}>
        <Github size={13} color="var(--text2)"/>
        <span style={{ fontSize:10,color:'var(--text2)',letterSpacing:'0.06em' }}>View on GitHub</span>
      </a>
      <span style={{ color:'var(--line2)',fontSize:18 }}>·</span>
      <span style={{ fontSize:10,color:'var(--text3)',letterSpacing:'0.06em' }}>Deployed on Netlify · By M. Huzaifa Imran</span>
    </div>
  </div>
);

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark] = useState(()=>localStorage.getItem('nexusTheme')!=='light');
  useEffect(()=>{ localStorage.setItem('nexusTheme',dark?'dark':'light'); },[dark]);
  const toggleTheme = () => setDark(d=>!d);

  const [showStartup, setShowStartup] = useState(true);
  const [showContact, setShowContact] = useState(false);
  const [isViewing,   setIsViewing]   = useState(false);
  const [showNav,     setShowNav]     = useState(true);
  const [showNotes,   setShowNotes]   = useState(false);
  const [showMCQ,     setShowMCQ]     = useState(false);
  const [isAdmin,     setIsAdmin]     = useState(false);
  const [showPwModal, setShowPwModal] = useState(false);

  // MCQ Session State 
  const [mcqSessionData, setMcqSessionData] = useState({});

  const [subject, setSubject] = useState('');
  const [year,    setYear]    = useState('');
  const [season,  setSeason]  = useState('');
  const [paper,   setPaper]   = useState('');
  const [variant, setVariant] = useState('');
  const [type,    setType]    = useState('qp');

  const isComplete    = subject && year && season && paper && variant;
  const canShowNotes  = !!subject && !!paper;
  const canShowMCQ    = MCQ_SUBJECTS.includes(subject) && paper === MCQ_PAPER;

  // Track state for the active MCQ paper
  const paperKey = `${subject}_${season}${year ? year.slice(2) : ''}_${paper}_${variant}`;
  
  const currentMcqState = mcqSessionData[paperKey] || { 
    choices: Array(MCQ_COUNT).fill(''), 
    revealed: false 
  };

  const updateMcqState = useCallback((updates) => {
    setMcqSessionData(prev => ({
      ...prev,
      [paperKey]: { ...(prev[paperKey] || { choices: Array(MCQ_COUNT).fill(''), revealed: false }), ...updates }
    }));
  }, [paperKey]);

  const activeFileUrl = useMemo(() => {
    if (!isComplete) return '';
    return `/papers/${subject}_${season}${year.slice(2)}_${type}_${paper}${variant}.pdf`;
  }, [subject,year,season,paper,variant,type,isComplete]);

  const viewerSrc = useMemo(()=>`/pdf-viewer/web/viewer.html?file=${encodeURIComponent(activeFileUrl)}`,[activeFileUrl]);

  useEffect(()=>{ document.title="The Nexus | Study Tools"; },[]);
  
  // Close sidebars if the user changes the foundational paper details
  useEffect(()=>{ setShowNotes(false); setShowMCQ(false); },[subject,paper,variant,season,year]);

  const handleLoad = () => { if (!isComplete) return; setIsViewing(true); setShowNav(false); };
  const handleHome = () => { setIsViewing(false); setShowNav(true); };

  if (showStartup) return (
    <><GlobalStyles dark={dark}/><StartupScreen onSelectExplorer={()=>setShowStartup(false)} toggleTheme={toggleTheme} dark={dark}/></>
  );

  return (
    <>
      <GlobalStyles dark={dark}/>
      <ContactModal isOpen={showContact} onClose={()=>setShowContact(false)}/>
      <PasswordModal isOpen={showPwModal} onClose={()=>setShowPwModal(false)} onSuccess={()=>setIsAdmin(true)}/>

      <div style={{ display:'flex',flexDirection:'column',height:'100vh',background:'var(--bg)',overflow:'hidden' }}>

        {/* Nav */}
        <div style={{ display:'grid',gridTemplateRows:showNav?'1fr':'0fr',transition:'grid-template-rows 0.3s ease',flexShrink:0,zIndex:30 }}>
          <div style={{ overflow:'hidden',minHeight:0 }}>
            <header className="nav-bar" style={{ padding:'12px 20px' }}>
              <div className="nav-inner" style={{ maxWidth:1600,margin:'0 auto',display:'flex',flexWrap:'wrap',alignItems:'center',gap:14 }}>

                {/* Brand */}
                <div style={{ display:'flex',alignItems:'center',gap:10,marginRight:4 }}>
                  <button className="icon-btn" onClick={()=>{setShowStartup(true);handleHome();setShowNotes(false);}} title="Back" style={{ flexShrink:0 }}><ArrowLeft size={14}/></button>
                  <div style={{ display:'flex',alignItems:'center',gap:8,cursor:'pointer' }} onClick={handleHome}>
                    <div className="logo-mark"><Layers size={16} color="#fff" strokeWidth={2.2}/></div>
                    <div>
                      <div style={{ fontSize:13,fontWeight:600,color:'var(--text)',lineHeight:1.2 }}>PastPaper Explorer</div>
                      <div className="nav-brand-text" style={{ fontSize:9,color:'var(--text3)',letterSpacing:'0.1em' }}>BY M. HUZAIFA IMRAN</div>
                    </div>
                  </div>
                </div>

                <div className="nav-divider" style={{ width:1,height:32,background:'var(--line2)',flexShrink:0 }}/>

                {/* Filters */}
                <div className="nav-filters no-sb" style={{ display:'flex',alignItems:'flex-end',gap:12,flex:1,overflowX:'auto',paddingBottom:2 }}>
                  <NexusSelect label="Subject" value={subject} onChange={v=>{setSubject(v);setShowNotes(false);}} options={SUBJECTS.map(s=>({value:s.code,label:`${s.code} · ${s.name}`}))}/>
                  <NexusSelect label="Year"    value={year}    onChange={setYear}    options={YEARS}/>
                  <NexusSelect label="Season"  value={season}  onChange={setSeason}  options={SEASONS.map(s=>({value:s.code,label:s.name}))}/>
                  <NexusSelect label="Paper"   value={paper}   onChange={v=>{setPaper(v);setShowNotes(false);}} options={PAPERS}/>
                  <NexusSelect label="Variant" value={variant} onChange={setVariant} options={VARIANTS}/>

                  {/* QP / MS */}
                  <div className="seg-wrap" style={{ display:'flex',flexDirection:'column',gap:5 }}>
                    <span style={{ fontSize:9,letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--text3)',paddingLeft:2 }}>Type</span>
                    <div style={{ display:'flex',background:'var(--surface2)',border:'1px solid var(--line2)',borderRadius:8,padding:3,gap:2 }}>
                      <button className={`seg-btn ${type==='qp'?'a-accent':'inactive'}`} onClick={()=>setType('qp')}>QP</button>
                      <button className={`seg-btn ${type==='ms'?'a-blue':'inactive'}`}   onClick={()=>setType('ms')}>MS</button>
                    </div>
                  </div>

                  {/* Notes */}
                  {canShowNotes && (
                    <div style={{ display:'flex',flexDirection:'column',gap:5 }} className="anim-fade">
                      <span style={{ fontSize:9,letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--text3)',paddingLeft:2 }}>Notes</span>
                      <button onClick={()=>setShowNotes(s=>!s)}
                        style={{ display:'flex',alignItems:'center',gap:6,padding:'7px 12px',borderRadius:8,border:'none',cursor:'pointer',transition:'all 0.2s',background:showNotes?'var(--green)':'var(--green-d)',color:showNotes?'#fff':'var(--green)',fontSize:11,fontWeight:600 }}>
                        <NotebookPen size={13}/> {showNotes?'Close':'Notes'}
                      </button>
                    </div>
                  )}

                  {/* MCQ Solver */}
                  {canShowMCQ && (
                    <div style={{ display:'flex',flexDirection:'column',gap:5 }} className="anim-fade">
                      <span style={{ fontSize:9,letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--text3)',paddingLeft:2 }}>MCQ</span>
                      <button onClick={()=>setShowMCQ(s => !s)}
                        style={{ display:'flex',alignItems:'center',gap:6,padding:'7px 12px',borderRadius:8,border:'none',cursor:'pointer',transition:'all 0.2s',background:showMCQ?'var(--orange)':'var(--orange-d)',color:showMCQ?'#fff':'var(--orange)',fontSize:11,fontWeight:600 }}>
                        <ListChecks size={13}/> {showMCQ?'Close':'Solver'}
                      </button>
                    </div>
                  )}

                  {/* CS IDE */}
                  {subject==='9618' && (paper==='2'||paper==='4') && (
                    <button onClick={()=>window.open('https://programming-ide.netlify.app/','_blank')} className="anim-fade"
                      style={{ display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:8,border:'1px solid var(--blue-d)',background:'var(--blue-d)',color:'var(--blue)',fontSize:11,fontWeight:600,cursor:'pointer',transition:'all 0.2s' }}>
                      <Terminal size={13}/> IDE
                    </button>
                  )}
                </div>

                {/* Right */}
                <div className="nav-actions" style={{ display:'flex',alignItems:'center',gap:8,marginLeft:'auto',flexShrink:0 }}>
                  <button className={`btn-load ${isComplete?'ready':'disabled'}`} onClick={handleLoad} disabled={!isComplete}>
                    <Play size={11} fill="currentColor"/> {isViewing?'Reload':'Load Paper'}
                  </button>
                  {isViewing && <button className="icon-btn" onClick={()=>setShowNav(false)} title="Collapse"><ChevronUp size={13}/></button>}
                  <div style={{ width:1,height:22,background:'var(--line2)' }}/>
                  <button className="icon-btn" onClick={toggleTheme}>{dark?<Sun size={13}/>:<Moon size={13}/>}</button>
                  <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="icon-btn" style={{ textDecoration:'none' }}><Github size={13}/></a>
                  <button className="icon-btn" onClick={()=>setShowContact(true)}><Mail size={13}/></button>
                </div>

              </div>
            </header>
          </div>
        </div>

        {/* Pull tab */}
        {isViewing && !showNav && (
          <button className="pull-tab" onClick={()=>setShowNav(true)} onMouseEnter={()=>setShowNav(true)}>
            <ChevronDown size={11}/> show navigation <ChevronDown size={11}/>
          </button>
        )}

        {/* Main */}
        <main style={{ flex:1,display:'flex',flexDirection:'column',overflow:'hidden',position:'relative' }}>
          {isViewing && showNav && <div style={{ position:'absolute',inset:0,zIndex:20,cursor:'pointer' }} onMouseEnter={()=>setShowNav(false)} onClick={()=>setShowNav(false)}/>}

          {showNotes && canShowNotes && (
            <NotesSidebar subjectCode={subject} paperNum={paper} variant={variant} year={year} season={season} onClose={()=>setShowNotes(false)} isAdmin={isAdmin} onRequestAuth={()=>setShowPwModal(true)}/>
          )}

          {/* Empty state */}
          {!isViewing && (
            <div className="grid-bg anim-fade" style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:40,textAlign:'center',background:'var(--bg)' }}>
              <div style={{ position:'absolute',top:'20%',left:'25%',width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(79,142,247,0.04) 0%,transparent 70%)',pointerEvents:'none' }}/>
              <div style={{ position:'absolute',bottom:'20%',right:'25%',width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(129,140,248,0.04) 0%,transparent 70%)',pointerEvents:'none' }}/>
              <div className="empty-icon-ring" style={{ marginBottom:32,zIndex:1 }}><BookOpen size={38} color="var(--accent)" strokeWidth={1.5}/></div>
              <h2 style={{ fontSize:36,fontWeight:700,color:'var(--text)',marginBottom:14,zIndex:1 }}>Ready to study?</h2>
              <p style={{ color:'var(--text2)',fontSize:15,lineHeight:1.7,maxWidth:420,marginBottom:32,fontWeight:300,zIndex:1 }}>
                Configure your paper above — subject, year, season, paper, and variant — then hit&nbsp;
                <span style={{ fontSize:12,color:'var(--accent)',background:'var(--accent-d)',padding:'2px 8px',borderRadius:5,whiteSpace:'nowrap' }}>Load Paper</span>
                &nbsp;to open the viewer.
              </p>
              <div style={{ display:'flex',gap:10,flexWrap:'wrap',justifyContent:'center',zIndex:1 }}>
                {['Fast PDF Engine','Full-Screen Viewer','16 Years of Papers','Subject Notes','MCQ Solver','File Attachments'].map(t=>(
                  <span className="tag" key={t} style={{ fontSize:11 }}><span style={{ color:'var(--accent)',fontSize:8 }}>✦</span> {t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Viewing Container (PDF + MCQ Sidebar inline) */}
          {isViewing && (
            <div className="anim-fade" style={{ flex:1,display:'flex',overflow:'hidden',position:'relative' }}>
              {/* PDF Container */}
              <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                <iframe src={viewerSrc} style={{ width:'100%',height:'100%',border:'none',background:'#fff' }} title="PDF Viewer" allowFullScreen/>
              </div>

              {/* MCQ Sidebar (Side-by-Side on Desktop, Overlays as bottom sheet on Mobile) */}
              {showMCQ && canShowMCQ && (
                <MCQSolver 
                  subjectCode={subject} paperNum={paper} variant={variant} year={year} season={season} 
                  onClose={()=>setShowMCQ(false)}
                  mcqState={currentMcqState} 
                  updateMcqState={updateMcqState}
                />
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
