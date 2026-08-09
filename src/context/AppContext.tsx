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
  }) => Promise<Complaint | null>;
  updateComplaintStatus: (
    id: string, 
    newStatus: Status, 
    note?: string, 
    repairImageUrl?: string, 
    repairNotes?: string
  ) => Promise<void>;
  assignStaff: (complaintId: string, staffUserId: string) => Promise<void>;
  addComment: (complaintId: string, content: string, isStaffUpdate?: boolean) => Promise<void>;
  upvoteComplaint: (complaintId: string) => void;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  resetToDemoData: () => void;
  toastMessage: { title: string; message: string; type?: 'info' | 'success' | 'warning' } | null;
  clearToast: () => void;
  showToast: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const API_BASE = "http://localhost:8000/api";

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<User>({
    id: 'usr-student-1',
    name: 'Alex Rivera',
    email: 'alex.rivera@campusguardian.com',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  });

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ title: string; message: string; type?: 'info' | 'success' | 'warning' } | null>(null);

  const showToast = (title: string, message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setToastMessage({ title, message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const clearToast = () => setToastMessage(null);

  const getHeaders = () => {
    const token = localStorage.getItem("cg_token");
    return {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };
  };

  // Switch role by logging in with the seeded accounts
  const switchRole = async (role: Role) => {
    let email = "alex.rivera@campusguardian.com";
    let password = "StudentPassword123";

    if (role === 'admin') {
      email = "admin@campusguardian.com";
      password = "AdminPassword123";
    } else if (role === 'staff') {
      email = "elec.staff@campusguardian.com";
      password = "StaffPassword123";
    } else if (role === 'teacher') {
      // Just fallback to student or register one
      email = "alex.rivera@campusguardian.com";
      password = "StudentPassword123";
    }

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("cg_token", data.access_token);
        
        const mappedUser: User = {
          id: String(data.user.id),
          name: data.user.name,
          email: data.user.email,
          role: data.user.role.toLowerCase() as Role,
          avatar: role === 'admin' 
            ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
            : role === 'staff'
              ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
              : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
        };
        
        setCurrentUserState(mappedUser);
        showToast(`Logged In`, `Authenticated as ${mappedUser.name} (${role.toUpperCase()})`, 'success');
        setActiveTab('dashboard');
        refreshData();
      }
    } catch (e) {
      console.error(e);
      showToast("Auth Error", "Failed to login on backend.", "warning");
    }
  };

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
  };

  const refreshData = async () => {
    try {
      // Fetch Buildings
      const bldRes = await fetch(`${API_BASE}/buildings/`, { headers: getHeaders() });
      if (bldRes.ok) {
        const bldData = await bldRes.json();
        const mappedBuildings: Building[] = bldData.map((b: any) => ({
          id: String(b.id),
          name: b.name,
          code: b.name.substring(0, 3).toUpperCase(),
          coordinates: b.latitude && b.longitude ? [b.latitude, b.longitude] : [12.9716, 77.5946],
          floors: Array.from(new Set(b.rooms.map((r: any) => r.floor || "Ground Floor"))) as string[],
          description: b.description || ""
        }));
        setBuildings(mappedBuildings);
      }

      // Fetch Users
      const usrRes = await fetch(`${API_BASE}/users/`, { headers: getHeaders() });
      if (usrRes.ok) {
        const usrData = await usrRes.json();
        const mappedUsers: User[] = usrData.map((u: any) => ({
          id: String(u.id),
          name: u.name,
          email: u.email,
          role: u.role.toLowerCase() as Role
        }));
        setUsers(mappedUsers);
      }

      // Fetch Complaints
      const compRes = await fetch(`${API_BASE}/complaints/?page_size=100`, { headers: getHeaders() });
      if (compRes.ok) {
        const compData = await compRes.json();
        const mappedComplaints: Complaint[] = compData.items.map((c: any) => {
          // Fetch comments & status history
          return {
            id: c.complaint_number,
            dbId: c.id, // Keep track of database integer ID
            title: c.title,
            description: c.description,
            aiSummary: c.ai_analysis ? c.ai_analysis.summary : "No AI analysis summary.",
            category: c.category,
            department: (c.assigned_department ? c.assigned_department.name : "Safety") as Department,
            priority: (c.priority.charAt(0) + c.priority.slice(1).toLowerCase()) as Priority,
            status: (c.status.charAt(0) + c.status.slice(1).toLowerCase().replace('_', ' ')) as Status,
            location: {
              building: c.building.name,
              floor: c.room ? (c.room.floor || "Ground Floor") : "Ground Floor",
              room: c.room ? c.room.room_number : "General Facilities",
              coordinates: c.building.latitude && c.building.longitude ? [c.building.latitude, c.building.longitude] : [12.9716, 77.5946]
            },
            imageUrl: c.attachments && c.attachments.length > 0 ? c.attachments[0].file_url : "",
            reportedBy: {
              id: String(c.reporter.id),
              name: c.reporter.name,
              email: c.reporter.email,
              role: c.reporter.role.toLowerCase() as Role,
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
            },
            assignedStaff: c.assigned_staff ? {
              id: String(c.assigned_staff.id),
              name: c.assigned_staff.name,
              department: (c.assigned_department ? c.assigned_department.name : "Safety") as Department,
              avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
              assignedAt: c.updated_at
            } : undefined,
            upvotes: 0,
            upvotedBy: [],
            confidenceScore: c.ai_confidence ? c.ai_confidence * 100 : 95,
            createdAt: c.created_at,
            updatedAt: c.updated_at,
            timeline: [],
            comments: []
          };
        });

        // Load detail relations for the complaints
        for (let complaint of mappedComplaints) {
          try {
            const commentsRes = await fetch(`${API_BASE}/complaints/${complaint.dbId}/comments`, { headers: getHeaders() });
            if (commentsRes.ok) {
              const commentsData = await commentsRes.json();
              complaint.comments = commentsData.map((co: any) => ({
                id: String(co.id),
                complaintId: complaint.id,
                userId: String(co.user_id),
                userName: co.user.name,
                userRole: co.user.role.toLowerCase() as Role,
                userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
                content: co.comment,
                timestamp: co.created_at
              }));
            }

            const historyRes = await fetch(`${API_BASE}/complaints/${complaint.dbId}/history`, { headers: getHeaders() });
            if (historyRes.ok) {
              const historyData = await historyRes.json();
              complaint.timeline = historyData.map((h: any) => ({
                id: String(h.id),
                status: (h.new_status.charAt(0) + h.new_status.slice(1).toLowerCase().replace('_', ' ')) as Status,
                title: h.comment || `Status updated to ${h.new_status}`,
                description: `Updated by ${h.user ? h.user.name : "System"}`,
                timestamp: h.created_at,
                actorName: h.user ? h.user.name : "System",
                actorRole: h.user ? h.user.role.toLowerCase() as Role : "admin"
              }));
            }
          } catch (e) {
            console.error(e);
          }
        }
        setComplaints(mappedComplaints);
      }

      // Fetch Notifications
      const notifRes = await fetch(`${API_BASE}/notifications/`, { headers: getHeaders() });
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        const mappedNotifs: AppNotification[] = notifData.map((n: any) => ({
          id: String(n.id),
          title: n.title,
          message: n.message,
          type: n.title.toLowerCase().includes("status") ? "status_change" : "created",
          complaintId: "",
          isRead: n.is_read,
          timestamp: n.created_at
        }));
        setNotifications(mappedNotifs);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("cg_token");
      if (!token) {
        await switchRole('student');
      } else {
        await refreshData();
      }
    };
    initAuth();
  }, [currentUser]);

  const createComplaint = async (data: {
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
  }): Promise<Complaint | null> => {
    try {
      // Find building and room ID from backend
      const bld = buildings.find(b => b.name === data.location.building);
      if (!bld) return null;
      
      const res = await fetch(`${API_BASE}/complaints/`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          category: data.category,
          priority: data.priority.toUpperCase(),
          building_id: intOrZero(bld.id),
          room_id: null, // Simple default or can resolve room ID if seeded
          imageUrl: data.imageUrl,
          ai_confidence: data.confidenceScore ? data.confidenceScore / 100 : 0.95,
          ai_summary: data.aiSummary
        })
      });

      if (res.ok) {
        const newC = await res.json();
        showToast('Complaint Submitted Successfully!', `Ticket logged.`, 'success');
        
        const mappedNewC: Complaint = {
          id: newC.complaint_number,
          title: newC.title,
          description: newC.description,
          aiSummary: newC.ai_analysis ? newC.ai_analysis.summary : (newC.ai_summary || "No AI analysis summary."),
          category: newC.category,
          department: data.department,
          priority: data.priority,
          status: 'Reported',
          location: {
            building: data.location.building,
            floor: data.location.floor,
            room: data.location.room,
            specificSpot: data.location.specificSpot,
            coordinates: data.location.coordinates
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
          confidenceScore: data.confidenceScore || 95,
          createdAt: newC.created_at || new Date().toISOString(),
          updatedAt: newC.updated_at || new Date().toISOString(),
          timeline: [],
          comments: []
        };
        
        setComplaints(prev => [mappedNewC, ...prev]);
        refreshData();
        return mappedNewC;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  const intOrZero = (id: string) => {
    const parsed = parseInt(id, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  const updateComplaintStatus = async (
    id: string, 
    newStatus: Status, 
    note?: string, 
    repairImageUrl?: string, 
    repairNotes?: string
  ) => {
    try {
      const complaint = complaints.find(c => c.id === id);
      if (!complaint) return;
      
      const dbId = (complaint as any).dbId;
      const mappedStatusStr = newStatus.toUpperCase().replace(' ', '_');

      const res = await fetch(`${API_BASE}/complaints/${dbId}/status`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          status: mappedStatusStr,
          comment: note || repairNotes,
          repair_image_url: repairImageUrl
        })
      });

      if (res.ok) {
        if (newStatus === 'Resolved') {
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 }
            });
          } catch (e) { /* ignore */ }
        }
        showToast(`Ticket Updated`, `Status changed to "${newStatus}"`, 'success');
        refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const assignStaff = async (complaintId: string, staffUserId: string) => {
    try {
      const complaint = complaints.find(c => c.id === complaintId);
      if (!complaint) return;

      const dbId = (complaint as any).dbId;
      const res = await fetch(`${API_BASE}/complaints/${dbId}/assign`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          staff_id: parseInt(staffUserId, 10)
        })
      });

      if (res.ok) {
        showToast(`Staff Assigned`, `Ticket assigned successfully.`, 'info');
        refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addComment = async (complaintId: string, content: string) => {
    try {
      const complaint = complaints.find(c => c.id === complaintId);
      if (!complaint) return;

      const dbId = (complaint as any).dbId;
      const res = await fetch(`${API_BASE}/complaints/${dbId}/comments`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          comment: content
        })
      });

      if (res.ok) {
        showToast('Comment Added', 'Your update has been appended to the ticket log.', 'info');
        refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const upvoteComplaint = () => {
    showToast('Supported', 'Upvoted successfully.', 'info');
  };

  const markNotificationRead = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: "PATCH",
        headers: getHeaders()
      });
      if (res.ok) {
        refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      const res = await fetch(`${API_BASE}/notifications/read-all`, {
        method: "POST",
        headers: getHeaders()
      });
      if (res.ok) {
        refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const resetToDemoData = () => {
    refreshData();
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
