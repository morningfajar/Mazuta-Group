
import { Task, User } from './types';

export const USERS: User[] = [
  { id: 'admin1', name: 'Jane Doe', role: 'Admin', avatar: 'JD' },
  { id: 'u1', name: 'Vito', role: 'Member', avatar: 'VT' },
  { id: 'u2', name: 'Rashid', role: 'Member', avatar: 'RS' },
  { id: 'u3', name: 'Rafael', role: 'Member', avatar: 'RF' },
  { id: 'u4', name: 'Sarah', role: 'Member', avatar: 'SR' },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Holiday Instagram Reels',
    pic: 'Vito',
    brand: 'Coca-Cola',
    campaign: 'Holiday Special',
    status: 'Completed',
    startDate: '2025-11-01',
    endDate: '2025-11-15',
    description: 'Create 3 reels for the holiday season focused on sharing happiness.',
    subtasks: ['Scripting', 'Asset Collection', 'Editing', 'Music Selection'],
    references: [
        { id: 'r1', type: 'link', name: 'Competitor Example (YouTube)', url: 'https://youtube.com' },
        { id: 'r2', type: 'image', name: 'Moodboard', url: 'https://images.unsplash.com/photo-1606907568273-53c42aa336d2?auto=format&fit=crop&q=80&w=200' }
    ],
    actualStartTime: '2025-11-14T09:00:00.000Z',
    actualEndTime: '2025-11-14T15:30:00.000Z',
    durationMinutes: 390
  },
  {
    id: '2',
    title: 'Product Launch Key Visual',
    pic: 'Rashid',
    brand: 'Samsung',
    campaign: 'Brand Awareness',
    status: 'In Progress',
    startDate: '2025-11-10',
    endDate: '2025-11-20',
    description: 'Main KV for the new Galaxy series. Needs to look futuristic.',
    references: [
        { id: 'r3', type: 'link', name: 'Product Specs & Assets', url: '#' }
    ],
    actualStartTime: '2025-11-18T10:00:00.000Z',
  },
  {
    id: '3',
    title: 'Website Hero Banner',
    pic: 'Vito',
    brand: 'Spotify',
    campaign: 'Social Media Revamp',
    status: 'Completed',
    startDate: '2025-11-05',
    endDate: '2025-11-06',
    description: 'Update homepage banner for wrapped campaign.',
    actualStartTime: '2025-11-06T09:00:00.000Z',
    actualEndTime: '2025-11-06T11:00:00.000Z',
    durationMinutes: 120
  },
  {
    id: '4',
    title: 'Internal Newsletter Design',
    pic: 'Rafael',
    brand: 'Internal',
    campaign: 'General',
    status: 'Not Started',
    startDate: '2025-11-18',
    endDate: '2025-11-25',
    description: 'Monthly internal update layout.'
  },
  {
    id: '5',
    title: 'Q1 Strategy Deck',
    pic: 'Sarah',
    brand: 'Nike',
    campaign: 'Q4 Promo',
    status: 'Overdue',
    startDate: '2025-11-01',
    endDate: '2025-11-10',
    description: 'Slide deck for Q1 marketing strategy.'
  },
];
