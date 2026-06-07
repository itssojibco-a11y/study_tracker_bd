import { useState } from 'react';
import { Subject, Chapter } from './types';

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
      cqPractice: true,
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
      cqPractice: false,
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
      cqPractice: false,
      mcqPractice: false,
      questionBank: false,
      modelTest: false,
      revision1: false,
      revision2: false,
      revision3: false,
    },
  },
];

export function useAppState() {
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [chapters, setChapters] = useState<Chapter[]>(INITIAL_CHAPTERS);

  const toggleChapterProgress = (chapterId: string, item: keyof Chapter['progress']) => {
    setChapters((prev) =>
      prev.map((c) =>
        c.id === chapterId ? { ...c, progress: { ...c.progress, [item]: !c.progress[item] } } : c
      )
    );
  };

  const addSubject = (name: string, colorHex: string) => {
    const newSubject = { id: Math.random().toString(), name, colorHex };
    setSubjects((prev) => [...prev, newSubject]);
    return newSubject;
  };

  const editSubject = (id: string, name: string, colorHex: string) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, name, colorHex } : s)));
  };

  const deleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setChapters((prev) => prev.filter((c) => c.subjectId !== id));
  };

  const addChapter = (subjectId: string, name: string) => {
    setChapters((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        subjectId,
        name,
        progress: {
          classDone: false,
          boardBookReading: false,
          cqPractice: false,
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
    setChapters((prev) => prev.map((c) => (c.id === chapterId ? { ...c, name } : c)));
  };

  const deleteChapter = (chapterId: string) => {
    setChapters((prev) => prev.filter((c) => c.id !== chapterId));
  };

  return { 
    subjects, 
    chapters, 
    toggleChapterProgress, 
    addSubject, 
    editSubject, 
    deleteSubject, 
    addChapter, 
    editChapter, 
    deleteChapter 
  };
}
