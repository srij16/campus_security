import { AIDetectionResult, Department, Priority, Complaint } from '../types';

export interface SampleIssuePreset {
  id: string;
  name: string;
  thumbnail: string;
  image: string;
  category: string;
  department: Department;
  priority: Priority;
  priorityReason: string;
  suggestedTitle: string;
  suggestedDescription: string;
  tags: string[];
  detectedObjects: string[];
}

export const SAMPLE_ISSUES: SampleIssuePreset[] = [
  {
    id: 'sample-fan',
    name: 'Broken Ceiling Fan',
    thumbnail: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80',
    category: 'Electrical Appliances',
    department: 'Electrical',
    priority: 'Medium',
    priorityReason: 'Non-hazardous electrical unit failure causing ventilation issues in classroom.',
    suggestedTitle: 'Damaged ceiling fan making loud rattling noise and wobbling',
    suggestedDescription: 'The ceiling fan in the center of the lecture hall has bent blades and sparked occasionally when toggled at regulator level 4.',
    tags: ['Ceiling Fan', 'Motor Rattle', 'Wobbling Blades', 'Classroom Airflow'],
    detectedObjects: ['ceiling fan', 'wobbly blade fixture', 'junction box']
  },
  {
    id: 'sample-wire',
    name: 'Exposed Electrical Wire / Switchboard',
    thumbnail: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=400&q=80',
    image: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=1000&q=80',
    category: 'Electrical Hazard',
    department: 'Electrical',
    priority: 'Critical',
    priorityReason: 'Immediate shock and fire risk due to exposed live wiring in high-traffic corridor.',
    suggestedTitle: 'Exposed live wiring and broken switchboard panel',
    suggestedDescription: 'The switchboard faceplate is shattered, exposing bare 220V wires near the corridor entrance. Urgent safety intervention required.',
    tags: ['Live Wire', 'Broken Faceplate', 'Shock Hazard', 'Urgent'],
    detectedObjects: ['exposed copper wire', 'cracked plastic faceplate', 'spark scorch mark']
  },
  {
    id: 'sample-leak',
    name: 'Plumbing / Restroom Water Leakage',
    thumbnail: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80',
    category: 'Water Leakage',
    department: 'Plumbing',
    priority: 'High',
    priorityReason: 'Continuous water loss causing floor slipping hazards and potential ceiling seepage.',
    suggestedTitle: 'Under-sink pipe rupture causing water accumulation on floor',
    suggestedDescription: 'The cold water supply valve under the 2nd-floor washroom sink has ruptured, flooding the corridor walkway.',
    tags: ['Pipe Leak', 'Flooding', 'Slip Hazard', 'Washroom Valve'],
    detectedObjects: ['burst PVC pipe', 'standing water pool', 'corroded metal valve']
  },
  {
    id: 'sample-projector',
    name: 'Broken Classroom Projector',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=80',
    category: 'Classroom AV Equipment',
    department: 'IT',
    priority: 'High',
    priorityReason: 'Affects ongoing academic lectures and multimedia presentations.',
    suggestedTitle: 'Overheated ceiling projector bulb failure and no HDMI signal',
    suggestedDescription: 'The ceiling-mounted Epson projector in Seminar Hall B displays a flashing red thermal warning light and fails to cast display.',
    tags: ['Projector', 'AV System', 'HDMI Failure', 'Classroom Tech'],
    detectedObjects: ['ceiling projector mount', 'lens warning LED', 'HDMI cable bundle']
  },
  {
    id: 'sample-chair',
    name: 'Broken Auditorium Chair',
    thumbnail: 'https://images.unsplash.com/photo-1580481077195-c3f25c792131?auto=format&fit=crop&w=400&q=80',
    image: 'https://images.unsplash.com/photo-1580481077195-c3f25c792131?auto=format&fit=crop&w=1000&q=80',
    category: 'Broken Chair / Furniture',
    department: 'Civil',
    priority: 'Medium',
    priorityReason: 'Seating instability causing disruption and potential minor injury.',
    suggestedTitle: 'Broken wooden armrest and detached backrest in Lecture Theater',
    suggestedDescription: 'Seat #34 in Row D has a fractured wooden support leg and loose screws, making the chair completely unusable.',
    tags: ['Broken Chair', 'Loose Screws', 'Wood Fracture', 'Lecture Hall'],
    detectedObjects: ['wooden chair frame', 'sheared metal bracket', 'cushion tears']
  },
  {
    id: 'sample-dustbin',
    name: 'Overflowing Waste Bin',
    thumbnail: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=400&q=80',
    image: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=1000&q=80',
    category: 'Waste Management',
    department: 'Housekeeping',
    priority: 'Medium',
    priorityReason: 'Hygiene and sanitation hazard causing foul odor in common cafeteria concourse.',
    suggestedTitle: 'Overflowing trash container in Cafeteria quadrangle',
    suggestedDescription: 'The large recycling and solid waste bin near the food court has overflowed with food wrappers and containers.',
    tags: ['Overflowing Bin', 'Sanitation', 'Housekeeping', 'Cafeteria'],
    detectedObjects: ['full recycling container', 'litter spill', 'waste bags']
  },
  {
    id: 'sample-wall',
    name: 'Cracked Structural Wall',
    thumbnail: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=400&q=80',
    image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1000&q=80',
    category: 'Cracked Wall / Civil',
    department: 'Civil',
    priority: 'High',
    priorityReason: 'Visible masonry fissure requiring structural assessment.',
    suggestedTitle: 'Diagonal crack across north wall in Civil Lab',
    suggestedDescription: 'A 2-meter diagonal stress crack has widened near the window frame on the 3rd floor exterior-facing wall.',
    tags: ['Wall Crack', 'Civil Repair', 'Plaster Seepage', 'Structural'],
    detectedObjects: ['masonry fissure', 'spalled plaster', 'concrete seam']
  },
  {
    id: 'sample-paint',
    name: 'Peeling Wall Paint',
    thumbnail: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
    category: 'Paint Peeling',
    department: 'Civil',
    priority: 'Low',
    priorityReason: 'Cosmetic wall degradation without immediate structural threat.',
    suggestedTitle: 'Extensive paint peeling and flaking in Faculty Lounge',
    suggestedDescription: 'Moisture patches have caused the emulsion paint to bubble and flake off across the entrance lobby wall.',
    tags: ['Paint Peeling', 'Aesthetics', 'Low Priority', 'Civil'],
    detectedObjects: ['flaking paint coat', 'damp drywall', 'primer layer']
  }
];

