
export type Status = 'Not Started' | 'In Progress' | 'Waiting Review' | 'Revision Needed' | 'Completed' | 'Overdue';

export type Role = 'Admin' | 'Member';

export interface User {
  id: string;
  name: string;
  role: Role;
  avatar?: string;
}

export interface Reference {
  id: string;
  type: 'link' | 'image';
  url: string;
  name: string;
}

export interface Task {
  id: string;
  title: string;
  pic: string; // Person In Charge
  brand: string;
  campaign: string; // Added Campaign field
  status: Status;
  startDate: string; // Scheduled Start Date
  endDate: string;   // Scheduled Deadline
  description?: string;
  subtasks?: string[];
  references?: Reference[]; // New: Design/Video references
  
  // Time Tracking Fields
  actualStartTime?: string; // ISO string
  actualEndTime?: string;   // ISO string
  durationMinutes?: number; // Calculated duration

  // Proof of Work & Review
  proofOfWork?: string; // URL or Base64 string
  proofType?: 'link' | 'image';
  revisionFeedback?: string;
}

export interface FilterState {
  brand: string;
  pic: string;
  campaign: string;
  startDate?: string;
  endDate?: string;
}

export const BRANDS = ['Nike', 'Coca-Cola', 'Samsung', 'Spotify', 'Internal'];
export const PICS = ['Vito', 'Rashid', 'Rafael', 'Sarah', 'Mike'];
export const CAMPAIGNS = ['Q4 Promo', 'Holiday Special', 'Brand Awareness', 'Social Media Revamp', 'General'];
