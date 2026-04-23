// FILE: src/types/index.ts

export interface Room {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl?: string;
  createdAt?: any; // Firestore Timestamp
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
