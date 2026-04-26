// FILE: src/types/index.ts

export interface Room {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl?: string;
  createdAt?: any;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  category: 'Hospitality' | 'Culinary' | 'Private' | 'Other';
  description: string;
  imageUrl?: string;
  createdAt?: any;
}

export interface Service {
  id: string;
  title: string;
  category: 'Catering' | 'Nutrition' | 'Mobile Food' | 'Shopping' | 'Market' | 'Tutorial' | 'Other';
  description: string;
  imageUrl?: string;
  createdAt?: any;
}

export interface AcademyModule {
  id: string;
  moduleNumber: number;
  title: string;
  outcome: string;
  lessons: string[];
  imageUrl?: string;
  createdAt?: any;
}

export interface SiteSettings {
  brandName: string;
  tagline: string;
  location: string;
  description: string;
  vision: string;
  mission: string;
  tiktokHandle: string;
  instagramHandle: string;
  heroImageUrl?: string;
  aboutImageUrl?: string;
}

export interface Booking {
  id: string;
  guestName: string;
  email: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: any;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: any;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: 'Branding' | 'Techniques' | 'Business' | 'Innovation' | 'Mindset' | 'Ethics';
  readTime: string;
  featured?: boolean;
  content?: string;
  imageUrl?: string;
  createdAt?: any;
}

export interface Book {
  id: string;
  title: string;
  subtitle: string;
  audience: string;
  purpose: string;
  chapters: { number: number; title: string }[];
  accentColor?: string;
  bgGradient?: string;
  badgeColor?: string;
  volume?: number;
  imageUrl?: string;
  createdAt?: any;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  hook: string;
  body: string;
  cta: string;
  audience: string;
  goal: string;
  category: 'Brand' | 'Tutorial' | 'Education' | 'Business' | 'Inspiration';
  duration: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  episodeNumber?: number;
  createdAt?: any;
}

export interface OnlineClass {
  id: string;
  title: string;
  description: string;
  schedule: string;
  maxStudents: number;
  status: 'scheduled' | 'live' | 'ended';
  roomName?: string;
  roomUrl?: string;
  createdAt?: any;
}