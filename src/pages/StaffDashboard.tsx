import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Wrench, 
  Clock, 
  CheckCircle2, 
  Camera, 
  Building2, 
  Eye
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';

export const StaffDashboard: React.FC = () => {
  const { 
    currentUser, 
    complaints, 
    updateComplaintStatus, 
    setSelectedComplaintId, 
    setActiveTab 
  } = useApp();

  const [filterTab, setFilterTab] = useState<'all' | 'in_progress' | 'assigned' | 'resolved'>('all');
  const [resolvingComplaintId, setResolvingComplaintId] = useState<string | null>(null);
  const [repairImageUrl, setRepairImageUrl] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Assigned to current maintenance staff member (or all if mock testing)
  const myAssignedTasks = complaints.filter((c: any) => 
    c.assignedStaff?.id === currentUser.id || c.department === currentUser.department
  );

  const filteredTasks = myAssignedTasks.filter((c: any) => {
    if (filterTab === 'in_progress') return c.status === 'In Progress';
    if (filterTab === 'assigned') return c.status === 'Assigned' || c.status === 'Reported';
    if (filterTab === 'resolved') return c.status === 'Resolved';
    return true;
  });

  const totalAssigned = myAssignedTasks.length;
  const activeCount = myAssignedTasks.filter((c: any) => c.status === 'In Progress' || c.status === 'Assigned').length;
  const resolvedCount = myAssignedTasks.filter((c: any) => c.status === 'Resolved').length;

  const handleStartWork = (id: string) => {
    updateComplaintStatus(id, 'In Progress');
  };

  const handleOpenResolveModal = (id: string) => {
    setResolvingComplaintId(id);
    setRepairImageUrl('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80');
    setResolutionNotes('Inspection completed and repair verified according to safety checklist.');
  };

  const handleConfirmResolution = () => {
    if (!resolvingComplaintId) return;
    updateComplaintStatus(resolvingComplaintId, 'Resolved', undefined, repairImageUrl, resolutionNotes);
    setResolvingComplaintId(null);
    setRepairImageUrl('');
    setResolutionNotes('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span>Field Maintenance Technician Board</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome, {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {currentUser.department} Department • ID: <span className="font-mono text-cyan-400">{currentUser.identifier}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('map')}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-2 transition-all"
          >
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span>Facility Map</span>
          </button>
        </div>
      </div>

      {/* Technician KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Assigned Jobs</span>
            <Wrench className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{totalAssigned}</div>
          <p className="text-[11px] text-slate-400">In your specialty queue</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active & In Progress</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">{activeCount}</div>
          <p className="text-[11px] text-slate-400">Requires on-site attention</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Repairs Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">{resolvedCount}</div>
          <p className="text-[11px] text-slate-400">Fixed with photo verification</p>
        </div>
      </div>

      {/* Task Queue Tabs & Grid */}
      <div className="glass-panel rounded-3xl border border-slate-800 p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Technician Work Orders</h3>
            <p className="text-xs text-slate-400">Manage repair execution and submit proof of fix</p>
          </div>

          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 self-start">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterTab === 'all' ? 'bg-amber-400 text-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Tasks ({totalAssigned})
            </button>
            <button
              onClick={() => setFilterTab('in_progress')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterTab === 'in_progress' ? 'bg-amber-400 text-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Active Work ({activeCount})
            </button>
            <button
              onClick={() => setFilterTab('resolved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterTab === 'resolved' ? 'bg-amber-400 text-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Resolved ({resolvedCount})
            </button>
          </div>
        </div>

        {/* Task Cards Grid */}
        {filteredTasks.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 opacity-40" />
            <p className="text-xs font-semibold text-slate-400">No tasks in this view</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((t: any) => (
              <div
                key={t.id}
                className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-3">
                  <div className="relative h-40 w-full rounded-xl overflow-hidden bg-slate-900">
                    <img
                      src={t.imageUrl}
                      alt={t.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <StatusBadge status={t.status} size="sm" />
                    </div>
                    <div className="absolute top-2.5 right-2.5">
                      <PriorityBadge priority={t.priority} size="sm" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span className="font-mono text-cyan-400 font-bold">{t.id}</span>
                      <span>{t.location.building}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                      {t.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>
                    <div className="mt-2 text-xs text-slate-300 font-medium flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{t.location.room} ({t.location.floor})</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedComplaintId(t.id);
                        setActiveTab('details');
                      }}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ticket Details</span>
                    </button>
                  </div>

                  {/* Action Buttons: In Progress vs Resolve Photo */}
                  <div className="grid grid-cols-2 gap-2">
                    {t.status !== 'In Progress' && t.status !== 'Resolved' && (
                      <button
                        onClick={() => handleStartWork(t.id)}
                        className="col-span-2 py-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-400 hover:text-black transition-all"
                      >
                        Start Work On-Site
                      </button>
                    )}

                    {t.status === 'In Progress' && (
                      <button
                        onClick={() => handleOpenResolveModal(t.id)}
                        className="col-span-2 py-2 rounded-xl bg-emerald-400 text-black text-xs font-bold hover:bg-emerald-300 transition-all flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Upload Fix Proof</span>
                      </button>
                    )}

                    {t.status === 'Resolved' && (
                      <div className="col-span-2 py-1.5 text-center text-xs font-semibold text-emerald-400 bg-emerald-950/30 rounded-xl border border-emerald-500/20">
                        ✓ Repair Completed & Verified
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Repair Proof Modal */}
      {resolvingComplaintId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0c1526] border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-400" />
                <span>Submit Proof of Completed Repair</span>
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Attach the after-repair photo for ticket <span className="font-mono text-cyan-400 font-bold">{resolvingComplaintId}</span>. This will be visible on the student/faculty lifecycle timeline.
            </p>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Verified Repair Image URL</label>
                <input
                  type="text"
                  value={repairImageUrl}
                  onChange={(e) => setRepairImageUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              {repairImageUrl && (
                <div className="relative h-36 w-full rounded-xl overflow-hidden border border-slate-700">
                  <img
                    src={repairImageUrl}
                    alt="Repair proof preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-emerald-300">
                    Fix Photo Preview
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Resolution Commentary / Actions Taken</label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleConfirmResolution}
                className="flex-1 py-2.5 rounded-xl bg-emerald-400 text-black text-xs font-bold hover:bg-emerald-300"
              >
                Confirm & Mark Resolved
              </button>
              <button
                onClick={() => setResolvingComplaintId(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
