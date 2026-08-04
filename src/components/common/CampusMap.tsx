import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';
import { Building, Complaint } from '../../types';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { Building2, AlertTriangle, ExternalLink, MapPin } from 'lucide-react';

// Custom modern SVG marker creator
const createBuildingMarker = (hasCritical: boolean, count: number) => {
  const bgColor = hasCritical ? '#f43f5e' : count > 0 ? '#38bdf8' : '#10b981';
  const glow = hasCritical ? 'rgba(244, 63, 94, 0.6)' : count > 0 ? 'rgba(56, 189, 248, 0.5)' : 'rgba(16, 185, 129, 0.4)';

  return L.divIcon({
    className: 'custom-campus-pin',
    html: `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        background: #0f172a;
        border: 2px solid ${bgColor};
        border-radius: 50%;
        box-shadow: 0 0 16px ${glow};
        cursor: pointer;
      ">
        <span style="color: #ffffff; font-size: 11px; font-weight: 800; font-family: Inter, sans-serif;">
          ${count}
        </span>
        ${hasCritical ? `
          <span style="
            position: absolute;
            top: -3px;
            right: -3px;
            width: 10px;
            height: 10px;
            background: #f43f5e;
            border-radius: 50%;
            animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></span>
        ` : ''}
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20]
  });
};

export const CampusMap: React.FC<{ selectedBuildingFilter?: string }> = ({ selectedBuildingFilter }) => {
  const { buildings, complaints, setSelectedComplaintId, setActiveTab } = useApp();
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);

  const center: [number, number] = [12.9718, 77.5950];

  const getComplaintsForBuilding = (buildingName: string): Complaint[] => {
    return complaints.filter(c => 
      c.location.building.toLowerCase().includes(buildingName.toLowerCase()) || 
      buildingName.toLowerCase().includes(c.location.building.toLowerCase())
    );
  };

  const handleViewTicket = (id: string) => {
    setSelectedComplaintId(id);
    setActiveTab('details');
  };

  return (
    <div className="w-full h-[520px] rounded-2xl overflow-hidden border border-slate-800 relative shadow-2xl">
      <MapContainer
        center={center}
        zoom={16}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {buildings.map((bld) => {
          const bldComplaints = getComplaintsForBuilding(bld.name);
          const activeComplaints = bldComplaints.filter(c => c.status !== 'Resolved');
          const hasCritical = activeComplaints.some(c => c.priority === 'Critical');

          if (selectedBuildingFilter && selectedBuildingFilter !== 'All' && !bld.name.includes(selectedBuildingFilter)) {
            return null;
          }

          return (
            <Marker
              key={bld.id}
              position={bld.coordinates}
              icon={createBuildingMarker(hasCritical, activeComplaints.length)}
              eventHandlers={{
                click: () => setSelectedBuilding(bld)
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-1 min-w-[280px] max-w-[320px]">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-2">
                    <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm text-white">{bld.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">Code: {bld.code}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mb-3">{bld.description}</p>

                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                      <span>Active Tickets ({activeComplaints.length})</span>
                      {hasCritical && (
                        <span className="text-rose-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Critical Active
                        </span>
                      )}
                    </div>

                    {bldComplaints.length === 0 ? (
                      <p className="text-xs text-emerald-400 py-1">No reported issues in this facility.</p>
                    ) : (
                      bldComplaints.slice(0, 3).map((comp) => (
                        <div
                          key={comp.id}
                          onClick={() => handleViewTicket(comp.id)}
                          className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all"
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[11px] font-mono text-cyan-400">{comp.id}</span>
                            <StatusBadge status={comp.status} size="sm" />
                          </div>
                          <p className="text-xs text-white font-medium truncate">{comp.title}</p>
                          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                            <span>{comp.location.room}</span>
                            <PriorityBadge priority={comp.priority} size="sm" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Overlay Floating Info */}
      <div className="absolute top-4 right-4 z-[400] bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-3.5 shadow-xl text-xs space-y-2 pointer-events-auto max-w-[220px]">
        <div className="font-bold text-white flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          <span>Interactive Campus Map</span>
        </div>
        <div className="space-y-1.5 text-slate-300 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border border-rose-500 bg-rose-500/20 shadow-[0_0_8px_#f43f5e]" />
            <span>Critical Hazard</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border border-sky-400 bg-sky-400/20 shadow-[0_0_8px_#38bdf8]" />
            <span>Active Maintenance</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border border-emerald-400 bg-emerald-400/20" />
            <span>All Clear</span>
          </div>
        </div>
      </div>
    </div>
  );
};
