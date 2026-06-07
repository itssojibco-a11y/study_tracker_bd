import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Edit2, Trash2, Plus, AlertCircle, BookOpen, CheckCircle, BarChart3, XCircle, Timer, Play, Square, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppState, Exam } from '@/store';

const SUBJECTS = ["Physics", "Chemistry", "Math", "Biology", "English", "Bangla", "GK", "ICT"];

export function Exams() {
  const { exams, setExams } = useAppState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [preparationStatus, setPreparationStatus] = useState(0);

  // Score Modal State
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [scoringExam, setScoringExam] = useState<Exam | null>(null);
  const [tempScores, setTempScores] = useState<Record<string, { obtained: string, total: string }>>({});

  // Overview Modal State
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);

  // Practice Exam Timer State
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [practiceTimeLeft, setPracticeTimeLeft] = useState(3600); // 1 hour default
  const [practiceTotalTime, setPracticeTotalTime] = useState(3600);
  const [practiceSubjects, setPracticeSubjects] = useState<string[]>([SUBJECTS[0]]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [practiceScores, setPracticeScores] = useState<Record<string, { obtained: string, total: string }>>({});
  const [filterSubject, setFilterSubject] = useState('All');
  const [isSubjectSelectOpen, setIsSubjectSelectOpen] = useState(false);
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [customTimeMins, setCustomTimeMins] = useState('60');

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && practiceTimeLeft > 0) {
      interval = setInterval(() => {
        setPracticeTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (practiceTimeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setShowLogModal(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, practiceTimeLeft]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = () => {
    setIsTimerRunning(true);
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    setShowLogModal(true);
  };

  const handleSavePracticeLog = () => {
    const finalScores: Record<string, { obtained: number, total: number }> = {};
    for (const sub of practiceSubjects) {
      const scores = practiceScores[sub];
      if (scores) {
        const ob = Number(scores.obtained);
        const tot = Number(scores.total);
        if (!isNaN(ob) && !isNaN(tot) && scores.total.trim() !== '') {
          finalScores[sub] = { obtained: ob, total: tot };
        }
      }
    }

    setExams(prev => [...prev, {
      id: Math.random().toString(),
      title: `Practice Exam (${practiceSubjects.join(', ')})`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().substring(0, 5),
      type: 'Practice Exam',
      subjects: practiceSubjects,
      preparationStatus: 100,
      isDone: true,
      scores: Object.keys(finalScores).length > 0 ? finalScores : undefined
    }]);

    setShowLogModal(false);
    setPracticeScores({});
    setPracticeTimeLeft(practiceTotalTime);
  };

  const calculateDaysLeft = (examDate: string) => {
    // Treat the exam date string as local time to avoid timezone offsets
    const [year, month, day] = examDate.split('-').map(Number);
    const target = new Date(year, month - 1, day).getTime();
    
    // Normalize current date to midnight local time
    const _now = new Date();
    const now = new Date(_now.getFullYear(), _now.getMonth(), _now.getDate()).getTime();
    
    const difference = target - now;
    return Math.ceil(difference / (1000 * 3600 * 24));
  };

  const sortedExams = useMemo(() => {
    let list = [...exams].sort((a, b) => {
      if (a.isDone === b.isDone) {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return a.isDone ? 1 : -1;
    });
    if (filterSubject !== 'All') {
      list = list.filter(e => e.subjects && e.subjects.includes(filterSubject));
    }
    return list;
  }, [exams, filterSubject]);

  const subjectPerformance = useMemo(() => {
    const stats: Record<string, { obtained: number, total: number }> = {};
    SUBJECTS.forEach(s => stats[s] = { obtained: 0, total: 0 });
    
    exams.filter(e => e.isDone && e.scores).forEach(e => {
      Object.entries(e.scores!).forEach(([sub, score]) => {
        if (stats[sub]) {
          stats[sub].obtained += score.obtained;
          stats[sub].total += score.total;
        }
      });
    });
    
    return SUBJECTS.map(sub => {
      const { obtained, total } = stats[sub];
      const percentage = total > 0 ? (obtained / total) * 100 : null;
      return { subject: sub, percentage, obtained, total };
    }).filter(s => s.percentage !== null)
      .sort((a, b) => (a.percentage || 0) - (b.percentage || 0)); // Weakest subjects first
  }, [exams]);

  const openAddModal = () => {
    setEditingExam(null);
    setTitle('');
    setDate('');
    setTime('');
    setType('');
    setSelectedSubjects([]);
    setPreparationStatus(0);
    setIsModalOpen(true);
  };

  const openEditModal = (exam: Exam) => {
    setEditingExam(exam);
    setTitle(exam.title);
    setDate(exam.date);
    setTime(exam.time);
    setType(exam.type);
    setSelectedSubjects(exam.subjects || []);
    setPreparationStatus(exam.preparationStatus);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!title.trim() || !date) return;

    if (editingExam) {
      setExams(prev => prev.map(e => 
        e.id === editingExam.id 
          ? { ...e, title, date, time, type, subjects: selectedSubjects, preparationStatus: Number(preparationStatus) }
          : e
      ));
    } else {
      setExams(prev => [...prev, {
        id: Math.random().toString(),
        title,
        date,
        time,
        type,
        subjects: selectedSubjects,
        preparationStatus: Number(preparationStatus),
        isDone: false
      }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setExams(prev => prev.filter(e => e.id !== id));
  };

  const updateProgress = (id: string, newProgress: number) => {
    setExams(prev => prev.map(e => {
      if (e.id === id) {
        return { ...e, preparationStatus: Math.max(0, Math.min(100, newProgress)) };
      }
      return e;
    }));
  };

  const toggleSubject = (sub: string) => {
    setSelectedSubjects(prev => 
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  const openScoreModal = (exam: Exam) => {
    setScoringExam(exam);
    const initialScores: Record<string, { obtained: string, total: string }> = {};
    exam.subjects.forEach(sub => {
      if (exam.scores && exam.scores[sub]) {
        initialScores[sub] = { 
          obtained: exam.scores[sub].obtained.toString(), 
          total: exam.scores[sub].total.toString() 
        };
      } else {
        initialScores[sub] = { obtained: '', total: '' };
      }
    });
    setTempScores(initialScores);
    setIsScoreModalOpen(true);
  };

  const handleSaveScores = () => {
    if (!scoringExam) return;
    
    const finalScores: Record<string, { obtained: number, total: number }> = {};
    let scoresEntered = false;
    const tempScoreKeys = Object.keys(tempScores);
    for (const sub of tempScoreKeys) {
      const scores = tempScores[sub];
      const ob = Number(scores.obtained);
      const tot = Number(scores.total);
      if (!isNaN(ob) && !isNaN(tot) && scores.total.trim() !== '') {
        finalScores[sub] = { obtained: ob, total: tot };
        scoresEntered = true;
      }
    }

    setExams(prev => prev.map(e => 
      e.id === scoringExam.id 
        ? { ...e, isDone: true, scores: finalScores }
        : e
    ));

    setIsScoreModalOpen(false);
    setScoringExam(null);
  };

  const handleMarkUndone = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExams(prev => prev.map(ex => 
      ex.id === id 
        ? { ...ex, isDone: false, scores: undefined }
        : ex
    ));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <header className="mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Exams</h1>
          <p className="text-zinc-500 mt-1">Manage tests, track preparation & analyze scores</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <select 
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="w-full sm:w-auto bg-zinc-900 border border-zinc-800 rounded-md h-9 px-3 text-sm text-zinc-100"
          >
            <option value="All">All Subjects</option>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button onClick={() => setIsOverviewOpen(true)} variant="outline" className="flex-1 sm:flex-none h-9 bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hidden sm:flex">
              <BarChart3 className="w-4 h-4 mr-2" /> Performance Overview
            </Button>
            <Button onClick={openAddModal} className="flex-1 sm:flex-none h-9 bg-white text-black hover:bg-zinc-200">
              <Plus className="w-4 h-4 mr-1" /> Add Exam
            </Button>
          </div>
        </div>
        <div className="block sm:hidden flex flex-col gap-2">
            <Button onClick={() => setIsOverviewOpen(true)} variant="outline" className="h-9 w-full bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 flex justify-center">
                <BarChart3 className="w-4 h-4 mr-2" /> Performance Overview
            </Button>
        </div>
      </header>

      {/* Practice Exam Active Tracker */}
      <Card className="border border-zinc-800 bg-[#0c0c0e] shadow-none flex flex-col lg:flex-row p-5 rounded-2xl gap-6 relative group transition-colors hover:border-zinc-700">
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 transition-opacity opacity-0 group-hover:opacity-100 blur-[80px] rounded-full pointer-events-none" />
        </div>
        <div className="flex-1 space-y-4 relative z-30">
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
            <Timer className="w-4 h-4" /> Practice Exam Tracking
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex flex-col gap-1.5 flex-1 w-full max-w-[200px]">
              <Label className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Subjects</Label>
              <div className="relative isolate">
                <Button 
                  disabled={isTimerRunning || practiceTimeLeft !== practiceTotalTime}
                  variant="outline" 
                  className="w-full justify-start h-10 bg-zinc-900 border-zinc-800 text-sm font-normal truncate"
                  onClick={() => setIsSubjectSelectOpen(!isSubjectSelectOpen)}
                >
                  {practiceSubjects.length > 0 ? practiceSubjects.join(', ') : 'Select Subjects'}
                </Button>
                {isSubjectSelectOpen && (
                  <div className="absolute z-[9999] top-full left-0 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-md shadow-2xl p-2 pb-2">
                    <div className="max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
                      {SUBJECTS.map(s => (
                        <div key={s} className="flex items-center gap-2 py-1.5">
                          <input 
                            type="checkbox" 
                            id={`practice-${s}`}
                            checked={practiceSubjects.includes(s)}
                            onChange={(e) => {
                              if (e.target.checked) setPracticeSubjects(prev => [...prev, s]);
                              else setPracticeSubjects(prev => prev.filter(x => x !== s));
                            }}
                            className="w-4 h-4 rounded border-zinc-600 bg-zinc-900 accent-blue-500 cursor-pointer"
                          />
                          <label htmlFor={`practice-${s}`} className="text-sm text-zinc-200 flex-1 cursor-pointer select-none">{s}</label>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full h-8 mt-2 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium" onClick={() => setIsSubjectSelectOpen(false)}>Okay</Button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1.5 flex-1 w-full max-w-[200px]">
              <Label className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Duration</Label>
              <div className="flex gap-2 w-full">
                {!showCustomTime ? (
                  <select 
                    value={practiceTotalTime}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setShowCustomTime(true);
                      } else {
                        const val = Number(e.target.value);
                        setPracticeTotalTime(val);
                        setPracticeTimeLeft(val);
                      }
                    }}
                    disabled={isTimerRunning || practiceTimeLeft !== practiceTotalTime}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md h-10 px-3 text-sm text-zinc-100 disabled:opacity-50"
                  >
                    <option value={900}>15 Minutes</option>
                    <option value={1800}>30 Minutes</option>
                    <option value={3600}>1 Hour</option>
                    <option value={7200}>2 Hours</option>
                    <option value={10800}>3 Hours</option>
                    <option value="custom">Custom...</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-2 w-full">
                    <Input 
                      type="number"
                      min="1"
                      placeholder="Mins"
                      value={customTimeMins}
                      onChange={(e) => {
                        setCustomTimeMins(e.target.value);
                        const val = Number(e.target.value) * 60;
                        if (!isNaN(val) && val > 0) {
                          setPracticeTotalTime(val);
                          setPracticeTimeLeft(val);
                        }
                      }}
                      disabled={isTimerRunning || practiceTimeLeft !== practiceTotalTime}
                      className="bg-zinc-900 border-zinc-800 h-10 w-20 flex-1"
                    />
                    <span className="text-sm text-zinc-500">min</span>
                    <Button 
                      variant="ghost" 
                      className="p-1 h-10 text-zinc-400 hover:text-white"
                      disabled={isTimerRunning || practiceTimeLeft !== practiceTotalTime}
                      onClick={() => {
                        setShowCustomTime(false);
                        setPracticeTotalTime(3600);
                        setPracticeTimeLeft(3600);
                      }}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:items-end justify-center relative z-10">
          <div className="font-mono text-5xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            {formatTime(practiceTimeLeft)}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isTimerRunning ? (
              <>
                <Button onClick={handlePauseTimer} variant="secondary" className="flex-1 sm:flex-none h-10 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 font-semibold px-6">
                 <Pause className="w-4 h-4 mr-2" /> Pause
                </Button>
                <Button onClick={handleStopTimer} variant="destructive" className="flex-1 sm:flex-none h-10 bg-red-600/20 text-red-500 border border-red-500/20 hover:bg-red-600/30 font-semibold px-4">
                 <Square className="w-4 h-4 mr-2" /> End
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleStartTimer} className="flex-1 sm:flex-none h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 disabled:opacity-50" disabled={practiceTimeLeft === 0 || practiceSubjects.length === 0}>
                 <Play className="w-4 h-4 mr-2" /> {practiceTimeLeft !== practiceTotalTime ? "Resume" : "Start Practice"}
                </Button>
                {practiceTimeLeft !== practiceTotalTime && (
                  <Button onClick={() => { setPracticeTimeLeft(practiceTotalTime); setIsTimerRunning(false); }} variant="outline" className="h-10 bg-transparent border-zinc-700 text-zinc-400 hover:text-white px-4">
                    Reset
                  </Button>
                )}
                {practiceTimeLeft !== practiceTotalTime && (
                  <Button onClick={() => setShowLogModal(true)} variant="secondary" className="h-10 bg-zinc-800 text-zinc-300 px-4">
                    Log Early
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedExams.map(exam => {
          const daysLeft = calculateDaysLeft(exam.date);
          const isUrgent = daysLeft >= 0 && daysLeft <= 14;
          const isPast = daysLeft < 0;

          return (
            <Card key={exam.id} className={cn("border border-zinc-800 rounded-xl shadow-none flex flex-col h-full relative overflow-hidden group transition-all", exam.isDone ? "bg-zinc-900/40 border-zinc-800/60" : "bg-zinc-900")}>
              {!exam.isDone && isUrgent && (
                <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
                  <div className="absolute transform rotate-45 bg-red-500/20 text-red-400 text-[10px] font-bold py-1 right-[-35px] top-[32px] w-[170px] text-center uppercase tracking-wider backdrop-blur-sm">
                    Upcoming
                  </div>
                </div>
              )}
              <CardHeader className="p-4 pb-2 border-b border-zinc-800/50">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className={cn("text-sm font-semibold mb-1 line-clamp-2", exam.isDone ? "text-zinc-400 line-through" : "text-zinc-100")}>{exam.title}</CardTitle>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {exam.type && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                          {exam.type}
                        </span>
                      )}
                      {exam.subjects && exam.subjects.map(sub => (
                        <span key={sub} className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-zinc-700 text-zinc-300">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditModal(exam)} className="p-1.5 -m-1.5 text-zinc-400 hover:text-white">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(exam.id)} className="p-1.5 -m-1.5 text-red-500 hover:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Calendar className="w-4 h-4 text-emerald-400" />
                      <span>{new Date(exam.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'})}</span>
                    </div>
                    {exam.time && (
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span>{exam.time}</span>
                      </div>
                    )}
                  </div>

                  {!exam.isDone ? (
                    <div className="flex justify-between items-center bg-zinc-950 p-3 rounded-lg border border-zinc-800/50">
                      <div className="flex flex-col">
                        <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Countdown</span>
                        <div className="mt-1 flex items-baseline gap-1">
                          {isPast ? (
                            <span className="text-lg font-bold text-zinc-500 font-mono">Passed</span>
                          ) : (
                            <>
                              <span className={cn("text-2xl font-bold font-mono tracking-tight", isUrgent ? "text-red-400" : "text-zinc-100")}>
                                {daysLeft}
                              </span>
                              <span className="text-xs text-zinc-500">days left</span>
                            </>
                          )}
                        </div>
                      </div>
                      {!isPast && isUrgent && (
                        <AlertCircle className="w-6 h-6 text-red-500" />
                      )}
                    </div>
                  ) : (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Exam Completed
                        </span>
                      </div>
                      {exam.scores && Object.keys(exam.scores).map((sub) => {
                        const score = exam.scores![sub];
                        return (
                          <div key={sub} className="flex justify-between items-center text-xs text-zinc-300 mt-2">
                            <span>{sub}</span>
                            <span className="font-mono bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300">
                              {score.obtained} / {score.total}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-800/50 flex flex-col gap-4">
                  {!exam.isDone && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-zinc-400 flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" /> Preparation
                        </span>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => updateProgress(exam.id, exam.preparationStatus - 10)}
                            disabled={exam.preparationStatus <= 0}
                            className="w-5 h-5 flex items-center justify-center rounded bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 disabled:opacity-50"
                          >
                            -
                          </button>
                          <span className={cn("text-xs font-mono font-bold min-w-[3.5ch] text-center", 
                            exam.preparationStatus >= 80 ? "text-emerald-400" : 
                            exam.preparationStatus >= 40 ? "text-amber-400" : "text-red-400"
                          )}>
                            {exam.preparationStatus}%
                          </span>
                          <button 
                            onClick={() => updateProgress(exam.id, exam.preparationStatus + 10)}
                            disabled={exam.preparationStatus >= 100}
                            className="w-5 h-5 flex items-center justify-center rounded bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <Progress value={exam.preparationStatus} className="h-1.5" />
                    </div>
                  )}

                  <div className="flex gap-2">
                    {exam.isDone ? (
                      <>
                        <Button onClick={(e) => handleMarkUndone(exam.id, e)} variant="ghost" className="flex-1 h-8 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 text-xs">
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Unmark
                        </Button>
                        <Button onClick={() => openScoreModal(exam)} variant="secondary" className="flex-1 h-8 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs">
                          <Edit2 className="w-3 h-3 mr-1" /> Edit Scores
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => openScoreModal(exam)} className="w-full h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                        <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Mark Exam Done
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {exams.length === 0 && (
          <div className="col-span-full py-10 text-center border-2 border-dashed border-zinc-800 rounded-xl">
            <BookOpen className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 font-medium">No exams scheduled</p>
            <p className="text-zinc-600 text-sm mt-1">Add your upcoming exams to start tracking</p>
          </div>
        )}
      </div>

      {/* Add / Edit Exam Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#0c0c0e] border-zinc-800 text-zinc-100 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingExam ? 'Edit Exam' : 'Add Exam'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-zinc-400">Exam Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-blue-500"
                placeholder="e.g. HSC Final or Model Test"
                autoFocus
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date" className="text-zinc-400">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 focus-visible:ring-blue-500 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time" className="text-zinc-400">Time (Optional)</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 focus-visible:ring-blue-500 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type" className="text-zinc-400">Exam Type</Label>
              <Input
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-blue-500"
                placeholder="e.g. Public Exam, Internal, Pre-test (Optional)"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-zinc-400">Subjects</Label>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map(sub => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => toggleSubject(sub)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-semibold border transition-colors",
                      selectedSubjects.includes(sub) 
                        ? "bg-blue-600/20 border-blue-500 text-blue-400" 
                        : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500"
                    )}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {!editingExam?.isDone && (
              <div className="grid gap-2">
                <div className="flex justify-between items-center">
                  <Label className="text-zinc-400">Preparation</Label>
                  <span className="text-xs font-mono text-zinc-500">{preparationStatus}%</span>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    type="button"
                    onClick={() => setPreparationStatus(prev => Math.max(0, prev - 10))}
                    className="w-8 h-8 flex items-center justify-center rounded bg-zinc-800 text-zinc-400 hover:text-white"
                  >
                    -
                  </button>
                  <ProcessSlider value={preparationStatus} onChange={setPreparationStatus} />
                  <button 
                    type="button"
                    onClick={() => setPreparationStatus(prev => Math.min(100, prev + 10))}
                    className="w-8 h-8 flex items-center justify-center rounded bg-zinc-800 text-zinc-400 hover:text-white"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleSave} className="bg-white text-black hover:bg-zinc-200 px-6 rounded-xl w-full sm:w-auto">
              Save Exam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Score Modal */}
      <Dialog open={isScoreModalOpen} onOpenChange={setIsScoreModalOpen}>
        <DialogContent className="bg-[#0c0c0e] border-zinc-800 text-zinc-100 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enter Marks: {scoringExam?.title}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-zinc-500 mb-2">Did you receive marks for this exam? Leave blank if unknown.</p>
            {scoringExam?.subjects && scoringExam.subjects.length > 0 ? (
              scoringExam.subjects.map(sub => (
                <div key={sub} className="flex items-center gap-4">
                  <Label className="w-24 text-zinc-400">{sub}</Label>
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="number"
                      placeholder="Obt"
                      value={tempScores[sub]?.obtained || ''}
                      onChange={(e) => setTempScores(prev => ({
                        ...prev, [sub]: { ...prev[sub], obtained: e.target.value }
                      }))}
                      className="bg-zinc-900 border-zinc-800 text-center"
                    />
                    <span className="text-zinc-500 font-mono">/</span>
                    <Input
                      type="number"
                      placeholder="Total"
                      value={tempScores[sub]?.total || ''}
                      onChange={(e) => setTempScores(prev => ({
                        ...prev, [sub]: { ...prev[sub], total: e.target.value }
                      }))}
                      className="bg-zinc-900 border-zinc-800 text-center"
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500 text-center py-4">No subjects tracked for this exam. You can edit the exam to add subjects.</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleSaveScores} className="bg-emerald-600 text-white hover:bg-emerald-700 w-full sm:w-auto">
              Mark as Done & Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Overview Analytics Modal */}
      <Dialog open={isOverviewOpen} onOpenChange={setIsOverviewOpen}>
        <DialogContent className="bg-[#0c0c0e] border-zinc-800 text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Performance Overview</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-zinc-400 mb-6">See which subjects need more focus based on your scored exams.</p>
            {subjectPerformance.length > 0 ? (
              <div className="space-y-6">
                {subjectPerformance.map(({ subject, percentage, obtained, total }, index) => {
                  const isWeak = percentage! < 50;
                  const isStrong = percentage! >= 80;
                  return (
                    <div key={subject}>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-semibold flex items-center gap-2">
                          {subject}
                          {index === 0 && <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded uppercase font-bold">Needs Focus</span>}
                        </span>
                        <div className="text-right">
                          <span className={cn("text-sm font-mono font-bold", isWeak ? "text-red-400" : isStrong ? "text-emerald-400" : "text-amber-400")}>
                            {percentage!.toFixed(1)}%
                          </span>
                          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{obtained} / {total}</p>
                        </div>
                      </div>
                      <Progress 
                        value={percentage || 0} 
                        className="h-2" 
                        indicatorClassName={isWeak ? "bg-red-500" : isStrong ? "bg-emerald-500" : "bg-amber-500"} 
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">No exam scores recorded yet.</p>
                <p className="text-zinc-600 text-xs mt-1">Complete exams with tracked subject scores to see your performance overview.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Practice Exam Quick Log Modal */}
      <Dialog open={showLogModal} onOpenChange={setShowLogModal}>
        <DialogContent className="bg-[#0c0c0e] border-zinc-800 text-zinc-100 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Log Practice Exam</DialogTitle>
          </DialogHeader>
          <div className="py-4 grid gap-4 max-h-[60vh] overflow-y-auto">
            <p className="text-sm text-zinc-500">Record your results for this practice exam.</p>
            {practiceSubjects.map(sub => (
              <div key={sub} className="grid gap-2">
                <Label className="text-zinc-400">{sub} Score</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Obt"
                    value={practiceScores[sub]?.obtained || ''}
                    onChange={e => setPracticeScores(prev => ({ ...prev, [sub]: { ...prev[sub], obtained: e.target.value } }))}
                    className="bg-zinc-900 border-zinc-800 text-center"
                  />
                  <span className="text-zinc-500 font-mono">/</span>
                  <Input
                    type="number"
                    placeholder="Total"
                    value={practiceScores[sub]?.total || ''}
                    onChange={e => setPracticeScores(prev => ({ ...prev, [sub]: { ...prev[sub], total: e.target.value } }))}
                    className="bg-zinc-900 border-zinc-800 text-center"
                  />
                </div>
              </div>
            ))}
          </div>
          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button onClick={handleSavePracticeLog} className="w-full bg-blue-600 text-white hover:bg-blue-700">
              Save Log
            </Button>
            <Button onClick={() => { setShowLogModal(false); setPracticeTimeLeft(practiceTotalTime); }} variant="outline" className="w-full border-zinc-800 text-zinc-400 hover:text-white">
              Skip Logging
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

// Helper simple slider
function ProcessSlider({ value, onChange }: { value: number, onChange: (v: number) => void }) {
  return (
    <Input
      type="range"
      min="0"
      max="100"
      step="10"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-blue-500"
    />
  )
}
