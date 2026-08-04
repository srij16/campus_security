import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  PlusCircle, 
  Bell, 
  Users, 
  BarChart3, 
  MapPin, 
  Sparkles, 
  RefreshCw, 
  Menu, 
  X,
  LayoutDashboard,
  Home
} from 'lucide-react';
import { RoleSwitcherModal } from '../common/RoleSwitcherModal';
import { NotificationDrawer } from '../common/NotificationDrawer';

export const Navbar: React.FC = () => {
  const { 
    currentUser, 
    activeTab, 
    setActiveTab, 
    notifications, 
    resetToDemoData 
  } = useApp();

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'staff':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'teacher':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo & Brand */}
            <div 
              onClick={() => setActiveTab('landing')}
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 via-sky-600/10 to-indigo-600/20 border border-cyan-500/40 group-hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                <ShieldCheck className="w-6 h-6 text-cyan-400 group-hover:scale-105 transition-transform" />
                <Sparkles className="w-3 h-3 text-cyan-300 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                    Campus Guardian
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full">
                    AI Portal
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 hidden sm:block">Smart Campus Maintenance</span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
              <button
                onClick={() => setActiveTab('landing')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'landing'
                    ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>

              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="capitalize">{currentUser.role} Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('map')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'map'
                    ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Campus Map</span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Analytics</span>
              </button>
            </nav>

            {/* Right Action Cluster */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Report Issue CTA Button */}
              <button
                onClick={() => setActiveTab('report')}
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-500 to-sky-500 text-black hover:from-cyan-400 hover:to-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.35)] flex items-center gap-2 transition-all active:scale-95"
              >
                <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Report Issue</span>
                <span className="sm:hidden">Report</span>
              </button>

              {/* Notification Bell */}
              <button
                onClick={() => setIsNotifDrawerOpen(true)}
                className="relative p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-extrabold bg-rose-500 text-white rounded-full leading-none shadow-[0_0_8px_#f43f5e] animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* User Persona & Role Switcher */}
              <button
                onClick={() => setIsRoleModalOpen(true)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition-all group"
                title="Click to Switch Persona"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-lg object-cover border border-slate-700"
                />
                <div className="text-left hidden lg:block">
                  <div className="text-xs font-semibold text-white leading-tight truncate max-w-[100px]">
                    {currentUser.name.split(' ')[0]}
                  </div>
                  <span className={`inline-block px-1.5 py-0.2 text-[9px] font-bold uppercase rounded border ${getRoleBadgeStyle(currentUser.role)}`}>
                    {currentUser.role}
                  </span>
                </div>
                <RefreshCw className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 group-hover:rotate-180 transition-all" />
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-4 border-t border-slate-800 bg-[#0b1120] space-y-1.5">
            <button
              onClick={() => { setActiveTab('landing'); setIsMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
            >
              Home
            </button>
            <button
              onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 capitalize"
            >
              {currentUser.role} Dashboard
            </button>
            <button
              onClick={() => { setActiveTab('report'); setIsMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-cyan-400 font-semibold hover:bg-slate-800"
            >
              + Report New Issue
            </button>
            <button
              onClick={() => { setActiveTab('analytics'); setIsMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
            >
              Analytics Dashboard
            </button>
            <button
              onClick={() => { setActiveTab('map'); setIsMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
            >
              Campus Map
            </button>
            <button
              onClick={() => { setIsRoleModalOpen(true); setIsMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-amber-400 hover:bg-slate-800"
            >
              Switch Role / Persona
            </button>
            <button
              onClick={() => { resetToDemoData(); setIsMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-slate-800 pt-2 border-t border-slate-800"
            >
              Reset Demo Data
            </button>
          </div>
        )}
      </header>

      {/* Modals & Drawers */}
      <RoleSwitcherModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />

      <NotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
      />
    </>
  );
};
