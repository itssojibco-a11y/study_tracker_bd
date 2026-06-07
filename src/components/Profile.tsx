import React from 'react';
import { useAuth } from '../lib/AuthContext';
import { User as UserIcon } from 'lucide-react';

export function Profile() {
  const { user, signOut } = useAuth();

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Profile & Settings</h1>
        <p className="text-zinc-400">Manage your account and authentication preferences.</p>
      </div>

      <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400">
            <UserIcon size={32} />
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              {user?.email || 'Authenticated User'}
            </h2>
            <p className="text-zinc-500 text-sm">
              Your account is secured and synced.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800">
          <button
            onClick={signOut}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
