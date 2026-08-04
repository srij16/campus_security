import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  Complaint, 
  Building, 
  AppNotification, 
  Role, 
  Status, 
  Department, 
  Priority,
  TimelineEvent,
  Comment
} from '../types';
import { MOCK_USERS, MOCK_BUILDINGS, INITIAL_COMPLAINTS, INITIAL_NOTIFICATIONS } from '../data/mockData';
import confetti from 'canvas-confetti';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  currentRole: Role;
  switchRole: (role: Role) => void;
  complaints: Complaint[];
  notifications: AppNotification[];
  buildings: Building[];
  users: User[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedComplaintId: string | null;
  setSelectedComplaintId: (id: string | null) => void;
  createComplaint: (data: {
    title: string;
    description: string;
    aiSummary: string;
    category: string;
    department: Department;
    priority: Priority;
    location: {
      building: string;
      floor: string;
      room: string;
      specificSpot?: string;
      coordinates?: [number, number];
    };
    imageUrl: string;
    confidenceScore?: number;
  }) => Complaint;
  updateComplaintStatus: (
    id: string, 
    newStatus: Status, 
    note?: string, 
    repairImageUrl?: string, 
    repairNotes?: string
  ) => void;
  assignStaff: (complaintId: string, staffUserId: string) => void;
  addComment: (complaintId: string, content: string, isStaffUpdate?: boolean) => void;
  upvoteComplaint: (complaintId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetToDemoData: () => void;
  toastMessage: { title: string; message: string; type?: 'info' | 'success' | 'warning' } | null;
  clearToast: () => void;
  showToast: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  COMPLAINTS: 'cg_complaints_v1',
  CURRENT_USER: 'cg_current_user_v1',
  NOTIFICATIONS: 'cg_notifications_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users] = useState<User[]>(MOCK_USERS);
  const [buildings] = useState<Building[]>(MOCK_BUILDINGS);

  const [currentUser, setCurrentUserState] = useState<User>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return MOCK_USERS[0]; // Default student Alex Rivera
  });

  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_COMPLAINTS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [activeTab, setActiveTab] = useState<string>('landing'); // 'landing', 'login', 'dashboard', 'report', 'details', 'analytics', 'map', 'users'
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ title: string; message: string; type?: 'info' | 'success' | 'warning' } | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  const showToast = (title: string, message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setToastMessage({ title, message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const clearToast = () => setToastMessage(null);

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    showToast(`Switched Profile`, `Now logged in as ${user.name} (${user.role.toUpperCase()})`, 'info');
  };

  const switchRole = (role: Role) => {
    const matched = users.find(u => u.role === role);
    if (matched) {
      setCurrentUser(matched);
      setActiveTab('dashboard');
    }
  };

  const createComplaint = (data: {
    title: string;
    description: string;
    aiSummary: string;
    category: string;
    department: Department;
    priority: Priority;
    location: {
      building: string;
      floor: string;
      room: string;
      specificSpot?: string;
      coordinates?: [number, number];
    };
    imageUrl: string;
    confidenceScore?: number;
  }): Complaint => {
    const now = new Date().toISOString();
    const newId = `CG-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    // Match building coordinates if not provided
    const matchedBld = buildings.find(b => b.name === data.location.building);
    const coordinates: [number, number] = data.location.coordinates || (matchedBld ? matchedBld.coordinates : [12.9716, 77.5946]);

    const initialTimeline: TimelineEvent = {
      id: `tl-${Date.now()}`,
      status: 'Reported',
      title: 'Complaint Registered',
      description: `AI auto-routed to ${data.department} with ${data.priority} Priority.`,
      timestamp: now,
      actorName: currentUser.name,
      actorRole: currentUser.role
    };

    const newComplaint: Complaint = {
      id: newId,
      title: data.title || `${data.category} in ${data.location.room}`,
      description: data.description || data.aiSummary,
      aiSummary: data.aiSummary,
      category: data.category,
      department: data.department,
      priority: data.priority,
      status: 'Reported',
      location: {
        ...data.location,
        coordinates
      },
      imageUrl: data.imageUrl,
      reportedBy: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        avatar: currentUser.avatar
      },
      upvotes: 0,
      upvotedBy: [],
      confidenceScore: data.confidenceScore || 95.0,
      createdAt: now,
      updatedAt: now,
      timeline: [initialTimeline],
      comments: []
    };

    setComplaints(prev => [newComplaint, ...prev]);

    // Create Notification
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: `New Ticket Created: ${newId}`,
      message: `${currentUser.name} reported "${newComplaint.title}" (${data.priority} Priority).`,
      type: 'created',
      complaintId: newId,
      isRead: false,
      timestamp: now
    };
    setNotifications(prev => [newNotif, ...prev]);

    showToast('Complaint Submitted Successfully!', `Ticket ${newId} logged and routed to ${data.department} Department.`, 'success');
    return newComplaint;
  };

  const updateComplaintStatus = (
    id: string, 
    newStatus: Status, 
    note?: string, 
    repairImageUrl?: string, 
    repairNotes?: string
  ) => {
    const now = new Date().toISOString();
    let updatedComplaint: Complaint | null = null;

    setComplaints(prev => prev.map(c => {
      if (c.id === id) {
        const newTimelineEvent: TimelineEvent = {
          id: `tl-${Date.now()}`,
          status: newStatus,
          title: `Status Changed to ${newStatus}`,
          description: note || (newStatus === 'Resolved' ? (repairNotes || 'Maintenance completed and verified.') : `Work updated by ${currentUser.name}.`),
          timestamp: now,
          actorName: currentUser.name,
          actorRole: currentUser.role
        };

        const isResolved = newStatus === 'Resolved';

        updatedComplaint = {
          ...c,
          status: newStatus,
          updatedAt: now,
          resolvedAt: isResolved ? now : c.resolvedAt,
          repairImageUrl: repairImageUrl || c.repairImageUrl,
          repairNotes: repairNotes || c.repairNotes,
          timeline: [...c.timeline, newTimelineEvent]
        };
        return updatedComplaint;
      }
      return c;
    }));

    // Trigger celebration confetti on Resolved!
    if (newStatus === 'Resolved') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) { /* ignore */ }
    }

    // Add notification
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: `Status Updated: ${id} → ${newStatus}`,
      message: `${currentUser.name} updated "${id}" to ${newStatus}.`,
      type: newStatus === 'Resolved' ? 'resolved' : 'status_change',
      complaintId: id,
      isRead: false,
      timestamp: now
    };
    setNotifications(prev => [notif, ...prev]);

    showToast(`Ticket Updated`, `${id} status changed to "${newStatus}"`, 'success');
  };

  const assignStaff = (complaintId: string, staffUserId: string) => {
    const staff = users.find(u => u.id === staffUserId);
    if (!staff) return;
    const now = new Date().toISOString();

    setComplaints(prev => prev.map(c => {
      if (c.id === complaintId) {
        const newTimelineEvent: TimelineEvent = {
          id: `tl-${Date.now()}`,
          status: 'Assigned',
          title: `Assigned to ${staff.name}`,
          description: `Dispatched to ${staff.department || c.department} specialist ${staff.name}.`,
          timestamp: now,
          actorName: currentUser.name,
          actorRole: currentUser.role
        };

        return {
          ...c,
          status: c.status === 'Reported' ? 'Assigned' : c.status,
          assignedStaff: {
            id: staff.id,
            name: staff.name,
            department: staff.department || c.department,
            avatar: staff.avatar,
            assignedAt: now
          },
          updatedAt: now,
          timeline: [...c.timeline, newTimelineEvent]
        };
      }
      return c;
    }));

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: `Staff Assigned to ${complaintId}`,
      message: `${staff.name} has been assigned to handle this task.`,
      type: 'assigned',
      complaintId: complaintId,
      isRead: false,
      timestamp: now
    };
    setNotifications(prev => [notif, ...prev]);
    showToast(`Staff Assigned`, `${staff.name} assigned to ticket ${complaintId}`, 'info');
  };

  const addComment = (complaintId: string, content: string, isStaffUpdate: boolean = false) => {
    if (!content.trim()) return;
    const now = new Date().toISOString();

    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      complaintId,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      userAvatar: currentUser.avatar,
      content: content.trim(),
      timestamp: now,
      isStaffUpdate
    };

    setComplaints(prev => prev.map(c => {
      if (c.id === complaintId) {
        return {
          ...c,
          comments: [...c.comments, newComment],
          updatedAt: now
        };
      }
      return c;
    }));

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: `New Comment on ${complaintId}`,
      message: `${currentUser.name}: "${content.length > 50 ? content.substring(0, 50) + '...' : content}"`,
      type: 'comment',
      complaintId,
      isRead: false,
      timestamp: now
    };
    setNotifications(prev => [notif, ...prev]);
    showToast('Comment Added', 'Your update has been appended to the ticket log.', 'info');
  };

  const upvoteComplaint = (complaintId: string) => {
    setComplaints(prev => prev.map(c => {
      if (c.id === complaintId) {
        const hasUpvoted = c.upvotedBy.includes(currentUser.id);
        const upvotedBy = hasUpvoted
          ? c.upvotedBy.filter(uid => uid !== currentUser.id)
          : [...c.upvotedBy, currentUser.id];
        return {
          ...c,
          upvotes: upvotedBy.length,
          upvotedBy
        };
      }
      return c;
    }));
    showToast('Ticket Supported', 'Upvoted this issue to boost priority visibility.', 'info');
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const resetToDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.COMPLAINTS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    setComplaints(INITIAL_COMPLAINTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrentUserState(MOCK_USERS[0]);
    showToast('Reset Complete', 'Demo database restored to default factory state.', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        currentRole: currentUser.role,
        switchRole,
        complaints,
        notifications,
        buildings,
        users,
        activeTab,
        setActiveTab,
        selectedComplaintId,
        setSelectedComplaintId,
        createComplaint,
        updateComplaintStatus,
        assignStaff,
        addComment,
        upvoteComplaint,
        markNotificationRead,
        markAllNotificationsRead,
        resetToDemoData,
        toastMessage,
        clearToast,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