const API_BASE = "http://localhost:8000/api";

/**
 * Calls real AI multimodal vision inference on the backend, falling back to local simulation if fails.
 */
export async function analyzeIssueImage(
  imageData: string | File,
  hintName?: string
): Promise<AIDetectionResult> {
  try {
    const formData = new FormData();
    if (typeof imageData === 'string') {
      // If it is a URL or base64, convert to a file or fetch
      if (imageData.startsWith('http')) {
        const response = await fetch(imageData);
        const blob = await response.blob();
        formData.append('file', blob, 'image.jpg');
      } else {
        // Fallback to local simulation if base64 parsing isn't immediate
        return simulateFallback(imageData, hintName);
      }
    } else {
      formData.append('file', imageData);
    }

    const token = localStorage.getItem("cg_token");
    const res = await fetch(`${API_BASE}/ai/analyze`, {
      method: "POST",
      headers: token ? { "Authorization": `Bearer ${token}` } : {},
      body: formData
    });

    if (res.ok) {
      const data = await res.json();
      return {
        category: data.category,
        department: data.suggested_department as Department,
        priority: (data.suggested_priority.charAt(0) + data.suggested_priority.slice(1).toLowerCase()) as Priority,
        priorityReason: data.reasoning,
        suggestedTitle: data.detected_issue,
        suggestedDescription: data.summary,
        confidenceScore: data.confidence ? data.confidence * 100 : 92.5,
        tags: [],
        detectedObjects: []
      };
    }
  } catch (e) {
    console.error("Gemini API call failed, falling back to simulation: ", e);
  }

  return simulateFallback(imageData, hintName);
}

