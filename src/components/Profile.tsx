import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../lib/AuthContext';
import { User as UserIcon, Code2, Phone, Pencil, Save, X, Upload, AlertCircle, TerminalSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { useAppState } from '../store';

export function Profile() {
  const { user, signOut } = useAuth();
  const { syncStatus, syncErrorMsg } = useAppState();
  
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.user_metadata) {
      setFullName(user.user_metadata.full_name || '');
      setAvatarUrl(user.user_metadata.avatar_url || '');
    }
  }, [user]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 5) {
        alert("File size should be less than 5MB. Please choose a smaller image.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        // Resize the image using a canvas to keep it small for user_metadata storage
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_SIZE = 128; // Keep it very small for metadata
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          
          const resizedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
          setAvatarUrl(resizedDataUrl);
          if (fileInputRef.current) fileInputRef.current.value = "";
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          avatar_url: avatarUrl,
        }
      });
      if (error) throw error;
      setIsEditing(false);
      // Update global state if we need it somewhere else, but AuthContext already handles onAuthStateChange
    } catch (err) {
      console.error("Error updating profile", err);
      alert("Failed to update profile. " + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const displayAvatar = avatarUrl || user?.user_metadata?.avatar_url;

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Profile & Settings</h1>
        <p className="text-sm sm:text-base text-zinc-400">Manage your account and authentication preferences.</p>
      </div>

      {syncStatus === 'error' && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 sm:p-5 flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-red-500 font-medium">Database Sync Error</h3>
              <p className="text-sm text-red-400/80 mt-1">Your data is currently only saving locally. If you switch devices or clear cache, you will lose your data.</p>
              <p className="text-xs text-red-400/60 mt-1 uppercase font-mono tracking-wider">{syncErrorMsg}</p>
              
              {syncErrorMsg?.toLowerCase().includes('failed to fetch') && (
                <div className="mt-3 p-3 bg-red-950/40 rounded-lg text-sm text-red-300">
                  <p><strong>Fix "Failed to fetch":</strong></p>
                  <ul className="list-disc pl-4 mt-1 space-y-1">
                    <li>If you deployed to Netlify, you MUST add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in your Netlify <b>Site Settings &gt; Environment Variables</b>, then trigger a new deploy.</li>
                    <li>Make sure you don't have an Adblocker (like uBlock Origin or Brave Shields) blocking the connection.</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div className="bg-[#09090b] border border-zinc-800 rounded-lg p-4 mt-2 mb-2">
            <p className="text-sm text-zinc-400 mb-2">
              <b>Important:</b> This app now syncs with individual tables (tasks, goals, etc.). If you see sync errors, ensure you have created ALL the necessary tables.
            </p>
            <p className="text-sm text-zinc-400 mb-3">
              To fix this, go to your <b>Supabase SQL Editor</b> and run this snippet to create all required tables and policies:
            </p>
            <div className="relative">
              <pre className="text-[10px] sm:text-xs text-zinc-300 font-mono overflow-x-auto whitespace-pre p-3 bg-black/80 border border-zinc-800 rounded-md">
{`-- Create tables for each module
CREATE TABLE IF NOT EXISTS public.user_data (id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, data jsonb);
CREATE TABLE IF NOT EXISTS public.subjects (id text PRIMARY KEY, user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE, name text, "colorHex" text);
CREATE TABLE IF NOT EXISTS public.chapters (id text PRIMARY KEY, user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE, "subjectId" text, name text, progress jsonb);
CREATE TABLE IF NOT EXISTS public.goals (id text PRIMARY KEY, user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE, title text, type text, deadline text, progress integer, reward text, "rewardClaimed" boolean, history jsonb);
CREATE TABLE IF NOT EXISTS public.tasks (id text PRIMARY KEY, user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE, title text, deadline text, priority text, completed boolean);
CREATE TABLE IF NOT EXISTS public.transactions (id text PRIMARY KEY, user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE, title text, date text, amount numeric, type text, category text);
CREATE TABLE IF NOT EXISTS public.exams (id text PRIMARY KEY, user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE, title text, date text, time text, type text, subjects jsonb, "preparationStatus" integer, "isDone" boolean, scores jsonb);
CREATE TABLE IF NOT EXISTS public.prayers (id text PRIMARY KEY, user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE, name text, time text, status text);

-- Enable RLS for all tables
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayers ENABLE ROW LEVEL SECURITY;

-- Create unified policies
DO $$ 
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['user_data', 'subjects', 'chapters', 'goals', 'tasks', 'transactions', 'exams', 'prayers']) LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Manage own %s" ON public.%s;', t, t);
    IF t = 'user_data' THEN
      EXECUTE format('CREATE POLICY "Manage own %s" ON public.%s FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id)', t, t);
    ELSE
      EXECUTE format('CREATE POLICY "Manage own %s" ON public.%s FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)', t, t);
    END IF;
  END LOOP;
END $$;`}
              </pre>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-5 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 sm:gap-0">
          <div className="flex items-center gap-4 sm:gap-5 w-full sm:w-auto">
            {displayAvatar ? (
               <img src={displayAvatar} alt="Avatar" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-zinc-700 object-cover shrink-0" />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 border-2 border-zinc-800 shrink-0">
                <UserIcon size={32} className="sm:w-9 sm:h-9" />
              </div>
            )}
            
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-semibold truncate">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Authenticated User'}
              </h2>
              <p className="text-zinc-500 text-xs sm:text-sm mt-1 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)} className="w-full sm:w-auto border-zinc-700 text-zinc-300 hover:text-white">
              <Pencil className="w-4 h-4 mr-2" /> Edit Profile
            </Button>
          )}
        </div>

        {isEditing && (
          <div className="bg-[#09090b] p-4 sm:p-6 rounded-xl border border-zinc-800/50 mb-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-zinc-400">Full Name</Label>
              <Input 
                id="fullName" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your name"
                className="bg-zinc-900 border-zinc-800"
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-zinc-400">Profile Picture</Label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {avatarUrl && (
                   <img src={avatarUrl} alt="Preview" className="w-12 h-12 rounded-full border border-zinc-700 object-cover shrink-0" />
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileUpload} 
                />
                <Button 
                  variant="outline" 
                  className="border-zinc-700 w-full sm:w-auto"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload from Gallery
                </Button>
                {avatarUrl && (
                  <Button variant="ghost" className="text-red-400 hover:text-red-300 w-full sm:w-auto" onClick={() => setAvatarUrl('')}>
                    Remove
                  </Button>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 sm:pt-2 border-t sm:border-0 border-zinc-800/50">
              <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={isSaving} className="text-zinc-400 flex-1 sm:flex-none">
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
              <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none">
                <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-zinc-800">
          <button
            onClick={signOut}
            className="w-full sm:w-auto bg-red-500/10 hover:bg-red-500/20 text-red-500 px-6 py-2.5 rounded-xl font-medium transition-colors text-sm"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-5 sm:p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 shrink-0">
            <Code2 size={24} className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold truncate">About the Developer</h2>
            <p className="text-zinc-500 text-xs sm:text-sm truncate">System architect and creator.</p>
          </div>
        </div>
        
        <div className="bg-[#09090b] rounded-xl p-4 border border-zinc-800/50 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0">
            <span className="text-zinc-400 text-xs sm:text-sm">Name</span>
            <span className="text-zinc-100 font-medium text-sm sm:text-base">Shafiul Alam Sojib</span>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0">
            <span className="text-zinc-400 text-xs sm:text-sm">Contact</span>
            <div className="flex items-center gap-2 text-zinc-100 font-mono text-sm sm:text-base">
              <Phone size={14} className="text-zinc-500 hidden sm:block" />
              01979709261
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0">
            <span className="text-zinc-400 text-xs sm:text-sm">Website</span>
            <a href="https://mdshafiulalamsojib.blogspot.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 font-medium transition-colors text-sm truncate max-w-full block">
              mdshafiulalamsojib.blogspot.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
