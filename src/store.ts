import React, { useState, useEffect } from "react";
import { Subject, Chapter } from "./types";
import { supabase } from "./lib/supabase";

export interface Goal {
  id: string;
  title: string;
  type: "short-term" | "long-term";
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
  priority: "low" | "medium" | "high" | "urgent";
  completed: boolean;
}

export interface Transaction {
  id: string;
  title: string;
  date: string;
  amount: number;
  type: "income" | "expense";
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
  scores?: Record<string, { obtained: number; total: number }>;
}

export type PrayerStatus = "jamaat" | "alone" | "qaza" | "none";

export type Prayer = {
  name: string;
  time: string;
  status: PrayerStatus;
};

// Mock Initial Data
const INITIAL_SUBJECTS: Subject[] = [];

const INITIAL_CHAPTERS: Chapter[] = [];

const INITIAL_GOALS: Goal[] = [];

const INITIAL_TASKS: Task[] = [];

const INITIAL_TRANSACTIONS: Transaction[] = [];

const INITIAL_EXAMS: Exam[] = [];

const INITIAL_PRAYERS: Prayer[] = [
  { name: "Fajr", time: "5:10 AM", status: "none" },
  { name: "Dhuhr", time: "1:30 PM", status: "none" },
  { name: "Asr", time: "4:45 PM", status: "none" },
  { name: "Maghrib", time: "6:15 PM", status: "none" },
  { name: "Isha", time: "7:45 PM", status: "none" },
];

const saveToDatabase = async (category: string) => {
  if (!globalState.isAuthenticated) return;
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  try {
    if (category === 'study_hub' || category === 'all') {
      await supabase.from('user_study_hub').upsert({
        user_id: user.id,
        subjects: globalState.subjects,
        chapters: globalState.chapters,
        updated_at: new Date().toISOString()
      });
    }
    
    if (category === 'goals' || category === 'all') {
      await supabase.from('user_goals').upsert({
        user_id: user.id,
        goals: globalState.goals,
        updated_at: new Date().toISOString()
      });
    }

    if (category === 'tasks' || category === 'all') {
      await supabase.from('user_tasks').upsert({
        user_id: user.id,
        tasks: globalState.tasks,
        updated_at: new Date().toISOString()
      });
    }

    if (category === 'finance' || category === 'all') {
      await supabase.from('user_finance').upsert({
        user_id: user.id,
        transactions: globalState.transactions,
        updated_at: new Date().toISOString()
      });
    }

    if (category === 'exams' || category === 'all') {
      await supabase.from('user_exams').upsert({
        user_id: user.id,
        exams: globalState.exams,
        updated_at: new Date().toISOString()
      });
    }

    if (category === 'prayers' || category === 'all') {
      await supabase.from('user_prayers').upsert({
        user_id: user.id,
        prayers: globalState.prayers,
        updated_at: new Date().toISOString()
      });
    }
  } catch (e) {
    console.error("Failed to sync to Supabase database tables:", e);
  }
};

const notifyAndSave = (category: string = 'all') => {
  globalState.emit();
  saveToDatabase(category);
};

