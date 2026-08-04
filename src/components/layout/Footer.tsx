import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Sparkles, Phone, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveTab, switchRole } = useApp();

  return (
    <footer className="border-t border-slate-800/80 bg-[#04060d] text-slate-400 text-xs mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-sky-400 text-black">
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-base text-white tracking-tight">
                Campus <span className="text-cyan-400">Guardian</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Next-generation AI-powered maintenance management platform designed for university campuses.
            </p>
            <div className="flex items-center gap-2 text-cyan-400 text-[11px] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multimodal Vision Triage Engine</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <button onClick={() => setActiveTab('landing')} className="hover:text-cyan-300 transition-colors">
                  Home & Overview
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('dashboard')} className="hover:text-cyan-300 transition-colors">
                  Role Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('report')} className="hover:text-cyan-300 transition-colors">
                  Report New Issue
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('map')} className="hover:text-cyan-300 transition-colors">
                  Campus Facility Map
                </button>
              </li>
            </ul>
          </div>

          {/* Role Portals */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Role Portals</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <button onClick={() => switchRole('student')} className="hover:text-cyan-300 transition-colors">
                  Student Portal
                </button>
              </li>
              <li>
                <button onClick={() => switchRole('teacher')} className="hover:text-emerald-300 transition-colors">
                  Faculty / Teacher Portal
                </button>
              </li>
              <li>
                <button onClick={() => switchRole('admin')} className="hover:text-rose-300 transition-colors">
                  Administrator Console
                </button>
              </li>
              <li>
                <button onClick={() => switchRole('staff')} className="hover:text-amber-300 transition-colors">
                  Maintenance Staff Board
                </button>
              </li>
            </ul>
          </div>

          {/* Emergency & Support */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Emergency Response</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              For live electrical hazards, active flooding, or structural danger, dispatch immediate campus security.
            </p>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <Phone className="w-3.5 h-3.5 text-rose-400" />
                <span>Control Room: +1 (800) 555-CAMPUS</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>facilities@campus.edu</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Campus Guardian AI. Built for Smart University Operations.</p>
          <div className="flex items-center gap-4">
            <span>Powered by Multimodal AI & OpenStreetMap</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
