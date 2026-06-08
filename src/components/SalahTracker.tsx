import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useAppState, Prayer, PrayerStatus } from '@/store';
import { useTranslation } from '@/i18n';

export function SalahTracker() {
  const { prayers, setPrayers } = useAppState();
  const { t } = useTranslation();

  const toggleComplete = (name: string) => {
    setPrayers((prev) =>
      prev.map((p) => {
        if (p.name === name) {
          return { ...p, status: p.status === 'none' ? 'alone' : 'none' };
        }
        return p;
      })
    );
  };

  const setStatus = (name: string, status: PrayerStatus) => {
    setPrayers((prev) =>
      prev.map((p) => {
        if (p.name === name) {
          return { ...p, status: p.status === status ? 'none' : status };
        }
        return p;
      })
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <header className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-emerald-400">{t("Salah Tracker")}</h1>
        <p className="text-zinc-500 mt-1">{t("Keep track of your daily prayers")}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <Card className="border border-zinc-800 bg-zinc-900/50 rounded-2xl shadow-none">
            <CardHeader>
              <CardTitle className="text-lg">Today's Prayers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {prayers.map((prayer) => (
                  <div key={prayer.name} className="flex items-center justify-between p-3 bg-zinc-800/40 rounded-xl border border-zinc-800 hover:border-emerald-500/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={prayer.status !== 'none'} 
                        onCheckedChange={() => toggleComplete(prayer.name)}
                        className="border-zinc-600 rounded data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500" 
                      />
                      <div>
                        <p className="text-sm font-semibold">{prayer.name}</p>
                        <p className="text-[10px] text-zinc-500">{prayer.time}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <span 
                         onClick={() => setStatus(prayer.name, 'jamaat')}
                         className={cn("text-[10px] px-2 py-0.5 rounded cursor-pointer transition-colors border", 
                           prayer.status === 'jamaat' ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-transparent text-emerald-600 border-emerald-900/30 hover:border-emerald-500/30"
                         )}>Jamaat</span>
                       <span 
                         onClick={() => setStatus(prayer.name, 'alone')}
                         className={cn("text-[10px] px-2 py-0.5 rounded cursor-pointer transition-colors border", 
                           prayer.status === 'alone' ? "bg-zinc-700 text-zinc-200 border-zinc-600" : "bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-700"
                         )}>Alone</span>
                       <span 
                         onClick={() => setStatus(prayer.name, 'qaza')}
                         className={cn("text-[10px] px-2 py-0.5 rounded cursor-pointer transition-colors border",
                           prayer.status === 'qaza' ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-transparent text-red-600/50 border-red-900/30 hover:border-red-500/30 hover:text-red-400"
                         )}>Qaza</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-0 shadow-none bg-emerald-600/10 border border-emerald-500/20 rounded-2xl">
            <CardContent className="p-6">
              <h3 className="text-[10px] uppercase tracking-widest font-bold text-emerald-500 mb-1">Current Streak</h3>
              <div className="flex items-baseline gap-2">
                 <div className="text-4xl font-bold font-mono text-emerald-400 mt-2">12</div>
                 <span className="text-xs text-emerald-600 font-bold tracking-tighter uppercase">Days</span>
              </div>
              <p className="text-[10px] mt-2 text-emerald-500/80">Mashallah! Keep it up.</p>
            </CardContent>
          </Card>

          <Card className="border border-zinc-800 bg-zinc-900/50 shadow-none rounded-2xl">
            <CardHeader>
              <CardTitle className="text-sm font-bold">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end h-24">
                {[80, 100, 100, 60, 100, 40, 0].map((val, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-8 bg-zinc-800 rounded-t-sm flex items-end justify-center h-full">
                      <div className="w-full bg-emerald-500 rounded-t-sm transition-all" style={{ height: `${val}%` }} />
                    </div>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">
                      {['M','T','W','T','F','S','S'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
