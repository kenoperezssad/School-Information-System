// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Lock, Mail, Eye, EyeOff, Shield, CheckCircle2, BarChart3, Zap, Globe, Award } from 'lucide-react';

const FEATURES = [
  { icon: Shield,       title: 'Role-Based Access Control',    desc: 'Granular permissions for 9 distinct user roles â€” from Students to Administrators' },
  { icon: BarChart3,    title: 'Real-Time Analytics Dashboard', desc: 'Live enrollment stats, GPA distributions, financial reports, and attendance heatmaps' },
  { icon: CheckCircle2, title: 'Secure & Encrypted Platform',   desc: 'JWT authentication, audit logs, and ISO 9001:2015-compliant data handling' },
];

const DEMO_ACCOUNTS = [
  { role: 'Super Admin',  email: 'admin@school.edu'      },
  { role: 'Registrar',    email: 'registrar@school.edu'  },
  { role: 'Teacher',      email: 'faculty@school.edu'    },
  { role: 'Student',      email: 'student@school.edu'    },
  { role: 'Parent',       email: 'parent@school.edu'     },
  { role: 'Accountant',   email: 'accountant@school.edu' },
  { role: 'Librarian',    email: 'librarian@school.edu'  },
  { role: 'Nurse',        email: 'nurse@school.edu'      },
  { role: 'Guidance',     email: 'guidance@school.edu'   },
];

export const LoginPage = () => {
  const [email, setEmail]               = useState('admin@school.edu');
  const [password, setPassword]         = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [mounted, setMounted]           = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* â”€â”€ LEFT PANEL â€” Deep Navy â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div
        className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col"
        style={{ background: 'linear-gradient(160deg, #060D1A 0%, #0A1628 40%, #0F2258 75%, #132E72 100%)' }}
      >
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 25% 65%, rgba(212,168,23,0.08) 0%, transparent 65%)' }}
        />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        {/* Gold top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px]"
             style={{ background: 'linear-gradient(90deg, transparent, #D4A817, transparent)' }} />

        <div className="relative z-10 flex flex-col h-full px-12 py-14">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(212,168,23,0.15)', border: '1px solid rgba(212,168,23,0.30)' }}
            >
              <GraduationCap className="w-6 h-6" style={{ color: '#D4A817' }} />
            </div>
            <div>
              <p className="text-white font-extrabold text-sm tracking-widest uppercase">ApexSIS</p>
              <p className="text-[11px] font-medium" style={{ color: 'rgba(212,168,23,0.55)' }}>Enterprise Edition</p>
            </div>
          </div>

          {/* Headline */}
          <div className="mt-auto mb-auto pt-16">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{ background: 'rgba(212,168,23,0.10)', color: 'rgba(212,168,23,0.85)', border: '1px solid rgba(212,168,23,0.20)' }}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Academic Year 2026â€“2027</span>
            </div>

            <h1 className="text-5xl font-extrabold text-white leading-[1.1] mb-4">
              Smart Campus,<br />
              <span style={{ color: 'rgba(255,255,255,0.55)' }}>Smarter Management</span>
            </h1>
            <p className="text-base leading-relaxed max-w-sm mb-10" style={{ color: 'rgba(255,255,255,0.40)' }}>
              A unified school information platform for the modern Philippine campus â€”
              built for CHED compliance, designed for everyone.
            </p>

            <div className="space-y-5">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(212,168,23,0.10)', border: '1px solid rgba(212,168,23,0.18)' }}
                  >
                    <Icon style={{ width: '1.1rem', height: '1.1rem', color: '#D4A817' }} />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{title}</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.38)' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            {[{ icon: Globe, label: 'ISO 9001:2015 Certified' }, { icon: Award, label: 'CHED Recognized' }].map(({ icon: I, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.28)' }}>
                <I className="w-3.5 h-3.5" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* â”€â”€ RIGHT PANEL â€” White â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 bg-white dark:bg-gray-950 relative overflow-hidden">
        {/* Soft navy blush top-right */}
        <div
          className="absolute top-0 right-0 w-72 h-72 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"
          style={{ background: 'rgba(10,22,40,0.03)' }}
        />

        <div
          className="w-full max-w-sm relative z-10"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(16px)', transition: 'opacity 0.35s ease, transform 0.35s ease' }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, #0F2258, #132E72)' }}>
              <GraduationCap style={{ width: '1.3rem', height: '1.3rem', color: '#D4A817' }} />
            </div>
            <div>
              <p className="font-extrabold text-sm text-gray-900 dark:text-white">ApexSIS Enterprise</p>
              <p className="text-[11px] text-gray-400">School Information System</p>
            </div>
          </div>

          {/* Navy-gold accent rule */}
          <div className="w-8 h-1 rounded-full mb-6"
               style={{ background: 'linear-gradient(90deg, #132E72, #D4A817)' }} />

          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Welcome back</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">Sign in to your institutional account to continue</p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-start gap-2">
              <span className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">!</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                <input
                  type="text" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="yourname@school.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'} required value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                />
                <button type="button" tabIndex={-1} onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit â€” Navy */}
            <button
              type="submit" disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #0F2258, #132E72)', boxShadow: '0 4px 16px rgba(10,22,40,0.28)' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'linear-gradient(135deg, #132E72, #1A3F8F)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #0F2258, #132E72)'; }}
            >
              {loading ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg><span>Authenticatingâ€¦</span></>
              ) : (
                <><Shield className="w-4 h-4" /><span>Sign In to Portal</span></>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-7 pt-6 border-t border-gray-100 dark:border-gray-800">
            <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Quick Demo Access</p>
            <div className="grid grid-cols-3 gap-1.5">
              {DEMO_ACCOUNTS.map(item => (
                <button
                  key={item.role} type="button"
                  onClick={() => { setEmail(item.email); setPassword('Admin@123'); setError(''); }}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-center transition-all hover:scale-105 active:scale-95"
                  style={email === item.email
                    ? { background: 'linear-gradient(135deg, #0F2258, #132E72)', color: '#D4A817' }
                    : { background: '#f3f4f6', color: '#4B5563' }
                  }
                >
                  {item.role}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-3">
              Password: <code className="font-mono text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">Admin@123</code>
            </p>
          </div>

          <p className="text-center text-[11px] text-gray-400 mt-8">
            Â© 2026 Apex State University Â· ApexSIS Enterprise
          </p>
        </div>
      </div>
    </div>
  );
};



