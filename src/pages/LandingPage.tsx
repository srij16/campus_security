import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  Camera, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Building2, 
  Layers, 
  Zap, 
  CopyCheck, 
  ShieldAlert,
  Users,
  ChevronRight,
  LogIn
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';

export const LandingPage: React.FC = () => {
  const { setActiveTab, switchRole, complaints, setSelectedComplaintId } = useApp();

  const totalComplaints = complaints.length;
  const resolvedComplaints = complaints.filter((c: any) => c.status === 'Resolved').length;
  const resolutionRate = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 100;
  const inProgressComplaints = complaints.filter((c: any) => c.status === 'In Progress').length;
  const criticalComplaints = complaints.filter((c: any) => c.priority === 'Critical' && c.status !== 'Resolved').length;

  return (
    <div className="space-y-24 pb-12">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 pb-16 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/20 via-sky-600/15 to-indigo-600/20 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-6">
          {/* AI Banner Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-xs font-semibold shadow-[0_0_15px_rgba(56,189,248,0.2)] animate-pulse-slow">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Next-Gen Campus Infrastructure Intelligence</span>
          </div>

          {/* Main Title & Subtitle from PDF */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Campus Guardian
          </h1>

          <p className="text-lg sm:text-2xl text-slate-300 font-medium max-w-3xl mx-auto leading-relaxed">
            Making Campus Maintenance <span className="gradient-text-cyan font-bold">Smarter with AI</span>
          </p>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Replace scattered emails and manual registers with an intelligent, vision-driven management platform. Snap a photo — our AI auto-classifies, estimates priority, alerts staff, and tracks repairs to verified completion.
          </p>

          {/* Hero CTA Buttons matching PDF: Report Issue, Login, Learn More */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
            <button
              onClick={() => setActiveTab('report')}
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-400 to-sky-500 text-black hover:from-cyan-300 hover:to-sky-400 shadow-[0_0_25px_rgba(56,189,248,0.4)] flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-98"
            >
              <Camera className="w-4 h-4 stroke-[2.5]" />
              <span>Report Issue</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('login')}
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-slate-900/90 border border-slate-700 hover:border-slate-500 text-white hover:bg-slate-800 flex items-center gap-2 transition-all"
            >
              <LogIn className="w-4 h-4 text-cyan-400" />
              <span>Role Login</span>
            </button>

            <a
              href="#how-it-works"
              className="px-5 py-3.5 rounded-xl font-semibold text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              Learn More
            </a>
          </div>

          {/* Quick Role Jump Pill Row */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span className="text-slate-500 font-medium">Quick Demo Role Jump:</span>
            <button onClick={() => switchRole('student')} className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-cyan-500/20 hover:text-cyan-300 border border-slate-700/80 transition-colors">
              Student
            </button>
            <button onClick={() => switchRole('teacher')} className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-emerald-500/20 hover:text-emerald-300 border border-slate-700/80 transition-colors">
              Teacher
            </button>
            <button onClick={() => switchRole('admin')} className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-rose-500/20 hover:text-rose-300 border border-slate-700/80 transition-colors">
              Admin
            </button>
            <button onClick={() => switchRole('staff')} className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-700/80 transition-colors">
              Maintenance Staff
            </button>
          </div>
        </div>
      </section>

      {/* 2. LIVE STATISTICS TICKER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Total Tickets</span>
              <Building2 className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{totalComplaints}</div>
            <p className="text-[11px] text-slate-400">Campus infrastructure logs</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Resolution Rate</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-400">{resolutionRate}%</div>
            <p className="text-[11px] text-slate-400">{resolvedComplaints} closed successfully</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Avg Resolution Time</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-amber-400">3.4 hrs</div>
            <p className="text-[11px] text-slate-400">From AI triage to fix</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Active In-Progress</span>
              <Zap className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-3xl font-extrabold text-sky-400">{inProgressComplaints}</div>
            <p className="text-[11px] text-slate-400">{criticalComplaints} critical priority</p>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS INTERACTIVE VISUALIZER */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">End-to-End Workflow</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">How Campus Guardian Works</h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            From the moment an issue is noticed to the uploaded repair verification photo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {[
            {
              step: '01',
              title: 'Spot & Capture',
              desc: 'Student or Teacher uploads a photo of broken equipment, leaks, or electrical faults.',
              icon: Camera,
              color: 'text-cyan-400',
              borderColor: 'border-cyan-500/30'
            },
            {
              step: '02',
              title: 'AI Multi-Triage',
              desc: 'AI detects category, assigns responsible department, and calculates hazard priority.',
              icon: Cpu,
              color: 'text-indigo-400',
              borderColor: 'border-indigo-500/30'
            },
            {
              step: '03',
              title: 'Duplicate Check',
              desc: 'System detects if the issue was already logged in that classroom to prevent spam.',
              icon: CopyCheck,
              color: 'text-amber-400',
              borderColor: 'border-amber-500/30'
            },
            {
              step: '04',
              title: 'Staff Dispatched',
              desc: 'Department technicians receive assigned task alerts on their dedicated dashboard.',
              icon: Zap,
              color: 'text-purple-400',
              borderColor: 'border-purple-500/30'
            },
            {
              step: '05',
              title: 'Verified Resolution',
              desc: 'Staff uploads before/after repair photo. Reporter receives instant notification.',
              icon: CheckCircle2,
              color: 'text-emerald-400',
              borderColor: 'border-emerald-500/30'
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="glass-panel p-5 rounded-2xl border border-slate-800 relative hover:border-slate-600 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-slate-500">{item.step}</span>
                    <div className={`p-2.5 rounded-xl bg-slate-900 border ${item.borderColor}`}>
                      <Icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                  </div>
                  <h3 className="font-bold text-white text-base mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. KEY PLATFORM FEATURES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Intelligent Automation</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Built for University Scale</h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Comprehensive tools for students, faculty, administrative deans, and maintenance technicians.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3 glass-panel-hover">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 w-fit text-cyan-400">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Vision Auto-Classification</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Detects broken fans, water leaks, exposed live wires, projector faults, wall cracks, and overflowing dustbins in under 2 seconds with high precision.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3 glass-panel-hover">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 w-fit text-purple-400">
              <CopyCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Duplicate Detection Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Identifies active complaints logged in the same location and invites reporters to upvote rather than cluttering administrative queues with repeats.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3 glass-panel-hover">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 w-fit text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Dynamic Hazard Prioritization</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Exposed wires receive instant Critical badges; burst plumbing triggers High alerts; cosmetic scratches stay at Low priority for balanced workload.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3 glass-panel-hover">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 w-fit text-amber-400">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Department Auto-Routing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Directly queues tasks to Electrical, Plumbing, Civil, IT, Housekeeping, or Administration with zero human triage lag.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3 glass-panel-hover">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 w-fit text-emerald-400">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Campus Heatmap & GIS</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pinpoint trouble clusters across campus buildings and lecture halls on an interactive OpenStreetMap geospatial viewer.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3 glass-panel-hover">
            <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 w-fit text-sky-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Role-Tailored Portals</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Students track progress; teachers post remarks; admins monitor live Recharts metrics; technicians update repair photos directly.
            </p>
          </div>
        </div>
      </section>

      {/* 5. RECENT TICKETS LIVE TICKER PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">Recent Campus Reports</h3>
            <p className="text-xs text-slate-400">Live ticket pipeline across departments</p>
          </div>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
          >
            <span>View All Tickets</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {complaints.slice(0, 3).map((comp: any) => (
            <div
              key={comp.id}
              onClick={() => {
                setSelectedComplaintId(comp.id);
                setActiveTab('details');
              }}
              className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all space-y-3 group"
            >
              <div className="relative h-40 w-full rounded-xl overflow-hidden bg-slate-900">
                <img
                  src={comp.imageUrl}
                  alt={comp.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5">
                  <StatusBadge status={comp.status} size="sm" />
                </div>
                <div className="absolute top-2.5 right-2.5">
                  <PriorityBadge priority={comp.priority} size="sm" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="font-mono text-cyan-400">{comp.id}</span>
                  <span>{comp.location.building}</span>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                  {comp.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {comp.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. BOTTOM CALL TO ACTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-cyan-950/60 via-[#0f1d38] to-slate-900 border border-cyan-500/40 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-cyan-500/10 blur-3xl rounded-full" />
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Experience Smarter Campus Living Today
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Ready to log an issue or inspect administrative analytics? Test the full workflow now.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <button
              onClick={() => setActiveTab('report')}
              className="px-7 py-3.5 rounded-xl font-bold text-sm bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_25px_rgba(56,189,248,0.4)] flex items-center gap-2 transition-all"
            >
              <Camera className="w-4 h-4 stroke-[2.5]" />
              <span>Launch AI Issue Reporter</span>
            </button>
            <button
              onClick={() => setActiveTab('login')}
              className="px-7 py-3.5 rounded-xl font-bold text-sm bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white transition-all"
            >
              Login with Campus ID
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
