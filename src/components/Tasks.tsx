import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppState, Task } from '@/store';
import { useTranslation } from '@/i18n';

const priorityColors = {
  low: 'bg-zinc-800/80 text-zinc-400 border-zinc-700',
  medium: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  high: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  urgent: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export function Tasks() {
  const { tasks, setTasks } = useAppState();
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');

  const priorityOrder: Record<Task['priority'], number> = { urgent: 1, high: 2, medium: 3, low: 4 };

  const activeTasks = tasks.filter(t => !t.completed).sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  const completedTasks = tasks.filter(t => t.completed);

  const toggleComplete = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleSave = () => {
    if (!title.trim()) return;
    
    if (editingTask) {
      setTasks(prev => prev.map(t => 
        t.id === editingTask.id ? { ...t, title, deadline, priority } : t
      ));
    } else {
      const newTask: Task = {
        id: Math.random().toString(),
        title,
        deadline,
        priority,
        completed: false
      };
      setTasks(prev => [...prev, newTask]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    setIsModalOpen(false);
  };

  const openAddModal = () => {
    setEditingTask(null);
    setTitle('');
    setDeadline('Today');
    setPriority('medium');
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDeadline(task.deadline);
    setPriority(task.priority);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <header className="mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">{t("Tasks & Planner")}</h1>
          <p className="text-zinc-500 mt-1">{t("Manage your academic and daily tasks")}</p>
        </div>
        <button 
          onClick={openAddModal}
          className="h-10 px-4 rounded-xl bg-white text-black text-sm font-semibold flex items-center gap-2 transition-colors hover:bg-zinc-200"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border border-zinc-800 bg-zinc-900/50 rounded-2xl shadow-none">
            <CardHeader className="border-b border-zinc-800/50 pb-4">
              <CardTitle className="text-lg font-bold flex items-center justify-between">
                <span>Active Tasks</span>
                <Badge variant="secondary" className="bg-blue-500 text-white hover:bg-blue-600">{activeTasks.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-zinc-800/50">
                {activeTasks.map((task) => (
                  <div key={task.id} className="p-4 flex items-start gap-4 hover:bg-zinc-800/30 transition-colors group">
                    <Checkbox 
                      checked={task.completed}
                      onCheckedChange={() => toggleComplete(task.id)}
                      className="mt-1 border-zinc-600 rounded data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-zinc-100">{task.title}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-[10px] text-zinc-500 font-medium">
                            <Calendar className="w-3 h-3" /> {task.deadline}
                          </span>
                          <span className={cn("text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border", priorityColors[task.priority])}>
                            {task.priority}
                          </span>
                        </div>
                        <div className="flex gap-2 opacity-50 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(task)} className="text-zinc-500 hover:text-zinc-300">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(task.id)} className="text-red-500/70 hover:text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {activeTasks.length === 0 && (
                  <div className="p-8 text-center text-zinc-500">
                    <p>{t("All caught up!")}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {completedTasks.length > 0 && (
            <Card className="border border-zinc-800 bg-zinc-900/30 rounded-2xl shadow-none opacity-70 hover:opacity-100 transition-opacity">
              <CardHeader className="pb-3 pt-4">
                <CardTitle className="text-sm font-bold text-zinc-400">{t("Completed")}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-zinc-800/30">
                  {completedTasks.map((task) => (
                    <div key={task.id} className="p-3 px-4 flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <Checkbox 
                          checked={true}
                          onCheckedChange={() => toggleComplete(task.id)}
                          className="border-zinc-700 bg-zinc-800 data-[state=checked]:bg-zinc-800 data-[state=checked]:border-zinc-700 data-[state=checked]:text-emerald-500 rounded" 
                        />
                        <p className="text-sm text-zinc-500 line-through">{task.title}</p>
                      </div>
                      <button onClick={() => handleDelete(task.id)} className="text-red-500/50 hover:text-red-400 opacity-50 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border border-zinc-800 bg-zinc-900 rounded-xl shadow-none p-5">
            <h3 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-4">Task Overview</h3>
            <div className="space-y-4">
               <div className="flex justify-between items-center">
                 <span className="text-sm text-zinc-400">Total Tasks</span>
                 <span className="text-sm font-mono font-bold">{tasks.length}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-sm text-zinc-400">Completed</span>
                 <span className="text-sm font-mono font-bold text-emerald-400">{completedTasks.length}</span>
               </div>
               <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-2">
                 <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: tasks.length > 0 ? `${(completedTasks.length / tasks.length) * 100}%` : '0%' }} />
               </div>
            </div>
          </Card>

          <Card className="border border-amber-500/20 bg-amber-950/10 rounded-xl shadow-none p-5">
             <div className="flex items-start gap-3">
               <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
               <div>
                  <h3 className="text-sm font-bold text-amber-500">Urgent Priorities</h3>
                  <p className="text-xs text-amber-500/80 mt-1 leading-relaxed">
                    You have {tasks.filter(t => t.priority === 'urgent' && !t.completed).length} urgent task pending for today. Consider addressing it before moving to your revision.
                  </p>
               </div>
             </div>
          </Card>
        </div>
      </div>
      
      {/* Task Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#0c0c0e] border-zinc-800 text-zinc-100 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingTask ? t("Edit Task") : t("Add Task")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-zinc-400">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-blue-500"
                placeholder="e.g. Complete Math Assignment"
                autoFocus
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="deadline" className="text-zinc-400">Deadline</Label>
                <Input
                  id="deadline"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 focus-visible:ring-blue-500"
                  placeholder="e.g. Today, 5PM"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="priority" className="text-zinc-400">Priority</Label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Task['priority'])}
                  className="w-full h-10 px-3 py-2 rounded-md border border-zinc-800 bg-zinc-900 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} className="bg-white text-black hover:bg-zinc-200 px-6 rounded-xl w-full sm:w-auto">
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
