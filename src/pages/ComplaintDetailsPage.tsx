import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { Status } from '../types';
import { 
  ArrowLeft, 
  User, 
  Wrench, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Clock, 
  Image as ImageIcon, 
  Share2, 
  MessageSquare,
  ThumbsUp,
  Layers,
  Camera
} from 'lucide-react';

export const ComplaintDetailsPage: React.FC = () => {
  const { 
    selectedComplaintId, 
    complaints, 
    currentUser, 
    users, 
    updateComplaintStatus, 
    assignStaff, 
    addComment, 
    upvoteComplaint, 
    setActiveTab, 
    showToast 
  } = useApp();

  const [commentText, setCommentText] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [repairImageUrl, setRepairImageUrl] = useState('');
  const [repairNotes, setRepairNotes] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const complaint = complaints.find((c: any) => c.id === selectedComplaintId) || complaints[0];

  if (!complaint) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Ticket Not Found</h2>
        <button
          onClick={() => setActiveTab('dashboard')}
          className="px-4 py-2 rounded-xl bg-cyan-500 text-black text-xs font-bold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // List of maintenance staff eligible for assignment
  const staffUsers = users.filter((u: any) => u.role === 'staff');

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(complaint.id, commentText, currentUser.role === 'staff');
    setCommentText('');
  };

  const handleAssign = () => {
    if (!selectedStaffId) return;
    assignStaff(complaint.id, selectedStaffId);
  };

  const handleStatusTransition = (newStatus: Status) => {
    updateComplaintStatus(
      complaint.id, 
      newStatus, 
      undefined, 
      newStatus === 'Resolved' ? (repairImageUrl || 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=1000&q=80') : undefined,
      repairNotes
    );
    setIsUpdatingStatus(false);
  };

  const timelineSteps: { status: Status; label: string; icon: any }[] = [
    { status: 'Reported', label: 'Reported & AI Triaged', icon: Clock },
    { status: 'Assigned', label: 'Staff Dispatched', icon: User },
    { status: 'In Progress', label: 'Work In Progress', icon: Wrench },
    { status: 'Resolved', label: 'Resolved & Verified', icon: CheckCircle2 },
  ];

  const getStepIndex = (status: Status) => {
    switch (status) {
      case 'Reported': return 0;
      case 'Assigned': return 1;
      case 'In Progress': return 2;
      case 'Resolved': return 3;
      default: return 0;
    }
  };

  const currentStepIdx = getStepIndex(complaint.status);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Action Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-cyan-400">{complaint.id}</span>
              <StatusBadge status={complaint.status} size="md" />
              <PriorityBadge priority={complaint.priority} size="md" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
              {complaint.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => upvoteComplaint(complaint.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
              complaint.upvotedBy.includes(currentUser.id)
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>Support ({complaint.upvotes})</span>
          </button>

          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              showToast('Link Copied', 'Ticket reference URL copied to clipboard.', 'info');
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            title="Share Ticket"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. STATUS TIMELINE BAR matching PDF page 5 */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Status Lifecycle Timeline</span>
        </h3>

        <div className="relative pt-2 pb-2">
          {/* Progress Connecting Line */}
          <div className="absolute top-7 left-6 right-6 h-1 bg-slate-800 rounded-full z-0 hidden sm:block">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${(currentStepIdx / 3) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
            {timelineSteps.map((step, idx) => {
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              const StepIcon = step.icon;

              return (
                <div key={step.status} className="flex flex-col items-start sm:items-center text-left sm:text-center space-y-2">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all ${
                      isCurrent
                        ? 'bg-cyan-500 text-black border-cyan-300 shadow-[0_0_15px_#38bdf8] font-bold scale-110'
                        : isPast
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-slate-900 text-slate-500 border-slate-800'
                    }`}
                  >
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${isCurrent ? 'text-cyan-300' : isPast ? 'text-white' : 'text-slate-500'}`}>
                      {step.status}
                    </h4>
                    <p className="text-[10px] text-slate-400 hidden sm:block">{step.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Photos, AI Summary, Details (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Photos: Before & After Repair Viewer */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span>Before & After Repair Images</span>
              </h3>
              {complaint.repairImageUrl ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                  Verified Fix Attached
                </span>
              ) : (
                <span className="text-[11px] text-slate-500">Repair in progress</span>
              )}
            </div>

            <div className={`grid ${complaint.repairImageUrl ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-4`}>
              {/* Original "Before" Image */}
              <div className="space-y-1.5">
                <div className="relative h-60 w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
                  <img
                    src={complaint.imageUrl}
                    alt="Reported Issue Before"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-sm text-[10px] font-bold text-rose-300 border border-rose-500/30">
                    BEFORE (Initial Report)
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 text-center">Uploaded by {complaint.reportedBy.name}</p>
              </div>

              {/* Verified "After" Image (If resolved or available) */}
              {complaint.repairImageUrl && (
                <div className="space-y-1.5">
                  <div className="relative h-60 w-full rounded-2xl overflow-hidden bg-slate-900 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                    <img
                      src={complaint.repairImageUrl}
                      alt="Resolved Fix After"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-sm text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                      AFTER (Maintenance Fixed)
                    </div>
                  </div>
                  <p className="text-[11px] text-emerald-400 text-center font-medium">
                    Verified by {complaint.assignedStaff?.name || 'Technician'}
                  </p>
                </div>
              )}
            </div>

            {complaint.repairNotes && (
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
                <span className="font-bold uppercase text-[10px] text-emerald-400">Technician Resolution Log:</span>
                <p className="italic">"{complaint.repairNotes}"</p>
              </div>
            )}
          </div>

          {/* AI Analysis Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-cyan-950/30 via-slate-900 to-indigo-950/20 border border-cyan-500/30 space-y-3">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Standard AI Assessment Protocol</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic bg-black/40 p-3.5 rounded-xl border border-slate-800">
              "{complaint.aiSummary}"
            </p>
          </div>

          {/* Full Audit Activity History */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Audit Log & Event History</span>
            </h3>

            <div className="space-y-3">
              {complaint.timeline.map((ev: any, i: number) => (
                <div key={ev.id || i} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 shrink-0 text-cyan-400">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-white">{ev.title}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-400 mt-0.5 leading-relaxed">{ev.description}</p>
                    <div className="mt-1 text-[10px] text-slate-500 flex items-center gap-2">
                      <span>Actor: <strong className="text-slate-300">{ev.actorName}</strong> ({ev.actorRole})</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Metadata, Staff Assignment, Status Controls, Comments (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Metadata Card */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Ticket Specifications
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Category:</span>
                <span className="font-semibold text-white">{complaint.category}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Department:</span>
                <span className="font-semibold text-indigo-300">{complaint.department}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Building:</span>
                <span className="font-semibold text-white">{complaint.location.building}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Room / Floor:</span>
                <span className="font-semibold text-white">{complaint.location.room} ({complaint.location.floor})</span>
              </div>
              {complaint.location.specificSpot && (
                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Landmark Spot:</span>
                  <span className="font-semibold text-white">{complaint.location.specificSpot}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Reported By:</span>
                <span className="font-semibold text-cyan-300">{complaint.reportedBy.name} ({complaint.reportedBy.role})</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-400">Reported At:</span>
                <span className="text-slate-300">{new Date(complaint.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Staff Assignment Widget matching PDF page 5 */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Assigned Maintenance Staff</span>
              {complaint.assignedStaff && (
                <span className="text-[10px] text-emerald-400 font-semibold">Active</span>
              )}
            </h3>

            {complaint.assignedStaff ? (
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={complaint.assignedStaff.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'}
                    alt={complaint.assignedStaff.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-600"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">{complaint.assignedStaff.name}</h4>
                    <span className="text-[10px] text-slate-400">{complaint.assignedStaff.department} Specialist</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  Assigned {new Date(complaint.assignedStaff.assignedAt).toLocaleDateString()}
                </span>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-dashed border-slate-700 text-center space-y-1">
                <p className="text-xs text-amber-400 font-medium">No technician assigned yet</p>
                <p className="text-[11px] text-slate-500">Admin can assign department staff below</p>
              </div>
            )}

            {/* Admin / Staff Reassignment Dropdown */}
            {(currentUser.role === 'admin' || currentUser.role === 'staff') && (
              <div className="pt-2 space-y-2">
                <div className="flex gap-2">
                  <select
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="">-- Choose Staff Member --</option>
                    {staffUsers.map((st: any) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.department})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssign}
                    disabled={!selectedStaffId}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-400 text-black hover:bg-cyan-300 disabled:opacity-40 transition-colors"
                  >
                    Assign
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Status Changer Actions (Admin & Staff) */}
          {(currentUser.role === 'admin' || currentUser.role === 'staff') && (
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Update Complaint Status</span>
                <span className="text-[10px] text-cyan-400 font-mono">Role: {currentUser.role}</span>
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleStatusTransition('In Progress')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    complaint.status === 'In Progress'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500/40'
                  }`}
                >
                  Mark In Progress
                </button>

                <button
                  onClick={() => setIsUpdatingStatus(true)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    complaint.status === 'Resolved'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500 hover:text-black'
                  }`}
                >
                  Mark as Resolved
                </button>
              </div>

              {/* Resolution Photo Attachment Modal / Box */}
              {isUpdatingStatus && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-3 animate-fadeIn">
                  <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Upload Repair Proof Image</span>
                  </h4>
                  <input
                    type="text"
                    placeholder="Repair photo URL (or leave default fix image)"
                    value={repairImageUrl}
                    onChange={(e) => setRepairImageUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
                  />
                  <textarea
                    rows={2}
                    placeholder="Resolution notes (e.g. Replaced switch panel and tested)..."
                    value={repairNotes}
                    onChange={(e) => setRepairNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusTransition('Resolved')}
                      className="flex-1 py-2 rounded-xl bg-emerald-400 text-black text-xs font-bold hover:bg-emerald-300"
                    >
                      Confirm Resolution
                    </button>
                    <button
                      onClick={() => setIsUpdatingStatus(false)}
                      className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Comments & Discussion Section matching PDF page 1, 5 */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span>Comments & Faculty Remarks</span>
              </span>
              <span className="text-slate-400 text-xs">({complaint.comments.length})</span>
            </h3>

            {/* Comments Stream */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {complaint.comments.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No comments posted yet. Start the discussion below.</p>
              ) : (
                complaint.comments.map((comm: any) => (
                  <div
                    key={comm.id}
                    className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                      comm.isStaffUpdate
                        ? 'bg-amber-950/20 border-amber-500/30'
                        : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={comm.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                          alt={comm.userName}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="font-bold text-white">{comm.userName}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase">
                          {comm.userRole}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(comm.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed pl-7">{comm.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Input Form */}
            <form onSubmit={handleSendComment} className="pt-2 flex gap-2">
              <input
                type="text"
                placeholder={`Comment as ${currentUser.name} (${currentUser.role})...`}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-cyan-400 text-black hover:bg-cyan-300 font-bold transition-colors"
                title="Send Comment"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
