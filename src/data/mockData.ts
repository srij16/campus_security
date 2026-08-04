import { User, Complaint, Building, AppNotification } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: 'usr-student-1',
    name: 'Alex Rivera',
    email: 'alex.rivera@campus.edu',
    role: 'student',
    identifier: 'STU-2024-8902',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    phone: '+1 (555) 234-5678'
  },
  {
    id: 'usr-teacher-1',
    name: 'Prof. David Sharma',
    email: 'd.sharma@campus.edu',
    role: 'teacher',
    identifier: 'FAC-CS-104',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    phone: '+1 (555) 876-5432'
  },
  {
    id: 'usr-admin-1',
    name: 'Dr. Eleanor Vance',
    email: 'admin.vance@campus.edu',
    role: 'admin',
    identifier: 'ADM-DIR-001',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    phone: '+1 (555) 999-0001'
  },
  {
    id: 'usr-staff-elec',
    name: 'Marcus Cole',
    email: 'm.cole@maintenance.campus.edu',
    role: 'staff',
    department: 'Electrical',
    identifier: 'ENG-ELEC-42',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    phone: '+1 (555) 345-6789'
  },
  {
    id: 'usr-staff-plumb',
    name: 'Sarah Jenkins',
    email: 's.jenkins@maintenance.campus.edu',
    role: 'staff',
    department: 'Plumbing',
    identifier: 'ENG-PLUMB-18',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    phone: '+1 (555) 456-7890'
  },
  {
    id: 'usr-staff-civil',
    name: 'Robert Taylor',
    email: 'r.taylor@maintenance.campus.edu',
    role: 'staff',
    department: 'Civil',
    identifier: 'ENG-CIVIL-09',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    phone: '+1 (555) 567-8901'
  },
  {
    id: 'usr-staff-it',
    name: 'Kavita Patel',
    email: 'k.patel@maintenance.campus.edu',
    role: 'staff',
    department: 'IT',
    identifier: 'ENG-IT-33',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    phone: '+1 (555) 678-9012'
  },
  {
    id: 'usr-staff-hk',
    name: 'Lukas Meyer',
    email: 'l.meyer@maintenance.campus.edu',
    role: 'staff',
    department: 'Housekeeping',
    identifier: 'ENG-HK-55',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    phone: '+1 (555) 789-0123'
  }
];

