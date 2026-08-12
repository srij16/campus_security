export type Role = 'student' | 'teacher' | 'admin' | 'staff';

export type Department = 
  | 'Electrical' 
  | 'Plumbing' 
  | 'Civil' 
  | 'IT' 
  | 'Housekeeping' 
  | 'Administration';

export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

export type Status = 'Reported' | 'Assigned' | 'In Progress' | 'Resolved';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  department?: Department;
  identifier?: string; // Student ID or Employee ID
  phone?: string;
  status?: string;
  verifiedAt?: string;
  verifiedById?: string;
  verificationReason?: string;
  auth_user_id?: string;
  studentId?: string;
  employeeId?: string;
  designation?: string;
  course?: string;
  year?: number;
  semester?: number;
  documentUrl?: string;
}


export interface TimelineEvent {
  id: string;
  status: Status;
  title: string;
  description: string;
  timestamp: string;
  actorName: string;
  actorRole: Role;
}

export interface Comment {
  id: string;
  complaintId: string;
  userId: string;
  userName: string;
  userRole: Role;
  userAvatar?: string;
  content: string;
  timestamp: string;
  isStaffUpdate?: boolean;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  aiSummary: string;
  category: string;
  department: Department;
  priority: Priority;
  status: Status;
  location: {
    building: string;
    floor: string;
    room: string;
    coordinates?: [number, number]; // [lat, lng]
    specificSpot?: string;
  };
  imageUrl: string;
  repairImageUrl?: string;
  repairNotes?: string;
  reportedBy: {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatar?: string;
  };
  assignedStaff?: {
    id: string;
    name: string;
    department: Department;
    avatar?: string;
    assignedAt: string;
  };
  upvotes: number;
  upvotedBy: string[]; // user IDs who supported duplicate
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  timeline: TimelineEvent[];
  comments: Comment[];
  confidenceScore?: number; // AI confidence percentage
  dbId?: number;
}

export interface AppNotification {
  id: string;
  userId?: string; // or all if broadcast
  title: string;
  message: string;
  type: 'created' | 'assigned' | 'status_change' | 'resolved' | 'comment';
  complaintId?: string;
  isRead: boolean;
  timestamp: string;
}

export interface Building {
  id: string;
  name: string;
  code: string;
  coordinates: [number, number]; // [lat, lng]
  floors: string[];
  description: string;
}

export interface AIDetectionResult {
  category: string;
  department: Department;
  priority: Priority;
  priorityReason: string;
  suggestedTitle: string;
  suggestedDescription: string;
  confidenceScore: number;
  tags: string[];
  detectedObjects: string[];
}
