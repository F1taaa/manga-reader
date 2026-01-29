'use client';

import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useMounted } from '@/hooks/use-mounted';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import {
  User,
  Settings,
  Download,
  Upload,
  LogOut,
  ShieldCheck,
  Database,
  Mail,
  Smartphone
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const mounted = useMounted();
  const { user, login, logout, exportData, importData, library, history } = useUser();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  if (!mounted) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && email) {
      login(username, email);
      toast.success('Logged in successfully');
    }
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mangadex-reader-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (importData(content)) {
          toast.success('Data imported successfully');
        } else {
          toast.error('Failed to import data. Invalid format.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navigation />

      <main className="mx-auto max-w-4xl px-4 py-12">
        <header className="mb-12">
          <div className="flex items-center gap-2 text-primary mb-2">
            <User className="h-5 w-5" />
            <span className="text-sm font-black uppercase tracking-widest">Account Settings</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter">Profile</h1>
        </header>

        <div className="grid gap-8">
          {/* User Auth Section */}
          <section className="p-8 rounded-3xl border border-border bg-muted/30">
            {user ? (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center text-white text-3xl font-black">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">{user.username}</h2>
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={logout} className="rounded-xl font-bold gap-2 text-destructive border-destructive/20 hover:bg-destructive/10">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-black tracking-tight">Sign In</h2>
                  <p className="text-muted-foreground">Log in to sync your library (locally) and access all features.</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4 max-w-md">
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Username</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. otaku_reader"
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                  <Button type="submit" className="w-full rounded-xl font-bold py-6">
                    Join the Club
                  </Button>
                </form>
              </div>
            )}
          </section>

          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl border border-border bg-background flex items-center gap-4">
               <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                 <ShieldCheck className="h-6 w-6" />
               </div>
               <div>
                 <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Library Size</p>
                 <p className="text-xl font-black">{Object.keys(library).length} Titles</p>
               </div>
            </div>
            <div className="p-6 rounded-3xl border border-border bg-background flex items-center gap-4">
               <div className="h-12 w-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                 <History className="h-6 w-6" />
               </div>
               <div>
                 <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Read</p>
                 <p className="text-xl font-black">{history.length} Chapters</p>
               </div>
            </div>
          </div>

          {/* Backup & Restore Section */}
          <section className="p-8 rounded-3xl border border-border bg-background">
            <div className="flex items-center gap-2 mb-6">
              <Database className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-black tracking-tight">Data Management</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Export your library and reading history to a JSON file. Use this to backup your data or move it to another device.
                </p>
                <Button onClick={handleExport} variant="outline" className="w-full rounded-xl font-bold gap-2">
                  <Download className="h-4 w-4" />
                  Export Data (JSON)
                </Button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Import data from a previously exported JSON file. This will overwrite your current library and history.
                </p>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="outline" className="w-full rounded-xl font-bold gap-2">
                    <Upload className="h-4 w-4" />
                    Import Data (JSON)
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* App Info */}
          <div className="flex justify-center items-center gap-8 py-8 opacity-50 grayscale">
            <div className="flex items-center gap-2">
               <Smartphone className="h-5 w-5" />
               <span className="text-xs font-bold uppercase tracking-widest">Mobile Optimized</span>
            </div>
            <div className="flex items-center gap-2">
               <Settings className="h-5 w-5" />
               <span className="text-xs font-bold uppercase tracking-widest">v1.0.0 Stable</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
