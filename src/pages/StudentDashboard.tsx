import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  PlusCircle, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ThumbsUp, 
  Sparkles, 
  Building2, 
  MessageSquare,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';

export const StudentDashboard: React.FC = () => {
  const { 
    currentUser, 
    complaints, 
    setActiveTab, 
    setSelectedComplaintId, 
    upvoteComplaint
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [viewScope, setViewScope] = useState<'my' | 'all'>('my');

  // Filter complaints based on role, scope, and filters
  const myComplaints = complaints.filter((c: any) => c.reportedBy.id === currentUser.id);
  const baseList = viewScope === 'my' ? myComplaints : complaints;

  const filteredComplaints = baseList.filter((c: any) => {
    const matchesSearch = 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || c.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesDept = departmentFilter === 'all' || c.department.toLowerCase() === departmentFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesDept;
  });

  // Calculate KPIs for Current User
  const totalCount = myComplaints.length;
  const pendingCount = myComplaints.filter((c: any) => c.status === 'Reported' || c.status === 'Assigned').length;
  const inProgressCount = myComplaints.filter((c: any) => c.status === 'In Progress').length;
  const resolvedCount = myComplaints.filter((c: any) => c.status === 'Resolved').length;

  const handleTicketClick = (id: string) => {
    setSelectedComplaintId(id);
    setActiveTab('details');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="capitalize">{currentUser.role} Portal Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, {currentUser.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Track your reported campus tickets, check maintenance technician progress in real-time, or submit a new AI-analyzed maintenance issue.
          </p>
        </div>

        {/* Quick Report Button from PDF */}
        <div className="flex flex-wrap gap-3 relative z-10 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('report')}
            className="flex-1 sm:flex-none px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm bg-cyan-400 text-black border-2 border-black shadow-[3px_3px_0px_#000] hover:bg-cyan-300 flex items-center justify-center gap-2 transition-all"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>Report New Issue</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className="px-4 py-3.5 rounded-2xl font-semibold text-xs bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-all"
          >
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span>Campus Map</span>
          </button>
        </div>
      </div>

      {/* KPI Cards matching PDF page 4: Total Complaints, Pending, Resolved */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Reported</span>
            <AlertCircle className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{totalCount}</div>
          <p className="text-[11px] text-slate-400">By your profile</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold text-sky-400">{pendingCount}</div>
          <p className="text-[11px] text-slate-400">Awaiting dispatch</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>In Progress</span>
            <RefreshCw className="w-4 h-4 text-amber-400 animate-spin-slow" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">{inProgressCount}</div>
          <p className="text-[11px] text-slate-400">Technician on site</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">{resolvedCount}</div>
          <p className="text-[11px] text-slate-400">Fix verified</p>
        </div>
      </div>

      {/* Main Complaints List & Control Bar */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden space-y-4 p-5 sm:p-6">
        {/* Top Control Filter Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          {/* Scope Toggle: My Reports vs All Campus Reports */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewScope('my')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewScope === 'my'
                  ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(56,189,248,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              My Submitted Issues ({myComplaints.length})
            </button>
            <button
              onClick={() => setViewScope('all')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewScope === 'all'
                  ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(56,189,248,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Campus Feed ({complaints.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by ID, classroom, category, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Status & Dept Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Statuses</option>
              <option value="reported">Reported</option>
              <option value="assigned">Assigned</option>
              <option value="in progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Departments</option>
              <option value="electrical">Electrical</option>
              <option value="plumbing">Plumbing</option>
              <option value="civil">Civil</option>
              <option value="it">IT</option>
              <option value="housekeeping">Housekeeping</option>
              <option value="administration">Administration</option>
            </select>
          </div>
        </div>

        {/* Complaints Grid/List */}
        {filteredComplaints.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-3">
            <AlertCircle className="w-12 h-12 mx-auto opacity-30 text-cyan-400" />
            <p className="text-sm font-semibold text-slate-400">No maintenance tickets found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try modifying your filters or click the button below to report a new issue.
            </p>
            <button
              onClick={() => setActiveTab('report')}
              className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold hover:bg-cyan-500 hover:text-black transition-all"
            >
              + Report Campus Issue
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {filteredComplaints.map((comp: any) => (
              <div
                key={comp.id}
                onClick={() => handleTicketClick(comp.id)}
                className="glass-panel rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer overflow-hidden group flex flex-col justify-between"
              >
                <div>
                  {/* Photo & Badges */}
                  <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
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
                    {comp.confidenceScore && (
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm border border-white/10 text-[10px] text-cyan-300 font-mono">
                        AI Conf: {comp.confidenceScore}%
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-mono text-cyan-400 font-bold">{comp.id}</span>
                      <span className="text-[11px]">{new Date(comp.createdAt).toLocaleDateString()}</span>
                    </div>

                    <h3 className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {comp.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {comp.description}
                    </p>

                    <div className="pt-2 flex items-center gap-1.5 text-xs text-slate-300">
                      <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{comp.location.building} • {comp.location.room}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Bar */}
                <div className="px-4 py-3 bg-slate-900/60 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        upvoteComplaint(comp.id);
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors ${
                        comp.upvotedBy.includes(currentUser.id)
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                      title="Support / Upvote this issue"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{comp.upvotes}</span>
                    </button>

                    {comp.comments.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-slate-400 text-[11px]">
                        <MessageSquare className="w-3 h-3 text-slate-500" />
                        {comp.comments.length}
                      </span>
                    )}
                  </div>

                  <span className="text-cyan-400 group-hover:text-cyan-300 font-semibold inline-flex items-center gap-1 text-xs">
                    Details <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