// Context/Global State setup:
const globalState = {
  subjects: INITIAL_SUBJECTS,
  chapters: INITIAL_CHAPTERS,
  goals: INITIAL_GOALS,
  tasks: INITIAL_TASKS,
  transactions: INITIAL_TRANSACTIONS,
  exams: INITIAL_EXAMS,
  prayers: INITIAL_PRAYERS,
  isAuthenticated: false,
  currentUserEmail: "",
  listeners: new Set<() => void>(),
  emit() {
    this.listeners.forEach((listener) => listener());
  },
  async loadData() {
    const fetchFromDatabase = async (user_id: string) => {
      try {
        const [
          { data: studyHub },
          { data: goalsData },
          { data: tasksData },
          { data: financeData },
          { data: examsData },
          { data: prayersData }
        ] = await Promise.all([
          supabase.from('user_study_hub').select('*').eq('user_id', user_id).single(),
          supabase.from('user_goals').select('*').eq('user_id', user_id).single(),
          supabase.from('user_tasks').select('*').eq('user_id', user_id).single(),
          supabase.from('user_finance').select('*').eq('user_id', user_id).single(),
          supabase.from('user_exams').select('*').eq('user_id', user_id).single(),
          supabase.from('user_prayers').select('*').eq('user_id', user_id).single()
        ]);

        if (studyHub) {
          if (studyHub.subjects) this.subjects = studyHub.subjects;
          if (studyHub.chapters) this.chapters = studyHub.chapters;
        }
        if (goalsData && goalsData.goals) this.goals = goalsData.goals;
        if (tasksData && tasksData.tasks) this.tasks = tasksData.tasks;
        if (financeData && financeData.transactions) this.transactions = financeData.transactions;
        if (examsData && examsData.exams) this.exams = examsData.exams;
        if (prayersData && prayersData.prayers) this.prayers = prayersData.prayers;
        
        this.emit();
      } catch (e) {
        console.error("Failed to load generic data", e);
      }
    };

    // First setup listener for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        this.isAuthenticated = true;
        this.currentUserEmail = session.user.email || "";
        await fetchFromDatabase(session.user.id);
      } else {
        this.isAuthenticated = false;
        this.currentUserEmail = "";
        
        this.subjects = INITIAL_SUBJECTS;
        this.chapters = INITIAL_CHAPTERS;
        this.goals = INITIAL_GOALS;
        this.tasks = INITIAL_TASKS;
        this.transactions = INITIAL_TRANSACTIONS;
        this.exams = INITIAL_EXAMS;
        this.prayers = INITIAL_PRAYERS;
        this.emit();
      }
    });

    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      this.isAuthenticated = true;
      this.currentUserEmail = session.user.email || "";
      await fetchFromDatabase(session.user.id);
    } else {
      this.subjects = INITIAL_SUBJECTS;
      this.chapters = INITIAL_CHAPTERS;
      this.goals = INITIAL_GOALS;
      this.tasks = INITIAL_TASKS;
      this.transactions = INITIAL_TRANSACTIONS;
      this.exams = INITIAL_EXAMS;
      this.prayers = INITIAL_PRAYERS;
      this.emit();
    }
  },
  setSubjects(update: React.SetStateAction<Subject[]>) {
    this.subjects =
      typeof update === "function" ? (update as any)(this.subjects) : update;
    notifyAndSave('study_hub');
  },
  setChapters(update: React.SetStateAction<Chapter[]>) {
    this.chapters =
      typeof update === "function" ? (update as any)(this.chapters) : update;
    notifyAndSave('study_hub');
  },
  setGoals(update: React.SetStateAction<Goal[]>) {
    this.goals =
      typeof update === "function" ? (update as any)(this.goals) : update;
    notifyAndSave('goals');
  },
  setTasks(update: React.SetStateAction<Task[]>) {
    this.tasks =
      typeof update === "function" ? (update as any)(this.tasks) : update;
    notifyAndSave('tasks');
  },
  setTransactions(update: React.SetStateAction<Transaction[]>) {
    this.transactions =
      typeof update === "function"
        ? (update as any)(this.transactions)
        : update;
    notifyAndSave('finance');
  },
  setExams(update: React.SetStateAction<Exam[]>) {
    this.exams =
      typeof update === "function" ? (update as any)(this.exams) : update;
    notifyAndSave('exams');
  },
  setPrayers(update: React.SetStateAction<Prayer[]>) {
    this.prayers =
      typeof update === "function" ? (update as any)(this.prayers) : update;
    notifyAndSave('prayers');
  },
  async setAuth(isAuthenticated: boolean, email: string) {
    this.isAuthenticated = isAuthenticated;
    this.currentUserEmail = email;
    if (!isAuthenticated) {
      await supabase.auth.signOut();
      // Reset local state to empty
      this.subjects = INITIAL_SUBJECTS;
      this.chapters = INITIAL_CHAPTERS;
      this.goals = INITIAL_GOALS;
      this.tasks = INITIAL_TASKS;
      this.transactions = INITIAL_TRANSACTIONS;
      this.exams = INITIAL_EXAMS;
      this.prayers = INITIAL_PRAYERS;
    }
    this.emit();
  }
};

export const initGlobalData = () => {
  globalState.loadData();
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
  const isAuthenticated = globalState.isAuthenticated;
  const currentUserEmail = globalState.currentUserEmail;

  const toggleChapterProgress = (
    chapterId: string,
    item: keyof Chapter["progress"],
  ) => {
    globalState.setChapters((prev) =>
      prev.map((c) =>
        c.id === chapterId
          ? { ...c, progress: { ...c.progress, [item]: !c.progress[item] } }
          : c,
      ),
    );
  };

  const addSubject = (name: string, colorHex: string) => {
    const newSubject = { id: Math.random().toString(), name, colorHex };
    globalState.setSubjects((prev) => [...prev, newSubject]);
    return newSubject;
  };

  const editSubject = (id: string, name: string, colorHex: string) => {
    globalState.setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name, colorHex } : s)),
    );
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
    globalState.setChapters((prev) =>
      prev.map((c) => (c.id === chapterId ? { ...c, name } : c)),
    );
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

  const setAuth = (isAuthenticated: boolean, email: string) => {
    globalState.setAuth(isAuthenticated, email);
  };

  return {
    subjects,
    chapters,
    goals,
    tasks,
    transactions,
    exams,
    prayers,
    isAuthenticated,
    currentUserEmail,
    setGoals,
    setTasks,
    setTransactions,
    setExams,
    setPrayers,
    setAuth,
    toggleChapterProgress,
    addSubject,
    editSubject,
    deleteSubject,
    addChapter,
    editChapter,
    deleteChapter,
  };
}

