import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Bell, CheckCheck, Wrench, CheckCircle2, MessageSquare, AlertCircle, ExternalLink } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead, 
    setSelectedComplaintId, 
    setActiveTab 
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!isOpen) return null;

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = (notifId: string, complaintId?: string) => {
    markNotificationRead(notifId);
    if (complaintId) {
      setSelectedComplaintId(complaintId);
      setActiveTab('details');
      onClose();
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'created':
        return <AlertCircle className="w-4 h-4 text-sky-400" />;
      case 'assigned':
        return <Wrench className="w-4 h-4 text-purple-400" />;
      case 'status_change':
        return <Wrench className="w-4 h-4 text-amber-400" />;
      case 'resolved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-cyan-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0d1527] border-l border-slate-700/50 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Campus Alerts</h3>
                <p className="text-xs text-slate-400">Real-time maintenance status stream</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Bar */}
          <div className="px-5 py-3 bg-slate-900/50 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  filter === 'all' 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  filter === 'unread' 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {filteredNotifications.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No notifications in this view</p>
                <p className="text-xs text-slate-600 mt-1">Status updates and ticket assignments will appear here</p>
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n.id, n.complaintId)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer group ${
                    n.isRead
                      ? 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/50 hover:border-slate-700'
                      : 'bg-gradient-to-r from-cyan-950/30 to-slate-900 border-cyan-500/30 shadow-[0_4px_20px_-5px_rgba(56,189,248,0.15)] hover:border-cyan-400/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 shrink-0 mt-0.5">
                      {getNotifIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                          {n.title}
                        </h4>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8] shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                        {n.message}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                        <span>{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {n.complaintId && (
                          <span className="inline-flex items-center gap-1 text-cyan-400/80 group-hover:text-cyan-300">
                            View Ticket <ExternalLink className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
