import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownLeft, Wallet, Target, Plus, Receipt, Edit2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAppState, Transaction } from '@/store';
import { useTranslation } from '@/i18n';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function Finance() {
  const { transactions, setTransactions, savingsGoal, setSavingsGoal } = useAppState();
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedMonthDetails, setSelectedMonthDetails] = useState<{ monthStr: string; income: number; expense: number; name: string } | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');
  
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [txFilter, setTxFilter] = useState<'all' | 'income' | 'expense'>('all');

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const chartData = useMemo(() => {
    const currentMonth = new Date();
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 11 + i, 1);
      return {
        monthStr: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        dateObj: d,
        income: 0,
        expense: 0
      };
    });

    transactions.forEach(t => {
      const txDate = new Date(t.date);
      if (!isNaN(txDate.getTime())) {
        const txMonthStr = txDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const monthData = last12Months.find(m => m.monthStr === txMonthStr);
        if (monthData) {
          if (t.type === 'income') monthData.income += t.amount;
          if (t.type === 'expense') monthData.expense += t.amount;
        }
      }
    });

    return last12Months.map(m => ({
      name: m.dateObj.toLocaleDateString('en-US', { month: 'short' }),
      monthStr: m.monthStr,
      Income: m.income,
      Expense: m.expense
    }));
  }, [transactions]);

  const currentMonthData = chartData[chartData.length - 1];
  const previousMonthData = chartData[chartData.length - 2];
  
  const currentMonthIncome = currentMonthData?.Income || 0;
  const currentMonthExpense = currentMonthData?.Expense || 0;
  const previousMonthIncome = previousMonthData?.Income || 0;
  const previousMonthExpense = previousMonthData?.Expense || 0;

  const incomeChange = previousMonthIncome > 0 
    ? Math.round(((currentMonthIncome - previousMonthIncome) / previousMonthIncome) * 100)
    : (currentMonthIncome > 0 ? 100 : 0);

  const expenseChange = previousMonthExpense > 0 
    ? Math.round(((currentMonthExpense - previousMonthExpense) / previousMonthExpense) * 100)
    : (currentMonthExpense > 0 ? 100 : 0);

  const transactionsForSelectedMonth = useMemo(() => {
    if (!selectedMonthDetails) return [];
    return transactions.filter(t => {
      const d = new Date(t.date);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) === selectedMonthDetails.monthStr;
      }
      return false;
    });
  }, [selectedMonthDetails, transactions]);

  const displayedTransactions = useMemo(() => {
    if (txFilter === 'all') return transactions;
    return transactions.filter(t => t.type === txFilter);
  }, [transactions, txFilter]);

  const handleSave = () => {
    if (!title.trim() || !amount || isNaN(Number(amount))) return;

    if (editingTransaction) {
      setTransactions(prev => prev.map(t =>
        t.id === editingTransaction.id ? { ...t, title, date, amount: Number(amount), type, category } : t
      ));
    } else {
      const newTransaction: Transaction = {
        id: Math.random().toString(),
        title,
        date: date || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        amount: Number(amount),
        type,
        category: category || 'Other'
      };
      setTransactions(prev => [newTransaction, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    setIsModalOpen(false);
  };

  const openAddModal = (defaultType: 'income' | 'expense' = 'expense') => {
    setEditingTransaction(null);
    setTitle('');
    setDate(new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }));
    setAmount('');
    setType(defaultType);
    setCategory('');
    setIsModalOpen(true);
  };

  const openEditModal = (t: Transaction) => {
    setEditingTransaction(t);
    setTitle(t.title);
    setDate(t.date);
    setAmount(t.amount.toString());
    setType(t.type);
    setCategory(t.category);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <header className="mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-emerald-400">{t("Financial Overview")}</h1>
          <p className="text-zinc-500 mt-1">{t("Track income and expenses")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => openAddModal('expense')}
            className="h-10 px-4 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm font-semibold flex items-center gap-2 transition-colors hover:bg-zinc-800 hover:text-white"
          >
             <ArrowUpRight className="w-4 h-4 text-red-400" /> Expense
          </button>
          <button 
            onClick={() => openAddModal('income')}
            className="h-10 px-4 rounded-xl bg-white text-black text-sm font-semibold flex items-center gap-2 transition-colors hover:bg-zinc-200"
          >
             <ArrowDownLeft className="w-4 h-4 text-emerald-600" /> Income
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
             <ArrowDownLeft className="w-4 h-4 text-blue-500" />
           </CardHeader>
           <CardContent className="p-0">
             <div className="text-2xl font-bold font-mono text-blue-400">৳{currentMonthIncome.toLocaleString()}</div>
             <div className="mt-2 flex items-center gap-2">
               <span className={cn(
                 "text-[10px] px-1.5 py-0.5 rounded font-bold",
                 incomeChange >= 0 ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-400"
               )}>
                 {incomeChange >= 0 ? '+' : ''}{incomeChange}%
               </span>
               <span className="text-[10px] text-zinc-500">from last month</span>
             </div>
           </CardContent>
        </Card>

        <Card className="col-span-1 border border-zinc-800 bg-zinc-900 rounded-2xl shadow-none p-5">
           <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between">
             <CardTitle className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Monthly Expense</CardTitle>
             <ArrowUpRight className="w-4 h-4 text-red-500" />
           </CardHeader>
           <CardContent className="p-0">
             <div className="text-2xl font-bold font-mono text-red-400">৳{currentMonthExpense.toLocaleString()}</div>
             <div className="mt-2 flex items-center gap-2">
               <span className={cn(
                 "text-[10px] px-1.5 py-0.5 rounded font-bold",
                 expenseChange <= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
               )}>
                 {expenseChange > 0 ? '+' : ''}{expenseChange}%
               </span>
               <span className="text-[10px] text-zinc-500">from last month</span>
             </div>
           </CardContent>
        </Card>
      </div>

      {/* 12 Month Record Chart */}
      <Card className="border border-zinc-800 bg-zinc-900/50 rounded-2xl shadow-none">
        <CardHeader className="border-b border-zinc-800/50 pb-4">
          <CardTitle className="text-lg font-bold">12-Month Record</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-6">
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `৳${value}`} />
                <Tooltip 
                  cursor={{ fill: '#3f3f46', opacity: 0.2 }}
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#e4e4e7', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Income" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           <Card className="border border-zinc-800 bg-zinc-900/50 rounded-2xl shadow-none">
             <CardHeader className="border-b border-zinc-800/50 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
               <CardTitle className="text-lg font-bold flex items-center gap-2">
                 <Receipt className="w-5 h-5 text-zinc-400" /> Recent Transactions
               </CardTitle>
               <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                 <button onClick={() => setTxFilter('all')} className={cn("px-3 py-1 text-xs font-semibold rounded-md transition-colors", txFilter === 'all' ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300")}>All</button>
                 <button onClick={() => setTxFilter('income')} className={cn("px-3 py-1 text-xs font-semibold rounded-md transition-colors", txFilter === 'income' ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300")}>Income</button>
                 <button onClick={() => setTxFilter('expense')} className={cn("px-3 py-1 text-xs font-semibold rounded-md transition-colors", txFilter === 'expense' ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300")}>Expense</button>
               </div>
             </CardHeader>
             <CardContent className="p-0">
               <div className="divide-y divide-zinc-800/50 max-h-[400px] overflow-y-auto min-h-[300px]">
                 {displayedTransactions.length === 0 ? (
                   <div className="p-8 text-center text-zinc-500">No transactions yet</div>
                 ) : displayedTransactions.map((tx) => (
                   <div key={tx.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-zinc-800/30 transition-colors group gap-4">
                     <div className="flex items-center gap-4">
                       <div className={cn("w-10 h-10 shrink-0 rounded-xl flex items-center justify-center", 
                         tx.type === 'income' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'
                       )}>
                         {tx.type === 'income' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                       </div>
                       <div className="min-w-0">
                         <p className="font-semibold text-sm text-zinc-100 truncate">{tx.title}</p>
                         <p className="text-[10px] text-zinc-500 mt-0.5 truncate">{tx.category} • {tx.date}</p>
                       </div>
                     </div>
                     <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full pl-14 sm:pl-0">
                       <span className={cn("font-mono font-bold text-sm", 
                         tx.type === 'income' ? 'text-blue-400' : 'text-zinc-100'
                       )}>
                         {tx.type === 'income' ? '+' : '-'}৳{tx.amount.toLocaleString()}
                       </span>
                       <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(tx)} className="p-2 -m-2 text-zinc-500 hover:text-zinc-300">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(tx.id)} className="p-2 -m-2 text-red-500/50 hover:text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                     </div>
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
                     <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { month: 'long' })} Target</span>
                     <div className="flex items-center gap-2">
                       {isEditingGoal ? (
                         <div className="flex items-center gap-1">
                           <input 
                              type="number" 
                              className="w-20 bg-zinc-800 text-xs px-2 py-1 rounded text-zinc-200 outline-none border border-zinc-700"
                              value={goalInput}
                              onChange={(e) => setGoalInput(e.target.value)}
                              autoFocus
                           />
                           <button 
                             onClick={() => {
                               const val = Number(goalInput);
                               if (!isNaN(val) && val > 0) {
                                  setSavingsGoal(val);
                               }
                               setIsEditingGoal(false);
                             }}
                             className="text-xs text-emerald-400 font-bold px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20"
                           >Save</button>
                         </div>
                       ) : (
                         <div className="flex items-center gap-2">
                           <span className="text-sm font-mono text-zinc-300">৳{savingsGoal.toLocaleString()}</span>
                           <button onClick={() => { setGoalInput(savingsGoal.toString()); setIsEditingGoal(true); }} className="text-zinc-500 hover:text-zinc-300"><Edit2 className="w-3 h-3" /></button>
                         </div>
                       )}
                     </div>
                   </div>
                   <div className="flex items-baseline gap-1 mb-2">
                     <span className="text-2xl font-bold font-mono text-zinc-100">৳{balance.toLocaleString()}</span>
                     <span className="text-xs text-zinc-500">saved</span>
                   </div>
                   <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                     <div className="bg-emerald-500 h-full" style={{ width: `${savingsGoal > 0 ? Math.min((balance / savingsGoal) * 100, 100) : 0}%` }} />
                   </div>
                </div>
             </div>
           </Card>

           <Card className="border border-zinc-800 bg-zinc-900 rounded-xl shadow-none p-5">
             <div className="flex items-center gap-2 mb-4">
               <Receipt className="w-4 h-4 text-zinc-400" />
               <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Past Months Details</h3>
             </div>
             <div className="space-y-3">
               {[...chartData].reverse().slice(1, 6).map((month, i) => (
                 <div key={i} className="flex flex-col p-3 bg-zinc-800/30 rounded-xl border border-zinc-800/50">
                   <div className="flex items-center justify-between mb-2">
                     <span className="font-semibold text-zinc-200 text-sm">{month.monthStr}</span>
                     <button
                       onClick={() => setSelectedMonthDetails({ monthStr: month.monthStr, income: month.Income, expense: month.Expense, name: month.name })}
                       className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider"
                     >
                       বিস্তারিত দেখুন
                     </button>
                   </div>
                   <div className="flex items-center justify-between text-xs font-mono">
                     <span className="text-emerald-400">+৳{month.Income.toLocaleString()}</span>
                     <span className="text-red-400">-৳{month.Expense.toLocaleString()}</span>
                   </div>
                 </div>
               ))}
             </div>
           </Card>
        </div>
      </div>

      {/* Transaction Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#0c0c0e] border-zinc-800 text-zinc-100 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingTransaction ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div
                className={cn(
                  "cursor-pointer rounded-lg border p-3 text-center transition-colors text-sm font-semibold",
                  type === 'income' ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-zinc-800 bg-zinc-900/50 text-zinc-400"
                )}
                onClick={() => setType('income')}
              >
                Income
              </div>
              <div
                className={cn(
                  "cursor-pointer rounded-lg border p-3 text-center transition-colors text-sm font-semibold",
                  type === 'expense' ? "border-red-500 bg-red-500/10 text-red-400" : "border-zinc-800 bg-zinc-900/50 text-zinc-400"
                )}
                onClick={() => setType('expense')}
              >
                Expense
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title" className="text-zinc-400">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-blue-500"
                placeholder="e.g. Lunch"
                autoFocus
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount" className="text-zinc-400">Amount (৳)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 focus-visible:ring-blue-500 font-mono"
                  placeholder="0.00"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="date" className="text-zinc-400">Date</Label>
                <Input
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 focus-visible:ring-blue-500"
                  placeholder="Oct 01, 2023"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category" className="text-zinc-400">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-blue-500"
                placeholder="e.g. Food, Bills, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} className="bg-white text-black hover:bg-zinc-200 px-6 rounded-xl w-full sm:w-auto">
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Month Details Modal */}
      <Dialog open={!!selectedMonthDetails} onOpenChange={() => setSelectedMonthDetails(null)}>
        <DialogContent className="bg-[#0c0c0e] border-zinc-800 text-zinc-100 sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          {selectedMonthDetails && (
            <>
              <DialogHeader className="mb-4 text-left">
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-400" /> 
                  {selectedMonthDetails.monthStr} Details
                </DialogTitle>
                <p className="text-zinc-500 text-sm mt-1">Summary and transaction history for this month</p>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4 mb-6">
                 <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                   <div className="text-blue-400/80 text-xs font-bold uppercase tracking-widest mb-1">Total Income</div>
                   <div className="text-2xl font-bold font-mono text-blue-400">৳{selectedMonthDetails.income.toLocaleString()}</div>
                 </div>
                 <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                   <div className="text-red-400/80 text-xs font-bold uppercase tracking-widest mb-1">Total Expense</div>
                   <div className="text-2xl font-bold font-mono text-red-400">৳{selectedMonthDetails.expense.toLocaleString()}</div>
                 </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-2">Transactions</h4>
                <div className="space-y-3">
                  {transactionsForSelectedMonth.length === 0 ? (
                    <div className="text-center py-8 text-zinc-600">No transactions found for this month.</div>
                  ) : transactionsForSelectedMonth.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", 
                          tx.type === 'income' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'
                        )}>
                          {tx.type === 'income' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-zinc-200">{tx.title}</p>
                          <p className="text-[10px] text-zinc-500">{tx.category} • {tx.date}</p>
                        </div>
                      </div>
                      <div className={cn("font-mono font-bold text-sm", 
                        tx.type === 'income' ? 'text-blue-400' : 'text-zinc-200'
                      )}>
                        {tx.type === 'income' ? '+' : '-'}৳{tx.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
