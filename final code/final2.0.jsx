import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  BookOpen, ChevronDown, ChevronUp, ChevronRight, Mail, X, Copy, Check,
  Play, Github, Terminal, ArrowLeft, Layers, Sun, Moon,
  FileText, Eye, EyeOff, ListChecks, Compass,
  Search, Clock, ArrowRight, Activity, Zap, Beaker, Code2, Folder, Library, ExternalLink,
  Atom, Database, Network, Binary, Biohazard, ChevronsLeftRight, FlaskConical, Omega, Radiation, Cpu
} from 'lucide-react';

// ─── Config ───────────────────────────────────────────────────────────────────
const SUBJECTS = [
  { code: '9709', name: 'Mathematics' },
  { code: '9618', name: 'Computer Science' },
  { code: '9701', name: 'Chemistry' },
  { code: '9702', name: 'Physics' },
  { code: '9700', name: 'Biology' },
  { code: '9231', name: 'Further Mathematics' },
];                                // update this after adding more pastpapers
const YEARS         = Array.from({ length: 7 }, (_, i) => (2026 - i).toString());
const SEASONS       = [{ code: 'm', name: 'March' }, { code: 's', name: 'Summer' }, { code: 'w', name: 'Winter' }];
const PAPERS        = ['1', '2', '3', '4', '5', '6'];
const VARIANTS      = ['1', '2', '3'];
const MCQ_SUBJECTS  = ['9700', '9701', '9702']; 
const MCQ_PAPER     = '1';
const MCQ_COUNT     = 40;
const MCQ_OPTS      = ['A', 'B', 'C', 'D'];

const GITHUB_REPO_URL = "https://github.com/Huzaifa-616/PastPaper-Explorer";

// ─── Dynamic Logo Component ───────────────────────────────────────────────────
const DYNAMIC_ICONS = [Atom, Database, Network, Binary, Biohazard, ChevronsLeftRight, FlaskConical, Omega, Radiation, Cpu];

const DynamicLogo = ({ size, color, strokeWidth }) => {
  const CurrentIcon = useMemo(() => DYNAMIC_ICONS[Math.floor(Math.random() * DYNAMIC_ICONS.length)], []);
  return <CurrentIcon size={size} color={color} strokeWidth={strokeWidth} />;
};

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
// ── Biology 9700 ──────────────────────────────────────────────────────────────
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
'9700_w23_1_1': ['B','C','B','B','C','C','D','C','A','D','B','B','A','C','C','C','B','B','D','A','C','D','B','D','A','B',null,'C','D','A','A','B','A','B',null,'D','B','A','C','B'],
'9700_w23_1_2': ['D','D','B','A','D','A','A','D','B','C','D','D','A','B','C','C','C','B','A','A','C','C','C','D','B','A','B','B','C','C','B','D','A','D','B','D','B','C','B','B'],
'9700_w23_1_3': ['C','B','C','D','A','B','C','C','B','A','C','B','D','A','D','C','B','D','D','B','B','D','B','D','B','D','A','A','B','D','C','D','B','C','D','D','C','B','D','C'],
'9700_w24_1_1': ['D','D','D','C','B','B','A','B','A','C','B','A','C','C','D','C','C','A','B','A','D','D','D','C','C','B','A','C','B','D','D','A','D','B','A','B','A','A','B','D'],
'9700_w24_1_2': ['C','D','A','C','B','A','A','A','C','B','A','D','A','B','D','D','D','D','B','A','B','B','D','C','C','B','B','A','C','C','B','C','B','A','A','B','A','A','C','B'],
'9700_w24_1_3': ['D','A','C','B','C','B','D','A','C','B','A','C','B','C','C','D','C','B','D','A','D','A','D','B','D','D','A','B','A','B','B','B','C','C','D','C','C','B','A','A'],
'9700_w25_1_1': ['D','B','A','A','D','C','D','D','C','B','A','C','B','A','B','B','B','D','A','C','A','C','B','A','D','B','C','A','C','A','B','D','B','D','C','A','C','C','C','C'],
'9700_w25_1_2': ['C','A','A','C','B','B','B','D','B','C','D','C','B','B','C','D','A','A','D','A','B','D','A','D','B','D','C','B','C','B','C','D','A','A','D','A','C','C','D','C'],
'9700_w25_1_3': ['B','B','C','C','B','B','B','C','A','B','A','A','A','B','C','D','A','D','A','C','D','D','C','D','B','B','A','C','D','A','C','C','C','D','A','B','A','B','A','B'],

// ── Chemistry 9701 ────────────────────────────────────────────────────────────
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

// ── Physics 9702 ──────────────────────────────────────────────────────────────
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
const subjectName  = (code) => SUBJECTS.find(s => s.code === code)?.name || code;

