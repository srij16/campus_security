import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { 
  GraduationCap, 
  BookOpen, 
  ShieldAlert, 
  Wrench, 
  ArrowRight, 
  Lock, 
  Mail, 
  ShieldCheck, 
  CheckCircle2
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { switchRole, users, setCurrentUser, setActiveTab } = useApp();
  const [selectedRole, setSelectedRole] = useState<Role>('student');
  const [emailInput, setEmailInput] = useState('alex.rivera@campus.edu');
  const [passwordInput, setPasswordInput] = useState('••••••••••••');

  const roleOptions: {
    role: Role;
    title: string;
    description: string;
    icon: any;
    color: string;
    borderColor: string;
    bgHover: string;
    defaultUserEmail: string;
    features: string[];
  }[] = [
    {
      role: 'student',
      title: 'Student Portal',
      description: 'Report dorm, lab, or campus issues, track live status & receive instant alerts.',
      icon: GraduationCap,
      color: 'text-cyan-400',
      borderColor: 'border-cyan-500/40',
      bgHover: 'hover:border-cyan-400 hover:bg-cyan-950/20',
      defaultUserEmail: 'alex.rivera@campus.edu',
      features: ['Upload issue photos', 'Live ticket tracker', 'Duplicate alert support']
    },
    {
      role: 'teacher',
      title: 'Teacher / Faculty',
      description: 'Report classroom AV & lecture hall defects, add official faculty remarks & updates.',
      icon: BookOpen,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/40',
      bgHover: 'hover:border-emerald-400 hover:bg-emerald-950/20',
      defaultUserEmail: 'd.sharma@campus.edu',
      features: ['Classroom priority queue', 'Direct faculty commentary', 'Audit logs']
    },
    {
      role: 'admin',
      title: 'Administrator',
      description: 'Campus-wide operations, dispatch departments, analyze Recharts metrics & manage staff.',
      icon: ShieldAlert,
      color: 'text-rose-400',
      borderColor: 'border-rose-500/40',
      bgHover: 'hover:border-rose-400 hover:bg-rose-950/20',
      defaultUserEmail: 'admin.vance@campus.edu',
      features: ['Staff dispatch console', 'Live campus analytics', 'Emergency broadcast']
    },
    {
      role: 'staff',
      title: 'Maintenance Staff',
      description: 'Technician task board, update work in progress, and upload repair proof photos.',
      icon: Wrench,
      color: 'text-amber-400',
      borderColor: 'border-amber-500/40',
      bgHover: 'hover:border-amber-400 hover:bg-amber-950/20',
      defaultUserEmail: 'm.cole@maintenance.campus.edu',
      features: ['Assigned task queue', 'Before/After repair photos', 'Status transitions']
    }
  ];

  const handleRoleCardClick = (role: Role, defaultEmail: string) => {
    setSelectedRole(role);
    setEmailInput(defaultEmail);
  };

  const handleQuickLogin = (role: Role) => {
    switchRole(role);
    setActiveTab('dashboard');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = users.find((u: any) => u.email.toLowerCase() === emailInput.toLowerCase()) || users.find((u: any) => u.role === selectedRole);
    if (matched) {
      setCurrentUser(matched);
      setActiveTab('dashboard');
    } else {
      switchRole(selectedRole);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Unified Campus Authentication</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Sign In to Campus Guardian
        </h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Choose your university role below for 1-click test authentication or enter your campus credentials.
        </p>
      </div>

      {/* Role Selection Grid matching PDF page 4 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Select Your Role
          </h2>
          <span className="text-xs text-cyan-400 font-medium">Click any card to load credentials</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {roleOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedRole === opt.role;
            return (
              <div
                key={opt.role}
                onClick={() => handleRoleCardClick(opt.role, opt.defaultUserEmail)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? `bg-slate-900/90 ${opt.borderColor} shadow-[0_0_20px_rgba(56,189,248,0.2)] ring-1 ring-cyan-400/50`
                    : `bg-slate-900/40 border-slate-800 ${opt.bgHover}`
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl bg-slate-800 border border-slate-700 ${opt.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-base">{opt.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{opt.description}</p>
                  </div>

                  <div className="pt-2 space-y-1">
                    {opt.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                        <CheckCircle2 className="w-3 h-3 text-cyan-400/70 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickLogin(opt.role);
                    }}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span>Instant Login</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Direct Credentials Login Box */}
      <div className="max-w-md mx-auto glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
        <div className="text-center space-y-1">
          <h3 className="font-bold text-white text-base">Campus Single Sign-On</h3>
          <p className="text-xs text-slate-400">Authenticated via University Identity Gateway</p>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">University Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                placeholder="name@campus.edu"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <span className="text-[11px] text-cyan-400 cursor-pointer hover:underline">Forgot?</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-bold text-xs bg-cyan-400 text-black border-2 border-black shadow-[3px_3px_0px_#000] hover:bg-cyan-300 transition-all flex items-center justify-center gap-2"
          >
            <span>Sign In to {selectedRole.toUpperCase()} Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-[11px] text-slate-500">
            Protected with End-to-End Encryption & AI Role-Based Access Control.
          </p>
        </div>
      </div>
    </div>
  );
};
