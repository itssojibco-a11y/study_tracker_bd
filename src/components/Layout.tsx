import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Calculator, 
  CheckSquare, 
  Wallet, 
  Target,
  User,
  Settings,
  HeartPulse,
  Clock,
  Moon,
  Sun,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const NAV_ITEMS = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Study Hub', icon: BookOpen, path: '/study' },
  { name: 'Goals', icon: Target, path: '/goals' },
  { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
  { name: 'Exams', icon: BookOpen, path: '/exams' },
  { name: 'Finance', icon: Wallet, path: '/finance' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="flex h-screen bg-[#09090b] text-zinc-100 overflow-hidden transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-[#0c0c0e] border-zinc-800 transition-colors">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800">
          <div className="flex items-center gap-2 font-bold text-lg text-zinc-100 font-heading">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs italic">
              OS
            </div>
            Life OS
          </div>
        </div>
        
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-3">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors rounded-md",
                    isActive ? "bg-zinc-800/50 text-white" : "text-zinc-400 hover:bg-zinc-800/30"
                  )
                }
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </ScrollArea>
        
        <div className="p-4 border-t border-zinc-800 space-y-1">
          <button 
            onClick={toggleDark}
            className="flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors text-zinc-400 hover:bg-zinc-800/30 w-full"
          >
            <div className="flex items-center gap-3">
              {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </div>
          </button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-zinc-400 hover:bg-zinc-800/30 w-full mt-1">
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <NavLink 
            to="/profile"
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors w-full",
              isActive ? "bg-blue-600/10 text-blue-500" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/30"
            )}
          >
            <User className="w-4 h-4" />
            Profile
          </NavLink>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0 relative">
        <div className="max-w-6xl mx-auto w-full p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-[#0c0c0e] border-zinc-800 px-2 py-2 flex justify-between z-50 overflow-x-auto gap-2 scrollbar-none">
        {NAV_ITEMS.slice(0, 5).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 min-w-[3.5rem] w-full text-[10px] font-bold transition-colors uppercase tracking-tighter",
                isActive ? "text-blue-500" : "text-zinc-500"
              )
            }
          >
            <item.icon className="w-5 h-5 mb-0.5" />
            <span className="truncate max-w-full">{item.name}</span>
          </NavLink>
        ))}
        <NavLink
          to="/profile"
          className={({ isActive }) => cn(
            "flex flex-col items-center justify-center gap-1 min-w-[3.5rem] w-full text-[10px] font-bold transition-colors uppercase tracking-tighter",
            isActive ? "text-blue-500" : "text-zinc-500"
          )}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="truncate max-w-full">Profile</span>
        </NavLink>
      </nav>
    </div>
  );
}
