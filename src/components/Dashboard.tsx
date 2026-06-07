import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAppState } from '@/store';
import { format } from 'date-fns';
import { calculateChapterProgress } from '@/types';
import { Target, Timer, Flame, Wallet, BookUp, Plus, Clock } from 'lucide-react';

export function Dashboard() {
  const { chapters } = useAppState();

  const totalChapters = chapters.length;
  const totalProgressPercentage = totalChapters > 0 
    ? (chapters.reduce((acc, c) => acc + calculateChapterProgress(c.progress), 0) / totalChapters) 
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-10 py-4 -mt-4 mb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Today</h1>
          <p className="text-zinc-500 mt-1">{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>
        <div className="hidden sm:flex gap-2">
          {/* Quick Actions Placeholder */}
          <button className="h-10 px-4 rounded-xl bg-white text-black text-sm font-semibold flex items-center gap-2 transition-colors hover:bg-zinc-200">
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-blue-500/20 bg-gradient-to-br from-blue-600/20 to-purple-600/5 rounded-2xl shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase">Admission Progress</CardTitle>
            <Target className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{totalProgressPercentage.toFixed(1)}%</div>
            <Progress value={totalProgressPercentage} className="h-1.5 mt-3 bg-zinc-800" indicatorClassName="bg-blue-500" />
          </CardContent>
        </Card>

        <Card className="border border-zinc-800 bg-zinc-900 rounded-xl shadow-none p-4">
          <CardHeader className="flex flex-row items-center justify-between p-0 mb-4">
            <CardTitle className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Study Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-bold text-orange-400 font-mono">14 Days</div>
            <p className="text-[10px] text-zinc-500 mt-1">Longest: 21 Days</p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-800 bg-zinc-900 rounded-xl shadow-none p-4">
          <CardHeader className="flex flex-row items-center justify-between p-0 mb-4">
            <CardTitle className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Month's Savings</CardTitle>
            <Wallet className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-bold">৳4,500</div>
            <p className="text-[10px] text-zinc-500 mt-1">Goal: ৳5,000</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          <section>
            <h2 className="text-lg font-bold tracking-tight mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span> Focus Tasks
            </h2>
            <Card className="border border-zinc-800 bg-zinc-900/50 rounded-2xl shadow-none">
              <div className="divide-y divide-zinc-800">
                {[
                  { title: 'Complete Physics Vector CQ', time: '10:00 AM', tag: 'Study', color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
                  { title: 'Read Organic Chemistry ch2', time: '1:00 PM', tag: 'Reading', color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
                  { title: 'Pay Internet Bill', time: '5:00 PM', tag: 'Personal', color: 'bg-zinc-800/50 text-zinc-400 border border-zinc-700' }
                ].map((task, i) => (
                  <div key={i} className="p-5 flex items-center gap-4 hover:bg-zinc-800/30 transition-colors cursor-pointer group">
                    <div className="w-5 h-5 rounded border-2 border-zinc-600 group-hover:border-zinc-500 transition-colors" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{task.title}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{task.time}</p>
                    </div>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${task.color}`}>
                      {task.tag}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          <section>
            <Card className="border border-zinc-800 bg-zinc-900 shadow-none rounded-xl p-4">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">BUET Admission</p>
              <div className="flex items-baseline gap-2">
                 <span className="text-4xl font-bold font-mono text-zinc-100">45</span>
                 <span className="text-xs text-zinc-500 font-bold tracking-tighter uppercase">Days Left</span>
              </div>
            </Card>
          </section>

          <section>
            <h2 className="text-lg font-bold tracking-tight mb-4 flex items-center gap-2">
               <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span> Habits
            </h2>
            <Card className="border border-zinc-800 bg-zinc-900/50 rounded-2xl shadow-none p-5">
              <div className="space-y-5">
                {[
                  { name: 'Water (2L/3L)', progress: 66, display: '6/8' },
                  { name: 'Reading', progress: 100, display: 'Done' },
                  { name: 'Exercise', progress: 0, display: '0/1' },
                ].map((habit) => (
                  <div key={habit.name}>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-semibold">{habit.name}</span>
                      <span className="text-xs font-mono text-zinc-500">{habit.display}</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500" style={{ width: `${habit.progress}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
