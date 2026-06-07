import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, Wallet, Target, Plus, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface Transaction {
  id: string;
  title: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

const mockTransactions: Transaction[] = [
  { id: '1', title: 'Monthly Allowance', date: 'Oct 01, 2023', amount: 5000, type: 'income', category: 'Allowance' },
  { id: '2', title: 'Internet Bill', date: 'Oct 03, 2023', amount: 800, type: 'expense', category: 'Bills' },
  { id: '3', title: 'Admission Book', date: 'Oct 05, 2023', amount: 450, type: 'expense', category: 'Education' },
  { id: '4', title: 'Lunch at Cafe', date: 'Oct 08, 2023', amount: 250, type: 'expense', category: 'Food' },
];

export function Finance() {
  const totalIncome = mockTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = mockTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;
  const savingsGoal = 2000;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <header className="mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-emerald-400">Finance Manager</h1>
          <p className="text-zinc-500 mt-1">Track your income, expenses, and savings</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-10 px-4 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm font-semibold flex items-center gap-2 transition-colors hover:bg-zinc-800 hover:text-white">
             <ArrowDownRight className="w-4 h-4 text-red-400" /> Expense
          </button>
          <button className="h-10 px-4 rounded-xl bg-white text-black text-sm font-semibold flex items-center gap-2 transition-colors hover:bg-zinc-200">
             <ArrowUpRight className="w-4 h-4 text-emerald-600" /> Income
          </button>
        </div>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 border border-zinc-800 bg-zinc-900 rounded-2xl shadow-none p-5 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
             <Wallet className="w-24 h-24" />
           </div>
           <CardHeader className="p-0 mb-2">
             <CardTitle className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Current Balance</CardTitle>
           </CardHeader>
           <CardContent className="p-0">
             <div className="text-3xl font-bold font-mono text-zinc-100">৳{balance.toLocaleString()}</div>
             <p className="text-xs text-zinc-500 mt-2">Available for expenses</p>
           </CardContent>
        </Card>

        <Card className="col-span-1 border border-zinc-800 bg-zinc-900 rounded-2xl shadow-none p-5">
           <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between">
             <CardTitle className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Monthly Income</CardTitle>
             <ArrowUpRight className="w-4 h-4 text-blue-500" />
           </CardHeader>
           <CardContent className="p-0">
             <div className="text-2xl font-bold font-mono text-blue-400">৳{totalIncome.toLocaleString()}</div>
             <div className="mt-2 flex items-center gap-2">
               <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-bold">+12%</span>
               <span className="text-[10px] text-zinc-500">from last month</span>
             </div>
           </CardContent>
        </Card>

        <Card className="col-span-1 border border-zinc-800 bg-zinc-900 rounded-2xl shadow-none p-5">
           <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between">
             <CardTitle className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Monthly Expense</CardTitle>
             <ArrowDownRight className="w-4 h-4 text-red-500" />
           </CardHeader>
           <CardContent className="p-0">
             <div className="text-2xl font-bold font-mono text-red-400">৳{totalExpense.toLocaleString()}</div>
             <div className="mt-2 flex items-center gap-2">
               <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold">-5%</span>
               <span className="text-[10px] text-zinc-500">from last month</span>
             </div>
           </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           <Card className="border border-zinc-800 bg-zinc-900/50 rounded-2xl shadow-none">
             <CardHeader className="border-b border-zinc-800/50 pb-4">
               <CardTitle className="text-lg font-bold flex items-center gap-2">
                 <Receipt className="w-5 h-5 text-zinc-400" /> Recent Transactions
               </CardTitle>
             </CardHeader>
             <CardContent className="p-0">
               <div className="divide-y divide-zinc-800/50">
                 {mockTransactions.map((tx) => (
                   <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors">
                     <div className="flex items-center gap-4">
                       <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", 
                         tx.type === 'income' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'
                       )}>
                         {tx.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                       </div>
                       <div>
                         <p className="font-semibold text-sm text-zinc-100">{tx.title}</p>
                         <p className="text-[10px] text-zinc-500 mt-0.5">{tx.category} • {tx.date}</p>
                       </div>
                     </div>
                     <span className={cn("font-mono font-bold text-sm", 
                       tx.type === 'income' ? 'text-blue-400' : 'text-zinc-100'
                     )}>
                       {tx.type === 'income' ? '+' : '-'}৳{tx.amount.toLocaleString()}
                     </span>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
        </div>

        <div className="space-y-6">
           <Card className="border border-zinc-800 bg-zinc-900 rounded-xl shadow-none p-5">
             <div className="flex items-center gap-2 mb-4">
               <Target className="w-4 h-4 text-emerald-500" />
               <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest">Savings Goal</h3>
             </div>
             
             <div className="space-y-4">
                <div>
                   <div className="flex justify-between items-end mb-2">
                     <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">October Target</span>
                     <span className="text-sm font-mono text-zinc-300">৳{savingsGoal.toLocaleString()}</span>
                   </div>
                   <div className="flex items-baseline gap-1 mb-2">
                     <span className="text-2xl font-bold font-mono text-zinc-100">৳{balance.toLocaleString()}</span>
                     <span className="text-xs text-zinc-500">saved</span>
                   </div>
                   <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                     <div className="bg-emerald-500 h-full" style={{ width: `${Math.min((balance / savingsGoal) * 100, 100)}%` }} />
                   </div>
                </div>
             </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
