import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  BookOpen, ChevronDown, ChevronUp, Mail, X, Copy, Check,
  Play, Github, Terminal, ArrowLeft, Layers, Sun, Moon,
  NotebookPen, Lock, Plus, Trash2, FileText, Eye, EyeOff,
  Paperclip, ExternalLink, ListChecks, AlertCircle, Compass,
  Search, Clock, ArrowRight, Activity, Zap, Beaker, Code2
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
const MCQ_SUBJECTS  = ['9700', '9701', '9702']; 
const MCQ_PAPER     = '1';
const MCQ_COUNT     = 40;
const MCQ_OPTS      = ['A', 'B', 'C', 'D'];

// ─── Topical Taxonomy (Strict Syllabus Mapping) ───────────────────────────────
const SYLLABUS_STRUCTURE = {
  '9618': {
    '1': { title: 'AS Level Theory', topics: ['Data Representation', 'Networking', 'Hardware & Processors', 'Logic Gates', 'Assembly Language', 'System Software', 'Security, Privacy & Ethics', 'Databases'] },
    '2': { title: 'AS Problem Solving', topics: ['Algorithm Design', 'Data Structures', 'Programming Concepts', 'Software Development'] },
    '3': { title: 'A Level Advanced Theory', topics: ['Advanced Data Representation', 'Advanced Networking', 'Hardware & Virtual Machines', 'Advanced System Software', 'Artificial Intelligence'] },
    '4': { title: 'A Level Practical', topics: ['Algorithms & Recursion', 'OOP & Paradigms', 'File Processing'] }
  },
  '9702': {
    '1': { title: 'AS Level Theory (MCQ)', topics: ['Physical Quantities & Units', 'Kinematics', 'Dynamics', 'Forces, Density & Pressure', 'Work, Energy & Power', 'Deformation of Solids', 'Waves & Superposition', 'Electricity & D.C. Circuits', 'Particle Physics'] },
    '2': { title: 'AS Level Structured', topics: ['Physical Quantities & Units', 'Kinematics', 'Dynamics', 'Forces, Density & Pressure', 'Work, Energy & Power', 'Deformation of Solids', 'Waves & Superposition', 'Electricity & D.C. Circuits', 'Particle Physics'] },
    '4': { title: 'A Level Structured', topics: ['Motion in a Circle & Gravitation', 'Thermal Physics & Ideal Gases', 'Oscillations', 'Electric & Magnetic Fields', 'Capacitance & Alternating Current', 'Quantum & Nuclear Physics', 'Medical Physics & Cosmology'] }
  },
  '9701': {
    '1': { title: 'AS Level Theory (MCQ)', topics: ['Physical: Atoms, Bonding & Stoichiometry', 'Physical: Energetics & Kinetics', 'Physical: Equilibria & Electrochemistry', 'Inorganic: Periodicity & Groups 2/17', 'Organic: Intro & Hydrocarbons', 'Organic: Halogens, Hydroxy & Carbonyls', 'Organic: Carboxylic, Nitrogen & Polymers'] },
    '2': { title: 'AS Level Structured', topics: ['Physical: Atoms, Bonding & Stoichiometry', 'Physical: Energetics & Kinetics', 'Physical: Equilibria & Electrochemistry', 'Inorganic: Periodicity & Groups 2/17', 'Organic: Intro & Hydrocarbons', 'Organic: Halogens, Hydroxy & Carbonyls', 'Organic: Carboxylic, Nitrogen & Polymers'] },
    '4': { title: 'A Level Structured', topics: ['Further Physical: Thermodynamics & Kinetics', 'Further Physical: Equilibria & Electrochemistry', 'Further Inorganic: Transition Elements', 'Further Organic: Arenes & Derivatives', 'Further Organic: Nitrogen Compounds & Polymers', 'Analytical Techniques (NMR & Chromatography)'] }
  }
};

// ─── Hardcoded Answer Keys ─────────────────────────────────────────────────────
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
  '9700_s24_1_3': ['D','A','C','B','C','B','D','A','C','B','A','C','B','C','C','D','C','B','D','A','D','A','D','B','D','D','A','B','A','B','B','B','C','C','D','C','C','B','A','A'],
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
  '9702_s24_1_2': ['C','D','A','D','B','C','C','B','D','C','D','A','C','D','D','B','C','C','A','C','B','A','C','C','C','B','D','B','B','B','A','B','A','B','B','A','D','B','D','C'],
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
const MAX_FILE_BYTES  = 1.5 * 1024 * 1024; 

// ─── Helpers ──────────────────────────────────────────────────────────────────
const loadNotes    = () => { try { return JSON.parse(localStorage.getItem(NOTES_KEY) || '{}'); } catch { return {}; } };
const saveNotes    = (n) => localStorage.setItem(NOTES_KEY, JSON.stringify(n));
const noteKey      = (code, paper) => `${code}_${paper}`;
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

