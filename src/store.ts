import React, { useState, useEffect } from 'react';
import { Subject, Chapter } from './types';

export interface Goal {
  id: string;
  title: string;
  type: 'short-term' | 'long-term';
  deadline: string;
  progress: number;
  reward?: string;
  rewardClaimed?: boolean;
  history: {
    date: string;
    note: string;
    progressUpdate: number;
  }[];
}

export interface Task {
  id: string;
  title: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  completed: boolean;
}

export interface Transaction {
  id: string;
  title: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

export interface Exam {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
  subjects: string[];
  preparationStatus: number; // 0 to 100
  isDone: boolean;
  scores?: Record<string, { obtained: number, total: number }>;
}

export type PrayerStatus = 'jamaat' | 'alone' | 'qaza' | 'none';

export type Prayer = {
  name: string;
  time: string;
  status: PrayerStatus;
};

// Mock Initial Data
const INITIAL_SUBJECTS: Subject[] = [
  { id: '1', name: 'Physics', colorHex: '#3b82f6' },
  { id: '2', name: 'Chemistry', colorHex: '#8b5cf6' },
  { id: '3', name: 'Higher Math', colorHex: '#10b981' },
];

const INITIAL_CHAPTERS: Chapter[] = [
  {
    id: 'c1',
    subjectId: '1',
    name: 'Vector',
    progress: {
      classDone: true,
      boardBookReading: true,
      mcqPractice: true,
      questionBank: false,
      modelTest: false,
      revision1: false,
      revision2: false,
      revision3: false,
    },
  },
  {
    id: 'c2',
    subjectId: '1',
    name: 'Dynamics',
    progress: {
      classDone: true,
      boardBookReading: false,
      mcqPractice: false,
      questionBank: false,
      modelTest: false,
      revision1: false,
      revision2: false,
      revision3: false,
    },
  },
  {
    id: 'c3',
    subjectId: '2',
    name: 'Organic Chemistry',
    progress: {
      classDone: false,
      boardBookReading: false,
      mcqPractice: false,
      questionBank: false,
      modelTest: false,
      revision1: false,
      revision2: false,
      revision3: false,
    },
  },
];

const INITIAL_GOALS: Goal[] = [
  {
    id: '1',
    title: 'Finish Physics HSC Syllabus',
    type: 'long-term',
    deadline: '2024-05-01',
    progress: 40,
    reward: 'Buy a new watch',
    rewardClaimed: false,
    history: [
      { date: '2024-01-10', note: 'Started Quantum Physics', progressUpdate: 10 },
    ]
  },
  {
    id: '2',
    title: 'Complete Vector Math Assignments',
    type: 'short-term',
    deadline: '2023-11-01',
    progress: 100,
    reward: 'Eat Ice Cream',
    rewardClaimed: false,
    history: [
      { date: '2023-10-15', note: 'Done with first half', progressUpdate: 50 },
      { date: '2023-10-20', note: 'Done with second half', progressUpdate: 100 },
    ]
  }
];

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Complete Physics Vector CQ', deadline: 'Today, 10:00 AM', priority: 'high', completed: false },
  { id: '2', title: 'Read Organic Chemistry Ch 2', deadline: 'Today, 1:00 PM', priority: 'medium', completed: false },
  { id: '3', title: 'Pay Internet Bill', deadline: 'Today, 5:00 PM', priority: 'urgent', completed: false },
  { id: '4', title: 'Memorize Biology Chapter 4 definitions', deadline: 'Tomorrow', priority: 'high', completed: false },
  { id: '5', title: 'Review Math formulas', deadline: 'Today', priority: 'low', completed: true },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', title: 'Monthly Allowance', date: 'Oct 01, 2023', amount: 5000, type: 'income', category: 'Allowance' },
  { id: '2', title: 'Internet Bill', date: 'Oct 03, 2023', amount: 800, type: 'expense', category: 'Bills' },
  { id: '3', title: 'Admission Book', date: 'Oct 05, 2023', amount: 450, type: 'expense', category: 'Education' },
  { id: '4', title: 'Lunch at Cafe', date: 'Oct 08, 2023', amount: 250, type: 'expense', category: 'Food' },
];

const INITIAL_EXAMS: Exam[] = [
  {
    id: '1',
    title: 'HSC Physics 1st Paper',
    date: '2024-05-15',
    time: '10:00',
    type: 'Public Exam',
    subjects: ['Physics'],
    preparationStatus: 65,
    isDone: false,
  },
  {
    id: '2',
    title: 'Weekly CQ Test',
    date: '2023-11-20',
    time: '14:00',
    type: 'Internal Test',
    subjects: ['Chemistry'],
    preparationStatus: 30,
    isDone: true,
    scores: {
      'Chemistry': { obtained: 16, total: 20 }
    }
  }
];

