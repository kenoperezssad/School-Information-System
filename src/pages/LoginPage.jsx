// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { GraduationCap, Lock, Mail, Shield, Sparkles } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('admin@school.edu');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { role: 'Super Admin', email: 'admin@school.edu' },
    { role: 'Registrar', email: 'registrar@school.edu' },
    { role: 'Faculty', email: 'faculty@school.edu' },
    { role: 'Student', email: 'student@school.edu' },
    { role: 'Parent', email: 'parent@school.edu' },
    { role: 'Accountant', email: 'accountant@school.edu' },
    { role: 'Librarian', email: 'librarian@school.edu' },
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 relative overflow-hidden">
      {/* Dynamic Background Glow Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/40 mb-4 ring-8 ring-white/10">
            <GraduationCap className="w-9 h-9" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            ApexSIS Enterprise
          </h1>
          <p className="text-sm text-indigo-200/70 mt-1.5 font-medium">
            Next-Generation School Information & Management System
          </p>
        </div>

        {/* Login Glass Card */}
        <GlassCard className="p-8 sm:p-10 !bg-slate-900/80 !border-white/10 backdrop-blur-2xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Institutional Email or Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. admin@school.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full py-3 mt-2 text-sm font-bold shadow-lg shadow-indigo-600/30"
            >
              Sign In to Campus Portal
            </Button>
          </form>

          {/* Quick Demo Login Chips */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Instant Demo Accounts</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {demoAccounts.map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => {
                    setEmail(item.email);
                    setPassword('Admin@123');
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/90 text-slate-300 hover:text-white hover:bg-indigo-600/40 border border-slate-700 hover:border-indigo-500/50 transition-colors"
                >
                  {item.role}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Default password for all seeded demo users is <code className="text-indigo-400 bg-slate-800 px-1 py-0.5 rounded">Admin@123</code>
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
