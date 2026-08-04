import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CampusMap } from '../components/common/CampusMap';
import { 
  MapPin, 
  Building2, 
  Filter, 
  Layers, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2,
  Clock
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';

export const CampusMapPage: React.FC = () => {
  const { buildings, complaints, setSelectedComplaintId, setActiveTab } = useApp();
  const [selectedBld, setSelectedBld] = useState('All');

  const totalOpen = complaints.filter(c => c.status !== 'Resolved').length;
  const criticalCount = complaints.filter(c => c.priority === 'Critical' && c.status !== 'Resolved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>Geospatial Incident Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Campus Infrastructure Map & Heatmap
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Interactive OpenStreetMap viewer displaying reported maintenance issues across all university blocks.
          </p>
        </div>

        {/* Building Filter Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Focus Facility:</span>
          <select
            value={selectedBld}
            onChange={(e) => setSelectedBld(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="All">All Campus Facilities</option>
            {buildings.map(b => (
              <option key={b.id} value={b.name}>{b.name} ({b.code})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Map Widget */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4">
        <CampusMap selectedBuildingFilter={selectedBld} />
      </div>

      {/* Facility Quick Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {buildings.map((b) => {
          const bldComplaints = complaints.filter(c => c.location.building.includes(b.name) || b.name.includes(c.location.building));
          const openInBld = bldComplaints.filter(c => c.status !== 'Resolved').length;

          return (
            <div
              key={b.id}
              onClick={() => setSelectedBld(b.name)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                selectedBld === b.name
                  ? 'bg-slate-900 border-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.2)] ring-1 ring-cyan-400'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-bold">
                  {b.code}
                </span>
                <span className={`text-[11px] font-bold ${openInBld > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {openInBld} Active Issues
                </span>
              </div>
              <h4 className="font-bold text-white text-sm">{b.name}</h4>
              <p className="text-[11px] text-slate-400 leading-tight">
                {b.floors.length} Levels • {b.floors.join(', ')}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
