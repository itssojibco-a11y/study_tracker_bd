import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, Flag, Clock, History, Plus, Edit2, Trash2, Gift, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppState, Goal } from '@/store';
import { useTranslation } from '@/i18n';

export function Goals() {
  const { goals, setGoals } = useAppState();
  const { t } = useTranslation();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [title, setTitle] = useState('');
  const [type, setType] = useState<'short-term' | 'long-term'>('short-term');
  const [deadline, setDeadline] = useState('');
  const [progress, setProgress] = useState(0);
  const [reward, setReward] = useState('');

  const shortTermGoals = React.useMemo(() => {
    return goals
      .filter(g => g.type === 'short-term')
      .sort((a, b) => {
        const aCompleted = a.progress >= 100;
        const bCompleted = b.progress >= 100;
        if (aCompleted === bCompleted) {
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        return aCompleted ? 1 : -1;
      });
  }, [goals]);

  const longTermGoals = React.useMemo(() => {
    return goals
      .filter(g => g.type === 'long-term')
      .sort((a, b) => {
        const aCompleted = a.progress >= 100;
        const bCompleted = b.progress >= 100;
        if (aCompleted === bCompleted) {
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        return aCompleted ? 1 : -1;
      });
  }, [goals]);

  const openAddModal = (defaultType: 'short-term' | 'long-term') => {
    setEditingGoal(null);
    setTitle('');
    setType(defaultType);
    setDeadline('');
    setProgress(0);
    setReward('');
    setIsModalOpen(true);
  };

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setType(goal.type);
    setDeadline(goal.deadline);
    setProgress(goal.progress);
    setReward(goal.reward || '');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!title.trim() || !deadline) return;

    if (editingGoal) {
      setGoals(prev => prev.map(g => {
        if (g.id === editingGoal.id) {
          const updatedHistory = [...g.history];
          if (progress !== g.progress) {
            updatedHistory.push({
              date: new Date().toLocaleDateString(),
              note: `Progress updated from ${g.progress}% to ${progress}%`,
              progressUpdate: progress
            });
          }
          return { ...g, title, type, deadline, progress: Number(progress), reward, history: updatedHistory };
        }
        return g;
      }));
    } else {
      setGoals(prev => [...prev, {
        id: Math.random().toString(),
        title,
        type,
        deadline,
        progress: Number(progress),
        reward,
        rewardClaimed: false,
        history: [{ date: new Date().toLocaleDateString(), note: 'Goal created', progressUpdate: progress }]
      }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const updateProgress = (id: string, newProgress: number) => {
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

  const claimReward = (id: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id && g.progress >= 100) {
        return { ...g, rewardClaimed: true };
      }
      return g;
    }));
  };

  const GoalCard: React.FC<{ goal: Goal }> = ({ goal }) => (
    <Card className="border border-zinc-800 bg-zinc-900 rounded-xl shadow-none">
      <CardHeader className="p-4 pb-2 border-b border-zinc-800/50 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-sm text-zinc-100 font-semibold">{goal.title}</CardTitle>
          <CardDescription className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Deadline: {new Date(goal.deadline).toLocaleDateString()}
          </CardDescription>
        </div>
        <div className="flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
          <button onClick={() => openEditModal(goal)} className="p-1 text-zinc-400 hover:text-white">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(goal.id)} className="p-1 text-red-500 hover:text-red-400">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-2 flex justify-between items-center text-xs text-zinc-400">
          <span>Progress</span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => updateProgress(goal.id, goal.progress - 10)}
              disabled={goal.progress <= 0}
              className="w-5 h-5 flex items-center justify-center rounded bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 disabled:opacity-50"
            >
              -
            </button>
            <span className="font-mono min-w-[3ch] text-center">{goal.progress}%</span>
            <button 
              onClick={() => updateProgress(goal.id, goal.progress + 10)}
              disabled={goal.progress >= 100}
              className="w-5 h-5 flex items-center justify-center rounded bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 disabled:opacity-50"
            >
              +
            </button>
          </div>
        </div>
        <Progress value={goal.progress} className="h-1.5" />
        
        {goal.reward && (
          <div className={cn("mt-4 p-3 rounded-lg border flex items-center justify-between", 
            goal.rewardClaimed ? "bg-emerald-500/10 border-emerald-500/20" : "bg-purple-500/10 border-purple-500/20")}>
            <div className="flex items-center gap-2">
              <Gift className={cn("w-4 h-4", goal.rewardClaimed ? "text-emerald-400" : "text-purple-400")} />
              <div className="flex flex-col">
                <span className={cn("text-xs font-semibold", goal.rewardClaimed ? "text-emerald-400" : "text-purple-400")}>Reward</span>
                <span className="text-sm font-medium text-zinc-200">{goal.reward}</span>
              </div>
            </div>
            {goal.progress >= 100 && !goal.rewardClaimed && (
              <Button onClick={() => claimReward(goal.id)} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-7 px-3">
                Claim Reward
              </Button>
            )}
            {goal.rewardClaimed && (
              <span className="text-emerald-400 flex items-center text-xs font-bold gap-1">
                <CheckCircle className="w-4 h-4" /> Claimed
              </span>
            )}
          </div>
        )}

        {goal.history.length > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-800/50">
            <div className="text-xs font-semibold text-zinc-500 mb-2 flex items-center gap-1">
              <History className="w-3 h-3" /> Latest History
            </div>
            <div className="text-xs text-zinc-400 bg-zinc-800/30 p-2 rounded truncate">
              <span className="text-zinc-500 mr-2">{goal.history[goal.history.length - 1].date}</span>
              {goal.history[goal.history.length - 1].note}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <header className="mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Goals</h1>
          <p className="text-zinc-500 mt-1">Track your short and long term objectives</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => openAddModal('short-term')} variant="outline" className="h-9 bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800">
            <Plus className="w-4 h-4 mr-1" /> Short Term
          </Button>
          <Button onClick={() => openAddModal('long-term')} className="h-9 bg-white text-black hover:bg-zinc-200">
            <Plus className="w-4 h-4 mr-1" /> Long Term
          </Button>
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-4 text-emerald-400">
            <Flag className="w-5 h-5" />
            <h2 className="text-lg font-bold">Short-Term Goals</h2>
          </div>
          <div className="space-y-4">
            {shortTermGoals.length === 0 ? (
              <p className="text-sm text-zinc-500">No short-term goals yet.</p>
            ) : shortTermGoals.map(goal => <GoalCard key={goal.id} goal={goal} />)}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4 text-blue-400">
            <Target className="w-5 h-5" />
            <h2 className="text-lg font-bold">Long-Term Goals</h2>
          </div>
          <div className="space-y-4">
            {longTermGoals.length === 0 ? (
              <p className="text-sm text-zinc-500">No long-term goals yet.</p>
            ) : longTermGoals.map(goal => <GoalCard key={goal.id} goal={goal} />)}
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#0c0c0e] border-zinc-800 text-zinc-100 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingGoal ? t("Edit Goal") : t("Add Goal")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-zinc-400">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-blue-500"
                placeholder="e.g. Finish Syllabus"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type" className="text-zinc-400">Type</Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as 'short-term' | 'long-term')}
                className="w-full h-10 px-3 py-2 rounded-md border border-zinc-800 bg-zinc-900 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <option value="short-term">Short-Term</option>
                <option value="long-term">Long-Term</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deadline" className="text-zinc-400">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-blue-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="progress" className="text-zinc-400">Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-blue-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reward" className="text-zinc-400 flex items-center gap-1">
                <Gift className="w-3.5 h-3.5" /> Self Reward (Optional)
              </Label>
              <Input
                id="reward"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-blue-500"
                placeholder="e.g. Buy a new game, Eat ice cream"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} className="bg-white text-black hover:bg-zinc-200 w-full sm:w-auto">
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
