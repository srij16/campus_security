import React from 'react';
import { useApp } from '../../context/AppContext';
import { User, Role } from '../../types';
import { X, GraduationCap, BookOpen, ShieldAlert, Wrench, Check } from 'lucide-react';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { users, currentUser, setCurrentUser, setActiveTab } = useApp();

  if (!isOpen) return null;

  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
    onClose();
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'student':
        return <GraduationCap className="w-5 h-5 text-cyan-400" />;
      case 'teacher':
        return <BookOpen className="w-5 h-5 text-emerald-400" />;
      case 'admin':
        return <ShieldAlert className="w-5 h-5 text-rose-400" />;
      case 'staff':
        return <Wrench className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[#0e1628] border border-slate-700/70 rounded-2xl p-6 shadow-2xl z-10">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Switch User Persona</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Live Hackathon Demo
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Select any pre-configured campus user profile to test role-specific dashboards & workflows.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5">
          {users.map((user) => {
            const isSelected = currentUser.id === user.id;
            return (
              <div
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-950/50 to-slate-900 border-cyan-400 shadow-[0_0_20px_rgba(56,189,248,0.2)]'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-600 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-11 h-11 rounded-full object-cover border border-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-white truncate">{user.name}</span>
                      {getRoleIcon(user.role)}
                    </div>
                    <p className="text-xs text-slate-400 capitalize truncate">
                      {user.role} {user.department ? `(${user.department})` : ''}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono truncate">{user.identifier}</p>
                  </div>
                </div>

                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-cyan-500 text-black flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                ) : (
                  <button className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 text-slate-300 hover:bg-cyan-500 hover:text-black font-medium transition-colors shrink-0">
                    Select
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>Tip: You can also switch roles anytime via the top navbar.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