const INITIAL_PRAYERS: Prayer[] = [
  { name: 'Fajr', time: '5:10 AM', status: 'none' },
  { name: 'Dhuhr', time: '1:30 PM', status: 'none' },
  { name: 'Asr', time: '4:45 PM', status: 'none' },
  { name: 'Maghrib', time: '6:15 PM', status: 'none' },
  { name: 'Isha', time: '7:45 PM', status: 'none' },
];

// Context/Global State setup:
const globalState = {
  subjects: INITIAL_SUBJECTS,
  chapters: INITIAL_CHAPTERS,
  goals: INITIAL_GOALS,
  tasks: INITIAL_TASKS,
  transactions: INITIAL_TRANSACTIONS,
  exams: INITIAL_EXAMS,
  prayers: INITIAL_PRAYERS,
  listeners: new Set<() => void>(),
  emit() {
    this.listeners.forEach((listener) => listener());
  },
  setSubjects(update: React.SetStateAction<Subject[]>) {
    this.subjects = typeof update === 'function' ? (update as any)(this.subjects) : update;
    this.emit();
  },
  setChapters(update: React.SetStateAction<Chapter[]>) {
    this.chapters = typeof update === 'function' ? (update as any)(this.chapters) : update;
    this.emit();
  },
  setGoals(update: React.SetStateAction<Goal[]>) {
    this.goals = typeof update === 'function' ? (update as any)(this.goals) : update;
    this.emit();
  },
  setTasks(update: React.SetStateAction<Task[]>) {
    this.tasks = typeof update === 'function' ? (update as any)(this.tasks) : update;
    this.emit();
  },
  setTransactions(update: React.SetStateAction<Transaction[]>) {
    this.transactions = typeof update === 'function' ? (update as any)(this.transactions) : update;
    this.emit();
  },
  setExams(update: React.SetStateAction<Exam[]>) {
    this.exams = typeof update === 'function' ? (update as any)(this.exams) : update;
    this.emit();
  },
  setPrayers(update: React.SetStateAction<Prayer[]>) {
    this.prayers = typeof update === 'function' ? (update as any)(this.prayers) : update;
    this.emit();
  }
};

export function useAppState() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    globalState.listeners.add(listener);
    return () => {
      globalState.listeners.delete(listener);
    };
  }, []);

  const subjects = globalState.subjects;
  const chapters = globalState.chapters;
  const goals = globalState.goals;
  const tasks = globalState.tasks;
  const transactions = globalState.transactions;
  const exams = globalState.exams;
  const prayers = globalState.prayers;

  const toggleChapterProgress = (chapterId: string, item: keyof Chapter['progress']) => {
    globalState.setChapters((prev) =>
      prev.map((c) =>
        c.id === chapterId ? { ...c, progress: { ...c.progress, [item]: !c.progress[item] } } : c
      )
    );
  };

  const addSubject = (name: string, colorHex: string) => {
    const newSubject = { id: Math.random().toString(), name, colorHex };
    globalState.setSubjects((prev) => [...prev, newSubject]);
    return newSubject;
  };

  const editSubject = (id: string, name: string, colorHex: string) => {
    globalState.setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, name, colorHex } : s)));
  };

  const deleteSubject = (id: string) => {
    globalState.setSubjects((prev) => prev.filter((s) => s.id !== id));
    globalState.setChapters((prev) => prev.filter((c) => c.subjectId !== id));
  };

  const addChapter = (subjectId: string, name: string) => {
    globalState.setChapters((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        subjectId,
        name,
        progress: {
          classDone: false,
          boardBookReading: false,
          mcqPractice: false,
          questionBank: false,
          modelTest: false,
          revision1: false,
          revision2: false,
          revision3: false,
        },
      },
    ]);
  };

  const editChapter = (chapterId: string, name: string) => {
    globalState.setChapters((prev) => prev.map((c) => (c.id === chapterId ? { ...c, name } : c)));
  };

  const deleteChapter = (chapterId: string) => {
    globalState.setChapters((prev) => prev.filter((c) => c.id !== chapterId));
  };

  const setGoals = (update: React.SetStateAction<Goal[]>) => {
    globalState.setGoals(update);
  };

  const setTasks = (update: React.SetStateAction<Task[]>) => {
    globalState.setTasks(update);
  };

  const setTransactions = (update: React.SetStateAction<Transaction[]>) => {
    globalState.setTransactions(update);
  };

  const setExams = (update: React.SetStateAction<Exam[]>) => {
    globalState.setExams(update);
  };

  const setPrayers = (update: React.SetStateAction<Prayer[]>) => {
    globalState.setPrayers(update);
  };

  return { 
    subjects, 
    chapters, 
    goals,
    tasks,
    transactions,
    exams,
    prayers,
    setGoals,
    setTasks,
    setTransactions,
    setExams,
    setPrayers,
    toggleChapterProgress, 
    addSubject, 
    editSubject, 
    deleteSubject, 
    addChapter, 
    editChapter, 
    deleteChapter 
  };
}
