import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, CheckSquare, Edit2, Trash2, CalendarDays, Watch, Brain, Briefcase, Moon, Sparkles, Loader2 } from 'lucide-react';
import { cn, getBDDateString } from '@/lib/utils';
import { useAppState, DailyRoutine, DailyRoutineTask } from '@/store';
import { useTranslation } from '@/i18n';

export function DailyRoutinePage() {
  const { routines, setRoutines } = useAppState();
  const { t } = useTranslation();
  
  const [todayStr, setTodayStr] = useState(() => getBDDateString(new Date()));

  useEffect(() => {
    const timer = setInterval(() => {
      const newSelectedDate = getBDDateString(new Date());
      if (newSelectedDate !== todayStr) {
        setTodayStr(newSelectedDate);
      }
    }, 60000); // Check every minute
    return () => clearInterval(timer);
  }, [todayStr]);
  
  // Find today's routine
  const currentRoutine = useMemo(() => routines.find(r => r.date === todayStr), [routines, todayStr]);

  useEffect(() => {
    if (!currentRoutine && routines !== undefined) {
      // Create today's routine
      // Get the most recent routine by date to bring over customized targets
      const pastRoutines = routines.filter(r => r.date < todayStr).sort((a, b) => a.date.localeCompare(b.date));
      const lastRoutine = pastRoutines.length > 0 ? pastRoutines[pastRoutines.length - 1] : null;

      const carryOverTasks = lastRoutine 
        ? lastRoutine.customTasks.filter(t => !t.completed).map(t => ({...t, id: Math.random().toString()})) 
        : [];
      
      let carryOverActivities = lastRoutine?.activities;
      if (!carryOverActivities) {
        carryOverActivities = [
          { id: 'sleep', name: 'Sleep', targetHours: 7, hours: 0, checked: false, icon: 'Moon' },
          { id: 'study', name: 'Study', targetHours: 10, hours: 0, checked: false, icon: 'Brain' },
          { id: 'work', name: 'Work', targetHours: 4.5, hours: 0, checked: false, icon: 'Briefcase' }
        ];
      } else {
        carryOverActivities = carryOverActivities.map(a => ({ ...a, hours: 0, checked: false }));
      }
      
      const newRoutine: DailyRoutine = {
        date: todayStr,
        activities: carryOverActivities,
        prayers: { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false },
        customTasks: carryOverTasks
      };
      
      setRoutines(prev => [...prev, newRoutine]);
    }
  }, [currentRoutine, routines, setRoutines, todayStr]);

  // Migrate existing routine if it lacks activities (from earlier store version)
  useEffect(() => {
    if (currentRoutine && !currentRoutine.activities) {
      setRoutines(prev => prev.map(r => {
        if (r.date === currentRoutine.date && !r.activities) {
          return {
            ...r,
            activities: [
              { id: 'sleep', name: 'Sleep', targetHours: 7, hours: r.sleepHours || 0, checked: !!r.sleepChecked, icon: 'Moon' },
              { id: 'study', name: 'Study', targetHours: 10, hours: r.studyHours || 0, checked: !!r.studyChecked, icon: 'Brain' },
              { id: 'work', name: 'Work', targetHours: 4.5, hours: r.workHours || 0, checked: !!r.workChecked, icon: 'Briefcase' }
            ]
          };
        }
        return r;
      }));
    }
  }, [currentRoutine, setRoutines]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditTargetsOpen, setIsEditTargetsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<DailyRoutineTask | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  if (!currentRoutine) return <div className="p-8 text-center">Loading routine...</div>;

  const updateCurrentRoutine = (updates: Partial<DailyRoutine>) => {
    setRoutines(prev => prev.map(r => r.date === todayStr ? { ...r, ...updates } : r));
  };

  const handlePrayerToggle = (prayer: keyof DailyRoutine['prayers']) => {
    updateCurrentRoutine({
      prayers: {
        ...currentRoutine.prayers,
        [prayer]: !currentRoutine.prayers[prayer]
      }
    });
  };

  const handleSaveTask = () => {
    if (!newTaskTitle.trim()) return;
    
    let updatedTasks = [...currentRoutine.customTasks];
    if (editingTask) {
      updatedTasks = updatedTasks.map(t => t.id === editingTask.id ? { ...t, title: newTaskTitle } : t);
    } else {
      updatedTasks.push({
        id: Math.random().toString(),
        title: newTaskTitle,
        completed: false
      });
    }
    
    updateCurrentRoutine({ customTasks: updatedTasks });
    setIsModalOpen(false);
    setNewTaskTitle('');
    setEditingTask(null);
  };

  const handleDeleteTask = (id: string) => {
    updateCurrentRoutine({
      customTasks: currentRoutine.customTasks.filter(t => t.id !== id)
    });
  };

  const toggleTaskComplete = (id: string) => {
    updateCurrentRoutine({
      customTasks: currentRoutine.customTasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    });
  };

  const openAddModal = () => {
    setEditingTask(null);
    setNewTaskTitle('');
    setIsModalOpen(true);
  };

  const openEditModal = (task: DailyRoutineTask) => {
    setEditingTask(task);
    setNewTaskTitle(task.title);
    setIsModalOpen(true);
  };

  // Calculations
  const completedPrayersCount = Object.values(currentRoutine.prayers).filter(Boolean).length;
  // Calculate total utilized hours safely falling back if activities is not migrated
  const utilizedActivityHours = currentRoutine.activities 
    ? currentRoutine.activities.reduce((acc, act) => acc + (act.checked ? (act.hours || 0) : 0), 0)
    : (currentRoutine.sleepHours || 0) + (currentRoutine.studyHours || 0) + (currentRoutine.workHours || 0);
  
  const utilizedHours = utilizedActivityHours + (completedPrayersCount * 0.5);
  const wastedHours = Math.max(0, 24 - utilizedHours);

  // Stats Logic
  const getStats = (days: number) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const applicableRoutines = routines.filter(r => new Date(r.date) >= cutoff);
    
    const activityStats: Record<string, number> = {};

    applicableRoutines.forEach(r => {
      if (r.activities) {
        r.activities.forEach(a => {
           activityStats[a.id] = (activityStats[a.id] || 0) + (a.hours || 0);
        });
      } else {
         activityStats['sleep'] = (activityStats['sleep'] || 0) + (r.sleepHours || 0);
         activityStats['study'] = (activityStats['study'] || 0) + (r.studyHours || 0);
         activityStats['work'] = (activityStats['work'] || 0) + (r.workHours || 0);
      }
    });

    return { 
      activities: activityStats, 
      count: applicableRoutines.length || 1 
    };
  };

  const stats7Days = getStats(7);

  const getYesterdayStats = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getBDDateString(yesterday);
    const yesterdayRoutine = routines.find(r => r.date === yesterdayStr);
    
    const activityStats: Record<string, number> = {};
    if (yesterdayRoutine) {
      if (yesterdayRoutine.activities) {
        yesterdayRoutine.activities.forEach(a => {
           activityStats[a.id] = a.hours || 0;
        });
      } else {
         activityStats['sleep'] = yesterdayRoutine.sleepHours || 0;
         activityStats['study'] = yesterdayRoutine.studyHours || 0;
         activityStats['work'] = yesterdayRoutine.workHours || 0;
      }
    }
    return {
      activities: activityStats,
      count: 1
    };
  };

  const yesterdayStats = getYesterdayStats();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <header className="mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Daily Routine</h1>
          <p className="text-zinc-500 mt-1">Track your daily 24 hours, prayers, and tasks.</p>
        </div>
        <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
             <Badge variant="secondary" className="bg-transparent text-zinc-400 border-none font-normal">
               <CalendarDays className="w-3.5 h-3.5 mr-1.5" />
               {todayStr}
             </Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Time Tracking Section */}
          <Card className="border border-zinc-800 bg-zinc-900/50 rounded-2xl shadow-none">
            <CardHeader className="pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Hours Allocation</CardTitle>
                <CardDescription>Track how many hours you spent today</CardDescription>
              </div>
              <Button variant="outline" onClick={() => setIsEditTargetsOpen(true)} className="h-8 gap-2 bg-transparent border-zinc-800 hover:bg-zinc-800 text-zinc-300">
                <Edit2 className="w-3.5 h-3.5" /> Edit Targets
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6">
                {currentRoutine.activities?.map(activity => {
                  const icons = {
                    Moon: <Moon className="w-4 h-4 text-indigo-400" />,
                    Brain: <Brain className="w-4 h-4 text-blue-400" />,
                    Briefcase: <Briefcase className="w-4 h-4 text-emerald-400" />
                  };
                  const ActivityIcon = icons[activity.icon as keyof typeof icons] || <Watch className="w-4 h-4 text-amber-400" />;
                  
                  return (
                    <div key={activity.id} className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`check-${activity.id}`}
                          checked={activity.checked}
                          onCheckedChange={(checked) => {
                            const updatedActivities = currentRoutine.activities!.map(a => 
                              a.id === activity.id ? { ...a, checked: !!checked } : a
                            );
                            updateCurrentRoutine({ activities: updatedActivities });
                          }}
                          className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 border-zinc-600"
                        />
                        <Label htmlFor={`check-${activity.id}`} className="flex items-center gap-2 text-zinc-300 cursor-pointer text-sm">
                          {ActivityIcon} {activity.name} (Target: {activity.targetHours} hrs)
                        </Label>
                      </div>
                      {activity.checked && (
                        <div className="pl-6 space-y-2">
                          <Input 
                            type="number" min="0" max="24" step="0.5"
                            className="bg-zinc-950 border-zinc-800 focus-visible:ring-emerald-500 max-w-[200px]"
                            value={activity.hours || ''}
                            onChange={(e) => {
                              const updatedActivities = currentRoutine.activities!.map(a => 
                                a.id === activity.id ? { ...a, hours: parseFloat(e.target.value) || 0 } : a
                              );
                              updateCurrentRoutine({ activities: updatedActivities });
                            }}
                            placeholder={`Hours ${activity.name.toLowerCase()}`}
                          />
                          {activity.hours > 0 && (
                            <p className={cn("text-xs leading-relaxed", 
                              activity.hours < activity.targetHours ? "text-amber-500" : activity.hours > activity.targetHours ? "text-blue-400" : "text-emerald-500"
                            )}>
                              {activity.hours < activity.targetHours 
                                ? `You are ${Math.abs(activity.targetHours - activity.hours)} hours short of your target.` 
                                : activity.hours > activity.targetHours 
                                ? `You logged ${Math.abs(activity.hours - activity.targetHours)} hours more than targeted.` 
                                : "Perfect! You met your target exactly."}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Prayers Checkboxes */}
              <div className="mt-8">
                <Label className="text-zinc-300 mb-3 block">Daily Prayers (30 mins each)</Label>
                <div className="flex flex-wrap gap-4 sm:gap-6">
                  {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).map(prayer => (
                    <div key={prayer} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`prayer-${prayer}`} 
                        checked={currentRoutine.prayers[prayer]}
                        onCheckedChange={() => handlePrayerToggle(prayer)}
                        className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                      />
                      <label 
                        htmlFor={`prayer-${prayer}`}
                        className="text-sm font-medium leading-none capitalize text-zinc-400 cursor-pointer"
                      >
                        {prayer}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Analysis Result */}
          <Card className={cn(
            "border rounded-2xl shadow-none overflow-hidden transition-colors",
            wastedHours > 4 ? "border-amber-500/20 bg-amber-950/10" : "border-emerald-500/20 bg-emerald-950/10"
          )}>
            <div className="p-6 flex flex-col items-start gap-4">
               <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 w-full">
                  <div className={cn("p-4 rounded-full flex-shrink-0", wastedHours > 4 ? "bg-amber-500/20 text-amber-500" : "bg-emerald-500/20 text-emerald-500")}>
                    <Watch className="w-8 h-8" />
                  </div>
                  <div className="flex-1 w-full text-center sm:text-left">
                    <h3 className={cn("text-lg font-bold", wastedHours > 4 ? "text-amber-500" : "text-emerald-500")}>
                      {wastedHours > 0 ? `You have wasted ${wastedHours.toFixed(1)} hours today.` : "Perfect utilization of your day!"}
                    </h3>
                    <p className={cn("text-sm mt-1", wastedHours > 4 ? "text-amber-500/80" : "text-emerald-500/80")}>
                      Used: {utilizedHours.toFixed(1)}h | Out of 24 hours
                    </p>
                  </div>
               </div>
            </div>
          </Card>

          {/* Custom Tasks Section */}
          <Card className="border border-zinc-800 bg-zinc-900/50 rounded-2xl shadow-none">
            <CardHeader className="border-b border-zinc-800/50 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">To-Do Tasks</CardTitle>
                <CardDescription>Extra tasks for today</CardDescription>
              </div>
              <button onClick={openAddModal} className="h-8 px-3 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add Task
              </button>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-zinc-800/50">
                 {currentRoutine.customTasks.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500 text-sm">No tasks added for today.</div>
                 ) : (
                    currentRoutine.customTasks.map((task) => (
                      <div key={task.id} className="p-4 flex items-center gap-4 hover:bg-zinc-800/30 transition-colors group">
                        <Checkbox 
                          checked={task.completed}
                          onCheckedChange={() => toggleTaskComplete(task.id)}
                          className="border-zinc-600 rounded mt-0.5 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500" 
                        />
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm font-medium transition-all", task.completed ? "text-zinc-500 line-through" : "text-zinc-100")}>
                            {task.title}
                          </p>
                        </div>
                        <div className="flex gap-2 opacity-50 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(task)} className="text-zinc-500 hover:text-zinc-300">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteTask(task.id)} className="text-red-500/70 hover:text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                 )}
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="space-y-6">
          <Card className="border border-zinc-800 bg-zinc-900 rounded-xl shadow-none p-5">
            <h3 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-4">Yesterday's Stats</h3>
            <div className="space-y-4">
               {currentRoutine.activities?.map(activity => {
                 const val = yesterdayStats.activities[activity.id] || 0;
                 return (
                   <div key={`yday-${activity.id}`}>
                     <div className="flex justify-between items-center mb-1">
                       <span className="text-sm text-zinc-400">{activity.name}</span>
                       <span className="text-sm font-mono font-bold text-zinc-200">{val}h</span>
                     </div>
                   </div>
                 );
               })}
               {(!currentRoutine.activities || currentRoutine.activities.length === 0) && (
                 <div className="text-zinc-500 text-xs">No activities tracked.</div>
               )}
            </div>
          </Card>

          <Card className="border border-zinc-800 bg-zinc-900 rounded-xl shadow-none p-5">
            <h3 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-4">Past 7 Days Stats</h3>
            <div className="space-y-4">
               {currentRoutine.activities?.map(activity => {
                 const avg = ((stats7Days.activities[activity.id] || 0) / stats7Days.count).toFixed(1);
                 return (
                   <div key={`7d-${activity.id}`}>
                     <div className="flex justify-between items-center mb-1">
                       <span className="text-sm text-zinc-400">Avg {activity.name}</span>
                       <span className="text-sm font-mono font-bold text-zinc-200">{avg}h</span>
                     </div>
                   </div>
                 );
               })}
               {(!currentRoutine.activities || currentRoutine.activities.length === 0) && (
                 <div className="text-zinc-500 text-xs">No activities tracked.</div>
               )}
            </div>
          </Card>
        </div>
      </div>
      
      {/* Task Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#0c0c0e] border-zinc-800 text-zinc-100 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task" : "Add Task"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-zinc-400">Task Title</Label>
              <Input
                id="title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-blue-500"
                placeholder="e.g. Read Chapter 5"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTask()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveTask} className="bg-white text-black hover:bg-zinc-200 px-6 rounded-xl w-full sm:w-auto">
              Save Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Targets Modal */}
      <Dialog open={isEditTargetsOpen} onOpenChange={setIsEditTargetsOpen}>
        <DialogContent className="bg-[#0c0c0e] border-zinc-800 text-zinc-100 sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Routine Targets</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {currentRoutine.activities?.map((activity, index) => (
              <div key={activity.id} className="flex flex-col sm:flex-row gap-3 items-end p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
                <div className="grid gap-2 flex-grow w-full">
                  <Label className="text-zinc-400 text-xs">Activity Name</Label>
                  <Input 
                    value={activity.name}
                    onChange={(e) => {
                      const newActs = [...currentRoutine.activities!];
                      newActs[index].name = e.target.value;
                      updateCurrentRoutine({ activities: newActs });
                    }}
                    className="bg-zinc-950 border-zinc-800 h-9"
                  />
                </div>
                <div className="grid gap-2 w-full sm:w-28 shrink-0">
                  <Label className="text-zinc-400 text-xs">Target (Hrs)</Label>
                  <Input 
                    type="number" min="0" step="0.5"
                    value={activity.targetHours}
                    onChange={(e) => {
                      const newActs = [...currentRoutine.activities!];
                      newActs[index].targetHours = parseFloat(e.target.value) || 0;
                      updateCurrentRoutine({ activities: newActs });
                    }}
                    className="bg-zinc-950 border-zinc-800 h-9"
                  />
                </div>
                <Button variant="ghost" className="h-9 w-full sm:w-9 p-0 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                  onClick={() => {
                    const newActs = currentRoutine.activities!.filter(a => a.id !== activity.id);
                    updateCurrentRoutine({ activities: newActs });
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            
            <Button variant="outline" className="w-full border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-300 gap-2 border-dashed"
              onClick={() => {
                const newActs = [...(currentRoutine.activities || [])];
                newActs.push({
                  id: Math.random().toString(),
                  name: 'New Activity',
                  icon: 'Target',
                  targetHours: 1,
                  hours: 0,
                  checked: false
                });
                updateCurrentRoutine({ activities: newActs });
              }}
            >
              <Plus className="w-4 h-4" /> Add Activity Target
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsEditTargetsOpen(false)} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto rounded-xl">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