// ─── GlobalStyles (Massive Visual Upgrade) ────────────────────────────────────
const GlobalStyles = ({ dark }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Roboto+Mono:wght@400;500&display=swap');
    
    *, *::before, *::after { box-sizing: border-box; margin: 0; }
    
    :root {
      /* Base Colors */
      --bg:        ${dark ? '#05050A' : '#f8fafc'};
      --bg2:       ${dark ? '#0a0a14' : '#ffffff'};
      --surface:   ${dark ? 'rgba(15, 15, 25, 0.6)' : 'rgba(255, 255, 255, 0.8)'};
      --surface2:  ${dark ? 'rgba(25, 25, 40, 0.8)' : 'rgba(241, 245, 249, 0.9)'};
      --surface3:  ${dark ? 'rgba(35, 35, 55, 0.9)' : 'rgba(226, 232, 240, 0.9)'};
      
      /* Borders & Lines */
      --line:      ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'};
      --line2:     ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'};
      
      /* Typography */
      --text:      ${dark ? '#f8fafc' : '#0f172a'};
      --text2:     ${dark ? '#94a3b8' : '#64748b'};
      --text3:     ${dark ? '#475569' : '#94a3b8'};
      
      /* Vibrant Accents */
      --accent:    ${dark ? '#6366f1' : '#4f46e5'}; /* Default Indigo */
      --teal:      ${dark ? '#2dd4bf' : '#0d9488'};
      --amber:     ${dark ? '#fbbf24' : '#d97706'};
      --rose:      ${dark ? '#fb7185' : '#e11d48'};
      --green:     ${dark ? '#34d399' : '#059669'};
      --red:       ${dark ? '#f87171' : '#dc2626'};
    }

    html, body, #root { height: 100%; background: var(--bg); }
    body { font-family: 'Outfit', sans-serif; color: var(--text); -webkit-font-smoothing: antialiased; }
    
    ::selection { background: rgba(99, 102, 241, 0.3); color: var(--text); }
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--line2); border-radius: 10px; }

    /* Animations */
    @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
    @keyframes pulseGlow { 0%{opacity:0.3} 50%{opacity:0.6} 100%{opacity:0.3} }
    @keyframes slideInLeft  { from{transform:translateX(-100%)} to{transform:translateX(0)} }
    @keyframes slideInRight { from{transform:translateX(100%)}  to{transform:translateX(0)} }

    .anim-0 { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .anim-1 { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both; }
    .anim-2 { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both; }
    .anim-3 { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both; }
    .anim-fade { animation: fadeIn 0.4s ease both; }

    /* Glassmorphic Background Grid */
    .bg-grid {
      position: absolute; inset: 0; pointer-events: none; z-index: 0;
      background-image: 
        linear-gradient(to right, var(--line) 1px, transparent 1px),
        linear-gradient(to bottom, var(--line) 1px, transparent 1px);
      background-size: 64px 64px;
      mask-image: radial-gradient(circle at center, black, transparent 80%);
      -webkit-mask-image: radial-gradient(circle at center, black, transparent 80%);
    }

    /* Core UI Elements */
    .glass-panel {
      background: var(--surface);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid var(--line2);
    }

    .icon-btn { display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:10px;border:1px solid var(--line2);background:var(--surface2);color:var(--text2);cursor:pointer;transition:all 0.2s; }
    .icon-btn:hover { color:var(--text);background:var(--surface3); transform: translateY(-1px); }

    .shimmer-text { 
      background: linear-gradient(to right, var(--text) 20%, var(--text2) 40%, var(--text2) 60%, var(--text) 80%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: shimmer 6s linear infinite;
    }

    /* Form Inputs */
    .nexus-select { appearance:none;background:var(--surface2);border:1px solid var(--line2);border-radius:8px;color:var(--text);font-family:'Outfit',sans-serif;font-size:12px;font-weight:500;padding:8px 30px 8px 12px;cursor:pointer;transition:all 0.2s;outline:none; }
    .nexus-select:hover { border-color:var(--text3); }
    .nexus-select:focus { border-color:var(--accent); box-shadow:0 0 0 3px rgba(99,102,241,0.15); }
    .nexus-select option { background:var(--bg2);color:var(--text); }

    .seg-btn { padding:6px 16px;border-radius:6px;font-size:11px;font-family:'Outfit',sans-serif;font-weight:600;cursor:pointer;transition:all 0.2s;border:none;background:none; }
    .seg-btn.a-accent { background:var(--text);color:var(--bg); }
    .seg-btn.inactive { color:var(--text2); }
    .seg-btn.inactive:hover { color:var(--text); }

    .btn-load { display:inline-flex;align-items:center;gap:8px;padding:9px 24px;border-radius:10px;font-size:13px;font-weight:600;font-family:'Outfit',sans-serif;border:none;cursor:pointer;transition:all 0.2s; }
    .btn-load.ready { background:var(--text);color:var(--bg);box-shadow:0 4px 14px rgba(0,0,0,0.2); }
    .btn-load.ready:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,0.3); }
    .btn-load.ready:active { transform:translateY(0); }
    .btn-load.disabled { background:var(--surface2);color:var(--text3);cursor:not-allowed; }

    /* Modals & Sidebars */
    .modal-overlay { position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);animation:fadeIn 0.2s ease both;padding:16px; }
    .modal-box { background:var(--bg2);border:1px solid var(--line2);border-radius:24px;width:100%;max-width:420px;position:relative;overflow:hidden;animation:fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) both; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }

    .notes-sidebar { position:absolute;left:0;top:0;bottom:0;width:340px;z-index:50;background:var(--bg2);border-right:1px solid var(--line2);display:flex;flex-direction:column;box-shadow:4px 0 30px rgba(0,0,0,0.2);animation:slideInLeft 0.3s cubic-bezier(0.16,1,0.3,1) both; }
    .notes-backdrop { position:absolute;inset:0;z-index:49;background:rgba(0,0,0,0.4);backdrop-filter:blur(2px); }

    .topicals-sidebar { position: relative; width: 340px; flex-shrink: 0; background: var(--bg2); border-right: 1px solid var(--line2); display: flex; flex-direction: column; z-index: 10; animation: slideInLeft 0.3s cubic-bezier(0.16,1,0.3,1) both; }
    .mcq-sidebar { position: relative; width: 340px; flex-shrink: 0; background: var(--bg2); border-left: 1px solid var(--line2); display: flex; flex-direction: column; animation: slideInRight 0.3s cubic-bezier(0.16,1,0.3,1) both; }

    .n-input { width:100%;background:var(--surface);border:1px solid var(--line2);border-radius:10px;color:var(--text);font-family:'Outfit',sans-serif;font-size:14px;padding:12px 14px;outline:none;resize:vertical;transition:all 0.2s; }
    .n-input:focus { border-color:var(--accent);box-shadow:0 0 0 3px rgba(99,102,241,0.15); }
    .n-input::placeholder { color:var(--text3); }

    .mcq-bubble { width:32px;height:32px;border-radius:50%;border:1.5px solid var(--line2);background:transparent;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;justify-content:center; }
    .mcq-bubble:hover { border-color:var(--text2);color:var(--text); }
    .mcq-bubble.sel-mine { background:var(--text);border-color:var(--text);color:var(--bg); }
    .mcq-bubble.sel-key  { background:var(--amber);border-color:var(--amber);color:#fff; }
    .mcq-bubble.correct  { background:var(--green);border-color:var(--green);color:#fff; }
    .mcq-bubble.wrong    { background:var(--red);border-color:var(--red);color:#fff; }

    /* Custom scrollbars for sidebars */
    .custom-sb::-webkit-scrollbar { width: 4px; }
    .custom-sb::-webkit-scrollbar-track { background: transparent; }
    .custom-sb::-webkit-scrollbar-thumb { background: var(--line2); border-radius: 4px; }
    .custom-sb:hover::-webkit-scrollbar-thumb { background: var(--text3); }
    
    .tools-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; width: 100%; max-width: 1000px; }
    .featured-card { grid-column: 1 / -1; }
    
    @media (max-width: 768px) {
      .tools-grid { grid-template-columns: 1fr; }
      .featured-card { flex-direction: column !important; }
      .topical-visual { justify-content: center !important; padding: 0 24px 24px 24px !important; }
      .topicals-sidebar { position: absolute !important; z-index: 50; height: 100%; border-right: none !important; box-shadow: 4px 0 30px rgba(0,0,0,0.3); }
      .mcq-sidebar { position: absolute !important; bottom: 0; left: 0; right: 0; top: auto; width: 100% !important; height: 60vh; border-left: none !important; border-top: 1px solid var(--line2); box-shadow: 0 -10px 40px rgba(0,0,0,0.4); animation: slideUp 0.3s cubic-bezier(0.16,1,0.3,1) both; z-index: 50; border-radius: 20px 20px 0 0; }
    }
  `}</style>
);

// ─── StartupScreen (The Redesigned Command Center) ────────────────────────────
const StartupScreen = ({ onSelectExplorer, onSelectTopicals, toggleTheme, dark }) => {
  const [activeTab, setActiveTab] = useState('9618'); // Default to CS

  // Dynamic Theme Colors based on active subject
  const brandColors = {
    '9618': { hex: 'var(--teal)', name: 'Computer Science', icon: <Terminal size={16}/> },
    '9702': { hex: 'var(--amber)', name: 'Physics', icon: <Zap size={16}/> },
    '9701': { hex: 'var(--rose)', name: 'Chemistry', icon: <Beaker size={16}/> },
    '9709': { hex: 'var(--accent)', name: 'Mathematics', icon: <Activity size={16}/> }
  };

  const currentBrand = brandColors[activeTab] || brandColors['9709'];

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden' }}>
      {/* Dynamic Background Glow */}
      <div style={{ position:'absolute', top:'-20%', left:'50%', transform:'translateX(-50%)', width:'80vw', height:'60vh', background:`radial-gradient(ellipse at top, ${currentBrand.hex} 0%, transparent 60%)`, opacity: dark ? 0.12 : 0.08, pointerEvents:'none', zIndex: 0, transition:'background 0.5s ease' }}/>
      <div className="bg-grid" />

      {/* Minimal Top Nav */}
      <header style={{ padding:'24px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', zIndex:10, position:'relative' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:12, background:'var(--text)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Layers size={20} color="var(--bg)" strokeWidth={2.5}/>
          </div>
          <div>
            <h1 style={{ fontSize:18, fontWeight:700, letterSpacing:'-0.02em', color:'var(--text)' }}>The Nexus</h1>
            <p style={{ fontSize:11, fontWeight:500, letterSpacing:'0.1em', color:'var(--text3)', textTransform:'uppercase' }}>Study Environment</p>
          </div>
        </div>
        <div style={{ display:'flex', gap:12 }}>
          <button className="icon-btn" onClick={toggleTheme}>{dark ? <Sun size={16}/> : <Moon size={16}/>}</button>
          <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="icon-btn" style={{ textDecoration:'none' }}><Github size={16}/></a>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'0 20px', zIndex:10, position:'relative' }}>
        
        <div className="anim-0" style={{ textAlign:'center', marginBottom:48 }}>
          <h2 className="shimmer-text" style={{ fontSize:'clamp(48px, 8vw, 80px)', fontWeight:800, lineHeight:1, letterSpacing:'-0.03em', marginBottom:24 }}>
            Master your syllabus.
          </h2>
          <p style={{ fontSize:18, color:'var(--text2)', fontWeight:400, maxWidth:600, margin:'0 auto', lineHeight:1.5 }}>
            A high-performance workspace engineered for Cambridge A-Level students. Search topics, extract papers, and compile code.
          </p>
        </div>

        {/* Subject Context Toggle */}
        <div className="anim-1" style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:8, background:'var(--surface2)', padding:6, borderRadius:100, border:'1px solid var(--line2)', marginBottom:48, backdropFilter:'blur(20px)' }}>
          {Object.entries(brandColors).map(([code, data]) => {
            const isActive = activeTab === code;
            return (
              <button key={code} onClick={() => setActiveTab(code)}
                style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:100, border:'none', cursor:'pointer', transition:'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                  background: isActive ? 'var(--surface)' : 'transparent',
                  color: isActive ? 'var(--text)' : 'var(--text3)',
                  fontWeight: isActive ? 600 : 500,
                  boxShadow: isActive ? `0 4px 20px rgba(0,0,0,0.1), inset 0 0 0 1px ${data.hex}` : 'none'
                }}>
                <span style={{ color: isActive ? data.hex : 'currentColor' }}>{data.icon}</span>
                {data.name}
              </button>
            )
          })}
        </div>

        {/* Modular Tools Grid */}
        <div className="anim-3 tools-grid">
          
          {/* Tool 1: Jump Back In */}
          <div className="glass-panel" style={{ padding:28, borderRadius:24, cursor:'pointer', transition:'all 0.3s', display:'flex', flexDirection:'column', justifyContent:'space-between' }}
               onClick={() => onSelectExplorer(activeTab)}
               onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--text2)'; }}
               onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--line2)'; }}>
            <div>
              <div style={{ width:48, height:48, borderRadius:14, background:'var(--surface2)', border:'1px solid var(--line2)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
                <Layers size={20} color="var(--text)"/>
              </div>
              <h3 style={{ fontSize:20, fontWeight:700, marginBottom:8 }}>PastPaper Explorer</h3>
              <p style={{ fontSize:14, color:'var(--text2)', lineHeight:1.5 }}>Search, filter, and load papers instantly with a built-in fast PDF engine.</p>
            </div>
            <div style={{ marginTop:24, display:'flex', flexWrap:'wrap', gap:8 }}>
              {['QP & MS', '16 Years', 'File Attachments'].map(p => <span key={p} style={{ fontSize:11, fontWeight:500, padding:'4px 10px', background:'var(--surface2)', borderRadius:100, border:'1px solid var(--line2)', color:'var(--text3)' }}>{p}</span>)}
            </div>
          </div>

          {/* Tool 2: IDE */}
          <div className="glass-panel" style={{ padding:28, borderRadius:24, cursor:'pointer', transition:'all 0.3s', display:'flex', flexDirection:'column', justifyContent:'space-between' }}
               onClick={()=>window.open('https://programming-ide.netlify.app/','_blank')}
               onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--text2)'; }}
               onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--line2)'; }}>
            <div>
              <div style={{ width:48, height:48, borderRadius:14, background:'var(--surface2)', border:'1px solid var(--line2)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
                <Code2 size={20} color="var(--text)"/>
              </div>
              <h3 style={{ fontSize:20, fontWeight:700, marginBottom:8 }}>Programming IDE</h3>
              <p style={{ fontSize:14, color:'var(--text2)', lineHeight:1.5 }}>Write, compile, and run code entirely in your browser. Built for 9618.</p>
            </div>
             <div style={{ marginTop:24, display:'flex', flexWrap:'wrap', gap:8 }}>
              {['Python', 'C++', 'Java', 'Visual Basic'].map(p => <span key={p} style={{ fontSize:11, fontWeight:500, padding:'4px 10px', background:'var(--surface2)', borderRadius:100, border:'1px solid var(--line2)', color:'var(--text3)' }}>{p}</span>)}
            </div>
          </div>

          {/* Tool 3: Topicals (FEATURED WIDE CARD) */}
          <div className="glass-panel featured-card" style={{ padding: 0, borderRadius: 24, cursor: 'pointer', transition: 'all 0.3s', display: 'flex', flexDirection: 'row', overflow: 'hidden', position: 'relative' }}
               onClick={() => onSelectTopicals(activeTab)}
               onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = currentBrand.hex; e.currentTarget.querySelector('.feature-glow').style.opacity = '0.3'; }}
               onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--line2)'; e.currentTarget.querySelector('.feature-glow').style.opacity = '0.1'; }}>
            
            {/* Background Glow */}
            <div className="feature-glow" style={{ position:'absolute', top:0, right:0, width:'50%', height:'100%', background:`radial-gradient(ellipse at right, ${currentBrand.hex}, transparent 70%)`, opacity:0.1, transition:'opacity 0.4s', pointerEvents:'none' }} />

            {/* Left Content */}
            <div style={{ flex: 1, padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ width:48, height:48, borderRadius:14, background:`var(--surface2)`, border:`1px solid var(--line2)`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
                <Compass size={20} color={currentBrand.hex}/>
              </div>
              <h3 style={{ fontSize:24, fontWeight:700, marginBottom:8 }}>Topical Database</h3>
              <p style={{ fontSize:15, color:'var(--text2)', lineHeight:1.6, maxWidth:400, marginBottom: 24 }}>
                Don't just scan years—target your weaknesses. Dive into a massive database of past paper questions strictly indexed by the official syllabus structure.
              </p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                <span style={{ fontSize:13, fontWeight: 600, padding:'8px 16px', background:'var(--text)', borderRadius:10, color:'var(--bg)', display:'inline-flex', alignItems:'center' }}>
                  Explore Topics <ArrowRight size={14} style={{marginLeft:6}}/>
                </span>
              </div>
            </div>

            {/* Right Visual Representation */}
            <div className="topical-visual" style={{ flex: 1, padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', zIndex: 1 }}>
              <div style={{ width: '100%', maxWidth: 320, background: 'var(--bg2)', borderRadius: 16, border: '1px solid var(--line2)', padding: 16, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 12, display: 'flex', alignItems:'center', gap: 6 }}>
                  <Layers size={14} color="var(--text3)"/> Paper 1 Topics
                </div>
                {[
                  { t: activeTab==='9701' ? 'Atoms & Stoichiometry' : activeTab==='9702' ? 'Kinematics' : 'Data Representation', q: 42 },
                  { t: activeTab==='9701' ? 'Energetics & Kinetics' : activeTab==='9702' ? 'Dynamics' : 'Networking', q: 28 },
                  { t: activeTab==='9701' ? 'Periodicity' : activeTab==='9702' ? 'Waves & Superposition' : 'Hardware & Processors', q: 35 }
                ].map((mock, i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding: '10px 12px', background: 'var(--surface2)', borderRadius: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>{mock.t}</span>
                    <span style={{ fontSize: 11, color: 'var(--text3)', background: 'var(--surface3)', padding: '2px 8px', borderRadius: 12 }}>{mock.q} Qs</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </main>
      
      <footer style={{ padding:'24px', textAlign:'center', zIndex:10 }}>
        <p style={{ fontSize:12, color:'var(--text3)', letterSpacing:'0.05em', fontWeight:500 }}>MUHAMMAD HUZAIFA IMRAN</p>
      </footer>
    </div>
  );
};

// ─── NexusSelect, Modals, and Sidebars ───────────────────────────────────────

const NexusSelect = ({ label, value, onChange, options }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
    <span style={{ fontSize:10, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text3)', paddingLeft:4 }}>{label}</span>
    <div style={{ position:'relative' }}>
      <select value={value} onChange={e => onChange(e.target.value)} className="nexus-select">
        <option value="" disabled>—</option>
        {options.map((opt, i) => { const v = typeof opt==='object'?opt.value:opt; const l = typeof opt==='object'?opt.label:opt; return <option key={i} value={v}>{l}</option>; })}
      </select>
      <ChevronDown size={14} style={{ position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',color:'var(--text3)',pointerEvents:'none' }} />
    </div>
  </div>
);

const ContactModal = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const email = "huzaifa.bravo@gmail.com";
  useEffect(() => { if (copied) { const t = setTimeout(()=>setCopied(false),2000); return ()=>clearTimeout(t); } }, [copied]);
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e=>e.stopPropagation()}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'24px',borderBottom:'1px solid var(--line2)' }}>
          <div style={{ display:'flex',alignItems:'center',gap:12 }}>
            <div style={{ width:36,height:36,borderRadius:10,background:'var(--surface2)',display:'flex',alignItems:'center',justifyContent:'center' }}><Mail size={18} color="var(--text)" /></div>
            <span style={{ fontSize:20,fontWeight:700,color:'var(--text)' }}>Contact</span>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>
        <div style={{ padding:'32px 24px',textAlign:'center' }}>
          <p style={{ color:'var(--text2)',fontSize:15,lineHeight:1.6,marginBottom:24 }}>Questions, feedback, or just want to say hi?<br />Drop a line below.</p>
          <div style={{ display:'flex',alignItems:'center',gap:10,background:'var(--surface2)',border:'1px solid var(--line2)',borderRadius:12,padding:'8px 8px 8px 16px',marginBottom:12 }}>
            <span style={{ flex:1,fontSize:14,color:'var(--text)',textAlign:'left',fontFamily:'Roboto Mono, monospace' }}>{email}</span>
            <button onClick={()=>{navigator.clipboard.writeText(email);setCopied(true);}}
              style={{ display:'flex',alignItems:'center',gap:6,padding:'10px 16px',borderRadius:8,border:'none',cursor:'pointer',background:copied?'var(--text)':'var(--surface3)',color:copied?'var(--bg)':'var(--text)',fontSize:13,fontWeight:600,transition:'all 0.2s' }}>
              {copied?<><Check size={14}/> Copied</>:<><Copy size={14}/> Copy</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PasswordModal = ({ isOpen, onClose, onSuccess }) => {
  const [pw, setPw] = useState(''); const [show, setShow] = useState(false); const [err, setErr] = useState(false);
  const ref = useRef(null);
  useEffect(() => { if (isOpen) { setPw(''); setErr(false); setTimeout(()=>ref.current?.focus(),100); } }, [isOpen]);
  const submit = () => { if (pw===NOTES_PASSWORD) { onSuccess(); onClose(); setPw(''); setErr(false); } else { setErr(true); setPw(''); } };
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth:360 }} onClick={e=>e.stopPropagation()}>
        <div style={{ padding:'24px' }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24 }}>
            <div style={{ display:'flex',alignItems:'center',gap:12 }}>
              <div style={{ width:36,height:36,borderRadius:10,background:'var(--surface2)',display:'flex',alignItems:'center',justifyContent:'center' }}><Lock size={18} color="var(--text)" /></div>
              <div><div style={{ fontSize:18,fontWeight:700,color:'var(--text)' }}>Admin Access</div><div style={{ fontSize:12,color:'var(--text3)' }}>Enter password to add notes</div></div>
            </div>
            <button className="icon-btn" onClick={onClose}><X size={16} /></button>
          </div>
          <div style={{ position:'relative',marginBottom:err?12:20 }}>
            <input ref={ref} type={show?'text':'password'} className="n-input" placeholder="Password" value={pw}
              onChange={e=>{setPw(e.target.value);setErr(false);}} onKeyDown={e=>e.key==='Enter'&&submit()}
              style={{ paddingRight:44,borderColor:err?'var(--red)':undefined }} />
            <button onClick={()=>setShow(s=>!s)} style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--text3)' }}>
              {show?<EyeOff size={16}/>:<Eye size={16}/>}
            </button>
          </div>
          {err && <p style={{ fontSize:12,color:'var(--red)',marginBottom:16 }}>Incorrect password. Try again.</p>}
          <button onClick={submit} style={{ width:'100%',padding:'14px',borderRadius:10,border:'none',cursor:'pointer',background:'var(--text)',color:'var(--bg)',fontSize:14,fontWeight:600,transition:'all 0.2s' }}>Unlock Database</button>
        </div>
      </div>
    </div>
  );
};

const TopicalsSidebar = ({ subjectCode, topicalDb, onClose, onSelectQuestion }) => {
  const [expandedPaper, setExpandedPaper] = useState(null);
  const [expandedTopic, setExpandedTopic] = useState(null);
  const subjName = subjectCode ? subjectName(subjectCode) : null;
  const db = topicalDb && subjectCode ? topicalDb[subjectCode] : null;
  const syllabus = subjectCode ? SYLLABUS_STRUCTURE[subjectCode] : null;

  return (
    <div className="topicals-sidebar">
      <div style={{ padding:'20px 24px',borderBottom:'1px solid var(--line2)',flexShrink:0 }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div style={{ display:'flex',alignItems:'center',gap:12 }}>
            <div style={{ width:36,height:36,borderRadius:10,background:'var(--surface2)',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <Compass size={18} color="var(--text)"/>
            </div>
            <div>
              <div style={{ fontSize:16,fontWeight:700,color:'var(--text)' }}>Topical Extraction</div>
              <div style={{ fontSize:12,color:'var(--text3)' }}>{subjName || 'No Subject Selected'}</div>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={16}/></button>
        </div>
      </div>

      <div className="custom-sb" style={{ flex:1, overflowY:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:12 }}>
        {!subjectCode ? (
          <div style={{ textAlign:'center',padding:'60px 0',color:'var(--text3)' }}>
            <Compass size={48} style={{ opacity:0.2,marginBottom:16 }}/>
            <p style={{ fontSize:15,fontWeight:600,marginBottom:8,color:'var(--text)' }}>Select a Subject</p>
            <p style={{ fontSize:13,lineHeight:1.6 }}>Please select a subject from the top navigation to view topical questions.</p>
          </div>
        ) : !syllabus ? (
           <div style={{ textAlign:'center',padding:'60px 0',color:'var(--text3)' }}>
            <Compass size={48} style={{ opacity:0.2,marginBottom:16 }}/>
            <p style={{ fontSize:15,fontWeight:600,marginBottom:8,color:'var(--text)' }}>Coming Soon</p>
            <p style={{ fontSize:13,lineHeight:1.6 }}>Topical mapping is currently available for Computer Science (9618), Physics (9702), and Chemistry (9701).</p>
          </div>
        ) : (
          Object.keys(syllabus).sort().map(pNum => {
            const paperData = syllabus[pNum];
            return (
            <div key={pNum} style={{ background:'var(--surface)',border:'1px solid var(--line2)',borderRadius:14,overflow:'hidden',flexShrink:0 }}>
              <button 
                onClick={() => { setExpandedPaper(expandedPaper === pNum ? null : pNum); setExpandedTopic(null); }}
                style={{ width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px',background:'var(--surface2)',border:'none',color:'var(--text)',cursor:'pointer' }}>
                <div style={{ textAlign:'left' }}>
                  <div style={{ fontSize:15, fontWeight:700 }}>Paper {pNum}</div>
                  <div style={{ fontSize:12, color:'var(--text2)', marginTop:4 }}>{paperData.title}</div>
                </div>
                {expandedPaper === pNum ? <ChevronUp size={18} color="var(--text3)"/> : <ChevronDown size={18} color="var(--text3)"/>}
              </button>
              
              {expandedPaper === pNum && (
                <div style={{ padding:'12px',display:'flex',flexDirection:'column',gap:8 }}>
                  {paperData.topics.map(topic => {
                    const questions = db?.[pNum]?.topics?.[topic] || [];
                    return (
                    <div key={topic} style={{ background:'var(--surface2)',border:'1px solid var(--line2)',borderRadius:10,overflow:'hidden' }}>
                      <button onClick={() => setExpandedTopic(expandedTopic === topic ? null : topic)}
                        style={{ width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px',background:'transparent',border:'none',color:'var(--text)',fontWeight:600,fontSize:13,cursor:'pointer' }}>
                        <span style={{ textAlign:'left', paddingRight:12, lineHeight:1.3 }}>{topic}</span>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                           <span style={{ fontSize:11, background:'var(--surface3)', padding:'4px 8px', borderRadius:100, color:'var(--text2)' }}>
                             {questions.length}
                           </span>
                           {expandedTopic === topic ? <ChevronUp size={16} color="var(--text3)"/> : <ChevronDown size={16} color="var(--text3)"/>}
                        </div>
                      </button>
                      
                      {expandedTopic === topic && (
                        <div style={{ padding:'0 12px 12px',display:'flex',flexDirection:'column',gap:8 }}>
                          {questions.length === 0 ? (
                            <p style={{ fontSize:12, color:'var(--text3)', textAlign:'center', padding:'12px 0' }}>No questions indexed yet.</p>
                          ) : (
                            questions.map((item, idx) => (
                              <button key={idx} onClick={() => onSelectQuestion(item.paper_id, item.page_number)}
                                style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px',background:'var(--surface)',border:'1px solid var(--line2)',borderRadius:8,cursor:'pointer', transition:'border-color 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text3)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--line2)'}>
                                <div style={{ textAlign:'left' }}>
                                  <div style={{ fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:4 }}>{item.season_year.toUpperCase()} · Var {item.variant}</div>
                                  <div style={{ fontSize:11,color:'var(--text2)' }}>Question {item.questions.join(', ')}</div>
                                </div>
                                <div style={{ fontSize:11,fontWeight:600,color:'var(--text3)',background:'var(--surface2)',padding:'6px 10px',borderRadius:6 }}>Pg {item.page_number}</div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )})}
                </div>
              )}
            </div>
          )})
        )}
      </div>
    </div>
  );
};

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
        <div style={{ padding:'20px 24px',borderBottom:'1px solid var(--line2)',flexShrink:0 }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12 }}>
            <div style={{ display:'flex',alignItems:'center',gap:12 }}>
              <div style={{ width:36,height:36,borderRadius:10,background:'var(--surface2)',display:'flex',alignItems:'center',justifyContent:'center' }}><NotebookPen size={18} color="var(--text)"/></div>
              <div>
                <div style={{ fontSize:16,fontWeight:700,color:'var(--text)' }}>Local Notes</div>
                <div style={{ fontSize:12,color:'var(--text3)' }}>{subjName} · Paper {paperNum}</div>
              </div>
            </div>
            <button className="icon-btn" onClick={onClose}><X size={16}/></button>
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:8 }}>
            <span style={{ fontSize:12,fontWeight:500,color:'var(--text3)' }}>{notes.length} note{notes.length!==1?'s':''}</span>
            <span style={{ flex:1 }}/>
            {isAdmin ? (
              <button onClick={()=>setShowAdd(s=>!s)}
                style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:8,border:'none',cursor:'pointer',background:'var(--text)',color:'var(--bg)',fontSize:12,fontWeight:600,transition:'all 0.2s' }}>
                <Plus size={14}/> Add Note
              </button>
            ) : (
              <button onClick={onRequestAuth}
                style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:8,border:'1px solid var(--line2)',cursor:'pointer',background:'var(--surface2)',color:'var(--text2)',fontSize:12,fontWeight:500,transition:'all 0.2s' }}>
                <Lock size={14}/> Unlock to add
              </button>
            )}
          </div>
        </div>

        {showAdd && isAdmin && (
          <div style={{ padding:'16px 24px',borderBottom:'1px solid var(--line2)',background:'var(--surface2)',flexShrink:0 }}>
            <input className="n-input" placeholder="Title (optional)" value={noteTitle} onChange={e=>setNoteTitle(e.target.value)} style={{ marginBottom:12 }}/>
            <textarea className="n-input" placeholder="Write your note here…" value={noteBody} onChange={e=>setNoteBody(e.target.value)} rows={4} style={{ marginBottom:12 }}/>

            <input ref={fileRef} type="file" accept=".pdf,.html,application/pdf,text/html" multiple style={{ display:'none' }} onChange={handleFileChange}/>
            <button onClick={()=>fileRef.current?.click()}
              style={{ display:'flex',alignItems:'center',gap:8,padding:'10px 16px',borderRadius:10,border:'1px dashed var(--line2)',cursor:'pointer',background:'transparent',color:'var(--text2)',fontSize:13,width:'100%',justifyContent:'center',marginBottom:12,transition:'all 0.2s' }}>
              <Paperclip size={14}/> Attach PDF or HTML file
            </button>
            {fileErr && <p style={{ fontSize:12,color:'var(--red)',marginBottom:12,display:'flex',alignItems:'center',gap:6 }}><AlertCircle size={14}/>{fileErr}</p>}
            {pendingFiles.length > 0 && (
              <div style={{ display:'flex',flexWrap:'wrap',gap:6,marginBottom:12 }}>
                {pendingFiles.map(f => (
                  <div key={f.id} style={{ display:'flex',alignItems:'center',gap:6,padding:'4px 10px 4px 8px',borderRadius:8,background:'var(--surface3)',border:'1px solid var(--line2)',fontSize:11,color:'var(--text2)' }}>
                    <FileText size={12} color="var(--text)"/>
                    <span>{f.name}</span>
                    <span style={{ color:'var(--text3)' }}>({fmtBytes(f.size)})</span>
                    <button onClick={()=>removeFile(f.id)} style={{ background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',alignItems:'center',color:'var(--text3)' }}><X size={12}/></button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display:'flex',gap:12 }}>
              <button onClick={handleAdd} disabled={!noteBody.trim()&&pendingFiles.length===0}
                style={{ flex:1,padding:'10px',borderRadius:10,border:'none',cursor:(noteBody.trim()||pendingFiles.length>0)?'pointer':'not-allowed',background:(noteBody.trim()||pendingFiles.length>0)?'var(--text)':'var(--surface)',color:(noteBody.trim()||pendingFiles.length>0)?'var(--bg)':'var(--text3)',fontSize:13,fontWeight:600,transition:'all 0.2s' }}>
                Save Note
              </button>
              <button onClick={()=>{setShowAdd(false);setNoteTitle('');setNoteBody('');setPendingFiles([]);setFileErr('');}}
                style={{ padding:'10px 16px',borderRadius:10,border:'1px solid var(--line2)',cursor:'pointer',background:'transparent',color:'var(--text2)',fontSize:13,transition:'all 0.2s' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="custom-sb" style={{ flex:1,overflowY:'auto',padding:'20px 24px',display:'flex',flexDirection:'column',gap:16 }}>
          {notes.length === 0 ? (
            <div style={{ textAlign:'center',padding:'60px 0',color:'var(--text3)' }}>
              <FileText size={48} style={{ opacity:0.2,marginBottom:16 }}/>
              <p style={{ fontSize:15,fontWeight:600,marginBottom:8,color:'var(--text)' }}>No local notes yet</p>
              <p style={{ fontSize:13, marginBottom: 16 }}>{isAdmin?'Click "Add Note" to get started.':'Unlock the database to start adding notes.'}</p>
              <p style={{ fontSize:10, color:'var(--text3)', borderTop:'1px solid var(--line)', paddingTop:16, marginTop:16 }}>
                Static Repo Notes expected format:<br/>
                <span style={{fontFamily:'Roboto Mono, monospace', marginTop:4, display:'block'}}>/notes/{key}.pdf</span>
              </p>
            </div>
          ) : notes.map(note => (
            <div key={note.id} className="note-card">
              <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12,marginBottom:note.content?8:0 }}>
                <span style={{ fontSize:14,fontWeight:600,color:'var(--text)',lineHeight:1.4 }}>{note.title}</span>
                {isAdmin && (delConfirm===note.id ? (
                  <div style={{ display:'flex',gap:6,flexShrink:0 }}>
                    <button onClick={()=>handleDelete(note.id)} style={{ padding:'4px 10px',borderRadius:6,border:'none',cursor:'pointer',background:'var(--red)',color:'#fff',fontSize:11,fontWeight:600 }}>Delete</button>
                    <button onClick={()=>setDelConfirm(null)} style={{ padding:'4px 10px',borderRadius:6,border:'1px solid var(--line2)',cursor:'pointer',background:'transparent',color:'var(--text2)',fontSize:11 }}>Cancel</button>
                  </div>
                ) : (
                  <button onClick={()=>setDelConfirm(note.id)} className="icon-btn" style={{ width:28,height:28,borderRadius:8,flexShrink:0,border:'none' }}><Trash2 size={14} color="var(--text3)"/></button>
                ))}
              </div>
              {note.content && <p style={{ fontSize:13,color:'var(--text2)',lineHeight:1.6,whiteSpace:'pre-wrap' }}>{note.content}</p>}
              {note.attachments?.length > 0 && (
                <div style={{ display:'flex',flexWrap:'wrap',gap:6,marginTop:12 }}>
                  {note.attachments.map(att => (
                    <button key={att.id} className="attach-pill" onClick={()=>openBlob(att)}>
                      <FileText size={12} color={att.type==='application/pdf'?'var(--rose)':'var(--text)'}/>
                      <span style={{ maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:11 }}>{att.name}</span>
                      <ExternalLink size={10} style={{ flexShrink:0 }}/>
                    </button>
                  ))}
                </div>
              )}
              <p style={{ fontSize:11,fontWeight:500,color:'var(--text3)',marginTop:12 }}>{note.timestamp}</p>
            </div>
          ))}
        </div>

        <div style={{ padding:'16px 24px',borderTop:'1px solid var(--line2)',flexShrink:0 }}>
          <p style={{ fontSize:11,fontWeight:500,color:'var(--text3)',textAlign:'center' }}>{isAdmin?'🔓 Admin mode active':'🔒 Read-only mode'}</p>
        </div>
      </div>
    </>
  );
};

const MCQSolver = ({ subjectCode, paperNum, variant, year, season, onClose, mcqState, updateMcqState }) => {
  const N = MCQ_COUNT;
  const empty = () => Array(N).fill('');

  const msKey       = year && season ? `${subjectCode}_${season}${year.slice(2)}_1_${variant}` : null;
  const hardcodedKey = msKey ? (MCQ_ANSWER_KEYS[msKey] || null) : null;

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
    if (keyRevealed) return;
    const newChoices = [...mine];
    newChoices[qi] = mine[qi] === opt ? '' : opt;
    updateMcqState({ choices: newChoices });
  }, [keyRevealed, mine, updateMcqState]);

  const clearAll = () => updateMcqState({ choices: empty(), revealed: false });
  const toggleReveal = () => updateMcqState({ revealed: !keyRevealed });

  const getBubbleCls = (qi, opt) => {
    const userPicked = mine[qi] === opt;
    const isCorrectAnswer = key[qi] === opt;
    if (!keyRevealed) return 'mcq-bubble' + (userPicked ? ' sel-mine' : '');
    if (userPicked && isCorrectAnswer) return 'mcq-bubble correct';
    if (userPicked && !isCorrectAnswer) return 'mcq-bubble wrong';
    if (!userPicked && isCorrectAnswer && mine[qi]) return 'mcq-bubble sel-key';
    return 'mcq-bubble';
  };

  return (
    <div className="mcq-sidebar">
      <div style={{ padding:'20px 24px',borderBottom:'1px solid var(--line2)',flexShrink:0 }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16 }}>
          <div style={{ display:'flex',alignItems:'center',gap:12 }}>
            <div style={{ width:36,height:36,borderRadius:10,background:'var(--surface2)',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <ListChecks size={18} color="var(--text)"/>
            </div>
            <div>
              <div style={{ fontSize:16,fontWeight:700,color:'var(--text)' }}>MCQ Solver</div>
              <div style={{ fontSize:12,color:'var(--text3)' }}>{subjName} · {paperLabel}</div>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={16}/></button>
        </div>

        <div style={{ display:'flex',gap:8 }}>
          {hardcodedKey && (
            <button onClick={toggleReveal}
              style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'10px',borderRadius:10,
                border:`1px solid ${keyRevealed?'var(--line2)':'var(--text)'}`,cursor:'pointer',transition:'all 0.2s',
                background: keyRevealed ? 'var(--surface2)' : 'var(--text)',
                color:      keyRevealed ? 'var(--text2)'   : 'var(--bg)',
                fontSize:13,fontWeight:600 }}>
              {keyRevealed ? <><EyeOff size={14}/> Hide Key</> : <><Eye size={14}/> Check Answers</>}
            </button>
          )}
          <button onClick={clearAll}
            style={{ padding:'10px 16px',borderRadius:10,border:'1px solid var(--line2)',cursor:'pointer',background:'var(--surface2)',color:'var(--text2)',fontSize:13,fontWeight:600,transition:'all 0.2s' }}>
            Reset
          </button>
        </div>

        {keyRevealed && keyCount > 0 && (
          <div style={{ display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderRadius:12,background:'var(--surface2)',border:'1px solid var(--line2)',marginTop:12 }}>
            <span style={{ fontSize:24,fontWeight:800,color:pct>=70?'var(--green)':pct>=50?'var(--amber)':'var(--red)' }}>{correct}</span>
            <span style={{ fontSize:14,color:'var(--text2)',fontWeight:500 }}>/ {keyCount}</span>
            <div style={{ flex:1,height:6,borderRadius:4,background:'var(--surface3)',overflow:'hidden' }}>
              <div style={{ height:'100%',width:`${pct??0}%`,background:pct>=70?'var(--green)':pct>=50?'var(--amber)':'var(--red)',borderRadius:4,transition:'width 0.5s ease' }}/>
            </div>
            <span style={{ fontSize:14,fontWeight:700,color:'var(--text2)' }}>{pct??'—'}%</span>
          </div>
        )}
      </div>

      <div className="custom-sb" style={{ flex:1,overflowY:'auto',padding:'8px 24px 24px' }}>
        <div style={{ display:'grid',gridTemplateColumns:'30px 1fr',gap:12,padding:'12px 0',borderBottom:'2px solid var(--line2)',marginBottom:8 }}>
          <span style={{ fontSize:11,fontWeight:600,color:'var(--text3)',textAlign:'center' }}>Q</span>
          <span style={{ fontSize:11,fontWeight:600,letterSpacing:'0.1em',color:keyRevealed?'var(--text)':'var(--text2)',textAlign:'center' }}>
            {keyRevealed ? 'KEY REVEALED' : 'MY ANSWERS'}
          </span>
        </div>

        {Array.from({ length: N }, (_, qi) => (
          <div key={qi} style={{ display:'grid',gridTemplateColumns:'30px 1fr',gap:12,alignItems:'center',padding:'6px 0',borderBottom:'1px solid var(--line)',minHeight:44 }}>
            <span style={{ fontSize:13,color:'var(--text3)',fontWeight:600,textAlign:'center' }}>{qi+1}</span>
            <div style={{ display:'flex',gap:6,justifyContent:'center' }}>
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
    </div>
  );
};

// ─── App (Main Controller) ────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark] = useState(()=>localStorage.getItem('nexusTheme')!=='light');
  useEffect(()=>{ localStorage.setItem('nexusTheme',dark?'dark':'light'); },[dark]);
  const toggleTheme = () => setDark(d=>!d);

  const [showStartup, setShowStartup]   = useState(true);
  const [showContact, setShowContact]   = useState(false);
  const [isViewing,   setIsViewing]     = useState(false);
  const [showNav,     setShowNav]       = useState(true);
  const [showNotes,   setShowNotes]     = useState(false);
  const [showMCQ,     setShowMCQ]       = useState(false);
  const [showTopicals,setShowTopicals]  = useState(false);
  const [isAdmin,     setIsAdmin]       = useState(false);
  const [showPwModal, setShowPwModal]   = useState(false);

  const [topicalDb, setTopicalDb] = useState(null);
  const [targetPage, setTargetPage] = useState(1);
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

  const paperKey = `${subject}_${season}${year ? year.slice(2) : ''}_${paper}_${variant}`;
  
  const currentMcqState = mcqSessionData[paperKey] || { choices: Array(MCQ_COUNT).fill(''), revealed: false };

  const updateMcqState = useCallback((updates) => {
    setMcqSessionData(prev => ({
      ...prev,
      [paperKey]: { ...(prev[paperKey] || { choices: Array(MCQ_COUNT).fill(''), revealed: false }), ...updates }
    }));
  }, [paperKey]);

  useEffect(() => {
    fetch('/topicals_db.json')
      .then(res => res.json())
      .then(data => setTopicalDb(data))
      .catch(err => console.log('No topical DB generated yet.'));
  }, []);

  const activeFileUrl = useMemo(() => {
    if (!isComplete) return '';
    return `/papers/${subject}_${season}${year.slice(2)}_${type}_${paper}${variant}.pdf`;
  }, [subject,year,season,paper,variant,type,isComplete]);

  const viewerSrc = useMemo(() => {
    if (!isComplete) return '';
    let url = `/pdf-viewer/web/viewer.html?file=${encodeURIComponent(activeFileUrl)}`;
    if (targetPage > 1) { url += `#page=${targetPage}`; }
    return url;
  }, [activeFileUrl, targetPage, isComplete]);

  useEffect(()=>{ document.title="The Nexus | Workspace"; },[]);
  
  useEffect(()=>{ 
    setShowNotes(false); setShowMCQ(false); setShowTopicals(false);
  }, [subject,paper,variant,season,year,type]);

  const handleLoad = () => { if (!isComplete) return; setTargetPage(1); setIsViewing(true); setShowNav(false); };
  const handleHome = () => { setIsViewing(false); setShowNav(true); };

  const handleSelectExplorer = (subjCode) => {
    if (subjCode) setSubject(subjCode);
    setShowStartup(false);
  };

  const handleSelectTopicals = (subjCode) => {
    if (subjCode) setSubject(subjCode);
    setShowStartup(false);
    setShowTopicals(true);
  };

  const handleTopicalSelect = useCallback((paperId, pageNum) => {
    const parts = paperId.replace('.pdf', '').split('_');
    if (parts.length >= 4) {
      setSubject(parts[0]);
      setSeason(parts[1][0]); 
      setYear("20" + parts[1].slice(1)); 
      setType(parts[2]); 
      setPaper(parts[3][0]); 
      setVariant(parts[3][1]); 
      setTargetPage(pageNum);
      setIsViewing(true);
      if (window.innerWidth <= 768) setShowTopicals(false);
    }
  }, []);

  if (showStartup) return (
    <><GlobalStyles dark={dark}/><StartupScreen onSelectExplorer={handleSelectExplorer} onSelectTopicals={handleSelectTopicals} toggleTheme={toggleTheme} dark={dark}/></>
  );

  return (
    <>
      <GlobalStyles dark={dark}/>
      <ContactModal isOpen={showContact} onClose={()=>setShowContact(false)}/>
      <PasswordModal isOpen={showPwModal} onClose={()=>setShowPwModal(false)} onSuccess={()=>setIsAdmin(true)}/>

      <div style={{ display:'flex',flexDirection:'column',height:'100vh',background:'var(--bg)',overflow:'hidden' }}>

        {/* Dynamic Minimal Navbar */}
        <div style={{ display:'grid',gridTemplateRows:showNav?'1fr':'0fr',transition:'grid-template-rows 0.3s cubic-bezier(0.16,1,0.3,1)',flexShrink:0,zIndex:30 }}>
          <div style={{ overflow:'hidden',minHeight:0 }}>
            <header className="nav-bar" style={{ padding:'16px 24px', borderBottom:'1px solid var(--line2)' }}>
              <div style={{ maxWidth:1800,margin:'0 auto',display:'flex',flexWrap:'wrap',alignItems:'center',gap:20 }}>

                <div style={{ display:'flex',alignItems:'center',gap:16,marginRight:8 }}>
                  <button className="icon-btn" onClick={()=>{setShowStartup(true);handleHome();setShowNotes(false);setShowTopicals(false);}} title="Back to Hub" style={{ flexShrink:0 }}><ArrowLeft size={16}/></button>
                  <div style={{ display:'flex',alignItems:'center',gap:10,cursor:'pointer' }} onClick={handleHome}>
                    <div style={{ width:32, height:32, borderRadius:8, background:'var(--text)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Layers size={16} color="var(--bg)" strokeWidth={2.5}/>
                    </div>
                    <div>
                      <div style={{ fontSize:15,fontWeight:700,color:'var(--text)',lineHeight:1.1 }}>The Nexus</div>
                      <div style={{ fontSize:10,fontWeight:600,color:'var(--text3)',letterSpacing:'0.05em' }}>WORKSPACE</div>
                    </div>
                  </div>
                </div>

                <div style={{ width:1,height:32,background:'var(--line2)',flexShrink:0 }} className="nav-divider"/>

                <div className="custom-sb nav-filters" style={{ display:'flex',alignItems:'flex-end',gap:16,flex:1,overflowX:'auto',paddingBottom:4 }}>
                  <NexusSelect label="Subject" value={subject} onChange={v=>{setSubject(v);setShowNotes(false);setTargetPage(1);}} options={SUBJECTS.map(s=>({value:s.code,label:`${s.code} · ${s.name}`}))}/>
                  <NexusSelect label="Year"    value={year}    onChange={v=>{setYear(v);setTargetPage(1);}}    options={YEARS}/>
                  <NexusSelect label="Season"  value={season}  onChange={v=>{setSeason(v);setTargetPage(1);}}  options={SEASONS.map(s=>({value:s.code,label:s.name}))}/>
                  <NexusSelect label="Paper"   value={paper}   onChange={v=>{setPaper(v);setShowNotes(false);setTargetPage(1);}} options={PAPERS}/>
                  <NexusSelect label="Variant" value={variant} onChange={v=>{setVariant(v);setTargetPage(1);}} options={VARIANTS}/>

                  <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
                    <span style={{ fontSize:10,fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--text3)',paddingLeft:4 }}>Type</span>
                    <div style={{ display:'flex',background:'var(--surface2)',border:'1px solid var(--line2)',borderRadius:8,padding:4,gap:4 }}>
                      <button className={`seg-btn ${type==='qp'?'a-accent':'inactive'}`} onClick={()=>{setType('qp');setTargetPage(1);}}>QP</button>
                      <button className={`seg-btn ${type==='ms'?'a-accent':'inactive'}`} onClick={()=>{setType('ms');setTargetPage(1);}}>MS</button>
                    </div>
                  </div>

                  <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
                    <span style={{ fontSize:10,fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--text3)',paddingLeft:4 }}>Tools</span>
                    <div style={{ display:'flex',gap:8 }}>
                      <button onClick={()=>{setShowTopicals(s=>!s); setShowNotes(false);}}
                        style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',transition:'all 0.2s',background:showTopicals?'var(--text)':'var(--surface2)',color:showTopicals?'var(--bg)':'var(--text)',fontSize:12,fontWeight:600 }}>
                        <Compass size={14}/> Topicals
                      </button>

                      {canShowNotes && (
                        <button onClick={()=>{setShowNotes(s=>!s); setShowTopicals(false);}}
                          style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',transition:'all 0.2s',background:showNotes?'var(--text)':'var(--surface2)',color:showNotes?'var(--bg)':'var(--text)',fontSize:12,fontWeight:600 }}>
                          <NotebookPen size={14}/> Notes
                        </button>
                      )}

                      {canShowMCQ && (
                        <button onClick={()=>setShowMCQ(s => !s)}
                          style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',transition:'all 0.2s',background:showMCQ?'var(--text)':'var(--surface2)',color:showMCQ?'var(--bg)':'var(--text)',fontSize:12,fontWeight:600 }}>
                          <ListChecks size={14}/> Solver
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="nav-actions" style={{ display:'flex',alignItems:'center',gap:12,marginLeft:'auto',flexShrink:0 }}>
                  <button className={`btn-load ${isComplete?'ready':'disabled'}`} onClick={handleLoad} disabled={!isComplete}>
                    <Play size={14} fill="currentColor"/> {isViewing?'Reload':'Load Paper'}
                  </button>
                  {isViewing && <button className="icon-btn" onClick={()=>setShowNav(false)} title="Collapse Navigation"><ChevronUp size={16}/></button>}
                  <div style={{ width:1,height:24,background:'var(--line2)' }}/>
                  <button className="icon-btn" onClick={toggleTheme}>{dark?<Sun size={16}/>:<Moon size={16}/>}</button>
                  <button className="icon-btn" onClick={()=>setShowContact(true)}><Mail size={16}/></button>
                </div>

              </div>
            </header>
          </div>
        </div>

        {isViewing && !showNav && (
          <button className="pull-tab" onClick={()=>setShowNav(true)}>
            <ChevronDown size={14}/>
          </button>
        )}

        {/* Main Workspace Area */}
        <main style={{ flex:1,display:'flex',flexDirection:'column',overflow:'hidden',position:'relative' }}>
          {isViewing && showNav && <div style={{ position:'absolute',inset:0,zIndex:20,cursor:'pointer',background:'rgba(0,0,0,0.2)',backdropFilter:'blur(2px)' }} onClick={()=>setShowNav(false)}/>}

          {showNotes && canShowNotes && (
            <NotesSidebar subjectCode={subject} paperNum={paper} variant={variant} year={year} season={season} onClose={()=>setShowNotes(false)} isAdmin={isAdmin} onRequestAuth={()=>setShowPwModal(true)}/>
          )}

          <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
            
            {showTopicals && (
              <TopicalsSidebar subjectCode={subject} topicalDb={topicalDb} onClose={()=>setShowTopicals(false)} onSelectQuestion={handleTopicalSelect}/>
            )}

            {!isViewing ? (
              <div className="bg-grid anim-fade" style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:40,textAlign:'center' }}>
                <div style={{ position:'absolute',top:'20%',left:'25%',width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle, var(--accent) 0%, transparent 60%)',opacity:0.05,pointerEvents:'none' }}/>
                <div style={{ position:'absolute',bottom:'20%',right:'25%',width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle, var(--teal) 0%, transparent 60%)',opacity:0.05,pointerEvents:'none' }}/>
                
                <div style={{ width:80,height:80,borderRadius:24,background:'var(--surface2)',border:'1px solid var(--line2)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:32,zIndex:1 }}>
                  <BookOpen size={40} color="var(--text3)" strokeWidth={1.5}/>
                </div>
                <h2 style={{ fontSize:32,fontWeight:700,color:'var(--text)',marginBottom:16,zIndex:1 }}>Workspace Ready</h2>
                <p style={{ color:'var(--text2)',fontSize:16,lineHeight:1.6,maxWidth:460,marginBottom:40,zIndex:1 }}>
                  Configure your paper in the navigation bar above, then click <strong style={{color:'var(--text)'}}>Load Paper</strong> to open the viewer.
                </p>
              </div>
            ) : (
              <div className="anim-fade" style={{ flex:1,display:'flex',overflow:'hidden',position:'relative' }}>
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background:'#e5e7eb' }}>
                  <iframe src={viewerSrc} style={{ width:'100%',height:'100%',border:'none' }} title="PDF Viewer" allowFullScreen/>
                </div>

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
          </div>
        </main>
      </div>
    </>
  );
}