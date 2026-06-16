import React, { useState, useEffect, useRef } from 'react';
import { User as UserIcon, Code2, Phone, Pencil, Save, X, Upload, Trash2, Globe } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { useAppState } from '../store';
import { supabase } from '../lib/supabase';
import { useTranslation } from '../i18n';

export function Profile() {
  const { setAuth, currentUserEmail, language, setLanguage } = useAppState();
  const { t } = useTranslation();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata) {
        setFullName(user.user_metadata.fullName || '');
        setAvatarUrl(user.user_metadata.avatarUrl || '');
      }
    };
    fetchProfile();
  }, []);

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
        // Resize the image using a canvas to keep it small for storage
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_SIZE = 128; // Keep it very small
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
        data: { fullName, avatarUrl }
      });
      if (error) throw error;
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile", err);
      alert("Failed to update profile. " + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const displayAvatar = avatarUrl;
  const displayName = fullName || t('Guest User');

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">{t("Profile & Settings")}</h1>
        <p className="text-sm sm:text-base text-zinc-400">{t("Manage your profile and app data.")}</p>
      </div>

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
                {displayName}
              </h2>
            </div>
          </div>
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)} className="w-full sm:w-auto border-zinc-700 text-zinc-300 hover:text-white">
              <Pencil className="w-4 h-4 mr-2" /> {t("Edit Profile")}
            </Button>
          )}
        </div>

        {isEditing && (
          <div className="bg-[#09090b] p-4 sm:p-6 rounded-xl border border-zinc-800/50 mb-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-zinc-400">{t("Full Name")}</Label>
              <Input 
                id="fullName" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t("Enter your name")}
                className="bg-zinc-900 border-zinc-800"
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-zinc-400">{t("Profile Picture")}</Label>
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
                  {t("Upload Image")}
                </Button>
                {avatarUrl && (
                  <Button variant="ghost" className="text-red-400 hover:text-red-300 w-full sm:w-auto" onClick={() => setAvatarUrl('')}>
                    {t("Remove")}
                  </Button>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 sm:pt-2 border-t sm:border-0 border-zinc-800/50">
              <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={isSaving} className="text-zinc-400 flex-1 sm:flex-none">
                <X className="w-4 h-4 mr-2" /> {t("Cancel")}
              </Button>
              <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none">
                <Save className="w-4 h-4 mr-2" /> {isSaving ? t("Saving...") : t("Save")}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-5 sm:p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-400 shrink-0">
            <Globe size={24} className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold truncate">{t("Language")}</h2>
            <p className="text-zinc-500 text-xs sm:text-sm truncate">{t("Choose your preferred language.")}</p>
          </div>
        </div>
        <div className="bg-[#09090b] rounded-xl relative p-1 flex border border-zinc-800/50">
          <button 
            onClick={() => setLanguage('en')}
            className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-colors ${language === 'en' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            English
          </button>
          <button 
            onClick={() => setLanguage('bn')}
            className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-colors ${language === 'bn' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            বাংলা
          </button>
        </div>
      </div>

      <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-5 sm:p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 shrink-0">
            <Code2 size={24} className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold truncate">{t("About the Developer")}</h2>
            <p className="text-zinc-500 text-xs sm:text-sm truncate">{t("System architect and creator.")}</p>
          </div>
        </div>
        
        <div className="bg-[#09090b] rounded-xl p-4 border border-zinc-800/50 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0">
            <span className="text-zinc-400 text-xs sm:text-sm">{t("Name")}</span>
            <span className="text-zinc-100 font-medium text-sm sm:text-base">Shafiul Alam Sojib</span>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0">
            <span className="text-zinc-400 text-xs sm:text-sm">{t("Contact")}</span>
            <div className="flex items-center gap-2 text-zinc-100 font-mono text-sm sm:text-base">
              <Phone size={14} className="text-zinc-500 hidden sm:block" />
              01979709261
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0">
            <span className="text-zinc-400 text-xs sm:text-sm">{t("Website")}</span>
            <a href="https://mdshafiulalamsojib.blogspot.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 font-medium transition-colors text-sm truncate max-w-full block">
              mdshafiulalamsojib.blogspot.com
            </a>
          </div>
        </div>
      </div>

      <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-5 sm:p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-400 shrink-0">
            <Trash2 size={24} className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold truncate">{t("Account Actions")}</h2>
            <p className="text-zinc-500 text-xs sm:text-sm truncate">{t("Manage your session.")}</p>
          </div>
        </div>
        <div className="bg-[#09090b] rounded-xl p-4 border border-zinc-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-zinc-100 font-medium text-sm sm:text-base">{t("Signed in as")}</p>
            <p className="text-zinc-500 text-xs sm:text-sm">{currentUserEmail}</p>
          </div>
          <Button variant="outline" className="w-full sm:w-auto border-red-900 text-red-500 hover:bg-red-950/50 hover:text-red-400" onClick={async () => { await setAuth(false, ''); }}>
            {t("Sign Out")}
          </Button>
        </div>
      </div>
    </div>
  );
}
