export type AppView = 'home' | 'study' | 'salah' | 'tasks' | 'finance' | 'habits' | 'notes';

export interface Subject {
  id: string;
  name: string;
  colorHex: string;
}

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  progress: ChapterProgress;
}

export interface ChapterProgress {
  classDone: boolean;
  boardBookReading: boolean;
  mcqPractice: boolean;
  questionBank: boolean;
  modelTest: boolean;
  revision1: boolean;
  revision2: boolean;
  revision3: boolean;
}

export const calculateChapterProgress = (progress: ChapterProgress) => {
  const values = Object.values(progress);
  const completed = values.filter((v) => v).length;
  return (completed / values.length) * 100;
};