// ─── GlobalStyles (Massive Visual Upgrade & Mobile Fixes) ─────────────────────
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
      --accent:    ${dark ? '#6366f1' : '#4f46e5'};
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
    @keyframes slideInLeft  { from{transform:translateX(-100%)} to{transform:translateX(0)} }
    @keyframes slideInRight { from{transform:translateX(100%)}  to{transform:translateX(0)} }
    @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }

    .anim-0 { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .anim-1 { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both; }
    .anim-2 { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both; }
    .anim-3 { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both; }
    .anim-fade { animation: fadeIn 0.4s ease both; }

    .bg-grid {
      position: absolute; inset: 0; pointer-events: none; z-index: 0;
      background-image: 
        linear-gradient(to right, var(--line) 1px, transparent 1px),
        linear-gradient(to bottom, var(--line) 1px, transparent 1px);
      background-size: 64px 64px;
      mask-image: radial-gradient(circle at center, black, transparent 80%);
      -webkit-mask-image: radial-gradient(circle at center, black, transparent 80%);
    }

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

    .modal-overlay { position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);animation:fadeIn 0.2s ease both;padding:16px; }
    .modal-box { background:var(--bg2);border:1px solid var(--line2);border-radius:24px;width:100%;max-width:420px;position:relative;overflow:hidden;animation:fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) both; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }

    .mcq-bubble { width:32px;height:32px;border-radius:50%;border:1.5px solid var(--line2);background:transparent;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;justify-content:center; }
    .mcq-bubble:hover { border-color:var(--text2);color:var(--text); }
    .mcq-bubble.sel-mine { background:var(--text);border-color:var(--text);color:var(--bg); }
    .mcq-bubble.sel-key  { background:var(--amber);border-color:var(--amber);color:#fff; }
    .mcq-bubble.correct  { background:var(--green);border-color:var(--green);color:#fff; }
    .mcq-bubble.wrong    { background:var(--red);border-color:var(--red);color:#fff; }

    .custom-sb::-webkit-scrollbar { width: 4px; }
    .custom-sb::-webkit-scrollbar-track { background: transparent; }
    .custom-sb::-webkit-scrollbar-thumb { background: var(--line2); border-radius: 4px; }
    .custom-sb:hover::-webkit-scrollbar-thumb { background: var(--text3); }
    
    .tools-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; width: 100%; max-width: 1100px; }
    .featured-card { grid-column: 1 / -1; }
    
    .pull-tab-pill {
      position: absolute; top: 12px; left: 50%; transform: translateX(-50%);
      display: flex; align-items: center; justify-content: center;
      width: 48px; height: 28px; border-radius: 14px;
      background: var(--surface2); border: 1px solid var(--line2);
      cursor: pointer; transition: all 0.2s; z-index: 40;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .pull-tab-pill:hover { background: var(--surface3); transform: translateX(-50%) translateY(2px); }

    /* SIDEBAR CLASSES */
    .library-sidebar, .topicals-sidebar { position: relative; width: 340px; flex-shrink: 0; background: var(--bg2); border-right: 1px solid var(--line2); display: flex; flex-direction: column; z-index: 10; animation: slideInLeft 0.3s cubic-bezier(0.16,1,0.3,1) both; }
    .mcq-sidebar { position: relative; width: 340px; flex-shrink: 0; background: var(--bg2); border-left: 1px solid var(--line2); display: flex; flex-direction: column; animation: slideInRight 0.3s cubic-bezier(0.16,1,0.3,1) both; }

    /* FULL PAGE LIBRARY & TOPICALS CLASSES */
    .full-lib-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; width: 100%; align-content: start; }
    .topicals-content { flex: 1; display: flex; overflow: hidden; position: relative; }
    .topicals-papers { width: 210px; flex-shrink: 0; border-right: 1px solid var(--line2); padding: 16px 10px; display: flex; flex-direction: column; gap: 6px; background: var(--bg2); overflow-y: auto; }
    .topicals-grid { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
    .topicals-grid-inner { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 12px; }
    .topicals-questions { width: 320px; flex-shrink: 0; border-left: 1px solid var(--line2); display: flex; flex-direction: column; background: var(--bg2); animation: slideInRight 0.25s cubic-bezier(0.16,1,0.3,1) both; }
    
    /* ── Nav bar base ── */
    .nav-bar {
      background: ${dark ? 'rgba(5,5,10,0.92)' : 'rgba(248,250,252,0.92)'};
      backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    }

    /* 📱 RESPONSIVE FIXES (Narrow Desktop, Tablets, Touch Devices) */
    .mobile-only { display: none !important; }
    
    @media (max-width: 1024px), (pointer: coarse) {
      .mobile-only { display: flex !important; }
      .desktop-only { display: none !important; }
      /* ── RESTORED: Nav 2-row layout & Grid ── */
      header.nav-bar { padding: 12px 16px !important; }

      .nav-inner { flex-wrap: wrap !important; gap: 10px 0 !important; align-items: center !important; }
      .nav-divider { display: none !important; }
      .nav-brand { flex: 1 !important; min-width: 0 !important; margin-right: 0 !important; }
      .nav-workspace-label { display: none !important; }

      .nav-actions { margin-left: 0 !important; flex-shrink: 0 !important; gap: 8px !important; }
      .nav-actions .btn-load { padding: 8px 14px !important; font-size: 11px !important; }
      .nav-actions .icon-btn { width: 32px !important; height: 32px !important; }

      .nav-filters {
        order: 9 !important; width: 100% !important; flex: none !important; overflow: visible !important;
        display: grid !important; 
        grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)) !important; 
        gap: 8px !important;
        padding: 0 !important; align-items: end !important;
      }
      .nav-filters > div { width: 100% !important; min-width: 0 !important; flex: none !important; }
      .nav-filters .nexus-select { width: 100% !important; font-size: 10px !important; padding: 7px 22px 7px 8px !important; }
      .nav-filters > div > span { font-size: 8px !important; }

      .nav-type-wrap .seg-btn { padding: 5px 9px !important; font-size: 10px !important; }

      .nav-tools-wrap { grid-column: 1 / -1 !important; }
      .nav-tools-wrap > div { flex-wrap: wrap !important; gap: 6px !important; }
      .nav-tools-wrap button { padding: 7px 12px !important; font-size: 11px !important; }
      /* ───────────────────────────────────────── */

      /* Bottom Sheet MCQ Solver (Fixes overlap & animation wobble) */
      .mcq-sidebar { 
        position: absolute !important; 
        bottom: 0; left: 0; right: 0; top: auto; 
        width: 100% !important; 
        height: var(--sheet-height, 50vh) !important; 
        border-left: none !important; 
        border-top: 1px solid var(--line2); 
        box-shadow: 0 -10px 40px rgba(0,0,0,0.8); 
        z-index: 50; 
        border-radius: 20px 20px 0 0; 
        /* FIX: Locks the entrance animation so it doesn't jump to the right when dragged */
        animation: slideUp 0.3s cubic-bezier(0.16,1,0.3,1) both !important; 
      }
      
      /* FIX: Only handles height transition, no animation re-triggering */
      .mcq-sidebar.snap-anim {
        transition: height 0.3s cubic-bezier(0.16,1,0.3,1) !important;
      }

      .drag-handle {
        width: 100%; height: 24px; align-items: center; justify-content: center; 
        cursor: grab; flex-shrink: 0; padding-top: 8px; touch-action: none;
      }
      .drag-bar {
        width: 40px; height: 5px; border-radius: 4px; background: var(--text3); opacity: 0.5;
      }
      .drag-handle:active .drag-bar { opacity: 0.8; }

      /* Mobile Topicals Expanded View */
      .topicals-content { flex-direction: column !important; display: flex !important; overflow-y: auto !important; }
      
      .topicals-papers { 
        width: 100% !important; height: auto !important; display: grid !important; 
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)) !important; gap: 10px !important;
        border-right: none !important; border-bottom: 1px solid var(--line2) !important; 
        padding: 16px !important; overflow: visible !important; 
      }
      .topicals-papers > p { grid-column: 1 / -1; margin-bottom: 2px !important; padding-left: 2px !important; }
      .topicals-papers > button { flex: unset !important; width: 100% !important; height: 100% !important; padding: 12px !important; scroll-snap-align: none; }
      
      .topicals-grid { width: 100%; overflow: visible; }
      .topicals-grid-inner { grid-template-columns: 1fr; padding: 16px !important; }
      
      .topicals-questions { width: 100%; height: 100%; border-left: none; position: absolute; top: 0; left: 0; z-index: 10; }
      
      .mobile-hidden { display: none !important; }
      
      /* Full Page Mobile Headers */
      .full-lib-header { padding: 12px 16px !important; flex-wrap: wrap; }
      .full-lib-main { padding: 16px !important; }
      .full-lib-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
    }
  `}</style>
);

// ─── StartupScreen ────────────────────────────────────────────────────────────
const StartupScreen = ({ onSelectExplorer, onSelectTopicals, onSelectLibrary, toggleTheme, dark, onOpenIndexer }) => {
  const [activeTab, setActiveTab] = useState('9618');

  const brandColors = {
    '9618': { hex: 'var(--teal)', name: 'Computer Science', icon: <Terminal size={16}/> },
    '9702': { hex: 'var(--amber)', name: 'Physics', icon: <Zap size={16}/> },
    '9701': { hex: 'var(--rose)', name: 'Chemistry', icon: <Beaker size={16}/> },
    '9709': { hex: 'var(--accent)', name: 'Mathematics', icon: <Activity size={16}/> }
  };

  const currentBrand = brandColors[activeTab] || brandColors['9709'];

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'-20%', left:'50%', transform:'translateX(-50%)', width:'80vw', height:'60vh', background:`radial-gradient(ellipse at top, ${currentBrand.hex} 0%, transparent 60%)`, opacity: dark ? 0.12 : 0.08, pointerEvents:'none', zIndex: 0, transition:'background 0.5s ease' }}/>
      <div className="bg-grid" />

      <header style={{ padding:'24px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', zIndex:10, position:'relative' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:12, background:'var(--text)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <DynamicLogo size={20} color="var(--bg)" strokeWidth={2.5}/>
          </div>
          <div>
            <h1 style={{ fontSize:18, fontWeight:700, letterSpacing:'-0.02em', color:'var(--text)' }}>The Nexus</h1>
            <p style={{ fontSize:11, fontWeight:500, letterSpacing:'0.1em', color:'var(--text3)', textTransform:'uppercase' }}>Study Environment</p>
          </div>
        </div>
        <div style={{ display:'flex', alignItems: 'center', gap:12 }}>
          <button onClick={onOpenIndexer} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:8, border:'1px solid var(--line2)', cursor:'pointer', background:'var(--surface2)', color:'var(--text)', fontSize:11, fontWeight:600 }}>
            <Database size={14}/> Admin
          </button>
          <button className="icon-btn" onClick={toggleTheme}>{dark ? <Sun size={16}/> : <Moon size={16}/>}</button>
          <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="icon-btn" style={{ textDecoration:'none' }}><Github size={16}/></a>
        </div>
      </header>

      <main style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'0 20px', zIndex:10, position:'relative' }}>
        
        <div className="anim-0" style={{ textAlign:'center', marginBottom:48 }}>
          <h2 className="shimmer-text" style={{ fontSize:'clamp(48px, 8vw, 80px)', fontWeight:800, lineHeight:1, letterSpacing:'-0.03em', marginBottom:24 }}>
            From Prep to Perfection
          </h2>
          <p style={{ fontSize:18, color:'var(--text2)', fontWeight:400, maxWidth:600, margin:'0 auto', lineHeight:1.5 }}>
            A high-performance workspace engineered for Cambridge A-Level students. Search topics, extract papers, and acess notes.
          </p>
        </div>

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

        <div className="anim-3 tools-grid">
          
          {/* PastPaper Explorer */}
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

          {/* IDE */}
          <div className="glass-panel" style={{ padding:28, borderRadius:24, cursor:'pointer', transition:'all 0.3s', display:'flex', flexDirection:'column', justifyContent:'space-between' }}
               onClick={()=>window.open('https://programming-ide.netlify.app/','_blank')}
               onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--text2)'; }}
               onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--line2)'; }}>
            <div>
              <div style={{ width:48, height:48, borderRadius:14, background:'var(--surface2)', border:'1px solid var(--line2)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
                <Code2 size={20} color="var(--text)"/>
              </div>
              <h3 style={{ fontSize:20, fontWeight:700, marginBottom:8, display:'flex', alignItems:'center' }}>
                  Programming IDE
                  <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', background:'rgba(251, 191, 36, 0.1)', color:'var(--amber)', border:'1px solid var(--amber)', borderRadius:6, marginLeft:10, letterSpacing:'0.05em', textTransform:'uppercase' }}>In Development</span>
              </h3>
              <p style={{ fontSize:14, color:'var(--text2)', lineHeight:1.5 }}>Write, compile, and run code entirely in your browser. Built for 9618.</p>
            </div>
             <div style={{ marginTop:24, display:'flex', flexWrap:'wrap', gap:8 }}>
              {['Python', 'Pseudocode'].map(p => <span key={p} style={{ fontSize:11, fontWeight:500, padding:'4px 10px', background:'var(--surface2)', borderRadius:100, border:'1px solid var(--line2)', color:'var(--text3)' }}>{p}</span>)}
            </div>
          </div>

          {/* Resource Library */}
          <div className="glass-panel" style={{ padding:28, borderRadius:24, cursor:'pointer', transition:'all 0.3s', display:'flex', flexDirection:'column', justifyContent:'space-between' }}
               onClick={() => onSelectLibrary(activeTab)}
               onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--text2)'; }}
               onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--line2)'; }}>
            <div>
              <div style={{ width:48, height:48, borderRadius:14, background:'var(--surface2)', border:'1px solid var(--line2)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
                <Library size={20} color="var(--text)"/>
              </div>
              <h3 style={{ fontSize:20, fontWeight:700, marginBottom:8 }}>Resource Library</h3>
              <p style={{ fontSize:14, color:'var(--text2)', lineHeight:1.5 }}>Access textbooks, revision notes, and formula sheets directly from your repository.</p>
            </div>
            <div style={{ marginTop:24, display:'flex', flexWrap:'wrap', gap:8, alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', gap:8 }}>
                {['PDFs', 'Notes', 'Books'].map(p => <span key={p} style={{ fontSize:11, fontWeight:500, padding:'4px 10px', background:'var(--surface2)', borderRadius:100, border:'1px solid var(--line2)', color:'var(--text3)' }}>{p}</span>)}
              </div>
              <button onClick={(e) => { e.stopPropagation(); onSelectLibrary(''); }}
                style={{ fontSize:11, fontWeight:600, padding:'6px 12px', background:'var(--text)', color:'var(--bg)', borderRadius:8, border:'none', cursor:'pointer' }}>
                Browse All
              </button>
            </div>
          </div>

          {/* Topical Database (FEATURED WIDE CARD) */}
          <div className="glass-panel featured-card" style={{ padding: 0, borderRadius: 24, cursor: 'pointer', transition: 'all 0.3s', display: 'flex', flexDirection: 'row', overflow: 'hidden', position: 'relative' }}
               onClick={() => onSelectTopicals(activeTab)}
               onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = currentBrand.hex; e.currentTarget.querySelector('.feature-glow').style.opacity = '0.3'; }}
               onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--line2)'; e.currentTarget.querySelector('.feature-glow').style.opacity = '0.1'; }}>
            
            <div className="feature-glow" style={{ position:'absolute', top:0, right:0, width:'50%', height:'100%', background:`radial-gradient(ellipse at right, ${currentBrand.hex}, transparent 70%)`, opacity:0.1, transition:'opacity 0.4s', pointerEvents:'none' }} />

            <div style={{ flex: 1, padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ width:48, height:48, borderRadius:14, background:`var(--surface2)`, border:`1px solid var(--line2)`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
                <Compass size={20} color={currentBrand.hex}/>
              </div>
              <h3 style={{ fontSize:24, fontWeight:700, marginBottom:8, display:'flex', alignItems:'center' }}>
                Topical Database
                <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', background:'rgba(251, 191, 36, 0.1)', color:'var(--amber)', border:'1px solid var(--amber)', borderRadius:6, marginLeft:12, letterSpacing:'0.05em', textTransform:'uppercase' }}>In Development</span>
              </h3>
              <p style={{ fontSize:15, color:'var(--text2)', lineHeight:1.6, maxWidth:400, marginBottom: 24 }}>
                Don't just scan years—target your weaknesses. Dive into a massive database of past paper questions strictly indexed by the official syllabus structure.
              </p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                <span style={{ fontSize:13, fontWeight: 600, padding:'8px 16px', background:'var(--text)', borderRadius:10, color:'var(--bg)', display:'inline-flex', alignItems:'center' }}>
                  Explore Topics <ArrowRight size={14} style={{marginLeft:6}}/>
                </span>
              </div>
            </div>

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
      {/* SEO & Context Block (Hidden elegantly but readable by Google) */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 20px 40px 20px', zIndex: 10, position: 'relative' }}>
        <div style={{ padding: 24, borderRadius: 20, background: 'var(--surface2)', border: '1px solid var(--line2)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>About The Nexus: Cambridge A-Level Workspace</h2>
          <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 12 }}>
            The Nexus is an advanced, high-performance study environment specifically engineered for CAIE A-Level and AS-Level students. Designed to eliminate the friction of traditional study methods, it provides instant, zero-latency access to past papers, marking schemes, and an interactive Resource Library.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 16 }}>
            <div>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Supported Syllabuses</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 12, color: 'var(--text3)', lineHeight: 1.8 }}>
                <li>• Computer Science (9618)</li>
                <li>• Physics (9702)</li>
                <li>• Chemistry (9701)</li>
                <li>• Mathematics (9709)</li>
              </ul>
            </div>
            <div>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Core Features</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 12, color: 'var(--text3)', lineHeight: 1.8 }}>
                <li>• Topical Database & Question Extraction</li>
                <li>• Automated MCQ Solver with Answer Keys</li>
                <li>• Built-in Programming IDE (Python, Pseudocode)</li>
                <li>• Fast PDF Rendering Engine</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <footer style={{ padding:'24px', textAlign:'center', zIndex:10 }}>
        <p style={{ fontSize:12, color:'var(--text3)', letterSpacing:'0.05em', fontWeight:500 }}>
          MUHAMMAD HUZAIFA IMRAN
        </p>
        <p style={{ fontSize:12, color:'var(--text3)', letterSpacing:'0.05em', fontWeight:500 }}>This is a non-profit, student-built educational tool and that all materials remain the property of CAIE.</p>
      </footer>
    </div>
  );
};

// ─── FULL PAGE LIBRARY VIEW ───────────────────────────────────────────────────
const FullLibraryPage = ({ initialSubject, libraryDb, onBackToHub, toggleTheme, dark }) => {
  const [subjectCode, setSubjectCode] = useState(initialSubject || '');
  const [currentPath, setCurrentPath] = useState([]);

  const brandColors = {
    '9618': { hex: 'var(--teal)', name: 'Computer Science', icon: <Terminal size={16}/> },
    '9702': { hex: 'var(--amber)', name: 'Physics', icon: <Zap size={16}/> },
    '9701': { hex: 'var(--rose)', name: 'Chemistry', icon: <Beaker size={16}/> },
    '9709': { hex: 'var(--accent)', name: 'Mathematics', icon: <Activity size={16}/> }
  };

  const currentBrand = brandColors[subjectCode] || { hex: 'var(--text)', name: 'Library' };

  const rootFolder = useMemo(() => libraryDb?.find(f => f.name === subjectCode) || null, [libraryDb, subjectCode]);

  const currentItems = useMemo(() => {
    if (!subjectCode) return libraryDb || [];
    let current = rootFolder?.children || [];
    for (let step of currentPath) {
      const found = current.find(c => c.name === step && c.type === 'folder');
      if (found) current = found.children || [];
      else break;
    }
    return current;
  }, [libraryDb, subjectCode, rootFolder, currentPath]);

  const navigateTo = (idx) => {
     if (idx === -1) { setSubjectCode(''); setCurrentPath([]); }
     else if (idx === 0) { setCurrentPath([]); }
     else { setCurrentPath(prev => prev.slice(0, idx)); }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden', background:'var(--bg)' }}>
      <GlobalStyles dark={dark}/>
      <div style={{ position:'absolute', top:'-20%', left:'50%', transform:'translateX(-50%)', width:'80vw', height:'60vh', background:`radial-gradient(ellipse at top, ${currentBrand.hex} 0%, transparent 60%)`, opacity: dark ? 0.08 : 0.05, pointerEvents:'none', zIndex: 0, transition:'background 0.5s ease' }}/>
      <div className="bg-grid" />

      <header className="full-lib-header" style={{ padding:'24px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', zIndex:10, position:'relative', borderBottom:'1px solid var(--line2)', background:'var(--bg2)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <button className="icon-btn" onClick={onBackToHub} title="Back to Hub"><ArrowLeft size={16}/></button>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'var(--text)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Library size={18} color="var(--bg)" strokeWidth={2.5}/>
            </div>
            <div>
              <h1 style={{ fontSize:16, fontWeight:700, letterSpacing:'-0.02em', color:'var(--text)' }}>Resource Library</h1>
              <p style={{ fontSize:10, fontWeight:600, letterSpacing:'0.1em', color:'var(--text3)', textTransform:'uppercase' }}>Expanded View</p>
            </div>
          </div>
        </div>
        <div style={{ display:'flex', gap:12 }}>
          <button className="icon-btn" onClick={toggleTheme}>{dark ? <Sun size={16}/> : <Moon size={16}/>}</button>
        </div>
      </header>

      <main className="full-lib-main" style={{ flex:1, display:'flex', flexDirection:'column', padding:'32px 40px', zIndex:10, position:'relative', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom: 32, flexWrap:'wrap' }}>
           <button onClick={()=>navigateTo(-1)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:16, fontWeight:600, color: !subjectCode ? 'var(--text)' : 'var(--text3)', transition:'color 0.2s' }}>All Subjects</button>
           {subjectCode && <ChevronRight size={16} color="var(--text3)"/>}
           {subjectCode && (
             <button onClick={()=>navigateTo(0)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:16, fontWeight:600, color: currentPath.length === 0 ? currentBrand.hex : 'var(--text3)', transition:'color 0.2s', display:'flex', alignItems:'center', gap:6 }}>
               {brandColors[subjectCode]?.name || subjectCode}
             </button>
           )}
           {currentPath.map((step, idx) => (
             <React.Fragment key={idx}>
               <ChevronRight size={16} color="var(--text3)"/>
               <button onClick={()=>navigateTo(idx+1)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:16, fontWeight:600, color: idx === currentPath.length - 1 ? 'var(--text)' : 'var(--text3)', transition:'color 0.2s' }}>
                 {step}
               </button>
             </React.Fragment>
           ))}
        </div>

        {currentItems.length === 0 ? (
           <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'var(--text3)', opacity:0.6 }}>
             <Folder size={64} style={{ marginBottom: 16 }} />
             <p style={{ fontSize: 16, fontWeight: 600 }}>This folder is empty.</p>
           </div>
        ) : (
          <div className="full-lib-grid">
            {currentItems.map((item, i) => {
              if (item.type === 'folder') {
                 return (
                   <button key={i} className="glass-panel" onClick={() => { if(!subjectCode) { setSubjectCode(item.name); setCurrentPath([]); } else { setCurrentPath(prev => [...prev, item.name]); } }}
                      style={{ padding:24, borderRadius:20, cursor:'pointer', transition:'all 0.2s', display:'flex', flexDirection:'column', alignItems:'flex-start', border:'1px solid var(--line2)', background:'var(--surface2)', textAlign:'left' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = currentBrand.hex; e.currentTarget.style.background = 'var(--surface)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--line2)'; e.currentTarget.style.background = 'var(--surface2)'; }}>
                      <Folder size={32} color={currentBrand.hex} style={{ marginBottom: 16 }} />
                      <h3 style={{ fontSize:16, fontWeight:700, color:'var(--text)', marginBottom:4 }}>{brandColors[item.name]?.name || item.name}</h3>
                      <p style={{ fontSize:12, color:'var(--text3)', fontWeight:500 }}>{item.children?.length || 0} items</p>
                   </button>
                 )
              } else {
                 return (
                   <a key={i} href={item.path} target="_blank" rel="noopener noreferrer" className="glass-panel"
                      style={{ padding:24, borderRadius:20, cursor:'pointer', transition:'all 0.2s', display:'flex', flexDirection:'column', alignItems:'flex-start', border:'1px solid var(--line2)', background:'var(--surface2)', textDecoration:'none' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--text2)'; e.currentTarget.style.background = 'var(--surface)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--line2)'; e.currentTarget.style.background = 'var(--surface2)'; }}>
                      <FileText size={32} color="var(--rose)" style={{ marginBottom: 16 }} />
                      <h3 style={{ fontSize:15, fontWeight:600, color:'var(--text)', marginBottom:8, lineHeight:1.4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.name}</h3>
                      <div style={{ marginTop:'auto', display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%' }}>
                        <span style={{ fontSize:11, color:'var(--text3)', background:'var(--surface3)', padding:'4px 8px', borderRadius:6, fontWeight:600 }}>{item.size}</span>
                        <ExternalLink size={14} color="var(--text3)"/>
                      </div>
                   </a>
                 )
              }
            })}
          </div>
        )}
      </main>
    </div>
  );
};

// ─── FULL PAGE TOPICALS VIEW ──────────────────────────────────────────────────
const FullTopicalsPage = ({ initialSubject, topicalDb, onBackToHub, toggleTheme, dark, onSelectQuestion }) => {
  const [subjectCode, setSubjectCode] = useState(initialSubject || '');
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [searchQ, setSearchQ] = useState('');

  const brandColors = {
    '9618': { hex: 'var(--teal)', name: 'Computer Science', icon: <Terminal size={16}/> },
    '9702': { hex: 'var(--amber)', name: 'Physics', icon: <Zap size={16}/> },
    '9701': { hex: 'var(--rose)', name: 'Chemistry', icon: <Beaker size={16}/> },
    '9709': { hex: 'var(--accent)', name: 'Mathematics', icon: <Activity size={16}/> }
  };

  const currentBrand = brandColors[subjectCode] || { hex: 'var(--text)', name: 'Topicals' };
  const subjName = subjectCode ? subjectName(subjectCode) : null;
  const db = topicalDb && subjectCode ? topicalDb[subjectCode] : null;
  const syllabus = subjectCode ? SYLLABUS_STRUCTURE[subjectCode] : null;
  const papers = syllabus ? Object.keys(syllabus).sort() : [];

  useEffect(() => {
    if (syllabus) { setSelectedPaper(Object.keys(syllabus).sort()[0]); setSelectedTopic(null); }
  }, [subjectCode]);

  useEffect(() => { setSelectedTopic(null); setSearchQ(''); }, [selectedPaper]);

  const getQs = (pNum, topic) => db?.[pNum]?.topics?.[topic] || [];

  const paperInfo = selectedPaper && syllabus ? syllabus[selectedPaper] : null;
  const topics = paperInfo ? paperInfo.topics : [];
  const questions = selectedPaper && selectedTopic ? getQs(selectedPaper, selectedTopic) : [];
  const filteredQuestions = searchQ.trim()
    ? questions.filter(q => q.season_year.toLowerCase().includes(searchQ.toLowerCase()))
    : questions;

  const maxQ = useMemo(() => {
    if (!selectedPaper || !db || !syllabus) return 1;
    const ts = syllabus[selectedPaper]?.topics || [];
    return Math.max(1, ...ts.map(t => getQs(selectedPaper, t).length));
  }, [selectedPaper, db]);

  const totalQ = useMemo(() => {
    if (!db) return 0;
    let c = 0;
    Object.values(db).forEach(p => Object.values(p.topics || {}).forEach(qs => c += qs.length));
    return c;
  }, [db]);

  const totalTopics = syllabus ? Object.values(syllabus).reduce((acc, p) => acc + p.topics.length, 0) : 0;

  const PAPER_COLORS = {
    '1': { hex: '#2dd4bf', bg: 'rgba(45,212,191,0.08)' },
    '2': { hex: '#818cf8', bg: 'rgba(129,140,248,0.08)' },
    '3': { hex: '#fbbf24', bg: 'rgba(251,191,36,0.08)' },
    '4': { hex: '#fb7185', bg: 'rgba(251,113,133,0.08)' },
  };
  const pColor = (pNum) => PAPER_COLORS[pNum] || PAPER_COLORS['1'];
  const ac = selectedPaper ? pColor(selectedPaper) : pColor('1');

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden', background:'var(--bg)' }}>
      <GlobalStyles dark={dark}/>
      <div style={{ position:'absolute', top:'-20%', left:'50%', transform:'translateX(-50%)', width:'80vw', height:'60vh', background:`radial-gradient(ellipse at top, ${currentBrand.hex} 0%, transparent 60%)`, opacity: dark ? 0.08 : 0.05, pointerEvents:'none', zIndex: 0, transition:'background 0.5s ease' }}/>
      <div className="bg-grid" />

      <header className="full-lib-header" style={{ padding:'24px 40px', display:'flex', justifyContent:'space-between', alignItems:'center', zIndex:10, position:'relative', borderBottom:'1px solid var(--line2)', background:'var(--bg2)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <button className="icon-btn" onClick={onBackToHub} title="Back to Hub"><ArrowLeft size={16}/></button>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'var(--text)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Compass size={18} color="var(--bg)" strokeWidth={2.5}/>
            </div>
            <div>
              <h1 style={{ fontSize:16, fontWeight:700, letterSpacing:'-0.02em', color:'var(--text)' }}>Topical Database</h1>
              <p style={{ fontSize:10, fontWeight:600, letterSpacing:'0.1em', color:'var(--text3)', textTransform:'uppercase' }}>Expanded View</p>
            </div>
          </div>
        </div>
        <div style={{ display:'flex', gap:12 }}>
          <button className="icon-btn" onClick={toggleTheme}>{dark ? <Sun size={16}/> : <Moon size={16}/>}</button>
        </div>
      </header>

      <main className="full-lib-main" style={{ flex:1, display:'flex', flexDirection:'column', padding:'32px 40px', zIndex:10, position:'relative', maxWidth: 1400, margin: '0 auto', width: '100%', overflow:'hidden' }}>
        
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 20, flexWrap:'wrap', gap: 16, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
             <button onClick={()=>setSubjectCode('')} style={{ background:'none', border:'none', cursor:'pointer', fontSize:16, fontWeight:600, color: !subjectCode ? 'var(--text)' : 'var(--text3)', transition:'color 0.2s' }}>All Subjects</button>
             {subjectCode && <ChevronRight size={16} color="var(--text3)"/>}
             {subjectCode && (
               <span style={{ fontSize:16, fontWeight:600, color: currentBrand.hex, display:'flex', alignItems:'center', gap:6 }}>
                 {brandColors[subjectCode]?.name || subjName}
               </span>
             )}
          </div>
          
          {subjectCode && syllabus && (
            <div style={{ display:'flex', gap: 10 }}>
              {totalQ > 0 && [{ label:'Questions', val:totalQ }, { label:'Topics', val:totalTopics }].map((s, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', background:'var(--surface2)', border:'1px solid var(--line2)', borderRadius:8, fontSize:12 }}>
                  <span style={{ fontWeight:800, color:i===0?ac.hex:'var(--text)' }}>{s.val}</span>
                  <span style={{ color:'var(--text3)', fontWeight:500 }}>{s.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {!subjectCode ? (
           <div className="full-lib-grid" style={{ overflowY:'auto', paddingBottom:40 }}>
             {SUBJECTS.filter(s => ['9618', '9702', '9701'].includes(s.code)).map((s, i) => (
               <button key={i} className="glass-panel" onClick={() => setSubjectCode(s.code)}
                  style={{ padding:24, borderRadius:20, cursor:'pointer', transition:'all 0.2s', display:'flex', flexDirection:'column', alignItems:'flex-start', border:'1px solid var(--line2)', background:'var(--surface2)', textAlign:'left' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--text)'; e.currentTarget.style.background = 'var(--surface)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--line2)'; e.currentTarget.style.background = 'var(--surface2)'; }}>
                  <Compass size={32} color="var(--text2)" style={{ marginBottom: 16 }} />
                  <h3 style={{ fontSize:16, fontWeight:700, color:'var(--text)', marginBottom:4 }}>{s.name}</h3>
                  <p style={{ fontSize:12, color:'var(--text3)', fontWeight:500 }}>Code {s.code}</p>
               </button>
             ))}
           </div>
        ) : !syllabus ? (
           <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12 }}>
             <Compass size={56} style={{ opacity:0.15 }}/>
             <p style={{ fontSize:16, color:'var(--text)', fontWeight:700 }}>Coming Soon</p>
             <p style={{ fontSize:14, color:'var(--text2)' }}>Topical mapping for {subjName} is not yet available.</p>
           </div>
        ) : (
          <div className="topicals-content glass-panel" style={{ borderRadius:20, border:'1px solid var(--line2)', overflow:'hidden', display:'flex', flex:1 }}>
            
            {/* Paper Selector */}
            <div className={`topicals-papers custom-sb ${selectedTopic ? 'mobile-hidden' : ''}`}>
              <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text3)', paddingLeft:8, marginBottom:6 }}>Papers</p>
              {papers.map(pNum => {
                const pc = pColor(pNum);
                const pData = syllabus[pNum];
                const isActive = selectedPaper === pNum;
                const pQCount = pData.topics.reduce((a, t) => a + getQs(pNum, t).length, 0);
                return (
                  <button key={pNum} onClick={() => setSelectedPaper(pNum)}
                    style={{ textAlign:'left', padding:'14px', borderRadius:12, border:`1px solid ${isActive ? pc.hex+'60' : 'var(--line2)'}`, background:isActive ? pc.bg : 'transparent', cursor:'pointer', transition:'all 0.2s' }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface2)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background:pc.hex, flexShrink:0 }}/>
                      <span style={{ fontSize:13, fontWeight:700, color:isActive ? pc.hex : 'var(--text)' }}>Paper {pNum}</span>
                    </div>
                    <p style={{ fontSize:11, color:'var(--text3)', lineHeight:1.4, paddingLeft:16, marginBottom:6 }}>{pData.title}</p>
                    <div style={{ display:'flex', gap:5, paddingLeft:16, flexWrap:'wrap' }}>
                      <span style={{ fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:6, background:'var(--surface2)', color:'var(--text3)' }}>{pData.topics.length} topics</span>
                      {pQCount > 0 && <span style={{ fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:6, background:pc.bg, color:pc.hex }}>{pQCount} Qs</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Topics Grid */}
            <div className={`topicals-grid ${selectedTopic ? 'mobile-hidden' : ''}`}>
              <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--line2)', background:'var(--bg2)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  {paperInfo && <div style={{ width:4, height:22, borderRadius:2, background:ac.hex, flexShrink:0 }}/>}
                  <span style={{ fontSize:15, fontWeight:700, color:'var(--text)' }}>{paperInfo?.title || 'Select a Paper'}</span>
                  {topics.length > 0 && <span style={{ fontSize:12, color:'var(--text3)', background:'var(--surface2)', padding:'3px 8px', borderRadius:6 }}>{topics.length} topics</span>}
                </div>
                {selectedTopic && (
                  <button onClick={() => setSelectedTopic(null)}
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:8, border:'1px solid var(--line2)', background:'var(--surface2)', color:'var(--text2)', cursor:'pointer', fontSize:12, fontWeight:600 }}>
                    <X size={12}/> Clear
                  </button>
                )}
              </div>
              <div className="custom-sb" style={{ flex:1, overflowY:'auto', padding:'20px' }}>
                {topics.length === 0 ? (
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'var(--text3)', fontSize:14 }}>Select a paper to view its topics</div>
                ) : (
                  <div className="topicals-grid-inner">
                    {topics.map(topic => {
                      const qCount = getQs(selectedPaper, topic).length;
                      const barPct = maxQ > 0 ? (qCount / maxQ) * 100 : 0;
                      const isSel = selectedTopic === topic;
                      return (
                        <button key={topic} onClick={() => setSelectedTopic(isSel ? null : topic)}
                          style={{ textAlign:'left', padding:'18px', borderRadius:14, border:`1px solid ${isSel ? ac.hex+'70' : 'var(--line2)'}`, background:isSel ? ac.bg : 'var(--bg2)', cursor:'pointer', transition:'all 0.2s', position:'relative', overflow:'hidden' }}
                          onMouseEnter={e => { if (!isSel) { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--line2)'; } }}
                          onMouseLeave={e => { if (!isSel) { e.currentTarget.style.background = 'var(--bg2)'; e.currentTarget.style.transform = 'translateY(0)'; } }}>
                          {isSel && <div style={{ position:'absolute', top:0, right:0, width:'60%', height:'100%', background:`radial-gradient(ellipse at top right, ${ac.hex}20, transparent 70%)`, pointerEvents:'none' }}/>}
                          <div style={{ fontSize:13, fontWeight:700, color:isSel ? ac.hex : 'var(--text)', marginBottom:12, lineHeight:1.4 }}>{topic}</div>
                          <div style={{ height:4, borderRadius:4, background:'var(--surface3)', marginBottom:10, overflow:'hidden' }}>
                            <div style={{ height:'100%', width:`${barPct}%`, background:isSel ? ac.hex : 'var(--line2)', borderRadius:4, transition:'width 0.5s ease' }}/>
                          </div>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                            <span style={{ fontSize:12, fontWeight:700, color:qCount > 0 ? (isSel ? ac.hex : 'var(--text2)') : 'var(--text3)' }}>
                              {qCount > 0 ? `${qCount} question${qCount !== 1 ? 's' : ''}` : 'No data yet'}
                            </span>
                            {isSel && <ArrowRight size={13} color={ac.hex}/>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Questions Detail Panel */}
            {selectedTopic && (
              <div className="topicals-questions">
                <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--line2)', flexShrink:0 }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ fontSize:13, fontWeight:800, color:'var(--text)', lineHeight:1.4, flex:1, paddingRight:8 }}>{selectedTopic}</span>
                    <button className="icon-btn" style={{ width:28, height:28, flexShrink:0 }} onClick={() => setSelectedTopic(null)}><X size={14}/></button>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:questions.length > 5 ? 12 : 0 }}>
                    <div style={{ width:6, height:6, borderRadius:'50%', background:ac.hex }}/>
                    <span style={{ fontSize:11, color:ac.hex, fontWeight:700 }}>{questions.length} paper{questions.length !== 1 ? 's' : ''} available</span>
                  </div>
                  {questions.length > 5 && (
                    <div style={{ position:'relative' }}>
                      <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Filter by season / year…"
                        style={{ width:'100%', padding:'8px 12px 8px 32px', borderRadius:8, border:'1px solid var(--line2)', background:'var(--surface2)', color:'var(--text)', fontSize:12, outline:'none', fontFamily:'Outfit, sans-serif', transition:'border-color 0.2s' }}
                        onFocus={e => e.target.style.borderColor = ac.hex}
                        onBlur={e => e.target.style.borderColor = 'var(--line2)'}/>
                      <Search size={12} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text3)', pointerEvents:'none' }}/>
                    </div>
                  )}
                </div>
                <div className="custom-sb" style={{ flex:1, overflowY:'auto', padding:'12px 14px', display:'flex', flexDirection:'column', gap:8 }}>
                  {filteredQuestions.length === 0 ? (
                    <p style={{ textAlign:'center', color:'var(--text3)', fontSize:13, padding:'24px 0' }}>
                      {questions.length === 0 ? 'No questions indexed yet.' : 'No results.'}
                    </p>
                  ) : (
                    filteredQuestions.map((item, idx) => {
                      const sCode = item.season_year[0];
                      const yrSuffix = item.season_year.slice(1);
                      const sName = { m:'March', s:'Summer', w:'Winter' }[sCode] || sCode.toUpperCase();
                      return (
                        <button key={idx} onClick={() => onSelectQuestion(item.paper_id, item.page_number)}
                          style={{ textAlign:'left', padding:'12px 14px', borderRadius:12, border:'1px solid var(--line2)', background:'var(--bg)', cursor:'pointer', transition:'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = ac.hex+'80'; e.currentTarget.style.background = ac.bg; e.currentTarget.style.transform = 'translateX(3px)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line2)'; e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.transform = 'translateX(0)'; }}>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                              <span style={{ fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:6, background:ac.bg, color:ac.hex }}>{sName} 20{yrSuffix}</span>
                              <span style={{ fontSize:11, fontWeight:600, color:'var(--text3)', padding:'3px 7px', borderRadius:6, background:'var(--surface2)' }}>Var {item.variant}</span>
                            </div>
                            <span style={{ fontSize:10, fontWeight:700, color:'var(--text3)' }}>pg {item.page_number}</span>
                          </div>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                            <span style={{ fontSize:12, color:'var(--text2)', fontWeight:500 }}>Q {item.questions?.join(', ')}</span>
                            <ArrowRight size={12} color="var(--text3)"/>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

// ─── NexusSelect & Modals ───────────────────────────────────────────────────

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

// ─── Sidebars (Topicals, Library, MCQSolver) ────────────────────────────────

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

const LibrarySidebar = ({ subjectCode, libraryDb, onClose }) => {
  const subjName = subjectCode ? subjectName(subjectCode) : null;
  const [expanded, setExpanded] = useState({});

  const targetFolder = useMemo(() => {
    if (!subjectCode) return { children: libraryDb }; 
    return libraryDb?.find(f => f.name === subjectCode) || null;
  }, [libraryDb, subjectCode]);

  const toggleFolder = (path) => {
    setExpanded(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const renderTree = (nodes, currentPath = '') => {
    if (!nodes) return null;
    return nodes.map((node) => {
      const nodePath = `${currentPath}/${node.name}`;
      if (node.type === 'folder') {
        const isExp = expanded[nodePath];
        return (
          <div key={nodePath} style={{ marginBottom: 4 }}>
            <button onClick={() => toggleFolder(nodePath)}
              style={{ display:'flex', alignItems:'center', width:'100%', padding:'10px 12px', background: isExp ? 'var(--surface2)' : 'transparent', border:'none', borderRadius:8, color:'var(--text)', cursor:'pointer', transition:'all 0.2s' }}
              onMouseEnter={e => { if(!isExp) e.currentTarget.style.background = 'var(--surface2)'; }}
              onMouseLeave={e => { if(!isExp) e.currentTarget.style.background = 'transparent'; }}>
              {isExp ? <ChevronDown size={16} style={{ marginRight:8, color:'var(--text3)' }}/> : <ChevronRight size={16} style={{ marginRight:8, color:'var(--text3)' }}/>}
              <Folder size={16} style={{ marginRight:8, color:'var(--accent)' }}/>
              <span style={{ fontSize:13, fontWeight:600 }}>{node.name}</span>
            </button>
            {isExp && (
              <div style={{ paddingLeft: 12, marginTop: 4, borderLeft:'1px solid var(--line2)', marginLeft: 18 }}>
                {renderTree(node.children, nodePath)}
              </div>
            )}
          </div>
        );
      } else {
        return (
          <div key={nodePath} style={{ marginBottom: 4 }}>
            <a href={node.path} target="_blank" rel="noopener noreferrer"
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', padding:'10px 12px', background:'var(--surface)', border:'1px solid var(--line2)', borderRadius:8, color:'var(--text2)', cursor:'pointer', transition:'all 0.2s', textDecoration:'none' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text3)'; e.currentTarget.style.color = 'var(--text)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line2)'; e.currentTarget.style.color = 'var(--text2)'; }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, overflow:'hidden' }}>
                <FileText size={14} style={{ flexShrink:0, color:'var(--rose)' }}/>
                <span style={{ fontSize:12, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', fontWeight:500 }}>{node.name}</span>
              </div>
              <span style={{ fontSize:10, color:'var(--text3)', flexShrink:0, marginLeft:8, background:'var(--surface2)', padding:'2px 6px', borderRadius:4 }}>{node.size}</span>
            </a>
          </div>
        );
      }
    });
  };

  return (
    <div className="library-sidebar">
      <div style={{ padding:'20px 24px',borderBottom:'1px solid var(--line2)',flexShrink:0 }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div style={{ display:'flex',alignItems:'center',gap:12 }}>
            <div style={{ width:36,height:36,borderRadius:10,background:'var(--surface2)',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <Library size={18} color="var(--text)"/>
            </div>
            <div>
              <div style={{ fontSize:16,fontWeight:700,color:'var(--text)' }}>Library Explorer</div>
              <div style={{ fontSize:12,color:'var(--text3)' }}>{subjectCode ? subjName : 'All Subjects'}</div>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={16}/></button>
        </div>
      </div>

      <div className="custom-sb" style={{ flex:1, overflowY:'auto', padding:'20px 24px', display:'flex', flexDirection:'column' }}>
        {!targetFolder || targetFolder.children?.length === 0 ? (
           <div style={{ textAlign:'center',padding:'60px 0',color:'var(--text3)' }}>
            <Folder size={48} style={{ opacity:0.2,marginBottom:16 }}/>
            <p style={{ fontSize:15,fontWeight:600,marginBottom:8,color:'var(--text)' }}>Folder Empty</p>
            <p style={{ fontSize:13,lineHeight:1.6 }}>No files indexed for this subject yet. Add PDFs to <span style={{fontFamily:'monospace'}}>/public/library/</span> and run the Python script.</p>
          </div>
        ) : (
          renderTree(targetFolder.children, subjectCode || 'root')
        )}
      </div>
    </div>
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

  const [sheetHeight, setSheetHeight] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDragging) return;
      let vh = ((window.innerHeight - e.clientY) / window.innerHeight) * 100;
      if (vh < 20) vh = 20; 
      if (vh > 90) vh = 90; 
      setSheetHeight(vh);
    };
    
    const handlePointerUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isDragging]);

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
    <div className={`mcq-sidebar ${!isDragging ? 'snap-anim' : ''}`} style={{ '--sheet-height': `${sheetHeight}vh` }}>
      <div 
        className="drag-handle mobile-only" 
        onPointerDown={(e) => { 
          e.preventDefault(); 
          e.target.setPointerCapture(e.pointerId);
          setIsDragging(true); 
        }}
      >
        <div className="drag-bar" />
      </div>

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

// ─── ADMIN: Embedded Rapid Indexer Tool ─────────────────────────────────────────
const TopicalIndexer = ({ syllabusDb, onClose }) => {
  // --- Security State ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- Indexer State ---
  const [subj, setSubj] = useState('9618');
  const [yr, setYr] = useState('2023');
  const [ssn, setSsn] = useState('s');
  const [ppr, setPpr] = useState('1');
  const [varnt, setVarnt] = useState('2');
  const [docType, setDocType] = useState('qp'); 

  const [qNum, setQNum] = useState('');
  const [pageNum, setPageNum] = useState('');

  const [database, setDatabase] = useState({});
  const [copied, setCopied] = useState(false);

  // Mathematically compute the exact file name
  const seasonYear = `${ssn}${yr.slice(2)}`;
  const viewPaperId = `${subj}_${seasonYear}_${docType}_${ppr}${varnt}.pdf`; 
  const logPaperId = `${subj}_${seasonYear}_qp_${ppr}${varnt}.pdf`;          

  const topics = syllabusDb[subj]?.[ppr]?.topics || [];

  const handleLogin = (e) => {
    e.preventDefault();
    // 🔒 CHANGE YOUR ADMIN CREDENTIALS HERE:
    if (username === 'admin' && password === 'nexus2026') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid credentials. Access denied.');
    }
  };

  const handleLogQuestion = (topic) => {
    if (!qNum || !pageNum) return alert('Fill in Q# and PDF Page#');

    setDatabase(prev => {
      const db = { ...prev };
      if (!db[topic]) db[topic] = [];
      const existingEntry = db[topic].find(e => e.paper_id === logPaperId && e.page_number === parseInt(pageNum));
      if (existingEntry) {
         if(!existingEntry.questions.includes(qNum)) existingEntry.questions.push(qNum);
      } else {
        db[topic].push({
          paper_id: logPaperId, season_year: seasonYear, variant: varnt, questions: [qNum], page_number: parseInt(pageNum)
        });
      }
      return db;
    });
    setQNum('');
  };

  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(database, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectStyle = { padding: '8px 12px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '6px', outline: 'none', fontSize: '13px', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' };

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', height: '100vh', background: '#05050A', color: '#f8fafc', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif' }}>
        <form onSubmit={handleLogin} style={{ background: '#0a0a14', padding: '40px', borderRadius: '24px', border: '1px solid #1e293b', width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
            <div style={{ width:56, height:56, borderRadius:16, background:'rgba(99, 102, 241, 0.1)', border: '1px solid #6366f1', display:'flex', alignItems:'center', justifyContent:'center', color:'#6366f1' }}>
              <Database size={28}/>
            </div>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', textAlign: 'center', marginBottom: '2px' }}>Admin Login</h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', marginBottom: '16px' }}>Restricted access for dataset indexing.</p>

          {loginError && <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: '500', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{loginError}</div>}

          <input autoFocus placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} style={{ padding: '14px 16px', borderRadius: '10px', background: '#1e293b', border: '1px solid #334155', color: '#fff', outline: 'none', fontSize: '14px', fontFamily: 'Outfit, sans-serif' }} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '14px 16px', borderRadius: '10px', background: '#1e293b', border: '1px solid #334155', color: '#fff', outline: 'none', fontSize: '14px', fontFamily: 'Outfit, sans-serif' }} />

          <button type="submit" style={{ padding: '14px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', marginTop: '8px', transition: 'background 0.2s' }} onMouseEnter={e => e.target.style.background='#4f46e5'} onMouseLeave={e => e.target.style.background='#6366f1'}>Authorize Access</button>
          <button type="button" onClick={onClose} style={{ padding: '14px', background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.target.style.color='#f8fafc'; e.target.style.borderColor='#94a3b8'; }} onMouseLeave={e => { e.target.style.color='#94a3b8'; e.target.style.borderColor='#334155'; }}>Cancel & Return</button>
        </form>
      </div>
    );
  }

  // --- MAIN INDEXER WORKSPACE ---
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#05050A', color: '#f8fafc', fontFamily: 'Outfit, sans-serif', overflow: 'hidden' }}>
      
      {/* LEFT PANEL: PDF Viewer */}
      <div style={{ flex: 1, borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="custom-sb" style={{ padding: '16px', background: '#0a0a14', display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1px solid #1e293b', overflowX: 'auto', flexShrink: 0 }}>
           <button onClick={onClose} style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:8,border:'1px solid #334155',cursor:'pointer',background:'#1e293b',color:'#fff',fontSize:13,fontWeight:600, marginRight: '10px', flexShrink: 0 }}>
             <ArrowLeft size={16}/> Exit
           </button>
           <select value={subj} onChange={e => setSubj(e.target.value)} style={selectStyle}>{SUBJECTS.map(s => <option key={s.code} value={s.code}>{s.code}</option>)}</select>
           <select value={yr} onChange={e => setYr(e.target.value)} style={selectStyle}>{YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select>
           <select value={ssn} onChange={e => setSsn(e.target.value)} style={selectStyle}>{SEASONS.map(s => <option key={s.code} value={s.code}>{s.code.toUpperCase()}</option>)}</select>
           <select value={ppr} onChange={e => setPpr(e.target.value)} style={selectStyle}>{PAPERS.map(p => <option key={p} value={p}>P{p}</option>)}</select>
           <select value={varnt} onChange={e => setVarnt(e.target.value)} style={selectStyle}>{VARIANTS.map(v => <option key={v} value={v}>V{v}</option>)}</select>
           <select value={docType} onChange={e => setDocType(e.target.value)} style={{...selectStyle, border: '1px solid #6366f1', marginLeft: 'auto', flexShrink: 0}}>
             <option value="qp">Question Paper (QP)</option>
             <option value="ms">Mark Scheme (MS)</option>
           </select>
        </div>
        <iframe src={`/pdf-viewer/web/viewer.html?file=/papers/${viewPaperId}`} style={{ width: '100%', height: '100%', border: 'none', background: '#e5e7eb' }} title="Indexer" />
      </div>

      {/* RIGHT PANEL: Rapid Indexer Engine */}
      <div style={{ width: '420px', display: 'flex', flexDirection: 'column', height: '100vh', background: '#0a0a14' }}>
        
        {/* Top Section (Fixed Header & Inputs) */}
        <div style={{ padding: '24px 24px 16px 24px', flexShrink: 0 }}>
          <div style={{ display:'flex', alignItems:'center', gap: 12, marginBottom: 24 }}>
             <div style={{ width:40,height:40,borderRadius:12,background:'#6366f1',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff' }}>
               <Database size={20}/>
             </div>
             <div>
               <h2 style={{ fontSize: '20px', fontWeight: '700', lineHeight:1.2 }}>Rapid Indexer</h2>
               <p style={{ fontSize: '12px', color: '#94a3b8' }}>Target: {logPaperId}</p>
             </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
               <label style={{ fontSize: '12px', color: '#94a3b8', display:'block', marginBottom:4 }}>Question Num</label>
               <input type="text" value={qNum} onChange={e => setQNum(e.target.value)} style={{ width: '100%', padding: '12px', background: '#1e293b', border: '1px solid #6366f1', color: '#fff', borderRadius: '8px', fontSize: '16px', outline:'none' }} placeholder="e.g. 1a" />
            </div>
            <div style={{ flex: 1 }}>
               <label style={{ fontSize: '12px', color: '#94a3b8', display:'block', marginBottom:4 }}>PDF Page Num</label>
               <input type="number" value={pageNum} onChange={e => setPageNum(e.target.value)} style={{ width: '100%', padding: '12px', background: '#1e293b', border: '1px solid #6366f1', color: '#fff', borderRadius: '8px', fontSize: '16px', outline:'none' }} placeholder="e.g. 2" />
            </div>
          </div>
        </div>

        {/* Scrollable Main Area (Topics + JSON Box) */}
        <div className="custom-sb" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          
          {/* Topics Grid */}
          <div style={{ padding: '0 24px 24px 24px' }}>
            <h3 style={{ fontSize: '12px', color: '#94a3b8', margin: '16px 0 12px 0', textTransform: 'uppercase', letterSpacing:'0.05em' }}>Tap Topic to Log Question</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
              {topics.length === 0 ? (
                <div style={{ padding: '16px', background: '#1e293b', borderRadius: '8px', color: '#94a3b8', fontSize: '13px', textAlign: 'center' }}>No topics mapped for P{ppr} yet.</div>
              ) : topics.map(topic => (
                <button key={topic} onClick={() => handleLogQuestion(topic)}
                  style={{ textAlign: 'left', padding: '12px 16px', background: '#1e293b', border: '1px solid #334155', color: '#f8fafc', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s', fontSize:13, fontWeight:500 }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#334155'; e.currentTarget.style.borderColor = '#6366f1'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.borderColor = '#334155'; }}>
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* JSON Output (Pushed to bottom, scrolls naturally into view) */}
          <div style={{ padding: '0 24px 24px 24px', marginTop: 'auto' }}>
            <div style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden', display:'flex', flexDirection:'column', minHeight:'220px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems:'center', padding: '10px 16px', borderBottom: '1px solid #334155', background: '#0a0a14', flexShrink:0 }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color:'#f8fafc' }}>Generated JSON</span>
                <button onClick={copyJSON} style={{ background: copied?'#10b981':'#6366f1', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', padding:'6px 12px', borderRadius:6, transition:'all 0.2s' }}>
                  {copied ? <Check size={14}/> : <Copy size={14}/>} {copied ? 'Copied!' : 'Copy Data'}
                </button>
              </div>
              <pre style={{ padding: '16px', fontSize: '11px', color: '#cbd5e1', margin: 0, flex:1, whiteSpace:'pre-wrap' }}>
                {Object.keys(database).length === 0 ? '// Output will appear here...\n// Ready to log.' : JSON.stringify(database, null, 2)}
              </pre>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// ─── App (Main Controller) ────────────────────────────────────────────────────
export default function App() {

  const [showIndexer, setShowIndexer]           = useState(false);

  const [dark, setDark] = useState(()=>localStorage.getItem('nexusTheme')!=='light');
  useEffect(()=>{ localStorage.setItem('nexusTheme',dark?'dark':'light'); },[dark]);
  const toggleTheme = () => setDark(d=>!d);

  const [showStartup, setShowStartup]           = useState(true);
  const [showFullLibrary, setShowFullLibrary]   = useState(false);
  const [showFullTopicals, setShowFullTopicals] = useState(false);
  const [showContact, setShowContact]           = useState(false);
  const [isViewing,   setIsViewing]             = useState(false);
  const [showNav,     setShowNav]               = useState(true);
  const [showLibrary, setShowLibrary]           = useState(false);
  const [showMCQ,     setShowMCQ]               = useState(false);
  const [showTopicals,setShowTopicals]          = useState(false);

  const [topicalDb, setTopicalDb] = useState(null);
  const [libraryDb, setLibraryDb] = useState([]);
  const [targetPage, setTargetPage] = useState(1);
  const [mcqSessionData, setMcqSessionData] = useState({});

  const [subject, setSubject] = useState('');
  const [year,    setYear]    = useState('');
  const [season,  setSeason]  = useState('');
  const [paper,   setPaper]   = useState('');
  const [variant, setVariant] = useState('');
  const [type,    setType]    = useState('qp');

  const isComplete    = subject && year && season && paper && variant;
  const canShowLibrary  = true;
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

    fetch('/library_db.json')
      .then(res => res.json())
      .then(data => setLibraryDb(data))
      .catch(err => console.log('No library DB generated yet.'));
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
    setShowLibrary(false); 
    setShowMCQ(false); 
  }, [paper,variant,season,year,type]);

  const handleLoad = () => { if (!isComplete) return; setTargetPage(1); setIsViewing(true); setShowNav(false); };
  
  const handleHome = () => { 
    setIsViewing(false); 
    setShowNav(true); 
  };

  const handleBackToHub = () => {
    setShowStartup(true);
    setShowFullLibrary(false);
    setShowFullTopicals(false);
    setIsViewing(false);
    setShowLibrary(false);
    setShowTopicals(false);
    setShowMCQ(false);
  };

  const handleSelectExplorer = (subjCode) => {
    if (subjCode) setSubject(subjCode);
    setShowStartup(false);
  };

  const handleSelectTopicalsDashboard = (subjCode) => {
    setSubject(subjCode || ''); 
    setShowStartup(false);
    setShowFullTopicals(true);
  };

  const handleSelectLibraryDashboard = (subjCode) => {
    setSubject(subjCode || ''); 
    setShowStartup(false);
    setShowFullLibrary(true);
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
      setShowTopicals(false);
      setShowFullTopicals(false);
    }
  }, []);

  if (showIndexer) return <TopicalIndexer syllabusDb={SYLLABUS_STRUCTURE} onClose={() => setShowIndexer(false)} />;

  if (showStartup) return (
    <><GlobalStyles dark={dark}/><StartupScreen onSelectExplorer={handleSelectExplorer} onSelectTopicals={handleSelectTopicalsDashboard} onSelectLibrary={handleSelectLibraryDashboard} toggleTheme={toggleTheme} dark={dark} onOpenIndexer={() => setShowIndexer(true)}/></>
  );

  if (showFullLibrary) return (
    <FullLibraryPage initialSubject={subject} libraryDb={libraryDb} onBackToHub={handleBackToHub} toggleTheme={toggleTheme} dark={dark} />
  );

  if (showFullTopicals) return (
    <FullTopicalsPage initialSubject={subject} topicalDb={topicalDb} onBackToHub={handleBackToHub} toggleTheme={toggleTheme} dark={dark} onSelectQuestion={handleTopicalSelect} />
  );

  return (
    <>
      <GlobalStyles dark={dark}/>
      <ContactModal isOpen={showContact} onClose={()=>setShowContact(false)}/>

      <div style={{ display:'flex',flexDirection:'column',height:'100vh',background:'var(--bg)',overflow:'hidden' }}>

        <div 
          style={{ display:'grid',gridTemplateRows:showNav?'1fr':'0fr',transition:'grid-template-rows 0.3s cubic-bezier(0.16,1,0.3,1)',flexShrink:0,zIndex:30 }}
          onMouseLeave={() => { if(isViewing) setShowNav(false); }}
        >
          <div style={{ overflow:'hidden',minHeight:0 }}>
            <header className="nav-bar" style={{ padding:'16px 24px', borderBottom:'1px solid var(--line2)' }}>
              
              <div className="nav-inner" style={{ maxWidth:1800,margin:'0 auto',display:'flex',alignItems:'center',gap:20 }}>

                <div className="nav-brand" style={{ display:'flex',alignItems:'center',gap:16,marginRight:8 }}>
                  <button className="icon-btn" onClick={handleBackToHub} title="Back to Hub" style={{ flexShrink:0 }}><ArrowLeft size={16}/></button>
                  <div style={{ display:'flex',alignItems:'center',gap:10,cursor:'pointer' }} onClick={handleHome}>
                    <div style={{ width:32, height:32, borderRadius:8, background:'var(--text)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Layers size={16} color="var(--bg)" strokeWidth={2.5}/>
                    </div>
                    <div>
                      <div style={{ fontSize:15,fontWeight:700,color:'var(--text)',lineHeight:1.1 }}>The Nexus</div>
                      <div className="nav-workspace-label" style={{ fontSize:10,fontWeight:600,color:'var(--text3)',letterSpacing:'0.05em' }}>WORKSPACE</div>
                    </div>
                  </div>
                </div>

                <div style={{ width:1,height:32,background:'var(--line2)',flexShrink:0 }} className="nav-divider"/>

                <div className="custom-sb nav-filters" style={{ display:'flex',alignItems:'flex-end',gap:16,flex:1,overflowX:'auto',paddingBottom:4 }}>
                  <NexusSelect label="Subject" value={subject} onChange={v=>{setSubject(v);setShowLibrary(false);setShowTopicals(false);setTargetPage(1);}} options={SUBJECTS.map(s=>({value:s.code,label:`${s.code} · ${s.name}`}))}/>
                  <NexusSelect label="Year"    value={year}    onChange={v=>{setYear(v);setTargetPage(1);}}    options={YEARS}/>
                  <NexusSelect label="Season"  value={season}  onChange={v=>{setSeason(v);setTargetPage(1);}}  options={SEASONS.map(s=>({value:s.code,label:s.name}))}/>
                  <NexusSelect label="Paper"   value={paper}   onChange={v=>{setPaper(v);setShowLibrary(false);setShowTopicals(false);setTargetPage(1);}} options={PAPERS}/>
                  <NexusSelect label="Variant" value={variant} onChange={v=>{setVariant(v);setTargetPage(1);}} options={VARIANTS}/>

                  <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
                    <span style={{ fontSize:10,fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--text3)',paddingLeft:4 }}>Type</span>
                    <div className="nav-type-wrap" style={{ display:'flex',background:'var(--surface2)',border:'1px solid var(--line2)',borderRadius:8,padding:4,gap:4 }}>
                      <button className={`seg-btn ${type==='qp'?'a-accent':'inactive'}`} onClick={()=>{setType('qp');setTargetPage(1);}}>QP</button>
                      <button className={`seg-btn ${type==='ms'?'a-accent':'inactive'}`} onClick={()=>{setType('ms');setTargetPage(1);}}>MS</button>
                    </div>
                  </div>

                  <div className="nav-tools-wrap" style={{ display:'flex',flexDirection:'column',gap:6 }}>
                    <span style={{ fontSize:10,fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--text3)',paddingLeft:4 }}>Tools</span>
                    <div style={{ display:'flex',gap:8 }}>
                      <button onClick={()=>{setShowTopicals(s=>!s); setShowLibrary(false); setShowMCQ(false);}}
                        style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',transition:'all 0.2s',background:showTopicals?'var(--text)':'var(--surface2)',color:showTopicals?'var(--bg)':'var(--text)',fontSize:12,fontWeight:600 }}>
                        <Compass size={14}/> Topicals
                      </button>

                      {canShowLibrary && (
                        <button onClick={()=>{setShowLibrary(s=>!s); setShowTopicals(false); setShowMCQ(false);}}
                          style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',transition:'all 0.2s',background:showLibrary?'var(--text)':'var(--surface2)',color:showLibrary?'var(--bg)':'var(--text)',fontSize:12,fontWeight:600 }}>
                          <Library size={14}/> Library
                        </button>
                      )}

                      {canShowMCQ && (
                        <button onClick={()=>{setShowMCQ(s=>!s); setShowLibrary(false); setShowTopicals(false);}}
                          style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',transition:'all 0.2s',background:showMCQ?'var(--text)':'var(--surface2)',color:showMCQ?'var(--bg)':'var(--text)',fontSize:12,fontWeight:600 }}>
                          <ListChecks size={14}/> Solver
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="nav-actions" style={{ display:'flex',alignItems:'center',gap:12,marginLeft:'auto',flexShrink:0 }}>
                  <button onClick={() => setShowIndexer(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:8, border:'1px solid var(--line2)', cursor:'pointer', background:'var(--surface2)', color:'var(--text)', fontSize:11, fontWeight:600 }}>
                    <Database size={14}/> Admin
                  </button>
                  {!isViewing && (
                    <button className={`btn-load ${isComplete?'ready':'disabled'}`} onClick={handleLoad} disabled={!isComplete}>
                      <Play size={14} fill="currentColor"/> Load Paper
                    </button>
                  )}
                  {isViewing && <button className="icon-btn" onClick={()=>setShowNav(false)} title="Collapse Navigation"><ChevronUp size={16}/></button>}
                  <div style={{ width:1,height:24,background:'var(--line2)' }}/>
                  <button className="icon-btn" onClick={toggleTheme}>{dark?<Sun size={16}/>:<Moon size={16}/>}</button>
                  <button className="icon-btn" onClick={()=>setShowContact(true)}><Mail size={16}/></button>
                </div>

              </div>
            </header>
          </div>
        </div>

        {/* Hover-Trigger Pull Tab */}
        {isViewing && !showNav && (
          <div style={{ position:'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 40 }}>
            <button 
              className="pull-tab-pill" 
              onClick={()=>setShowNav(true)} 
              onTouchStart={()=>setShowNav(true)}
            >
              <ChevronDown size={18} style={{ color: 'var(--text)' }}/>
            </button>
          </div>
        )}

        <main style={{ flex:1,display:'flex',flexDirection:'column',overflow:'hidden',position:'relative' }}>
          

          <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
            
            {showTopicals && (
              <TopicalsSidebar subjectCode={subject} topicalDb={topicalDb} onClose={()=>setShowTopicals(false)} onSelectQuestion={handleTopicalSelect}/>
            )}
            
            {showLibrary && (
              <LibrarySidebar subjectCode={subject} libraryDb={libraryDb} onClose={()=>setShowLibrary(false)} />
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