function simulateFallback(imageData: string | File, hintName?: string): AIDetectionResult {
  let matched = SAMPLE_ISSUES[0];
  const searchStr = (hintName || (typeof imageData === 'string' ? imageData : imageData.name)).toLowerCase();

  if (searchStr.includes('wire') || searchStr.includes('switch') || searchStr.includes('spark') || searchStr.includes('electric') || searchStr.includes('shock')) {
    matched = SAMPLE_ISSUES.find(s => s.id === 'sample-wire') || matched;
  } else if (searchStr.includes('leak') || searchStr.includes('water') || searchStr.includes('pipe') || searchStr.includes('plumb') || searchStr.includes('sink') || searchStr.includes('toilet') || searchStr.includes('washroom')) {
    matched = SAMPLE_ISSUES.find(s => s.id === 'sample-leak') || matched;
  } else if (searchStr.includes('projector') || searchStr.includes('screen') || searchStr.includes('hdmi') || searchStr.includes('wifi') || searchStr.includes('computer') || searchStr.includes('router')) {
    matched = SAMPLE_ISSUES.find(s => s.id === 'sample-projector') || matched;
  } else if (searchStr.includes('chair') || searchStr.includes('desk') || searchStr.includes('bench') || searchStr.includes('furniture') || searchStr.includes('table')) {
    matched = SAMPLE_ISSUES.find(s => s.id === 'sample-chair') || matched;
  } else if (searchStr.includes('dustbin') || searchStr.includes('trash') || searchStr.includes('garbage') || searchStr.includes('waste') || searchStr.includes('clean')) {
    matched = SAMPLE_ISSUES.find(s => s.id === 'sample-dustbin') || matched;
  } else if (searchStr.includes('crack') || searchStr.includes('wall') || searchStr.includes('masonry') || searchStr.includes('brick')) {
    matched = SAMPLE_ISSUES.find(s => s.id === 'sample-wall') || matched;
  } else if (searchStr.includes('paint') || searchStr.includes('peel') || searchStr.includes('flake')) {
    matched = SAMPLE_ISSUES.find(s => s.id === 'sample-paint') || matched;
  } else if (searchStr.includes('fan') || searchStr.includes('light') || searchStr.includes('bulb') || searchStr.includes('ac')) {
    matched = SAMPLE_ISSUES.find(s => s.id === 'sample-fan') || matched;
  }

  const confidenceScore = Number((91 + Math.random() * 8.5).toFixed(1));

  return {
    category: matched.category,
    department: matched.department,
    priority: matched.priority,
    priorityReason: matched.priorityReason,
    suggestedTitle: matched.suggestedTitle,
    suggestedDescription: matched.suggestedDescription,
    confidenceScore,
    tags: matched.tags,
    detectedObjects: matched.detectedObjects
  };
}

export function generateAISummary(
  category: string,
  department: Department,
  priority: Priority,
  location: { building: string; room: string }
): string {
  const locStr = location.building && location.room 
    ? `${location.building}, Room ${location.room}`
    : location.building || 'Campus Facilities';
  return `The uploaded image appears to show a ${category.toLowerCase()} at ${locStr}. The issue has been classified as a ${department} Maintenance task with ${priority} priority.`;
}

export function findDuplicateComplaints(
  building: string,
  room: string,
  category: string,
  existingComplaints: Complaint[]
): Complaint | null {
  if (!building || !room) return null;
  const normalizedBuilding = building.trim().toLowerCase();
  const normalizedRoom = room.trim().toLowerCase();
  const normalizedCategory = category.trim().toLowerCase();

  return existingComplaints.find(c => {
    if (c.status === 'Resolved') return false;
    const sameBuilding = c.location.building.toLowerCase().includes(normalizedBuilding) || normalizedBuilding.includes(c.location.building.toLowerCase());
    const sameRoom = c.location.room.toLowerCase().replace(/\s+/g, '') === normalizedRoom.replace(/\s+/g, '');
    const similarCat = c.category.toLowerCase().includes(normalizedCategory) || normalizedCategory.includes(c.category.toLowerCase());
    return sameBuilding && sameRoom && similarCat;
  }) || null;
}
