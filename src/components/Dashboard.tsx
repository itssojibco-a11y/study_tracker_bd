import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAppState } from '@/store';
import { format } from 'date-fns';
import { calculateChapterProgress } from '@/types';
import { Target, Timer, Flame, Wallet, BookUp, Plus, Clock, Gift, Flag, User, Lightbulb, Moon, Brain, Briefcase, Loader2, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useTranslation } from '@/i18n';

export function Dashboard() {
  const { chapters, goals, routines, transactions, exams, prayers, savingsGoal, setGoals } = useAppState();
  const { t } = useTranslation();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [userName, setUserName] = useState('User');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [aiMotivationalQuote, setAiMotivationalQuote] = useState<{ quote?: string, loading: boolean }>({ loading: true });
  
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');

  const activeGoals = goals.filter(g => g.progress < 100).slice(0, 3);

  const handleSaveGoal = () => {
    if (!goalTitle.trim() || !goalDeadline) return;
    setGoals(prev => [...prev, {
      id: Math.random().toString(),
      title: goalTitle,
      type: 'short-term',
      deadline: goalDeadline,
      progress: 0,
      rewardClaimed: false,
      history: [{ date: new Date().toLocaleDateString(), note: 'Goal created', progressUpdate: 0 }]
    }]);
    setIsGoalModalOpen(false);
    setGoalTitle('');
    setGoalDeadline('');
  };

  const updateGoalProgress = (id: string, newProgress: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        const p = Math.max(0, Math.min(100, newProgress));
        if (p === g.progress) return g;
        
        const updatedHistory = [...g.history];
        updatedHistory.push({
          date: new Date().toLocaleDateString(),
          note: `Progress updated from ${g.progress}% to ${p}%`,
          progressUpdate: p
        });
        return { ...g, progress: p, history: updatedHistory };
      }
      return g;
    }));
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata) {
        if (user.user_metadata.fullName) setUserName(user.user_metadata.fullName);
        if (user.user_metadata.avatarUrl) setAvatarUrl(user.user_metadata.avatarUrl);
      }
    };
    fetchProfile();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const fetchQuote = async () => {
      try {
        const res = await fetch('/api/dashboard-quote');
        if (res.ok) {
          const data = await res.json();
          setAiMotivationalQuote({ quote: data.quote, loading: false });
        } else {
          setAiMotivationalQuote({ loading: false });
        }
      } catch (err) {
        setAiMotivationalQuote({ loading: false });
      }
    };
    fetchQuote();

    return () => clearInterval(timer);
  }, []);

  const totalChapters = chapters.length;
  const totalProgressPercentage = totalChapters > 0 
    ? (chapters.reduce((acc, c) => acc + calculateChapterProgress(c.progress), 0) / totalChapters) 
    : 0;

  const unclaimedRewards = goals.filter(g => g.progress >= 100 && g.reward && !g.rewardClaimed);

  const todayStr = new Date().toISOString().split('T')[0];
  const currentRoutine = routines.find(r => r.date === todayStr);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const upcomingExams = [...exams].filter(e => !e.isDone).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const calculateDaysLeft = (examDate: string) => {
    const [year, month, day] = examDate.split('-').map(Number);
    const target = new Date(year, month - 1, day).getTime();
    const _now = new Date();
    const now = new Date(_now.getFullYear(), _now.getMonth(), _now.getDate()).getTime();
    return Math.ceil((target - now) / (1000 * 3600 * 24));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-10 py-4 -mt-4 mb-4 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
             <img src={avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-zinc-700 object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center border-2 border-zinc-700">
              <User size={24} />
            </div>
          )}
          <div>
            <p className="text-sm text-zinc-400 font-medium">{t("Welcome back, ")}</p>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-100">{userName}</h1>
          </div>
        </div>
        <div className="hidden sm:flex gap-2">
          <Link to="/tasks" className="h-10 px-4 rounded-xl bg-white text-black text-sm font-semibold flex items-center gap-2 transition-colors hover:bg-zinc-200">
            <Plus className="w-4 h-4" /> {t("Daily Routine")}
          </Link>
        </div>
      </header>


      {/* Hero Stats */}
      <div className="grid grid-cols-1 gap-6">
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-bold tracking-tight flex items-center gap-2 text-indigo-400">
              <Sparkles className="w-5 h-5" /> Today's Motivation
            </div>
          </div>
          <Card className="border border-indigo-500/20 bg-indigo-950/10 rounded-2xl shadow-none p-6 md:p-8">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              {aiMotivationalQuote.loading ? (
                <div className="flex flex-col items-center gap-3 text-indigo-400/70">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-sm">Fetching motivation...</span>
                </div>
              ) : aiMotivationalQuote.quote ? (
                <>
                  <p className="text-lg md:text-xl font-serif text-indigo-100 italic leading-relaxed">
                    "{aiMotivationalQuote.quote}"
                  </p>
                  <p className="text-xs text-indigo-400/60 uppercase tracking-widest font-bold mt-4">
                    Never Give Up
                  </p>
                </>
              ) : (
                <p className="text-zinc-500 text-sm">Follow your routine and keep pushing forward!</p>
              )}
            </div>
          </Card>
        </section>

        <Link to="/study" className="block focus:outline-none rounded-2xl">
          <Card className="border border-blue-500/20 bg-gradient-to-br from-blue-600/20 to-purple-600/5 rounded-2xl shadow-none h-full hover:border-blue-500/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase">{t("Total Progress")}</CardTitle>
              <Target className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-zinc-100">{totalProgressPercentage.toFixed(1)}%</div>
              <Progress value={totalProgressPercentage} className="h-1.5 mt-3 bg-zinc-800" indicatorClassName="bg-blue-500" />
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          <section>
            <div className="flex items-center justify-between mb-4">
              <Link to="/goals" className="text-lg font-bold tracking-tight flex items-center gap-2 hover:text-emerald-400 transition-colors">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span> {t("Recent Goals")}
              </Link>
              <div className="flex items-center gap-4">
                <button onClick={() => setIsGoalModalOpen(true)} className="text-xs flex items-center gap-1 font-semibold text-emerald-400 hover:text-emerald-300">
                  <Plus className="w-4 h-4" /> {t("Add Goal")}
                </button>
              </div>
            </div>
            <Card className="border border-zinc-800 bg-zinc-900/50 rounded-2xl shadow-none">
              <div className="divide-y divide-zinc-800">
                {activeGoals.length > 0 ? activeGoals.map((goal) => (
                  <div key={goal.id} className="p-4 hover:bg-zinc-800/30 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-zinc-100 text-sm">{goal.title}</p>
                        <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(goal.deadline).toLocaleDateString()}</p>
                        {goal.reward && (
                          <p className="text-xs text-purple-400 mt-1 flex items-center gap-1">
                            <Gift className="w-3 h-3" /> {goal.reward}
                          </p>
                        )}
                      </div>
                      <div className="font-mono text-sm font-bold text-emerald-400">{goal.progress}%</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Progress value={goal.progress} className="h-1.5 flex-1 bg-zinc-800" indicatorClassName="bg-emerald-500" />
                      <div className="flex items-center gap-1">
                        <button onClick={() => updateGoalProgress(goal.id, goal.progress - 10)} disabled={goal.progress <= 0} className="w-6 h-6 flex items-center justify-center rounded bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 disabled:opacity-50 text-xs font-bold">-</button>
                        <button onClick={() => updateGoalProgress(goal.id, goal.progress + 10)} disabled={goal.progress >= 100} className="w-6 h-6 flex items-center justify-center rounded bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 disabled:opacity-50 text-xs font-bold">+</button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="p-6 text-center text-zinc-500 text-sm">
                    {t("No active goals. Set a new one!")}
                  </div>
                )}
              </div>
            </Card>
          </section>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          <section>
            <div className="flex items-center justify-between mb-4">
              <Link to="/goals" className="text-lg font-bold tracking-tight flex items-center gap-2 hover:text-purple-400 transition-colors">
                 <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span> {t("Pending Rewards")}
              </Link>
            </div>
            <Card className="border border-zinc-800 bg-zinc-900/50 rounded-2xl shadow-none">
              <div className="divide-y divide-zinc-800">
                {unclaimedRewards.length > 0 ? unclaimedRewards.map(goal => (
                  <div key={goal.id} className="p-4 flex items-center justify-between group">
                    <div className="flex items-center gap-3 flex-1 overflow-hidden">
                       <Gift className="w-5 h-5 text-purple-400 shrink-0" />
                       <div className="min-w-0 pr-2">
                         <p className="font-semibold text-zinc-100 text-sm truncate">{goal.reward}</p>
                         <p className="text-xs text-zinc-500 mt-0.5 truncate">{t("For:")} {goal.title}</p>
                       </div>
                    </div>
                    <Link to="/goals" className="shrink-0 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-full transition-colors font-medium">
                      {t("Claim")}
                    </Link>
                  </div>
                )) : (
                  <div className="p-6 text-center text-zinc-500 text-sm">
                    {t("Keep progressing towards your goals to unlock rewards.")}
                  </div>
                )}
              </div>
            </Card>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <Link to="/exams" className="text-lg font-bold tracking-tight flex items-center gap-2 hover:text-blue-400 transition-colors">
                 <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span> {t("Upcoming Exams")}
              </Link>
            </div>
            <Card className="border border-zinc-800 bg-zinc-900/50 rounded-2xl shadow-none">
              <div className="divide-y divide-zinc-800">
                {upcomingExams.length > 0 ? upcomingExams.slice(0, 3).map(exam => {
                  const daysLeft = calculateDaysLeft(exam.date);
                  return (
                  <div key={exam.id} className="p-4 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 shrink-0 rounded-lg bg-blue-500/10 flex flex-col items-center justify-center text-blue-400 font-bold border border-blue-500/20">
                         <span className="text-sm leading-none">{daysLeft}</span>
                         <span className="text-[8px] uppercase tracking-wider mt-0.5">{t("Days")}</span>
                      </div>
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-zinc-100 text-sm truncate">{exam.title}</p>
                        <p className="text-xs text-zinc-500 mt-0.5 truncate">{new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {exam.type}</p>
                      </div>
                    </div>
                    <Link to="/exams" className="shrink-0 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-full transition-colors font-medium">
                      {t("View")}
                    </Link>
                  </div>
                  )
                }) : (
                  <div className="p-6 text-center text-zinc-500 text-sm">
                    {t("No upcoming exams. You're all clear!")}
                  </div>
                )}
              </div>
            </Card>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <Link to="/finance" className="text-lg font-bold tracking-tight flex items-center gap-2 hover:text-emerald-400 transition-colors">
                 <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span> {t("Finances")}
              </Link>
            </div>
            <Link to="/finance" className="block focus:outline-none rounded-2xl">
              <Card className="border border-zinc-800 bg-zinc-900/50 rounded-2xl shadow-none p-5 h-full hover:border-zinc-700 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">{t("Finances")}</div>
                  <Wallet className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="text-3xl font-bold font-mono text-zinc-100 mb-1">৳{balance.toLocaleString()}</div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-zinc-500">{t("Goal:")} ৳{savingsGoal.toLocaleString()}</p>
                  <p className="text-xs text-emerald-500 font-medium">{savingsGoal > 0 ? Math.min(100, Math.round((balance/savingsGoal)*100)) : 0}%</p>
                </div>
                <Progress value={savingsGoal > 0 ? Math.min(100, Math.round((balance/savingsGoal)*100)) : 0} className="h-1.5 mt-3 bg-zinc-800" indicatorClassName="bg-emerald-500" />
              </Card>
            </Link>
          </section>
        </div>
      </div>

      <Dialog open={isGoalModalOpen} onOpenChange={setIsGoalModalOpen}>
        <DialogContent className="bg-[#0c0c0e] border-zinc-800 text-zinc-100 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("Add Goal")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="goalTitle" className="text-zinc-400">{t("Title")}</Label>
              <Input
                id="goalTitle"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500"
                placeholder={t("e.g. Finish Syllabus")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="goalDeadline" className="text-zinc-400">{t("Deadline")}</Label>
              <Input
                id="goalDeadline"
                type="date"
                value={goalDeadline}
                onChange={(e) => setGoalDeadline(e.target.value)}
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveGoal} className="bg-emerald-600 text-white hover:bg-emerald-700 w-full sm:w-auto">
              {t("Save Goal")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
