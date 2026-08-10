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

  const navRef = React.useRef<HTMLDivElement>(null);
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0, opacity: 0 });

  React.useEffect(() => {
    // Small timeout to allow browser layout to complete before reading offsets
    const timer = setTimeout(() => {
      if (!navRef.current) return;
      const activeButton = navRef.current.querySelector('[data-active="true"]') as HTMLButtonElement;
      if (activeButton) {
        setSliderStyle({
          left: activeButton.offsetLeft,
          width: activeButton.offsetWidth,
          opacity: 1
        });
      } else {
        setSliderStyle(prev => ({ ...prev, opacity: 0 }));
      }
    }, 10);
    return () => clearTimeout(timer);
  }, [activeTab, currentUser.role]);

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
      <header className={`sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 transition-all ${
        currentUser.role !== 'admin' ? 'hidden md:block' : ''
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo & Brand */}
            <div 
              onClick={() => setActiveTab('landing')}
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              <img src="/logo.png" alt="Campus Guardian Logo" className="w-8 h-8 object-contain rounded group-hover:scale-105 transition-transform" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-head font-black text-lg sm:text-xl tracking-tighter uppercase text-white group-hover:text-cyan-300 transition-colors">
                    Campus Guardian
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full">
                    AI Portal
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 hidden sm:block">Smart Campus Maintenance</span>
              </div>
            </div>

            {/* Desktop Navigation Links with sliding background */}
            <nav 
              ref={navRef} 
              className="relative hidden md:flex items-center gap-1.5 lg:gap-2 p-1 bg-slate-950/60 rounded-xl border border-slate-900"
            >
              {/* Sliding Highlight Indicator */}
              <div 
                className="absolute h-[calc(100%-8px)] top-1 bg-slate-800 border border-slate-700 rounded-lg transition-all duration-300 ease-out pointer-events-none"
                style={{
                  left: `${sliderStyle.left}px`,
                  width: `${sliderStyle.width}px`,
                  opacity: sliderStyle.opacity
                }}
              />

              {[
                { id: 'dashboard', label: `${currentUser.role} Dashboard`, icon: LayoutDashboard },
                { id: 'map', label: 'Campus Map', icon: MapPin },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 }
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    data-active={isActive}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`relative z-10 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors duration-300 ${
                      isActive ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <TabIcon className="w-3.5 h-3.5" />
                    <span className="capitalize">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Action Cluster */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Report Issue CTA Button */}
              <button
                onClick={() => setActiveTab('report')}
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-cyan-400 text-black border-2 border-black shadow-[3px_3px_0px_#000] hover:bg-cyan-300 flex items-center gap-2 transition-all active:scale-95"
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
              {currentUser && currentUser.id ? (
                <button
                  onClick={() => setIsRoleModalOpen(true)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition-all group"
                  title="Click to Switch Persona"
                >
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-lg object-cover border border-slate-700"
                  />
                  <div className="text-left hidden lg:block">
                    <div className="text-xs font-semibold text-white leading-tight truncate max-w-[100px]">
                      {currentUser.name ? currentUser.name.split(' ')[0] : 'Guest'}
                    </div>
                    <span className={`inline-block px-1.5 py-0.2 text-[9px] font-bold uppercase rounded border ${getRoleBadgeStyle(currentUser.role)}`}>
                      {currentUser.role}
                    </span>
                  </div>
                  <RefreshCw className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 group-hover:rotate-180 transition-all" />
                </button>
              ) : (
                <button
                  onClick={() => setActiveTab('login')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-cyan-500 text-black"
                >
                  Sign In
                </button>
              )}

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
