import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertOctagon, 
  Search, 
  Filter, 
  Download, 
  UserCheck, 
  BarChart3, 
  MapPin, 
  Sparkles, 
  Eye, 
  TrendingUp,
  Layers,
  ChevronRight,
  User,
  Wrench,
  ShieldAlert
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { CampusMap } from '../components/common/CampusMap';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend 
} from 'recharts';
import { Department, Priority, Status } from '../types';

export const AdminDashboard: React.FC = () => {
  const { 
    complaints, 
    buildings, 
    users, 
    setSelectedComplaintId, 
    setActiveTab, 
    assignStaff, 
    updateComplaintStatus,
    showToast 
  } = useApp();

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedBuilding, setSelectedBuilding] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [activeTableTab, setActiveTableTab] = useState<'all' | 'pending' | 'completed'>('all');

  // Quick Assignment Modal State
  const [assigningComplaintId, setAssigningComplaintId] = useState<string | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');

  // 1. Calculate KPI Metrics matching PDF page 5
  const openComplaints = complaints.filter(c => c.status !== 'Resolved').length;
  const resolvedComplaints = complaints.filter(c => c.status === 'Resolved').length;
  const criticalIssues = complaints.filter(c => c.priority === 'Critical' && c.status !== 'Resolved').length;
  const avgResolutionTime = '3.4 hrs';

  // 2. Prepare Recharts Data
  // (a) Complaints by Department
  const deptCounts: Record<string, number> = {
    'Electrical': 0,
    'Plumbing': 0,
    'Civil': 0,
    'IT': 0,
    'Housekeeping': 0,
    'Administration': 0
  };
  complaints.forEach(c => {
    if (deptCounts[c.department] !== undefined) {
      deptCounts[c.department]++;
    }
  });
  const deptChartData = Object.keys(deptCounts).map(dept => ({
    name: dept,
    count: deptCounts[dept]
  }));

  // (b) Complaints by Building
  const buildingCounts: Record<string, number> = {};
  buildings.forEach(b => { buildingCounts[b.name] = 0; });
  complaints.forEach(c => {
    const matchedBld = buildings.find(b => c.location.building.includes(b.name) || b.name.includes(c.location.building));
    const bName = matchedBld ? matchedBld.code : 'Other';
    buildingCounts[bName] = (buildingCounts[bName] || 0) + 1;
  });
  const buildingChartData = Object.keys(buildingCounts).map(b => ({
    building: b,
    count: buildingCounts[b]
  }));

  // (c) Complaints by Priority
  const priorityData = [
    { name: 'Critical', value: complaints.filter(c => c.priority === 'Critical').length, color: '#f43f5e' },
    { name: 'High', value: complaints.filter(c => c.priority === 'High').length, color: '#f97316' },
    { name: 'Medium', value: complaints.filter(c => c.priority === 'Medium').length, color: '#f59e0b' },
    { name: 'Low', value: complaints.filter(c => c.priority === 'Low').length, color: '#38bdf8' },
  ];

  // (d) Monthly / Weekly Trend Data
  const trendData = [
    { month: 'Apr', Reported: 12, Resolved: 11 },
    { month: 'May', Reported: 19, Resolved: 16 },
    { month: 'Jun', Reported: 15, Resolved: 14 },
    { month: 'Jul', Reported: 28, Resolved: 25 },
    { month: 'Aug (Current)', Reported: complaints.length + 8, Resolved: resolvedComplaints + 6 },
  ];

  // Colors for Department Chart
  const DEPT_COLORS = ['#38bdf8', '#818cf8', '#34d399', '#f472b6', '#fbbf24', '#a78bfa'];

  // 3. Filter Table Data
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = 
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.reportedBy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === 'All' || c.department === selectedDept;
    const matchesBld = selectedBuilding === 'All' || c.location.building.includes(selectedBuilding);
    const matchesPriority = selectedPriority === 'All' || c.priority === selectedPriority;
    const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;

    const matchesTab = 
      activeTableTab === 'all' ? true :
      activeTableTab === 'pending' ? c.status !== 'Resolved' :
      c.status === 'Resolved';

    return matchesSearch && matchesDept && matchesBld && matchesPriority && matchesStatus && matchesTab;
  });

  const staffUsers = users.filter(u => u.role === 'staff');

  const handleExportCSV = () => {
    const headers = ['Ticket ID', 'Title', 'Category', 'Department', 'Priority', 'Status', 'Building', 'Room', 'Reporter', 'Created At'];
    const rows = complaints.map(c => [
      c.id,
      `"${c.title.replace(/"/g, '""')}"`,
      c.category,
      c.department,
      c.priority,
      c.status,
      `"${c.location.building}"`,
      `"${c.location.room}"`,
      c.reportedBy.name,
      c.createdAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `campus_maintenance_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Export Generated', 'Campus maintenance CSV downloaded.', 'success');
  };

  const handleSaveStaffAssignment = () => {
    if (assigningComplaintId && selectedStaffId) {
      assignStaff(assigningComplaintId, selectedStaffId);
      setAssigningComplaintId(null);
      setSelectedStaffId('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
            Campus Infrastructure Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time analytics, AI triage dispatching, and department work orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-2 transition-all shadow-md"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export CSV Audit</span>
          </button>
        </div>
      </div>

      {/* 1. TOP CARDS matching PDF page 5: Open Complaints, Resolved, Critical Issues, Average Resolution Time */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Open Complaints</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold text-sky-400">{openComplaints}</div>
          <p className="text-[11px] text-slate-400">Needs staff action</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">{resolvedComplaints}</div>
          <p className="text-[11px] text-slate-400">Verified by technicians</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Critical Issues</span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold text-rose-400">{criticalIssues}</div>
          <p className="text-[11px] text-slate-400">Immediate hazard priority</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Avg Resolution Time</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">{avgResolutionTime}</div>
          <p className="text-[11px] text-slate-400">Campus benchmark SLA</p>
        </div>
      </div>

      {/* 2. RECHARTS ANALYTICS GRID matching PDF page 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Complaints by Department */}
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Complaints by Department</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">Workload Allocation</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptChartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {deptChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DEPT_COLORS[index % DEPT_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Complaints by Priority */}
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span>Complaints by Priority Level</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">AI Triage Severity</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                />
                <Legend 
                  formatter={(val) => <span className="text-xs text-slate-300 font-medium">{val}</span>} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Monthly Complaint Trends */}
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Monthly Complaint Trends & Resolution Velocity</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">Semester Trend</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }} />
                <Area type="monotone" dataKey="Reported" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#colorReported)" />
                <Area type="monotone" dataKey="Resolved" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" />
                <Legend formatter={(val) => <span className="text-xs text-slate-300 font-medium">{val}</span>} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Complaints by Building */}
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Building-wise Complaints</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">Campus GIS Spots</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={buildingChartData} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={11} allowDecimals={false} />
                <YAxis type="category" dataKey="building" stroke="#64748b" fontSize={11} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }} />
                <Bar dataKey="count" fill="#38bdf8" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE CAMPUS MAP INTEGRATION */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-400" />
              <span>Interactive Campus Maintenance Map</span>
            </h3>
            <p className="text-xs text-slate-400">
              Live geospatial pins indicating maintenance tickets and hazard intensity across facilities.
            </p>
          </div>
        </div>
        <CampusMap selectedBuildingFilter={selectedBuilding} />
      </div>

      {/* 4. COMPLAINT MANAGEMENT TABLES & MULTI-FILTERS matching PDF page 5 */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden space-y-5 p-5 sm:p-6">
        {/* Table Header & Scope Tabs */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Central Maintenance Register</h3>
            <p className="text-xs text-slate-400">Total {filteredComplaints.length} tickets match current filters</p>
          </div>

          {/* Table Scope Tabs: Latest / Pending / Completed matching PDF */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 self-start">
            <button
              onClick={() => setActiveTableTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTableTab === 'all' ? 'bg-cyan-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Latest ({complaints.length})
            </button>
            <button
              onClick={() => setActiveTableTab('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTableTab === 'pending' ? 'bg-cyan-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pending ({openComplaints})
            </button>
            <button
              onClick={() => setActiveTableTab('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTableTab === 'completed' ? 'bg-cyan-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Completed ({resolvedComplaints})
            </button>
          </div>
        </div>

        {/* Multi-Filters Filter Bar matching PDF page 5: Department, Building, Priority, Status, Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search ID, title, keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="All">All Departments</option>
            <option value="Electrical">Electrical</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Civil">Civil</option>
            <option value="IT">IT</option>
            <option value="Housekeeping">Housekeeping</option>
            <option value="Administration">Administration</option>
          </select>

          {/* Building Filter */}
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="All">All Buildings</option>
            {buildings.map(b => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="All">All Statuses</option>
            <option value="Reported">Reported</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        {/* Complaints Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[11px] bg-slate-900/50">
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Issue Description</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Assigned Staff</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-500">
                    No complaints match the specified search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => (
                  <tr 
                    key={c.id}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => {
                      setSelectedComplaintId(c.id);
                      setActiveTab('details');
                    }}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400 whitespace-nowrap">
                      {c.id}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                        {c.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        By {c.reportedBy.name} ({c.reportedBy.role})
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-indigo-300">
                      {c.department}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PriorityBadge priority={c.priority} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-300">
                      <div className="truncate max-w-[140px] font-medium">{c.location.building}</div>
                      <div className="text-[10px] text-slate-500">{c.location.room}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {c.assignedStaff ? (
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <img
                            src={c.assignedStaff.avatar}
                            alt={c.assignedStaff.name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="truncate max-w-[100px]">{c.assignedStaff.name}</span>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAssigningComplaintId(c.id);
                          }}
                          className="px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[11px] font-semibold hover:bg-cyan-500 hover:text-black transition-colors"
                        >
                          + Assign Staff
                        </button>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedComplaintId(c.id);
                          setActiveTab('details');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-black text-slate-300 text-xs font-semibold transition-all inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Staff Assignment Modal */}
      {assigningComplaintId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0d1627] border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-cyan-400" />
              <span>Assign Maintenance Staff to Ticket {assigningComplaintId}</span>
            </h3>
            <p className="text-xs text-slate-400">
              Select an authorized technician to dispatch for this maintenance task.
            </p>

            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="">-- Choose Staff Specialist --</option>
              {staffUsers.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} — {st.department} ({st.identifier})
                </option>
              ))}
            </select>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSaveStaffAssignment}
                disabled={!selectedStaffId}
                className="flex-1 py-2.5 rounded-xl bg-cyan-400 text-black text-xs font-bold hover:bg-cyan-300 disabled:opacity-40"
              >
                Confirm Dispatch
              </button>
              <button
                onClick={() => setAssigningComplaintId(null)}
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
