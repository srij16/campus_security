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
import { supabase } from '../services/supabase';

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
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
  onboardUser: (data: any) => Promise<boolean>;
  
  // Analytics & Auditing extension
  analyticsOverview: any;
  analyticsByDept: any[];
  analyticsByBuilding: any[];
  analyticsByPriority: any[];
  analyticsTrends: any[];
  analyticsResolutionTimes: any[];
  analyticsHotspots: any[];
  auditLogs: any[];
  verifyUser: (userId: string, status: string, reason?: string) => Promise<void>;
  updateUserRole: (userId: string, role: string) => Promise<void>;
  fetchAuditLogs: () => Promise<void>;
}


const AppContext = createContext<AppContextType | undefined>(undefined);

const API_BASE = "http://localhost:8000/api";

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<User>({
    id: '',
    name: '',
    email: '',
    role: 'student',
    avatar: ''
  });

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTabState] = useState<string>(() => {
    const hash = window.location.hash.replace('#/', '') || 'landing';
    return ['landing', 'login', 'report', 'details', 'map', 'dashboard', 'analytics'].includes(hash) ? hash : 'landing';
  });

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    window.location.hash = `#/${tab}`;
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '') || 'landing';
      if (['landing', 'login', 'report', 'details', 'map', 'dashboard', 'analytics'].includes(hash)) {
        setActiveTabState(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ title: string; message: string; type?: 'info' | 'success' | 'warning' } | null>(null);

  // New Analytics & Auditing State
  const [analyticsOverview, setAnalyticsOverview] = useState<any>(null);
  const [analyticsByDept, setAnalyticsByDept] = useState<any[]>([]);
  const [analyticsByBuilding, setAnalyticsByBuilding] = useState<any[]>([]);
  const [analyticsByPriority, setAnalyticsByPriority] = useState<any[]>([]);
  const [analyticsTrends, setAnalyticsTrends] = useState<any[]>([]);
  const [analyticsResolutionTimes, setAnalyticsResolutionTimes] = useState<any[]>([]);
  const [analyticsHotspots, setAnalyticsHotspots] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);


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

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("cg_token", data.access_token);
        
        const activeUserRole = data.user.role.toLowerCase() as Role;
        const mappedUser: User = {
          id: String(data.user.id),
          name: data.user.name,
          email: data.user.email,
          role: activeUserRole,
          status: data.user.status,
          verifiedAt: data.user.verified_at,
          verifiedById: data.user.verified_by_id ? String(data.user.verified_by_id) : undefined,
          verificationReason: data.user.verification_reason,
          avatar: activeUserRole === 'admin' 
            ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
            : activeUserRole === 'staff'
              ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
              : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          auth_user_id: data.user.auth_user_id,
          studentId: data.user.student_id,
          employeeId: data.user.employee_id,
          designation: data.user.designation,
          course: data.user.course,
          year: data.user.year,
          semester: data.user.semester,
          documentUrl: data.user.document_url,
          phone: data.user.phone
        };
        
        setCurrentUserState(mappedUser);
        showToast(`Logged In`, `Authenticated as ${mappedUser.name} (${activeUserRole.toUpperCase()})`, 'success');
        setActiveTab('dashboard');
        await refreshData();
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.error("Login request failed", e);
      return false;
    }
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
      email = "alex.rivera@campusguardian.com";
      password = "StudentPassword123";
    }

    const success = await login(email, password);
    if (!success) {
      // Fallback local mock user data if backend offline
      const mockUser: User = {
        id: role === 'admin' ? 'usr-admin-1' : role === 'staff' ? 'usr-staff-1' : 'usr-student-1',
        name: role === 'admin' ? 'Administrator' : role === 'staff' ? 'Maintenance Staff' : 'Alex Rivera',
        email: email,
        role: role,
        avatar: role === 'admin' 
          ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
          : role === 'staff'
            ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      };
      setCurrentUserState(mockUser);
      localStorage.setItem("cg_token", "mock_dummy_token");
      showToast(`Mock Logged In`, `Authenticated as ${mockUser.name} (${role.toUpperCase()})`, 'success');
      setActiveTab('dashboard');
    }
  };

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    refreshData();
  };

  const refreshData = async () => {
    try {
      let activeUserRole: Role = currentUser.role;
      
      // Fetch Currently Authenticated User Info first
      const meRes = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
      if (meRes.ok) {
        const meData = await meRes.json();
        activeUserRole = meData.role.toLowerCase() as Role;
        const mappedUser: User = {
          id: String(meData.id),
          name: meData.name,
          email: meData.email,
          role: activeUserRole,
          status: meData.status,
          verifiedAt: meData.verified_at,
          verifiedById: meData.verified_by_id ? String(meData.verified_by_id) : undefined,
          verificationReason: meData.verification_reason,
          avatar: meData.role === 'ADMIN' 
            ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
            : meData.role === 'STAFF'
              ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
              : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          auth_user_id: meData.auth_user_id,
          studentId: meData.student_id,
          employeeId: meData.employee_id,
          designation: meData.designation,
          course: meData.course,
          year: meData.year,
          semester: meData.semester,
          documentUrl: meData.document_url,
          phone: meData.phone
        };
        setCurrentUserState(mappedUser);
      }

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
          role: u.role.toLowerCase() as Role,
          status: u.status,
          verifiedAt: u.verified_at,
          verifiedById: u.verified_by_id ? String(u.verified_by_id) : undefined,
          verificationReason: u.verification_reason,
          avatar: u.role === 'ADMIN' 
            ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
            : u.role === 'STAFF'
              ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
              : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          auth_user_id: u.auth_user_id,
          studentId: u.student_id,
          employeeId: u.employee_id,
          designation: u.designation,
          course: u.course,
          year: u.year,
          semester: u.semester,
          documentUrl: u.document_url,
          phone: u.phone
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

      // Fetch Analytics datasets
      if (activeUserRole === 'admin' || activeUserRole === 'staff') {
        try {
          const overviewRes = await fetch(`${API_BASE}/analytics/overview`, { headers: getHeaders() });
          if (overviewRes.ok) setAnalyticsOverview(await overviewRes.json());

          const deptRes = await fetch(`${API_BASE}/analytics/complaints-by-department`, { headers: getHeaders() });
          if (deptRes.ok) setAnalyticsByDept(await deptRes.json());

          const buildingRes = await fetch(`${API_BASE}/analytics/complaints-by-building`, { headers: getHeaders() });
          if (buildingRes.ok) setAnalyticsByBuilding(await buildingRes.json());

          const priorityRes = await fetch(`${API_BASE}/analytics/complaints-by-priority`, { headers: getHeaders() });
          if (priorityRes.ok) setAnalyticsByPriority(await priorityRes.json());

          const trendsRes = await fetch(`${API_BASE}/analytics/complaint-trends`, { headers: getHeaders() });
          if (trendsRes.ok) setAnalyticsTrends(await trendsRes.json());

          const resTimeRes = await fetch(`${API_BASE}/analytics/resolution-time`, { headers: getHeaders() });
          if (resTimeRes.ok) setAnalyticsResolutionTimes(await resTimeRes.json());

          const hotspotsRes = await fetch(`${API_BASE}/analytics/problem-hotspots`, { headers: getHeaders() });
          if (hotspotsRes.ok) setAnalyticsHotspots(await hotspotsRes.json());

          if (activeUserRole === 'admin') {
            await fetchAuditLogs();
          }
        } catch (err) {
          console.error("Failed to fetch analytics or audit logs", err);
        }
      }


    } catch (e) {
      console.error(e);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) {
        showToast('Authentication Error', error.message, 'warning');
      }
    } catch (e: any) {
      console.error(e);
      showToast('Authentication Error', e.message || 'Google Auth failed', 'warning');
    }
  };

  const onboardUser = async (data: any): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/users/onboard`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (res.ok) {
        showToast('Onboarding Submitted', 'Your verification request has been submitted.', 'success');
        await refreshData();
        setActiveTab('verification-pending');
        return true;
      } else {
        const err = await res.json();
        showToast('Onboarding Failed', err.detail || 'Could not submit onboarding details.', 'warning');
        return false;
      }
    } catch (e) {
      console.error(e);
      showToast('Error', 'Network error during onboarding.', 'warning');
      return false;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("cg_token");
      if (token) {
        await refreshData();
      }
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        try {
          const res = await fetch(`${API_BASE}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: session.access_token })
          });
          if (res.ok) {
            const data = await res.json();
            localStorage.setItem("cg_token", data.access_token);
            
            const activeUserRole = data.user.role.toLowerCase() as Role;
            const mappedUser: User = {
              id: String(data.user.id),
              name: data.user.name,
              email: data.user.email,
              role: activeUserRole,
              status: data.user.status,
              verifiedAt: data.user.verified_at,
              verifiedById: data.user.verified_by_id ? String(data.user.verified_by_id) : undefined,
              verificationReason: data.user.verification_reason,
              avatar: activeUserRole === 'admin' 
                ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
                : activeUserRole === 'staff'
                  ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
                  : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
              auth_user_id: data.user.auth_user_id,
              studentId: data.user.student_id,
              employeeId: data.user.employee_id,
              designation: data.user.designation,
              course: data.user.course,
              year: data.user.year,
              semester: data.user.semester,
              documentUrl: data.user.document_url,
              phone: data.user.phone
            };
            
            setCurrentUserState(mappedUser);
            
            if (mappedUser.status === 'VERIFIED') {
              setActiveTab('dashboard');
              showToast(`Logged In`, `Authenticated as ${mappedUser.name} (${activeUserRole.toUpperCase()})`, 'success');
            } else if (mappedUser.status === 'SUSPENDED') {
              setActiveTab('login');
              showToast(`Access Denied`, `Your account has been suspended.`, 'warning');
            } else if (mappedUser.status === 'REJECTED') {
              setActiveTab('verification-rejected');
            } else if (mappedUser.status === 'PENDING') {
              if (mappedUser.studentId || mappedUser.employeeId || mappedUser.designation) {
                setActiveTab('verification-pending');
              } else {
                setActiveTab('onboarding');
              }
            }
            
            await refreshData();
          }
        } catch (err) {
          console.error("Failed to authenticate with backend", err);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);


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
      
      let finalImageUrl = data.imageUrl;
      if (finalImageUrl.startsWith('data:image/')) {
        try {
          const response = await fetch(finalImageUrl);
          const blob = await response.blob();
          const formData = new FormData();
          formData.append('file', blob, 'upload.jpg');

          const token = localStorage.getItem("cg_token");
          const uploadRes = await fetch(`${API_BASE}/upload`, {
            method: "POST",
            headers: token ? { "Authorization": `Bearer ${token}` } : {},
            body: formData
          });
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            finalImageUrl = uploadData.url;
          }
        } catch (e) {
          console.error("Failed to upload base64 image, using raw data", e);
        }
      }

      const res = await fetch(`${API_BASE}/complaints/`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          category: data.category,
          priority: data.priority.toUpperCase(),
          building_id: intOrZero(bld.id),
          room_id: null,
          imageUrl: finalImageUrl,
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
          imageUrl: finalImageUrl,
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

  const verifyUser = async (userId: string, status: string, reason?: string) => {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}/verify`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ status, reason })
      });
      if (res.ok) {
        showToast('User Status Updated', `Verification status changed to ${status}`, 'success');
        refreshData();
      } else {
        const errorData = await res.json();
        showToast('Verification Failed', errorData.detail || 'Could not update user.', 'warning');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}/role`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ role: role.toUpperCase() })
      });
      if (res.ok) {
        showToast('Role Updated', `User role changed to ${role}`, 'success');
        refreshData();
      } else {
        const errorData = await res.json();
        showToast('Role Update Failed', errorData.detail || 'Could not update user role.', 'warning');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/users/audit-logs`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
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
        showToast,
        login,
        loginWithGoogle,
        onboardUser,
        
        // Analytics & Auditing states
        analyticsOverview,
        analyticsByDept,
        analyticsByBuilding,
        analyticsByPriority,
        analyticsTrends,
        analyticsResolutionTimes,
        analyticsHotspots,
        auditLogs,
        verifyUser,
        updateUserRole,
        fetchAuditLogs
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