export const MOCK_BUILDINGS: Building[] = [
  {
    id: 'bld-science',
    name: 'Science & Technology Block',
    code: 'STB',
    coordinates: [12.9716, 77.5946],
    floors: ['Ground Floor', 'Floor 1 (Physics Lab)', 'Floor 2 (Chemistry)', 'Floor 3 (Bio-Tech)', 'Floor 4 (Auditorium)'],
    description: 'Main laboratory complex housing natural science departments and high-tech research labs.'
  },
  {
    id: 'bld-eng',
    name: 'Dr. Kalam Engineering Wing',
    code: 'ENG',
    coordinates: [12.9725, 77.5958],
    floors: ['Ground Floor (Robotics)', 'Floor 1 (Mechanical)', 'Floor 2 (Electrical)', 'Floor 3 (Civil Design)'],
    description: 'Engineering faculty building with lecture theaters, heavy equipment workshops, and drafting rooms.'
  },
  {
    id: 'bld-library',
    name: 'Central Academic Library',
    code: 'LIB',
    coordinates: [12.9705, 77.5935],
    floors: ['Ground Floor (Reference)', 'Floor 1 (Quiet Study)', 'Floor 2 (Digital Archives)', 'Floor 3 (Periodicals)'],
    description: '4-story knowledge hub with 24/7 reading halls, digital repository, and discussion pods.'
  },
  {
    id: 'bld-it',
    name: 'Computer & AI Research Hub',
    code: 'CS-AI',
    coordinates: [12.9733, 77.5966],
    floors: ['Ground Floor (Server Room)', 'Floor 1 (Coding Labs)', 'Floor 2 (AI/ML Center)', 'Floor 3 (Cybersec Hub)'],
    description: 'High-speed networking centers, supercomputing clusters, and computer engineering labs.'
  },
  {
    id: 'bld-admin',
    name: 'Chancellor & Admin Tower',
    code: 'ADM',
    coordinates: [12.9712, 77.5975],
    floors: ['Ground Floor (Reception)', 'Floor 1 (Registrar)', 'Floor 2 (Finance & Deans)', 'Floor 3 (Chancellor)'],
    description: 'Executive administration, student affairs office, bursar, and conference boardrooms.'
  },
  {
    id: 'bld-dining',
    name: 'Student Activity & Dining Concourse',
    code: 'SAC',
    coordinates: [12.9695, 77.5952],
    floors: ['Ground Floor (Main Cafeteria)', 'Floor 1 (Student Clubs & Gym)', 'Floor 2 (Recreation Arena)'],
    description: 'Central dining hall, food courts, student union offices, and indoor sports amenities.'
  }
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'CG-2026-801',
    title: 'Exposed live wiring in 2nd Floor Corridor',
    description: 'The switchboard faceplate is cracked with high-voltage 220V wires hanging out near Classroom 204.',
    aiSummary: 'The uploaded image appears to show exposed electrical wiring at Dr. Kalam Engineering Wing, Room 204 Corridor. The issue has been classified as an Electrical Maintenance task with Critical priority.',
    category: 'Electrical Hazard',
    department: 'Electrical',
    priority: 'Critical',
    status: 'In Progress',
    location: {
      building: 'Dr. Kalam Engineering Wing',
      floor: 'Floor 2 (Electrical)',
      room: 'Room 204 Corridor',
      coordinates: [12.9725, 77.5958],
      specificSpot: 'Outside Room 204 next to the water dispenser'
    },
    imageUrl: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=1000&q=80',
    reportedBy: {
      id: 'usr-student-1',
      name: 'Alex Rivera',
      email: 'alex.rivera@campus.edu',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    },
    assignedStaff: {
      id: 'usr-staff-elec',
      name: 'Marcus Cole',
      department: 'Electrical',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      assignedAt: '2026-08-04T10:15:00Z'
    },
    upvotes: 6,
    upvotedBy: ['usr-teacher-1'],
    confidenceScore: 98.4,
    createdAt: '2026-08-04T09:30:00Z',
    updatedAt: '2026-08-04T11:45:00Z',
    timeline: [
      {
        id: 'tl-1',
        status: 'Reported',
        title: 'Complaint Submitted & AI Analyzed',
        description: 'Auto-categorized as Electrical Hazard (Critical Priority) by AI Vision Engine.',
        timestamp: '2026-08-04T09:30:00Z',
        actorName: 'Alex Rivera',
        actorRole: 'student'
      },
      {
        id: 'tl-2',
        status: 'Assigned',
        title: 'Assigned to Electrical Specialist',
        description: 'Admin assigned Marcus Cole (Electrical Maintenance Lead).',
        timestamp: '2026-08-04T10:15:00Z',
        actorName: 'Dr. Eleanor Vance',
        actorRole: 'admin'
      },
      {
        id: 'tl-3',
        status: 'In Progress',
        title: 'Work In Progress',
        description: 'Safety perimeter taped off. Replacement modular conduit and terminal box being installed.',
        timestamp: '2026-08-04T11:45:00Z',
        actorName: 'Marcus Cole',
        actorRole: 'staff'
      }
    ],
    comments: [
      {
        id: 'comm-1',
        complaintId: 'CG-2026-801',
        userId: 'usr-teacher-1',
        userName: 'Prof. David Sharma',
        userRole: 'teacher',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        content: 'Students walk past here continuously between lectures. Highly appreciated for the swift action!',
        timestamp: '2026-08-04T10:25:00Z'
      },
      {
        id: 'comm-2',
        complaintId: 'CG-2026-801',
        userId: 'usr-staff-elec',
        userName: 'Marcus Cole',
        userRole: 'staff',
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        content: 'Circuit breaker #14 isolated. Replacing the modular switch plate now. Should be complete by 2 PM.',
        timestamp: '2026-08-04T11:50:00Z',
        isStaffUpdate: true
      }
    ]
  },
  {
    id: 'CG-2026-802',
    title: 'Burst pipe & major water leakage in 2nd Floor Washroom',
    description: 'Under-sink cold water coupling sheared off, water pooling across floor and entering adjacent hallway.',
    aiSummary: 'The uploaded image appears to show water leakage at Science & Technology Block, Room 212 Washroom. The issue has been classified as a Plumbing Maintenance task with High priority.',
    category: 'Water Leakage',
    department: 'Plumbing',
    priority: 'High',
    status: 'Resolved',
    location: {
      building: 'Science & Technology Block',
      floor: 'Floor 2 (Chemistry)',
      room: 'Room 212 Washroom',
      coordinates: [12.9716, 77.5946],
      specificSpot: 'East wing gender-neutral restroom under basin 3'
    },
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80',
    repairImageUrl: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=1000&q=80',
    repairNotes: 'Replaced cracked 1/2" brass compression coupling, installed new Teflon seal, and dried subfloor.',
    reportedBy: {
      id: 'usr-teacher-1',
      name: 'Prof. David Sharma',
      email: 'd.sharma@campus.edu',
      role: 'teacher',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
    },
    assignedStaff: {
      id: 'usr-staff-plumb',
      name: 'Sarah Jenkins',
      department: 'Plumbing',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
      assignedAt: '2026-08-03T14:10:00Z'
    },
    upvotes: 4,
    upvotedBy: ['usr-student-1'],
    confidenceScore: 97.1,
    createdAt: '2026-08-03T13:45:00Z',
    updatedAt: '2026-08-03T16:30:00Z',
    resolvedAt: '2026-08-03T16:30:00Z',
    timeline: [
      {
        id: 'tl-10',
        status: 'Reported',
        title: 'Reported by Faculty Member',
        description: 'Auto-triage classified as High Priority Plumbing task.',
        timestamp: '2026-08-03T13:45:00Z',
        actorName: 'Prof. David Sharma',
        actorRole: 'teacher'
      },
      {
        id: 'tl-11',
        status: 'Assigned',
        title: 'Assigned to Plumbing Team',
        description: 'Sarah Jenkins deployed with repair kit.',
        timestamp: '2026-08-03T14:10:00Z',
        actorName: 'Dr. Eleanor Vance',
        actorRole: 'admin'
      },
      {
        id: 'tl-12',
        status: 'In Progress',
        title: 'Shutoff Valve Engaged',
        description: 'Main riser supply valve isolated. Repairing pipe joint.',
        timestamp: '2026-08-03T14:40:00Z',
        actorName: 'Sarah Jenkins',
        actorRole: 'staff'
      },
      {
        id: 'tl-13',
        status: 'Resolved',
        title: 'Issue Resolved & Verification Photo Uploaded',
        description: 'Replaced brass coupling, pressure tested at 65 PSI with zero leak. Floor sanitized.',
        timestamp: '2026-08-03T16:30:00Z',
        actorName: 'Sarah Jenkins',
        actorRole: 'staff'
      }
    ],
    comments: [
      {
        id: 'comm-10',
        complaintId: 'CG-2026-802',
        userId: 'usr-staff-plumb',
        userName: 'Sarah Jenkins',
        userRole: 'staff',
        userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
        content: 'Work complete. Housekeeping has sanitized and mopped the corridor.',
        timestamp: '2026-08-03T16:32:00Z',
        isStaffUpdate: true
      }
    ]
  },
  {
    id: 'CG-2026-803',
    title: 'Ceiling projector lamp failure in Seminar Hall B',
    description: 'Projector turns off after 30 seconds with thermal warning LED flashing orange. No display signal.',
    aiSummary: 'The uploaded image appears to show classroom av equipment at Central Academic Library, Room Seminar Hall B. The issue has been classified as an IT Maintenance task with High priority.',
    category: 'Classroom AV Equipment',
    department: 'IT',
    priority: 'High',
    status: 'Assigned',
    location: {
      building: 'Central Academic Library',
      floor: 'Floor 1 (Quiet Study)',
      room: 'Seminar Hall B',
      coordinates: [12.9705, 77.5935],
      specificSpot: 'Center ceiling mount over podium'
    },
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=80',
    reportedBy: {
      id: 'usr-teacher-1',
      name: 'Prof. David Sharma',
      email: 'd.sharma@campus.edu',
      role: 'teacher',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
    },
    assignedStaff: {
      id: 'usr-staff-it',
      name: 'Kavita Patel',
      department: 'IT',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      assignedAt: '2026-08-04T08:00:00Z'
    },
    upvotes: 3,
    upvotedBy: [],
    confidenceScore: 95.8,
    createdAt: '2026-08-03T17:20:00Z',
    updatedAt: '2026-08-04T08:00:00Z',
    timeline: [
      {
        id: 'tl-20',
        status: 'Reported',
        title: 'Complaint Registered',
        description: 'Flagged for IT hardware maintenance.',
        timestamp: '2026-08-03T17:20:00Z',
        actorName: 'Prof. David Sharma',
        actorRole: 'teacher'
      },
      {
        id: 'tl-21',
        status: 'Assigned',
        title: 'Assigned to IT AV Specialist',
        description: 'Kavita Patel dispatched with replacement UHP lamp bulb and optical cleaning kit.',
        timestamp: '2026-08-04T08:00:00Z',
        actorName: 'Dr. Eleanor Vance',
        actorRole: 'admin'
      }
    ],
    comments: [
      {
        id: 'comm-20',
        complaintId: 'CG-2026-803',
        userId: 'usr-staff-it',
        userName: 'Kavita Patel',
        userRole: 'staff',
        userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        content: 'Picking up replacement Epson ELPLP96 bulb from IT storage. Will install before 11 AM lecture.',
        timestamp: '2026-08-04T08:15:00Z',
        isStaffUpdate: true
      }
    ]
  },
  {
    id: 'CG-2026-804',
    title: 'Broken Auditorium Seat #34 in Row D',
    description: 'Armrest bracket sheared and backrest is detached, causing seat collapse hazard.',
    aiSummary: 'The uploaded image appears to show broken chair / furniture at Dr. Kalam Engineering Wing, Room Auditorium 101. The issue has been classified as a Civil Maintenance task with Medium priority.',
    category: 'Broken Chair / Furniture',
    department: 'Civil',
    priority: 'Medium',
    status: 'Reported',
    location: {
      building: 'Dr. Kalam Engineering Wing',
      floor: 'Floor 1 (Mechanical)',
      room: 'Auditorium 101',
      coordinates: [12.9725, 77.5958],
      specificSpot: 'Row D, Seat #34'
    },
    imageUrl: 'https://images.unsplash.com/photo-1580481077195-c3f25c792131?auto=format&fit=crop&w=1000&q=80',
    reportedBy: {
      id: 'usr-student-1',
      name: 'Alex Rivera',
      email: 'alex.rivera@campus.edu',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    },
    upvotes: 1,
    upvotedBy: [],
    confidenceScore: 94.2,
    createdAt: '2026-08-04T12:00:00Z',
    updatedAt: '2026-08-04T12:00:00Z',
    timeline: [
      {
        id: 'tl-30',
        status: 'Reported',
        title: 'Complaint Registered',
        description: 'Pending review and assignment by campus administrator.',
        timestamp: '2026-08-04T12:00:00Z',
        actorName: 'Alex Rivera',
        actorRole: 'student'
      }
    ],
    comments: []
  },
  {
    id: 'CG-2026-805',
    title: 'Overflowing outdoor recycling and waste bins',
    description: 'Bins near cafeteria entrance are overflowing with food waste and coffee cups.',
    aiSummary: 'The uploaded image appears to show waste management at Student Activity & Dining Concourse, Room Main Concourse. The issue has been classified as a Housekeeping Maintenance task with Medium priority.',
    category: 'Waste Management',
    department: 'Housekeeping',
    priority: 'Medium',
    status: 'Resolved',
    location: {
      building: 'Student Activity & Dining Concourse',
      floor: 'Ground Floor (Main Cafeteria)',
      room: 'Main Concourse',
      coordinates: [12.9695, 77.5952],
      specificSpot: 'Near east food court entrance'
    },
    imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=1000&q=80',
    repairImageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1000&q=80',
    repairNotes: 'Cleared waste containers, sanitized area, and placed additional 120L sorting bins for peak lunch hours.',
    reportedBy: {
      id: 'usr-student-1',
      name: 'Alex Rivera',
      email: 'alex.rivera@campus.edu',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    },
    assignedStaff: {
      id: 'usr-staff-hk',
      name: 'Lukas Meyer',
      department: 'Housekeeping',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
      assignedAt: '2026-08-02T11:00:00Z'
    },
    upvotes: 5,
    upvotedBy: ['usr-teacher-1'],
    confidenceScore: 96.0,
    createdAt: '2026-08-02T10:30:00Z',
    updatedAt: '2026-08-02T12:15:00Z',
    resolvedAt: '2026-08-02T12:15:00Z',
    timeline: [
      {
        id: 'tl-40',
        status: 'Reported',
        title: 'Reported by Student',
        description: 'Auto-routed to Housekeeping queue.',
        timestamp: '2026-08-02T10:30:00Z',
        actorName: 'Alex Rivera',
        actorRole: 'student'
      },
      {
        id: 'tl-41',
        status: 'Assigned',
        title: 'Assigned to Housekeeping Staff',
        description: 'Lukas Meyer assigned for disposal and sanitization.',
        timestamp: '2026-08-02T11:00:00Z',
        actorName: 'Dr. Eleanor Vance',
        actorRole: 'admin'
      },
      {
        id: 'tl-42',
        status: 'Resolved',
        title: 'Area Sanitized and Cleared',
        description: 'Bins emptied, sanitized with antimicrobial spray, and verified.',
        timestamp: '2026-08-02T12:15:00Z',
        actorName: 'Lukas Meyer',
        actorRole: 'staff'
      }
    ],
    comments: []
  },
  {
    id: 'CG-2026-806',
    title: 'Diagonal stress crack on 3rd floor exterior wall',
    description: '2-meter diagonal plaster fracture observed after heavy rain near window lintel.',
    aiSummary: 'The uploaded image appears to show cracked wall / civil at Science & Technology Block, Room Lab 304. The issue has been classified as a Civil Maintenance task with High priority.',
    category: 'Cracked Wall / Civil',
    department: 'Civil',
    priority: 'High',
    status: 'Reported',
    location: {
      building: 'Science & Technology Block',
      floor: 'Floor 3 (Bio-Tech)',
      room: 'Lab 304',
      coordinates: [12.9716, 77.5946],
      specificSpot: 'North-facing window frame'
    },
    imageUrl: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1000&q=80',
    reportedBy: {
      id: 'usr-teacher-1',
      name: 'Prof. David Sharma',
      email: 'd.sharma@campus.edu',
      role: 'teacher',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
    },
    upvotes: 2,
    upvotedBy: [],
    confidenceScore: 93.8,
    createdAt: '2026-08-04T13:00:00Z',
    updatedAt: '2026-08-04T13:00:00Z',
    timeline: [
      {
        id: 'tl-50',
        status: 'Reported',
        title: 'Reported by Department Faculty',
        description: 'Pending structural engineer review.',
        timestamp: '2026-08-04T13:00:00Z',
        actorName: 'Prof. David Sharma',
        actorRole: 'teacher'
      }
    ],
    comments: []
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Work In Progress: CG-2026-801',
    message: 'Marcus Cole marked "Exposed live wiring in 2nd Floor Corridor" as In Progress.',
    type: 'status_change',
    complaintId: 'CG-2026-801',
    isRead: false,
    timestamp: '2026-08-04T11:45:00Z'
  },
  {
    id: 'notif-2',
    title: 'Ticket Resolved: CG-2026-802',
    message: 'Sarah Jenkins resolved "Burst pipe & water leakage" with verification image.',
    type: 'resolved',
    complaintId: 'CG-2026-802',
    isRead: false,
    timestamp: '2026-08-03T16:30:00Z'
  },
  {
    id: 'notif-3',
    title: 'New Complaint Created: CG-2026-806',
    message: 'Prof. David Sharma reported "Diagonal stress crack on 3rd floor wall" (High Priority).',
    type: 'created',
    complaintId: 'CG-2026-806',
    isRead: true,
    timestamp: '2026-08-04T13:00:00Z'
  }
];
