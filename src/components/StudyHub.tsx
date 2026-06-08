import { useState } from 'react';
import { useAppState } from '@/store';
import { calculateChapterProgress, Chapter } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { BookOpen, Target, Plus, BookMarked, Edit2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export function StudyHub() {
  const { 
    subjects, chapters, toggleChapterProgress, 
    addSubject, editSubject, deleteSubject, 
    addChapter, editChapter, deleteChapter 
  } = useAppState();
  
  const [activeSubject, setActiveSubject] = useState(subjects[0]?.id);

  // Modals state
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<{ id: string; name: string; colorHex: string } | null>(null);
  const [subjectName, setSubjectName] = useState('');
  const [subjectColor, setSubjectColor] = useState('#3b82f6');

  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<{ id: string; name: string } | null>(null);
  const [chapterName, setChapterName] = useState('');

  const totalChapters = chapters.length;
  const completedChapters = chapters.filter(c => calculateChapterProgress(c.progress) === 100).length;
  const overallProgress = totalChapters > 0 
    ? chapters.reduce((acc, c) => acc + calculateChapterProgress(c.progress), 0) / totalChapters 
    : 0;

  const subjectChapters = chapters.filter(c => c.subjectId === activeSubject).sort((a, b) => {
    const aComplete = calculateChapterProgress(a.progress) === 100;
    const bComplete = calculateChapterProgress(b.progress) === 100;
    if (aComplete === bComplete) return 0;
    return aComplete ? 1 : -1;
  });
  const subjectProgress = subjectChapters.length > 0 
    ? subjectChapters.reduce((acc, c) => acc + calculateChapterProgress(c.progress), 0) / subjectChapters.length
    : 0;

  const getChecklistStatus = (progress: Chapter['progress']) => {
    return [
      { key: 'classDone', label: 'Class Done', value: progress.classDone },
      { key: 'boardBookReading', label: 'Board Book', value: progress.boardBookReading },
      { key: 'mcqPractice', label: 'MCQ Practice', value: progress.mcqPractice },
      { key: 'questionBank', label: 'Question Bank', value: progress.questionBank },
      { key: 'modelTest', label: 'Model Test', value: progress.modelTest },
      { key: 'revision1', label: 'Revision 1', value: progress.revision1 },
      { key: 'revision2', label: 'Revision 2', value: progress.revision2 },
      { key: 'revision3', label: 'Revision 3', value: progress.revision3 },
    ] as const;
  };

  const handleSaveSubject = () => {
    if (!subjectName.trim()) return;
    if (editingSubject) {
      editSubject(editingSubject.id, subjectName, subjectColor);
    } else {
      const newSub = addSubject(subjectName, subjectColor);
      setActiveSubject(newSub.id);
    }
    setIsSubjectModalOpen(false);
  };

  const handleSaveChapter = () => {
    if (!chapterName.trim() || !activeSubject) return;
    if (editingChapter) {
      editChapter(editingChapter.id, chapterName);
    } else {
      addChapter(activeSubject, chapterName);
    }
    setIsChapterModalOpen(false);
  };

  const openAddSubject = () => {
    setEditingSubject(null);
    setSubjectName('');
    setSubjectColor('#3b82f6');
    setIsSubjectModalOpen(true);
  };

  const openEditSubject = (sub: typeof subjects[0]) => {
    setEditingSubject(sub);
    setSubjectName(sub.name);
    setSubjectColor(sub.colorHex);
    setIsSubjectModalOpen(true);
  };

  const openAddChapter = () => {
    setEditingChapter(null);
    setChapterName('');
    setIsChapterModalOpen(true);
  };

  const openEditChapter = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setChapterName(chapter.name);
    setIsChapterModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <header className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Study Hub</h1>
        <p className="text-zinc-500 mt-1">Admission Preparation Progress Engine</p>
      </header>

      {/* Global Progress Engine */}
      <Card className="border border-blue-500/20 bg-gradient-to-br from-blue-600/20 to-purple-600/5 overflow-hidden relative shadow-none rounded-2xl">
        <div className="hidden sm:block absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            
            <div className="flex-1 w-full space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-2xl font-bold mb-1">Admission Preparation</h3>
                  <p className="text-sm text-zinc-400">You are on track for the Engineering Goal.</p>
                  <div className="flex gap-4 mt-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">Chapters</span>
                      <span className="text-lg font-mono">{completedChapters}/{totalChapters}</span>
                    </div>
                    <div className="w-px bg-zinc-800"></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">Status</span>
                      <span className="text-lg text-emerald-400">Ahead</span>
                    </div>
                  </div>
                </div>
                <div className="relative flex items-center justify-center">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-800"></circle>
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * overallProgress) / 100} className="text-blue-500 transition-all duration-1000 ease-out"></circle>
                  </svg>
                  <div className="absolute text-xl font-bold font-mono">{overallProgress.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subjects & Chapters Interface */}
      <Tabs defaultValue={subjects[0]?.id} value={activeSubject} onValueChange={setActiveSubject} className="w-full">
        <div className="border-b border-zinc-800 mb-6">
          <div className="flex items-center justify-between gap-4 pb-2 overflow-x-auto hide-scrollbar">
            <TabsList className="bg-transparent h-auto p-0 space-x-6 justify-start w-max shrink-0">
              {subjects.map((sub) => (
                <TabsTrigger 
                  key={sub.id} 
                  value={sub.id}
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 rounded-none px-0 pb-3 pt-2 font-semibold text-zinc-500 data-[state=active]:text-zinc-100 border-b-2 border-transparent data-[state=active]:border-blue-500 transition-none"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sub.colorHex }} />
                    {sub.name}
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
            <button 
              onClick={openAddSubject}
              className="flex shrink-0 text-sm text-zinc-400 hover:text-white items-center gap-1 font-medium pr-2"
            >
              <Plus className="w-4 h-4" /> Add Subject
            </button>
          </div>
        </div>

        {subjects.map((sub) => (
          <TabsContent key={sub.id} value={sub.id} className="focus-visible:outline-none focus-visible:ring-0">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="font-bold flex items-center gap-2 text-xl group cursor-pointer" onClick={() => openEditSubject(sub)}>
                  <span className="w-1.5 h-6 rounded-full" style={{ backgroundColor: sub.colorHex }}></span>
                  {sub.name} Chapters
                  <Edit2 className="w-4 h-4 opacity-50 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-zinc-400" />
                </h3>
                <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mt-1">{subjectProgress.toFixed(1)}% Completed</div>
              </div>
              <button 
                onClick={openAddChapter}
                className="text-sm bg-white text-black px-4 py-2 rounded-xl font-semibold transition-colors hover:bg-zinc-200"
              >
                + Add Chapter
              </button>
            </div>

            <div className="space-y-4">
              {subjectChapters.map((chapter) => {
                const prog = calculateChapterProgress(chapter.progress);
                const items = getChecklistStatus(chapter.progress);
                const isComplete = prog === 100;

                return (
                  <Card key={chapter.id} className={cn("border border-zinc-800 shadow-none rounded-2xl", isComplete ? "bg-emerald-950/10 border-l-4 border-l-emerald-500" : "bg-zinc-900/50")}>
                    <div className="p-6 flex flex-col lg:flex-row gap-6 lg:items-center justify-between">
                      <div className="min-w-[200px]">
                        <div className="flex items-center gap-4 mb-2">
                           <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center font-bold">
                             {chapter.name.substring(0,2).toUpperCase()}
                           </div>
                           <div>
                             <h3 className="font-semibold text-sm flex items-center gap-2 group cursor-pointer" onClick={() => openEditChapter(chapter)}>
                               {chapter.name}
                               {isComplete && <Target className="w-4 h-4 text-emerald-500" />}
                               <Edit2 className="w-3 h-3 opacity-50 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-zinc-400 ml-1" />
                             </h3>
                             <p className="text-[10px] text-zinc-500">{items.filter(i => i.value).length}/{items.length} Tasks</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="w-40 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                             <div className="bg-blue-500 h-full transition-all" style={{ width: `${prog}%` }}></div>
                          </div>
                          <span className="text-xs font-mono w-8 text-right text-zinc-400">{prog.toFixed(0)}%</span>
                        </div>
                      </div>

                      {/* Checklist Grid */}
                      <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-y-3 gap-x-4">
                        {items.map((item) => (
                          <div key={item.key} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`${chapter.id}-${item.key}`} 
                              checked={item.value}
                              onCheckedChange={() => toggleChapterProgress(chapter.id, item.key)}
                              className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 border-zinc-600 rounded bg-zinc-800/50"
                            />
                            <label 
                              htmlFor={`${chapter.id}-${item.key}`}
                              className={cn("text-xs font-medium leading-none cursor-pointer select-none", item.value ? 'text-zinc-600 line-through' : 'text-zinc-300')}
                            >
                              {item.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                );
              })}
              {subjectChapters.length === 0 && (
                <div className="text-center py-12 text-zinc-600 border border-dashed rounded-2xl border-zinc-800">
                  <BookOpen className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No chapters added to this subject yet.</p>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Subject Modal */}
      <Dialog open={isSubjectModalOpen} onOpenChange={setIsSubjectModalOpen}>
        <DialogContent className="bg-[#0c0c0e] border-zinc-800 text-zinc-100 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingSubject ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subjectName" className="text-right text-zinc-400">
                Name
              </Label>
              <Input
                id="subjectName"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="col-span-3 bg-zinc-900 border-zinc-800 focus-visible:ring-blue-500"
                placeholder="Physics 1st Paper"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subjectColor" className="text-right text-zinc-400">
                Color
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="subjectColor"
                  type="color"
                  value={subjectColor}
                  onChange={(e) => setSubjectColor(e.target.value)}
                  className="w-12 h-10 p-1 bg-zinc-900 border-zinc-800 cursor-pointer"
                />
                <span className="text-xs font-mono text-zinc-500">{subjectColor}</span>
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between items-center sm:justify-between">
            {editingSubject ? (
              <Button 
                variant="outline" 
                className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-400"
                onClick={() => {
                  deleteSubject(editingSubject.id);
                  setIsSubjectModalOpen(false);
                  setActiveSubject(subjects[0]?.id !== editingSubject.id ? subjects[0]?.id : subjects[1]?.id);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            ) : (
              <div></div>
            )}
            <Button onClick={handleSaveSubject} className="bg-white text-black hover:bg-zinc-200 px-6 rounded-xl">
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chapter Modal */}
      <Dialog open={isChapterModalOpen} onOpenChange={setIsChapterModalOpen}>
        <DialogContent className="bg-[#0c0c0e] border-zinc-800 text-zinc-100 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingChapter ? 'Edit Chapter' : 'Add Chapter'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="chapterName" className="text-right text-zinc-400">
                Chapter
              </Label>
              <Input
                id="chapterName"
                value={chapterName}
                onChange={(e) => setChapterName(e.target.value)}
                className="col-span-3 bg-zinc-900 border-zinc-800 focus-visible:ring-blue-500"
                placeholder="e.g. Thermodynamics"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between items-center sm:justify-between">
            {editingChapter ? (
              <Button 
                variant="outline" 
                className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-400"
                onClick={() => {
                  deleteChapter(editingChapter.id);
                  setIsChapterModalOpen(false);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            ) : (
              <div></div>
            )}
            <Button onClick={handleSaveChapter} className="bg-white text-black hover:bg-zinc-200 px-6 rounded-xl">
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
